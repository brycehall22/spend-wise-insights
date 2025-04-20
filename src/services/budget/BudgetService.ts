
import { BaseService } from "../BaseService";
import { Budget } from "@/types/database.types";
import { format } from "date-fns";

export class BudgetService extends BaseService {
  async createBudget(budget: Pick<Budget, 'amount' | 'category_id' | 'month' | 'notes'>): Promise<Budget> {
    return this.withAuth(async (userId) => {
      const { data, error } = await this.supabase
        .from('budgets')
        .insert({
          ...budget,
          user_id: userId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    });
  }

  async updateBudget(budgetId: string, updates: Partial<Pick<Budget, 'amount' | 'category_id' | 'notes'>>): Promise<Budget> {
    const { data, error } = await this.supabase
      .from('budgets')
      .update(updates)
      .eq('budget_id', budgetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteBudget(budgetId: string): Promise<void> {
    const { error } = await this.supabase
      .from('budgets')
      .delete()
      .eq('budget_id', budgetId);

    if (error) throw error;
  }
}

export const budgetService = new BudgetService();
