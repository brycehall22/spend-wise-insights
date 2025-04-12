
import { supabase } from "@/integrations/supabase/client";
import { Category, DbCategory } from "@/types/database.types";
import { transformResponse, transformSingleCategoryResponse } from "@/types/supabase";

export const getCategories = async (includeIncome: boolean = true): Promise<DbCategory[]> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch categories');
  }
  
  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId);
  
  if (!includeIncome) {
    query = query.eq('is_income', false);
  }
    
  const { data, error } = await query.order('name', { ascending: true });
  
  if (error) throw error;
  
  return data;
};

export const getCategoryById = async (categoryId: string): Promise<Category | null> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('category_id', categoryId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw error;
  }
  
  return data;
};

export const createCategory = async (category: Omit<Category, "category_id" | "created_at" | "updated_at">): Promise<Category> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to create a category');
  }
  
  // Ensure user_id is set
  const categoryWithUserId = {
    ...category,
    user_id: userId
  };
  
  const { data, error } = await supabase
    .from('categories')
    .insert(categoryWithUserId)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

export const updateCategory = async (category: Partial<Category> & { category_id: string }): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('category_id', category.category_id)
    .select()
    .single();
  
  if (error) throw error;
  
  return data;
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('category_id', categoryId);
  
  if (error) throw error;
};

export const getCategoryStats = async (): Promise<{ name: string; amount: number }[]> => {
  // Get the current user's ID from the session
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch category statistics');
  }
  
  // This is a simplified example - in a real app you might want to use a more complex query
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      amount,
      categories (name, category_id)
    `)
    .eq('user_id', userId)
    .eq('categories.is_income', false)
    .gte('transaction_date', new Date(new Date().setDate(1)).toISOString())
    .lt('transaction_date', new Date(new Date().setMonth(new Date().getMonth() + 1, 0)).toISOString());
  
  if (error) throw error;
  
  // Process the data to group by category
  const categoryStats: Record<string, { name: string; amount: number }> = {};
  
  data.forEach((transaction: any) => {
    if (transaction.categories) {
      const categoryId = transaction.categories.category_id;
      const categoryName = transaction.categories.name;
      const amount = Math.abs(transaction.amount);
      
      if (!categoryStats[categoryId]) {
        categoryStats[categoryId] = { name: categoryName, amount: 0 };
      }
      
      categoryStats[categoryId].amount += amount;
    }
  });
  
  return Object.values(categoryStats);
};
