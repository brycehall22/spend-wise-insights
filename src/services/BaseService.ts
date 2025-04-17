
import { supabase } from "@/integrations/supabase/client";
import { withErrorHandling } from "@/utils/supabaseHelpers";

export class BaseService {
  protected supabase = supabase;
  
  protected async getCurrentUserId(): Promise<string> {
    const { data: { session } } = await this.supabase.auth.getSession();
    const userId = session?.user?.id;
    
    if (!userId) {
      throw new Error('User must be logged in');
    }
    
    return userId;
  }
  
  protected async withAuth<T>(operation: (userId: string) => Promise<T>): Promise<T> {
    return withErrorHandling(async () => {
      const userId = await this.getCurrentUserId();
      return operation(userId);
    });
  }
}
