
import { ChevronUp, ChevronDown, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFinancialSummary } from "@/services/dashboardService";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinancialSummary() {
  // Get current month bounds
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
  
  // Get financial summary for current month
  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['financialSummary', startOfMonth, endOfMonth],
    queryFn: () => getFinancialSummary(startOfMonth, endOfMonth),
  });
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="budget-card animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">
          {format(currentDate, "MMMM yyyy")} Summary
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div key={index} className="stat-card flex items-center">
              <div className="p-3 rounded-full bg-gray-100 mr-4">
                <Skeleton className="h-5 w-5" />
              </div>
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="budget-card animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">
          {format(currentDate, "MMMM yyyy")} Summary
        </h2>
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p>There was an error loading your financial summary.</p>
        </div>
      </div>
    );
  }
  
  // Fallback to zeros if no data
  const income = summary?.income || 0;
  const expenses = summary?.expenses || 0;
  const net = summary?.net || 0;
  const savingsRate = summary?.savingsRate || 0;
  
  return (
    <div className="budget-card animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">
        {format(currentDate, "MMMM yyyy")} Summary
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Income</p>
            <p className="text-xl font-bold text-spendwise-oxford">${income.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div className="stat-card flex items-center">
          <div className="p-3 rounded-full bg-red-100 mr-4">
            <TrendingDown className="text-red-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Expenses</p>
            <p className="text-xl font-bold text-spendwise-oxford">${expenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        </div>
        
        <div className="stat-card flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <DollarSign className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Net Savings</p>
            <p className="text-xl font-bold flex items-center text-spendwise-oxford">
              ${net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className={`ml-2 text-sm flex items-center ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {net >= 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {Math.abs(savingsRate).toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
