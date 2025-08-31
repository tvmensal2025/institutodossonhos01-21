import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Scale, Activity } from 'lucide-react';

interface Measurement {
  date: string;
  peso: number;
  gorduraCorporal: number;
  massaMagra: number;
  imc: number;
  hidratacao: number;
}

interface EvolutionChartProps {
  measurements: Measurement[];
  metricaAtual: {
    peso: number;
    gorduraCorporal: number;
    massaMagra: number;
    imc: number;
    hidratacao: number;
  };
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({
  measurements,
  metricaAtual
}) => {
  // Calcula variações
  const calcularVariacao = (metrica: keyof typeof metricaAtual) => {
    if (measurements.length < 2) return 0;
    const primeira = measurements[measurements.length - 1][metrica];
    const ultima = measurements[0][metrica];
    return ((ultima - primeira) / primeira) * 100;
  };

  // Configuração do gráfico de evolução
  const options = {
    chart: {
      type: 'line' as const,
      height: 350,
      background: 'transparent',
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
    stroke: {
      curve: 'smooth' as const,
      width: [3, 3, 3, 3],
      dashArray: [0, 0, 0, 0]
    },
    markers: {
      size: 4,
      strokeWidth: 2,
      hover: {
        size: 6
      }
    },
    xaxis: {
      type: 'category' as const,
      categories: measurements.map(m => m.date),
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px'
        }
      },
      axisBorder: {
        show: false
      }
    },
    yaxis: [
      {
        title: {
          text: 'Peso (kg)',
          style: {
            color: '#3b82f6'
          }
        },
        labels: {
          style: {
            colors: '#64748b'
          }
        }
      }
    ],
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 5
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const,
      offsetY: -10,
      labels: {
        colors: '#64748b'
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(value: number) {
          return value.toFixed(1);
        }
      }
    },
    colors: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b']
  };

  const series = [
    {
      name: 'Peso',
      data: measurements.map(m => m.peso)
    },
    {
      name: 'Gordura Corporal',
      data: measurements.map(m => m.gorduraCorporal)
    },
    {
      name: 'Massa Magra',
      data: measurements.map(m => m.massaMagra)
    },
    {
      name: 'IMC',
      data: measurements.map(m => m.imc)
    }
  ];

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Evolução Temporal</CardTitle>
          <div className="flex space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {measurements.length} Avaliações
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Gráfico Principal */}
        <div className="mb-6">
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={350}
        />
        </div>

        {/* Cards de Variação */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Peso */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Scale className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Peso</span>
              </div>
              {calcularVariacao('peso') !== 0 && (
                calcularVariacao('peso') > 0 ? (
                  <TrendingUp className="h-5 w-5 text-red-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                )
              )}
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {metricaAtual.peso.toFixed(1)} kg
            </div>
            <div className={`text-sm ${calcularVariacao('peso') > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {calcularVariacao('peso').toFixed(1)}% em {measurements.length} semanas
            </div>
          </div>

          {/* Gordura Corporal */}
          <div className="bg-red-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-900">Gordura</span>
              </div>
              {calcularVariacao('gorduraCorporal') !== 0 && (
                calcularVariacao('gorduraCorporal') > 0 ? (
                  <TrendingUp className="h-5 w-5 text-red-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                )
              )}
            </div>
            <div className="text-2xl font-bold text-red-600">
              {metricaAtual.gorduraCorporal.toFixed(1)}%
            </div>
            <div className={`text-sm ${calcularVariacao('gorduraCorporal') > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {calcularVariacao('gorduraCorporal').toFixed(1)}% em {measurements.length} semanas
            </div>
          </div>

          {/* Massa Magra */}
          <div className="bg-green-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Massa Magra</span>
              </div>
              {calcularVariacao('massaMagra') !== 0 && (
                calcularVariacao('massaMagra') > 0 ? (
                  <TrendingUp className="h-5 w-5 text-green-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-red-600" />
                )
              )}
            </div>
            <div className="text-2xl font-bold text-green-600">
              {metricaAtual.massaMagra.toFixed(1)} kg
            </div>
            <div className={`text-sm ${calcularVariacao('massaMagra') > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {calcularVariacao('massaMagra').toFixed(1)}% em {measurements.length} semanas
            </div>
          </div>

          {/* IMC */}
          <div className="bg-yellow-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-yellow-600" />
                <span className="font-medium text-yellow-900">IMC</span>
              </div>
              {calcularVariacao('imc') !== 0 && (
                calcularVariacao('imc') > 0 ? (
                  <TrendingUp className="h-5 w-5 text-red-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-green-600" />
                )
              )}
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {metricaAtual.imc.toFixed(1)}
            </div>
            <div className={`text-sm ${calcularVariacao('imc') > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {calcularVariacao('imc').toFixed(1)}% em {measurements.length} semanas
            </div>
          </div>
        </div>

        {/* Legenda de Interpretação */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">
            Como interpretar:
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span>Redução em verde = positiva para peso, gordura e IMC</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span>Aumento em verde = positivo para massa magra</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};