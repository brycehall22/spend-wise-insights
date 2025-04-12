
import React from "react";
import { Card } from "@/components/ui/card";
import { ArrowDownCircle, ArrowUpCircle, TrendingDown, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { getBudgetSummary } from "@/services/budgetService";
import { getTransactionStats } from "@/services/transactionService";
import { Skeleton } from "@/components/ui/skeleton";

type BudgetSummaryProps = {
  month: Date;
};

export default function BudgetSummary({ month }: BudgetSummaryProps) {
  // Get budget summary for the month
  const { data: budgetSummary, isLoading: loadingBudget } = useQuery({
    queryKey: ['budgetSummary', month.toISOString().substring(0, 7)],
    queryFn: () => getBudgetSummary(month),
  });

  // Get transaction stats for the month
  const { data: transactionStats, isLoading: loadingTransactions } = useQuery({
    queryKey: ['transactionStats', month.toISOString().substring(0, 7)],
    queryFn: () => {
      const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
      const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      return getTransactionStats(startDate, endDate);
    },
  });

  const isLoading = loadingBudget || loadingTransactions;

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex flex-col">
          <Skeleton className="h-8 w-1/3 mb-4" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-28" />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-16" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-4 w-1/5" />
          </div>
        </div>
      </Card>
    );
  }

  const income = transactionStats?.income || 0;
  const expenses = transactionStats?.expenses || 0;
  const net = income - expenses;
  const savingsRate = income > 0 ? (net / income) * 100 : 0;
  
  const totalBudget = budgetSummary?.totalBudget || 0;
  const totalSpent = budgetSummary?.totalSpent || 0;
  const remainingBudget = budgetSummary?.remainingBudget || 0;
  const spendingProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

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
              <p className="text-2xl font-bold text-spendwise-oxford">${income.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-red-100 p-3 rounded-full">
              <TrendingDown className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold text-spendwise-oxford">${expenses.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <ArrowUpCircle className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Net Savings</p>
              <p className="text-2xl font-bold flex items-center text-spendwise-oxford">
                ${net.toLocaleString()}
                <span className={`ml-2 text-sm flex items-center ${net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {savingsRate >= 0 ? "+" : "-"}{Math.abs(savingsRate).toFixed(1)}%
                </span>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">
              Overall Budget: ${totalSpent.toLocaleString()} of ${totalBudget.toLocaleString()}
            </span>
            <span className="text-sm font-medium">
              {spendingProgress.toFixed(0)}%
            </span>
          </div>
          <Progress 
            value={spendingProgress} 
            className="h-2"
          />
          <p className="text-sm text-muted-foreground mt-2">
            {remainingBudget > 0 
              ? `$${remainingBudget.toLocaleString()} remaining` 
              : `$${Math.abs(remainingBudget).toLocaleString()} over budget`
            }
          </p>
        </div>
      </div>
    </Card>
  );
}
