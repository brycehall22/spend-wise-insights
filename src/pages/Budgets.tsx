
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
import { useToast } from "@/components/ui/use-toast";
import BudgetSummary from "@/components/budgets/BudgetSummary";
import BudgetCategoryList from "@/components/budgets/BudgetCategoryList";
import CreateBudgetDialog from "@/components/budgets/CreateBudgetDialog";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

export default function Budgets() {
  const [selectedMonth, setSelectedMonth] = useState<Date | undefined>(new Date());
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const monthStr = selectedMonth ? format(selectedMonth, 'MMMM yyyy') : 'Select Month';

  const handleCopyPreviousBudget = () => {
    toast({
      title: "Budget Copied",
      description: "Previous month's budget has been copied to " + format(selectedMonth!, 'MMMM yyyy'),
    });
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
                  onSelect={setSelectedMonth}
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
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
          </TabsList>
          
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
