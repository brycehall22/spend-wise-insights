
import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

type BudgetSummaryProps = {
  month: Date;
};

export default function BudgetSummary({ month }: BudgetSummaryProps) {
  // These would be fetched from the database in a real implementation
  const budgetData = {
    income: 5200,
    expenses: 3800,
    budgeted: 4200,
    savingsRate: ((5200 - 3800) / 5200) * 100,
    spendingProgress: (3800 / 4200) * 100,
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col">
        <h2 className="text-xl font-semibold mb-4">
          Budget Summary for {format(month, 'MMMM yyyy')}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-center gap-4">
            <div className="bg-green-100 p-3 rounded-full">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Income</p>
              <p className="text-2xl font-bold">${budgetData.income.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold">${budgetData.expenses.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <ArrowUpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Savings</p>
              <p className="text-2xl font-bold">
                ${(budgetData.income - budgetData.expenses).toLocaleString()}
                <span className="text-sm text-green-600 ml-2">
                  ({budgetData.savingsRate.toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Overall Budget: ${budgetData.expenses.toLocaleString()} of ${budgetData.budgeted.toLocaleString()}
            </span>
            <span className="text-sm font-medium">
              {budgetData.spendingProgress.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={budgetData.spendingProgress} 
            className="h-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {budgetData.budgeted - budgetData.expenses > 0 
              ? `$${(budgetData.budgeted - budgetData.expenses).toLocaleString()} remaining` 
              : `$${Math.abs(budgetData.budgeted - budgetData.expenses).toLocaleString()} over budget`
            }
          </p>
        </div>
      </div>
    </Card>
  );
}
