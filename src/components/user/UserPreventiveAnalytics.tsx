// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Brain, 
  Heart, 
  Target,
  Calendar,
  BarChart3,
  LineChart,
  CheckCircle,
  XCircle,
  AlertCircle,
  Stethoscope,
  Clock,
  Zap
} from 'lucide-react';
import {
  LineChart as RechartsLineChart,
  BarChart as RechartsBarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface PreventiveAnalysis {
  id: string;
  analysis_type: 'quinzenal' | 'mensal';
  analysis_date: string;
  dr_vital_analysis: string;
  risk_score: number;
  risk_level: 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRÍTICO';
  health_risks: string[];
  positive_points: string[];
  urgent_warnings: string[];
  metrics: {
    weight_trend: string | null;
    mission_compliance: string;
    exercise_days: number;
    avg_sleep: number;
    avg_mood: number;
    avg_energy: number;
    measurements_count: number;
  };
}

const UserPreventiveAnalytics: React.FC = () => {
  const [analyses, setAnalyses] = useState<PreventiveAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'quinzenal' | 'mensal' | 'todos'>('todos');
  const { toast } = useToast();

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Buscar análises do usuário
      const { data, error } = await supabase
        .from('preventive_health_analyses')
        .select('*')
        .eq('user_id', user.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear os dados do banco para o tipo correto
      const mappedData: PreventiveAnalysis[] = (data || []).map(item => ({
        id: item.id,
        analysis_type: item.analysis_type as 'quinzenal' | 'mensal',
        analysis_date: item.created_at,
        dr_vital_analysis: 'Análise automática gerada',
        risk_score: item.risk_score,
        risk_level: 'BAIXO' as const,
        health_risks: Array.isArray(item.risk_factors) ? item.risk_factors as string[] : [],
        positive_points: Array.isArray(item.recommendations) ? item.recommendations as string[] : [],
        urgent_warnings: [],
        metrics: typeof item.analysis_data === 'object' && item.analysis_data ? item.analysis_data as any : {
          weight_trend: null,
          mission_compliance: '0',
          exercise_days: 0,
          avg_sleep: 7,
          avg_mood: 5,
          avg_energy: 5,
          measurements_count: 0
        }
      }));
      
      setAnalyses(mappedData);
    } catch (error) {
      console.error('Erro ao carregar análises:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar análises preventivas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAnalysis = async (type: 'quinzenal' | 'mensal') => {
    try {
      setGenerating(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase.functions.invoke('preventive-health-analysis', {
        body: {
          userId: user.user.id,
          analysisType: type
        }
      });

      if (error) throw error;
      
      toast({
        title: "✅ Análise Gerada",
        description: `Análise ${type} gerada com sucesso!`,
      });
      await loadAnalyses();
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar análise preventiva",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'CRÍTICO': return 'destructive';
      case 'ALTO': return 'destructive';
      case 'MODERADO': return 'secondary';
      case 'BAIXO': return 'default';
      default: return 'default';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'CRÍTICO': return <XCircle className="h-4 w-4" />;
      case 'ALTO': return <AlertTriangle className="h-4 w-4" />;
      case 'MODERADO': return <AlertCircle className="h-4 w-4" />;
      case 'BAIXO': return <CheckCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const filteredAnalyses = selectedPeriod === 'todos' 
    ? analyses 
    : analyses.filter(a => a.analysis_type === selectedPeriod);

  // Dados para gráficos
  const riskTrendData = filteredAnalyses
    .slice(-12)
    .reverse()
    .map((analysis, index) => ({
      period: `${analysis.analysis_type} ${index + 1}`,
      score: analysis.risk_score,
      level: analysis.risk_level,
      date: new Date(analysis.analysis_date).toLocaleDateString('pt-BR')
    }));

  const metricsData = filteredAnalyses
    .slice(-6)
    .reverse()
    .map((analysis, index) => ({
      period: `${analysis.analysis_type} ${index + 1}`,
      sleep: analysis.metrics.avg_sleep,
      mood: analysis.metrics.avg_mood,
      energy: analysis.metrics.avg_energy,
      exercise: analysis.metrics.exercise_days
    }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Análises Preventivas - Dr. Vital</h2>
          <p className="text-muted-foreground">
            Análises automáticas quinzenais e mensais da sua saúde
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => generateAnalysis('quinzenal')}
            disabled={generating}
            variant="outline"
            className="flex items-center gap-2"
          >
            {generating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            ) : (
              <Zap className="h-4 w-4" />
            )}
            Gerar Quinzenal
          </Button>
          
          <Button 
            onClick={() => generateAnalysis('mensal')}
            disabled={generating}
            className="flex items-center gap-2"
          >
            {generating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Stethoscope className="h-4 w-4" />
            )}
            Gerar Mensal
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="quinzenal">Quinzenal</TabsTrigger>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tendência de Risco */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Tendência de Risco ao Longo do Tempo
                </CardTitle>
                <CardDescription>
                  Evolução do seu score de saúde nas últimas análises
                </CardDescription>
              </CardHeader>
              <CardContent>
                {riskTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsLineChart data={riskTrendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                        dot={{ fill: '#8884d8', strokeWidth: 2, r: 4 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma análise disponível</p>
                      <p className="text-sm">Gere sua primeira análise para ver os gráficos</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Métricas de Saúde */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Métricas de Saúde
                </CardTitle>
                <CardDescription>
                  Principais indicadores de bem-estar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metricsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={metricsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sleep" fill="#8884d8" />
                      <Bar dataKey="mood" fill="#82ca9d" />
                      <Bar dataKey="energy" fill="#ffc658" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-muted-foreground">
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma métrica disponível</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lista de Análises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Análises
              </CardTitle>
              <CardDescription>
                Suas análises preventivas mais recentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredAnalyses.length > 0 ? (
                <div className="space-y-4">
                  {filteredAnalyses.map((analysis) => (
                    <Card key={analysis.id} className="border-l-4 border-l-blue-500">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {getRiskIcon(analysis.risk_level)}
                            <div>
                              <CardTitle className="text-lg">
                                Análise {analysis.analysis_type === 'quinzenal' ? 'Quinzenal' : 'Mensal'}
                              </CardTitle>
                              <CardDescription className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                {new Date(analysis.analysis_date).toLocaleDateString('pt-BR')}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getRiskColor(analysis.risk_level)}>
                              {analysis.risk_level}
                            </Badge>
                            <Badge variant="outline">
                              Score: {analysis.risk_score}/100
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Pontos Positivos */}
                        {analysis.positive_points.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-green-600 mb-2">✅ Pontos Positivos</h4>
                            <ul className="text-sm space-y-1">
                              {analysis.positive_points.map((point, index) => (
                                <li key={index} className="text-muted-foreground">• {point}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Riscos de Saúde */}
                        {analysis.health_risks.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-sm text-orange-600 mb-2">⚠️ Riscos Identificados</h4>
                            <ul className="text-sm space-y-1">
                              {analysis.health_risks.map((risk, index) => (
                                <li key={index} className="text-muted-foreground">• {risk}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Alertas Urgentes */}
                        {analysis.urgent_warnings.length > 0 && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Alertas Urgentes:</strong>
                              <ul className="mt-2 space-y-1">
                                {analysis.urgent_warnings.map((warning, index) => (
                                  <li key={index}>• {warning}</li>
                                ))}
                              </ul>
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Métricas */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{analysis.metrics.avg_sleep}h</div>
                            <div className="text-xs text-muted-foreground">Sono Médio</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{analysis.metrics.avg_mood}/10</div>
                            <div className="text-xs text-muted-foreground">Humor</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{analysis.metrics.avg_energy}/10</div>
                            <div className="text-xs text-muted-foreground">Energia</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{analysis.metrics.exercise_days}</div>
                            <div className="text-xs text-muted-foreground">Dias de Exercício</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Stethoscope className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">Nenhuma análise encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    Gere sua primeira análise preventiva para começar a acompanhar sua saúde
                  </p>
                  <Button onClick={() => generateAnalysis('quinzenal')}>
                    <Zap className="h-4 w-4 mr-2" />
                    Gerar Primeira Análise
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserPreventiveAnalytics; 