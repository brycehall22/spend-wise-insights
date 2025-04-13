
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Function to get the current user profile
export const getUserProfile = async (): Promise<User | null> => {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
  if (sessionError) {
    throw sessionError;
  }
  
  if (!sessionData.session) {
    return null;
  }
  
  return sessionData.session.user;
};

// Function to update user password
export const updatePassword = async (password: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    password
  });
  
  if (error) {
    throw error;
  }
};

// Function to update user email
export const updateEmail = async (email: string): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    email
  });
  
  if (error) {
    throw error;
  }
};

// Function to update user profile data
export const updateUserProfile = async (data: any): Promise<void> => {
  const { error } = await supabase.auth.updateUser({
    data
  });
  
  if (error) {
    throw error;
  }
};

// Function to sign out user
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};
