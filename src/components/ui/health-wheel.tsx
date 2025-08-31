import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface HealthSystemData {
  systemName: string;
  score: number;
  color: string;
  icon: string;
  symptomsCount: number;
  symptoms: string[];
}

interface HealthWheelProps {
  data: HealthSystemData[];
  totalScore: number;
  title?: string;
  className?: string;
  size?: number;
}

export const HealthWheel: React.FC<HealthWheelProps> = ({
  data,
  totalScore,
  title = "Evolução do Sistema em Todas as Rodas",
  className = "",
  size = 450
}) => {
  // Garantir que o totalScore seja um número inteiro limpo
  const cleanTotalScore = Math.round(Number(totalScore) || 0);
  
  // Tamanho responsivo baseado na tela
  const getResponsiveSize = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) return Math.min(280, window.innerWidth - 40); // Mobile
      if (window.innerWidth < 1024) return Math.min(350, window.innerWidth - 80); // Tablet
      return size; // Desktop
    }
    return size;
  };

  const [responsiveSize, setResponsiveSize] = React.useState(getResponsiveSize());

  React.useEffect(() => {
    const handleResize = () => {
      setResponsiveSize(getResponsiveSize());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const centerX = responsiveSize / 2;
  const centerY = responsiveSize / 2;
  const outerRadius = responsiveSize * 0.35;
  const innerRadius = responsiveSize * 0.15;
  const iconRadius = responsiveSize * 0.45;

  // Criar segmento tipo pizza para cada sistema
  const createPieSegment = (index: number, total: number, score: number, color: string) => {
    const angleSize = 360 / total;
    const startAngle = index * angleSize - 90;
    const endAngle = startAngle + angleSize;
    
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const normalizedScore = Math.max(10, (score / 10) * 100);
    const currentRadius = innerRadius + (outerRadius - innerRadius) * (normalizedScore / 100);
    
    const offsetX = 60;
    const offsetY = 60;
    
    const x1 = centerX + offsetX + Math.cos(startAngleRad) * innerRadius;
    const y1 = centerY + offsetY + Math.sin(startAngleRad) * innerRadius;
    const x2 = centerX + offsetX + Math.cos(startAngleRad) * currentRadius;
    const y2 = centerY + offsetY + Math.sin(startAngleRad) * currentRadius;
    const x3 = centerX + offsetX + Math.cos(endAngleRad) * currentRadius;
    const y3 = centerY + offsetY + Math.sin(endAngleRad) * currentRadius;
    const x4 = centerX + offsetX + Math.cos(endAngleRad) * innerRadius;
    const y4 = centerY + offsetY + Math.sin(endAngleRad) * innerRadius;
    
    const largeArcFlag = angleSize > 180 ? 1 : 0;
    
    return (
      <path
        key={`segment-${index}`}
        d={`M ${x1} ${y1} 
           L ${x2} ${y2} 
           A ${currentRadius} ${currentRadius} 0 ${largeArcFlag} 1 ${x3} ${y3}
           L ${x4} ${y4}
           A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1} Z`}
        fill={color}
        stroke="#1a1a1a"
        strokeWidth="2"
        opacity="0.8"
      />
    );
  };

  const getIconPosition = (index: number, total: number) => {
    const angleSize = 360 / total;
    const angle = index * angleSize - 90 + angleSize / 2;
    const angleRad = (angle * Math.PI) / 180;
    
    return {
      x: centerX + Math.cos(angleRad) * iconRadius,
      y: centerY + Math.sin(angleRad) * iconRadius
    };
  };

  const radialLines = data.map((_, index) => {
    const angleSize = 360 / data.length;
    const angle = index * angleSize - 90;
    const angleRad = (angle * Math.PI) / 180;
    
    return (
      <line
        key={`line-${index}`}
        x1={centerX + 60 + Math.cos(angleRad) * innerRadius}
        y1={centerY + 60 + Math.sin(angleRad) * innerRadius}
        x2={centerX + 60 + Math.cos(angleRad) * outerRadius}
        y2={centerY + 60 + Math.sin(angleRad) * outerRadius}
        stroke="#444"
        strokeWidth="1"
        opacity="0.4"
      />
    );
  });

  const referenceCircles = [25, 50, 75, 100].map(percentage => {
    const r = innerRadius + (outerRadius - innerRadius) * (percentage / 100);
    return (
      <circle
        key={`circle-${percentage}`}
        cx={centerX + 60}
        cy={centerY + 60}
        r={r}
        fill="none"
        stroke="#444"
        strokeWidth="0.5"
        opacity="0.2"
        strokeDasharray="3,3"
      />
    );
  });

  return (
    <Card className={`bg-gray-900 text-white border-gray-700 ${className}`}>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-white text-xl">{title}</CardTitle>
        <div className="text-sm text-gray-400">
          Mapeamento completo dos sintomas - 100% do questionário respondido
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-6 p-4">
        <div className="w-full flex flex-col xl:flex-row xl:items-start xl:gap-8">
          <div className="flex flex-col items-center xl:flex-1">
            <div className="relative">
              <svg 
                width={responsiveSize + 120} 
                height={responsiveSize + 120} 
                className="overflow-visible"
                viewBox={`0 0 ${responsiveSize + 120} ${responsiveSize + 120}`}
              >
                <rect 
                  x="0" 
                  y="0" 
                  width={responsiveSize + 120} 
                  height={responsiveSize + 120} 
                  fill="#1a1a1a" 
                  rx="8"
                />
                
                {referenceCircles}
                {radialLines}
                
                {data.map((system, index) => 
                  createPieSegment(index, data.length, system.score, system.color)
                )}
                
                <circle
                  cx={centerX + 60}
                  cy={centerY + 60}
                  r={innerRadius}
                  fill="#0a0a0a"
                  stroke="#333"
                  strokeWidth="2"
                />
                
                {data.map((system, index) => {
                  const iconPos = getIconPosition(index, data.length);
                  const iconSize = responsiveSize < 320 ? 14 : 18;
                  const textSize = responsiveSize < 320 ? '9px' : '11px';
                  const scoreOffset = responsiveSize < 320 ? 20 : 28;
                  const nameOffset = responsiveSize < 320 ? 28 : 38;
                  
                  return (
                    <g key={`icon-${index}`}>
                      <circle
                        cx={iconPos.x + 60}
                        cy={iconPos.y + 60}
                        r={iconSize}
                        fill="#2a2a2a"
                        stroke="#555"
                        strokeWidth="1"
                      />
                      
                      <text
                        x={iconPos.x + 60}
                        y={iconPos.y + 61}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={responsiveSize < 320 ? "text-sm" : "text-base"}
                        fill="white"
                      >
                        {system.icon}
                      </text>
                      
                      <text
                        x={iconPos.x + 60 + scoreOffset}
                        y={iconPos.y + 62}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className="text-sm font-bold"
                        fill={system.color}
                      >
                        {Math.round(system.score)}
                      </text>
                      
                      {responsiveSize >= 320 && (
                        <text
                          x={iconPos.x + 60}
                          y={iconPos.y + 60 + nameOffset}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          className="text-xs font-medium"
                          style={{ fontSize: textSize }}
                          fill="white"
                        >
                          {system.systemName.length > 12 && responsiveSize < 400 
                            ? system.systemName.substring(0, 10) + '...' 
                            : system.systemName}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
              
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HealthWheel;