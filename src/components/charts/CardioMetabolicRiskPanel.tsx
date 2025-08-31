import React, { useMemo, useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { ProfessionalEvaluation, UserProfile } from '@/hooks/useProfessionalEvaluation';
import RiskGaugeFull from './RiskGaugeFull';

interface CardioMetabolicRiskPanelProps {
  user: UserProfile;
  evaluations: ProfessionalEvaluation[];
  currentEvaluation?: ProfessionalEvaluation;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function mapRatioToPercent(ratio: number, min = 0.4, max = 0.8): number {
  return clamp(((ratio - min) / (max - min)) * 100, 0, 100);
}

function ratioColor(ratio: number): string {
  if (ratio < 0.5) return '#10b981'; // green
  if (ratio < 0.6) return '#f59e0b'; // amber
  return '#ef4444'; // red
}

export const CardioMetabolicRiskPanel: React.FC<CardioMetabolicRiskPanelProps> = ({
  user,
  evaluations,
  currentEvaluation
}) => {
  const sorted = useMemo(
    () => [...evaluations].sort((a, b) => new Date(a.evaluation_date).getTime() - new Date(b.evaluation_date).getTime()),
    [evaluations]
  );

  const latest = currentEvaluation ?? sorted[sorted.length - 1];
  const latestRatio = latest?.waist_to_height_ratio ?? (latest?.waist_circumference_cm || 0) / user.height_cm;

  // Goal controls
  const [goalMonths, setGoalMonths] = useState<number>(3);
  const [targetWaist, setTargetWaist] = useState<number>(latest?.waist_circumference_cm || 90);
  const targetRatio = targetWaist / user.height_cm;
  const monthlyDelta = latest ? (latest.waist_circumference_cm - targetWaist) / goalMonths : 0;

  const ratioSeries = useMemo(() => sorted.map(ev => (ev.waist_to_height_ratio ?? (ev.waist_circumference_cm || 0) / user.height_cm)), [sorted, user.height_cm]);
  const categories = useMemo(() => sorted.map(ev => new Date(ev.evaluation_date).toLocaleDateString('pt-BR')), [sorted]);

  const radialSeries = [mapRatioToPercent(latestRatio || 0)];
  const radialOptions: any = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: '70%' },
        track: { background: '#0f172a', strokeWidth: '100%', margin: 6 },
        dataLabels: {
          name: { show: true, color: '#94a3b8', fontSize: '14px', offsetY: 36 },
          value: {
            show: true,
            color: '#e5e7eb',
            fontSize: '56px',
            offsetY: -10,
            formatter: () => (latestRatio ? latestRatio.toFixed(2).replace('.', ',') : '-')
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.15,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        colorStops: [
          { offset: 0, color: '#10b981', opacity: 1 },   // verde
          { offset: 40, color: '#f59e0b', opacity: 1 },  // amarelo
          { offset: 70, color: '#fb923c', opacity: 1 },  // laranja
          { offset: 100, color: '#ef4444', opacity: 1 }  // vermelho
        ]
      }
    },
    labels: ['RCEst']
  };

  const lineOptions: any = {
    chart: { type: 'line', height: 260, toolbar: { show: false }, animations: { enabled: true } },
    stroke: { curve: 'smooth', width: 3 },
    markers: { size: 4 },
    colors: ['#10b981'],
    xaxis: { categories, labels: { style: { colors: '#047857' } } },
    yaxis: { min: 0.4, max: 0.8, tickAmount: 4, labels: { style: { colors: '#047857' } } },
    grid: { borderColor: '#d1fae5', strokeDashArray: 4 }
  };

  const lineSeries = [{ name: 'RCEst', data: ratioSeries.map(v => Number(v?.toFixed(2))) }];

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white mobile-padding text-emerald-900">
      <div className="mb-4 mobile-text-lg font-semibold text-emerald-900">Risco Cardio‑Metabólico</div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna de metas */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 mobile-padding">
          <div className="text-sm text-emerald-800/80">Essa meta é para quantos meses?</div>
          <input className="mt-2 w-full" type="range" min={1} max={12} value={goalMonths} onChange={(e) => setGoalMonths(Number(e.target.value))} />
          <div className="mt-1 text-right text-xs text-emerald-700/60">{goalMonths} meses</div>

          <div className="mt-5 text-sm text-emerald-800/80">Meta para a cintura</div>
          <input className="mt-2 w-full" type="range" min={60} max={150} value={targetWaist} onChange={(e) => setTargetWaist(Number(e.target.value))} />
          <div className="mt-1 flex justify-between text-xs text-emerald-700/60">
            <span>{60} cm</span>
            <span>{targetWaist} cm</span>
            <span>{150} cm</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <div className="text-emerald-800/80">RCEst alvo</div>
              <div className="text-lg font-semibold" style={{color: ratioColor(targetRatio)}}>{targetRatio.toFixed(2)}</div>
            </div>
            <div className="rounded-lg bg-white p-3 border border-emerald-200">
              <div className="text-emerald-800/80">Redução / mês</div>
              <div className="text-lg font-semibold">{monthlyDelta.toFixed(1)} cm</div>
            </div>
          </div>
        </div>

        {/* Gauge maior, preenchimento completo e seta SVG */}
        <div className="relative rounded-xl border border-emerald-200 bg-white mobile-padding lg:col-span-2">
          <RiskGaugeFull ratio={latestRatio || 0} />
        </div>

        {/* Linha histórica ampliada */}
        <div className="rounded-xl border border-emerald-200 bg-white mobile-padding lg:col-span-3">
          <ReactApexChart options={lineOptions} series={lineSeries} type="line" height={260} />
        </div>
      </div>
    </div>
  );
};

export default CardioMetabolicRiskPanel;


