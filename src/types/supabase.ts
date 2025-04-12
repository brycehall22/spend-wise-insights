
import { PostgrestResponse } from '@supabase/supabase-js';
import { 
  DbAccount, 
  Account,
  DbCategory, 
  Category,
  DbTransaction, 
  Transaction,
  DbBudget, 
  Budget,
  DbSavingsGoal, 
  SavingsGoal 
} from './database.types';

// Helper type for mapping database types to application types
export type DbEntityMap = {
  accounts: {
    Row: DbAccount;
    Entity: Account;
  };
  categories: {
    Row: DbCategory;
    Entity: Category;
  };
  transactions: {
    Row: DbTransaction;
    Entity: Transaction;
  };
  budgets: {
    Row: DbBudget;
    Entity: Budget;
  };
  savings_goals: {
    Row: DbSavingsGoal;
    Entity: SavingsGoal;
  };
};

// Helper function to transform Supabase results
export function transformResponse<T extends keyof DbEntityMap>(
  table: T,
  response: PostgrestResponse<DbEntityMap[T]['Row']>
): DbEntityMap[T]['Entity'][] {
  if (response.error) throw new Error(response.error.message);
  return response.data as unknown as DbEntityMap[T]['Entity'][];
}

// Helper function to transform a single result
export function transformSingleResponse<T extends keyof DbEntityMap>(
  table: T,
  response: PostgrestResponse<DbEntityMap[T]['Row']>
): DbEntityMap[T]['Entity'] | null {
  if (response.error) throw new Error(response.error.message);
  return (response.data?.[0] as unknown as DbEntityMap[T]['Entity']) || null;
}
