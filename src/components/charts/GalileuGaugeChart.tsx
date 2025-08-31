import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface GaugeChartProps {
  value: number;
  maxValue: number;
  title: string;
  subtitle?: string;
  unit: string;
  color?: string;
  size?: number;
  showTarget?: boolean;
  targetValue?: number;
  ranges?: {
    min: number;
    max: number;
    color: string;
    label?: string;
  }[];
}

export const GalileuGaugeChart: React.FC<GaugeChartProps> = ({
  value,
  maxValue,
  title,
  subtitle,
  unit,
  color = '#22c55e',
  size = 200,
  showTarget = false,
  targetValue,
  ranges = []
}) => {
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const strokeWidth = size * 0.08;

  // Calcular o ângulo baseado no valor (semicírculo de 180 graus)
  const percentage = Math.min(value / maxValue, 1);
  const angle = percentage * 180; // 180 graus para semicírculo
  
  // Função para criar o path do arco
  const createArcPath = (startAngle: number, endAngle: number, r: number) => {
    const start = polarToCartesian(centerX, centerY, r, endAngle);
    const end = polarToCartesian(centerX, centerY, r, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", start.x, start.y, 
      "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Cores para diferentes faixas (estilo Galileu)
  const getColorForValue = () => {
    if (ranges.length > 0) {
      const range = ranges.find(r => value >= r.min && value <= r.max);
      return range?.color || color;
    }
    return color;
  };

  const gaugeColor = getColorForValue();

  // Criar gradiente para o gauge (usando React.useMemo para performance)
  const gradientId = React.useMemo(() => 
    `gauge-gradient-${Math.random().toString(36).substr(2, 9)}`, 
    []
  );
  
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-lg text-white">{title}</CardTitle>
        {subtitle && (
          <p className="text-sm text-slate-400">{subtitle}</p>
        )}
      </CardHeader>
      
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="relative">
          <svg width={size} height={size * 0.6} className="overflow-visible">
            <defs>
              {/* Gradiente para o gauge */}
              <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(var(--destructive))" />
                <stop offset="50%" stopColor="hsl(var(--health-calories))" />
                <stop offset="100%" stopColor="hsl(var(--success))" />
              </linearGradient>
              
              {/* Shadow filter */}
              <filter id="shadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
            </defs>
            
            {/* Background track */}
            <path
              d={createArcPath(0, 180, radius)}
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
            
            {/* Gauge fill */}
            <path
              d={createArcPath(0, angle, radius)}
              fill="none"
              stroke={ranges.length > 0 ? `url(#${gradientId})` : gaugeColor}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              filter="url(#shadow)"
              style={{
                transition: 'stroke-dasharray 1s ease-in-out'
              }}
            />
            
            {/* Target indicator */}
            {showTarget && targetValue && (
              <g>
                {(() => {
                  const targetAngle = (targetValue / maxValue) * 180;
                  const targetPos = polarToCartesian(centerX, centerY, radius, targetAngle);
                  return (
                    <>
                      <circle
                        cx={targetPos.x}
                        cy={targetPos.y}
                        r="4"
                        fill="hsl(var(--health-steps))"
                        stroke="hsl(var(--primary))"
                        strokeWidth="2"
                      />
                      <text
                        x={targetPos.x}
                        y={targetPos.y - 15}
                        textAnchor="middle"
                        className="text-xs fill-blue-400 font-medium"
                      >
                        Target
                      </text>
                    </>
                  );
                })()}
              </g>
            )}
            
            {/* Scale markers */}
            {[0, 25, 50, 75, 100].map((mark) => {
              const markAngle = (mark / 100) * 180;
              const outerPos = polarToCartesian(centerX, centerY, radius + 10, markAngle);
              const innerPos = polarToCartesian(centerX, centerY, radius - 5, markAngle);
              const labelPos = polarToCartesian(centerX, centerY, radius + 25, markAngle);
              
              return (
                <g key={mark}>
                  <line
                    x1={innerPos.x}
                    y1={innerPos.y}
                    x2={outerPos.x}
                    y2={outerPos.y}
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth="1"
                  />
                  <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs fill-slate-400"
                  >
                    {(mark * maxValue / 100).toFixed(0)}
                  </text>
                </g>
              );
            })}
          </svg>
          
          {/* Central value display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-center mt-8">
              <div className="text-3xl font-bold text-white mb-1">
                {value.toFixed(1)}
              </div>
              <div className="text-sm text-slate-300 uppercase tracking-wider">
                {unit}
              </div>
            </div>
          </div>
        </div>
        
        {/* Ranges legend */}
        {ranges.length > 0 && (
          <div className="flex justify-center gap-4 text-xs">
            {ranges.map((range, index) => (
              <div key={index} className="flex items-center gap-1">
                <div 
                  className="w-2 h-2 rounded-full" 
                  style={{ backgroundColor: range.color }}
                ></div>
                <span className="text-slate-300">
                  {range.label || `${range.min}-${range.max}`}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};