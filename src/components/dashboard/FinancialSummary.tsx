
import { ChevronUp, ChevronDown, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { getMonthlyTotals } from "@/lib/mockData";

export default function FinancialSummary() {
  const { income, expenses, net } = getMonthlyTotals();
  const savingsRate = ((income - expenses) / income) * 100;
  
  return (
    <div className="budget-card animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">April 2023 Summary</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat-card flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <TrendingUp className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Income</p>
            <p className="text-xl font-bold text-spendwise-oxford">${income.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card flex items-center">
          <div className="p-3 rounded-full bg-red-100 mr-4">
            <TrendingDown className="text-red-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Expenses</p>
            <p className="text-xl font-bold text-spendwise-oxford">${expenses.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="stat-card flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <DollarSign className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-sm text-gray-500">Net Savings</p>
            <p className="text-xl font-bold flex items-center text-spendwise-oxford">
              ${net.toLocaleString()}
              <span className={`ml-2 text-sm flex items-center ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {net >= 0 ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                {savingsRate.toFixed(1)}%
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
