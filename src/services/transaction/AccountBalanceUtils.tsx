import { supabase } from "@/integrations/supabase/client";
import { DbTransaction } from "@/types/database.types";

/**
 * Updates an account balance based on a transaction
 * @param accountId The account ID to update
 * @param amountChange The amount to change the balance by (positive to increase, negative to decrease)
 */
export const updateAccountBalance = async (accountId: string, amountChange: number): Promise<void> => {
  // Get the current account to verify it exists
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('account_id', accountId)
    .single();
  
  if (accountError) {
    throw new Error(`Failed to find account ${accountId}: ${accountError.message}`);
  }
  
  // Update the account balance
  const { error: updateError } = await supabase
    .from('accounts')
    .update({ 
      balance: account.balance + amountChange,
      updated_at: new Date().toISOString() 
    })
    .eq('account_id', accountId);
  
  if (updateError) {
    throw new Error(`Failed to update account balance: ${updateError.message}`);
  }
};

/**
 * Calculate the effect of a transaction on account balance
 * @param transaction The transaction to calculate the effect of
 * @returns The amount to change the account balance by
 */
export const getTransactionEffect = (transaction: Pick<DbTransaction, 'amount'>): number => {
  // Transaction amount directly affects account balance 
  // (positive means more money in the account, negative means less)
  return transaction.amount;
};

/**
 * Handles updating account balance when creating a transaction
 * @param transaction The new transaction
 */
export const handleTransactionCreated = async (
  transaction: Pick<DbTransaction, 'account_id' | 'amount'>
): Promise<void> => {
  const effect = getTransactionEffect(transaction);
  await updateAccountBalance(transaction.account_id, effect);
};

/**
 * Handles updating account balance when updating a transaction
 * @param oldTransaction The transaction before update
 * @param newTransaction The transaction after update
 */
export const handleTransactionUpdated = async (
  oldTransaction: Pick<DbTransaction, 'account_id' | 'amount'>,
  newTransaction: Pick<DbTransaction, 'account_id' | 'amount'>
): Promise<void> => {
  // First, reverse the effect of the old transaction
  const oldEffect = getTransactionEffect(oldTransaction);
  await updateAccountBalance(oldTransaction.account_id, -oldEffect);
  
  // Then apply the effect of the new transaction
  const newEffect = getTransactionEffect(newTransaction);
  await updateAccountBalance(newTransaction.account_id, newEffect);
};

/**
 * Handles updating account balance when deleting a transaction
 * @param transaction The transaction being deleted
 */
export const handleTransactionDeleted = async (
  transaction: Pick<DbTransaction, 'account_id' | 'amount'>
): Promise<void> => {
  // Reverse the effect of the transaction
  const effect = getTransactionEffect(transaction);
  await updateAccountBalance(transaction.account_id, -effect);
};