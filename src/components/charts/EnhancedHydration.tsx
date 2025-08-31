import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Droplets, Clock, Sun, Moon } from 'lucide-react';

interface EnhancedHydrationProps {
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
}

export const EnhancedHydration: React.FC<EnhancedHydrationProps> = ({
  data,
  horarios
}) => {
  // Configuração do gráfico de onda líquida
  const waveOptions = {
    chart: {
      type: 'area' as const,
      height: 160,
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
      width: 2
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.8,
        opacityTo: 0.3,
        stops: [0, 90, 100],
        colorStops: [
          {
            offset: 0,
            color: '#3b82f6',
            opacity: 0.8
          },
          {
            offset: 100,
            color: '#60a5fa',
            opacity: 0.3
          }
        ]
      }
    },
    grid: {
      show: false
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: horarios.map(h => h.hora),
      labels: {
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
    tooltip: {
      theme: 'dark',
      x: {
        show: false
      },
      y: {
        formatter: function(val: number) {
          return val.toFixed(1) + 'ml';
        }
      }
    }
  };

  const waveSeries = [{
    name: 'Hidratação',
    data: horarios.map(h => h.quantidade)
  }];

  // Animação da onda líquida
  const WaveAnimation = () => (
    <motion.div
      className="relative w-full h-40 overflow-hidden rounded-xl bg-gradient-to-b from-blue-400 to-blue-600"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-24 bg-blue-300 opacity-30"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          clipPath: "url(#wave)"
        }}
      />
      <svg className="absolute bottom-0" width="100%" height="100%">
        <defs>
          <clipPath id="wave">
            <path
              d="M0,50 C30,40 70,60 100,50 L100,100 L0,100 Z"
              fill="white"
            />
          </clipPath>
        </defs>
      </svg>
      
      {/* Percentual central */}
      <div className="absolute inset-0 flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-4xl font-bold">{data.aguaCorporalPercentual.toFixed(1)}%</div>
          <div className="text-sm opacity-80">Hidratação Total</div>
        </div>
      </div>
    </motion.div>
  );

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
          <CardTitle className="text-2xl font-bold">Hidratação Avançada</CardTitle>
          <Badge className={hydrationStatus.color}>
            {hydrationStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Onda Animada */}
          <WaveAnimation />

          {/* Métricas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Total</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {data.aguaCorporalTotal.toFixed(1)}L
              </div>
              <div className="text-sm text-gray-600">Água Corporal</div>
            </div>

            <div className="bg-cyan-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Sun className="h-5 w-5 text-cyan-600" />
                <span className="font-medium text-cyan-900">Recomendado</span>
              </div>
              <div className="text-2xl font-bold text-cyan-600">
                {data.recomendacaoDiaria.toFixed(1)}L
              </div>
              <div className="text-sm text-gray-600">Por Dia</div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Clock className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-indigo-900">Índice</span>
              </div>
              <div className="text-2xl font-bold text-indigo-600">
                {data.indiceHidratacao.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Hidratação</div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <Moon className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-purple-900">Massa Magra</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {data.aguaMassaMagra.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Água</div>
            </div>
          </div>

          {/* Gráfico de Distribuição Diária */}
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Distribuição Diária Ideal</h4>
            <ReactApexChart
              options={waveOptions}
              series={waveSeries}
              type="area" as const
              height={160}
            />
          </div>

          {/* Recomendações de Horários */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {horarios.filter(h => h.status === 'ideal').map((horario, index) => (
              <div key={index} className="bg-green-50 p-3 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-green-900">{horario.hora}</span>
                  <Badge className="bg-green-100 text-green-800">
                    {horario.quantidade}ml
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Dicas de Hidratação */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Dicas de Hidratação</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Beba água assim que acordar</li>
              <li>• Mantenha uma garrafa sempre por perto</li>
              <li>• Evite bebidas açucaradas</li>
              <li>• Aumente a ingestão durante exercícios</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};