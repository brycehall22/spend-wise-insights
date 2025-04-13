
import { useQuery } from "@tanstack/react-query";
import { getMonthlyComparisonData } from "@/services/dashboardService";
import { format, subMonths } from "date-fns";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  TooltipProps,
} from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function IncomeVsExpensesChart() {
  // Fetch monthly comparison data
  const { data: monthlyData, isLoading, error } = useQuery({
    queryKey: ['monthlyComparison'],
    queryFn: getMonthlyComparisonData,
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">Income vs Expenses</h3>
        <div className="h-64">
          <Skeleton className="h-full w-full" />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-2">Income vs Expenses</h3>
        <div className="p-4 h-64 flex items-center justify-center bg-red-50 text-red-800 rounded-md">
          <p>Unable to load chart data.</p>
        </div>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: ${entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}K`;
    return `$${value}`;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">Income vs Expenses</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={monthlyData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={formatYAxis} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="income" name="Income" fill="#4CAF50" />
            <Bar dataKey="expenses" name="Expenses" fill="#FF5722" />
            <Bar dataKey="savings" name="Savings" fill="#2196F3" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
