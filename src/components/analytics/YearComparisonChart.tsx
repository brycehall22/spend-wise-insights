import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart as BarChartIcon, Calendar } from 'lucide-react';
import { getYearOverYearData } from '@/services/analyticsService';

export default function YearComparisonChart() {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  // Fetch year-over-year data
  const { data: yearComparisonData, isLoading, error } = useQuery({
    queryKey: ['yearOverYearData'],
    queryFn: getYearOverYearData
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full">
        <div className="flex items-center justify-between mb-4">
          <Skeleton className="h-6 w-40" />
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
          <BarChartIcon className="h-10 w-10 text-red-500" />
        </div>
        <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
        <p className="text-muted-foreground text-center max-w-md">
          There was a problem loading your year-over-year comparison data. Please try again later.
        </p>
      </div>
    );
  }

  // Empty state (no data)
  if (!yearComparisonData || !Array.isArray(yearComparisonData) || yearComparisonData.length === 0) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="bg-muted p-4 rounded-full mb-4">
          <Calendar className="h-10 w-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No Year-Over-Year Data</h3>
        <p className="text-muted-foreground text-center max-w-md">
          Add transactions from this year and last year to see yearly comparisons.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Year-over-Year Comparison</h3>
      </div>

      <div className="h-[calc(100%-40px)]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={yearComparisonData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => `$${value}`} />
            <Tooltip 
              formatter={(value) => [`$${Number(value).toLocaleString()}`, ""]}
            />
            <Legend />
            <Bar 
              dataKey="currentYear" 
              name={`${currentYear}`} 
              fill="#4CAF50" 
              radius={[4, 4, 0, 0]}
            />
            <Bar 
              dataKey="previousYear" 
              name={`${previousYear}`} 
              fill="#2196F3" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
