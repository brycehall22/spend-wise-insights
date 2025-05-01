export type DbAccount = {
  account_id: string;
  user_id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Account = DbAccount;

export type DbCategory = {
  category_id: string;
  user_id: string;
  name: string;
  is_income: boolean;
  parent_category_id?: string | null;
  color?: string | null;
  icon?: string | null;
  created_at: string;
  updated_at: string;
};

export type Category = {
  category_id: string;
  user_id: string;
  name: string;
  is_income: boolean;
  parent_category_id?: string | null;
  color: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
};

export type DbTransaction = {
  transaction_id: string;
  user_id: string;
  account_id: string;
  category_id?: string | null;
  amount: number;
  currency: string;
  description: string;
  merchant: string;
  transaction_date: string;
  status: string;
  is_flagged?: boolean;
  created_at: string;
  updated_at: string;
};

export type Transaction = DbTransaction & {
  category_name?: string;
  account_name?: string;
};

// Define the shape of the joined table data returned from Supabase
export interface DbTransactionWithRelations {
  transaction_id: string;
  user_id: string;
  account_id: string;
  category_id?: string | null;
  amount: number;
  currency: string;
  description: string;
  merchant: string;
  transaction_date: string;
  status: string;
  is_flagged?: boolean;
  created_at: string;
  updated_at: string;
  
  categories?: { name: string } | null;
  accounts?: { account_name: string; currency: string } | null;
}

export type DbBudget = {
  budget_id: string;
  user_id: string;
  category_id?: string | null;
  amount: number;
  month: string;
  created_at: string;
  updated_at: string;
};

export type Budget = DbBudget & {
  category_name?: string;
  spent?: number;
};

export type DbSavingsGoal = {
  goal_id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  start_date: string;
  target_date: string;
  category_id?: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type SavingsGoal = DbSavingsGoal & {
  category_name?: string;
  progress_percentage?: number;
};

// New Subscription types
export type DbSubscription = {
  subscription_id: string;
  user_id: string;
  name: string;
  amount: number;
  billing_cycle: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  next_payment: string;
  is_active: boolean;
  category_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type Subscription = DbSubscription & {
  category_name?: string;
};

// Transaction filter types
export interface TransactionFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  status?: string;
  isFlagged?: boolean;
}

// Financial summary types
export interface FinancialSummary {
  totalTransactions: number;
  totalIncome: number;
  totalExpenses: number;
  averageTransaction: number;
  income: number;
  expenses: number;
}