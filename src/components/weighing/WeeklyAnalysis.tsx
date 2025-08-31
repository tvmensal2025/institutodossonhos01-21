import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';

const WeeklyAnalysis: React.FC = () => {
  const { weeklyAnalyses, loading } = useWeightMeasurement();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (weeklyAnalyses.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma Análise Semanal</h3>
            <p className="text-muted-foreground">
              Registre pesagens durante a semana para ver suas análises semanais.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (tendencia: string) => {
    switch (tendencia) {
      case 'diminuindo':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'aumentando':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendColor = (tendencia: string) => {
    switch (tendencia) {
      case 'diminuindo':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'aumentando':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    }
  };

  const getTrendLabel = (tendencia: string) => {
    switch (tendencia) {
      case 'diminuindo':
        return 'Diminuindo';
      case 'aumentando':
        return 'Aumentando';
      default:
        return 'Estável';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Calendar className="h-6 w-6" />
          Análises Semanais
        </h2>
        <p className="text-muted-foreground">
          Acompanhe sua evolução semana a semana
        </p>
      </div>

      <div className="grid gap-4">
        {weeklyAnalyses.map((analysis) => (
          <Card key={analysis.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-lg">
                  {new Date(analysis.week_start_date).toLocaleDateString('pt-BR')} - {' '}
                  {new Date(analysis.week_end_date).toLocaleDateString('pt-BR')}
                </span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(analysis.trends?.tendencia || 'stable')}
                  <Badge className={getTrendColor(analysis.trends?.tendencia || 'stable')}>
                    {getTrendLabel(analysis.trends?.tendencia || 'stable')}
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Peso Inicial</p>
                  <p className="text-2xl font-bold">
                    {analysis.summary_data?.peso_inicial ? `${analysis.summary_data.peso_inicial}kg` : '-'}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Peso Final</p>
                  <p className="text-2xl font-bold">
                    {analysis.summary_data?.peso_final ? `${analysis.summary_data.peso_final}kg` : '-'}
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Variação</p>
                  <p className={`text-2xl font-bold ${
                    analysis.summary_data?.variacao_peso && analysis.summary_data.variacao_peso > 0 
                      ? 'text-red-500' 
                      : analysis.summary_data?.variacao_peso && analysis.summary_data.variacao_peso < 0 
                        ? 'text-green-500' 
                        : 'text-blue-500'
                  }`}>
                    {analysis.summary_data?.variacao_peso 
                      ? `${analysis.summary_data.variacao_peso > 0 ? '+' : ''}${analysis.summary_data.variacao_peso.toFixed(1)}kg`
                      : '-'
                    }
                  </p>
                </div>
                
                <div className="text-center p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">IMC Médio</p>
                  <p className="text-2xl font-bold">
                    {'-'}
                  </p>
                </div>
              </div>
              
              {/* Observações removidas temporariamente */}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WeeklyAnalysis;