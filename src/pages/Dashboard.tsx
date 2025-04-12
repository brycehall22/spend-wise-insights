
import { useQuery } from "@tanstack/react-query";
import { getTransactionStats } from "@/services/transactionService";
import { getAccountBalances } from "@/services/accountService";
import { getBudgetSummary } from "@/services/budgetService";
import { getCategories } from "@/services/categoryService";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowDownCircle, ArrowUpCircle, Wallet } from "lucide-react";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import IncomeVsExpensesChart from "@/components/dashboard/IncomeVsExpensesChart";
import SpendingByCategoryChart from "@/components/dashboard/SpendingByCategoryChart";

export default function Dashboard() {
  // Get current month
  const currentMonth = new Date();
  const monthString = format(currentMonth, 'yyyy-MM');
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).toISOString();
  const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).toISOString();

  // Get transaction stats
  const { data: transactionStats, isLoading: loadingStats } = useQuery({
    queryKey: ['transactionStats', monthString],
    queryFn: () => getTransactionStats(firstDayOfMonth, lastDayOfMonth),
  });

  // Get account balances
  const { data: accountBalances, isLoading: loadingAccounts } = useQuery({
    queryKey: ['accountBalances'],
    queryFn: getAccountBalances,
  });

  // Get budget summary
  const { data: budgetSummary, isLoading: loadingBudget } = useQuery({
    queryKey: ['budgetSummary', monthString],
    queryFn: () => getBudgetSummary(monthString),
  });

  // Get categories for charts
  const { data: categories, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
  });

  const isLoading = loadingStats || loadingAccounts || loadingBudget || loadingCategories;

  return (
    <PageTemplate
      title="Dashboard"
      subtitle={`Financial overview for ${format(currentMonth, 'MMMM yyyy')}`}
    >
      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        {/* Income Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Income
            </CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                ${transactionStats?.income.toFixed(2) || '0.00'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Expenses
            </CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                ${transactionStats?.expenses.toFixed(2) || '0.00'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold">
                ${accountBalances?.totalBalance.toFixed(2) || '0.00'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget Status */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Budget Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-2 w-full" />
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Spent: ${budgetSummary?.totalSpent.toFixed(2) || '0.00'}</span>
                  <span>Budget: ${budgetSummary?.totalBudget.toFixed(2) || '0.00'}</span>
                </div>
                <Progress 
                  value={budgetSummary?.totalBudget ? (budgetSummary.totalSpent / budgetSummary.totalBudget * 100) : 0}
                  className="h-2"
                  indicatorClassName={cn(
                    budgetSummary?.totalSpent && budgetSummary?.totalBudget && 
                    budgetSummary.totalSpent > budgetSummary.totalBudget
                      ? "bg-red-500"
                      : "bg-green-500"
                  )}
                />
                {budgetSummary && (
                  <div className="text-xs mt-1">
                    {budgetSummary.remainingBudget >= 0 
                      ? `$${budgetSummary.remainingBudget.toFixed(2)} remaining` 
                      : `$${Math.abs(budgetSummary.remainingBudget).toFixed(2)} over budget`}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Income vs Expenses Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <IncomeVsExpensesChart />
            )}
          </CardContent>
        </Card>

        {/* Spending by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Skeleton className="h-full w-full" />
              </div>
            ) : (
              <SpendingByCategoryChart />
            )}
          </CardContent>
        </Card>
      </div>
    </PageTemplate>
  );
}
