
import { supabase } from "@/integrations/supabase/client";
import { Account } from "@/types/database.types";

export const getAccounts = async (): Promise<Account[]> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch accounts');
  }
  
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('account_name', { ascending: true });
  
  if (error) throw error;
  
  return data;
};

export const getAccountById = async (accountId: string): Promise<Account | null> => {
  const response = await supabase
    .from('accounts')
    .select('*')
    .eq('account_id', accountId)
    .single();
  
  if (response.error) {
    if (response.error.code === 'PGRST116') return null; // Not found
    throw response.error;
  }
  
  return response.data;
};

export const createAccount = async (account: Omit<Account, 'account_id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Account> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to create an account');
  }
  
  // Ensure user_id is set
  const accountWithUserId = {
    ...account,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('accounts')
    .insert(accountWithUserId)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

export const updateAccount = async (account: Partial<Account> & { account_id: string }): Promise<Account> => {
  const { data, error } = await supabase
    .from('accounts')
    .update(account)
    .eq('account_id', account.account_id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

export const deleteAccount = async (accountId: string): Promise<void> => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('account_id', accountId);
  
  if (error) throw error;
};

export const getAccountBalances = async (): Promise<{ 
  totalBalance: number; 
  accountBalances: { account_id: string; account_name: string; balance: number; currency: string; }[] 
}> => {
  const accounts = await getAccounts();
  
  const accountBalances = accounts.map(account => ({
    account_id: account.account_id,
    account_name: account.account_name,
    balance: account.balance,
    currency: account.currency
  }));
  
  const totalBalance = accountBalances.reduce((sum, account) => sum + account.balance, 0);
  
  return {
    totalBalance,
    accountBalances
  };
};

export const reconcileAccount = async (
  accountId: string, 
  actualBalance: number
): Promise<Account> => {
  // Get current account balance
  const account = await getAccountById(accountId);
  
  if (!account) {
    throw new Error('Account not found');
  }
  
  // Create an adjustment transaction if needed
  if (account.balance !== actualBalance) {
    const difference = actualBalance - account.balance;
    
    // First update the account balance
    const updatedAccount = await updateAccount({
      account_id: accountId,
      balance: actualBalance
    });
    
    // Then create a reconciliation transaction
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to reconcile an account');
    }
    
    await supabase.from('transactions').insert({
      user_id: userId,
      account_id: accountId,
      amount: difference,
      description: 'Account reconciliation',
      merchant: 'Balance adjustment',
      transaction_date: new Date().toISOString().split('T')[0],
      status: 'cleared',
      currency: account.currency
    });
    
    return updatedAccount;
  }
  
  return account;
};
