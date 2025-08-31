import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSofiaAnalysis } from '@/hooks/useSofiaAnalysis';
import { Brain, TrendingUp, AlertTriangle, Target, Sparkles, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartTrackingWidgetProps {
  user: User | null;
  className?: string;
  onInsightClick?: (insight: any) => void;
}

export const SmartTrackingWidget: React.FC<SmartTrackingWidgetProps> = ({
  user,
  className,
  onInsightClick
}) => {
  const {
    currentAnalysis,
    isAnalyzing,
    triggerAutomaticAnalysis,
    detectAnomalies,
    getCategoryInsights
  } = useSofiaAnalysis();

  const [smartSuggestions, setSmartSuggestions] = useState<string[]>([]);
  const [currentAnomalies, setCurrentAnomalies] = useState<string[]>([]);
  const [adaptiveScore, setAdaptiveScore] = useState<number>(0);

  // Análise automática baseada em atividade do usuário
  useEffect(() => {
    if (user && !isAnalyzing) {
      // Trigger análise automática quando widget carrega
      triggerAutomaticAnalysis(user.id, 'widget_load');
    }
  }, [user, triggerAutomaticAnalysis, isAnalyzing]);

  // Gerar sugestões inteligentes baseadas na análise atual
  useEffect(() => {
    if (currentAnalysis) {
      generateSmartSuggestions();
      calculateAdaptiveScore();
    }
  }, [currentAnalysis]);

  const generateSmartSuggestions = () => {
    if (!currentAnalysis) return;

    const suggestions = [];
    const time = new Date().getHours();

    // Sugestões baseadas no horário e padrões
    if (time >= 6 && time <= 10) {
      // Manhã
      const morningInsights = getCategoryInsights(currentAnalysis, 'water');
      if (morningInsights?.relevantTips?.length > 0) {
        suggestions.push(`🌅 ${morningInsights.relevantTips[0]}`);
      }
    } else if (time >= 11 && time <= 14) {
      // Almoço
      const foodInsights = getCategoryInsights(currentAnalysis, 'food');
      if (foodInsights?.relevantRecommendations?.length > 0) {
        suggestions.push(`🍽️ ${foodInsights.relevantRecommendations[0]}`);
      }
    } else if (time >= 15 && time <= 18) {
      // Tarde
      const exerciseInsights = getCategoryInsights(currentAnalysis, 'exercise');
      if (exerciseInsights?.relevantTips?.length > 0) {
        suggestions.push(`💪 ${exerciseInsights.relevantTips[0]}`);
      }
    } else {
      // Noite
      const sleepInsights = getCategoryInsights(currentAnalysis, 'sleep');
      if (sleepInsights?.relevantTips?.length > 0) {
        suggestions.push(`😴 ${sleepInsights.relevantTips[0]}`);
      }
    }

    // Adicionar recomendações gerais
    const topRecommendations = (currentAnalysis.recommendations || []).slice(0, 2);
    suggestions.push(...topRecommendations.map(rec => `✨ ${rec}`));

    setSmartSuggestions(suggestions.slice(0, 3));
  };

  const calculateAdaptiveScore = () => {
    if (!currentAnalysis) return;

    let score = 85; // Base score

    // Ajustar baseado em anomalias
    const anomalies = currentAnalysis.anomalies || [];
    score -= anomalies.length * 10;

    // Ajustar baseado em insights positivos
    const insights = currentAnalysis.insights || [];
    const positiveInsights = insights.filter(insight => 
      insight.toLowerCase().includes('melhora') || 
      insight.toLowerCase().includes('progresso') ||
      insight.toLowerCase().includes('consistente')
    );
    score += positiveInsights.length * 5;

    // Manter entre 0-100
    setAdaptiveScore(Math.max(0, Math.min(100, score)));
  };

  const handleDataUpdate = async (newData: any) => {
    if (!user) return;
    
    // Detectar anomalias em tempo real
    const anomalies = await detectAnomalies(user.id, newData);
    setCurrentAnomalies(anomalies);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (!user) {
    return null;
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Sofia AI Widget */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm">Sofia AI Assistant</CardTitle>
                <CardDescription className="text-xs">
                  Análise inteligente em tempo real
                </CardDescription>
              </div>
            </div>
            {isAnalyzing && (
              <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" />
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Score Adaptativo */}
          <div className={cn("p-3 rounded-lg border", getScoreBgColor(adaptiveScore))}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Score de Saúde</span>
              <span className={cn("text-lg font-bold", getScoreColor(adaptiveScore))}>
                {adaptiveScore}%
              </span>
            </div>
            <Progress value={adaptiveScore} className="h-2" />
            <p className="text-xs text-gray-600 mt-1">
              {adaptiveScore >= 80 ? 'Excelente!' : 
               adaptiveScore >= 60 ? 'Bom progresso' : 'Precisa de atenção'}
            </p>
          </div>

          {/* Sugestões Inteligentes */}
          {smartSuggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium">Sugestões Inteligentes</span>
              </div>
              {smartSuggestions.map((suggestion, index) => (
                <div 
                  key={index} 
                  className="p-2 bg-white/50 rounded border cursor-pointer hover:bg-white/70 transition-colors"
                  onClick={() => onInsightClick && onInsightClick({ suggestion, type: 'smart_tip' })}
                >
                  <p className="text-xs text-gray-700">{suggestion}</p>
                </div>
              ))}
            </div>
          )}

          {/* Anomalias em Tempo Real */}
          {currentAnomalies.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700">Atenção Necessária</span>
              </div>
              {currentAnomalies.map((anomaly, index) => (
                <div key={index} className="p-2 bg-amber-50 rounded border border-amber-200">
                  <p className="text-xs text-amber-700">{anomaly}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Insights */}
      {currentAnalysis && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Insights Rápidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(currentAnalysis.insights || []).slice(0, 2).map((insight, index) => (
                <div 
                  key={index}
                  className="p-2 bg-blue-50 rounded border cursor-pointer hover:bg-blue-100 transition-colors"
                  onClick={() => onInsightClick && onInsightClick({ insight, type: 'main_insight' })}
                >
                  <p className="text-xs text-blue-700">{insight}</p>
                </div>
              ))}
              {(currentAnalysis.insights || []).length > 2 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full text-xs h-8"
                  onClick={() => onInsightClick && onInsightClick({ type: 'view_all' })}
                >
                  Ver todos os insights ({(currentAnalysis.insights || []).length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Próximas Metas Sugeridas */}
      {currentAnalysis && (currentAnalysis.personalized_tips || []).length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="h-4 w-4 text-green-500" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(currentAnalysis.personalized_tips || []).slice(0, 2).map((tip, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-xs text-green-700">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status de Aprendizado da Sofia */}
      {currentAnalysis && currentAnalysis.sofia_learning && (
        <Card className="border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-600" />
              Sofia está aprendendo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <p className="text-xs text-purple-700 leading-relaxed">
                {(currentAnalysis.sofia_learning || '').substring(0, 120)}...
              </p>
              <Badge variant="secondary" className="mt-2 text-xs">
                Conhecimento atualizado
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};