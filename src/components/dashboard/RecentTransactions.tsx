
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// Interface for transaction display
interface TransactionDisplay {
  id: string;
  date: string;
  description: string;
  merchant: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
}

export default function RecentTransactions() {
  // Fetch recent transactions
  const { data: transactions, isLoading, error } = useQuery({
    queryKey: ['recentTransactions'],
    queryFn: async (): Promise<TransactionDisplay[]> => {
      // Get the current user's ID
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user.id;
      
      if (!userId) {
        throw new Error('User must be logged in');
      }
      
      // Get the 5 most recent transactions
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          transaction_id,
          transaction_date,
          description,
          merchant,
          amount,
          categories (name, is_income)
        `)
        .eq('user_id', userId)
        .order('transaction_date', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      // Transform to display format
      return (data || []).map(transaction => ({
        id: transaction.transaction_id,
        date: transaction.transaction_date,
        description: transaction.description,
        merchant: transaction.merchant,
        amount: Math.abs(transaction.amount),
        type: transaction.categories?.is_income || transaction.amount > 0 ? 'income' : 'expense',
        category: transaction.categories?.name || 'Uncategorized'
      }));
    },
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="budget-card animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-spendwise-oxford">Recent Transactions</h2>
          <a href="/transactions" className="text-sm text-spendwise-orange hover:underline">View All</a>
        </div>

        <div className="divide-y">
          {[1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="py-3 flex justify-between items-center">
              <div className="flex items-center">
                <Skeleton className="h-8 w-8 rounded-full mr-3" />
                <div>
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="budget-card animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-spendwise-oxford">Recent Transactions</h2>
          <a href="/transactions" className="text-sm text-spendwise-orange hover:underline">View All</a>
        </div>
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p>Unable to load recent transactions.</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!transactions || transactions.length === 0) {
    return (
      <div className="budget-card animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-spendwise-oxford">Recent Transactions</h2>
          <a href="/transactions" className="text-sm text-spendwise-orange hover:underline">Add Transaction</a>
        </div>
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <p>No recent transactions</p>
          <p className="text-sm text-gray-400 mt-1">Add transactions to see them here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-spendwise-oxford">Recent Transactions</h2>
        <a href="/transactions" className="text-sm text-spendwise-orange hover:underline">View All</a>
      </div>

      <div className="divide-y">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className={`p-2 rounded-full mr-3 ${
                transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                {transaction.type === 'income' ? (
                  <ArrowUpRight size={16} className="text-green-600" />
                ) : (
                  <ArrowDownRight size={16} className="text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium truncate max-w-[160px] md:max-w-[200px]">{transaction.description}</p>
                <p className="text-xs text-gray-500">
                  {transaction.category} • {format(new Date(transaction.date), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <span className={`font-semibold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
