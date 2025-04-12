
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
  const { data, error } = await supabase
    .from('transactions')
    .insert(transaction)
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
