
import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for monthly trends
const monthlyTrendData = [
  { month: "Jan", groceries: 385, utilities: 195, entertainment: 115, shopping: 210, dining: 165 },
  { month: "Feb", groceries: 350, utilities: 210, entertainment: 125, shopping: 180, dining: 155 },
  { month: "Mar", groceries: 390, utilities: 200, entertainment: 140, shopping: 230, dining: 175 },
  { month: "Apr", groceries: 370, utilities: 215, entertainment: 130, shopping: 195, dining: 190 },
  { month: "May", groceries: 410, utilities: 205, entertainment: 120, shopping: 185, dining: 170 },
  { month: "Jun", groceries: 395, utilities: 225, entertainment: 135, shopping: 200, dining: 185 }
];

// Define colors for each category
const categoryColors = {
  groceries: "#4CAF50",
  utilities: "#2196F3",
  entertainment: "#F44336",
  shopping: "#9C27B0",
  dining: "#FF9800"
};

const categoryNames = {
  groceries: "Groceries",
  utilities: "Utilities",
  entertainment: "Entertainment",
  shopping: "Shopping",
  dining: "Dining Out"
};

export default function MonthlyTrendChart() {
  const [visibleCategories, setVisibleCategories] = useState<string[]>(
    Object.keys(categoryNames)
  );
  const [timeRange, setTimeRange] = useState("6m");

  const toggleCategory = (category: string) => {
    setVisibleCategories(current => 
      current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category]
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-col space-y-2 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>Monthly Category Trends</CardTitle>
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
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyTrendData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `$${value}`} width={50} />
              <Tooltip 
                formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend 
                formatter={(value) => categoryNames[value as keyof typeof categoryNames] || value}
                onClick={({ dataKey }) => toggleCategory(dataKey as string)} 
              />
              {Object.keys(categoryNames).map(category => 
                visibleCategories.includes(category) && (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={categoryColors[category as keyof typeof categoryColors]}
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                    dot={{ r: 3 }}
                  />
                )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
