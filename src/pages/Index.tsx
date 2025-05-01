
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AppSidebar from "@/components/AppSidebar";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import FinancialInsights from "@/components/dashboard/FinancialInsights";
import FinancialSummaryCards from "@/components/dashboard/FinancialSummary";
import { getMonthlySnapshot } from "@/services/dashboardService";
import IncomeVsExpensesChart from "@/components/dashboard/IncomeVsExpensesChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SavingsGoalsWidget from "@/components/dashboard/SavingsGoalsWidget";
import SpendingByCategoryChart from "@/components/dashboard/SpendingByCategoryChart";
import SubscriptionsWidget from "@/components/dashboard/SubscriptionsWidget";
import { format } from "date-fns";

export default function Index() {
  const { user } = useAuth();
  const [userName, setUserName] = useState<string>("");

    // Fetch monthly snapshot for the financial summary cards
    const { 
      data: monthlySnapshot, 
      isLoading: loadingSnapshot,
      error 
    } = useQuery({
      queryKey: ['monthlySnapshot'],
      queryFn: getMonthlySnapshot
    });
  
    if (error) {
      console.error("Error fetching monthly snapshot:", error);
    }
  
  
    // Transform the data to match FinancialSummaryCards component expectations
    const financialSummaryData = monthlySnapshot ? {
      totalIncome: monthlySnapshot.totalIncome,
      totalExpenses: monthlySnapshot.totalExpenses,
      netSavings: monthlySnapshot.netSavings,
      savingRate: monthlySnapshot.savingRate
    } : null;
  
  useEffect(() => {
    if (user) {
      // Get user's name from metadata or email
      const fullName = user.user_metadata?.full_name;
      const firstName = user.user_metadata?.first_name ?? fullName?.split(' ')?.[0];
      
      // If we have a name, use it, otherwise use the email
      setUserName((firstName ?? user.email?.split('@')?.[0]) ?? "");
    }
  }, [user]);

  const currentMonth = new Date();
  const monthStr = format(currentMonth, 'MMMM yyyy');

  return (
    <div className="min-h-screen bg-spendwise-platinum">
      <AppSidebar />
      
      <div className="pt-6 lg:pl-72 pr-6 pb-12">
        <main className="max-w-7xl mx-auto">
          <div className="mb-6 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-spendwise-oxford">Financial Dashboard</h1>
                <p className="text-sm text-gray-500">
                  Welcome back{userName ? `, ${userName}` : ""}! Here's your {`financial overview for ${monthStr}`}.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
                {/* Financial Summary Cards */}
                <FinancialSummaryCards 
                  data={financialSummaryData}
                  isLoading={loadingSnapshot}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <IncomeVsExpensesChart />
              <SpendingByCategoryChart />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <BudgetProgress />
              <RecentTransactions />
              <div className="space-y-6 md:col-span-2 lg:col-span-1">
                <FinancialInsights />
                <SavingsGoalsWidget />
              </div>
              <div className="md:col-span-2 lg:col-span-3">
                <SubscriptionsWidget />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
