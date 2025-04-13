
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Budget } from "@/types/database.types";

// Function to get budgets for a specific month
export const getBudgets = async (date: Date): Promise<Budget[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch budgets');
  }
  
  // Format the month as YYYY-MM-DD (first day of month)
  const monthFormatted = format(date, 'yyyy-MM-dd');
  
  // Get all budgets for the month
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select(`
      *,
      categories (name)
    `)
    .eq('user_id', userId)
    .eq('month', monthFormatted);
  
  if (budgetError) {
    throw budgetError;
  }
  
  // Calculate how much spent for each budget
  // First, get the start and end date for the month
  const startDate = format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
  const endDate = format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd');
  
  // Get transactions for the month
  const { data: transactions, error: transactionError } = await supabase
    .from('transactions')
    .select('amount, category_id')
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate)
    .lt('amount', 0); // Only expenses
  
  if (transactionError) {
    throw transactionError;
  }
  
  // Calculate spending by category
  const spendingByCategory = new Map<string, number>();
  transactions?.forEach(transaction => {
    const categoryId = transaction.category_id || 'uncategorized';
    const amount = Math.abs(transaction.amount);
    
    if (spendingByCategory.has(categoryId)) {
      spendingByCategory.set(categoryId, spendingByCategory.get(categoryId)! + amount);
    } else {
      spendingByCategory.set(categoryId, amount);
    }
  });
  
  // Add spending data to budgets
  const budgetsWithSpending: Budget[] = (budgets || []).map(budget => {
    const categoryId = budget.category_id || 'uncategorized';
    const spent = spendingByCategory.get(categoryId) || 0;
    
    return {
      ...budget,
      category_name: budget.categories?.name || 'Uncategorized',
      spent
    };
  });
  
  return budgetsWithSpending;
};

// Function to get budget summary for a month
export const getBudgetSummary = async (monthStr: string): Promise<{
  totalBudget: number;
  totalSpent: number;
  remainingBudget: number;
}> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch budget summary');
  }
  
  // Parse the month string to Date
  const [year, month] = monthStr.split('-').map(Number);
  const date = new Date(year, month - 1, 1);
  
  // Get budgets for the month
  const budgets = await getBudgets(date);
  
  // Calculate totals
  let totalBudget = 0;
  let totalSpent = 0;
  
  budgets.forEach(budget => {
    totalBudget += budget.amount;
    totalSpent += budget.spent || 0;
  });
  
  // Calculate remaining budget
  const remainingBudget = totalBudget - totalSpent;
  
  return {
    totalBudget,
    totalSpent,
    remainingBudget
  };
};

// Function to create a new budget
export const createBudget = async (budgetData: Partial<Budget>): Promise<Budget> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to create a budget');
  }
  
  const { data, error } = await supabase
    .from('budgets')
    .insert({
      ...budgetData,
      user_id: userId
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Function to update a budget
export const updateBudget = async (budgetId: string, budgetData: Partial<Budget>): Promise<Budget> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to update a budget');
  }
  
  const { data, error } = await supabase
    .from('budgets')
    .update(budgetData)
    .eq('user_id', userId)
    .eq('budget_id', budgetId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Function to delete a budget
export const deleteBudget = async (budgetId: string): Promise<void> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to delete a budget');
  }
  
  const { error } = await supabase
    .from('budgets')
    .delete()
    .eq('user_id', userId)
    .eq('budget_id', budgetId);
  
  if (error) {
    throw error;
  }
};
