import React from 'react';
import { 
  BarChart as RechartsBarChart, 
  LineChart as RechartsLineChart,
  AreaChart as RechartsAreaChart,
  PieChart as RechartsPieChart,
  Bar, 
  Line, 
  Area,
  Pie,
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "../EmptyState";
import { BarChart, LineChart, PieChart } from "lucide-react";

// Default colors for charts
const COLORS = ['#FF5722', '#2196F3', '#4CAF50', '#9C27B0', '#FFC107', '#607D8B', '#795548', '#3F51B5', '#E91E63', '#00BCD4'];

// =========== Chart Config Types ===========

interface ChartBaseConfig {
  xAxis?: string;
  yAxisFormatter?: (value: number) => string;
  tooltipFormatter?: (value: number, name: string, props: any) => [string, string];
  labels?: Record<string, string>;
  colors?: Record<string, string>;
}

interface LineChartConfig extends ChartBaseConfig {
  dataKeys: string[];
  dashed?: Record<string, boolean>;
}

interface BarChartConfig extends ChartBaseConfig {
  dataKeys: string[];
  stacked?: boolean;
}

interface AreaChartConfig extends ChartBaseConfig {
  dataKeys: string[];
  fillColors?: Record<string, string>;
  stacked?: boolean;
}

interface PieChartConfig {
  dataKey?: string;
  nameKey?: string;
  labelFormatter?: (item: any) => string;
}

// =========== Enhanced Chart Components ===========

interface EnhancedChartBaseProps {
  data: any[] | null;
  isLoading: boolean;
  emptyStateProps: {
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
  };
  height?: number | string;
  className?: string;
}

/**
 * Enhanced Bar Chart with loading and empty states
 */
export function EnhancedBarChart({
  data,
  isLoading,
  emptyStateProps,
  config,
  height = "100%",
  className
}: EnhancedChartBaseProps & { config: BarChartConfig }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Skeleton className="h-full w-full rounded" />
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        icon={<BarChart className="h-8 w-8 text-muted-foreground" />}
        {...emptyStateProps}
      />
    );
  }
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis dataKey={config?.xAxis || "month"} />
          <YAxis tickFormatter={config?.yAxisFormatter || ((value) => `$${value}`)} />
          <Tooltip 
            formatter={config?.tooltipFormatter || ((value) => [`$${Number(value).toLocaleString()}`, ""])}
          />
          <Legend />
          {config?.dataKeys.map((key, index) => (
            <Bar 
              key={key}
              dataKey={key} 
              name={config?.labels?.[key] || key} 
              fill={config?.colors?.[key] || COLORS[index % COLORS.length]} 
              radius={[4, 4, 0, 0]}
              stackId={config?.stacked ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Enhanced Line Chart with loading and empty states
 */
export function EnhancedLineChart({
  data,
  isLoading,
  emptyStateProps,
  config,
  height = "100%",
  className
}: EnhancedChartBaseProps & { config: LineChartConfig }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Skeleton className="h-full w-full rounded" />
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        icon={<LineChart className="h-8 w-8 text-muted-foreground" />}
        {...emptyStateProps}
      />
    );
  }
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis dataKey={config?.xAxis || "month"} />
          <YAxis tickFormatter={config?.yAxisFormatter || ((value) => `$${value}`)} />
          <Tooltip 
            formatter={config?.tooltipFormatter || ((value) => [`$${Number(value).toLocaleString()}`, ""])}
          />
          <Legend />
          {config?.dataKeys.map((key, index) => (
            <Line 
              key={key}
              type="monotone" 
              dataKey={key} 
              name={config?.labels?.[key] || key} 
              stroke={config?.colors?.[key] || COLORS[index % COLORS.length]} 
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              strokeDasharray={config?.dashed?.[key] ? "5 5" : undefined}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Enhanced Area Chart with loading and empty states
 */
export function EnhancedAreaChart({
  data,
  isLoading,
  emptyStateProps,
  config,
  height = "100%",
  className
}: EnhancedChartBaseProps & { config: AreaChartConfig }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Skeleton className="h-full w-full rounded" />
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        icon={<LineChart className="h-8 w-8 text-muted-foreground" />}
        {...emptyStateProps}
      />
    );
  }
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsAreaChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis dataKey={config?.xAxis || "month"} />
          <YAxis tickFormatter={config?.yAxisFormatter || ((value) => `$${value}`)} />
          <Tooltip 
            formatter={config?.tooltipFormatter || ((value) => [`$${Number(value).toLocaleString()}`, ""])}
          />
          <Legend />
          {config?.dataKeys.map((key, index) => {
            const color = config?.colors?.[key] || COLORS[index % COLORS.length];
            const fillColor = config?.fillColors?.[key] || `${color}33`; // Default to semi-transparent
            
            return (
              <Area 
                key={key}
                type="monotone" 
                dataKey={key} 
                name={config?.labels?.[key] || key} 
                stroke={color} 
                fill={fillColor}
                stackId={config?.stacked ? "stack" : undefined}
              />
            );
          })}
        </RechartsAreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Enhanced Pie Chart with loading and empty states
 */
export function EnhancedPieChart({
  data,
  isLoading,
  emptyStateProps,
  config = {
    dataKey: "amount",
    nameKey: "name",
    labelFormatter: (item) => `${item.name}: ${(item.percent * 100).toFixed(1)}%`
  },
  height = "100%",
  className
}: EnhancedChartBaseProps & { config?: PieChartConfig }) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full w-full">
        <Skeleton className="h-60 w-60 rounded-full" />
      </div>
    );
  }
  
  if (!data || data.length === 0) {
    return (
      <EmptyState 
        icon={<PieChart className="h-8 w-8 text-muted-foreground" />}
        {...emptyStateProps}
      />
    );
  }
  
  const dataKey = config?.dataKey || "amount";
  const nameKey = config?.nameKey || "name";
  
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height={height}>
        <RechartsPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={config?.labelFormatter || ((item) => `${item.name}: ${(item.percent * 100).toFixed(1)}%`)}
            outerRadius={120}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || COLORS[index % COLORS.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value) => `$${Number(value).toFixed(2)}`}
          />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * Unified chart component that can render different chart types
 */
export function EnhancedChart({
  data,
  isLoading,
  emptyStateProps,
  chartType = "line",
  config,
  height = "100%",
  className
}: EnhancedChartBaseProps & { 
  chartType: 'line' | 'bar' | 'area' | 'pie',
  config: LineChartConfig | BarChartConfig | AreaChartConfig | PieChartConfig
}) {
  // Determine which chart component to use based on type
  switch (chartType) {
    case 'bar':
      return (
        <EnhancedBarChart 
          data={data}
          isLoading={isLoading}
          emptyStateProps={emptyStateProps}
          config={config as BarChartConfig}
          height={height}
          className={className}
        />
      );
    case 'line':
      return (
        <EnhancedLineChart 
          data={data}
          isLoading={isLoading}
          emptyStateProps={emptyStateProps}
          config={config as LineChartConfig}
          height={height}
          className={className}
        />
      );
    case 'area':
      return (
        <EnhancedAreaChart 
          data={data}
          isLoading={isLoading}
          emptyStateProps={emptyStateProps}
          config={config as AreaChartConfig}
          height={height}
          className={className}
        />
      );
    case 'pie':
      return (
        <EnhancedPieChart 
          data={data}
          isLoading={isLoading}
          emptyStateProps={emptyStateProps}
          config={config as PieChartConfig}
          height={height}
          className={className}
        />
      );
    default:
      return (
        <EnhancedLineChart 
          data={data}
          isLoading={isLoading}
          emptyStateProps={emptyStateProps}
          config={config as LineChartConfig}
          height={height}
          className={className}
        />
      );
  }
}