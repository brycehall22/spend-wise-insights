import { useState } from "react";
import PageTemplate from "./PageTemplate";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  LineChart,
  PieChart,
  Calendar,
  Download,
  Filter,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  AlertCircle
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
  getMonthlySnapshot,
  getYearOverYearData
} from "@/services/analyticsService";
import { exportTransactions } from "@/services/transaction/transactionExport";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

// Import enhanced chart components
import MonthlyTrendChart from "@/components/analytics/MonthlyTrendChart";
import YearComparisonChart from "@/components/analytics/YearComparisonChart";

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
  Cell,
  LineChart as RechartsLineChart,
  Line,
  Area,
  AreaChart
} from "recharts";
import { cn } from "@/lib/utils";

// Default colors for charts
const COLORS = ['#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#FFC107', '#607D8B', '#795548', '#3F51B5', '#E91E63', '#00BCD4'];

// Empty State Component
const EmptyState = ({ icon, title, description, actionLabel, onAction }) => (
  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
    <div className="bg-muted rounded-full p-4 mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground max-w-md mb-6">{description}</p>
    {actionLabel && onAction && (
      <Button onClick={onAction}>{actionLabel}</Button>
    )}
  </div>
);

// Enhanced Pie Chart component with loading and empty states
const EnhancedPieChart = ({ data, isLoading, emptyStateProps }) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Skeleton className="h-60 w-60 rounded-full" />
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
        {...emptyStateProps}
      />
    );
  }
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            outerRadius={120}
            fill="#8884d8"
            dataKey="amount"
            nameKey="name"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `$${Number(value).toFixed(2)}`}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Line/Bar chart component with loading and empty states
const EnhancedChart = ({ 
  data, 
  isLoading, 
  emptyStateProps, 
  chartType = "line",
  config
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Skeleton className="h-full w-full rounded" />
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        icon={chartType === "line" ? <LineChart className="h-8 w-8 text-muted-foreground" /> : <BarChart className="h-8 w-8 text-muted-foreground" />}
        {...emptyStateProps}
      />
    );
  }
  
  const ChartComponent = chartType === "line" ? RechartsLineChart : 
                         chartType === "area" ? AreaChart :
                         RechartsBarChart;
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis dataKey={config?.xAxis || "month"} />
          <YAxis tickFormatter={config?.yAxisFormatter || ((value) => `$${value}`)} />
          <Tooltip 
            formatter={config?.tooltipFormatter || ((value) => [`$${Number(value).toLocaleString()}`, ""])}
          />
          <Legend />
          {config?.dataKeys.map((key, index) => {
            if (chartType === "line") {
              return (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  name={config?.labels?.[key] || key} 
                  stroke={config?.colors?.[key] || COLORS[index % COLORS.length]} 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  strokeDasharray={config?.dashed?.[key] ? "5 5" : undefined}
                />
              );
            } else if (chartType === "area") {
              return (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  name={config?.labels?.[key] || key} 
                  stroke={config?.colors?.[key] || COLORS[index % COLORS.length]} 
                  fill={config?.fillColors?.[key] || `${config?.colors?.[key] || COLORS[index % COLORS.length]}33`}
                />
              );
            } else {
              return (
                <Bar 
                  key={key}
                  dataKey={key} 
                  name={config?.labels?.[key] || key} 
                  fill={config?.colors?.[key] || COLORS[index % COLORS.length]} 
                  radius={[4, 4, 0, 0]}
                />
              );
            }
          })}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

