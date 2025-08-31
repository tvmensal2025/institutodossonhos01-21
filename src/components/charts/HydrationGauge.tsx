import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Droplets, Waves, Scale } from 'lucide-react';

interface HydrationGaugeProps {
  aguaCorporalTotal: number;
  aguaCorporalPercentual: number;
  indiceHidratacao: number;
  aguaMassaMagra: number;
}

export const HydrationGauge: React.FC<HydrationGaugeProps> = ({
  aguaCorporalTotal,
  aguaCorporalPercentual,
  indiceHidratacao,
  aguaMassaMagra
}) => {
  // Configuração do gauge horizontal
  const options = {
    chart: {
      type: 'bar' as const,
      height: 100,
      toolbar: {
        show: false
      },
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
      bar: {
        horizontal: true,
        borderRadius: 10,
        dataLabels: {
          position: 'bottom'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val.toFixed(1);
      },
      style: {
        colors: ['#fff']
      }
    },
    xaxis: {
      categories: ['Hidratação'],
      min: 0,
      max: 8,
      labels: {
        show: true,
        style: {
          colors: '#64748b'
        }
      },
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    grid: {
      show: false
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'light',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: ['#0ea5e9'],
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 0.8,
        stops: [0, 100]
      }
    },
    colors: ['#0284c7']
  };

  // Classificação da hidratação
  const getHydrationStatus = (indice: number) => {
    if (indice < 2.5) return { status: 'Baixa', color: 'bg-red-100 text-red-800 border-red-200' };
    if (indice < 3.5) return { status: 'Regular', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (indice < 4.7) return { status: 'Ideal', color: 'bg-green-100 text-green-800 border-green-200' };
    return { status: 'Elevada', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  const hydrationStatus = getHydrationStatus(indiceHidratacao);

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Hidratação</CardTitle>
          <Badge className={hydrationStatus.color}>
            {hydrationStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Gauge Principal */}
        <div className="mb-6">
        <ReactApexChart
          options={options}
          series={[{
            name: 'Índice',
            data: [indiceHidratacao]
          }]}
          type="bar"
          height={100}
        />
          <div className="text-center text-sm text-gray-500 mt-2">
            Índice de Hidratação (cm/ohms ×10)
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center justify-center mb-2">
              <Droplets className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {aguaCorporalTotal.toFixed(1)}L
              </div>
              <div className="text-sm text-gray-600">
                Água Corporal Total
              </div>
              <div className="text-sm text-blue-500 font-medium">
                {aguaCorporalPercentual.toFixed(1)}%
              </div>
            </div>
          </div>

          <div className="bg-cyan-50 p-4 rounded-xl">
            <div className="flex items-center justify-center mb-2">
              <Scale className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-cyan-600">
                {indiceHidratacao.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">
                Índice de Hidratação
              </div>
              <div className="text-sm text-cyan-500 font-medium">
                cm/ohms ×10
              </div>
            </div>
          </div>

          <div className="bg-teal-50 p-4 rounded-xl">
            <div className="flex items-center justify-center mb-2">
              <Waves className="h-6 w-6 text-teal-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">
                {aguaMassaMagra.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">
                Água na Massa Magra
              </div>
            </div>
          </div>
        </div>

        {/* Faixas de Referência */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Faixas de Referência:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <span>Baixa: &lt; 2.5</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <span>Regular: 2.5 - 3.5</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span>Ideal: 3.5 - 4.7</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <span>Elevada: &gt; 4.7</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};