import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Trophy, Scale } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface WeeklyProgressData {
  weightProgress: {
    current: number;
    target: number;
    change: number;
    unit: string;
  };
  exerciseProgress: {
    completed: number;
    target: number;
    unit: string;
  };
  hydrationProgress: {
    current: number;
    target: number;
    unit: string;
  };
  overallProgress: number;
  trend: 'positive' | 'negative' | 'neutral';
}

interface WeeklyProgressCardProps {
  data: WeeklyProgressData;
  className?: string;
}

export const WeeklyProgressCard: React.FC<WeeklyProgressCardProps> = ({
  data,
  className = ""
}) => {
  const navigate = useNavigate();
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

  const getTrendIcon = () => {
    switch (data.trend) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getTrendColor = () => {
    switch (data.trend) {
      case 'positive':
        return 'text-green-500';
      case 'negative':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const getTrendText = () => {
    switch (data.trend) {
      case 'positive':
        return 'Positiva';
      case 'negative':
        return 'Atenção';
      default:
        return 'Estável';
    }
  };

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Progresso Semanal Principal */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Progresso Semanal</CardTitle>
            <Trophy className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-sm text-slate-300">
            {format(weekStart, "dd/MM", { locale: ptBR })} - {format(weekEnd, "dd/MM", { locale: ptBR })}
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Meta Principal */}
          <div className="text-center">
            <div className="text-5xl font-bold mb-2">
              {Math.round(data.overallProgress)}%
              <span className="text-lg text-slate-300 ml-2">Meta</span>
            </div>
            <Progress 
              value={data.overallProgress} 
              className="h-3 mb-4"
            />
          </div>

          {/* Detalhes do Progresso */}
          <div className="space-y-4">
            {/* Peso */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Peso:</span>
              <span className={`text-sm font-medium ${data.weightProgress.change < 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.weightProgress.change > 0 ? '+' : ''}{data.weightProgress.change.toFixed(1)}kg
              </span>
            </div>

            {/* Exercícios */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Exercícios:</span>
              <span className="text-sm font-medium text-blue-400">
                {data.exerciseProgress.completed}/{data.exerciseProgress.target} dias
              </span>
            </div>

            {/* Hidratação */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Hidratação:</span>
              <span className="text-sm font-medium text-cyan-400">
                {Math.round(data.hydrationProgress.current)}%
              </span>
            </div>

            {/* Progresso Geral */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Progresso Geral</span>
              <span className="text-sm font-medium text-white">
                {Math.round(data.overallProgress)}%
              </span>
            </div>
          </div>

          {/* Tendência */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-600">
            <span className="text-sm text-slate-300">Tendência:</span>
            <div className="flex items-center gap-1">
              {getTrendIcon()}
              <Badge variant="outline" className={`${getTrendColor()} border-current`}>
                {getTrendText()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Card de Pesagem */}
      <Card className="bg-gradient-to-br from-slate-800 to-slate-700 text-white border-slate-600">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Pesagem</CardTitle>
            <Scale className="w-5 h-5 text-orange-500" />
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Balança Xiaomi */}
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-500/20 rounded-full flex items-center justify-center">
              <Scale className="w-8 h-8 text-orange-500" />
            </div>
            <p className="text-sm text-slate-300 mb-4">Balança Xiaomi</p>
          </div>

          {/* Botão de Ação */}
          <div className="text-center">
            <button 
              data-tutorial="pesagem"
              onClick={() => navigate('/dashboard')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Scale className="w-4 h-4" />
              FAÇA SUA PESAGEM
            </button>
          </div>

          {/* Info adicional */}
          <div className="text-center">
            <p className="text-xs text-slate-400">
              Última pesagem há 2 dias
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};