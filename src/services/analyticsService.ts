import { supabase } from "@/integrations/supabase/client";
import { format, subMonths, subYears, startOfMonth, endOfMonth, startOfYear } from "date-fns";

// Function to get income vs expenses data for a specific date range
export const getIncomeExpensesData = async (
  startDate: Date,
  endDate: Date,
  groupBy: 'day' | 'week' | 'month' = 'month'
) => {
  try {
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
    
    // If no transactions, return empty array
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    // Group by date according to the groupBy parameter
    const groupedData: Record<string, { income: number; expenses: number; net: number }> = {};
    
    transactions.forEach(transaction => {
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
          month: label,
          income: groupedData[key].income,
          expenses: groupedData[key].expenses,
          net: groupedData[key].net
        };
      });
  } catch (error) {
    console.error("Error in getIncomeExpensesData:", error);
    return [];
  }
};

// Function to get spending by category for a specific date range
export const getCategorySpendingByPeriod = async (startDate: Date, endDate: Date) => {
  try {
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
    
    // If no transactions, return empty array
    if (!transactions || transactions.length === 0) {
      return [];
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
    
    transactions.forEach(transaction => {
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
  } catch (error) {
    console.error("Error in getCategorySpendingByPeriod:", error);
    return [];
  }
};

// Function to get merchant spending data
export const getTopMerchants = async (startDate: Date, endDate: Date, limit: number = 5) => {
  try {
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
    
    // If no transactions, return empty array
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    // Group by merchant
    const merchantMap = new Map<string, number>();
    
    transactions.forEach(transaction => {
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
  } catch (error) {
    console.error("Error in getTopMerchants:", error);
    return [];
  }
};

// Function to get monthly saving rate data
export const getMonthlySavingRates = async (months: number = 6) => {
  try {
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
    
    // If no transactions, return empty array
    if (!transactions || transactions.length === 0) {
      return [];
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
    transactions.forEach(transaction => {
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
  } catch (error) {
    console.error("Error in getMonthlySavingRates:", error);
    return [];
  }
};

// Function to get year-over-year comparison data
export const getYearOverYearData = async () => {
  try {
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
    
    // If no transactions, return empty array
    if (!transactions || transactions.length === 0) {
      return [];
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
    transactions.forEach(transaction => {
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
  } catch (error) {
    console.error("Error in getYearOverYearData:", error);
    return [];
  }
};

// Function to get monthly spending by category
export const getMonthlyCategorySpending = async (monthCount: number = 6) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to fetch category trends');
    }
    
    // Calculate date range
    const endDate = new Date();
    const startDate = subMonths(endDate, monthCount - 1);
    
    // Format dates for query
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    // Get all transactions with categories
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        transaction_date,
        categories (category_id, name)
      `)
      .eq('user_id', userId)
      .lt('amount', 0) // Only get expenses
      .gte('transaction_date', startDateStr)
      .lte('transaction_date', endDateStr);
    
    if (error) {
      throw error;
    }
    
    // If no transactions, return empty array
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    // Get all months in range
    const monthsInRange: string[] = [];
    for (let i = 0; i < monthCount; i++) {
      const monthDate = subMonths(endDate, i);
      monthsInRange.push(format(monthDate, 'yyyy-MM'));
    }
    
    // Group transactions by month and category
    const monthlyData: Record<string, Record<string, number>> = {};
    const categoryIds: Set<string> = new Set();
    
    // Initialize months
    monthsInRange.forEach(month => {
      monthlyData[month] = {};
    });
    
    // Process transactions
    transactions.forEach(transaction => {
      const monthKey = transaction.transaction_date.substring(0, 7); // YYYY-MM
      if (!monthlyData[monthKey]) return; // Skip if not in our range
      
      const categoryId = transaction.categories?.category_id || 'uncategorized';
      const amount = Math.abs(transaction.amount);
      
      // Track category IDs
      categoryIds.add(categoryId);
      
      // Add to monthly data
      if (!monthlyData[monthKey][categoryId]) {
        monthlyData[monthKey][categoryId] = amount;
      } else {
        monthlyData[monthKey][categoryId] += amount;
      }
    });
    
    // Create category name mapping
    const categoryNames: Record<string, string> = {};
    transactions.forEach(transaction => {
      if (transaction.categories) {
        categoryNames[transaction.categories.category_id] = transaction.categories.name;
      }
    });
    categoryNames['uncategorized'] = 'Uncategorized';
    
    // Convert to chart-friendly format
    return monthsInRange.map(monthKey => {
      const result: Record<string, any> = {
        month: format(new Date(monthKey + '-01'), 'MMM')
      };
      
      // Add each category amount
      Array.from(categoryIds).forEach(categoryId => {
        const categoryKey = categoryNames[categoryId] || categoryId;
        result[categoryKey.toLowerCase().replace(/\s+/g, '_')] = monthlyData[monthKey][categoryId] || 0;
      });
      
      return result;
    }).reverse();
  } catch (error) {
    console.error("Error in getMonthlyCategorySpending:", error);
    return [];
  }
};

// Function to get financial snapshot for current month
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

// Function to get spending by day of week
export const getSpendingByDayOfWeek = async (startDate: Date, endDate: Date) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to fetch day of week data');
    }
    
    // Format dates for query
    const startDateStr = format(startDate, 'yyyy-MM-dd');
    const endDateStr = format(endDate, 'yyyy-MM-dd');
    
    // Get all transactions
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, transaction_date')
      .eq('user_id', userId)
      .lt('amount', 0) // Only get expenses
      .gte('transaction_date', startDateStr)
      .lte('transaction_date', endDateStr);
    
    if (error) {
      throw error;
    }
    
    // If no transactions, return empty array
    if (!transactions || transactions.length === 0) {
      return [];
    }
    
    // Day names for display
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    
    // Initialize spending by day of week
    const dayTotals: number[] = Array(7).fill(0);
    const dayCount: number[] = Array(7).fill(0);
    
    // Sum expenses by day of week
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const amount = Math.abs(transaction.amount);
      
      dayTotals[dayOfWeek] += amount;
      dayCount[dayOfWeek]++;
    });
    
    // Calculate averages and format for chart
    return dayNames.map((day, index) => ({
      day,
      amount: dayCount[index] > 0 ? dayTotals[index] / dayCount[index] : 0
    }));
  } catch (error) {
    console.error("Error in getSpendingByDayOfWeek:", error);
    return [];
  }
};