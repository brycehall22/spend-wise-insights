
import { supabase } from "@/integrations/supabase/client";
import { Category } from "@/types/database.types";
import { mapDbCategoryToCategory } from "@/types/supabase";

export const getCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  return data.map(mapDbCategoryToCategory);
};

export const getIncomeCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_income', true)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  return data.map(mapDbCategoryToCategory);
};

export const getExpenseCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_income', false)
    .order('name', { ascending: true });
  
  if (error) throw error;
  
  return data.map(mapDbCategoryToCategory);
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
  
  return mapDbCategoryToCategory(data);
};

export const createCategory = async (category: Omit<Category, 'category_id' | 'created_at' | 'updated_at'>): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert(category)
    .select()
    .single();
  
  if (error) throw error;
  
  return mapDbCategoryToCategory(data);
};

export const updateCategory = async (category: Partial<Category> & { category_id: string }): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('category_id', category.category_id)
    .select()
    .single();
  
  if (error) throw error;
  
  return mapDbCategoryToCategory(data);
};

export const deleteCategory = async (categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('category_id', categoryId);
  
  if (error) throw error;
};
