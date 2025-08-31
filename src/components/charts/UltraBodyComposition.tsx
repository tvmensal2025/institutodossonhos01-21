import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Activity, Droplets, Trophy } from 'lucide-react';

interface UltraBodyCompositionProps {
  data: {
    massaGorda: number;
    percentualGordura: number;
    massaMagra: number;
    percentualMagra: number;
    agua: number;
    percentualAgua: number;
    minerais: number;
    percentualMinerais: number;
  };
  historico: Array<{
    data: string;
    percentualGordura: number;
  }>;
  idade: number;
  sexo: 'M' | 'F';
}

export const UltraBodyComposition: React.FC<UltraBodyCompositionProps> = ({
  data,
  historico,
  idade,
  sexo
}) => {
  // Configuração do gráfico de pizza gigante
  const options = {
    chart: {
      type: 'pie' as const,
      height: 1200,
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        dynamicAnimation: {
          enabled: true,
          speed: 350
        }
      }
    },
    labels: [
      'Gordura Corporal',
      'Massa Magra',
      'Água',
      'Minerais'
    ],
    colors: [
      '#ef4444', // Vermelho para gordura
      '#22c55e', // Verde para massa magra
      '#3b82f6', // Azul para água
      '#f59e0b'  // Âmbar para minerais
    ],
    legend: {
      position: 'bottom' as const,
      horizontalAlign: 'center' as const,
      fontSize: '18px',
      fontFamily: 'Inter, sans-serif',
      fontWeight: 500,
      markers: {
        size: 16
      },
      itemMargin: {
        horizontal: 20,
        vertical: 10
      },
      formatter: function(val: string, opts: any) {
        const value = opts.w.globals.series[opts.seriesIndex];
        const kg = [data.massaGorda, data.massaMagra, data.agua, data.minerais][opts.seriesIndex];
        return `${val}: ${value.toFixed(1)}% (${kg.toFixed(1)}${opts.seriesIndex === 2 ? 'L' : 'kg'})`;
      }
    },
    stroke: {
      width: 0
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val.toFixed(1) + '%';
      },
      style: {
        fontSize: '24px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600,
        colors: ['#fff']
      },
      dropShadow: {
        enabled: true,
        blur: 3,
        opacity: 0.2
      }
    },
    tooltip: {
      theme: 'light',
      style: {
        fontSize: '16px',
        fontFamily: 'Inter, sans-serif'
      },
      y: {
        formatter: function(val: number) {
          return val.toFixed(1) + '%';
        }
      }
    },
    responsive: [{
      breakpoint: 1024,
      options: {
        chart: {
          height: 800
        },
        legend: {
          position: 'bottom' as const
        }
      }
    }]
  };

  const series = [
    data.percentualGordura,
    data.percentualMagra,
    data.percentualAgua,
    data.percentualMinerais
  ];

  // Faixas ideais por idade e sexo
  const getFaixaIdeal = () => {
    if (sexo === 'M') {
      if (idade < 30) return { min: 8, max: 20 };
      if (idade < 50) return { min: 11, max: 22 };
      return { min: 13, max: 25 };
    } else {
      if (idade < 30) return { min: 21, max: 33 };
      if (idade < 50) return { min: 23, max: 35 };
      return { min: 24, max: 36 };
    }
  };

  const faixaIdeal = getFaixaIdeal();

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <CardTitle className="text-3xl font-bold">Composição Corporal</CardTitle>
            <div className="flex space-x-2">
              <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                {idade} anos
              </Badge>
              <Badge className="bg-purple-100 text-purple-800 text-lg px-3 py-1">
                {sexo === 'M' ? 'Masculino' : 'Feminino'}
              </Badge>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Faixa Ideal:</span>
            <Badge className="bg-green-100 text-green-800 text-lg px-3 py-1">
              {faixaIdeal.min}% - {faixaIdeal.max}%
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* Gráfico Principal Gigante */}
          <div className="flex justify-center">
          <ReactApexChart
            options={options}
            series={series}
            type="pie"
            height={1200}
          />
          </div>

          {/* Histórico Compacto */}
          <div className="bg-gray-50 p-6 rounded-xl">
            <h4 className="text-xl font-semibold text-gray-900 mb-4">Evolução da Gordura Corporal</h4>
            <div className="grid grid-cols-3 gap-8">
              {historico.map((h, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-lg text-gray-600">{h.data}</span>
                  <span className={`text-xl font-bold ${
                    h.percentualGordura > data.percentualGordura 
                      ? 'text-green-600' 
                      : 'text-red-600'
                  }`}>
                    {h.percentualGordura.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};