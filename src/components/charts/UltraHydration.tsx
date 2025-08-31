import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Droplets, Clock, Sun, Moon } from 'lucide-react';

interface UltraHydrationProps {
  data: {
    aguaCorporalTotal: number;
    aguaCorporalPercentual: number;
    indiceHidratacao: number;
    aguaMassaMagra: number;
    recomendacaoDiaria: number;
  };
  horarios: Array<{
    hora: string;
    quantidade: number;
    status: 'ideal' | 'alerta' | 'critico';
  }>;
  historico?: Array<{
    data: string;
    indiceHidratacao: number;
  }>;
}

export const UltraHydration: React.FC<UltraHydrationProps> = ({
  data,
  horarios
}) => {
  // Configuração do gráfico de área
  const options = {
    chart: {
      height: 400,
      type: 'area' as const,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    colors: ['#60a5fa', '#93c5fd'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        inverseColors: false,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [20, 100, 100]
      }
    },
    stroke: {
      curve: 'smooth' as const,
      width: 2
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true
        }
      },
      yaxis: {
        lines: {
          show: true
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: horarios.map(h => h.hora),
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        }
      },
      axisBorder: {
        show: false
      },
      axisTicks: {
        show: false
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px',
          fontFamily: 'Inter, sans-serif'
        },
        formatter: function(val: number) {
          return val + 'ml';
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(val: number) {
          return val + 'ml';
        }
      },
      style: {
        fontSize: '12px',
        fontFamily: 'Inter, sans-serif'
      }
    }
  };

  const series = [
    {
      name: 'Meta',
      data: [600, 450, 450, 300, 300, 300, 150, 150, 150, 150]
    },
    {
      name: 'Real',
      data: horarios.map(h => h.quantidade)
    }
  ];

  // Status de hidratação
  const getHydrationStatus = (indice: number) => {
    if (indice < 2.5) return { status: 'Crítico', color: 'bg-red-100 text-red-800' };
    if (indice < 3.5) return { status: 'Alerta', color: 'bg-yellow-100 text-yellow-800' };
    if (indice < 4.7) return { status: 'Ideal', color: 'bg-green-100 text-green-800' };
    return { status: 'Elevado', color: 'bg-blue-100 text-blue-800' };
  };

  const hydrationStatus = getHydrationStatus(data.indiceHidratacao);

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Hidratação Diária</CardTitle>
          <div className="flex space-x-2">
            <Badge className="bg-blue-100 text-blue-800">
              Meta: {data.recomendacaoDiaria.toFixed(1)}L
            </Badge>
            <Badge className={hydrationStatus.color}>
              {hydrationStatus.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Status Atual */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {data.aguaCorporalTotal.toFixed(1)}L
              </div>
              <div className="text-sm text-blue-600 opacity-75">
                {data.aguaCorporalPercentual.toFixed(1)}%
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Até 16h</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">70%</div>
              <div className="text-sm text-blue-600 opacity-75">
                da meta diária
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Índice</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {data.indiceHidratacao.toFixed(1)}
              </div>
              <div className="text-sm text-blue-600 opacity-75">
                cm/ohms ×10
              </div>
            </div>
          </div>

          {/* Gráfico Principal */}
          <div className="mt-6">
          <ReactApexChart
            options={options}
            series={series}
            type="area"
            height={400}
          />
          </div>

          {/* Recomendações */}
          <div className="grid grid-cols-5 gap-2">
            {horarios.slice(0, 5).map((horario, index) => (
              <div
                key={index}
                className="bg-blue-50 p-3 rounded-lg border border-blue-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-900">
                    {horario.hora}
                  </span>
                  <Sun className="h-3 w-3 text-amber-500" />
                </div>
                <div className="text-lg font-bold text-blue-700">
                  {horario.quantidade}
                </div>
                <div className="text-xs text-blue-600">
                  {((horario.quantidade/data.recomendacaoDiaria/10)*100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};