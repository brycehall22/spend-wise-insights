
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
import { useQuery } from "@tanstack/react-query";
import { 
  getIncomeExpensesData, 
  getCategorySpendingByPeriod,
  getTopMerchants,
  getMonthlySavingRates,
  getMonthlySnapshot
} from "@/services/analyticsService";
import { exportTransactions } from "@/services/transaction/transactionExport";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

import SpendingByCategoryChart from "@/components/dashboard/SpendingByCategoryChart";
import IncomeVsExpensesChart from "@/components/dashboard/IncomeVsExpensesChart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { 
  Bar, 
  BarChart as RechartsBarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis, 
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from "recharts";

// Default colors for pie chart
const COLORS = ['#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#FFC107', '#607D8B', '#795548', '#3F51B5', '#E91E63', '#00BCD4'];

export default function Analytics() {
  const [dateRange, setDateRange] = useState("6m");
  const [comparisonType, setComparisonType] = useState("month");
  const [exportFormat, setExportFormat] = useState("csv");
  const [activeTab, setActiveTab] = useState("overview");

  // Calculate date range based on selection
  const getDateRange = () => {
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
    
    return { startDate, endDate };
  };

  // Get date range for display
  const getDateRangeDisplay = () => {
    const { startDate, endDate } = getDateRange();
    return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  // Fetch category spending data
  const { startDate, endDate } = getDateRange();
  const { data: categorySpending, isLoading: loadingCategoryData } = useQuery({
    queryKey: ['categorySpending', dateRange],
    queryFn: () => getCategorySpendingByPeriod(startDate, endDate)
  });

  // Fetch merchant spending data
  const { data: merchantSpendingData, isLoading: loadingMerchants } = useQuery({
    queryKey: ['merchantSpending', dateRange],
    queryFn: () => getTopMerchants(startDate, endDate)
  });

  // Fetch saving rate data
  const { data: savingRateData, isLoading: loadingSavingRate } = useQuery({
    queryKey: ['savingRate', dateRange],
    queryFn: () => getMonthlySavingRates(dateRange === '3m' ? 3 : dateRange === '1y' ? 12 : 6)
  });

  // Fetch monthly snapshot
  const { data: monthlySnapshot, isLoading: loadingSnapshot } = useQuery({
    queryKey: ['monthlySnapshot'],
    queryFn: getMonthlySnapshot
  });

  // Function to handle export
  const handleExport = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const filters = {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd')
      };

      // Export transactions
      const data = await exportTransactions(exportFormat as 'csv' | 'json', filters);
      
      // Create download link
      const blob = new Blob([data], { 
        type: exportFormat === 'csv' ? 'text/csv;charset=utf-8' : 'application/json;charset=utf-8' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions-export.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Your transactions have been exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was a problem exporting your transactions",
        variant: "destructive",
      });
    }
  };

  // Aggregate loading state
  const isLoading = loadingCategoryData || loadingMerchants || loadingSavingRate || loadingSnapshot;

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
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
      
      {/* Main analytics tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
                  {isLoading || !savingRateData ? (
                    <div className="flex items-center justify-center h-full">
                      <Skeleton className="h-full w-full" />
                    </div>
                  ) : (
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
                                formatter={(value, name, props) => {
                                  const item = props.payload;
                                  return [
                                    `${value}%`, 
                                    `Saving Rate (${item.fullMonth})`
                                  ];
                                }}
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
                  )}
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
                {isLoading || !merchantSpendingData ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(index => (
                      <div key={index} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : merchantSpendingData.length > 0 ? (
                  <div className="space-y-4">
                    {merchantSpendingData.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="font-medium">{item.merchant}</span>
                        <span className="text-muted-foreground">${item.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <p>No merchant data available</p>
                  </div>
                )}
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
                {isLoading || !monthlySnapshot ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(index => (
                      <div key={index} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <dl className="space-y-4">
                    <div className="flex justify-between">
                      <dt className="font-medium">Total Income</dt>
                      <dd className="text-green-600">
                        ${monthlySnapshot.totalIncome.toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Total Expenses</dt>
                      <dd className="text-red-600">
                        ${monthlySnapshot.totalExpenses.toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Net Savings</dt>
                      <dd className="text-blue-600">
                        ${monthlySnapshot.netSavings.toFixed(2)}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Saving Rate</dt>
                      <dd className="text-blue-600">
                        {monthlySnapshot.savingRate.toFixed(1)}%
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="font-medium">Avg. Daily Spending</dt>
                      <dd className="text-muted-foreground">
                        ${monthlySnapshot.avgDailySpending.toFixed(2)}
                      </dd>
                    </div>
                  </dl>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="spending" className="space-y-6">
          {/* Category breakdown pie chart */}
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>
                Detailed view of your spending by category
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading || !categorySpending ? (
                <div className="flex items-center justify-center h-full">
                  <Skeleton className="h-60 w-60 rounded-full" />
                </div>
              ) : categorySpending.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={categorySpending}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={150}
                      fill="#8884d8"
                      dataKey="amount"
                      nameKey="name"
                    >
                      {categorySpending.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => `$${value.toFixed(2)}`}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <PieChart size={48} className="text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Spending Data</h3>
                  <p className="text-muted-foreground max-w-md text-center">
                    Add transactions to see a breakdown of your spending by category.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Income Analysis</CardTitle>
              <CardDescription>
                Track and analyze your income sources
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
                Long-term financial pattern analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <LineChart size={48} className="text-muted-foreground mx-auto mb-4" />
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
