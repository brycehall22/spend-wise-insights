
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getBudgets } from "@/services/budgetService";
import EmptyState from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

type BudgetCategoryListProps = {
  month: Date;
  type: "expense" | "income";
};

export default function BudgetCategoryList({ month, type }: BudgetCategoryListProps) {
  const { 
    data: budgets, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['budgets', month.toISOString().substring(0, 7)],
    queryFn: () => getBudgets(month)
  });

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
      <div className="text-red-500 p-4 rounded-md bg-red-50 border border-red-200">
        Error loading budgets: {(error as Error).message}
      </div>
    );
  }

  if (!budgets || budgets.length === 0) {
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
      {budgets.map((budget) => {
        const percentSpent = budget.spent ? (budget.spent / budget.amount) * 100 : 0;
        const remaining = budget.amount - (budget.spent || 0);
        
        // Apply custom styling based on budget status
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
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between text-sm">
              <span>
                ${budget.spent ? budget.spent.toFixed(2) : '0.00'} of ${budget.amount.toFixed(2)}
              </span>
              <span 
                className={cn(
                  remaining < 0 ? "text-red-600" : "text-gray-500"
                )}
              >
                {remaining < 0 
                  ? `$${Math.abs(remaining).toFixed(2)} over` 
                  : `$${remaining.toFixed(2)} remaining`
                }
              </span>
            </div>
            
            <Progress 
              value={Math.min(percentSpent, 100)} 
              className={cn("h-2", progressBarClass)} 
            />
          </div>
        );
      })}
    </div>
  );
}
