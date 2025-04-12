
import { supabase } from "@/integrations/supabase/client";
import { Transaction } from "@/types/database.types";
import { mapDbTransactionToTransaction } from "@/types/supabase";

export type TransactionFilter = {
  search?: string;
  dateRange?: { from?: Date; to?: Date };
  accounts?: string[];
  categories?: string[];
  amountRange?: { min?: number; max?: number };
  transactionType?: 'all' | 'income' | 'expense';
  status?: 'all' | 'cleared' | 'pending';
};

export const getTransactions = async (filters?: TransactionFilter): Promise<Transaction[]> => {
  let query = supabase
    .from('transactions')
    .select('*, accounts(account_name), categories(name)')
    .order('transaction_date', { ascending: false });
  
  // Apply filters if provided
  if (filters) {
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = `%${filters.search.trim()}%`;
      query = query.or(`description.ilike.${searchTerm},merchant.ilike.${searchTerm}`);
    }
    
    if (filters.dateRange?.from) {
      query = query.gte('transaction_date', filters.dateRange.from.toISOString().split('T')[0]);
    }
    
    if (filters.dateRange?.to) {
      query = query.lte('transaction_date', filters.dateRange.to.toISOString().split('T')[0]);
    }
    
    if (filters.accounts && filters.accounts.length > 0) {
      query = query.in('account_id', filters.accounts);
    }
    
    if (filters.categories && filters.categories.length > 0) {
      query = query.in('category_id', filters.categories);
    }
    
    if (filters.amountRange?.min !== undefined) {
      query = query.gte('amount', filters.amountRange.min);
    }
    
    if (filters.amountRange?.max !== undefined) {
      query = query.lte('amount', filters.amountRange.max);
    }
    
    if (filters.transactionType === 'income') {
      query = query.gt('amount', 0);
    } else if (filters.transactionType === 'expense') {
      query = query.lt('amount', 0);
    }
    
    if (filters.status && filters.status !== 'all') {
      query = query.eq('status', filters.status);
    }
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  
  return data.map(item => {
    const transaction = mapDbTransactionToTransaction(item);
    return {
      ...transaction,
      account_name: item.accounts?.account_name || 'Unknown Account',
      category_name: item.categories?.name || null
    };
  }) as Transaction[];
};

export const getTransactionById = async (transactionId: string): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .select('*, accounts(account_name), categories(name)')
    .eq('transaction_id', transactionId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  const transaction = mapDbTransactionToTransaction(data);
  return {
    ...transaction,
    account_name: data.accounts?.account_name || 'Unknown Account',
    category_name: data.categories?.name || null
  } as Transaction;
};

export const createTransaction = async (transaction: Omit<Transaction, 'transaction_id' | 'created_at' | 'updated_at'>): Promise<Transaction> => {
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
    .select('*, accounts(account_name), categories(name)')
    .single();
  
  if (error) throw error;
  
  const newTransaction = mapDbTransactionToTransaction(data);
  return {
    ...newTransaction,
    account_name: data.accounts?.account_name || 'Unknown Account',
    category_name: data.categories?.name || null
  } as Transaction;
};

export const updateTransaction = async (transaction: Partial<Transaction> & { transaction_id: string }): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('transaction_id', transaction.transaction_id)
    .select('*, accounts(account_name), categories(name)')
    .single();
  
  if (error) throw error;
  
  const updatedTransaction = mapDbTransactionToTransaction(data);
  return {
    ...updatedTransaction,
    account_name: data.accounts?.account_name || 'Unknown Account',
    category_name: data.categories?.name || null
  } as Transaction;
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('transaction_id', transactionId);
  
  if (error) throw error;
};

// Batch operations
export const batchDeleteTransactions = async (transactionIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const batchUpdateCategory = async (transactionIds: string[], categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .update({ category_id: categoryId })
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const batchFlagTransactions = async (transactionIds: string[], isFlagged: boolean): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .update({ is_flagged: isFlagged })
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const getTransactionStats = async (
  dateFrom?: Date, 
  dateTo?: Date
): Promise<{ income: number; expenses: number; balance: number }> => {
  // Default to current month if no dates provided
  const start = dateFrom 
    ? dateFrom.toISOString().split('T')[0] 
    : new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];
    
  const end = dateTo
    ? dateTo.toISOString().split('T')[0]
    : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0];
  
  // Get all transactions within date range
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .gte('transaction_date', start)
    .lte('transaction_date', end);
    
  if (error) throw error;
  
  // Calculate totals
  let income = 0;
  let expenses = 0;
  
  data.forEach(transaction => {
    const amount = Number(transaction.amount);
    if (amount > 0) {
      income += amount;
    } else {
      expenses += Math.abs(amount);
    }
  });
  
  return {
    income,
    expenses,
    balance: income - expenses
  };
};

// Export functionality
export const exportTransactions = async (format: 'csv' | 'json', filters?: TransactionFilter): Promise<string> => {
  const transactions = await getTransactions(filters);
  
  if (format === 'csv') {
    const headers = [
      'Transaction ID',
      'Date',
      'Description',
      'Merchant',
      'Category',
      'Account',
      'Amount',
      'Currency',
      'Status'
    ].join(',');
    
    const rows = transactions.map(t => [
      t.transaction_id,
      t.transaction_date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.merchant.replace(/"/g, '""')}"`,
      t.category_name || 'Uncategorized',
      t.account_name,
      t.amount,
      t.currency,
      t.status
    ].join(',')).join('\n');
    
    return `${headers}\n${rows}`;
  } else {
    return JSON.stringify(transactions, null, 2);
  }
};
