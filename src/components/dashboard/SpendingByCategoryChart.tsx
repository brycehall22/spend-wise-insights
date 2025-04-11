
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { getCategoryColors, getSpendingByCategory } from "@/lib/mockData";

export default function SpendingByCategoryChart() {
  const data = getSpendingByCategory();
  const categoryColors = getCategoryColors();
  
  return (
    <div className="budget-card min-h-[350px] animate-fade-in">
      <h2 className="text-lg font-semibold mb-4 text-spendwise-oxford">Spending by Category</h2>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="amount"
              nameKey="category"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={categoryColors[entry.category] || `hsl(${index * 45 % 360}, 70%, 60%)`} 
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
            <Legend layout="vertical" align="right" verticalAlign="middle" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
