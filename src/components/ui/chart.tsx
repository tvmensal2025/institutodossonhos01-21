import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart as RechartsAreaChart,
  Bar,
  BarChart as RechartsBarChart,
  ReferenceLine
} from 'recharts';

interface ChartProps {
  data: Record<string, unknown>[];
  xField: string;
  height?: number;
}

interface LineChartProps extends ChartProps {
  yField: string;
  referenceLines?: {
    value: number;
    label: string;
    color: string;
  }[];
}

interface AreaChartProps extends ChartProps {
  yField: string;
  gradient?: boolean;
  color?: string;
}

interface BarChartProps extends ChartProps {
  series: {
    name: string;
    field: string;
    type?: 'bar' | 'line';
  }[];
}

const defaultHeight = 300;

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xField,
  yField,
  height = defaultHeight,
  referenceLines = []
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey={yField} stroke="hsl(var(--primary))" strokeWidth={2} />
        {referenceLines.map((line, index) => (
          <ReferenceLine
            key={index}
            y={line.value}
            label={line.label}
            stroke={line.color}
            strokeDasharray="3 3"
          />
        ))}
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export const AreaChart: React.FC<AreaChartProps> = ({
  data,
  xField,
  yField,
  height = defaultHeight,
  gradient = false,
  color = 'hsl(var(--primary))'
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsAreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip />
        <defs>
          {gradient && (
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.8} />
              <stop offset="95%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          )}
        </defs>
        <Area
          type="monotone"
          dataKey={yField}
          stroke={color}
          fill={gradient ? "url(#colorGradient)" : color}
          fillOpacity={gradient ? 1 : 0.3}
        />
      </RechartsAreaChart>
    </ResponsiveContainer>
  );
};

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xField,
  series,
  height = defaultHeight
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xField} />
        <YAxis />
        <Tooltip />
        {series.map((s, index) => (
          s.type === 'line' ? (
            <Line
              key={index}
              type="monotone"
              dataKey={s.field}
              name={s.name}
              stroke="hsl(var(--primary))"
              strokeWidth={2}
            />
          ) : (
            <Bar
              key={index}
              dataKey={s.field}
              name={s.name}
              fill="hsl(var(--primary))"
              opacity={0.8}
            />
          )
        ))}
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};
