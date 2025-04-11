
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { mockIncomeVsExpenses } from '@/lib/mockData';

export default function IncomeVsExpensesChart() {
  return (
    <div className="budget-card min-h-[350px] animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Income vs Expenses</h2>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={mockIncomeVsExpenses}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis dataKey="month" />
            <YAxis 
              tickFormatter={(value) => `$${value}`} 
              width={50}
            />
            <Tooltip 
              formatter={(value) => `$${Number(value).toLocaleString()}`} 
              labelFormatter={(label) => `Month: ${label}`}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="income"
              name="Income"
              stroke="#4CAF50"
              fill="#4CAF50"
              fillOpacity={0.2}
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
            <Area
              type="monotone"
              dataKey="expenses"
              name="Expenses"
              stroke="#F44336"
              fill="#F44336"
              fillOpacity={0.2}
              strokeWidth={2}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
