
import { useState } from "react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getCategories } from "@/services/categoryService";
import { getAccounts } from "@/services/accountService";
import { createTransaction } from "@/services/transaction";
import { useToast } from "@/hooks/use-toast";

export default function QuickAddTransaction() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query categories and accounts
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccounts(),
  });

  const handleTransactionAdded = async (transactionData: any) => {
    try {
      const { amount, description, date: transaction_date, account_id, category_id, notes, type } = transactionData;
      
      // Adjust amount based on transaction type (negative for expense, positive for income)
      const adjustedAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
      
      // Create the transaction in the database
      const transaction = await createTransaction({
        account_id,
        category_id: category_id || null,
        amount: adjustedAmount,
        description,
        merchant: description, // Default to description for merchant
        transaction_date: transaction_date.toISOString().split('T')[0],
        currency: 'USD', // Default currency
        status: 'cleared'
      });
      
      // Show success toast
      toast({
        title: "Transaction added",
        description: `${type === 'expense' ? 'Expense' : 'Income'} of $${Math.abs(adjustedAmount)} added successfully`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['recentTransactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactionStats'] });
      queryClient.invalidateQueries({ queryKey: ['accountBalances'] });
      
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast({
        variant: "destructive",
        title: "Failed to add transaction",
        description: "An error occurred while adding the transaction. Please try again.",
      });
    }
  };

  return (
    <>
      <Button 
        className="bg-spendwise-orange hover:bg-spendwise-orange/90 text-white flex items-center gap-1"
        onClick={() => setIsDialogOpen(true)}
      >
        <Plus size={16} /> Add Transaction
      </Button>
      
      <AddTransactionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onAddTransaction={handleTransactionAdded}
        onTransactionAdded={handleTransactionAdded}
        accounts={accounts || []}
        categories={categories || []}
      />
    </>
  );
}
