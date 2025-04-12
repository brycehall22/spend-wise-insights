
import { Database } from '@/integrations/supabase/types';
import { Account, Category, Transaction } from '@/types/database.types';

// Type aliases from the generated Supabase types
export type DbAccount = Database['public']['Tables']['accounts']['Row'];
export type DbCategory = Database['public']['Tables']['categories']['Row'];
export type DbTransaction = Database['public']['Tables']['transactions']['Row'];
export type DbBudget = Database['public']['Tables']['budgets']['Row'];
export type DbSavingsGoal = Database['public']['Tables']['savings_goals']['Row'];

// Helper function to convert database types to frontend types
export const mapDbAccountToAccount = (dbAccount: DbAccount): Account => ({
  account_id: dbAccount.account_id,
  user_id: dbAccount.user_id,
  account_name: dbAccount.account_name,
  account_type: dbAccount.account_type,
  balance: Number(dbAccount.balance),
  currency: dbAccount.currency,
  is_active: dbAccount.is_active,
  created_at: dbAccount.created_at,
  updated_at: dbAccount.updated_at,
});

export const mapDbCategoryToCategory = (dbCategory: DbCategory): Category => ({
  category_id: dbCategory.category_id,
  user_id: dbCategory.user_id,
  name: dbCategory.name,
  parent_category_id: dbCategory.parent_category_id,
  color: dbCategory.color || undefined,
  icon: dbCategory.icon || undefined,
  is_income: dbCategory.is_income,
  created_at: dbCategory.created_at,
  updated_at: dbCategory.updated_at,
});

export const mapDbTransactionToTransaction = (dbTransaction: DbTransaction): Transaction => ({
  transaction_id: dbTransaction.transaction_id,
  user_id: dbTransaction.user_id,
  account_id: dbTransaction.account_id,
  category_id: dbTransaction.category_id,
  amount: Number(dbTransaction.amount),
  currency: dbTransaction.currency,
  transaction_date: dbTransaction.transaction_date,
  description: dbTransaction.description,
  merchant: dbTransaction.merchant,
  status: dbTransaction.status as 'cleared' | 'pending',
  created_at: dbTransaction.created_at,
  updated_at: dbTransaction.updated_at,
});
