import React from 'react';

interface CompetencyArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface CompetencyWheelProps {
  responses: Record<string, number>;
  areas: CompetencyArea[];
  highlightedArea?: string;
  size?: number;
}

export const CompetencyWheel: React.FC<CompetencyWheelProps> = ({
  responses,
  areas,
  highlightedArea,
  size = 300
}) => {
  const center = size / 2;
  const radius = size * 0.35;
  const angleStep = (2 * Math.PI) / areas.length;

  // Função para determinar cor baseada na pontuação (1-10)
  const getScoreColor = (score: number) => {
    if (score <= 2) return 'hsl(var(--destructive))'; // vermelho (1-2)
    if (score <= 4) return 'hsl(var(--warning))'; // laranja (3-4)
    if (score <= 6) return 'hsl(var(--health-calories))'; // amarelo (5-6)
    if (score <= 8) return 'hsl(var(--success))'; // verde (7-8)
    return 'hsl(var(--health-steps))'; // azul (9-10)
  };

  // Converter score de 1-10 para posição no raio
  const getRadiusPosition = (score: number) => {
    return (radius * score) / 10;
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

        {/* Grid lines - escala 1 a 10 */}
        {[2, 4, 6, 8, 10].map(level => (
          <circle
            key={level}
            cx={center}
            cy={center}
            r={(radius * level) / 10}
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
                const distance = getRadiusPosition(score);
                const x = center + Math.cos(angle) * distance;
                const y = center + Math.sin(angle) * distance;
                return `${x},${y}`;
              }).join(' ')}
              fill="hsl(var(--primary) / 0.3)"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
            />
        )}

        {/* Data points */}
        {areas.map((area, index) => {
          const score = responses[area.id] || 0;
          const angle = index * angleStep - Math.PI / 2;
          const distance = getRadiusPosition(score);
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
                fill={score > 0 ? getScoreColor(score) : "hsl(var(--muted-foreground))"}
                stroke="hsl(var(--background))"
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
              fill="hsl(var(--card) / 0.9)"
              stroke="hsl(var(--border))"
              strokeWidth="2"
            />
            <text
              x={center}
              y={center - 5}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-lg font-bold fill-white"
            >
              {Math.round((Object.values(responses).reduce((a, b) => a + b, 0) / Object.keys(responses).length) * 10)}%
            </text>
            <text
              x={center}
              y={center + 12}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-xs fill-slate-300"
            >
              COMPETÊNCIA
            </text>
          </g>
        )}

        {/* Score labels */}
        <text x={center + 15} y={center - radius + 8} textAnchor="middle" className="text-xs fill-slate-400">10</text>
        <text x={center + 12} y={center - (radius * 0.8) + 5} textAnchor="middle" className="text-xs fill-slate-400">8</text>
        <text x={center + 10} y={center - (radius * 0.6) + 3} textAnchor="middle" className="text-xs fill-slate-400">6</text>
        <text x={center + 8} y={center - (radius * 0.4) + 2} textAnchor="middle" className="text-xs fill-slate-400">4</text>
        <text x={center + 6} y={center - (radius * 0.2) + 1} textAnchor="middle" className="text-xs fill-slate-400">2</text>
      </svg>
    </div>
  );
};