import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface GeneralScoreProps {
  totalScore: number;
  className?: string;
}

export const GeneralScore: React.FC<GeneralScoreProps> = ({
  totalScore,
  className = ""
}) => {
  // Garantir que o totalScore seja um número inteiro limpo
  const cleanTotalScore = Math.round(Number(totalScore) || 0);

  // Função para determinar cor do score baseado no valor
  const getScoreColor = (score: number) => {
    if (score < 4) return '#ef4444'; // Crítico - vermelho
    if (score < 7) return '#f59e0b'; // Atenção - amarelo/laranja  
    return '#10b981'; // Excelente - verde
  };

  return (
    <Card className={`bg-gray-900 text-white border-gray-700 ${className}`}>
      <CardContent className="pt-6">
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
                stroke={getScoreColor(cleanTotalScore)}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(cleanTotalScore / 10) * 251.2} 251.2`}
                style={{
                  transition: 'stroke-dasharray 1s ease-in-out'
                }}
              />
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
              <div className="text-5xl font-bold text-white mb-1">
                {Math.round((cleanTotalScore / 10) * 100)}%
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
  );
};

export default GeneralScore;