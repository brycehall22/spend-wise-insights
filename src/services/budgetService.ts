
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Budget } from "@/types/database.types";

class BudgetService {
  /**
   * Get budgets for a specific month
   */
  async getBudgets(date: Date): Promise<Budget[]> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        throw new Error('User must be logged in to fetch budgets');
      }
      
      // Format the month as YYYY-MM-DD (first day of month)
      const monthFormatted = format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
      console.log("Fetching budgets for month:", monthFormatted);
      
      // Get all budgets for the month
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          *,
          categories (name)
        `)
        .eq('user_id', userId)
        .eq('month', monthFormatted);
      
      if (budgetError) {
        console.error("Budget fetch error:", budgetError);
        throw budgetError;
      }
      
      const startDate = format(new Date(date.getFullYear(), date.getMonth(), 1), 'yyyy-MM-dd');
      const endDate = format(new Date(date.getFullYear(), date.getMonth() + 1, 0), 'yyyy-MM-dd');
      
      // Get transactions for the month
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('amount, category_id')
        .eq('user_id', userId)
        .gte('transaction_date', startDate)
        .lte('transaction_date', endDate)
        .lt('amount', 0); // Only expenses
      
      if (transactionError) {
        console.error("Transaction fetch error:", transactionError);
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
      
      console.log("Budgets before processing:", budgets);
      
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
      
      console.log("Processed budgets:", budgetsWithSpending);
      return budgetsWithSpending;
    } catch (error) {
      console.error("Error in getBudgets:", error);
      return [];
    }
  }

  /**
   * Get budget summary for a month
   */
  async getBudgetSummary(monthStr: string): Promise<{
    totalBudget: number;
    totalSpent: number;
    remainingBudget: number;
  }> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to fetch budget summary');
    }
    
    // Parse the month string to Date
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    
    // Get budgets for the month
    const budgets = await this.getBudgets(date);
    
    // Calculate totals
    let totalBudget = 0;
    let totalSpent = 0;
    
    budgets.forEach(budget => {
      totalBudget += budget.amount;
      totalSpent += budget.spent || 0;
    });
    
    // Calculate remaining budget
    const remainingBudget = totalBudget - totalSpent;
    
    return {
      totalBudget,
      totalSpent,
      remainingBudget
    };
  }

  /**
   * Create a new budget
   */
  async createBudget(budgetData: Partial<Budget>): Promise<Budget> {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        throw new Error('User must be logged in to create a budget');
      }
      
      // Ensure all required fields are present
      if (!budgetData.amount || !budgetData.month) {
        throw new Error('Budget amount and month are required');
      }
      
      console.log("Creating budget:", { ...budgetData, user_id: userId });
      
      const { data, error } = await supabase
        .from('budgets')
        .insert({
          user_id: userId,
          amount: budgetData.amount,
          month: budgetData.month,
          category_id: budgetData.category_id || null,
          notes: budgetData.notes || null,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Budget creation error:", error);
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error("Error in createBudget:", error);
      throw error;
    }
  }

  /**
   * Update an existing budget
   */
  async updateBudget(budgetId: string, budgetData: Partial<Budget>): Promise<Budget> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to update a budget');
    }
    
    // Create an update object with only valid fields
    const updateData: Record<string, any> = {};
    
    if (budgetData.amount !== undefined) updateData.amount = budgetData.amount;
    if (budgetData.category_id !== undefined) updateData.category_id = budgetData.category_id;
    if (budgetData.month !== undefined) updateData.month = budgetData.month;
    if (budgetData.notes !== undefined) updateData.notes = budgetData.notes;
    
    const { data, error } = await supabase
      .from('budgets')
      .update(updateData)
      .eq('user_id', userId)
      .eq('budget_id', budgetId)
      .select()
      .single();
    
    if (error) {
      console.error("Budget update error:", error);
      throw error;
    }
    
    return data;
  }

  /**
   * Delete a budget
   */
  async deleteBudget(budgetId: string): Promise<void> {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to delete a budget');
    }
    
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('user_id', userId)
      .eq('budget_id', budgetId);
    
    if (error) {
      console.error("Budget deletion error:", error);
      throw error;
    }
  }
}

// Export a singleton instance of the budget service
export const budgetService = new BudgetService();

// For backward compatibility, also export the individual functions
export const getBudgets = (date: Date) => budgetService.getBudgets(date);
export const getBudgetSummary = (monthStr: string) => budgetService.getBudgetSummary(monthStr);
export const createBudget = (budgetData: Partial<Budget>) => budgetService.createBudget(budgetData);
export const updateBudget = (budgetId: string, budgetData: Partial<Budget>) => budgetService.updateBudget(budgetId, budgetData);
export const deleteBudget = (budgetId: string) => budgetService.deleteBudget(budgetId);
