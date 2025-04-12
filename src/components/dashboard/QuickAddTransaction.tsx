
import { useState } from "react";
import { AddTransactionDialog } from "@/components/transactions/AddTransactionDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

// Mock data for accounts and categories
const mockAccounts = [
  { account_id: "acc1", account_name: "Checking Account" },
  { account_id: "acc2", account_name: "Savings Account" },
  { account_id: "acc3", account_name: "Credit Card" },
];

const mockCategories = [
  { category_id: "cat1", name: "Groceries", is_income: false },
  { category_id: "cat2", name: "Dining Out", is_income: false },
  { category_id: "cat3", name: "Transportation", is_income: false },
  { category_id: "cat4", name: "Utilities", is_income: false },
  { category_id: "cat5", name: "Housing", is_income: false },
  { category_id: "cat6", name: "Salary", is_income: true },
  { category_id: "cat7", name: "Freelance", is_income: true },
  { category_id: "cat8", name: "Investments", is_income: true },
];

export default function QuickAddTransaction() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddTransaction = (transactionData: any) => {
    console.log("Adding transaction:", transactionData);
    // In a real app, you would dispatch this to Redux or make an API call
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
        onAddTransaction={handleAddTransaction}
        onTransactionAdded={handleAddTransaction}
        accounts={mockAccounts}
        categories={mockCategories}
      />
    </>
  );
}
