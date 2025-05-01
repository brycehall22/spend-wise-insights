
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

export interface DashboardSummary {
  income: number;
  expenses: number;
  net: number;
  savingsRate: number;
}

export interface CategorySpending {
  category: string;
  amount: number;
  color?: string;
}

export interface MonthlySnapshot {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingRate: number;
  avgDailySpending: number;
  month: string;
}

// Function to get financial summary for dashboard
export const getFinancialSummary = async (startDate: string, endDate: string): Promise<DashboardSummary> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch financial summary');
  }
  
  // Get all transactions for the period
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, categories(name, is_income)')
    .eq('user_id', userId)
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);
  
  if (error) {
    throw error;
  }
  
  // Calculate income and expenses
  let totalIncome = 0;
  let totalExpenses = 0;
  
  transactions?.forEach((transaction) => {
    // Check if it's an income transaction
    const isIncome = transaction.categories?.is_income || 
                      (transaction.categories === null && transaction.amount > 0);
                      
    if (isIncome) {
      totalIncome += Math.abs(transaction.amount);
    } else {
      totalExpenses += Math.abs(transaction.amount);
    }
  });
  
  // Calculate net and savings rate
  const net = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (net / totalIncome) * 100 : 0;
  
  return {
    income: totalIncome,
    expenses: totalExpenses,
    net,
    savingsRate
  };
};

// Function to get spending by category
export const getSpendingByCategory = async (startDate: string, endDate: string): Promise<CategorySpending[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch category spending');
  }
  
  // Get transactions joined with categories
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      categories (category_id, name, color)
    `)
    .eq('user_id', userId)
    .lt('amount', 0) // Only get expenses
    .gte('transaction_date', startDate)
    .lte('transaction_date', endDate);
  
  if (error) {
    throw error;
  }
  
  // Group by category
  const categoryMap = new Map<string, { amount: number; color?: string }>();
  let uncategorizedAmount = 0;
  
  transactions?.forEach((transaction) => {
    if (transaction.categories) {
      const categoryId = transaction.categories.category_id;
      const amount = Math.abs(transaction.amount);
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, { 
          amount, 
          color: transaction.categories.color 
        });
      } else {
        const current = categoryMap.get(categoryId)!;
        categoryMap.set(categoryId, { 
          amount: current.amount + amount,
          color: transaction.categories.color 
        });
      }
    } else {
      // Add to uncategorized
      uncategorizedAmount += Math.abs(transaction.amount);
    }
  });
  
  // Convert to array format
  const result: CategorySpending[] = [];
  
  categoryMap.forEach((value, key) => {
    const category = transactions?.find(t => t.categories?.category_id === key)?.categories?.name || 'Unknown';
    result.push({
      category,
      amount: value.amount,
      color: value.color || undefined
    });
  });
  
  // Add uncategorized if any
  if (uncategorizedAmount > 0) {
    result.push({
      category: 'Uncategorized',
      amount: uncategorizedAmount,
      color: '#9e9e9e'
    });
  }
  
  // Sort by amount (descending)
  return result.sort((a, b) => b.amount - a.amount);
};

// Function to get monthly income vs expenses for the past 6 months
export const getMonthlyComparisonData = async (): Promise<any[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch monthly comparison data');
  }
  
  // Get end date (today) and start date (6 months ago)
  const endDate = new Date();
  const startDate = subMonths(endDate, 5); // Get 6 months including current
  
  // Format dates for query
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');
  
  // Get all transactions for the period
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, transaction_date, categories(is_income)')
    .eq('user_id', userId)
    .gte('transaction_date', startDateStr)
    .lte('transaction_date', endDateStr);
  
  if (error) {
    throw error;
  }
  
  // Prepare month map for results (initialize with zeros)
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  
  // Initialize the past 6 months with zero values
  for (let i = 0; i < 6; i++) {
    const monthDate = subMonths(endDate, i);
    const monthKey = format(monthDate, 'yyyy-MM');
    monthlyData[monthKey] = { income: 0, expenses: 0 };
  }
  
  // Process transactions
  transactions?.forEach((transaction) => {
    const transactionMonth = transaction.transaction_date.substring(0, 7); // YYYY-MM
    
    // Skip if not in our 6-month window
    if (!monthlyData[transactionMonth]) return;
    
    // Check if it's an income transaction
    const isIncome = transaction.categories?.is_income || 
                     (transaction.categories === null && transaction.amount > 0);
    
    // Add to appropriate category
    if (isIncome) {
      monthlyData[transactionMonth].income += Math.abs(transaction.amount);
    } else {
      monthlyData[transactionMonth].expenses += Math.abs(transaction.amount);
    }
  });
  
  // Convert to array format for charts
  const result = Object.keys(monthlyData)
    .sort() // Ensure chronological order
    .map(month => ({
      month: format(new Date(month + '-01'), 'MMM'),
      income: monthlyData[month].income,
      expenses: monthlyData[month].expenses,
      savings: monthlyData[month].income - monthlyData[month].expenses
    }));
  
  return result;
};

// Get insights based on transaction data
export const getFinancialInsights = async (): Promise<any[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch financial insights');
  }
  
  // Get current month and previous month
  const currentDate = new Date();
  const currentMonthStart = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), 'yyyy-MM-dd');
  const previousMonthStart = format(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1), 'yyyy-MM-dd');
  const previousMonthEnd = format(new Date(currentDate.getFullYear(), currentDate.getMonth(), 0), 'yyyy-MM-dd');
  
  // Get current month transactions
  const { data: currentTransactions, error: currentError } = await supabase
    .from('transactions')
    .select('amount, categories(is_income)')
    .eq('user_id', userId)
    .gte('transaction_date', currentMonthStart);
  
  if (currentError) {
    throw currentError;
  }
  
  // Get previous month transactions
  const { data: previousTransactions, error: previousError } = await supabase
    .from('transactions')
    .select('amount, categories(is_income)')
    .eq('user_id', userId)
    .gte('transaction_date', previousMonthStart)
    .lte('transaction_date', previousMonthEnd);
  
  if (previousError) {
    throw previousError;
  }
  
  // Calculate financial metrics
  let currentIncome = 0;
  let currentExpenses = 0;
  let previousIncome = 0;
  let previousExpenses = 0;
  
  currentTransactions?.forEach(transaction => {
    const isIncome = transaction.categories?.is_income || 
                     (transaction.categories === null && transaction.amount > 0);
    if (isIncome) {
      currentIncome += Math.abs(transaction.amount);
    } else {
      currentExpenses += Math.abs(transaction.amount);
    }
  });
  
  previousTransactions?.forEach(transaction => {
    const isIncome = transaction.categories?.is_income || 
                     (transaction.categories === null && transaction.amount > 0);
    if (isIncome) {
      previousIncome += Math.abs(transaction.amount);
    } else {
      previousExpenses += Math.abs(transaction.amount);
    }
  });
  
  // Generate insights
  const insights = [];
  
  // Compare expenses to previous month
  if (previousExpenses > 0) {
    const expenseChange = ((currentExpenses - previousExpenses) / previousExpenses) * 100;
    
    if (expenseChange > 10) {
      insights.push({
        id: 'expense-increase',
        type: 'warning',
        title: 'Spending Increase',
        description: `Your expenses have increased by ${Math.round(expenseChange)}% compared to last month.`
      });
    } else if (expenseChange < -10) {
      insights.push({
        id: 'expense-decrease',
        type: 'positive',
        title: 'Spending Decrease',
        description: `Your expenses have decreased by ${Math.round(Math.abs(expenseChange))}% compared to last month.`
      });
    }
  }
  
  // Analyze savings rate
  const currentSavingsRate = currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome) * 100 : 0;
  
  if (currentSavingsRate < 0) {
    insights.push({
      id: 'negative-savings',
      type: 'negative',
      title: 'Negative Savings',
      description: `You're spending more than you earn this month. Consider reducing unnecessary expenses.`
    });
  } else if (currentSavingsRate > 20) {
    insights.push({
      id: 'high-savings',
      type: 'positive',
      title: 'Excellent Saving',
      description: `Your savings rate is ${Math.round(currentSavingsRate)}%, which is excellent. Keep it up!`
    });
  }
  
  // If we have less than 3 insights, add a generic one
  if (insights.length < 2) {
    // Check if there's any data to show insights for
    if (currentTransactions && currentTransactions.length > 0) {
      insights.push({
        id: 'track-progress',
        type: 'neutral',
        title: 'Track Your Progress',
        description: 'Continue recording your transactions to get more personalized financial insights.'
      });
    } else {
      insights.push({
        id: 'add-transactions',
        type: 'neutral',
        title: 'Add Transactions',
        description: 'Start adding your income and expenses to get personalized financial insights.'
      });
    }
  }
  
  return insights;
};

