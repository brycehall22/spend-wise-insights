
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

// Transaction event for calendar
export interface TransactionEvent {
  id: string;
  title: string;
  date: Date;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  merchant: string;
}

// Function to get transactions for a specific month
export const getTransactionsByMonth = async (month: Date): Promise<TransactionEvent[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch transaction events');
  }
  
  // Calculate start and end of month
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  
  // Format dates for query
  const startDateStr = format(startDate, 'yyyy-MM-dd');
  const endDateStr = format(endDate, 'yyyy-MM-dd');
  
  // Get transactions for the month
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      transaction_id,
      transaction_date,
      description,
      merchant,
      amount,
      categories (name, is_income)
    `)
    .eq('user_id', userId)
    .gte('transaction_date', startDateStr)
    .lte('transaction_date', endDateStr);
  
  if (error) {
    throw error;
  }
  
  // Transform to calendar events
  return (data || []).map(transaction => ({
    id: transaction.transaction_id,
    title: transaction.description,
    date: new Date(transaction.transaction_date),
    amount: Math.abs(transaction.amount),
    type: transaction.categories?.is_income || transaction.amount > 0 ? 'income' : 'expense',
    category: transaction.categories?.name || 'Uncategorized',
    merchant: transaction.merchant
  }));
};

// Function to get transactions for a specific date
export const getTransactionsByDate = async (date: Date): Promise<TransactionEvent[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch transaction events');
  }
  
  // Format date for query
  const dateStr = format(date, 'yyyy-MM-dd');
  
  // Get transactions for the date
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      transaction_id,
      transaction_date,
      description,
      merchant,
      amount,
      categories (name, is_income)
    `)
    .eq('user_id', userId)
    .eq('transaction_date', dateStr);
  
  if (error) {
    throw error;
  }
  
  // Transform to calendar events
  return (data || []).map(transaction => ({
    id: transaction.transaction_id,
    title: transaction.description,
    date: new Date(transaction.transaction_date),
    amount: Math.abs(transaction.amount),
    type: transaction.categories?.is_income || transaction.amount > 0 ? 'income' : 'expense',
    category: transaction.categories?.name || 'Uncategorized',
    merchant: transaction.merchant
  }));
};
