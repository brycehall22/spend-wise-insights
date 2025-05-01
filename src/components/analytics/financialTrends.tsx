import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  ComposedChart,
  Scatter
} from "recharts";

// Import enhanced chart components
import YearComparisonChart from "@/components/analytics/YearComparisonChart";
import MonthlyTrendChart from "@/components/analytics/MonthlyTrendChart";

// Mock data for net worth trajectory
const netWorthData = [
  { month: "Now", assets: 65000, liabilities: 25000, netWorth: 40000 },
  { month: "3mo", assets: 68000, liabilities: 24000, netWorth: 44000 },
  { month: "6mo", assets: 72000, liabilities: 22000, netWorth: 50000 },
  { month: "9mo", assets: 75000, liabilities: 21000, netWorth: 54000 },
  { month: "1yr", assets: 80000, liabilities: 19000, netWorth: 61000 },
  { month: "2yr", assets: 95000, liabilities: 15000, netWorth: 80000 },
  { month: "3yr", assets: 110000, liabilities: 10000, netWorth: 100000 },
];

// Mock data for spending forecast
const forecastData = [
  { month: "Jul", actual: 4500, forecast: null, lower: null, upper: null },
  { month: "Aug", actual: 4650, forecast: null, lower: null, upper: null },
  { month: "Sep", actual: 4800, forecast: null, lower: null, upper: null },
  { month: "Oct", actual: 4700, forecast: null, lower: null, upper: null },
  { month: "Nov", actual: 4850, forecast: null, lower: null, upper: null },
  { month: "Dec", actual: 4900, forecast: null, lower: null, upper: null },
  { month: "Jan", actual: null, forecast: 4950, lower: 4650, upper: 5250 },
  { month: "Feb", actual: null, forecast: 5000, lower: 4600, upper: 5400 },
  { month: "Mar", actual: null, forecast: 5050, lower: 4550, upper: 5550 },
];

// Mock data for seasonal spending
const seasonalData = [
  { name: "Jan", value: 4200 },
  { name: "Feb", value: 4100 },
  { name: "Mar", value: 4300 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 4600 },
  { name: "Jun", value: 4800 },
  { name: "Jul", value: 5000 },
  { name: "Aug", value: 5200 },
  { name: "Sep", value: 4900 },
  { name: "Oct", value: 4700 },
  { name: "Nov", value: 4500 },
  { name: "Dec", value: 5500 },
];

export default function FinancialTrends({ dateRange }) {
  const [forecastRange, setForecastRange] = useState("6m");
  const [trendType, setTrendType] = useState("spending");

  return (
    <div className="space-y-6">
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
      
      {/* Monthly Category Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Category Trends</CardTitle>
          <CardDescription>
            How your spending in each category changes over time
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <MonthlyTrendChart />
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
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={netWorthData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value/1000}k`} />
              <Tooltip 
                formatter={(value) => [`${Number(value).toLocaleString()}`, ""]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="assets" 
                name="Assets" 
                stroke="#4CAF50" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="liabilities" 
                name="Liabilities" 
                stroke="#F44336" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="netWorth" 
                name="Net Worth" 
                stroke="#2196F3" 
                strokeWidth={3}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Spending Forecast */}
      <Card>
        <CardHeader className="flex flex-col space-y-2 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Spending Forecast</CardTitle>
            <Select value={forecastRange} onValueChange={setForecastRange}>
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3m">3 Months</SelectItem>
                <SelectItem value="6m">6 Months</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <CardDescription>
            Predicted spending based on historical patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={forecastData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `${value}`} />
              <Tooltip 
                formatter={(value) => [`${Number(value).toLocaleString()}`, ""]}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="upper" 
                fill="#E3F2FD" 
                stroke="none" 
                activeDot={false}
                name="Forecast Range"
              />
              <Area 
                type="monotone" 
                dataKey="lower" 
                fill="#E3F2FD" 
                stroke="none" 
                activeDot={false}
                name="Forecast Range"
              />
              <Line 
                type="monotone" 
                dataKey="actual" 
                name="Actual Spending" 
                stroke="#3F51B5" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="forecast" 
                name="Forecasted Spending" 
                stroke="#3F51B5" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
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
          <Tabs 
            value={trendType} 
            onValueChange={setTrendType} 
            className="w-full"
          >
            <TabsList className="mb-4">
              <TabsTrigger value="spending">Spending</TabsTrigger>
              <TabsTrigger value="income">Income</TabsTrigger>
              <TabsTrigger value="savings">Savings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="spending" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={seasonalData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toLocaleString()}`, "Spending"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#FF5722" 
                    fill="#FFCCBC" 
                    name="Monthly Spending"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="income" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: "Jan", value: 5500 },
                    { name: "Feb", value: 5500 },
                    { name: "Mar", value: 5800 },
                    { name: "Apr", value: 5800 },
                    { name: "May", value: 5800 },
                    { name: "Jun", value: 6100 },
                    { name: "Jul", value: 6100 },
                    { name: "Aug", value: 6100 },
                    { name: "Sep", value: 6300 },
                    { name: "Oct", value: 6300 },
                    { name: "Nov", value: 6300 },
                    { name: "Dec", value: 6800 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toLocaleString()}`, "Income"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4CAF50" 
                    fill="#C8E6C9" 
                    name="Monthly Income"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
            
            <TabsContent value="savings" className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: "Jan", value: 1300 },
                    { name: "Feb", value: 1400 },
                    { name: "Mar", value: 1500 },
                    { name: "Apr", value: 1300 },
                    { name: "May", value: 1200 },
                    { name: "Jun", value: 1300 },
                    { name: "Jul", value: 1100 },
                    { name: "Aug", value: 900 },
                    { name: "Sep", value: 1400 },
                    { name: "Oct", value: 1600 },
                    { name: "Nov", value: 1800 },
                    { name: "Dec", value: 1300 },
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    formatter={(value) => [`${Number(value).toLocaleString()}`, "Savings"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#2196F3" 
                    fill="#BBDEFB" 
                    name="Monthly Savings"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
    );
}