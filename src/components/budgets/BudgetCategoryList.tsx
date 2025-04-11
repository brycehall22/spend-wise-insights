
import React, { useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ChevronDown, ChevronUp, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";

type BudgetCategory = {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
  color: string;
  transactions?: Transaction[];
};

type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
};

type BudgetCategoryListProps = {
  month: Date;
  type: 'income' | 'expense';
};

export default function BudgetCategoryList({ month, type }: BudgetCategoryListProps) {
  // These would be fetched from the database in a real implementation
  const budgetCategories: BudgetCategory[] = [
    {
      id: '1',
      name: 'Housing',
      budgeted: 1500,
      spent: 1500,
      color: '#4CAF50',
      transactions: [
        { id: 't1', date: '2023-04-01', description: 'Rent', amount: 1400 },
        { id: 't2', date: '2023-04-05', description: 'Utilities', amount: 100 },
      ]
    },
    {
      id: '2',
      name: 'Groceries',
      budgeted: 600,
      spent: 520,
      color: '#2196F3',
      transactions: [
        { id: 't3', date: '2023-04-02', description: 'Supermarket', amount: 120 },
        { id: 't4', date: '2023-04-09', description: 'Farmers Market', amount: 80 },
        { id: 't5', date: '2023-04-16', description: 'Grocery Store', amount: 150 },
        { id: 't6', date: '2023-04-23', description: 'Supermarket', amount: 170 },
      ]
    },
    {
      id: '3',
      name: 'Transportation',
      budgeted: 400,
      spent: 380,
      color: '#FF9800',
      transactions: [
        { id: 't7', date: '2023-04-01', description: 'Gas', amount: 50 },
        { id: 't8', date: '2023-04-10', description: 'Car Insurance', amount: 120 },
        { id: 't9', date: '2023-04-15', description: 'Gas', amount: 55 },
        { id: 't10', date: '2023-04-20', description: 'Parking', amount: 25 },
        { id: 't11', date: '2023-04-25', description: 'Gas', amount: 45 },
        { id: 't12', date: '2023-04-30', description: 'Car Maintenance', amount: 85 },
      ]
    },
    {
      id: '4',
      name: 'Entertainment',
      budgeted: 300,
      spent: 450,
      color: '#9C27B0',
      transactions: [
        { id: 't13', date: '2023-04-03', description: 'Movies', amount: 30 },
        { id: 't14', date: '2023-04-10', description: 'Concert Tickets', amount: 150 },
        { id: 't15', date: '2023-04-17', description: 'Restaurant', amount: 85 },
        { id: 't16', date: '2023-04-24', description: 'Streaming Services', amount: 55 },
        { id: 't17', date: '2023-04-30', description: 'Restaurant', amount: 130 },
      ]
    },
    {
      id: '5',
      name: 'Health',
      budgeted: 200,
      spent: 120,
      color: '#F44336',
      transactions: [
        { id: 't18', date: '2023-04-05', description: 'Gym Membership', amount: 70 },
        { id: 't19', date: '2023-04-15', description: 'Pharmacy', amount: 50 },
      ]
    },
  ];

  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteCategory = (id: string) => {
    // This would delete from the database in a real implementation
    toast({
      title: "Budget Category Deleted",
      description: "The budget category has been deleted successfully.",
    });
    setCategoryToDelete(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Budget Categories</h3>
        <Button variant="outline" size="sm">
          <PlusCircle className="mr-1 h-4 w-4" /> Add Category
        </Button>
      </div>
      
      {budgetCategories.map((category) => {
        const percentSpent = (category.spent / category.budgeted) * 100;
        const isOverBudget = category.spent > category.budgeted;
        
        return (
          <Collapsible
            key={category.id}
            open={openCategories[category.id]}
            onOpenChange={() => toggleCategory(category.id)}
            className="border rounded-lg overflow-hidden"
          >
            <div className="p-4">
              <CollapsibleTrigger className="flex w-full justify-between items-center">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3" 
                    style={{ backgroundColor: category.color }}
                  ></div>
                  <span className="font-medium">{category.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isOverBudget && (
                    <Badge variant="destructive">Over Budget</Badge>
                  )}
                  <span className="text-sm">
                    ${category.spent.toLocaleString()} / ${category.budgeted.toLocaleString()}
                  </span>
                  {openCategories[category.id] ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              
              <div className="mt-2">
                <div className="relative pt-1">
                  <Progress 
                    value={Math.min(percentSpent, 100)} 
                    className={`h-2 ${isOverBudget ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>
                    {isOverBudget
                      ? `$${(category.spent - category.budgeted).toFixed(2)} over budget`
                      : `$${(category.budgeted - category.spent).toFixed(2)} remaining`
                    }
                  </span>
                  <span>{percentSpent.toFixed()}% spent</span>
                </div>
              </div>
            </div>
            
            <CollapsibleContent>
              <div className="border-t px-4 py-3 bg-muted/30">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium">Transactions</h4>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive" 
                      onClick={() => setCategoryToDelete(category.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {category.transactions && category.transactions.length > 0 ? (
                    category.transactions.map(transaction => (
                      <div 
                        key={transaction.id} 
                        className="flex justify-between items-center text-sm py-1.5 border-b border-border/50 last:border-0"
                      >
                        <div className="flex flex-col">
                          <span>{transaction.description}</span>
                          <span className="text-xs text-muted-foreground">{transaction.date}</span>
                        </div>
                        <span className="font-medium">${transaction.amount.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground py-2">No transactions found for this category</p>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        );
      })}
      
      <AlertDialog open={!!categoryToDelete} onOpenChange={() => setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this budget category?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. All transactions will be uncategorized.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => categoryToDelete && handleDeleteCategory(categoryToDelete)}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
