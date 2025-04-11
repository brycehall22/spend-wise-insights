
import { mockSavingsGoals } from "@/lib/mockData";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

export default function SavingsGoalsWidget() {
  return (
    <div className="budget-card animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-spendwise-oxford">Savings Goals</h2>
        <a href="/goals" className="text-sm text-spendwise-orange hover:underline">View All</a>
      </div>

      <div className="space-y-4">
        {mockSavingsGoals.map((goal) => {
          const percentComplete = (goal.current / goal.target) * 100;
          const deadline = new Date(goal.deadline);
          const formattedDeadline = deadline.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
          });
          
          return (
            <div key={goal.id} className="border border-gray-200 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Target size={16} className="text-spendwise-orange mr-2" />
                  <span className="font-medium">{goal.name}</span>
                </div>
                <span className="text-sm text-gray-500">{formattedDeadline}</span>
              </div>
              
              <div className="mb-2">
                <Progress 
                  value={percentComplete} 
                  className="h-2 bg-gray-100" 
                  indicatorClassName="bg-spendwise-orange" 
                />
              </div>
              
              <div className="flex justify-between text-sm">
                <span>${goal.current.toLocaleString()} of ${goal.target.toLocaleString()}</span>
                <span className="text-spendwise-oxford font-medium">{percentComplete.toFixed(0)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
