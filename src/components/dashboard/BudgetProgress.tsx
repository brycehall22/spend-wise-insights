
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { getBudgets } from "@/services/budgetService";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function BudgetProgress() {
  // Get current month
  const currentMonth = new Date();
  
  // Fetch budgets for current month with spending data
  const { data: budgets, isLoading, error } = useQuery({
    queryKey: ['budgets', currentMonth.toISOString().substring(0, 7)],
    queryFn: () => getBudgets(currentMonth),
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="budget-card animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Budget Overview</h2>
        
        <div className="space-y-5">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="space-y-1">
              <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-20" />
              </div>
              
              <div className="relative">
                <Skeleton className="h-2 w-full" />
              </div>
              
              <div>
                <Skeleton className="h-3 w-16" />
              </div>
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
        <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Budget Overview</h2>
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p>Unable to load budget data.</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!budgets || budgets.length === 0) {
    return (
      <div className="budget-card animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-spendwise-oxford">Budget Overview</h2>
          <a href="/budgets" className="text-sm text-spendwise-orange hover:underline">Create Budget</a>
        </div>
        <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">
          <p>No budgets set for this month</p>
          <p className="text-sm text-gray-400 mt-1">Create a budget to start tracking your spending</p>
        </div>
      </div>
    );
  }
  
  // Limit to showing top 5 budgets in the dashboard widget
  const displayBudgets = budgets.slice(0, 5);
  
  return (
    <div className="budget-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-spendwise-oxford">Budget Overview</h2>
        <a href="/budgets" className="text-sm text-spendwise-orange hover:underline">View All</a>
      </div>
      
      <div className="space-y-5">
        {displayBudgets.map((budget) => {
          const spent = budget.spent || 0;
          const percentSpent = (spent / budget.amount) * 100;
          const remaining = budget.amount - spent;
          
          return (
            <div key={budget.budget_id} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium truncate max-w-[150px]">{budget.category_name}</span>
                <span 
                  className={cn(
                    "text-sm font-medium",
                    remaining < 0 
                      ? "text-red-600" 
                      : percentSpent > 90 
                        ? "text-amber-600" 
                        : "text-green-600"
                  )}
                >
                  ${spent.toFixed(2)} / ${budget.amount.toFixed(2)}
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={Math.min(percentSpent, 100)} 
                  className={cn(
                    "h-2",
                    remaining < 0 
                      ? "bg-red-100" 
                      : percentSpent > 90 
                        ? "bg-amber-100" 
                        : "bg-green-100"
                  )}
                />
                
                {remaining < 0 && (
                  <div className="absolute top-0 left-[100%] h-2 w-[2px] bg-red-600"></div>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                {remaining < 0 ? (
                  <span className="text-red-600">Over budget by ${Math.abs(remaining).toFixed(2)}</span>
                ) : (
                  <span>${remaining.toFixed(2)} remaining</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
