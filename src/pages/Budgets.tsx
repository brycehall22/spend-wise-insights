
import React, { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card } from "@/components/ui/card";
import { 
  BarChart3, 
  CalendarIcon, 
  Copy, 
  Edit, 
  Plus, 
  Trash2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import BudgetSummary from "@/components/budgets/BudgetSummary";
import BudgetCategoryList from "@/components/budgets/BudgetCategoryList";
import CreateBudgetDialog from "@/components/budgets/CreateBudgetDialog";
import { format, subMonths } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useQueryClient } from "@tanstack/react-query";
import { budgetService } from "@/services/budgetService";

export default function Budgets() {
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const queryClient = useQueryClient();

  const monthStr = selectedMonth ? format(selectedMonth, 'MMMM yyyy') : 'Select Month';

  // Handler for copying previous month's budget(s)
  const handleCopyPreviousBudget = async () => {
    if (!selectedMonth) return;
    
    try {
      // Create a date for the previous month
      const prevMonthDate = subMonths(selectedMonth, 1);
      console.log("Copying budgets from:", format(prevMonthDate, 'MMMM yyyy'));
      
      // Get previous month's budgets
      const prevBudgets = await budgetService.getBudgets(prevMonthDate);
      
      if (!prevBudgets || prevBudgets.length === 0) {
        toast({
          title: "No Previous Budget",
          description: "No budget found for the previous month to copy.",
        });
        return;
      }
      
      // Get current month's budgets to check for duplicates
      const currentBudgets = await budgetService.getBudgets(selectedMonth);
      
      // Create a set of category IDs that already have budgets for the current month
      const existingCategoryIds = new Set(
        currentBudgets.map((budget) => budget.category_id)
      );
      
      // Filter out budgets that already exist for this month
      const budgetsToCopy = prevBudgets.filter(
        (budget) => budget.category_id && !existingCategoryIds.has(budget.category_id)
      );
      
      if (budgetsToCopy.length === 0) {
        toast({
          title: "No Budgets to Copy",
          description: "Budgets for these categories already exist this month.",
        });
        return;
      }
      
      console.log("Copying budgets:", budgetsToCopy);
      
      // Format the current month as YYYY-MM-DD (first day of month)
      const firstDayOfSelectedMonth = new Date(
        selectedMonth.getFullYear(),
        selectedMonth.getMonth(),
        1
      );
      const currentMonthStr = format(firstDayOfSelectedMonth, "yyyy-MM-dd");
      
      // Copy each budget to the new month
      for (const budget of budgetsToCopy) {
        await budgetService.createBudget({
          amount: budget.amount,
          category_id: budget.category_id!,
          month: currentMonthStr,
          notes: budget.notes || "",
        });
      }
      
      toast({
        title: "Budgets Copied",
        description: `Copied ${budgetsToCopy.length} budget${
          budgetsToCopy.length > 1 ? "s" : ""
        } to ${format(selectedMonth, 'MMMM yyyy')}.`,
      });
      
      // Refresh queries
      invalidateQueries();
      
    } catch (err) {
      console.error("Copy budget error:", err);
      toast({
        title: "Copy Failed",
        description: "Failed to copy budgets. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Helper function to invalidate budget-related queries
  const invalidateQueries = () => {
    if (selectedMonth) {
      const monthKey = format(selectedMonth, 'yyyy-MM');
      console.log("Invalidating queries for month:", monthKey);
      queryClient.invalidateQueries({ queryKey: ['budgets', monthKey] });
      queryClient.invalidateQueries({ queryKey: ['budgetSummary', monthKey] });
    }
  };

  return (
    <PageTemplate 
      title="Budget Management" 
      subtitle="Create and manage your monthly budgets"
    >
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[240px] justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {monthStr}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedMonth}
                  onSelect={(date) => {
                    // If a date is selected, set it to the first day of that month
                    if (date) {
                      const firstDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                      setSelectedMonth(firstDayOfMonth);
                    } else {
                      setSelectedMonth(undefined);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleCopyPreviousBudget}
              title="Copy budget from previous month"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="mr-1 h-4 w-4" /> Create Budget
          </Button>
        </div>
        
        <BudgetSummary month={selectedMonth || new Date()} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="overview" className="mt-0">
            <Card className="p-6">
              <BudgetCategoryList 
                month={selectedMonth || new Date()} 
                type="expense" 
              />
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="mt-0">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Manage Budget Categories</h3>
                <Select defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="essential">Essential</SelectItem>
                    <SelectItem value="discretionary">Discretionary</SelectItem>
                    <SelectItem value="savings">Savings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-4">
                {/* This would be populated from the database */}
                <p className="text-muted-foreground text-sm">
                  Manage your budget categories, create new ones, or delete unused ones.
                </p>
              </div>
            </Card>
          </TabsContent>
          
          <TabsContent value="income" className="mt-0">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Income Sources</h3>
              <div className="space-y-4">
                {/* This would be populated from the database */}
                <p className="text-muted-foreground text-sm">
                  Track and manage your income sources for the month.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      <CreateBudgetDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog} 
        onSave={() => {
          // Invalidate all affected queries so UI updates
          invalidateQueries();
          
          toast({
            title: "Budget Created",
            description: "Your new budget has been created successfully.",
          });
          setShowCreateDialog(false);
        }}
      />
    </PageTemplate>
  );
}
