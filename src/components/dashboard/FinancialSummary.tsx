import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface FinancialSummaryData {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingRate: number;
}

interface FinancialSummaryCardsProps {
  data: FinancialSummaryData | null;
  isLoading: boolean;
}

/**
 * A component that displays key financial metrics in summary cards 
 */
export function FinancialSummaryCards({
  data,
  isLoading
}: FinancialSummaryCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
      {/* Income Card */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Income</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold text-green-600">
              ${data.totalIncome.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Expense Card */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Expenses</CardTitle>
          <ArrowDownRight className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold text-red-600">
              ${data.totalExpenses.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Savings Rate Card */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold text-blue-600">
              {data.savingRate > 0 ? '+' : ''}{data.savingRate.toFixed(1)}%
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Net Savings Card */}
      <Card>
        <CardHeader className="pb-2 flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
          <DollarSign className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          {isLoading || !data ? (
            <Skeleton className="h-8 w-28" />
          ) : (
            <div className="text-2xl font-bold text-blue-600">
              ${data.netSavings.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FinancialSummaryCards;