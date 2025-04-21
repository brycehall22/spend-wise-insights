
import { BaseService } from "../BaseService";
import { Budget } from "@/types/database.types";
import { format } from "date-fns";
import { toast } from "@/components/ui/use-toast";

export class BudgetService extends BaseService {
  async createBudget(budget: Pick<Budget, 'amount' | 'category_id' | 'month' | 'notes'>): Promise<Budget> {
    return this.withAuth(async (userId) => {
      // Validate required fields
      if (!budget.amount || !budget.category_id || !budget.month) {
        console.error("Budget creation error: Missing required fields", budget);
        throw new Error("Missing required budget fields");
      }

      console.log("Creating budget:", { ...budget, user_id: userId });

      const { data, error } = await this.supabase
        .from('budgets')
        .insert({
          ...budget,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        console.error("Budget creation error in service:", error);
        throw error;
      }
      
      console.log("Budget created successfully:", data);
      return data;
    });
  }

  async updateBudget(budgetId: string, updates: Partial<Pick<Budget, 'amount' | 'category_id' | 'notes' | 'month'>>): Promise<Budget> {
    return this.withAuth(async (userId) => {
      const { data, error } = await this.supabase
        .from('budgets')
        .update(updates)
        .eq('budget_id', budgetId)
        .eq('user_id', userId) // Ensure user can only update their own budgets
        .select()
        .single();

      if (error) {
        console.error("Budget update error in service:", error);
        throw error;
      }
      return data;
    });
  }

  async deleteBudget(budgetId: string): Promise<void> {
    return this.withAuth(async (userId) => {
      const { error } = await this.supabase
        .from('budgets')
        .delete()
        .eq('budget_id', budgetId)
        .eq('user_id', userId); // Ensure user can only delete their own budgets

      if (error) {
        console.error("Budget deletion error in service:", error);
        throw error;
      }
    });
  }

  async getBudgets(date: Date): Promise<Budget[]> {
    return this.withAuth(async (userId) => {
      // Format the month as YYYY-MM-DD (first day of month)
      const monthFormatted = format(date, 'yyyy-MM-dd');
      
      console.log("Fetching budgets for month:", monthFormatted);
      
      // Get all budgets for the month
      const { data: budgets, error: budgetError } = await this.supabase
        .from('budgets')
        .select(`
          *,
          categories (name)
        `)
        .eq('user_id', userId)
        .eq('month', monthFormatted);
      
      if (budgetError) {
        console.error("Budget fetch error in service:", budgetError);
        throw budgetError;
      }
      
      // Calculate how much spent for each budget
      // First, get the start and end date for the month
      const startDate = format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
      const endDate = format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd');
      
      // Get transactions for the month
      const { data: transactions, error: transactionError } = await this.supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('user_id', userId)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .lt('amount', 0); // Only expenses
      
      if (transactionError) {
        console.error("Transaction fetch error in service:", transactionError);
        throw transactionError;
      }
      
      // Calculate spending by category
      const spendingByCategory = new Map<string, number>();
      transactions?.forEach(transaction => {
        const categoryId = transaction.category_id || 'uncategorized';
        const amount = Math.abs(transaction.amount);
        
        if (spendingByCategory.has(categoryId)) {
          spendingByCategory.set(categoryId, spendingByCategory.get(categoryId)! + amount);
        } else {
          spendingByCategory.set(categoryId, amount);
        }
      });
      
      // Add spending data to budgets
      const budgetsWithSpending: Budget[] = (budgets || []).map(budget => {
        const categoryId = budget.category_id || 'uncategorized';
        const spent = spendingByCategory.get(categoryId) || 0;
        
        return {
          ...budget,
          category_name: budget.categories?.name || 'Uncategorized',
          spent
        };
      });
      
      return budgetsWithSpending;
    });
  }
}

export const budgetService = new BudgetService();
