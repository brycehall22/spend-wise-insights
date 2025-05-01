import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { budgetService } from "@/services/budgetService";
import { format } from "date-fns";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Budget } from "@/types/database.types";

type BudgetCategoryListProps = {
  month: Date;
  type: "expense" | "income";
};

export default function BudgetCategoryList({ month, type }: BudgetCategoryListProps) {
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [budgetToEdit, setBudgetToEdit] = useState<Budget | null>(null);
  const [editAmount, setEditAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: budgets, isLoading, error } = useQuery({
    queryKey: ['budgets', format(month, 'yyyy-MM')],
    queryFn: () => budgetService.getBudgets(month)
  });

  const deleteMutation = useMutation({
    mutationFn: (budgetId: string) => budgetService.deleteBudget(budgetId),
    onSuccess: () => {
      toast({ title: "Budget Deleted", description: "The budget has been deleted successfully." });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      setBudgetToDelete(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: `Failed to delete budget: ${error.message}`, variant: "destructive" });
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ budgetId, amount }: { budgetId: string; amount: number }) => 
      budgetService.updateBudget(budgetId, { amount }),
    onSuccess: () => {
      toast({ title: "Budget Updated", description: "The budget amount has been updated successfully." });
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary'] });
      setBudgetToEdit(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: `Failed to update budget: ${error.message}`, variant: "destructive" });
    }
  });

  const handleDelete = (budgetId: string) => {
    setBudgetToDelete(budgetId);
  };

  const confirmDelete = () => {
    if (budgetToDelete) {
      deleteMutation.mutate(budgetToDelete);
    }
  };

  const handleEdit = (budget: Budget) => {
    setBudgetToEdit(budget);
    setEditAmount(budget.amount.toString());
  };

  const handleUpdate = () => {
    if (!budgetToEdit) return;
    const amount = parseFloat(editAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({ title: "Invalid Amount", description: "Please enter a valid amount greater than zero.", variant: "destructive" });
      return;
    }
    setIsSubmitting(true);
    updateMutation.mutate(
      { budgetId: budgetToEdit.budget_id, amount },
      { onSettled: () => setIsSubmitting(false) }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-1/4" />
              <Skeleton className="h-5 w-1/4" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex p-4 text-red-800 bg-red-50 rounded-md">
        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
        <div>
          <h3 className="font-medium">Error loading budgets</h3>
          <p className="text-sm">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  const filteredBudgets = budgets || [];

  if (filteredBudgets.length === 0) {
    return (
      <EmptyState
        title="No budgets found"
        description="You haven't set up any budgets for this month yet. Create a budget to start tracking your spending."
        icon={<span className="text-3xl">💸</span>}
      />
    );
  }

  return (
    <div className="space-y-6">
      {filteredBudgets.map((budget) => {
        const percentSpent = budget.spent ? (budget.spent / budget.amount) * 100 : 0;
        const remaining = budget.amount - (budget.spent || 0);
        
        const progressBarClass = remaining < 0 
          ? "bg-red-100" 
          : percentSpent > 90 
            ? "bg-amber-100" 
            : "bg-green-100";
        const indicatorClass = remaining < 0 
          ? "bg-red-600" 
          : percentSpent > 90 
            ? "bg-amber-600" 
            : "bg-green-600";

        return (
          <div key={budget.budget_id} className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{budget.category_name || "Uncategorized"}</h4>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleEdit(budget)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => handleDelete(budget.budget_id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span>${budget.spent ? budget.spent.toFixed(2) : "0.00"} of ${budget.amount.toFixed(2)}</span>
              <span className={cn(remaining < 0 ? "text-red-600" : "text-gray-500")}>
                {remaining < 0 ? `$${Math.abs(remaining).toFixed(2)} over` : `$${remaining.toFixed(2)} remaining`}
              </span>
            </div>

            <Progress value={Math.min(percentSpent, 100)} className={cn("h-2", progressBarClass)} indicatorClassName={indicatorClass} />

            {budget.notes && <p className="text-xs text-gray-500 italic mt-1">{budget.notes}</p>}
          </div>
        );
      })}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!budgetToDelete} onOpenChange={(open) => { if (!open) setBudgetToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this budget. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Budget Dialog */}
      <Dialog open={!!budgetToEdit} onOpenChange={(open) => { if (!open) setBudgetToEdit(null) }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Budget Amount</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>Amount</Label>
            <Input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBudgetToEdit(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
