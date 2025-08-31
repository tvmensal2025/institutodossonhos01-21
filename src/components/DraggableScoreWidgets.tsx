import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaData {
  name: string;
  score: number;
  icon: string;
  color: string;
}

interface DraggableScoreWidgetsProps {
  totalScore: number;
  areas: AreaData[];
  otherAreasCount?: number;
  className?: string;
  layout?: 'horizontal' | 'vertical' | 'grid';
}

export const DraggableScoreWidgets: React.FC<DraggableScoreWidgetsProps> = ({
  totalScore,
  areas,
  otherAreasCount = 0,
  className = "",
  layout = 'horizontal'
}) => {
  // Função para determinar cor do score baseado no valor
  const getScoreColor = (score: number) => {
    if (score < 40) return '#ef4444'; // Crítico - vermelho
    if (score < 70) return '#f59e0b'; // Atenção - amarelo/laranja  
    return '#10b981'; // Excelente - verde
  };

  const getLayoutClasses = () => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col gap-6';
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 gap-6';
      default:
        return 'flex flex-col lg:flex-row gap-6';
    }
  };

  return (
    <div className={`${getLayoutClasses()} ${className}`}>
      
      {/* Pontuação Total da Avaliação - Arrastável */}
      <motion.div 
        drag
        dragMomentum={false}
        className="cursor-move"
        whileDrag={{ scale: 1.02, zIndex: 50 }}
      >
        <div className="bg-gray-800/20 p-2 rounded-t-lg mb-2">
          <span className="text-xs text-gray-400">📊 Arrastar para mover</span>
        </div>
        <Card className="bg-gray-900 text-white border-gray-700">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-xl">
              Pontuação Total da Avaliação
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-center">
              {/* Score principal com gauge visual */}
              <div className="relative inline-block">
                <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto">
                  {/* Background arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke="#374151"
                    strokeWidth="12"
                    strokeLinecap="round"
                  />
                  {/* Progress arc */}
                  <path
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    stroke={getScoreColor(totalScore)}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(totalScore / 100) * 251.2} 251.2`}
                    style={{
                      transition: 'stroke-dasharray 1s ease-in-out'
                    }}
                  />
                  {/* Score markers */}
                  <text x="20" y="115" textAnchor="middle" className="text-xs fill-slate-400">0%</text>
                  <text x="100" y="35" textAnchor="middle" className="text-xs fill-slate-400">50%</text>
                  <text x="180" y="115" textAnchor="middle" className="text-xs fill-slate-400">100%</text>
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
                  <div className="text-5xl font-bold text-white mb-1">
                    {totalScore}%
                  </div>
                  <div className="text-sm font-medium text-gray-300 uppercase tracking-wider">
                    SCORE GERAL
                  </div>
                </div>
              </div>

              {/* Legendas das faixas */}
              <div className="flex justify-center gap-6 mt-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-gray-300">0-40% Crítico</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-gray-300">41-70% Atenção</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-gray-300">71-100% Excelente</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resumo por Área - Arrastável */}
      <motion.div 
        drag
        dragMomentum={false}
        className="cursor-move"
        whileDrag={{ scale: 1.02, zIndex: 50 }}
      >
        <div className="bg-gray-800/20 p-2 rounded-t-lg mb-2">
          <span className="text-xs text-gray-400">📋 Arrastar para mover</span>
        </div>
        <Card className="bg-gray-900 text-white border-gray-700">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-white text-xl">Resumo por Área</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {areas.map((area, index) => (
                <div key={index} className="bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{area.icon}</span>
                      <span className="font-medium text-white">
                        {area.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold" style={{ color: area.color }}>
                        {area.score}%
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {otherAreasCount > 0 && (
                <div className="text-center pt-3 border-t border-gray-600">
                  <span className="text-xs text-gray-400">
                    +{otherAreasCount} outras áreas permitidas
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

    </div>
  );
};

export default DraggableScoreWidgets; 