
import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, subYears, startOfMonth, endOfMonth, startOfYear } from "date-fns";

// Function to get income vs expenses data for a specific date range
export const getIncomeExpensesData = async (
  startDate: Date,
  endDate: Date,
  groupBy: 'day' | 'week' | 'month' = 'month'
) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch analytics data');
  }
  
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
  
  // Group by date according to the groupBy parameter
  const groupedData: Record<string, { income: number; expenses: number; net: number }> = {};
  
  transactions?.forEach(transaction => {
    let groupKey: string;
    const transactionDate = new Date(transaction.transaction_date);
    
    // Determine group key based on groupBy parameter
    if (groupBy === 'day') {
      groupKey = format(transactionDate, 'yyyy-MM-dd');
    } else if (groupBy === 'week') {
      // Get start of the week (Sunday)
      const day = transactionDate.getDay();
      const diff = transactionDate.getDate() - day;
      const startOfWeek = new Date(transactionDate);
      startOfWeek.setDate(diff);
      groupKey = format(startOfWeek, 'yyyy-MM-dd');
    } else {
      // Month (default)
      groupKey = format(transactionDate, 'yyyy-MM');
    }
    
    // Initialize group if it doesn't exist
    if (!groupedData[groupKey]) {
      groupedData[groupKey] = { income: 0, expenses: 0, net: 0 };
    }
    
    // Check if it's income or expense based on categories or amount
    const isIncome = transaction.categories?.is_income || 
                     (transaction.categories === null && transaction.amount > 0);
    
    // Update the appropriate category
    if (isIncome) {
      groupedData[groupKey].income += Math.abs(transaction.amount);
    } else {
      groupedData[groupKey].expenses += Math.abs(transaction.amount);
    }
    
    // Update net amount
    groupedData[groupKey].net = groupedData[groupKey].income - groupedData[groupKey].expenses;
  });
  
  // Convert to array format
  return Object.keys(groupedData)
    .sort() // Ensure chronological order
    .map(key => {
      // Format the label based on groupBy
      let label: string;
      if (groupBy === 'day') {
        label = format(new Date(key), 'MMM d');
      } else if (groupBy === 'week') {
        const weekStart = new Date(key);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        label = `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')}`;
      } else {
        label = format(new Date(key + '-01'), 'MMM yyyy');
      }
      
      return {
        date: key,
        label,
        income: groupedData[key].income,
        expenses: groupedData[key].expenses,
        net: groupedData[key].net
      };
    });
};

