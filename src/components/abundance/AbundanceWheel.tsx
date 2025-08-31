import React from 'react';

interface AbundanceArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface AbundanceWheelProps {
  responses: Record<string, number>;
  areas: AbundanceArea[];
  highlightedArea?: string;
  size?: number;
}

export const AbundanceWheel: React.FC<AbundanceWheelProps> = ({
  responses,
  areas,
  highlightedArea,
  size = 300
}) => {
  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (2 * Math.PI) / areas.length;

  // Função para determinar cor baseada na pontuação
  const getScoreColor = (score: number) => {
    if (score <= 1) return '#ef4444'; // vermelho
    if (score <= 2) return '#f97316'; // laranja  
    if (score <= 3) return '#eab308'; // amarelo
    if (score <= 4) return '#3b82f6'; // azul
    return '#10b981'; // verde
  };

  return (
    <div className="flex justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#374151"
          strokeWidth="2"
        />

        {/* Grid lines */}
        {[1, 2, 3, 4, 5].map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(radius * level) / 5}
            fill="none"
            stroke="#475569"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}

        {/* Sector lines */}
        {areas.map((_, index) => {
          const angle = index * angleStep - Math.PI / 2;
          const x2 = center + Math.cos(angle) * radius;
          const y2 = center + Math.sin(angle) * radius;
          
          return (
            <line
              key={index}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#475569"
              strokeWidth="1"
              opacity="0.3"
            />
          );
        })}

        {/* Data polygon */}
        {Object.keys(responses).length > 0 && (
          <polygon
            points={areas.map((area, index) => {
              const score = responses[area.id] || 0;
              const angle = index * angleStep - Math.PI / 2;
              const distance = (radius * score) / 5;
              const x = center + Math.cos(angle) * distance;
              const y = center + Math.sin(angle) * distance;
              return `${x},${y}`;
            }).join(' ')}
            fill="rgba(59, 130, 246, 0.3)"
            stroke="#3b82f6"
            strokeWidth="2"
          />
        )}

        {/* Data points */}
        {areas.map((area, index) => {
          const score = responses[area.id] || 0;
          const angle = index * angleStep - Math.PI / 2;
          const distance = (radius * score) / 5;
          const x = center + Math.cos(angle) * distance;
          const y = center + Math.sin(angle) * distance;
          const isHighlighted = highlightedArea === area.id;

          return (
            <g key={area.id}>
              {/* Point */}
              <circle
                cx={x}
                cy={y}
                r={isHighlighted ? "8" : "6"}
                fill={score > 0 ? getScoreColor(score) : "#64748b"}
                stroke="white"
                strokeWidth="2"
                className={isHighlighted ? "animate-pulse" : ""}
              />
              
              {/* Label */}
              <text
                x={center + Math.cos(angle) * (radius + 25)}
                y={center + Math.sin(angle) * (radius + 25)}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-xs font-medium ${isHighlighted ? 'fill-primary' : 'fill-slate-300'}`}
              >
                {area.icon}
              </text>
            </g>
          );
        })}

        {/* Center score */}
        {Object.keys(responses).length > 0 && (
          <g>
            <circle
              cx={center}
              cy={center}
              r="30"
              fill="rgba(15, 23, 42, 0.9)"
              stroke="#475569"
              strokeWidth="2"
            />
            <text
              x={center}
              y={center - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg font-bold fill-white"
            >
              {Math.round((Object.values(responses).reduce((a, b) => a + b, 0) / Object.keys(responses).length) * 20)}%
            </text>
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-slate-300"
            >
              SCORE
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};