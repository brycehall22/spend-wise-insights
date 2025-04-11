
import { 
  AlertCircle, 
  AlertTriangle, 
  ArrowDownRight, 
  ArrowUpRight,
  CheckCircle2 
} from "lucide-react";
import { mockInsights } from "@/lib/mockData";

export default function FinancialInsights() {
  return (
    <div className="budget-card animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Financial Insights</h2>
      
      <div className="space-y-3">
        {mockInsights.map((insight) => {
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
