
import { supabase } from "@/integrations/supabase/client";
import { TransactionFilter } from "@/types/database.types";

export const exportTransactions = async (format: 'csv' | 'json', filters: TransactionFilter = {}): Promise<string> => {
  // Get all transactions (no pagination)
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to export transactions');
  }
  
  // Build query with filters but no pagination
  let query = supabase
    .from('transactions')
    .select(`
      *,
      categories (name),
      accounts (account_name, currency)
    `)
    .eq('user_id', userId);

  // Apply filters
  if (filters.startDate) {
    query = query.gte('transaction_date', filters.startDate);
  }
  if (filters.endDate) {
    query = query.lte('transaction_date', filters.endDate);
  }
  if (filters.categoryId) {
    query = query.eq('category_id', filters.categoryId);
  }
  if (filters.accountId) {
    query = query.eq('account_id', filters.accountId);
  }
  if (filters.minAmount !== undefined) {
    query = query.gte('amount', filters.minAmount);
  }
  if (filters.maxAmount !== undefined) {
    query = query.lte('amount', filters.maxAmount);
  }
  if (filters.searchTerm) {
    query = query.or(`description.ilike.%${filters.searchTerm}%,merchant.ilike.%${filters.searchTerm}%`);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.isFlagged !== undefined) {
    query = query.eq('is_flagged', filters.isFlagged);
  }
  
  // Execute query
  const { data, error } = await query;
  
  if (error) throw error;
  
  // Transform data to a simpler format to avoid deep recursion
  const transactions: Array<Record<string, any>> = [];
  
  if (data) {
    for (const item of data) {
      // Use a simple spread with explicit typing to avoid deep recursion
      const transaction = {
        id: item.transaction_id,
        date: item.transaction_date,
        description: item.description,
        merchant: item.merchant,
        amount: item.amount,
        currency: item.currency,
        category: item.categories?.name || 'Uncategorized',
        account: item.accounts?.account_name || 'Unknown',
        status: item.status,
        is_flagged: item.is_flagged ?? false
      };
      
      transactions.push(transaction);
    }
  }
  
  // Format based on export type
  if (format === 'json') {
    return JSON.stringify(transactions, null, 2);
  } else {
    // CSV format
    if (transactions.length === 0) {
      return 'id,date,description,merchant,amount,currency,category,account,status,is_flagged';
    }
    
    const headers = Object.keys(transactions[0]).join(',');
    const rows = transactions.map(t => 
      Object.values(t)
        .map(v => typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v)
        .join(',')
    );
    
    return [headers, ...rows].join('\n');
  }
};
