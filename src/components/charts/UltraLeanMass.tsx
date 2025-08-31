import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Dumbbell, Scale, Target, Trophy, TrendingUp } from 'lucide-react';

interface UltraLeanMassProps {
  massaMagra: number;
  massaMagraPercentual: number;
  massaMuscular: number;
  massaMuscularPercentual: number;
  razaoMusculoGordura: number;
  classificacao: string;
  altura: number;
  idade: number;
  sexo: 'M' | 'F';
}

export const UltraLeanMass: React.FC<UltraLeanMassProps> = ({
  massaMagra,
  massaMagraPercentual,
  massaMuscular,
  massaMuscularPercentual,
  razaoMusculoGordura,
  classificacao,
  altura,
  idade,
  sexo
}) => {
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);

  // Cálculo do potencial muscular
  const calcularPotencialMuscular = () => {
    // Fórmula baseada em altura, idade e sexo
    const alturaMetros = altura / 100;
    const fatorSexo = sexo === 'M' ? 1 : 0.85;
    const fatorIdade = Math.max(0.8, 1 - (idade - 25) * 0.005);
    
    const potencialMaximo = (alturaMetros * alturaMetros * 25) * fatorSexo * fatorIdade;
    const atual = massaMuscular;
    const percentualAtingido = (atual / potencialMaximo) * 100;
    
    return {
      maximo: potencialMaximo,
      atual: atual,
      percentual: percentualAtingido,
      potencialGanho: potencialMaximo - atual
    };
  };

  const potencialMuscular = calcularPotencialMuscular();

  // Configuração do gráfico radial
  const options = {
    chart: {
      type: 'radialBar' as const,
      height: 500,
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

  // Mapa muscular interativo
  const MuscleMap = () => {
    const muscles = [
      { id: 'chest', name: 'Peitoral', x: 100, y: 80, width: 60, height: 30 },
      { id: 'shoulders', name: 'Ombros', x: 70, y: 60, width: 120, height: 20 },
      { id: 'biceps', name: 'Bíceps', x: 50, y: 90, width: 20, height: 40 },
      { id: 'triceps', name: 'Tríceps', x: 130, y: 90, width: 20, height: 40 },
      { id: 'abs', name: 'Abdômen', x: 90, y: 120, width: 40, height: 60 },
      { id: 'quads', name: 'Quadríceps', x: 90, y: 190, width: 40, height: 70 },
      { id: 'calves', name: 'Panturrilhas', x: 90, y: 280, width: 40, height: 40 }
    ];

    return (
      <svg viewBox="0 0 200 350" className="w-full">
        {muscles.map((muscle) => (
          <motion.rect
            key={muscle.id}
            x={muscle.x}
            y={muscle.y}
            width={muscle.width}
            height={muscle.height}
            rx={5}
            fill={selectedMuscle === muscle.id ? '#22c55e' : '#4ade80'}
            opacity={selectedMuscle === null || selectedMuscle === muscle.id ? 0.8 : 0.3}
            onHoverStart={() => setSelectedMuscle(muscle.id)}
            onHoverEnd={() => setSelectedMuscle(null)}
            initial={{ scale: 1 }}
            animate={{ 
              scale: selectedMuscle === muscle.id ? 1.05 : 1,
              opacity: selectedMuscle === null || selectedMuscle === muscle.id ? 0.8 : 0.3
            }}
            transition={{ duration: 0.3 }}
            className="cursor-pointer"
          />
        ))}
      </svg>
    );
  };

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Massa Magra Ultra</CardTitle>
          <Badge className={
            razaoMusculoGordura < 0.8 ? 'bg-red-100 text-red-800' :
            razaoMusculoGordura < 1.2 ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }>
            {classificacao}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-6">
          {/* Gráfico Principal - 5 colunas */}
          <div className="col-span-5">
          <ReactApexChart
            options={options}
            series={[massaMuscularPercentual]}
            type="radialBar"
            height={500}
          />
          </div>

          {/* Mapa Muscular e Análises - 7 colunas */}
          <div className="col-span-7 space-y-6">
            {/* Mapa Muscular */}
            <div className="bg-green-50 p-4 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-green-900">Mapa Muscular</h4>
                <Badge className="bg-green-100 text-green-800">
                  {massaMuscular.toFixed(1)}kg
                </Badge>
              </div>
              <MuscleMap />
            </div>

            {/* Potencial Muscular */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
              <div className="flex items-center space-x-2 mb-4">
                <Trophy className="h-5 w-5 text-emerald-600" />
                <h4 className="font-medium text-emerald-900">Potencial Muscular</h4>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-gray-600">Atual</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {massaMuscular.toFixed(1)}kg
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Máximo</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    {potencialMuscular.maximo.toFixed(1)}kg
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600">Potencial</div>
                  <div className="text-2xl font-bold text-emerald-600">
                    +{potencialMuscular.potencialGanho.toFixed(1)}kg
                  </div>
                </div>
              </div>
              {/* Barra de Progresso */}
              <div className="mt-4">
                <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${potencialMuscular.percentual}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                </div>
                <div className="text-sm text-gray-600 text-center mt-2">
                  {potencialMuscular.percentual.toFixed(1)}% do potencial atingido
                </div>
              </div>
            </div>

            {/* Comparação com Atletas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="font-medium text-blue-900">Razão M/G</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {razaoMusculoGordura.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600">
                  Atletas: 2.0 - 3.0
                </div>
              </div>

              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <span className="font-medium text-purple-900">Massa Magra</span>
                </div>
                <div className="text-2xl font-bold text-purple-600">
                  {massaMagraPercentual.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600">
                  Atletas: 75% - 85%
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};