import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GaugeChartProps {
  title: string;
  value: number;
  minValue?: number;
  maxValue?: number;
  unit?: string;
  target?: number;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  showTarget?: boolean;
  className?: string;
  colorScheme?: 'default' | 'health' | 'body-fat' | 'muscle' | 'water';
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  title,
  value,
  minValue = 0,
  maxValue = 100,
  unit = '',
  target,
  subtitle,
  size = 'md',
  showTarget = false,
  className = '',
  colorScheme = 'default'
}) => {
  const radius = size === 'lg' ? 80 : size === 'md' ? 60 : 40;
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 10 : 8;
  const circumference = 2 * Math.PI * radius * 0.75; // 3/4 circle
  
  // Normalize value to percentage
  const percentage = Math.max(0, Math.min(100, ((value - minValue) / (maxValue - minValue)) * 100));
  const targetPercentage = target ? Math.max(0, Math.min(100, ((target - minValue) / (maxValue - minValue)) * 100)) : 0;
  
  const getColor = () => {
    switch (colorScheme) {
      case 'health':
        if (percentage <= 20) return '#EF4444'; // red
        if (percentage <= 40) return '#F97316'; // orange
        if (percentage <= 60) return '#F59E0B'; // yellow
        if (percentage <= 80) return '#84CC16'; // lime
        return '#10B981'; // green
      
      case 'body-fat':
        if (percentage <= 15) return '#10B981'; // green - low fat
        if (percentage <= 25) return '#84CC16'; // lime - normal
        if (percentage <= 35) return '#F59E0B'; // yellow - high
        return '#EF4444'; // red - very high
      
      case 'muscle':
        if (percentage <= 30) return '#EF4444'; // red - low muscle
        if (percentage <= 40) return '#F97316'; // orange
        if (percentage <= 50) return '#F59E0B'; // yellow
        if (percentage <= 60) return '#84CC16'; // lime
        return '#10B981'; // green - high muscle
      
      case 'water':
        if (percentage <= 40) return '#EF4444'; // red - dehydrated
        if (percentage <= 50) return '#F97316'; // orange
        if (percentage <= 60) return '#F59E0B'; // yellow
        if (percentage <= 70) return '#84CC16'; // lime
        return '#10B981'; // green - well hydrated
      
      default:
        return 'hsl(var(--primary))';
    }
  };

  const color = getColor();
  
  return (
    <Card className={`relative ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-center">{title}</CardTitle>
        {subtitle && (
          <p className="text-xs text-muted-foreground text-center">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <div className="relative">
          <svg
            width={radius * 2 + 40}
            height={radius * 1.5 + 20}
            className="transform -rotate-90"
          >
            {/* Background circle */}
            <path
              d={`M ${20} ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 10}`}
              fill="none"
              stroke="hsl(var(--muted) / 0.3)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Target line (if enabled) */}
            {showTarget && target && (
              <path
                d={`M ${20} ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 10}`}
                fill="none"
                stroke="hsl(var(--muted-foreground) / 0.5)"
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray={`${(circumference * targetPercentage) / 100} ${circumference}`}
                className="opacity-60"
              />
            )}
            
            {/* Value arc */}
            <path
              d={`M ${20} ${radius + 10} A ${radius} ${radius} 0 0 1 ${radius * 2 + 20} ${radius + 10}`}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${(circumference * percentage) / 100} ${circumference}`}
              style={{
                filter: 'drop-shadow(0 0 6px rgba(59, 130, 246, 0.3))'
              }}
            />
          </svg>
          
          {/* Center value */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-2xl font-bold" style={{ color }}>
              {value.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">{unit}</div>
            {showTarget && target && (
              <>
                <div className="text-xs text-muted-foreground mt-1">
                  Target: {target.toFixed(1)}{unit}
                </div>
                <div 
                  className={`text-xs font-medium ${
                    value >= target ? 'text-green-500' : 'text-orange-500'
                  }`}
                >
                  {value >= target ? '✓' : `${(target - value).toFixed(1)} to go`}
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Scale indicators */}
        <div className="flex justify-between w-full text-xs text-muted-foreground mt-2 px-2">
          <span>{minValue}</span>
          <span>{maxValue}</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface MultiGaugeChartProps {
  title: string;
  data: Array<{
    label: string;
    value: number;
    unit?: string;
    minValue?: number;
    maxValue?: number;
    target?: number;
    colorScheme?: 'default' | 'health' | 'body-fat' | 'muscle' | 'water';
  }>;
  className?: string;
}

export const MultiGaugeChart: React.FC<MultiGaugeChartProps> = ({
  title,
  data,
  className = ''
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((item, index) => (
            <GaugeChart
              key={index}
              title={item.label}
              value={item.value}
              unit={item.unit || ''}
              minValue={item.minValue || 0}
              maxValue={item.maxValue || 100}
              target={item.target}
              colorScheme={item.colorScheme || 'default'}
              size="sm"
              showTarget={!!item.target}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default GaugeChart;