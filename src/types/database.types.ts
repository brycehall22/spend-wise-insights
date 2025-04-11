
export interface Transaction {
  transaction_id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  currency: string;
  transaction_date: string;
  description: string;
  merchant: string;
  status: 'cleared' | 'pending';
  created_at?: string;
  updated_at?: string;
}

export interface Account {
  account_id: string;
  user_id: string;
  account_name: string;
  account_type: string;
  balance: number;
  currency: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Category {
  category_id: string;
  user_id?: string;
  name: string;
  parent_category_id: string | null;
  color?: string;
  icon?: string;
  is_income: boolean;
  created_at?: string;
  updated_at?: string;
}
