
import { BaseService } from "../BaseService";
import { Account } from "@/types/database.types";

export class AccountService extends BaseService {
  async createAccount(account: Omit<Account, 'account_id' | 'created_at' | 'updated_at' | 'user_id'>): Promise<Account> {
    return this.withAuth(async (userId) => {
      const { data, error } = await this.supabase
        .from('accounts')
        .insert({
          ...account,
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  async updateAccount(accountId: string, updates: Partial<Account>): Promise<Account> {
    const { data, error } = await this.supabase
      .from('accounts')
      .update(updates)
      .eq('account_id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteAccount(accountId: string): Promise<void> {
    const { error } = await this.supabase
      .from('accounts')
      .delete()
      .eq('account_id', accountId);

    if (error) throw error;
  }
}

export const accountService = new AccountService();
