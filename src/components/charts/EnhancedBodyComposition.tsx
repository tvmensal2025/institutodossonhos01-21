import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface EnhancedBodyCompositionProps {
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

export const EnhancedBodyComposition: React.FC<EnhancedBodyCompositionProps> = ({
  data,
  historico,
  idade,
  sexo
}) => {
  // Configuração do gráfico 3D
  const options3D = {
    chart: {
      type: 'donut' as const,
      height: 380,
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
      pie: {
        donut: {
          size: '65%'
        },
        startAngle: -90,
        endAngle: 270
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val.toFixed(1) + '%';
      },
      style: {
        fontSize: '14px',
        fontFamily: 'Inter, sans-serif',
        fontWeight: 600
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'horizontal',
        shadeIntensity: 0.5,
        gradientToColors: undefined,
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    legend: {
      formatter: function(val: string, opts: any) {
        return val + ' - ' + opts.w.globals.series[opts.seriesIndex].toFixed(1) + '%';
      }
    },
    tooltip: {
      theme: 'dark',
      y: {
        formatter: function(val: number) {
          return val.toFixed(1) + '%';
        }
      }
    },
    colors: ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'],
    stroke: {
      width: 1,
      colors: ['#fff']
    }
  };

  const series = [
    data.percentualGordura,
    data.percentualMagra,
    data.percentualAgua,
    data.percentualMinerais
  ];

  const labels = ['Gordura Corporal', 'Massa Magra', 'Água', 'Minerais'];

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

  // Configuração do mini-gráfico de tendência
  const trendOptions = {
    chart: {
      type: 'area' as const,
      height: 100,
      sparkline: {
        enabled: true
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
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
        opacityFrom: 0.7,
        opacityTo: 0.3,
        stops: [0, 90, 100]
      }
    },
    tooltip: {
      theme: 'dark',
      fixed: {
        enabled: false
      },
      x: {
        show: false
      },
      y: {
        formatter: function(val: number) {
          return val.toFixed(1) + '%';
        }
      },
      marker: {
        show: false
      }
    },
    colors: ['#ef4444']
  };

  const trendSeries = [{
    name: 'Gordura Corporal',
    data: historico.map(h => h.percentualGordura)
  }];

  // Anatomia SVG com cores dinâmicas
  const AnatomyIcon = () => (
    <motion.svg
      width="120"
      height="200"
      viewBox="0 0 120 200"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Cabeça */}
      <circle 
        cx="60" 
        cy="30" 
        r="20" 
        fill={data.percentualGordura > faixaIdeal.max ? '#ef4444' : '#22c55e'}
        opacity="0.8"
      />
      
      {/* Tronco */}
      <path
        d="M40 60 Q40 80 40 100 L80 100 Q80 80 80 60 Z"
        fill={data.percentualGordura > faixaIdeal.max ? '#ef4444' : '#22c55e'}
        opacity="0.8"
      />
      
      {/* Braços */}
      <path
        d="M30 70 Q20 85 30 100 L35 100 Q25 85 35 70 Z"
        fill={data.percentualMagra < 60 ? '#ef4444' : '#22c55e'}
        opacity="0.8"
      />
      <path
        d="M90 70 Q100 85 90 100 L85 100 Q95 85 85 70 Z"
        fill={data.percentualMagra < 60 ? '#ef4444' : '#22c55e'}
        opacity="0.8"
      />
      
      {/* Pernas */}
      <path
        d="M45 100 Q40 140 45 180 L55 180 Q50 140 55 100 Z"
        fill={data.percentualAgua < 50 ? '#ef4444' : '#22c55e'}
        opacity="0.8"
      />
      <path
        d="M65 100 Q70 140 65 180 L75 180 Q80 140 75 100 Z"
        fill={data.percentualAgua < 50 ? '#ef4444' : '#22c55e'}
        opacity="0.8"
      />
    </motion.svg>
  );

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Composição Corporal Avançada</CardTitle>
          <Badge className={
            data.percentualGordura > faixaIdeal.max ? 'bg-red-100 text-red-800' :
            data.percentualGordura < faixaIdeal.min ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }>
            {data.percentualGordura > faixaIdeal.max ? 'Acima' :
             data.percentualGordura < faixaIdeal.min ? 'Abaixo' : 'Ideal'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Gráfico 3D */}
          <div>
            <ReactApexChart
              options={options3D}
              series={series}
              type="donut" as const
              height={380}
            />
          </div>

          {/* Anatomia e Detalhes */}
          <div className="space-y-6">
            {/* Anatomia Interativa */}
            <div className="flex justify-center">
              <AnatomyIcon />
            </div>

            {/* Faixa Ideal */}
            <div className="bg-blue-50 p-4 rounded-xl">
              <h4 className="font-medium text-blue-900 mb-2">Faixa Ideal para seu Perfil</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-blue-600">{faixaIdeal.min}%</div>
                  <div className="text-sm text-gray-600">Mínimo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">{faixaIdeal.max}%</div>
                  <div className="text-sm text-gray-600">Máximo</div>
                </div>
              </div>
            </div>

            {/* Mini Gráfico de Tendência */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <h4 className="font-medium text-gray-900 mb-2">Tendência (3 meses)</h4>
              <ReactApexChart
                options={trendOptions}
                series={trendSeries}
                type="area" as const
                height={100}
              />
            </div>
          </div>
        </div>

        {/* Legenda Detalhada */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {labels.map((label, index) => (
            <div key={label} className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">{label}</div>
              <div className="text-xl font-bold" style={{ color: options3D.colors[index] }}>
                {series[index].toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">
                {(data as any)[Object.keys(data)[index * 2]].toFixed(1)}kg
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};