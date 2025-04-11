
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for year comparison
const yearComparisonData = [
  { month: 'Jan', currentYear: 4200, previousYear: 3800 },
  { month: 'Feb', currentYear: 4350, previousYear: 3900 },
  { month: 'Mar', currentYear: 4700, previousYear: 4100 },
  { month: 'Apr', currentYear: 4500, previousYear: 4000 },
  { month: 'May', currentYear: 4650, previousYear: 4200 },
  { month: 'Jun', currentYear: 4800, previousYear: 4300 },
  { month: 'Jul', currentYear: 5000, previousYear: 4500 },
  { month: 'Aug', currentYear: 4900, previousYear: 4400 },
  { month: 'Sep', currentYear: 4850, previousYear: 4300 },
  { month: 'Oct', currentYear: 4700, previousYear: 4200 },
  { month: 'Nov', currentYear: 4500, previousYear: 4100 },
  { month: 'Dec', currentYear: 4300, previousYear: 3900 }
];

export default function YearComparisonChart() {
  const currentYear = new Date().getFullYear();
  const previousYear = currentYear - 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Year-over-Year Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
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
      </CardContent>
    </Card>
  );
}
