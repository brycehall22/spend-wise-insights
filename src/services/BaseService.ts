
import { supabase } from "@/integrations/supabase/client";

/**
 * Base service class with common functionality for all services
 */
export class BaseService {
  protected supabase = supabase;

  /**
   * Execute a function with authentication
   * Ensures the user is logged in before executing the function
   * @param fn Function to execute with the user ID
   * @returns The result of the function
   */
  protected async withAuth<T>(fn: (userId: string) => Promise<T>): Promise<T> {
    const { data: sessionData } = await this.supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to perform this operation');
    }
    
    return fn(userId);
  }

  /**
   * Get the current user ID from the session
   * @returns The user ID or null if not logged in
   */
  protected async getCurrentUserId(): Promise<string | null> {
    const { data: sessionData } = await this.supabase.auth.getSession();
    return sessionData.session?.user.id || null;
  }
}
