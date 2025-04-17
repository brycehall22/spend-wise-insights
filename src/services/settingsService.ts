
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { handleError } from "@/lib/utils";

// Function to get the current user profile
export const getUserProfile = async (): Promise<User | null> => {
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      throw sessionError;
    }
    
    if (!sessionData.session) {
      return null;
    }
    
    return sessionData.session.user;
  } catch (error) {
    handleError(error, "Failed to fetch user profile");
    return null;
  }
};

// Function to update user password
export const updatePassword = async (password: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      password
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    handleError(error, "Failed to update password");
    throw error;
  }
};

// Function to update user email
export const updateEmail = async (email: string): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      email
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    handleError(error, "Failed to update email");
    throw error;
  }
};

// Function to update user profile data
export const updateUserProfile = async (data: any): Promise<void> => {
  try {
    const { error } = await supabase.auth.updateUser({
      data
    });
    
    if (error) {
      throw error;
    }
  } catch (error) {
    handleError(error, "Failed to update user profile");
    throw error;
  }
};

// Function to sign out user
export const signOut = async (): Promise<void> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  } catch (error) {
    handleError(error, "Failed to sign out");
    throw error;
  }
};
