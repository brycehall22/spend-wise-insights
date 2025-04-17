
import { BaseService } from "@/services/BaseService";
import { Transaction, TransactionFilter } from "@/types/database.types";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

interface PaginationResult {
  totalCount: number;
  totalPages: number;
}

interface TransactionsResponse {
  transactions: Transaction[];
  pagination: PaginationResult;
}

export class TransactionService extends BaseService {
  async getTransactions(
    page: number = 1,
    pageSize: number = 10,
    filters: TransactionFilter = {},
    sortBy: string = 'transaction_date',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Promise<TransactionsResponse> {
    return this.withAuth(async (userId) => {
      const offset = (page - 1) * pageSize;
      
      let query: PostgrestFilterBuilder<any, any, any> = this.supabase
        .from('transactions')
        .select(`
          *,
          categories (name),
          accounts (account_name, currency)
        `, { count: 'exact' })
        .eq('user_id', userId);
      
      // Apply filters
      if (filters.startDate) query = query.gte('transaction_date', filters.startDate);
      if (filters.endDate) query = query.lte('transaction_date', filters.endDate);
      if (filters.categoryId) query = query.eq('category_id', filters.categoryId);
      if (filters.accountId) query = query.eq('account_id', filters.accountId);
      if (filters.minAmount !== undefined) query = query.gte('amount', filters.minAmount);
      if (filters.maxAmount !== undefined) query = query.lte('amount', filters.maxAmount);
      if (filters.searchTerm) {
        query = query.or(`description.ilike.%${filters.searchTerm}%,merchant.ilike.%${filters.searchTerm}%`);
      }
      if (filters.status) query = query.eq('status', filters.status);
      if (filters.isFlagged !== undefined) query = query.eq('is_flagged', filters.isFlagged);
      
      // Apply sorting and pagination
      const dbSortBy = sortBy === 'date' ? 'transaction_date' : sortBy;
      query = query
        .order(dbSortBy, { ascending: sortOrder === 'asc' })
        .range(offset, offset + pageSize - 1);
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      const transactions = (data || []).map((item: any): Transaction => ({
        transaction_id: item.transaction_id,
        user_id: item.user_id,
        account_id: item.account_id,
        category_id: item.category_id,
        amount: item.amount,
        currency: item.currency || item.accounts?.currency || '',
        description: item.description,
        merchant: item.merchant,
        transaction_date: item.transaction_date,
        status: item.status,
        is_flagged: item.is_flagged ?? false,
        created_at: item.created_at,
        updated_at: item.updated_at,
        category_name: item.categories?.name,
        account_name: item.accounts?.account_name
      }));
      
      return {
        transactions,
        pagination: {
          totalCount: count || 0,
          totalPages: Math.ceil((count || 0) / pageSize)
        }
      };
    });
  }
}

// Create a singleton instance
export const transactionService = new TransactionService();
