import React from 'react';
import ReactApexChart from 'react-apexcharts';

interface RiskGaugeProps {
  riskLevel: 'low' | 'moderate' | 'high';
  bodyFatPercentage: number;
  waistToHeightRatio?: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({ riskLevel, bodyFatPercentage, waistToHeightRatio }) => {
  const series = [
    riskLevel === 'high' ? 85 : riskLevel === 'moderate' ? 55 : 25
  ];
  const options: any = {
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: '65%' },
        track: { background: '#e6f5f0', strokeWidth: '100%' },
        dataLabels: {
          name: { show: true, offsetY: 18, color: '#065f46', fontSize: '12px' },
          value: {
            show: true,
            offsetY: -10,
            fontSize: '22px',
            color: riskLevel === 'high' ? '#ef4444' : riskLevel === 'moderate' ? '#f59e0b' : '#10b981',
            formatter: () => riskLevel === 'high' ? 'ALTO RISCO' : riskLevel === 'moderate' ? 'RISCO MÉDIO' : 'BAIXO RISCO'
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark', shadeIntensity: 0.15, inverseColors: false, opacityFrom: 1, opacityTo: 1,
        colorStops: [
          { offset: 0, color: '#10b981', opacity: 1 },
          { offset: 50, color: '#f59e0b', opacity: 1 },
          { offset: 100, color: '#ef4444', opacity: 1 }
        ]
      }
    },
    labels: ['Risco Corporal Atual']
  };

  return (
    <div className="rounded-2xl border border-emerald-200 bg-white mobile-padding text-emerald-900">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-1">
          <ReactApexChart options={options} series={series} type="radialBar" height={280} />
        </div>
        <div className="col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="rounded-lg bg-emerald-50 mobile-padding">
            <div className="text-emerald-700/70">% Gordura</div>
            <div className="stat-number-responsive text-red-500">{bodyFatPercentage.toFixed(1)}%</div>
          </div>
          <div className="rounded-lg bg-emerald-50 mobile-padding">
            <div className="text-emerald-700/70">Cintura/Altura</div>
            <div className="stat-number-responsive text-amber-500">{(waistToHeightRatio || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskGauge;


