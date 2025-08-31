import React from 'react';

interface RiskGaugeFullProps {
  ratio: number; // e.g., waist/height
  min?: number;  // start of scale
  max?: number;  // end of scale
  label?: string;
  height?: number; // px
  tickValues?: number[]; // valores nos marcadores
  tickFormatter?: (v: number) => string;
}

export const RiskGaugeFull: React.FC<RiskGaugeFullProps> = ({
  ratio,
  min = 0.4,
  max = 0.8,
  label = 'RCEst',
  height = 320,
  tickValues,
  tickFormatter
}) => {
  const width = Math.round(height * 1.9);
  const centerX = width / 2;
  // Desce levemente para evitar corte do topo
  const centerY = height * 0.95;
  // Raio menor para garantir que ticks e seta não cortem as bordas
  const radius = height * 0.65;
  const strokeWidth = 26;

  const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  const pct = clamp((ratio - min) / (max - min), 0, 1);
  // Mapeia min->180° (esquerda), max->0° (direita)
  const angle = 180 - pct * 180;

  // Arc path from left (-90) to right (+90)
  const startX = centerX - radius;
  const startY = centerY;
  const endX = centerX + radius;
  const endY = centerY;
  const arcPath = `M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

  const formatted = Number.isFinite(ratio)
    ? ratio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '-';

  const riskColor = (r: number) => (r < 0.5 ? '#10b981' : r < 0.6 ? '#f59e0b' : '#ef4444');
  const riskText = (r: number) => (r < 0.5 ? 'BAIXO RISCO' : r < 0.6 ? 'RISCO MÉDIO' : 'ALTO RISCO');

  // Geometria do ponteiro triangular (apontando PARA DENTRO, como no exemplo)
  const angleRad = (angle * Math.PI) / 180;
  const ux = Math.cos(angleRad);
  const uy = Math.sin(angleRad);
  const tx = -uy; // tangente (perpendicular)
  const ty = ux;
  const baseWidth = 38; // tamanho original
  const baseR = radius - strokeWidth * 0.10; // base centrada na espessura do arco
  const apexR = radius + strokeWidth * 0.75; // ponta para FORA sem cortar
  const baseCx = centerX + baseR * ux;
  const baseCy = centerY + baseR * uy;
  const apexX = centerX + apexR * ux;
  const apexY = centerY + apexR * uy;
  const baseLeftX = baseCx + (baseWidth / 2) * tx;
  const baseLeftY = baseCy + (baseWidth / 2) * ty;
  const baseRightX = baseCx - (baseWidth / 2) * tx;
  const baseRightY = baseCy - (baseWidth / 2) * ty;

  // Ticks e formato
  const defaultTicks = [
    min,
    min + (max - min) * 0.35,
    min + (max - min) * 0.65,
    max
  ];
  const baseTicks = (tickValues && tickValues.length > 0)
    ? Array.from(new Set([min, ...tickValues, max]))
    : defaultTicks;
  const allTicks = baseTicks
    .map(v => Math.max(min, Math.min(max, v)))
    .filter((v, idx, arr) => arr.indexOf(v) === idx)
    .sort((a, b) => a - b)
    ;
  const formatTick = (v: number) => tickFormatter ? tickFormatter(v) : v.toFixed(2).replace('.', ',');

  // Coordenadas para o gradiente alinhado ao arco (reutiliza startX/startY definidos antes)

  return (
    <div className="w-full" style={{ height }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="mx-auto block">
        <defs>
          <linearGradient id="arcGradient" x1={startX} y1={startY} x2={endX} y2={endY} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="18%" stopColor="#f59e0b" />
            <stop offset="32%" stopColor="#eab308" />
            <stop offset="50%" stopColor="#22c55e" />
            <stop offset="70%" stopColor="#10b981" />
            <stop offset="85%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <filter id="needleShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="3" dy="3" stdDeviation="3" floodColor="rgba(0,0,0,0.7)" />
          </filter>
        </defs>

        {/* Arco colorido completo */}
        <path d={arcPath} fill="none" stroke="url(#arcGradient)" strokeWidth={strokeWidth} strokeLinecap="round" />

        {/* Marcadores numéricos em todo o arco (inclui início e fim) */}
        {allTicks.map((t, i) => {
          const a = (180 - ((t - min) / (max - min)) * 180) * (Math.PI / 180);
          const baseRx = centerX + (radius + strokeWidth * 0.72) * Math.cos(a);
          const baseRy = centerY + (radius + strokeWidth * 0.72) * Math.sin(a);
          // deslocamento tangencial para os extremos evitando colisão com a seta
          const tx = -Math.sin(a);
          const ty = Math.cos(a);
          const tOffset = (i === 0 || i === allTicks.length - 1) ? (12 * (height / 320)) * (i === 0 ? -1 : 1) : 0;
          const rx = baseRx + tx * tOffset;
          const ry = baseRy + ty * tOffset;
          return (
            <text key={`tick-${i}`} x={rx} y={ry} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize={height * 0.07}>
              {formatTick(t)}
            </text>
          );
        })}

        {/* Pequenas marcas (ticks) no arco */}
        {allTicks.map((t, i) => {
          const a = (180 - ((t - min) / (max - min)) * 180) * (Math.PI / 180);
          const x1 = centerX + (radius + strokeWidth * 0.18) * Math.cos(a);
          const y1 = centerY + (radius + strokeWidth * 0.18) * Math.sin(a);
          const x2 = centerX + (radius + strokeWidth * 0.32) * Math.cos(a);
          const y2 = centerY + (radius + strokeWidth * 0.32) * Math.sin(a);
          return <line key={`tick-line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth={2} />;
        })}

        {/* Ponteiro triangular (base no arco, ponta para fora) */}
        <polygon
          points={`${baseLeftX + 2},${baseLeftY + 2} ${baseRightX + 2},${baseRightY + 2} ${apexX + 2},${apexY + 2}`}
          fill="#0b0b0b"
          opacity="0.55"
          filter="url(#needleShadow)"
        />
        <polygon
          points={`${baseLeftX},${baseLeftY} ${baseRightX},${baseRightY} ${apexX},${apexY}`}
          fill={riskColor(ratio)}
          stroke={riskColor(ratio)}
          strokeWidth={2}
        />

        {/* Value */}
        <text x={centerX} y={centerY - 20} textAnchor="middle" fill="#e5e7eb" fontSize={height * 0.22} fontWeight={600}>
          {formatted}
        </text>
        <text x={centerX} y={centerY + 12} textAnchor="middle" fill="#9ca3af" fontSize={height * 0.08}>
          {label}
        </text>
        <text x={centerX} y={centerY + 40} textAnchor="middle" fill={riskColor(ratio)} fontSize={height * 0.07} fontWeight={600}>
          {riskText(ratio)}
        </text>
      </svg>
    </div>
  );
};

export default RiskGaugeFull;


