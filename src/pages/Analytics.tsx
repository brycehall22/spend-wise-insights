
import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Download,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, subMonths, subYears } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockIncomeVsExpenses, mockCategoryTrends } from "@/lib/mockData";

import SpendingByCategoryChart from "@/components/dashboard/SpendingByCategoryChart";
import IncomeVsExpensesChart from "@/components/dashboard/IncomeVsExpensesChart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export default function Analytics() {
  const [dateRange, setDateRange] = useState("6m");
  const [comparisonType, setComparisonType] = useState("month");
  const [exportFormat, setExportFormat] = useState("pdf");

  // Calculate date range for display
  const getDateRangeDisplay = () => {
    const endDate = new Date();
    let startDate;
    
    switch (dateRange) {
      case "3m":
        startDate = subMonths(endDate, 3);
        break;
      case "6m":
        startDate = subMonths(endDate, 6);
        break;
      case "1y":
        startDate = subYears(endDate, 1);
        break;
      case "ytd":
        startDate = new Date(endDate.getFullYear(), 0, 1);
        break;
      default:
        startDate = subMonths(endDate, 6);
    }
    
    return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  // Mock merchant spending data
  const merchantSpendingData = [
    { merchant: "Amazon", amount: 453.27 },
    { merchant: "Grocery Store", amount: 329.84 },
    { merchant: "Gas Station", amount: 187.62 },
    { merchant: "Netflix", amount: 15.99 },
    { merchant: "Coffee Shop", amount: 78.35 },
  ];

  // Function to handle export
  const handleExport = () => {
    // This would be implemented to generate and download reports
    alert(`Exporting data as ${exportFormat.toUpperCase()}...`);
  };

  // Mock monthly saving rate data
  const savingRateData = [
    { month: 'Jan', savingRate: 15 },
    { month: 'Feb', savingRate: 12 },
    { month: 'Mar', savingRate: 18 },
    { month: 'Apr', savingRate: 22 },
    { month: 'May', savingRate: 20 },
    { month: 'Jun', savingRate: 25 },
  ];

  return (
    <PageTemplate 
      title="Financial Analytics" 
      subtitle="Gain insights into your spending patterns and financial health"
    >
      {/* Controls */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="ytd">Year to Date</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={comparisonType} onValueChange={setComparisonType}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Comparison" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Month over Month</SelectItem>
              <SelectItem value="year">Year over Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {getDateRangeDisplay()}
          </span>
          <Select value={exportFormat} onValueChange={setExportFormat}>
            <SelectTrigger className="w-[90px]">
              <SelectValue placeholder="Export" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pdf">PDF</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="xlsx">Excel</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Main analytics tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="spending">Spending</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Income vs Expenses Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Income vs Expenses</CardTitle>
              <CardDescription>
                Compare your income and expenses over time with net savings calculation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <IncomeVsExpensesChart />
              </div>
            </CardContent>
          </Card>
          
          {/* Two column layout for smaller charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Spending by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>
                  Breakdown of your spending across different categories
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <SpendingByCategoryChart />
                </div>
              </CardContent>
            </Card>
            
            {/* Saving Rate */}
            <Card>
              <CardHeader>
                <CardTitle>Saving Rate</CardTitle>
                <CardDescription>
                  Percentage of income saved over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ChartContainer 
                    config={{
                      savingRate: {
                        label: "Saving Rate",
                        color: "#4CAF50"
                      }
                    }}
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsBarChart data={savingRateData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                        <XAxis dataKey="month" />
                        <YAxis 
                          tickFormatter={(value) => `${value}%`}
                        />
                        <ChartTooltip 
                          content={
                            <ChartTooltipContent 
                              formatter={(value) => [`${value}%`, "Saving Rate"]}
                            />
                          }
                        />
                        <Bar 
                          dataKey="savingRate" 
                          name="savingRate" 
                          fill="var(--color-savingRate, #4CAF50)" 
                        />
                      </RechartsBarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Top Merchants */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>Top Merchants</CardTitle>
                  <CardDescription>
                    Where you're spending the most money
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {merchantSpendingData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{item.merchant}</span>
                      <span className="text-muted-foreground">${item.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            {/* Monthly Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly Summary</CardTitle>
                <CardDescription>
                  Current month financial snapshot
                </CardDescription>
              </CardHeader>
              <CardContent>
                <dl className="space-y-4">
                  <div className="flex justify-between">
                    <dt className="font-medium">Total Income</dt>
                    <dd className="text-green-600">$4,582.30</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Total Expenses</dt>
                    <dd className="text-red-600">$3,428.12</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Net Savings</dt>
                    <dd className="text-blue-600">$1,154.18</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Saving Rate</dt>
                    <dd className="text-blue-600">25.2%</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="font-medium">Avg. Daily Spending</dt>
                    <dd className="text-muted-foreground">$114.27</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="spending" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed Spending Analysis</CardTitle>
              <CardDescription>
                Coming soon: Deep dive into your spending patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <BarChart size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Detailed Spending Analysis</h3>
                <p className="text-muted-foreground max-w-md">
                  This section will provide in-depth analysis of your spending 
                  patterns with advanced filtering options.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Income Analysis</CardTitle>
              <CardDescription>
                Coming soon: Track and analyze your income sources
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <LineChart size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Income Tracking</h3>
                <p className="text-muted-foreground max-w-md">
                  This section will provide insights into your income sources, 
                  trends, and variability over time.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Financial Trends</CardTitle>
              <CardDescription>
                Coming soon: Long-term financial pattern analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <PieChart size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Trend Analysis</h3>
                <p className="text-muted-foreground max-w-md">
                  This section will provide long-term trend analysis to help 
                  identify patterns in your financial behavior.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}
