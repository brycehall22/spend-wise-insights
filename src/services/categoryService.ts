
import { supabase } from "@/integrations/supabase/client";
import { transformResponse, transformSingleResponse } from "@/types/supabase";
import { Category } from "@/types/database.types";

export async function getCategories(includeIncome: boolean = true) {
  try {
    let query = supabase
      .from('categories')
      .select('*');
      
    if (!includeIncome) {
      query = query.eq('is_income', false);
    }
    
    const response = await query.order('name');
    return transformResponse('categories', response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
}

export async function getIncomeCategories() {
  try {
    const response = await supabase
      .from('categories')
      .select('*')
      .eq('is_income', true)
      .order('name');
    
    return transformResponse('categories', response);
  } catch (error) {
    console.error('Error fetching income categories:', error);
    throw error;
  }
}

export async function getExpenseCategories() {
  try {
    const response = await supabase
      .from('categories')
      .select('*')
      .eq('is_income', false)
      .order('name');
    
    return transformResponse('categories', response);
  } catch (error) {
    console.error('Error fetching expense categories:', error);
    throw error;
  }
}

export async function getCategory(categoryId: string) {
  try {
    const response = await supabase
      .from('categories')
      .select('*')
      .eq('category_id', categoryId)
      .single();
    
    return transformSingleResponse('categories', response);
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
}

export async function createCategory(category: Omit<Category, "category_id" | "created_at" | "updated_at">) {
  try {
    // Get the user's ID from the current session
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Make sure user_id is included in the category
    const categoryWithUserId = {
      ...category,
      user_id: user.id
    };
    
    const response = await supabase
      .from('categories')
      .insert(categoryWithUserId)
      .select();
    
    return transformSingleResponse('categories', response);
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function updateCategory(categoryId: string, updates: Partial<Category>) {
  try {
    const response = await supabase
      .from('categories')
      .update(updates)
      .eq('category_id', categoryId)
      .select();
    
    return transformSingleResponse('categories', response);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('category_id', categoryId);
    
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

export async function getCategoryWithTransactionCount(categoryId: string) {
  try {
    // First get the category
    const category = await getCategory(categoryId);
    
    if (!category) {
      return null;
    }
    
    // Count transactions with this category
    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .eq('category_id', categoryId);
    
    if (error) throw error;
    
    return { 
      ...category, 
      transactionCount: count || 0 
    };
  } catch (error) {
    console.error('Error fetching category with transaction count:', error);
    throw error;
  }
}

export async function getTransactionCountsByCategory() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        category_id,
        categories:category_id (name)
      `);
    
    if (error) throw error;
    
    // Count transactions by category
    const counts: Record<string, { 
      category_id: string, 
      name: string, 
      count: number 
    }> = {};
    
    data.forEach((transaction: any) => {
      const categoryId = transaction.category_id || 'uncategorized';
      const name = transaction.categories?.name || 'Uncategorized';
      
      if (!counts[categoryId]) {
        counts[categoryId] = {
          category_id: categoryId,
          name,
          count: 0
        };
      }
      
      counts[categoryId].count++;
    });
    
    return Object.values(counts);
  } catch (error) {
    console.error('Error fetching transaction counts by category:', error);
    throw error;
  }
}
