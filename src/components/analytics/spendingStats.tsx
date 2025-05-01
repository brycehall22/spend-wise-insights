import { useQuery } from "@tanstack/react-query";
import { getSpendingByCategory } from "@/services/dashboardService";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

// Default colors for categories
const COLORS = ['#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#FFC107', '#607D8B', '#795548', '#3F51B5', '#E91E63', '#00BCD4'];

export default function SpendingByCategoryChart() {
  // Get current month bounds
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString().split('T')[0];
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).toISOString().split('T')[0];
  
  // Fetch spending by category
  const { data: categoryData, isLoading, error } = useQuery({
    queryKey: ['categorySpending', startOfMonth, endOfMonth],
    queryFn: () => getSpendingByCategory(startOfMonth, endOfMonth),
  });
  
  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Skeleton className="h-40 w-40 rounded-full" />
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="p-4 h-full w-full flex items-center justify-center bg-red-50 text-red-800 rounded-md">
        <p>Unable to load category spending data.</p>
      </div>
    );
  }
  
  // Empty state
  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="p-4 h-full w-full flex items-center justify-center bg-gray-50 text-gray-500 rounded-md">
        <p>No spending data available for {format(currentDate, 'MMMM yyyy')}</p>
      </div>
    );
  }
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="custom-tooltip bg-white p-3 border border-gray-200 shadow-md rounded-md">
          <p className="font-medium">{data.category}</p>
          <p className="text-gray-800">${data.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          <p className="text-gray-600 text-sm">{data.percentage.toFixed(1)}% of total</p>
        </div>
      );
    }
    return null;
  };
  
  // Calculate total spending and percentages
  const totalSpending = categoryData.reduce((sum, category) => sum + category.amount, 0);
  
  // Add percentage to each category
  const dataWithPercentage = categoryData.map(category => ({
    ...category,
    percentage: (category.amount / totalSpending) * 100
  }));
  
  // Render custom label with percentage
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    // Only show label if percentage is significant (> 5%)
    if (percent < 0.05) return null;
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="h-full w-full"> {/* Ensure chart container is full height/width */}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="amount"
            nameKey="category"
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend layout="vertical" align="right" verticalAlign="middle" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}