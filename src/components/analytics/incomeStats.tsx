import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart as RechartsBarChart,
  Bar
} from "recharts";

// Default colors
const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0'];

// Mock data for income sources
const incomeData = [
  { source: "Salary", amount: 5200, percentage: 85 },
  { source: "Freelance", amount: 650, percentage: 10 },
  { source: "Investments", amount: 320, percentage: 5 }
];

// Mock historical income data
const historicalIncome = [
  { month: "Jan", salary: 5000, freelance: 400, investments: 250 },
  { month: "Feb", salary: 5000, freelance: 550, investments: 270 },
  { month: "Mar", salary: 5200, freelance: 600, investments: 290 },
  { month: "Apr", salary: 5200, freelance: 750, investments: 300 },
  { month: "May", salary: 5200, freelance: 500, investments: 310 },
  { month: "Jun", salary: 5200, freelance: 650, investments: 320 },
];

// Mock income stability data
const incomeStabilityData = [
  { month: "Jan", value: 5650 },
  { month: "Feb", value: 5820 },
  { month: "Mar", value: 6090 },
  { month: "Apr", value: 6250 },
  { month: "May", value: 6010 },
  { month: "Jun", value: 6170 },
];

export default function IncomeSources({ dateRange }) {
  const [timeRange, setTimeRange] = useState("6m");

  return (
    <div className="space-y-6">
      {/* Income Sources Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Income Sources</CardTitle>
          <CardDescription>
            Breakdown of your income from different sources
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={incomeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent).toFixed(1)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="amount"
                  nameKey="source"
                >
                  {incomeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => `$${value.toLocaleString()}`}
                />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Income Trends Chart */}
      <Card>
        <CardHeader className="flex flex-col space-y-2 pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Income Trends</CardTitle>
            <Select value={timeRange} onValueChange={setTimeRange}>
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
            Income changes over the selected time period
          </CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsLineChart
              data={historicalIncome}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="salary" 
                name="Salary" 
                stroke="#4CAF50" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="freelance" 
                name="Freelance" 
                stroke="#2196F3" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="investments" 
                name="Investments" 
                stroke="#FF9800" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Income Stability Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Income Stability</CardTitle>
          <CardDescription>
            Monthly income variability
          </CardDescription>
        </CardHeader>
        <CardContent className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={incomeStabilityData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis domain={[5000, 'auto']} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, "Total Income"]}
              />
              <Bar 
                dataKey="value" 
                name="Total Income" 
                fill="#4CAF50" 
                radius={[4, 4, 0, 0]}
              />
            </RechartsBarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Income Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Income Insights</CardTitle>
          <CardDescription>
            Smart recommendations to optimize your income
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            <div className="p-4 bg-amber-50 rounded-md">
              <h4 className="font-medium text-amber-800 mb-1">Freelance Opportunities</h4>
              <p className="text-sm text-amber-700">
                Your freelance income varies significantly month-to-month. Consider seeking more consistent clients.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}