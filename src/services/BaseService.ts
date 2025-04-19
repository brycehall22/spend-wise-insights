
import { supabase } from "@/integrations/supabase/client";

export class BaseService {
  protected supabase = supabase;

  /**
   * Helper method to run operations that require authentication
   */
  protected async withAuth<T>(callback: (userId: string) => Promise<T>): Promise<T> {
    const { data: sessionData } = await this.supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (!userId) {
      throw new Error('User must be logged in to perform this operation');
    }
    
    return callback(userId);
  }
}
