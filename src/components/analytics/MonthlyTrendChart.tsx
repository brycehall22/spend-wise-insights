import { useState, useEffect } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { format, subMonths } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, TrendingUp } from "lucide-react";

// Define colors for each category
const categoryColors = {
  groceries: "#4CAF50",
  utilities: "#2196F3",
  entertainment: "#F44336",
  shopping: "#9C27B0",
  dining: "#FF9800",
  transport: "#607D8B",
  health: "#795548",
  housing: "#3F51B5",
  personal: "#E91E63",
  other: "#00BCD4"
};

const getCategoryName = (key: string): string => {
  const names: Record<string, string> = {
    groceries: "Groceries",
    utilities: "Utilities",
    entertainment: "Entertainment",
    shopping: "Shopping",
    dining: "Dining Out",
    transport: "Transportation",
    health: "Healthcare",
    housing: "Housing",
    personal: "Personal",
    other: "Other"
  };
  
  return names[key] || key.charAt(0).toUpperCase() + key.slice(1);
};

// Function to fetch monthly category trends
const fetchMonthlyCategoryTrends = async (months: number = 6) => {
  
  try {
    const response = await fetch(`/api/analytics/category-trends?months=${months}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching category trends:", error);
    throw error;
  }
};

export default function MonthlyTrendChart() {
  const [timeRange, setTimeRange] = useState("6m");
  const [visibleCategories, setVisibleCategories] = useState<string[]>([]);
  
  // Calculate how many months to fetch based on selected time range
  const monthsToFetch = timeRange === "3m" ? 3 : timeRange === "1y" ? 12 : 6;
  
  // Fetch the data
  const { data: trendData, isLoading, error } = useQuery({
    queryKey: ['categoryTrends', timeRange],
    queryFn: () => fetchMonthlyCategoryTrends(monthsToFetch),
  });
  
  // When data is loaded, initialize visible categories
  useEffect(() => {
    if (trendData && Array.isArray(trendData) && trendData.length > 0) {
      // Get all category keys from the first data item, excluding 'month'
      const firstDataItem = trendData[0];
      const categoryKeys = Object.keys(firstDataItem).filter(key => key !== 'month');
      
      // Initialize with all categories visible
      setVisibleCategories(categoryKeys);
    }
  }, [trendData]);

  // Toggle category visibility
  const toggleCategory = (category: string) => {
    setVisibleCategories(current => 
      current.includes(category)
        ? current.filter(c => c !== category)
        : [...current, category]
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-28" />
        </div>
        <div className="h-[calc(100%-40px)]">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <BarChart className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
        <p className="text-muted-foreground text-center max-w-md">
          There was a problem loading your category trends data. Please try again later.
        </p>
      </div>
    );
  }
  
  // Empty state (no data)
  if (!trendData || !Array.isArray(trendData) || trendData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="bg-muted p-4 rounded-full mb-4">
          <TrendingUp className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Category Trends Available</h3>
        <p className="text-muted-foreground text-center max-w-md mb-4">
          Add transactions across multiple months with categories to see how your spending changes over time.
        </p>
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
    );
  }

  // Available if we have data
  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Monthly Category Trends</h3>
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

      <div className="h-[calc(100%-40px)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={trendData}
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
              formatter={(value) => getCategoryName(value)}
              onClick={({ dataKey }) => toggleCategory(dataKey as string)} 
            />
            {visibleCategories.map(category => (
              <Line
                key={category}
                type="monotone"
                dataKey={category}
                name={category}
                stroke={categoryColors[category as keyof typeof categoryColors] || "#999"}
                strokeWidth={2}
                activeDot={{ r: 6 }}
                dot={{ r: 3 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
