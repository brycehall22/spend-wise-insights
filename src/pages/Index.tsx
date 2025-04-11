
import AppSidebar from "@/components/AppSidebar";
import BudgetProgress from "@/components/dashboard/BudgetProgress";
import FinancialInsights from "@/components/dashboard/FinancialInsights";
import FinancialSummary from "@/components/dashboard/FinancialSummary";
import IncomeVsExpensesChart from "@/components/dashboard/IncomeVsExpensesChart";
import RecentTransactions from "@/components/dashboard/RecentTransactions";
import SavingsGoalsWidget from "@/components/dashboard/SavingsGoalsWidget";
import SpendingByCategoryChart from "@/components/dashboard/SpendingByCategoryChart";
import SubscriptionsWidget from "@/components/dashboard/SubscriptionsWidget";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Index() {
  return (
    <div className="min-h-screen bg-spendwise-platinum">
      <AppSidebar />
      
      <div className="pt-6 lg:pl-72 pr-6 pb-12">
        <main className="max-w-7xl mx-auto">
          <div className="mb-6 px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-spendwise-oxford">Financial Dashboard</h1>
                <p className="text-sm text-gray-500">Welcome back, John! Here's your financial overview.</p>
              </div>
              
              <div className="mt-4 sm:mt-0 flex space-x-2">
                <Button className="bg-spendwise-orange hover:bg-spendwise-orange/90 text-white flex items-center gap-1">
                  <Plus size={16} /> Add Transaction
                </Button>
              </div>
            </div>
            
            <div className="mb-6">
              <FinancialSummary />
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
