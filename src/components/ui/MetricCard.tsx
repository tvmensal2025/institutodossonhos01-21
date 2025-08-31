import React from 'react';

interface MetricCardProps {
  label: string;
  value: number;
  target?: number;
  unit?: string;
  color?: string; // CSS color for stroke (e.g., '#22D3EE')
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

export const MetricCard: React.FC<MetricCardProps> = ({ label, value, target, unit = '', color = '#22D3EE' }) => {
  const percent = clamp(target ? (value / target) * 100 : 0);
  const size = 68;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const dash = (percent / 100) * c;
  const statusColor = target ? (percent >= 95 && percent <= 110 ? '#10B981' : percent >= 70 && percent <= 130 ? '#F59E0B' : '#EF4444') : '#9CA3AF';

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-card/60 backdrop-blur-xl border border-border/30 shadow-card">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <defs>
          <linearGradient id="mc_grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,.1)" strokeWidth={stroke} fill="none" />
        {target ? (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke="url(#mc_grad)"
            strokeWidth={stroke}
            fill="none"
            strokeDasharray={`${dash} ${c - dash}`}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        ) : null}
        <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fontSize="12" fill="#E5E7EB" fontWeight="600">
          {Math.round(value)}{unit}
        </text>
      </svg>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground mb-1">{label}</div>
        {target ? (
          <div className="text-sm text-foreground">
            <span className="font-semibold" style={{ color: statusColor }}>{Math.round(percent)}%</span>
            <span className="text-muted-foreground"> da meta</span>
          </div>
        ) : (
          <div className="text-sm text-foreground">—</div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;


