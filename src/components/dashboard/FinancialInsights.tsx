import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2,
  Info 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFinancialInsights } from "@/services/dashboardService";
import { Skeleton } from "@/components/ui/skeleton";

export type InsightType = 'positive' | 'negative' | 'warning' | 'neutral';

export interface Insight {
  id: string;
  type: InsightType;
  title: string;
  description: string;
}

export default function FinancialInsights() {
  // Fetch insights from real data
  const { data: insights, isLoading, error } = useQuery({
    queryKey: ['financialInsights'],
    queryFn: getFinancialInsights,
  });
  
  // Loading state
  if (isLoading) {
    return (
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
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <p>Unable to load financial insights.</p>
      </div>
    );
  }
  
  // No data state
  if (!insights || insights.length === 0) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
        <Info className="mx-auto mb-2 text-blue-600" size={24} />
        <p className="text-sm text-blue-800">Add more transactions to receive financial insights.</p>
      </div>
    );
  }

  const getIconForInsightType = (type: InsightType) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 className="text-green-600" size={18} />;
      case 'negative':
        return <AlertCircle className="text-red-600" size={18} />;
      case 'warning':
        return <AlertTriangle className="text-amber-600" size={18} />;
      case 'neutral':
      default:
        return <Info className="text-blue-600" size={18} />;
    }
  };

  const getBackgroundColorForInsightType = (type: InsightType) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50';
      case 'negative':
        return 'bg-red-50';
      case 'warning':
        return 'bg-amber-50';
      case 'neutral':
      default:
        return 'bg-blue-50';
    }
  };
  
  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <div 
          key={insight.id} 
          className={`${getBackgroundColorForInsightType(insight.type)} border border-gray-200 rounded-lg p-3`}
        >
          <div className="flex">
            <div className="flex-shrink-0 mt-0.5">
              {getIconForInsightType(insight.type)}
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium">{insight.title}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{insight.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}