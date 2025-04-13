
import { supabase } from "@/integrations/supabase/client";
import { SavingsGoal } from "@/types/database.types";

// Function to get all savings goals for a user
export const getSavingsGoals = async (): Promise<SavingsGoal[]> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch savings goals');
  }
  
  const { data, error } = await supabase
    .from('savings_goals')
    .select(`
      *,
      categories (name)
    `)
    .eq('user_id', userId)
    .order('target_date', { ascending: true });
  
  if (error) {
    throw error;
  }
  
  // Transform data to include progress percentage
  return (data || []).map(goal => {
    const progressPercentage = goal.target_amount > 0 
      ? (goal.current_amount / goal.target_amount) * 100
      : 0;
      
    return {
      ...goal,
      category_name: goal.categories?.name || null,
      progress_percentage: progressPercentage
    };
  });
};

// Function to get a specific savings goal
export const getSavingsGoal = async (goalId: string): Promise<SavingsGoal | null> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to fetch a savings goal');
  }
  
  const { data, error } = await supabase
    .from('savings_goals')
    .select(`
      *,
      categories (name)
    `)
    .eq('user_id', userId)
    .eq('goal_id', goalId)
    .single();
  
  if (error) {
    return null;
  }
  
  // Calculate progress percentage
  const progressPercentage = data.target_amount > 0 
    ? (data.current_amount / data.target_amount) * 100
    : 0;
    
  return {
    ...data,
    category_name: data.categories?.name || null,
    progress_percentage: progressPercentage
  };
};

// Function to create a new savings goal
export const createSavingsGoal = async (goalData: Partial<SavingsGoal>): Promise<SavingsGoal> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to create a savings goal');
  }
  
  // Validate required fields
  if (!goalData.name || !goalData.target_amount || !goalData.start_date || !goalData.target_date) {
    throw new Error('Name, target amount, start date, and target date are required');
  }
  
  const { data, error } = await supabase
    .from('savings_goals')
    .insert({
      user_id: userId,
      name: goalData.name,
      target_amount: goalData.target_amount,
      current_amount: goalData.current_amount || 0,
      start_date: goalData.start_date,
      target_date: goalData.target_date,
      category_id: goalData.category_id || null,
      is_completed: goalData.is_completed || false
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Function to update a savings goal
export const updateSavingsGoal = async (goalId: string, goalData: Partial<SavingsGoal>): Promise<SavingsGoal> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to update a savings goal');
  }
  
  // Create an update object with only valid fields
  const updateData: Record<string, any> = {};
  
  if (goalData.name !== undefined) updateData.name = goalData.name;
  if (goalData.target_amount !== undefined) updateData.target_amount = goalData.target_amount;
  if (goalData.current_amount !== undefined) updateData.current_amount = goalData.current_amount;
  if (goalData.start_date !== undefined) updateData.start_date = goalData.start_date;
  if (goalData.target_date !== undefined) updateData.target_date = goalData.target_date;
  if (goalData.category_id !== undefined) updateData.category_id = goalData.category_id;
  if (goalData.is_completed !== undefined) updateData.is_completed = goalData.is_completed;
  
  const { data, error } = await supabase
    .from('savings_goals')
    .update(updateData)
    .eq('user_id', userId)
    .eq('goal_id', goalId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
};

// Function to delete a savings goal
export const deleteSavingsGoal = async (goalId: string): Promise<void> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  
  if (!userId) {
    throw new Error('User must be logged in to delete a savings goal');
  }
  
  const { error } = await supabase
    .from('savings_goals')
    .delete()
    .eq('user_id', userId)
    .eq('goal_id', goalId);
  
  if (error) {
    throw error;
  }
};