// Function to get spending by category for a specific date range
export const getCategorySpendingByPeriod = async (startDate: Date, endDate: Date) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch category spending data');
  }
  
  // Format dates for query
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');
  
  // Get all transactions with categories
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      transaction_date,
      categories (category_id, name, color)
    `)
    .eq('user_id', userId)
    .lt('amount', 0) // Only get expenses
    .gte('transaction_date', startDateStr)
    .lte('transaction_date', endDateStr);
  
  if (error) {
    throw error;
  }
  
  // Group by category
  const categoryMap = new Map<string, { 
    id: string; 
    name: string; 
    amount: number; 
    color?: string; 
    percentage?: number;
  }>();
  
  let totalSpending = 0;
  
  transactions?.forEach(transaction => {
    const amount = Math.abs(transaction.amount);
    totalSpending += amount;
    
    if (transaction.categories) {
      const categoryId = transaction.categories.category_id;
      const categoryName = transaction.categories.name;
      const categoryColor = transaction.categories.color;
      
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: categoryName,
          amount,
          color: categoryColor || undefined
        });
      } else {
        const current = categoryMap.get(categoryId)!;
        categoryMap.set(categoryId, {
          ...current,
          amount: current.amount + amount
        });
      }
    } else {
      // Uncategorized
      if (!categoryMap.has('uncategorized')) {
        categoryMap.set('uncategorized', {
          id: 'uncategorized',
          name: 'Uncategorized',
          amount,
          color: '#9e9e9e'
        });
      } else {
        const current = categoryMap.get('uncategorized')!;
        categoryMap.set('uncategorized', {
          ...current,
          amount: current.amount + amount
        });
      }
    }
  });
  
  // Calculate percentages and create array
  const result = Array.from(categoryMap.values()).map(category => ({
    ...category,
    percentage: (category.amount / totalSpending) * 100
  }));
  
  // Sort by amount (descending)
  return result.sort((a, b) => b.amount - a.amount);
};

// Function to get merchant spending data
export const getTopMerchants = async (startDate: Date, endDate: Date, limit: number = 5) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch merchant data');
  }
  
  // Format dates for query
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');
  
  // Get all transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, merchant')
    .eq('user_id', userId)
    .lt('amount', 0) // Only get expenses
    .gte('transaction_date', startDateStr)
    .lte('transaction_date', endDateStr);
  
  if (error) {
    throw error;
  }
  
  // Group by merchant
  const merchantMap = new Map<string, number>();
  
  transactions?.forEach(transaction => {
    const merchant = transaction.merchant;
    const amount = Math.abs(transaction.amount);
    
    if (!merchantMap.has(merchant)) {
      merchantMap.set(merchant, amount);
    } else {
      merchantMap.set(merchant, merchantMap.get(merchant)! + amount);
    }
  });
  
  // Convert to array format
  const result = Array.from(merchantMap.entries()).map(([merchant, amount]) => ({
    merchant,
    amount
  }));
  
  // Sort by amount (descending) and limit
  return result
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};

// Function to get monthly saving rate data
export const getMonthlySavingRates = async (months: number = 6) => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch saving rates');
  }
  
  // Calculate date range
  const endDate = new Date();
  const startDate = subMonths(endDate, months - 1);
  
  // Format dates for query
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');
  
  // Get all transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, transaction_date, categories(is_income)')
    .eq('user_id', userId)
    .gte('transaction_date', startDateStr)
    .lte('transaction_date', endDateStr);
  
  if (error) {
    throw error;
  }
  
  // Group by month
  const monthlyData: Record<string, { income: number; expenses: number }> = {};
  
  // Initialize with all months in the range
  for (let i = 0; i < months; i++) {
    const monthDate = subMonths(endDate, i);
    const monthKey = format(monthDate, 'yyyy-MM');
    monthlyData[monthKey] = { income: 0, expenses: 0 };
  }
  
  // Fill with transaction data
  transactions?.forEach(transaction => {
    const monthKey = transaction.transaction_date.substring(0, 7); // YYYY-MM
    
    // Skip if not in our range
    if (!monthlyData[monthKey]) return;
    
    // Check if income or expense
    const isIncome = transaction.categories?.is_income || 
                     (transaction.categories === null && transaction.amount > 0);
    
    if (isIncome) {
      monthlyData[monthKey].income += Math.abs(transaction.amount);
    } else {
      monthlyData[monthKey].expenses += Math.abs(transaction.amount);
    }
  });
  
  // Calculate saving rates
  return Object.keys(monthlyData)
    .sort() // Ensure chronological order
    .map(month => {
      const income = monthlyData[month].income;
      const expenses = monthlyData[month].expenses;
      const savingRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
      
      return {
        month: format(new Date(month + '-01'), 'MMM'),
        fullMonth: format(new Date(month + '-01'), 'MMMM yyyy'),
        savingRate: Math.max(savingRate, -100) // Cap at -100%
      };
    });
};

// Function to get year-over-year comparison data
export const getYearOverYearData = async () => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch year comparison data');
  }
  
  // Calculate date ranges
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const previousYear = currentYear - 1;
  
  // Start from beginning of previous year to current date (for 2 years of data)
  const startDate = new Date(previousYear, 0, 1);
  const endDate = currentDate;
  
  // Format dates for query
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');
  
  // Get all transactions
  const { data: transactions, error } = await supabase
    .from('transactions')
    .select('amount, transaction_date, categories(is_income)')
    .eq('user_id', userId)
    .gte('transaction_date', startDateStr)
    .lte('transaction_date', endDateStr);
  
  if (error) {
    throw error;
  }
  
  // Prepare data structure for month-by-month comparison
  const monthlyData: Record<string, { 
    currentYear: number; 
    previousYear: number;
  }> = {};
  
  // Initialize all months
  for (let month = 0; month < 12; month++) {
    const monthName = format(new Date(2000, month, 1), 'MMM');
    monthlyData[monthName] = { currentYear: 0, previousYear: 0 };
  }
  
  // Process transactions
  transactions?.forEach(transaction => {
    const date = new Date(transaction.transaction_date);
    const year = date.getFullYear();
    const monthKey = format(date, 'MMM');
    
    // Check if income or expense
    const isIncome = transaction.categories?.is_income || 
                     (transaction.categories === null && transaction.amount > 0);
    
    // We're only interested in income here
    if (isIncome) {
      if (year === currentYear) {
        monthlyData[monthKey].currentYear += Math.abs(transaction.amount);
      } else if (year === previousYear) {
        monthlyData[monthKey].previousYear += Math.abs(transaction.amount);
      }
    }
  });
  
  // Convert to array suitable for charts
  return Object.keys(monthlyData)
    .map(month => ({
      month,
      currentYear: monthlyData[month].currentYear,
      previousYear: monthlyData[month].previousYear
    }));
};

// Function to get financial snapshot for current month
export const getMonthlySnapshot = async () => {
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
  
  // Calculate totals
  let totalIncome = 0;
  let totalExpenses = 0;
  
  transactions?.forEach(transaction => {
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
};
