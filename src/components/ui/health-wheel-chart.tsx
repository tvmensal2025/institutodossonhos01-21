import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthWheelData {
  [key: string]: {
    score: number;
    label: string;
    color: string;
    icon?: string;
    symptoms?: number;
  };
}

interface HealthWheelChartProps {
  data: HealthWheelData;
  title?: string;
  className?: string;
  showLegend?: boolean;
  showScores?: boolean;
  size?: number;
}

export const HealthWheelChart: React.FC<HealthWheelChartProps> = ({
  data,
  title = "Roda da Saúde por Sistema",
  className = "",
  showLegend = true,
  showScores = true,
  size = 400
}) => {
  const systems = Object.entries(data);
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.35;
  const innerRadius = size * 0.1;
  const iconRadius = size * 0.45;

  // Criar segmentos da roda (tipo pizza)
  const createPieSegment = (index: number, total: number, score: number, color: string) => {
    const angleSize = 360 / total;
    const startAngle = index * angleSize - 90; // -90 para começar no topo
    const endAngle = startAngle + angleSize;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    // Calcular raio baseado no score (de innerRadius até outerRadius)
    const currentRadius = innerRadius + (outerRadius - innerRadius) * (score / 100);
    
    const x1 = centerX + Math.cos(startAngleRad) * innerRadius;
    const y1 = centerY + Math.sin(startAngleRad) * innerRadius;
    const x2 = centerX + Math.cos(startAngleRad) * currentRadius;
    const y2 = centerY + Math.sin(startAngleRad) * currentRadius;
    const x3 = centerX + Math.cos(endAngleRad) * currentRadius;
    const y3 = centerY + Math.sin(endAngleRad) * currentRadius;
    const x4 = centerX + Math.cos(endAngleRad) * innerRadius;
    const y4 = centerY + Math.sin(endAngleRad) * innerRadius;
    
    const largeArcFlag = angleSize > 180 ? 1 : 0;
    
    return (
      <path
        key={index}
        d={`M ${x1} ${y1} 
           L ${x2} ${y2} 
           A ${currentRadius} ${currentRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
           L ${x4} ${y4}
           A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`}
        fill={color}
        stroke="#000"
        strokeWidth="1"
        opacity="0.8"
      />
    );
  };

  // Posicionar ícones ao redor da roda
  const getIconPosition = (index: number, total: number) => {
    const angleSize = 360 / total;
    const angle = index * angleSize - 90 + angleSize / 2; // Centro do segmento
    const angleRad = (angle * Math.PI) / 180;
    
    return {
      x: centerX + Math.cos(angleRad) * iconRadius,
      y: centerY + Math.sin(angleRad) * iconRadius,
      angle: angle
    };
  };

  // Criar linhas de grade radiais
  const radialLines = systems.map((_, index) => {
    const angleSize = 360 / systems.length;
    const angle = index * angleSize - 90;
    const angleRad = (angle * Math.PI) / 180;
    
    return (
      <line
        key={index}
        x1={centerX + Math.cos(angleRad) * innerRadius}
        y1={centerY + Math.sin(angleRad) * innerRadius}
        x2={centerX + Math.cos(angleRad) * outerRadius}
        y2={centerY + Math.sin(angleRad) * outerRadius}
        stroke="#333"
        strokeWidth="1"
        opacity="0.3"
      />
    );
  });

  // Círculos concêntricos de referência
  const referenceCircles = [25, 50, 75, 100].map(percentage => {
    const r = innerRadius + (outerRadius - innerRadius) * (percentage / 100);
    return (
      <circle
        key={percentage}
        cx={centerX}
        cy={centerY}
        r={r}
        fill="none"
        stroke="#333"
        strokeWidth="1"
        opacity="0.2"
        strokeDasharray="2,2"
      />
    );
  });

  // Score médio
  const averageScore = systems.reduce((sum, [_, system]) => sum + system.score, 0) / systems.length;

  return (
    <Card className={`bg-card text-card-foreground border-border ${className}`}>
      <CardHeader className="text-center">
        <CardTitle className="text-primary">{title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          Score Médio: <span className="font-bold text-foreground">{averageScore.toFixed(1)}%</span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6">
        {/* Roda SVG tipo Pizza */}
        <div className="relative">
          <svg width={size + 120} height={size + 120} className="overflow-visible">
            {/* Fundo escuro */}
            <rect 
              x="0" 
              y="0" 
              width={size + 120} 
              height={size + 120} 
              fill="#1a1a1a" 
              rx="12"
            />
            
            {/* Círculos de referência */}
            {referenceCircles}
            
            {/* Linhas radiais */}
            {radialLines}
            
            {/* Segmentos da roda tipo pizza */}
            {systems.map(([key, system], index) => 
              createPieSegment(index, systems.length, system.score, system.color)
            )}
            
            {/* Círculo central preto */}
            <circle
              cx={centerX}
              cy={centerY}
              r={innerRadius}
              fill="#000"
              stroke="#333"
              strokeWidth="2"
            />
            
            {/* Ícones ao redor da roda */}
            {systems.map(([key, system], index) => {
              const iconPos = getIconPosition(index, systems.length);
              return (
                <g key={`icon-${key}`}>
                  {/* Círculo de fundo para o ícone */}
                  <circle
                    cx={iconPos.x}
                    cy={iconPos.y}
                    r="16"
                    fill="#333"
                    stroke="#555"
                    strokeWidth="1"
                  />
                  
                  {/* Ícone (emoji ou texto) */}
                  <text
                    x={iconPos.x}
                    y={iconPos.y + 3}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-lg"
                  >
                    {system.icon || '🔴'}
                  </text>
                  
                  {/* Label do sistema */}
                  <text
                    x={iconPos.x}
                    y={iconPos.y + 30}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-medium fill-white"
                  >
                    {system.label}
                  </text>
                  
                  {/* Score do sistema */}
                  <text
                    x={iconPos.x}
                    y={iconPos.y + 42}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-xs font-bold"
                    fill={system.color}
                  >
                    {system.score}%
                  </text>
                  
                  {/* Número de sintomas se disponível */}
                  {system.symptoms !== undefined && (
                    <text
                      x={iconPos.x}
                      y={iconPos.y + 54}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs fill-gray-400"
                    >
                      {system.symptoms} sintomas
                    </text>
                  )}
                </g>
              );
            })}
            
            {/* Score médio no centro */}
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xl font-bold fill-white"
            >
              {averageScore.toFixed(0)}
            </text>
            <text
              x={centerX}
              y={centerY + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-gray-400"
            >
              TOTAL
            </text>
          </svg>
        </div>

        {/* Legenda */}
        {showLegend && (
          <div className="grid grid-cols-2 gap-3 w-full max-w-md">
            {systems.map(([key, system]) => (
              <div key={key} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: system.color }}
                />
                <span className="text-xs text-foreground truncate">
                  {system.label}
                </span>
                <span className="text-xs font-bold ml-auto" style={{ color: system.color }}>
                  {system.score}%
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Interpretação dos resultados */}
        <div className="w-full space-y-2 text-center">
          <div className="text-sm text-muted-foreground">Interpretação:</div>
          <div className="flex justify-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>0-40% Crítico</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span>41-70% Atenção</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>71-100% Saudável</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthWheelChart;