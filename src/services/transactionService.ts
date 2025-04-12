
import { supabase } from "@/integrations/supabase/client";
import { transformResponse, transformSingleResponse } from "@/types/supabase";
import { Transaction } from "@/types/database.types";

interface TransactionFilter {
  startDate?: Date;
  endDate?: Date;
  categoryId?: string;
  accountId?: string;
  minAmount?: number;
  maxAmount?: number;
  searchTerm?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export async function getTransactions(filters: TransactionFilter = {}) {
  try {
    const { 
      startDate, 
      endDate, 
      categoryId, 
      accountId, 
      minAmount, 
      maxAmount,
      searchTerm,
      sortBy = 'transaction_date',
      sortDirection = 'desc',
      page = 1,
      pageSize = 10
    } = filters;

    const offset = (page - 1) * pageSize;
    
    let query = supabase
      .from('transactions')
      .select(`
        *,
        categories:category_id (name),
        accounts:account_id (account_name)
      `)
      .order(sortBy, { ascending: sortDirection === 'asc' })
      .limit(pageSize)
      .range(offset, offset + pageSize - 1);

    // Apply filters
    if (startDate) {
      query = query.gte('transaction_date', startDate.toISOString().split('T')[0]);
    }
    
    if (endDate) {
      query = query.lte('transaction_date', endDate.toISOString().split('T')[0]);
    }
    
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    
    if (accountId) {
      query = query.eq('account_id', accountId);
    }
    
    if (minAmount !== undefined) {
      query = query.gte('amount', minAmount);
    }
    
    if (maxAmount !== undefined) {
      query = query.lte('amount', maxAmount);
    }
    
    if (searchTerm) {
      query = query.or(`description.ilike.%${searchTerm}%,merchant.ilike.%${searchTerm}%`);
    }
    
    const { data, error, count } = await query;
    
    if (error) throw error;
    
    // Transform the data to include category and account names
    const transformedData: Transaction[] = data.map((transaction: any) => {
      return {
        ...transaction,
        category_name: transaction.categories?.name || null,
        account_name: transaction.accounts?.account_name || null
      };
    });
    
    return {
      transactions: transformedData,
      pagination: {
        page,
        pageSize,
        totalCount: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0
      }
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);
    throw error;
  }
}

export async function getTransaction(transactionId: string) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        categories:category_id (name),
        accounts:account_id (account_name)
      `)
      .eq('transaction_id', transactionId)
      .single();
    
    if (error) throw error;
    
    if (!data) return null;
    
    return {
      ...data,
      category_name: data.categories?.name || null,
      account_name: data.accounts?.account_name || null
    } as Transaction;
  } catch (error) {
    console.error('Error fetching transaction:', error);
    throw error;
  }
}

export async function createTransaction(transaction: Omit<Transaction, 'transaction_id' | 'created_at' | 'updated_at'>) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select();
    
    if (error) throw error;
    
    return data[0] as Transaction;
  } catch (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }
}

export async function updateTransaction(
  transactionId: string, 
  updates: Partial<Omit<Transaction, 'transaction_id' | 'created_at' | 'updated_at'>>
) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('transaction_id', transactionId)
      .select();
    
    if (error) throw error;
    
    return data[0] as Transaction;
  } catch (error) {
    console.error('Error updating transaction:', error);
    throw error;
  }
}

export async function deleteTransaction(transactionId: string) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('transaction_id', transactionId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting transaction:', error);
    throw error;
  }
}

export async function flagTransaction(transactionId: string, isFlagged: boolean) {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({ is_flagged: isFlagged })
      .eq('transaction_id', transactionId)
      .select();
    
    if (error) throw error;
    
    return data[0] as Transaction;
  } catch (error) {
    console.error('Error flagging transaction:', error);
    throw error;
  }
}

export async function batchUpdateTransactions(
  transactionIds: string[], 
  updates: Partial<Transaction>
) {
  // Not directly supported by Supabase, so we need to do it one by one
  try {
    const promises = transactionIds.map(id => 
      supabase
        .from('transactions')
        .update(updates)
        .eq('transaction_id', id)
    );
    
    await Promise.all(promises);
    
    return true;
  } catch (error) {
    console.error('Error batch updating transactions:', error);
    throw error;
  }
}

export async function batchDeleteTransactions(transactionIds: string[]) {
  try {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .in('transaction_id', transactionIds);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error batch deleting transactions:', error);
    throw error;
  }
}

export async function getTransactionStats() {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*');
    
    if (error) throw error;
    
    // Simple stats calculation - will be enhanced later
    const stats = {
      totalTransactions: transactions.length,
      totalIncome: transactions
        .filter(t => t.amount > 0)
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0),
      averageTransaction: transactions.length > 0 
        ? transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / transactions.length
        : 0
    };
    
    return stats;
  } catch (error) {
    console.error('Error fetching transaction stats:', error);
    throw error;
  }
}

export async function exportTransactions(filters: TransactionFilter = {}) {
  try {
    // Use existing function but remove pagination
    const { transactions } = await getTransactions({
      ...filters,
      page: 1,
      pageSize: 1000 // Get a larger batch for export
    });
    
    // Convert to CSV format
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Account', 'Status'];
    const csvRows = [
      headers.join(',')
    ];
    
    transactions.forEach(t => {
      const row = [
        t.transaction_date,
        `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
        t.amount,
        t.category_name || 'Uncategorized',
        t.account_name || 'Unknown Account',
        t.status
      ];
      csvRows.push(row.join(','));
    });
    
    return csvRows.join('\n');
  } catch (error) {
    console.error('Error exporting transactions:', error);
    throw error;
  }
}
