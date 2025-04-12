
import { supabase } from "@/integrations/supabase/client";
import { Account } from "@/types/database.types";
import { mapDbAccountToAccount } from "@/types/supabase";

export const getAccounts = async (): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .order('account_name', { ascending: true });
  
  if (error) throw error;
  
  return data.map(mapDbAccountToAccount);
};

export const getAccountById = async (accountId: string): Promise<Account | null> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('account_id', accountId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return mapDbAccountToAccount(data);
};

export const createAccount = async (account: Omit<Account, 'account_id' | 'created_at' | 'updated_at'>): Promise<Account> => {
  const { data, error } = await supabase
    .from('accounts')
    .insert(account)
    .select()
    .single();
  
  if (error) throw error;
  
  return mapDbAccountToAccount(data);
};

export const updateAccount = async (account: Partial<Account> & { account_id: string }): Promise<Account> => {
  const { data, error } = await supabase
    .from('accounts')
    .update(account)
    .eq('account_id', account.account_id)
    .select()
    .single();
  
  if (error) throw error;
  
  return mapDbAccountToAccount(data);
};

export const deleteAccount = async (accountId: string): Promise<void> => {
  const { error } = await supabase
    .from('accounts')
    .delete()
    .eq('account_id', accountId);
  
  if (error) throw error;
};
