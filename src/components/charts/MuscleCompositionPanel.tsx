import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ProfessionalEvaluation } from '@/hooks/useProfessionalEvaluation';

interface MuscleCompositionPanelProps {
  evaluations: ProfessionalEvaluation[];
  currentEvaluation?: ProfessionalEvaluation;
}

function getRatioColor(ratio: number): string {
  if (ratio < 1.0) return '#ef4444'; // red-500
  if (ratio < 1.5) return '#f59e0b'; // amber-500
  if (ratio < 2.3) return '#22c55e'; // green-500
  return '#3b82f6'; // blue-500
}

function formatDelta(value: number, unit: 'kg' | '%'): string {
  const sign = value > 0 ? '+' : value < 0 ? '' : '';
  const fixed = unit === '%' ? value.toFixed(1) : value.toFixed(1);
  return `${sign}${fixed}${unit}`;
}

const DeltaPill: React.FC<{ value: number; goodWhenPositive?: boolean; unit: 'kg' | '%' }>
  = ({ value, goodWhenPositive = true, unit }) => {
  const isNeutral = Math.abs(value) < 0.05;
  const isGood = (goodWhenPositive && value >= 0) || (!goodWhenPositive && value <= 0);
  return (
    <span className={
      `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ` +
      (isNeutral ? 'bg-gray-700 text-gray-300' : isGood ? 'bg-green-700/30 text-green-300' : 'bg-red-700/30 text-red-300')
    }>
      {isNeutral ? <Minus className="h-3 w-3" /> : (value > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
      {formatDelta(value, unit)}
    </span>
  );
};

const MetricCard: React.FC<{
  title: string;
  value: number;
  unit: 'kg' | '%';
  percent?: number;
  delta?: number;
  accentColorClass: string; // e.g., 'text-green-400'
  subtitle?: string;
}> = ({ title, value, unit, percent, delta = 0, accentColorClass, subtitle }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-[#111318] p-5 shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-400">{title}</div>
          <div className={`mt-1 text-3xl font-semibold ${accentColorClass}`}>
            {unit === '%' ? value.toFixed(1) : value.toFixed(1)}{unit}
          </div>
          {typeof percent === 'number' && (
            <div className="mt-1 text-xs text-gray-400">{percent.toFixed(1)}%</div>
          )}
        </div>
        <div className="self-start">
          <DeltaPill value={delta} goodWhenPositive={true} unit={unit} />
        </div>
      </div>
      {subtitle && <div className="mt-3 text-xs text-gray-500">{subtitle}</div>}
    </div>
  );
};

export const MuscleCompositionPanel: React.FC<MuscleCompositionPanelProps> = ({
  evaluations,
  currentEvaluation
}) => {
  const sorted = [...evaluations].sort((a, b) => new Date(b.evaluation_date).getTime() - new Date(a.evaluation_date).getTime());
  const latest = currentEvaluation ?? sorted[0];
  const previous = sorted[1];

  if (!latest) return null;

  const weight = latest.weight_kg || 0;
  const leanMass = latest.lean_mass_kg || 0;
  const muscleMass = latest.muscle_mass_kg || 0;
  const fatMass = typeof latest.fat_mass_kg === 'number' ? latest.fat_mass_kg : Math.max(weight - leanMass, 0);

  const leanPct = weight > 0 ? (leanMass / weight) * 100 : 0;
  const musclePct = weight > 0 ? (muscleMass / weight) * 100 : 0;
  const ratio = fatMass > 0 ? (muscleMass / fatMass) : 0;

  const prevLean = previous?.lean_mass_kg || 0;
  const prevMuscle = previous?.muscle_mass_kg || 0;
  const prevFat = typeof previous?.fat_mass_kg === 'number' ? (previous!.fat_mass_kg as number) : Math.max((previous?.weight_kg || 0) - (previous?.lean_mass_kg || 0), 0);
  const prevRatio = prevFat > 0 ? (prevMuscle / prevFat) : 0;

  const ratioColor = getRatioColor(ratio);
  const ratioSeries = [Math.max(0, Math.min(100, (ratio / 3) * 100))];

  const ratioOptions: any = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: '65%' },
        track: { background: '#0f172a', strokeWidth: '100%', margin: 6 },
        dataLabels: {
          name: {
            show: true,
            color: '#94a3b8',
            fontSize: '12px',
            offsetY: 30
          },
          value: {
            show: true,
            color: '#e5e7eb',
            fontSize: '28px',
            offsetY: -10,
            formatter: () => ratio.toFixed(1)
          }
        }
      }
    },
    fill: { colors: [ratioColor] },
    labels: ['Razão Músculo/Gordura']
  };

  const ratioBadge = ratio < 1.0
    ? <Badge className="bg-red-600/20 text-red-300 border border-red-600/30">Risco</Badge>
    : (ratio <= 2.0
        ? <Badge className="bg-blue-600/20 text-blue-300 border border-blue-600/30">Target</Badge>
        : <Badge className="bg-green-600/20 text-green-300 border border-green-600/30">Vitality</Badge>);

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-emerald-900">Composição Muscular</h3>
        <div className="text-xs text-emerald-700/80">
          {new Date(latest.evaluation_date).toLocaleDateString('pt-BR')}
          {previous && (
            <span className="ml-2 text-emerald-700/60">comparado a {new Date(previous.evaluation_date).toLocaleDateString('pt-BR')}</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <MetricCard
          title="Massa Magra"
          value={leanMass}
          unit="kg"
          percent={leanPct}
          delta={leanMass - prevLean}
          accentColorClass="text-green-400"
          subtitle="Estimativa calculada a partir da composição corporal"
        />

        <MetricCard
          title="Massa Muscular"
          value={muscleMass}
          unit="kg"
          percent={musclePct}
          delta={muscleMass - prevMuscle}
          accentColorClass="text-blue-400"
          subtitle="Proporção relativa ao peso corporal total"
        />

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-emerald-800/80">Razão Músculo/Gordura</div>
            <DeltaPill value={ratio - prevRatio} goodWhenPositive={true} unit="%" />
          </div>
          <div className="mt-2">
            <ReactApexChart options={ratioOptions} series={ratioSeries} type="radialBar" height={220} />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="text-xs text-emerald-700/70">Faixa ideal ~ 1.2–2.0</div>
            {ratioBadge}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MuscleCompositionPanel;


