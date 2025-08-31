import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Droplets, Activity, Scale, AlertTriangle } from 'lucide-react';

interface UltraWaterBalanceProps {
  aguaIntracelular: number;
  aguaIntracelularPercentual: number;
  aguaExtracelular: number;
  aguaExtracelularPercentual: number;
}

export const UltraWaterBalance: React.FC<UltraWaterBalanceProps> = ({
  aguaIntracelular,
  aguaIntracelularPercentual,
  aguaExtracelular,
  aguaExtracelularPercentual
}) => {
  const [selectedCell, setSelectedCell] = useState<'intra' | 'extra' | null>(null);

  // Configuração do gráfico radial duplo
    const options = {
      chart: {
        type: 'radialBar' as const,
      height: 500,
      background: 'transparent',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 1000,
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
        dataLabels: {
          name: {
            fontSize: '16px',
            color: '#64748b',
            offsetY: 120
          },
          value: {
            offsetY: 76,
            fontSize: '22px',
            color: '#1e293b',
            formatter: function (val: number) {
              return val.toFixed(1) + '%';
            }
          }
        },
        hollow: {
          margin: 0,
          size: '50%',
          background: '#fff',
          image: undefined,
          imageOffsetX: 0,
          imageOffsetY: 0,
          position: 'front' as const
        },
        track: {
          background: '#f1f5f9',
          strokeWidth: '67%',
          margin: 0,
          dropShadow: {
            enabled: true,
            top: -3,
            left: 0,
            blur: 4,
            opacity: 0.35
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
        gradientToColors: ['#3b82f6', '#60a5fa'],
        inverseColors: true,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 100]
      }
    },
    stroke: {
      lineCap: 'round' as const
    },
    labels: ['Intracelular', 'Extracelular']
  };

  const series = [aguaIntracelularPercentual, aguaExtracelularPercentual];

  // Animação de célula
  const CellAnimation = ({ type }: { type: 'intra' | 'extra' }) => {
    const isSelected = selectedCell === type;
    const isIntra = type === 'intra';

    return (
      <motion.div
        className={`relative w-full h-64 rounded-xl overflow-hidden ${
          isIntra ? 'bg-blue-100' : 'bg-cyan-100'
        }`}
        initial={{ opacity: 0.8 }}
        animate={{ 
          opacity: selectedCell === null || isSelected ? 1 : 0.5,
          scale: isSelected ? 1.05 : 1
        }}
        transition={{ duration: 0.3 }}
        onHoverStart={() => setSelectedCell(type)}
        onHoverEnd={() => setSelectedCell(null)}
      >
        {/* Membrana Celular */}
        <motion.div
          className={`absolute inset-2 rounded-lg ${
            isIntra ? 'bg-blue-200' : 'bg-cyan-200'
          }`}
          animate={{
            scale: [1, 1.02, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {/* Partículas de Água */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full ${
                  isIntra ? 'bg-blue-400' : 'bg-cyan-400'
                }`}
                initial={{ 
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: 0.5
                }}
                animate={{
                  x: Math.random() * 100 + '%',
                  y: Math.random() * 100 + '%',
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          {/* Conteúdo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-3xl font-bold ${
                isIntra ? 'text-blue-700' : 'text-cyan-700'
              }`}>
                {isIntra ? aguaIntracelular : aguaExtracelular}L
              </div>
              <div className={`text-lg ${
                isIntra ? 'text-blue-600' : 'text-cyan-600'
              }`}>
                {isIntra ? 'Intracelular' : 'Extracelular'}
              </div>
              <div className={`text-sm ${
                isIntra ? 'text-blue-500' : 'text-cyan-500'
              }`}>
                {isIntra ? aguaIntracelularPercentual : aguaExtracelularPercentual}%
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  // Calcula razão e status
  const ratio = aguaIntracelularPercentual / aguaExtracelularPercentual;
  const getBalanceStatus = () => {
    if (ratio < 1.2) return { status: 'Desequilíbrio', color: 'bg-red-100 text-red-800' };
    if (ratio > 1.8) return { status: 'Desequilíbrio', color: 'bg-red-100 text-red-800' };
    if (ratio < 1.4) return { status: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
    if (ratio > 1.6) return { status: 'Regular', color: 'bg-yellow-100 text-yellow-800' };
    return { status: 'Equilibrado', color: 'bg-green-100 text-green-800' };
  };

  const balanceStatus = getBalanceStatus();

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Água Intra/Extra Celular Ultra</CardTitle>
          <Badge className={balanceStatus.color}>
            {balanceStatus.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-6">
          {/* Gráfico Radial - 5 colunas */}
          <div className="col-span-5">
            <ReactApexChart
              options={options}
              series={series}
              type="radialBar"
              height={500}
            />
          </div>

          {/* Visualização de Células - 7 colunas */}
          <div className="col-span-7 space-y-6">
            {/* Células Animadas */}
            <div className="grid grid-cols-2 gap-4">
              <CellAnimation type="intra" />
              <CellAnimation type="extra" />
            </div>

            {/* Análise de Equilíbrio */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <Activity className="h-5 w-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">Análise de Equilíbrio</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Razão I/E</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {ratio.toFixed(2)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Ideal</div>
                  <div className="text-2xl font-bold text-green-600">
                    1.4-1.6
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Status</div>
                  <Badge className={balanceStatus.color}>
                    {balanceStatus.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Recomendações */}
            <div className="bg-gray-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
                <h4 className="font-medium text-gray-900">Recomendações</h4>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <span>Mantenha hidratação constante ao longo do dia</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Equilibre eletrólitos com alimentação adequada</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Monitore sinais de desidratação</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};