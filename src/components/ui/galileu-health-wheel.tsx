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

interface GalileuHealthWheelProps {
  data: HealthSystemData[];
  totalScore: number;
  evolutionData?: EvolutionData[];
  title?: string;
  className?: string;
  size?: number;
  showHealthWheel?: boolean;
  showEvolutionChart?: boolean;
}

export const GalileuHealthWheel: React.FC<GalileuHealthWheelProps> = ({
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
      {/* Layout flexível - todos os componentes arrastavéis */}
      <div className="relative min-h-screen">
        
        {/* Evolução dos Sintomas - Arrastável e Redimensionável */}
        <motion.div 
          drag
          dragMomentum={false}
          className="absolute top-0 left-0 cursor-move group"
          style={{ width: symptomsSize.width, height: symptomsSize.height }}
          whileDrag={{ scale: 1.05, zIndex: 50 }}
        >
          <div className="bg-gray-800/20 p-2 rounded-t-lg flex justify-between items-center">
            <span className="text-xs text-gray-400">📊 Arrastar para mover</span>
            <div className="flex gap-1">
              <button
                className="text-xs text-gray-400 hover:text-white px-1"
                onMouseDown={(e) => {
                  e.stopPropagation();
                  const startX = e.clientX;
                  const startY = e.clientY;
                  
                  const handleMouseMove = (moveEvent: MouseEvent) => {
                    const deltaX = moveEvent.clientX - startX;
                    const deltaY = moveEvent.clientY - startY;
                    handleResize('symptoms', deltaX / 10, deltaY / 10);
                  };
                  
                  const handleMouseUp = () => {
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                  };
                  
                  document.addEventListener('mousemove', handleMouseMove);
                  document.addEventListener('mouseup', handleMouseUp);
                }}
              >
                📏
              </button>
            </div>
          </div>
          <div style={{ width: '100%', height: 'calc(100% - 40px)' }}>
            <SymptomEvolutionChart />
          </div>
          
          {/* Handle de redimensionamento no canto inferior direito */}
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-gray-600 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
            onMouseDown={(e) => {
              e.stopPropagation();
              const startX = e.clientX;
              const startY = e.clientY;
              const startWidth = symptomsSize.width;
              const startHeight = symptomsSize.height;
              
              const handleMouseMove = (moveEvent: MouseEvent) => {
                const deltaX = moveEvent.clientX - startX;
                const deltaY = moveEvent.clientY - startY;
                setSymptomsSize({
                  width: Math.max(300, startWidth + deltaX),
                  height: Math.max(200, startHeight + deltaY)
                });
              };
              
              const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
              };
              
              document.addEventListener('mousemove', handleMouseMove);
              document.addEventListener('mouseup', handleMouseUp);
            }}
          />
        </motion.div>

        {/* Roda da Vida/Saúde - Arrastável e Redimensionável */}
        {showHealthWheel && (
          <motion.div 
            drag
            dragMomentum={false}
            className="absolute top-0 right-0 cursor-move group"
            style={{ width: wheelSize.width, height: wheelSize.height }}
            whileDrag={{ scale: 1.05, zIndex: 50 }}
          >
            <div className="bg-gray-800/20 p-2 rounded-t-lg flex justify-between items-center">
              <span className="text-xs text-gray-400">🎯 Arrastar para mover</span>
              <div className="flex gap-1">
                <button
                  className="text-xs text-gray-400 hover:text-white px-1"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const deltaY = moveEvent.clientY - startY;
                      handleResize('wheel', deltaX / 10, deltaY / 10);
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  📏
                </button>
              </div>
            </div>
            <div className="flex justify-center" style={{ height: 'calc(100% - 40px)' }}>
              <HealthWheel 
                data={data} 
                totalScore={totalScore} 
                title={title}
                size={Math.min(wheelSize.width - 40, wheelSize.height - 80)}
              />
            </div>
            
            {/* Handle de redimensionamento no canto inferior direito */}
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-gray-600 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
              onMouseDown={(e) => {
                e.stopPropagation();
                const startX = e.clientX;
                const startY = e.clientY;
                const startWidth = wheelSize.width;
                const startHeight = wheelSize.height;
                
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const deltaX = moveEvent.clientX - startX;
                  const deltaY = moveEvent.clientY - startY;
                  setWheelSize({
                    width: Math.max(300, startWidth + deltaX),
                    height: Math.max(300, startHeight + deltaY)
                  });
                };
                
                const handleMouseUp = () => {
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };
                
                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
          </motion.div>
        )}

        {/* Gráfico de Evolução Mensal - Arrastável e Redimensionável */}
        {showEvolutionChart && (
          <motion.div 
            drag
            dragMomentum={false}
            className="absolute top-[400px] left-0 cursor-move group"
            style={{ width: chartSize.width, height: chartSize.height }}
            whileDrag={{ scale: 1.05, zIndex: 50 }}
          >
            <div className="bg-gray-800/20 p-2 rounded-t-lg flex justify-between items-center">
              <span className="text-xs text-gray-400">📈 Arrastar para mover</span>
              <div className="flex gap-1">
                <button
                  className="text-xs text-gray-400 hover:text-white px-1"
                  onMouseDown={(e) => {
                    e.stopPropagation();
                    const startX = e.clientX;
                    const startY = e.clientY;
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      const deltaX = moveEvent.clientX - startX;
                      const deltaY = moveEvent.clientY - startY;
                      handleResize('chart', deltaX / 10, deltaY / 10);
                    };
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove);
                      document.removeEventListener('mouseup', handleMouseUp);
                    };
                    
                    document.addEventListener('mousemove', handleMouseMove);
                    document.addEventListener('mouseup', handleMouseUp);
                  }}
                >
                  📏
                </button>
              </div>
            </div>
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
                  <ResponsiveContainer width="100%" height={chartSize.height - 120}>
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
                  <ResponsiveContainer width="100%" height={chartSize.height - 120}>
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
             
             {/* Handle de redimensionamento no canto inferior direito */}
             <div
               className="absolute bottom-0 right-0 w-4 h-4 bg-gray-600 cursor-se-resize opacity-0 group-hover:opacity-100 transition-opacity"
               onMouseDown={(e) => {
                 e.stopPropagation();
                 const startX = e.clientX;
                 const startY = e.clientY;
                 const startWidth = chartSize.width;
                 const startHeight = chartSize.height;
                 
                 const handleMouseMove = (moveEvent: MouseEvent) => {
                   const deltaX = moveEvent.clientX - startX;
                   const deltaY = moveEvent.clientY - startY;
                   setChartSize({
                     width: Math.max(400, startWidth + deltaX),
                     height: Math.max(300, startHeight + deltaY)
                   });
                 };
                 
                 const handleMouseUp = () => {
                   document.removeEventListener('mousemove', handleMouseMove);
                   document.removeEventListener('mouseup', handleMouseUp);
                 };
                 
                 document.addEventListener('mousemove', handleMouseMove);
                 document.addEventListener('mouseup', handleMouseUp);
               }}
             />
           </motion.div>
         )}

      </div>
    </div>
  );
};

export default GalileuHealthWheel;