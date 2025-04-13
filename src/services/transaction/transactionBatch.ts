
import { supabase } from "@/integrations/supabase/client";
import { Transaction, DbTransaction } from "@/types/database.types";

export const batchDeleteTransactions = async (transactionIds: string[]): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const batchUpdateCategory = async (transactionIds: string[], categoryId: string | null): Promise<void> => {
  const { error } = await supabase
    .from('transactions')
    .update({ category_id: categoryId })
    .in('transaction_id', transactionIds);
  
  if (error) throw error;
};

export const flagTransaction = async (transactionId: string, isFlagged: boolean): Promise<Transaction> => {
  // Use the supabase typescript schema from Database defined in types.ts
  const { data, error } = await supabase
    .from('transactions')
    .update({ is_flagged: isFlagged } as Partial<DbTransaction>)
    .eq('transaction_id', transactionId)
    .select()
    .single();
  
  if (error) throw error;
  
  // Use type assertion to ensure proper typing
  const item = data as any;
  return {
    ...item,
    is_flagged: item.is_flagged ?? false
  } as Transaction;
};
