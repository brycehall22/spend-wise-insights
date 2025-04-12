
import { supabase } from "@/integrations/supabase/client";
import { FinancialSummary, Transaction, TransactionFilter } from "@/types/database.types";

// Helper to build filter conditions
const buildFilterQuery = (query: any, filter: TransactionFilter) => {
  let filteredQuery = query;
  
  if (filter.startDate) {
    filteredQuery = filteredQuery.gte('transaction_date', filter.startDate);
  }
  
  if (filter.endDate) {
    filteredQuery = filteredQuery.lte('transaction_date', filter.endDate);
  }
  
  if (filter.categoryId) {
    filteredQuery = filteredQuery.eq('category_id', filter.categoryId);
  }
  
  if (filter.accountId) {
    filteredQuery = filteredQuery.eq('account_id', filter.accountId);
  }
  
  if (filter.minAmount !== undefined) {
    filteredQuery = filteredQuery.gte('amount', filter.minAmount);
  }
  
  if (filter.maxAmount !== undefined) {
    filteredQuery = filteredQuery.lte('amount', filter.maxAmount);
  }
  
  if (filter.status) {
    filteredQuery = filteredQuery.eq('status', filter.status);
  }
  
  if (filter.isFlagged !== undefined) {
    filteredQuery = filteredQuery.eq('is_flagged', filter.isFlagged);
  }
  
  if (filter.searchTerm) {
    filteredQuery = filteredQuery.or(`description.ilike.%${filter.searchTerm}%,merchant.ilike.%${filter.searchTerm}%`);
  }
  
  return filteredQuery;
};

export const getTransactions = async (
  page: number = 1, 
  pageSize: number = 10,
  filter: TransactionFilter = {},
  sortBy: string = 'transaction_date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<{
  transactions: Transaction[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
  };
}> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch transactions');
  }
  
  // Calculate range for pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  
  // Build the query with filters
  let query = supabase
    .from('transactions')
    .select('*, categories:category_id(name), accounts:account_id(account_name)', { count: 'exact' })
    .eq('user_id', userId)
    .order(sortBy, { ascending: sortOrder === 'asc' })
    .range(from, to);
  
  // Apply filters
  query = buildFilterQuery(query, filter);
  
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  // Transform the data to match the Transaction type
  const transactions = data.map((item: any) => ({
    ...item,
    category_name: item.categories?.name,
    account_name: item.accounts?.account_name,
  }));
  
  const totalPages = Math.ceil((count || 0) / pageSize);
  
  return {
    transactions,
    pagination: {
      page,
      pageSize,
      totalCount: count || 0,
      totalPages,
    },
  };
};

export const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories:category_id(name), accounts:account_id(account_name)')
    .eq('transaction_id', transactionId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  // Transform to Transaction type
  return {
    ...data,
    category_name: data.categories?.name,
    account_name: data.accounts?.account_name,
  };
};

export const createTransaction = async (transaction: Omit<Transaction, "transaction_id" | "created_at" | "updated_at">): Promise<Transaction> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to create a transaction');
  }
  
  // Ensure user_id is set
  const transactionWithUserId = {
    ...transaction,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionWithUserId)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

export const updateTransaction = async (transaction: Partial<Transaction> & { transaction_id: string }): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('transaction_id', transaction.transaction_id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('transaction_id', transactionId);
  
  if (error) throw error;
};

export const batchDeleteTransactions = async (transactionIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const batchUpdateTransactions = async (
  transactionIds: string[],
  updates: Partial<Transaction>
): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .update(updates)
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const batchUpdateCategory = async (
  transactionIds: string[],
  categoryId: string | null
): Promise<void> => {
  return batchUpdateTransactions(transactionIds, { category_id: categoryId });
};

export const flagTransaction = async (transactionId: string, isFlagged: boolean): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update({ is_flagged: isFlagged })
    .eq('transaction_id', transactionId)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

// Adding the missing getTransactionStats function
export const getTransactionStats = async (
  startDate: Date,
  endDate: Date
): Promise<{ income: number; expenses: number; }> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to get transaction stats');
  }
  
  // Format dates for database query
  const formattedStartDate = startDate.toISOString().split('T')[0];
  const formattedEndDate = endDate.toISOString().split('T')[0];
  
  // Query for transactions within the date range
  const { data, error } = await supabase
    .from('transactions')
    .select('*, categories:category_id(is_income)')
    .eq('user_id', userId)
    .gte('transaction_date', formattedStartDate)
    .lte('transaction_date', formattedEndDate);
  
  if (error) throw error;
  
  // Process the transactions to calculate income and expenses
  let income = 0;
  let expenses = 0;
  
  data.forEach((transaction: any) => {
    const amount = transaction.amount;
    const isIncome = transaction.categories?.is_income || false;
    
    if (isIncome) {
      income += amount;
    } else {
      expenses += Math.abs(amount);
    }
  });
  
  return {
    income,
    expenses,
  };
};

export const getFinancialSummary = async (
  startDate?: string,
  endDate?: string
): Promise<FinancialSummary> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to get financial summary');
  }
  
  // Start with base query
  let query = supabase
    .from('transactions')
    .select('*, categories:category_id(is_income)')
    .eq('user_id', userId);
  
  // Apply date filters if provided
  if (startDate) {
    query = query.gte('transaction_date', startDate);
  }
  
  if (endDate) {
    query = query.lte('transaction_date', endDate);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Process the transactions to calculate summary
  let totalIncome = 0;
  let totalExpenses = 0;
  
  data.forEach((transaction: any) => {
    const amount = transaction.amount;
    const isIncome = transaction.categories?.is_income || false;
    
    if (isIncome) {
      totalIncome += amount;
    } else {
      totalExpenses += Math.abs(amount);
    }
  });
  
  const totalTransactions = data.length;
  const averageTransaction = totalTransactions > 0 
    ? (totalIncome + totalExpenses) / totalTransactions 
    : 0;
  
  return {
    totalTransactions,
    totalIncome,
    totalExpenses,
    averageTransaction
  };
};

export const exportTransactions = async (format: 'csv' | 'json' = 'csv', filter: TransactionFilter = {}): Promise<string> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to export transactions');
  }
  
  // Build the query with filters
  let query = supabase
    .from('transactions')
    .select('*, categories:category_id(name), accounts:account_id(account_name)')
    .eq('user_id', userId)
    .order('transaction_date', { ascending: false });
  
  // Apply filters
  query = buildFilterQuery(query, filter);
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Transform the data to match the Transaction type
  const transactions = data.map((item: any) => ({
    ...item,
    category_name: item.categories?.name,
    account_name: item.accounts?.account_name,
  }));
  
  if (format === 'json') {
    return JSON.stringify(transactions, null, 2);
  } else {
    // CSV format
    const headers = [
      'Transaction Date',
      'Description',
      'Merchant',
      'Category',
      'Account',
      'Amount',
      'Currency',
      'Status'
    ].join(',');
    
    const rows = transactions.map((t: Transaction) => [
      t.transaction_date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.merchant.replace(/"/g, '""')}"`,
      `"${t.category_name || 'Uncategorized'}"`,
      `"${t.account_name || ''}"`,
      t.amount,
      t.currency,
      t.status
    ].join(','));
    
    return [headers, ...rows].join('\n');
  }
};
