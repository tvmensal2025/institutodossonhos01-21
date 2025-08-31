import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSofiaAnalysis } from '@/hooks/useSofiaAnalysis';
import { Brain, TrendingUp, AlertTriangle, Lightbulb, Target, History, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SofiaNutritionInsights } from '@/components/sofia/SofiaNutritionInsights';

interface SofiaAnalysisDashboardProps {
  user: User | null;
  className?: string;
}

export const SofiaAnalysisDashboard: React.FC<SofiaAnalysisDashboardProps> = ({ 
  user, 
  className 
}) => {
  const {
    isAnalyzing,
    currentAnalysis,
    analysisHistory,
    error,
    performAnalysis,
    loadAnalysisHistory,
    getSofiaKnowledge,
    getCategoryInsights,
    clearError
  } = useSofiaAnalysis();

  const [sofiaKnowledge, setSofiaKnowledge] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    if (user) {
      loadAnalysisHistory(user.id);
      loadSofiaKnowledge();
    }
  }, [user, loadAnalysisHistory]);

  const loadSofiaKnowledge = async () => {
    if (!user) return;
    const knowledge = await getSofiaKnowledge(user.id);
    setSofiaKnowledge(knowledge);
  };

  const handleAnalysis = async () => {
    if (!user) return;
    clearError();
    await performAnalysis(user.id, 'complete');
    await loadAnalysisHistory(user.id);
    await loadSofiaKnowledge();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInsightIcon = (insight: string) => {
    if (insight.toLowerCase().includes('anomalia') || insight.toLowerCase().includes('atenção')) {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    }
    if (insight.toLowerCase().includes('melhora') || insight.toLowerCase().includes('progresso')) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return <Lightbulb className="h-4 w-4 text-blue-500" />;
  };

  const getCategoryInsight = (category: string) => {
    return getCategoryInsights(currentAnalysis, category);
  };

  if (!user) {
    return (
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-600" />
            Sofia Analysis
          </CardTitle>
          <CardDescription>
            Faça login para acessar análises personalizadas
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className={cn("w-full space-y-6", className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Sofia Analysis
                </CardTitle>
                <CardDescription>
                  IA especializada analisando seus padrões de saúde
                </CardDescription>
              </div>
            </div>
            <Button 
              onClick={handleAnalysis} 
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Analisando...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Nova Análise
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis Results */}
      {currentAnalysis && (
        <Tabs defaultValue="insights" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="insights">Insights</TabsTrigger>
            <TabsTrigger value="patterns">Padrões</TabsTrigger>
            <TabsTrigger value="recommendations">Recomendações</TabsTrigger>
            <TabsTrigger value="predictions">Previsões</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalias</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4">
            <SofiaNutritionInsights />
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(currentAnalysis.patterns).map(([key, pattern]) => {
                const categoryName = key.replace('_patterns', '').replace('_', ' ');
                const categoryIcons: { [key: string]: React.ReactNode } = {
                  sleep: '😴',
                  water: '💧',
                  mood: '😊',
                  exercise: '💪',
                  weight: '⚖️',
                  food: '🍎'
                };
                
                return (
                  <Card key={key}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-sm capitalize">
                        <span className="text-lg">{categoryIcons[categoryName] || '📊'}</span>
                        {categoryName}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{pattern}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-500" />
                  Recomendações Personalizadas
                </CardTitle>
                <CardDescription>
                  Ações específicas baseadas em seus padrões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                      <Target className="h-4 w-4 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm text-gray-700 mb-2">{rec}</p>
                        <div className="flex gap-2">
                          <Badge variant="outline" className="text-xs">
                            Prioridade {index < 3 ? 'Alta' : 'Média'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Dicas Personalizadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalysis.personalized_tips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                      <Sparkles className="h-4 w-4 text-purple-600 mt-0.5" />
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Tendência de Peso
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{currentAnalysis.predictions.weight_trend}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-yellow-500" />
                    Previsão de Energia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{currentAnalysis.predictions.energy_forecast}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    Probabilidade de Metas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{currentAnalysis.predictions.goal_likelihood}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Anomalias Detectadas
                </CardTitle>
                <CardDescription>
                  Padrões atípicos que merecem atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                {currentAnalysis.anomalies.length > 0 ? (
                  <div className="space-y-3">
                    {currentAnalysis.anomalies.map((anomaly, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border-l-4 border-amber-500">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <p className="text-sm text-gray-700">{anomaly}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">Nenhuma anomalia detectada</p>
                    <p className="text-xs text-gray-400 mt-1">Seus padrões estão dentro do esperado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Sofia Learning */}
      {currentAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              O que Sofia Aprendeu Sobre Você
            </CardTitle>
            <CardDescription>
              Conhecimento adquirido para futuras análises
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                {currentAnalysis.sofia_learning}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Analysis History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-gray-600" />
            Histórico de Análises
          </CardTitle>
          <CardDescription>
            Evolução dos insights ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[300px] w-full">
            {analysisHistory.length > 0 ? (
              <div className="space-y-3">
                {analysisHistory.map((analysis, index) => (
                  <div key={analysis.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">Análise #{analysisHistory.length - index}</p>
                      <p className="text-xs text-gray-500">{formatDate(analysis.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Score: {analysis.risk_score}
                      </Badge>
                      <Badge variant={analysis.risk_score > 50 ? "destructive" : "default"}>
                        {analysis.risk_score > 50 ? "Atenção" : "Normal"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Nenhuma análise anterior</p>
                <p className="text-xs text-gray-400 mt-1">Execute uma análise para começar</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};