import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ScoreNodeData {
  totalScore: number;
  label: string;
}

interface ScoreNodeProps {
  data: ScoreNodeData;
}

export const ScoreNode: React.FC<ScoreNodeProps> = memo(({ data }) => {
  const { totalScore } = data;
  
  // Função para determinar cor do score baseado no valor
  const getScoreColor = (score: number) => {
    if (score < 40) return '#ef4444'; // Crítico - vermelho
    if (score < 70) return '#f59e0b'; // Atenção - amarelo/laranja  
    return '#10b981'; // Excelente - verde
  };

  return (
    <div className="react-flow__node-default">
      <Card 
        className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700 w-80"
        style={{ minWidth: '320px' }}
      >
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <CardTitle className="text-lg font-semibold text-white">
            Score Geral
          </CardTitle>
        </div>
        <p className="text-sm text-slate-300">
          Pontuação Total da Avaliação
        </p>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="text-center mb-6">
          {/* Score principal com gauge visual */}
          <div className="relative inline-block mb-4">
            <svg width="200" height="120" viewBox="0 0 200 120" className="mx-auto">
              {/* Background arc - gauge semicircle */}
              <path
                d="M 30 90 A 70 70 0 0 1 170 90"
                fill="none"
                stroke="#374151"
                strokeWidth="8"
                strokeLinecap="round"
              />
              {/* Progress arc */}
              <path
                d="M 30 90 A 70 70 0 0 1 170 90"
                fill="none"
                stroke={getScoreColor(totalScore)}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(totalScore / 100) * 220} 220`}
                style={{
                  transition: 'stroke-dasharray 1s ease-in-out'
                }}
              />
              {/* Score markers */}
              <text x="30" y="105" textAnchor="middle" className="text-xs fill-slate-400">0%</text>
              <text x="100" y="40" textAnchor="middle" className="text-xs fill-slate-400">50%</text>
              <text x="170" y="105" textAnchor="middle" className="text-xs fill-slate-400">100%</text>
            </svg>
            
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-4">
              <div className="text-4xl font-bold text-white mb-1">
                {totalScore}%
              </div>
              <div className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                SCORE GERAL
              </div>
            </div>
          </div>

          {/* Legendas das faixas */}
          <div className="flex justify-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <span className="text-slate-300">0-40% Crítico</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
              <span className="text-slate-300">41-70% Atenção</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-slate-300">71-100% Excelente</span>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Handles para conexões (opcionais) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-slate-500 border-2 border-slate-300"
      />
    </Card>
    </div>
  );
});