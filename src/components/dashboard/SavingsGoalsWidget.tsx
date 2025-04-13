
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getSavingsGoals } from "@/services/savingsGoalService";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavingsGoalsWidget() {
  // Fetch savings goals data
  const { data: savingsGoals, isLoading, error } = useQuery({
    queryKey: ['savingsGoals'],
    queryFn: getSavingsGoals,
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="budget-card animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-spendwise-oxford">Savings Goals</h2>
          <a href="/goals" className="text-sm text-spendwise-orange hover:underline">View All</a>
        </div>

        <div className="space-y-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Skeleton className="h-4 w-4 mr-2 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              
              <div className="mb-2">
                <Skeleton className="h-2 w-full" />
              </div>
              
              <div className="flex justify-between">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-8" />
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-spendwise-oxford">Savings Goals</h2>
          <a href="/goals" className="text-sm text-spendwise-orange hover:underline">View All</a>
        </div>
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p>Unable to load savings goals.</p>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (!savingsGoals || savingsGoals.length === 0) {
    return (
      <div className="budget-card animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-spendwise-oxford">Savings Goals</h2>
          <a href="/goals" className="text-sm text-spendwise-orange hover:underline">Create Goal</a>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center border border-dashed border-gray-300 rounded-lg">
          <Target size={32} className="text-gray-400 mb-2" />
          <p className="text-gray-500">No savings goals yet</p>
          <p className="text-sm text-gray-400">Create a goal to start tracking your savings</p>
        </div>
      </div>
    );
  }
  
  // Limit to displaying 3 goals in the widget
  const displayGoals = savingsGoals.slice(0, 3);

  return (
    <div className="budget-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-spendwise-oxford">Savings Goals</h2>
        <a href="/goals" className="text-sm text-spendwise-orange hover:underline">View All</a>
      </div>

      <div className="space-y-4">
        {displayGoals.map((goal) => {
          const percentComplete = goal.progress_percentage || 0;
          const formattedDeadline = new Date(goal.target_date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          
          return (
            <div key={goal.goal_id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Target size={16} className="text-spendwise-orange mr-2" />
                  <span className="font-medium truncate max-w-[150px] md:max-w-[200px]">{goal.name}</span>
                </div>
                <span className="text-sm text-gray-500">{formattedDeadline}</span>
              </div>
              
              <div className="mb-2">
                <Progress 
                  value={percentComplete} 
                  className="h-2 bg-gray-100" 
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span>${goal.current_amount.toLocaleString()} of ${goal.target_amount.toLocaleString()}</span>
                <span className="text-spendwise-oxford font-medium">{percentComplete.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
