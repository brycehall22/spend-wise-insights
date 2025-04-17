
import { PostgrestError } from '@supabase/supabase-js';
import { toast } from "@/components/ui/use-toast";

export class SupabaseError extends Error {
  constructor(message: string, public originalError?: PostgrestError) {
    super(message);
    this.name = 'SupabaseError';
  }
}

export function handleSupabaseError(error: unknown): never {
  console.error('Supabase operation failed:', error);
  
  const message = error instanceof PostgrestError 
    ? `Database error: ${error.message}`
    : 'An unexpected error occurred';
    
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
  
  throw new SupabaseError(message, error as PostgrestError);
}

export async function withErrorHandling<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    return handleSupabaseError(error);
  }
}
