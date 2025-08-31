import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets } from 'lucide-react';

interface WaterBalanceChartProps {
  aguaIntracelular: number;
  aguaIntracelularPercentual: number;
  aguaExtracelular: number;
  aguaExtracelularPercentual: number;
}

export const WaterBalanceChart: React.FC<WaterBalanceChartProps> = ({
  aguaIntracelular,
  aguaIntracelularPercentual,
  aguaExtracelular,
  aguaExtracelularPercentual
}) => {
  // Configuração do gráfico duplo
    const options = {
      chart: {
        type: 'radialBar' as const,
      height: 350,
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      }
    },
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: 0,
        endAngle: 270,
        hollow: {
          margin: 5,
          size: '30%',
          background: 'transparent',
          image: undefined,
        },
        dataLabels: {
          name: {
            show: true,
            fontSize: '16px',
            color: undefined,
            offsetY: 120
          },
          value: {
            show: true,
            fontSize: '24px',
            color: undefined,
            offsetY: 76,
            formatter: function (val: number) {
              return val.toFixed(1) + '%';
            }
          }
        },
        track: {
          show: true,
          startAngle: undefined,
          endAngle: undefined,
          background: '#f1f5f9',
          strokeWidth: '97%',
          opacity: 1,
          margin: 5,
          dropShadow: {
            enabled: false
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#0ea5e9', '#06b6d4'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round' as const
    },
    labels: ['Intracelular', 'Extracelular'],
    colors: ['#0284c7', '#0891b2']
  };

  const series = [aguaIntracelularPercentual, aguaExtracelularPercentual];

  // Avaliação do equilíbrio
  const getBalanceStatus = () => {
    const ratio = aguaIntracelularPercentual / aguaExtracelularPercentual;
    if (ratio < 1.2) return { status: 'Desequilíbrio', color: 'bg-red-100 text-red-800 border-red-200' };
    if (ratio > 1.8) return { status: 'Desequilíbrio', color: 'bg-red-100 text-red-800 border-red-200' };
    if (ratio < 1.4) return { status: 'Regular', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (ratio > 1.6) return { status: 'Regular', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { status: 'Equilibrado', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const balanceStatus = getBalanceStatus();

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Água Intra/Extra Celular</CardTitle>
          <Badge className={balanceStatus.color}>
            {balanceStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico Radial Duplo */}
          <div>
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={350}
            />
          </div>

          {/* Detalhes */}
          <div className="flex flex-col justify-center space-y-6">
            {/* Água Intracelular */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Água Intracelular</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {aguaIntracelular.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">litros</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {aguaIntracelularPercentual.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">percentual</div>
                </div>
              </div>
            </div>

            {/* Água Extracelular */}
            <div className="bg-cyan-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <Droplets className="h-5 w-5 text-cyan-600" />
                <span className="font-medium text-cyan-900">Água Extracelular</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {aguaExtracelular.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">litros</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-cyan-600">
                    {aguaExtracelularPercentual.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">percentual</div>
                </div>
              </div>
            </div>

            {/* Explicação */}
            <div className="bg-gray-50 p-4 rounded-lg text-sm">
              <div className="font-medium text-gray-700 mb-2">Equilíbrio Ideal:</div>
              <div className="text-gray-600">
                A razão entre água intracelular e extracelular deve estar entre 1.4 e 1.6 para um equilíbrio saudável.
              </div>
            </div>
          </div>
        </div>

        {/* Faixas de Referência */}
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Equilibrado: Razão 1.4 - 1.6</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Regular: Razão 1.2 - 1.4 ou 1.6 - 1.8</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Desequilíbrio: Razão &lt; 1.2 ou &gt; 1.8</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};