// Function to get monthly snapshot with proper error handling and default values
export const getMonthlySnapshot = async () => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to fetch financial snapshot');
    }
    
    // Calculate current month bounds
    const currentDate = new Date();
    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    
    // Format dates for query
    const startDateStr = format(firstDay, 'yyyy-MM-dd');
    const endDateStr = format(lastDay, 'yyyy-MM-dd');
    
    // Get all transactions for the month
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, transaction_date, categories(is_income)')
      .eq('user_id', userId)
      .gte('transaction_date', startDateStr)
      .lte('transaction_date', endDateStr);
    
    if (error) {
      throw error;
    }
    
    // If no transactions, return default object with zeros
    if (!transactions || transactions.length === 0) {
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netSavings: 0,
        savingRate: 0,
        avgDailySpending: 0,
        month: format(currentDate, 'MMMM yyyy')
      };
    }
    
    // Calculate totals
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(transaction => {
      const isIncome = transaction.categories?.is_income || 
                      (transaction.categories === null && transaction.amount > 0);
      
      if (isIncome) {
        totalIncome += Math.abs(transaction.amount);
      } else {
        totalExpenses += Math.abs(transaction.amount);
      }
    });
    
    // Calculate additional metrics
    const netSavings = totalIncome - totalExpenses;
    const savingRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;
    
    // Calculate daily average spending
    const daysInMonth = lastDay.getDate();
    const daysElapsed = Math.min(currentDate.getDate(), daysInMonth);
    const avgDailySpending = daysElapsed > 0 ? totalExpenses / daysElapsed : 0;
    
    return {
      totalIncome,
      totalExpenses,
      netSavings,
      savingRate,
      avgDailySpending,
      month: format(currentDate, 'MMMM yyyy')
    };
  } catch (error) {
    console.error("Error in getMonthlySnapshot:", error);
    // Return default values if error
    return {
      totalIncome: 0,
      totalExpenses: 0,
      netSavings: 0,
      savingRate: 0,
      avgDailySpending: 0,
      month: format(new Date(), 'MMMM yyyy')
    };
  }
};
