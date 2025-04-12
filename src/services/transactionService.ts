import { supabase } from "@/integrations/supabase/client";
import { 
  DbTransaction, 
  Transaction, 
  TransactionFilter, 
  FinancialSummary,
  DbTransactionWithRelations 
} from "@/types/database.types";

interface PaginationResult {
  totalCount: number;
  totalPages: number;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationResult;
}

export const getTransactions = async (
  page: number = 1, 
  pageSize: number = 10, 
  filters: TransactionFilter = {},
  sortBy: string = 'transaction_date',
  sortOrder: 'asc' | 'desc' = 'desc'
): Promise<TransactionsResponse> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch transactions');
  }

  // Calculate offset for pagination
  const offset = (page - 1) * pageSize;
  
  // Start building the query
  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories (name),
      accounts (account_name, currency)
    `, { count: 'exact' })
    .eq('user_id', userId);

  // Apply filters if provided
  if (filters.startDate) {
    query = query.gte('transaction_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('transaction_date', filters.endDate);
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }
  if (filters.minAmount !== undefined) {
    query = query.gte('amount', filters.minAmount);
  }
  if (filters.maxAmount !== undefined) {
    query = query.lte('amount', filters.maxAmount);
  }
  if (filters.searchTerm) {
    query = query.or(`description.ilike.%${filters.searchTerm}%,merchant.ilike.%${filters.searchTerm}%`);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.isFlagged !== undefined) {
    query = query.eq('is_flagged', filters.isFlagged);
  }

  // Apply sorting
  const dbSortBy = sortBy === 'date' ? 'transaction_date' : sortBy;
  query = query.order(dbSortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  query = query.range(offset, offset + pageSize - 1);

  // Execute the query
  const { data, error, count } = await query;
  
  if (error) throw error;
  
  // Format the results
  const transactions: Transaction[] = (data || []).map((item: any) => {
    // Create a transaction object with properly defined types
    const transaction: Transaction = {
      transaction_id: item.transaction_id,
      user_id: item.user_id,
      account_id: item.account_id,
      category_id: item.category_id,
      amount: item.amount,
      currency: item.currency,
      description: item.description,
      merchant: item.merchant,
      transaction_date: item.transaction_date,
      status: item.status,
      is_flagged: item.is_flagged || false,
      created_at: item.created_at,
      updated_at: item.updated_at,
      category_name: item.categories?.name,
      account_name: item.accounts?.account_name
    };
    
    return transaction;
  });
  
  // Calculate total pages
  const totalPages = Math.ceil((count || 0) / pageSize);
  
  return {
    transactions,
    pagination: {
      totalCount: count || 0,
      totalPages
    }
  };
};

export const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      categories (name),
      accounts (account_name)
    `)
    .eq('transaction_id', transactionId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  if (!data) return null;
  
  // Create transaction with correct typing
  const transaction: Transaction = {
    transaction_id: data.transaction_id,
    user_id: data.user_id,
    account_id: data.account_id,
    category_id: data.category_id,
    amount: data.amount,
    currency: data.currency,
    description: data.description,
    merchant: data.merchant,
    transaction_date: data.transaction_date,
    status: data.status,
    is_flagged: data.is_flagged || false,
    created_at: data.created_at,
    updated_at: data.updated_at,
    category_name: data.categories?.name,
    account_name: data.accounts?.account_name
  };
  
  return transaction;
};

export const createTransaction = async (transaction: Omit<DbTransaction, "transaction_id" | "created_at" | "updated_at">): Promise<Transaction> => {
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

export const updateTransaction = async (transaction: Partial<DbTransaction> & { transaction_id: string }): Promise<Transaction> => {
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

export const flagTransaction = async (transactionId: string, isFlagged: boolean): Promise<Transaction> => {
  // Create a properly typed update object
  const updateData: Partial<DbTransaction> = { is_flagged: isFlagged };
  
  const { data, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('transaction_id', transactionId)
    .select()
    .single();
  
  if (error) throw error;
  
  return data as Transaction;
};

export const batchDeleteTransactions = async (transactionIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const batchUpdateCategory = async (transactionIds: string[], categoryId: string | null): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .update({ category_id: categoryId })
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const exportTransactions = async (format: 'csv' | 'json', filters: TransactionFilter = {}): Promise<string> => {
  // Get all transactions (no pagination)
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to export transactions');
  }
  
  // Build query with filters but no pagination
  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories (name),
      accounts (account_name, currency)
    `)
    .eq('user_id', userId);

  // Apply filters
  if (filters.startDate) {
    query = query.gte('transaction_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('transaction_date', filters.endDate);
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }
  if (filters.minAmount !== undefined) {
    query = query.gte('amount', filters.minAmount);
  }
  if (filters.maxAmount !== undefined) {
    query = query.lte('amount', filters.maxAmount);
  }
  if (filters.searchTerm) {
    query = query.or(`description.ilike.%${filters.searchTerm}%,merchant.ilike.%${filters.searchTerm}%`);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.isFlagged !== undefined) {
    query = query.eq('is_flagged', filters.isFlagged);
  }
  
  // Execute query
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Format data
  const transactions = (data || []).map((item: any) => {
    const transaction: any = {
      id: item.transaction_id,
      date: item.transaction_date,
      description: item.description,
      merchant: item.merchant,
      amount: item.amount,
      currency: item.currency,
      category: item.categories?.name || 'Uncategorized',
      account: item.accounts?.account_name || 'Unknown',
      status: item.status,
      is_flagged: item.is_flagged || false
    };
    
    return transaction;
  });
  
  // Format based on export type
  if (format === 'json') {
    return JSON.stringify(transactions, null, 2);
  } else {
    // CSV format
    if (transactions.length === 0) {
      return 'id,date,description,merchant,amount,currency,category,account,status,is_flagged';
    }
    
    const headers = Object.keys(transactions[0]).join(',');
    const rows = transactions.map(t => 
      Object.values(t)
        .map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v)
        .join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
};

export const getTransactionStats = async (startDate?: string, endDate?: string): Promise<FinancialSummary> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch transaction statistics');
  }
  
  // Set default date range to current month if not provided
  const currentDate = new Date();
  const defaultStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
  const defaultEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
  
  const start = startDate || defaultStartDate;
  const end = endDate || defaultEndDate;
  
  // Fetch transactions for the period
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .gte('transaction_date', start)
    .lte('transaction_date', end);
  
  if (error) throw error;
  
  // Calculate stats
  const transactions = data || [];
  const totalTransactions = transactions.length;
  
  let totalIncome = 0;
  let totalExpenses = 0;
  
  transactions.forEach(t => {
    if (t.amount > 0) {
      totalIncome += t.amount;
    } else {
      totalExpenses += Math.abs(t.amount);
    }
  });
  
  const averageTransaction = totalTransactions > 0 
    ? (totalIncome + totalExpenses) / totalTransactions 
    : 0;
  
  return {
    totalTransactions,
    totalIncome,
    totalExpenses,
    averageTransaction,
    income: totalIncome,
    expenses: totalExpenses
  };
};
