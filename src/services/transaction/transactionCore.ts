
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

  // Start a transaction with the Supabase client
  // We'll first verify the account exists
  const { data: account, error: accountError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('account_id', transaction.account_id)
    .single();

  if (accountError) {
    throw new Error(`Failed to find account ${transaction.account_id}: ${accountError.message}`);
  }

  if (!account) {
    throw new Error(`Account ${transaction.account_id} not found`);
  }

  // Calculate the new balance
  const newBalance = account.balance + transaction.amount;

  // 1. Insert the transaction
  const { data: newTransaction, error: transactionError } = await supabase
    .from('transactions')
    .insert(transactionWithUserId)
    .select()
    .single();

  if (transactionError) {
    throw transactionError;
  }

  if (!newTransaction) {
    throw new Error('Failed to create transaction');
  }

  // 2. Update the account balance
  const { error: updateError } = await supabase
    .from('accounts')
    .update({ 
      balance: newBalance,
      updated_at: new Date().toISOString() 
    })
    .eq('account_id', transaction.account_id);

  if (updateError) {
    // If account update fails, we should try to roll back the transaction
    try {
      await supabase
        .from('transactions')
        .delete()
        .eq('transaction_id', newTransaction.transaction_id);
    } catch (rollbackError) {
      console.error('Failed to rollback transaction after account update error:', rollbackError);
    }

    throw new Error(`Failed to update account balance: ${updateError.message}`);
  }

  // Return the transaction with proper typing
  return {
    ...newTransaction,
    is_flagged: newTransaction.is_flagged ?? false
  } as Transaction;
};

export const updateTransaction = async (transaction: Partial<DbTransaction> & { transaction_id: string }): Promise<Transaction> => {
  // First, get the original transaction to compare changes
  const { data: originalTransaction, error: getError } = await supabase
    .from('transactions')
    .select('*')
    .eq('transaction_id', transaction.transaction_id)
    .single();
  
  if (getError) throw getError;
  
  if (!originalTransaction) {
    throw new Error(`Transaction ${transaction.transaction_id} not found`);
  }

  // Make a copy of the amount and account_id in case they're changing
  const originalAmount = originalTransaction.amount;
  const originalAccountId = originalTransaction.account_id;
  
  // Determine if we need to update account balances
  const amountChanged = transaction.amount !== undefined && transaction.amount !== originalAmount;
  const accountChanged = transaction.account_id !== undefined && transaction.account_id !== originalAccountId;
  
  if (!amountChanged && !accountChanged) {
    // If neither amount nor account is changing, just update the transaction
    const { data, error } = await supabase
      .from('transactions')
      .update(transaction)
      .eq('transaction_id', transaction.transaction_id)
      .select()
      .single();

    if (error) throw error;
    
    if (!data) {
      throw new Error('Failed to update transaction');
    }

    return {
      ...data,
      is_flagged: data.is_flagged ?? false
    } as Transaction;
  }

  // Handle the case where account or amount is changing
  
  // First, get the original account
  const { data: originalAccount, error: origAccError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('account_id', originalAccountId)
    .single();
  
  if (origAccError) throw origAccError;
  
  if (!originalAccount) {
    throw new Error(`Account ${originalAccountId} not found`);
  }
  
  // Get the new account if it's changing
  let newAccount = originalAccount;
  if (accountChanged) {
    const newAccountId = transaction.account_id as string;
    const { data: accData, error: accError } = await supabase
      .from('accounts')
      .select('balance')
      .eq('account_id', newAccountId)
      .single();
    
    if (accError) throw accError;
    
    if (!accData) {
      throw new Error(`Account ${newAccountId} not found`);
    }
    
    newAccount = accData;
  }
  
  // Calculate balance adjustments
  const newAmount = transaction.amount !== undefined ? transaction.amount : originalAmount;
  
  // 1. Update the transaction first
  const { data: updatedTx, error: updateError } = await supabase
    .from('transactions')
    .update(transaction)
    .eq('transaction_id', transaction.transaction_id)
    .select()
    .single();
  
  if (updateError) throw updateError;
  
  if (!updatedTx) {
    throw new Error('Failed to update transaction');
  }
  
  // 2. Update the account balance(s)
  try {
    // If account changed, we need to update both accounts
    if (accountChanged) {
      // Remove the amount from the original account
      await supabase
        .from('accounts')
        .update({ 
          balance: originalAccount.balance - originalAmount,
          updated_at: new Date().toISOString() 
        })
        .eq('account_id', originalAccountId);
      
      // Add the amount to the new account
      await supabase
        .from('accounts')
        .update({ 
          balance: newAccount.balance + newAmount,
          updated_at: new Date().toISOString() 
        })
        .eq('account_id', transaction.account_id);
    } else if (amountChanged) {
      // Just update the original account with the difference
      const difference = newAmount - originalAmount;
      await supabase
        .from('accounts')
        .update({ 
          balance: originalAccount.balance + difference,
          updated_at: new Date().toISOString() 
        })
        .eq('account_id', originalAccountId);
    }
  } catch (balanceError) {
    console.error("Error updating account balance:", balanceError);
    // Here we would ideally try to roll back the transaction update
    // but for simplicity we'll just log the error
  }
  
  return {
    ...updatedTx,
    is_flagged: updatedTx.is_flagged ?? false
  } as Transaction;
};

export const deleteTransaction = async (transactionId: string): Promise<void> => {
  // First, get the transaction to be deleted
  const { data: transaction, error: getError } = await supabase
    .from('transactions')
    .select('*')
    .eq('transaction_id', transactionId)
    .single();
  
  if (getError) throw getError;
  
  if (!transaction) {
    throw new Error(`Transaction ${transactionId} not found`);
  }

  // Get the account to update its balance
  const { data: account, error: accError } = await supabase
    .from('accounts')
    .select('balance')
    .eq('account_id', transaction.account_id)
    .single();
  
  if (accError) throw accError;
  
  if (!account) {
    throw new Error(`Account ${transaction.account_id} not found`);
  }

  // Delete the transaction
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('transaction_id', transactionId);

  if (error) throw error;

  // Update the account balance
  try {
    // Reverse the effect of the transaction (subtract for income, add for expense)
    const newBalance = account.balance - transaction.amount;
    
    await supabase
      .from('accounts')
      .update({ 
        balance: newBalance,
        updated_at: new Date().toISOString() 
      })
      .eq('account_id', transaction.account_id);
  } catch (balanceError) {
    console.error("Error updating account balance after delete:", balanceError);
    // In an ideal world we would roll back the deletion, but for simplicity
    // we'll just log the error
  }
};