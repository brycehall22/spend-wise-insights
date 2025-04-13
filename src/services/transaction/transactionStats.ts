
import { supabase } from "@/integrations/supabase/client";
import { FinancialSummary } from "@/types/database.types";

export const getTransactionStats = async (startDate?: string, endDate?: string): Promise<FinancialSummary> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch transaction statistics');
  }
  
  // Set default date range to current month if not provided
  const currentDate = new Date();
  const defaultStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
  const defaultEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString();
  
  const start = startDate || defaultStartDate;
  const end = endDate || defaultEndDate;
  
  // Fetch transactions for the period
  const { data, error } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .gte('transaction_date', start)
    .lte('transaction_date', end);
  
  if (error) throw error;
  
  // Calculate stats
  const transactions = data || [];
  const totalTransactions = transactions.length;
  
  let totalIncome = 0;
  let totalExpenses = 0;
  
  transactions.forEach(t => {
    if (t.amount > 0) {
      totalIncome += t.amount;
    } else {
      totalExpenses += Math.abs(t.amount);
    }
  });
  
  const averageTransaction = totalTransactions > 0 
    ? (totalIncome + totalExpenses) / totalTransactions 
    : 0;
  
  return {
    totalTransactions,
    totalIncome,
    totalExpenses,
    averageTransaction,
    income: totalIncome,
    expenses: totalExpenses
  };
};
