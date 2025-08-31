import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Dumbbell, Scale, TrendingUp } from 'lucide-react';

interface LeanMassChartProps {
  massaMagra: number;
  massaMagraPercentual: number;
  massaMuscular: number;
  massaMuscularPercentual: number;
  razaoMusculoGordura: number;
  classificacao: string;
}

export const LeanMassChart: React.FC<LeanMassChartProps> = ({
  massaMagra,
  massaMagraPercentual,
  massaMuscular,
  massaMuscularPercentual,
  razaoMusculoGordura,
  classificacao
}) => {
  // Configuração do gráfico radial com ponteiro
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
        startAngle: -135,
        endAngle: 135,
        hollow: {
          margin: 0,
          size: '70%',
          background: '#fff',
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: 'front' as const,
          dropShadow: {
            enabled: true,
            top: 3,
            left: 0,
            blur: 4,
            opacity: 0.24
          }
        },
        track: {
          background: '#fff',
          strokeWidth: '67%',
          margin: 0,
          dropShadow: {
            enabled: true,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.35
          }
        },
        dataLabels: {
          show: true,
          name: {
            offsetY: -10,
            show: true,
            color: '#888',
            fontSize: '17px'
          },
          value: {
            formatter: function(val: number) {
              return val.toFixed(1) + '%';
            },
            color: '#111',
            fontSize: '36px',
            show: true
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
        gradientToColors: ['#22c55e'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round' as const
    },
    labels: ['Massa Muscular'],
    colors: ['#16a34a']
  };

  // Classificação da razão músculo/gordura
  const getMuscleRatioStatus = (ratio: number) => {
    if (ratio < 0.5) return { status: 'Muito Baixa', color: 'bg-red-100 text-red-800 border-red-200' };
    if (ratio < 0.8) return { status: 'Baixa', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (ratio < 1.2) return { status: 'Regular', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { status: 'Excelente', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const muscleStatus = getMuscleRatioStatus(razaoMusculoGordura);

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Massa Magra e Muscular</CardTitle>
          <Badge className={muscleStatus.color}>
            {muscleStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico Radial */}
          <div>
            <ReactApexChart
              options={options}
              series={[massaMuscularPercentual]}
              type="radialBar"
              height={350}
            />
          </div>

          {/* Métricas */}
          <div className="flex flex-col justify-center space-y-4">
            {/* Massa Magra */}
            <div className="bg-emerald-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <Scale className="h-5 w-5 text-emerald-600" />
                <span className="font-medium text-emerald-900">Massa Magra</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {massaMagra.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">quilogramas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {massaMagraPercentual.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">percentual</div>
                </div>
              </div>
            </div>

            {/* Massa Muscular */}
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <Dumbbell className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-900">Massa Muscular</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {massaMuscular.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-600">quilogramas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {massaMuscularPercentual.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">percentual</div>
                </div>
              </div>
            </div>

            {/* Razão Músculo/Gordura */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Razão Músculo/Gordura</span>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {razaoMusculoGordura.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">kg músculo / kg gordura</div>
              </div>
            </div>
          </div>
        </div>

        {/* Faixas de Referência */}
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Muito Baixa: &lt; 0.5</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Baixa: 0.5 - 0.8</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Regular: 0.8 - 1.2</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Excelente: &gt; 1.2</span>
          </div>
        </div>

        {/* Dica de Vitalidade */}
        <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span className="font-medium text-green-900">Dica de Vitalidade</span>
          </div>
          <p className="text-sm text-gray-600">
            Uma razão músculo/gordura saudável é essencial para um metabolismo ativo e boa saúde geral. 
            Mantenha-se ativo e inclua exercícios de força em sua rotina.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};