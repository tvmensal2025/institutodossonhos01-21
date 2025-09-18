import { memo, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

interface ChartData {
  date: string;
  value: number;
  [key: string]: any;
}

interface OptimizedChartProps {
  data: ChartData[];
  type?: 'line' | 'area';
  dataKey?: string;
  title?: string;
  color?: string;
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { 
    day: '2-digit', 
    month: 'short' 
  });
};

const formatTooltipValue = (value: number) => {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });
};

export const OptimizedChart = memo(({
  data,
  type = 'line',
  dataKey = 'value',
  title,
  color = '#3B82F6',
  height = 300,
  showGrid = true,
  showLegend = false
}: OptimizedChartProps) => {
  
  // Memorize processed data
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    return data.map(item => ({
      ...item,
      formattedDate: formatDate(item.date)
    }));
  }, [data]);
  
  // Memorize tooltip content
  const CustomTooltip = useCallback(({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm text-gray-600">{label}</p>
          <p className="text-lg font-bold" style={{ color }}>
            {formatTooltipValue(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  }, [color]);
  
  // Early return if no data
  if (!processedData || processedData.length === 0) {
    return (
      <div className="flex items-center justify-center" style={{ height }}>
        <p className="text-gray-500">Sem dados disponíveis</p>
      </div>
    );
  }
  
  const Chart = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;
  
  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4 text-gray-800">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <Chart 
          data={processedData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              vertical={false}
            />
          )}
          <XAxis 
            dataKey="formattedDate" 
            stroke="#9CA3AF"
            fontSize={12}
            tickMargin={10}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tickMargin={10}
            tickFormatter={(value) => value.toFixed(0)}
          />
          <Tooltip content={CustomTooltip} />
          {showLegend && <Legend />}
          <DataComponent
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            fill={color}
            fillOpacity={type === 'area' ? 0.1 : 1}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.data === nextProps.data &&
    prevProps.type === nextProps.type &&
    prevProps.dataKey === nextProps.dataKey &&
    prevProps.color === nextProps.color
  );
});

OptimizedChart.displayName = 'OptimizedChart';