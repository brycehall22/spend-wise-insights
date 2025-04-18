
import { useState } from "react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "@/services/categoryService";
import { getAccounts } from "@/services/accountService";

export default function QuickAddTransaction() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Query categories and accounts
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => getAccounts(),
  });

  const handleTransactionAdded = (transactionData: any) => {
    console.log("Adding transaction:", transactionData);
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
