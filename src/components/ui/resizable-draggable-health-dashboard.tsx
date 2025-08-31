import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthWheel } from '@/components/ui/health-wheel';
import { SymptomEvolutionChart } from '@/components/ui/symptom-evolution-chart';
import { motion } from 'framer-motion';

interface HealthSystemData {
  systemName: string;
  score: number;
  color: string;
  icon: string;
  symptomsCount: number;
  symptoms: string[];
}

interface EvolutionData {
  month: string;
  totalScore: number;
  [key: string]: number | string;
}

interface ResizableDraggableHealthDashboardProps {
  data: HealthSystemData[];
  totalScore: number;
  evolutionData?: EvolutionData[];
  title?: string;
  className?: string;
  size?: number;
  showHealthWheel?: boolean;
  showEvolutionChart?: boolean;
}

export const ResizableDraggableHealthDashboard: React.FC<ResizableDraggableHealthDashboardProps> = ({
  data,
  totalScore,
  evolutionData = [],
  title = "Mapeamento de Sintomas",
  className = "",
  size = 450,
  showHealthWheel = true,
  showEvolutionChart = true
}) => {
  // Estados para controlar tamanhos dos componentes
  const [symptomsSize, setSymptomsSize] = useState({ width: 400, height: 300 });
  const [wheelSize, setWheelSize] = useState({ width: 450, height: 450 });
  const [chartSize, setChartSize] = useState({ width: 800, height: 500 });

  // Função para resize
  const handleResize = (
    component: 'symptoms' | 'wheel' | 'chart',
    deltaX: number,
    deltaY: number
  ) => {
    switch (component) {
      case 'symptoms':
        setSymptomsSize(prev => ({
          width: Math.max(300, prev.width + deltaX),
          height: Math.max(200, prev.height + deltaY)
        }));
        break;
      case 'wheel':
        setWheelSize(prev => ({
          width: Math.max(300, prev.width + deltaX),
          height: Math.max(300, prev.height + deltaY)
        }));
        break;
      case 'chart':
        setChartSize(prev => ({
          width: Math.max(400, prev.width + deltaX),
          height: Math.max(300, prev.height + deltaY)
        }));
        break;
    }
  };

  // Função para gerar feedback simples baseado no score
  const getSimpleFeedback = (systemName: string, score: number) => {
    if (score < 4) {
      return `Requer atenção imediata. Considere buscar apoio profissional.`;
    }
    if (score < 7) {
      return `Progresso possível com pequenos ajustes no dia a dia.`;
    }
    return `Parabéns! Continue mantendo os bons hábitos.`;
  };

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* Layout responsivo em grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Roda da Vida/Saúde */}
        {showHealthWheel && (
          <div className="col-span-1 lg:col-span-1 xl:col-span-1">
            <Card className="bg-gray-900 text-white border-gray-700 h-fit">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-white text-xl">🎯 {title}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center p-4">
                <HealthWheel 
                  data={data} 
                  totalScore={totalScore} 
                  title={title}
                  size={350}
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Evolução dos Sintomas */}
        <div className="col-span-1 lg:col-span-1 xl:col-span-1">
          <SymptomEvolutionChart 
            title="Evolução dos Sintomas"
            className="h-fit"
          />
        </div>

        {/* Score Geral */}
        <div className="col-span-1 lg:col-span-2 xl:col-span-1">
          <Card className="bg-gray-900 text-white border-gray-700 h-fit">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-xl">📊 Score Geral</CardTitle>
            </CardHeader>
            <CardContent className="text-center p-6">
              <div className="text-6xl font-bold text-yellow-400 mb-4">
                {totalScore.toFixed(1)}
              </div>
              <div className="text-lg text-gray-300 mb-4">
                de 10.0 pontos
              </div>
              <div className="space-y-2">
                {data.slice(0, 3).map((system, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span>{system.icon}</span>
                      <span className="text-sm text-gray-300">
                        {system.systemName.length > 20 
                          ? system.systemName.substring(0, 17) + '...' 
                          : system.systemName}
                      </span>
                    </div>
                    <span className="text-yellow-400 font-semibold">
                      {system.score.toFixed(1)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

      </div>

      {/* Gráfico de Evolução Mensal - Largura completa */}
      {showEvolutionChart && (
        <div className="w-full">
          <Card className="bg-gray-900 text-white border-gray-700">
            <CardHeader className="text-center">
              <CardTitle className="text-white text-xl flex items-center justify-center gap-2">
                📈 Evolução Mensal dos Resultados
              </CardTitle>
              <div className="text-sm text-gray-400">
                Acompanhe a evolução do seu score geral e dos principais sistemas
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {evolutionData.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={evolutionData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalScore" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Score Total"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                    />
                    {data.slice(0, 3).map((system, index) => (
                      <Line
                        key={system.systemName}
                        type="monotone"
                        dataKey={system.systemName.toLowerCase().replace(/ /g, '_')}
                        stroke={system.color}
                        strokeWidth={2}
                        name={system.systemName}
                        dot={{ fill: system.color, strokeWidth: 2, r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart 
                    data={[
                      { month: 'Jan', totalScore: Math.round(Number(totalScore) || 0) * 0.7 },
                      { month: 'Fev', totalScore: Math.round(Number(totalScore) || 0) * 0.8 },
                      { month: 'Mar', totalScore: Math.round(Number(totalScore) || 0) * 0.9 },
                      { month: 'Abr', totalScore: Math.round(Number(totalScore) || 0) },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3,3" stroke="#374151" />
                    <XAxis 
                      dataKey="month" 
                      stroke="#9CA3AF"
                      fontSize={12}
                    />
                    <YAxis 
                      stroke="#9CA3AF"
                      fontSize={12}
                      domain={[0, 10]}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalScore" 
                      stroke="#10b981" 
                      strokeWidth={3}
                      name="Score Total"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                      strokeDasharray="5,5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
              
              {evolutionData.length === 0 && (
                <div className="text-center mt-4 p-4 bg-gray-800 rounded-lg">
                  <p className="text-gray-400 text-sm">
                    📊 Dados simulados baseados no seu score atual. 
                    Faça mais avaliações para ver sua evolução real ao longo do tempo.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
  };

  export default ResizableDraggableHealthDashboard;