// Income Analysis Component
const IncomeAnalysis = ({ dateRange }) => {
  const { startDate, endDate } = getDateRange(dateRange);
  
  // Fetch income data
  const { data: incomeData, isLoading: loadingIncomeData } = useQuery({
    queryKey: ['incomeSourceBreakdown', dateRange],
    queryFn: async () => {
      // For real implementation, we would call a service function here
      // This would need to be implemented in analyticsService.js
      // For now, we'll return null to show the empty state
      return null;
    }
  });
  
  // Fetch income trends data
  const { data: incomeTrendsData, isLoading: loadingIncomeTrends } = useQuery({
    queryKey: ['incomeTrends', dateRange],
    queryFn: async () => {
      // For real implementation, fetch income trends
      // This would call a function in analyticsService.js
      // Return null to show empty state
      return null;
    }
  });
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>
            Breakdown of your income from different sources
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <EnhancedPieChart 
            data={incomeData} 
            isLoading={loadingIncomeData}
            emptyStateProps={{
              title: "No Income Sources Data",
              description: "Add transactions with income categories to see your income distribution.",
              actionLabel: "Add Transaction",
              onAction: () => console.log("Navigate to add transaction")
            }}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Income Trends</CardTitle>
          <CardDescription>
            Income changes over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <EnhancedChart 
            data={incomeTrendsData}
            isLoading={loadingIncomeTrends}
            chartType="line"
            emptyStateProps={{
              title: "No Income Trends Data",
              description: "Add more income transactions to see your income trends over time.",
              actionLabel: "Add Income",
              onAction: () => console.log("Navigate to add transaction")
            }}
            config={{
              dataKeys: ["salary", "freelance", "investments"],
              labels: {
                salary: "Salary",
                freelance: "Freelance",
                investments: "Investments"
              },
              colors: {
                salary: "#4CAF50",
                freelance: "#2196F3",
                investments: "#FF9800"
              }
            }}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Income Insights</CardTitle>
          <CardDescription>
            Smart recommendations to optimize your income
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingIncomeData ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : incomeData ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-800 mb-1">Diversify Income Sources</h4>
                <p className="text-sm text-blue-700">
                  85% of your income comes from salary. Consider diversifying with more freelance work or investments to reduce financial risk.
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-md">
                <h4 className="font-medium text-green-800 mb-1">Stable Income Growth</h4>
                <p className="text-sm text-green-700">
                  Your income has been growing steadily at approximately 2.1% per month over the past 6 months.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 border-2 border-dashed border-muted rounded-md">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="h-8 w-8 text-muted-foreground mb-2" />
                <h4 className="font-medium mb-1">Not Enough Data</h4>
                <p className="text-sm text-muted-foreground">
                  Add more income transactions to receive personalized income insights.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper function to get date range based on selection
const getDateRange = (dateRange) => {
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

// Main Analytics Component
export default function Analytics() {
  const [dateRange, setDateRange] = useState("6m");
  const [comparisonType, setComparisonType] = useState("month");
  const [exportFormat, setExportFormat] = useState("csv");
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  // Get date range for queries and display
  const { startDate, endDate } = getDateRange(dateRange);
  
  // Get date range for display
  const getDateRangeDisplay = () => {
    return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
  };

  // Fetch category spending data
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

  // Fetch monthly income/expense comparison data
  const { data: incomeExpenseData, isLoading: loadingIncomeExpenseData } = useQuery({
    queryKey: ['incomeExpenseData', dateRange],
    queryFn: () => getIncomeExpensesData(startDate, endDate, "month")
  });

  // Fetch monthly snapshot
  const { data: monthlySnapshot, isLoading: loadingSnapshot } = useQuery({
    queryKey: ['monthlySnapshot'],
    queryFn: getMonthlySnapshot
  });

  // Function to handle export
  const handleExport = async () => {
    try {
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
  const isLoading = loadingCategoryData || loadingMerchants || loadingSavingRate || loadingSnapshot || loadingIncomeExpenseData;

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
      
      {/* Financial Summary Cards */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Income</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {isLoading || !monthlySnapshot ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                ${monthlySnapshot.totalIncome.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Expenses</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {isLoading || !monthlySnapshot ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-red-600">
                ${monthlySnapshot.totalExpenses.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading || !monthlySnapshot ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                {monthlySnapshot.savingRate > 0 ? '+' : ''}{monthlySnapshot.savingRate.toFixed(1)}%
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            {isLoading || !monthlySnapshot ? (
              <Skeleton className="h-8 w-28" />
            ) : (
              <div className="text-2xl font-bold text-blue-600">
                ${monthlySnapshot.netSavings.toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
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
            <CardContent className="h-80">
              <EnhancedChart
                data={incomeExpenseData}
                isLoading={loadingIncomeExpenseData}
                chartType="bar"
                emptyStateProps={{
                  title: "No Income/Expense Data",
                  description: "Add transactions to see your income and expenses comparison.",
                  actionLabel: "Add Transaction",
                  onAction: () => console.log("Navigate to add transaction")
                }}
                config={{
                  dataKeys: ["income", "expenses", "net"],
                  labels: {
                    income: "Income",
                    expenses: "Expenses", 
                    net: "Net Savings"
                  },
                  colors: {
                    income: "#4CAF50",
                    expenses: "#FF5722",
                    net: "#2196F3"
                  }
                }}
              />
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
              <CardContent className="h-72">
                <EnhancedPieChart 
                  data={categorySpending} 
                  isLoading={loadingCategoryData}
                  emptyStateProps={{
                    title: "No Category Data",
                    description: "Add transactions with categories to see your spending breakdown.",
                    actionLabel: "Add Transaction",
                    onAction: () => console.log("Navigate to add transaction")
                  }}
                />
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
              <CardContent className="h-72">
                <EnhancedChart
                  data={savingRateData}
                  isLoading={loadingSavingRate}
                  chartType="bar"
                  emptyStateProps={{
                    title: "No Savings Rate Data",
                    description: "Add income and expense transactions to track your savings rate.",
                    actionLabel: "Add Transaction",
                    onAction: () => console.log("Navigate to add transaction")
                  }}
                  config={{
                    dataKeys: ["savingRate"],
                    labels: {
                      savingRate: "Saving Rate"
                    },
                    colors: {
                      savingRate: "#4CAF50"
                    },
                    yAxisFormatter: (value) => `${value}%`,
                    tooltipFormatter: (value) => [`${value}%`, "Saving Rate"]
                  }}
                />
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
                {loadingMerchants ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(index => (
                      <div key={index} className="flex items-center justify-between">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : merchantSpendingData && merchantSpendingData.length > 0 ? (
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
                    <BarChart className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium mb-1">No Merchant Data</p>
                    <p className="text-sm">Add expense transactions to see your top merchants.</p>
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
                {loadingSnapshot ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map(index => (
                      <div key={index} className="flex justify-between">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                    ))}
                  </div>
                ) : monthlySnapshot ? (
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
                ) : (
                  <div className="py-8 text-center text-muted-foreground">
                    <LineChart className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium mb-1">No Monthly Data</p>
                    <p className="text-sm">Add transactions to see your monthly financial summary.</p>
                  </div>
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
              <EnhancedPieChart 
                data={categorySpending} 
                isLoading={loadingCategoryData}
                emptyStateProps={{
                  title: "No Category Data Available",
                  description: "Add transactions with categories to see your detailed spending breakdown.",
                  actionLabel: "Add Transaction",
                  onAction: () => console.log("Navigate to add transaction")
                }}
              />
            </CardContent>
          </Card>
          
          {/* Monthly Spending Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Spending Trends</CardTitle>
              <CardDescription>
                How your spending has changed over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <MonthlyTrendChart />
            </CardContent>
          </Card>
          
          {/* Top Spending Categories Table */}
          <Card>
            <CardHeader>
              <CardTitle>Top Spending Categories</CardTitle>
              <CardDescription>
                Categories where you spend the most
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loadingCategoryData ? (
                  Array(5).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-gray-200 mr-3"></div>
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))
                ) : categorySpending && categorySpending.length > 0 ? (
                  categorySpending.slice(0, 5).map((category, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-3" 
                          style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}
                        ></div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-2">${category.amount.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground">({category.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center">
                    <PieChart className="mx-auto h-10 w-10 text-muted-foreground mb-3" />
                    <p className="font-medium mb-1">No Categories Found</p>
                    <p className="text-sm text-muted-foreground">Add transactions with categories to see your top spending categories.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
              
          {/* Spending by Weekday */}
          <Card>
            <CardHeader>
              <CardTitle>Spending by Day of Week</CardTitle>
              <CardDescription>
                Your spending patterns by day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <EnhancedChart
                data={null} // This would need a real service function to fetch data
                isLoading={false} // Set to true when implementing
                chartType="bar"
                emptyStateProps={{
                  title: "No Day-of-Week Data",
                  description: "Add more transactions to see spending patterns by day of the week.",
                  actionLabel: "Add Transaction",
                  onAction: () => console.log("Navigate to add transaction")
                }}
                config={{
                  dataKeys: ["amount"],
                  xAxis: "day",
                  labels: {
                    amount: "Daily Average"
                  },
                  colors: {
                    amount: "#3F51B5"
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="income" className="space-y-6">
          <IncomeAnalysis dateRange={dateRange} />
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          {/* Year Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Year-over-Year Comparison</CardTitle>
              <CardDescription>
                Compare your spending between this year and last year
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <YearComparisonChart />
            </CardContent>
          </Card>
          
          {/* Net Worth Trajectory */}
          <Card>
            <CardHeader>
              <CardTitle>Net Worth Trajectory</CardTitle>
              <CardDescription>
                Projected growth of your net worth based on current trends
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <EnhancedChart
                data={null} // This would need a real service function to fetch data
                isLoading={false} // Set to true when implementing
                chartType="line"
                emptyStateProps={{
                  title: "No Net Worth Data",
                  description: "Add accounts and transactions to see your net worth projection.",
                  actionLabel: "Add Account",
                  onAction: () => console.log("Navigate to add account")
                }}
                config={{
                  dataKeys: ["assets", "liabilities", "netWorth"],
                  labels: {
                    assets: "Assets",
                    liabilities: "Liabilities",
                    netWorth: "Net Worth"
                  },
                  colors: {
                    assets: "#4CAF50",
                    liabilities: "#F44336",
                    netWorth: "#2196F3"
                  }
                }}
              />
            </CardContent>
          </Card>
          
          {/* Spending Forecast */}
          <Card>
            <CardHeader>
              <CardTitle>Spending Forecast</CardTitle>
              <CardDescription>
                Predicted spending based on historical patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <EnhancedChart
                data={null} // This would need a real service function to fetch data
                isLoading={false} // Set to true when implementing
                chartType="line"
                emptyStateProps={{
                  title: "No Forecast Data",
                  description: "Add more expense transactions to enable spending forecasts.",
                  actionLabel: "Add Expense",
                  onAction: () => console.log("Navigate to add transaction")
                }}
                config={{
                  dataKeys: ["actual", "forecast", "upper", "lower"],
                  labels: {
                    actual: "Actual Spending",
                    forecast: "Forecasted Spending",
                    upper: "Upper Bound",
                    lower: "Lower Bound"
                  },
                  colors: {
                    actual: "#3F51B5",
                    forecast: "#3F51B5",
                    upper: "#E3F2FD",
                    lower: "#E3F2FD"
                  },
                  dashed: {
                    forecast: true
                  }
                }}
              />
            </CardContent>
          </Card>
          
          {/* Seasonal Spending Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Seasonal Spending Patterns</CardTitle>
              <CardDescription>
                How your spending changes throughout the year
              </CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <EnhancedChart
                data={null} // This would need a real service function to fetch data
                isLoading={false} // Set to true when implementing
                chartType="area"
                emptyStateProps={{
                  title: "No Seasonal Data",
                  description: "Add transactions across multiple months to see seasonal patterns.",
                  actionLabel: "Add Transaction",
                  onAction: () => console.log("Navigate to add transaction")
                }}
                config={{
                  dataKeys: ["value"],
                  xAxis: "name",
                  labels: {
                    value: "Monthly Spending"
                  },
                  colors: {
                    value: "#FF5722"
                  },
                  fillColors: {
                    value: "#FFCCBC"
                  }
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTemplate>
  );
}

