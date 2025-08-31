import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Heart, Zap } from 'lucide-react';

interface CellularAnalysisChartProps {
  anguloFase: number;
  idadeCronologica: number;
  idadeCelular: number;
  classificacao: string;
}

export const CellularAnalysisChart: React.FC<CellularAnalysisChartProps> = ({
  anguloFase,
  idadeCronologica,
  idadeCelular,
  classificacao
}) => {
  // Configuração do gauge circular
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
        startAngle: -90,
        endAngle: 90,
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
              return val.toFixed(1) + '°';
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
    labels: ['Ângulo de Fase'],
    colors: ['#16a34a']
  };

  // Classificação do ângulo de fase
  const getPhaseAngleStatus = (angle: number) => {
    if (angle < 5) return { status: 'Comprometido', color: 'bg-red-100 text-red-800 border-red-200' };
    if (angle < 6) return { status: 'Regular', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    if (angle < 7) return { status: 'Bom', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { status: 'Excelente', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  const phaseStatus = getPhaseAngleStatus(anguloFase);

  // Diferença entre idades
  const ageDifference = Math.abs(idadeCronologica - idadeCelular);
  const isYoungerCell = idadeCelular < idadeCronologica;

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Análise Celular</CardTitle>
          <Badge className={phaseStatus.color}>
            {phaseStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico do Ângulo de Fase */}
          <div>
            <ReactApexChart
              options={options}
              series={[anguloFase * 10]} // Multiplicado por 10 para melhor visualização
              type="radialBar" as const
              height={350}
            />
          </div>

          {/* Análise de Idade */}
          <div className="flex flex-col justify-center space-y-4">
            {/* Idade Cronológica */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Idade Cronológica</span>
              </div>
              <div className="text-3xl font-bold text-blue-600">
                {idadeCronologica}
              </div>
              <div className="text-sm text-gray-600">anos</div>
            </div>

            {/* Idade Celular */}
            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex items-center space-x-3 mb-2">
                <Heart className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Idade Celular</span>
              </div>
              <div className="text-3xl font-bold text-purple-600">
                {idadeCelular}
              </div>
              <div className="text-sm text-gray-600">anos</div>
            </div>

            {/* Diferença de Idade */}
            <div className={`p-4 rounded-xl ${isYoungerCell ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center space-x-3 mb-2">
                <Activity className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-900">Diferença</span>
              </div>
              <div className={`text-2xl font-bold ${isYoungerCell ? 'text-green-600' : 'text-yellow-600'}`}>
                {ageDifference} anos {isYoungerCell ? 'mais jovem' : 'mais velho'}
              </div>
              <div className="text-sm text-gray-600">que a idade cronológica</div>
            </div>
          </div>
        </div>

        {/* Faixas de Referência */}
        <div className="mt-6 grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Comprometido: &lt; 5.0°</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Regular: 5.0° - 5.9°</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Bom: 6.0° - 6.9°</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Excelente: ≥ 7.0°</span>
          </div>
        </div>

        {/* Explicação */}
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
          <div className="flex items-center space-x-3 mb-2">
            <Zap className="h-5 w-5 text-purple-600" />
            <span className="font-medium text-purple-900">Saúde Celular</span>
          </div>
          <p className="text-sm text-gray-600">
            O ângulo de fase é um indicador direto da saúde e integridade das suas células. 
            Valores mais altos indicam células mais saudáveis e melhor estado nutricional.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};