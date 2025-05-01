import { supabase } from "@/integrations/supabase/client";
import { Transaction, DbTransaction } from "@/types/database.types";

export const batchDeleteTransactions = async (transactionIds: string[]): Promise<void> => {
  if (transactionIds.length === 0) return;

  // First, get all transactions to be deleted to calculate balance adjustments
  const { data: transactions, error: getError } = await supabase
    .from('transactions')
    .select('*')
    .in('transaction_id', transactionIds);
  
  if (getError) throw getError;
  
  // Make sure we have transactions to process
  if (!transactions || transactions.length === 0) {
    throw new Error('No transactions found to delete');
  }

  // Group transactions by account_id to efficiently update account balances
  const accountAdjustments = new Map<string, number>();
  
  // Calculate the total adjustment for each account
  transactions.forEach(transaction => {
    const accountId = transaction.account_id;
    const currentAdjustment = accountAdjustments.get(accountId) || 0;
    // We subtract the amount since we're removing the transaction
    const newAdjustment = currentAdjustment - transaction.amount;
    accountAdjustments.set(accountId, newAdjustment);
  });

  // Delete the transactions
  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('transaction_id', transactionIds);
  
  if (error) throw error;

  // Update each affected account balance
  const updatePromises = Array.from(accountAdjustments.entries()).map(async ([accountId, adjustment]) => {
    // Get current account balance
    const { data: account, error: accError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('account_id', accountId)
      .single();
    
    if (accError) {
      console.error(`Error fetching account ${accountId}:`, accError);
      return false;
    }
    
    if (!account) {
      console.error(`Account ${accountId} not found`);
      return false;
    }
    
    // Update the balance
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ 
        balance: account.balance + adjustment,
        updated_at: new Date().toISOString() 
      })
      .eq('account_id', accountId);
    
    if (updateError) {
      console.error(`Error updating account ${accountId}:`, updateError);
      return false;
    }
    
    return true;
  });

  try {
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error updating account balances after batch delete:", error);
    // We've already deleted the transactions, so we can't easily roll back here
    // A more robust solution would use a database transaction
  }
};

export const batchUpdateCategory = async (transactionIds: string[], categoryId: string | null): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .update({ category_id: categoryId })
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const flagTransaction = async (transactionId: string, isFlagged: boolean): Promise<Transaction> => {
  // Use the supabase typescript schema from Database defined in types.ts
  const { data, error } = await supabase
    .from('transactions')
    .update({ is_flagged: isFlagged } as Partial<DbTransaction>)
    .eq('transaction_id', transactionId)
    .select()
    .single();
  
  if (error) throw error;
  
  if (!data) {
    throw new Error(`Failed to flag transaction ${transactionId}`);
  }
  
  // Use type assertion to ensure proper typing
  return {
    ...data,
    is_flagged: data.is_flagged ?? false
  } as Transaction;
};