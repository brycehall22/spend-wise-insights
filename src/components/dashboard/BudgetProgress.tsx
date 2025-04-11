
import { Progress } from "@/components/ui/progress";
import { mockBudgets } from "@/lib/mockData";
import { cn } from "@/lib/utils";

export default function BudgetProgress() {
  return (
    <div className="budget-card animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Budget Overview</h2>
      
      <div className="space-y-5">
        {mockBudgets.map((budget) => {
          const percentSpent = (budget.spent / budget.budgeted) * 100;
          
          return (
            <div key={budget.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{budget.category}</span>
                <span 
                  className={cn(
                    "text-sm font-medium",
                    budget.remaining < 0 
                      ? "text-red-600" 
                      : percentSpent > 90 
                        ? "text-amber-600" 
                        : "text-green-600"
                  )}
                >
                  ${budget.spent.toFixed(2)} / ${budget.budgeted.toFixed(2)}
                </span>
              </div>
              
              <div className="relative">
                <Progress 
                  value={Math.min(percentSpent, 100)} 
                  className={cn(
                    "h-2",
                    budget.remaining < 0 
                      ? "bg-red-100" 
                      : percentSpent > 90 
                        ? "bg-amber-100" 
                        : "bg-green-100"
                  )}
                />
                
                {budget.remaining < 0 && (
                  <div className="absolute top-0 left-[100%] h-2 w-[2px] bg-red-600"></div>
                )}
              </div>
              
              <div className="text-xs text-gray-500">
                {budget.remaining < 0 ? (
                  <span className="text-red-600">Over budget by ${Math.abs(budget.remaining).toFixed(2)}</span>
                ) : (
                  <span>${budget.remaining.toFixed(2)} remaining</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
