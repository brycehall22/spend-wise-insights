import { supabase } from "@/integrations/supabase/client";
import { DbBudget, Budget } from "@/types/database.types";
import { format } from "date-fns";

interface BudgetSummary {
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
  budgetsByCategory: Budget[];
}

export const getBudgetSummary = async (month: string): Promise<BudgetSummary> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch budgets');
  }
  
  // Get all budgets for the given month
  const { data: budgets, error: budgetsError } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (name)
    `)
    .eq('user_id', userId)
    .eq('month', month);
    
  if (budgetsError) throw budgetsError;
  
  // Get all transactions for the month to calculate spending
  const startDate = new Date(month);
  const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
  
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('amount, category_id')
    .eq('user_id', userId)
    .gte('transaction_date', format(startDate, 'yyyy-MM-dd'))
    .lte('transaction_date', format(endDate, 'yyyy-MM-dd'))
    .lt('amount', 0); // Only negative amounts (expenses)
    
  if (transactionsError) throw transactionsError;
  
  // Map budgets with spending info
  const budgetsWithSpending: Budget[] = (budgets || []).map(budget => {
    // Find transactions for this category
    const categoryTransactions = transactions?.filter(t => 
      t.category_id === budget.category_id
    ) || [];
    
    // Calculate spending (convert to positive number for easier comparison)
    const spent = categoryTransactions.reduce(
      (total, t) => total + Math.abs(t.amount), 
      0
    );
    
    return {
      ...budget,
      category_name: budget.categories?.name,
      spent
    };
  });
  
  // Calculate totals
  const totalBudget = budgetsWithSpending.reduce((sum, budget) => sum + Number(budget.amount), 0);
  const totalSpent = budgetsWithSpending.reduce((sum, budget) => sum + Number(budget.spent || 0), 0);
  const remainingBudget = totalBudget - totalSpent;
  
  return {
    totalBudget,
    totalSpent,
    remainingBudget,
    budgetsByCategory: budgetsWithSpending
  };
};

export type Budget = {
  budget_id: string;
  user_id: string;
  category_id: string | null;
  month: string; // ISO format date string for first day of month
  amount: number;
  created_at?: string;
  updated_at?: string;
  category_name?: string;
  spent?: number;
};

export const getBudgets = async (month: Date): Promise<Budget[]> => {
  // Format as YYYY-MM-01 for first day of month
  const monthStr = format(month, 'yyyy-MM-01');
  
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch budgets');
  }
  
  const { data: budgets, error } = await supabase
    .from('budgets')
    .select('*, categories(name)')
    .eq('month', monthStr)
    .eq('user_id', userId);
  
  if (error) throw error;
  
  // Get transactions for the month to calculate spent amounts
  const startDate = format(month, 'yyyy-MM-01');
  const endDate = format(new Date(month.getFullYear(), month.getMonth() + 1, 0), 'yyyy-MM-dd');
  
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select('category_id, amount')
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .lt('amount', 0) // Only expenses
    .eq('user_id', userId);
  
  if (transactionsError) throw transactionsError;
  
  // Calculate spent amount for each category
  const spentByCategory: Record<string, number> = {};
  transactions.forEach(transaction => {
    const categoryId = transaction.category_id || 'uncategorized';
    spentByCategory[categoryId] = (spentByCategory[categoryId] || 0) + Math.abs(Number(transaction.amount));
  });
  
  return budgets.map(budget => ({
    budget_id: budget.budget_id,
    user_id: budget.user_id,
    category_id: budget.category_id,
    month: budget.month,
    amount: Number(budget.amount),
    created_at: budget.created_at,
    updated_at: budget.updated_at,
    category_name: budget.categories?.name || 'Uncategorized',
    spent: spentByCategory[budget.category_id || 'uncategorized'] || 0
  }));
};

export const createBudget = async (budget: Omit<Budget, 'budget_id' | 'created_at' | 'updated_at'>): Promise<Budget> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to create a budget');
  }
  
  // Ensure user_id is set
  const budgetWithUserId = {
    ...budget,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('budgets')
    .insert(budgetWithUserId)
    .select('*, categories(name)')
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    amount: Number(data.amount),
    category_name: data.categories?.name || 'Uncategorized',
    spent: 0
  };
};

export const updateBudget = async (budget: Partial<Budget> & { budget_id: string }): Promise<Budget> => {
  const { data, error } = await supabase
    .from('budgets')
    .update(budget)
    .eq('budget_id', budget.budget_id)
    .select('*, categories(name)')
    .single();
  
  if (error) throw error;
  
  return {
    ...data,
    amount: Number(data.amount),
    category_name: data.categories?.name || 'Uncategorized'
  };
};

export const deleteBudget = async (budgetId: string): Promise<void> => {
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('budget_id', budgetId);
  
  if (error) throw error;
};

// Create a budget from a template (previous month or average)
export const createBudgetFromTemplate = async (month: Date, templateType: 'previous' | 'average'): Promise<void> => {
  // Get the target month
  const targetMonth = format(month, 'yyyy-MM-01');
  
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to create a budget');
  }
  
  if (templateType === 'previous') {
    // Get the previous month's date
    const previousMonth = new Date(month.getFullYear(), month.getMonth() - 1, 1);
    const previousMonthStr = format(previousMonth, 'yyyy-MM-01');
    
    // Get previous month's budgets
    const { data: previousBudgets, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', previousMonthStr)
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Copy previous month's budgets to current month
    if (previousBudgets.length > 0) {
      const newBudgets = previousBudgets.map(budget => ({
        user_id: userId,
        category_id: budget.category_id,
        month: targetMonth,
        amount: budget.amount
      }));
      
      const { error: insertError } = await supabase
        .from('budgets')
        .insert(newBudgets);
        
      if (insertError) throw insertError;
    }
  } else if (templateType === 'average') {
    // Get the last 3 months
    const threeMonthsAgo = new Date(month.getFullYear(), month.getMonth() - 3, 1);
    const threeMonthsAgoStr = format(threeMonthsAgo, 'yyyy-MM-01');
    
    // Get transactions from the last 3 months
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('category_id, amount')
      .gte('transaction_date', threeMonthsAgoStr)
      .lt('transaction_date', targetMonth)
      .lt('amount', 0) // Only expenses
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Calculate average spending by category
    const spendingByCategory: Record<string, {total: number, count: number}> = {};
    transactions.forEach(transaction => {
      const categoryId = transaction.category_id || 'uncategorized';
      if (!spendingByCategory[categoryId]) {
        spendingByCategory[categoryId] = { total: 0, count: 0 };
      }
      spendingByCategory[categoryId].total += Math.abs(Number(transaction.amount));
      spendingByCategory[categoryId].count += 1;
    });
    
    // Create budgets based on average spending
    const newBudgets = Object.entries(spendingByCategory).map(([categoryId, { total }]) => {
      if (categoryId === 'uncategorized') return null;
      
      // Calculate monthly average (last 3 months / 3)
      const monthlyAverage = total / 3;
      
      return {
        user_id: userId,
        category_id: categoryId,
        month: targetMonth,
        amount: Math.round(monthlyAverage * 100) / 100 // Round to 2 decimal places
      };
    }).filter(Boolean);
    
    if (newBudgets.length > 0) {
      const { error: insertError } = await supabase
        .from('budgets')
        .insert(newBudgets);
        
      if (insertError) throw insertError;
    }
  }
};
