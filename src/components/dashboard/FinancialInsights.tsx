
import { 
  AlertCircle, 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight,
  CheckCircle2,
  Info 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFinancialInsights } from "@/services/dashboardService";
import { Skeleton } from "@/components/ui/skeleton";

export default function FinancialInsights() {
  // Fetch insights from real data
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['financialInsights'],
    queryFn: getFinancialInsights,
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="budget-card animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Financial Insights</h2>
        <div className="space-y-3">
          {[1, 2, 3].map((index) => (
            <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <div className="flex">
                <div className="flex-shrink-0 mt-0.5">
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <div className="ml-3 w-full">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full" />
                </div>
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
        <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Financial Insights</h2>
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <p>Unable to load financial insights.</p>
        </div>
      </div>
    );
  }
  
  // No data state
  if (!insights || insights.length === 0) {
    return (
      <div className="budget-card animate-fade-in">
        <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Financial Insights</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <Info className="mx-auto mb-2 text-blue-600" size={24} />
          <p className="text-sm text-blue-800">Add more transactions to receive financial insights.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="budget-card animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Financial Insights</h2>
      
      <div className="space-y-3">
        {insights.map((insight) => {
          let bgColor = "bg-gray-50";
          let icon = null;
          
          switch (insight.type) {
            case 'positive':
              bgColor = "bg-green-50";
              icon = <CheckCircle2 className="text-green-600" size={18} />;
              break;
            case 'negative':
              bgColor = "bg-red-50";
              icon = <AlertCircle className="text-red-600" size={18} />;
              break;
            case 'warning':
              bgColor = "bg-amber-50";
              icon = <AlertTriangle className="text-amber-600" size={18} />;
              break;
            default:
              bgColor = "bg-blue-50";
              icon = <Info className="text-blue-600" size={18} />;
              break;
          }
          
          return (
            <div 
              key={insight.id} 
              className={`${bgColor} border border-gray-200 rounded-lg p-3`}
            >
              <div className="flex">
                <div className="flex-shrink-0 mt-0.5">
                  {icon}
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium">{insight.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{insight.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
