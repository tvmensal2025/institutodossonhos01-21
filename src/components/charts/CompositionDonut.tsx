import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface CompositionDonutProps {
  weightKg: number;
  fatMassKg: number;
  leanMassKg: number;
}

export const CompositionDonut: React.FC<CompositionDonutProps> = ({ weightKg, fatMassKg, leanMassKg }) => {
  const water = Math.max(0, weightKg * 0.6 - (fatMassKg * 0.1));
  const others = Math.max(0, weightKg - (fatMassKg + leanMassKg + water));

  const series = [fatMassKg, leanMassKg, water, others];
  const options: any = {
    chart: { type: 'donut' },
    labels: ['Gordura', 'Massa Magra', 'Água', 'Outros'],
    colors: ['#ef4444', '#10b981', '#3b82f6', '#a78bfa'],
    legend: { position: 'bottom', labels: { colors: ['#065f46'] } },
    dataLabels: {
      enabled: true,
      style: { colors: ['#064e3b'] },
      formatter: (val: number) => `${val.toFixed(1)}%`
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: { show: true, color: '#065f46' },
            value: { show: true, color: '#065f46', formatter: (v: string) => `${Number(v).toFixed(1)} kg` },
            total: { show: true, label: 'Peso Total', color: '#065f46', formatter: () => `${weightKg.toFixed(1)} kg` }
          }
        }
      }
    }
  };

  return (
    <Card className="border-emerald-200">
      <CardHeader className="mobile-padding">
        <CardTitle className="flex items-center gap-2 text-emerald-900 mobile-text-lg">
          <Clock className="h-6 w-6 lg:h-5 lg:w-5 text-emerald-600" /> Composição Corporal Total
        </CardTitle>
      </CardHeader>
      <CardContent className="mobile-padding">
        <ReactApexChart options={options} series={series} type="donut" height={360} />
      </CardContent>
    </Card>
  );
};

export default CompositionDonut;


