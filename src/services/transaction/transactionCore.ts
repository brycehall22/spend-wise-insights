
import { supabase } from "@/integrations/supabase/client";
import { DbTransaction, Transaction } from "@/types/database.types";

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

  // Use type assertion to handle the complex structure
  const item = data as any;

  // Create transaction with correct typing
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
    is_flagged: item.is_flagged ?? false,
    created_at: item.created_at,
    updated_at: item.updated_at,
    category_name: item.categories?.name,
    account_name: item.accounts?.account_name
  };

  return transaction;
};

export const createTransaction = async (transaction: Omit<DbTransaction, "transaction_id" | "created_at" | "updated_at" | "user_id">): Promise<Transaction> => {
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

  // Use type assertion to ensure proper typing
  const item = data as any;
  return {
    ...item,
    is_flagged: item.is_flagged ?? false
  } as Transaction;
};

export const updateTransaction = async (transaction: Partial<DbTransaction> & { transaction_id: string }): Promise<Transaction> => {
  const { data, error } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('transaction_id', transaction.transaction_id)
    .select()
    .single();

  if (error) throw error;

  // Use type assertion to ensure proper typing
  const item = data as any;
  return {
    ...item,
    is_flagged: item.is_flagged ?? false
  } as Transaction;
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('transaction_id', transactionId);

  if (error) throw error;
};

