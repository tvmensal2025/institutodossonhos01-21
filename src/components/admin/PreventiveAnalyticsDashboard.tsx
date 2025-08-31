import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
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
  AlertCircle
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

const PreventiveAnalyticsDashboard: React.FC = () => {
  const [analyses, setAnalyses] = useState<PreventiveAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'quinzenal' | 'mensal' | 'todos'>('todos');

  useEffect(() => {
    loadAnalyses();
  }, []);

  const loadAnalyses = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // const { data, error } = await supabase
      //   .from('preventive_health_analyses')
      //   .select('*')
      //   .eq('user_id', user.user.id)
      //   .order('analysis_date', { ascending: false });
      const data: any[] = [];
      const error = null;

      if (error) throw error;
      
      // Mapear os dados do banco para o tipo correto usando os campos existentes
      const mappedData: PreventiveAnalysis[] = (data || []).map(item => ({
        id: item.id,
        analysis_type: 'quinzenal' as 'quinzenal' | 'mensal',
        analysis_date: item.created_at,
        dr_vital_analysis: 'preventive',
        risk_score: 0.8,
        risk_level: 'MODERADO' as 'BAIXO' | 'MODERADO' | 'ALTO' | 'CRÍTICO',
        health_risks: Array.isArray(item.risk_factors) ? item.risk_factors.map(String) : [],
        positive_points: Array.isArray(item.recommendations) ? item.recommendations.map(String) : [],
        urgent_warnings: [item.analysis_summary || ''],
        metrics: {
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
      toast.error('Erro ao carregar análises preventivas');
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
      
      toast.success(`✅ Análise ${type} gerada com sucesso!`);
      await loadAnalyses();
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      toast.error('Erro ao gerar análise preventiva');
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
    .map(analysis => ({
      period: analysis.analysis_type === 'quinzenal' ? 'Q' : 'M',
      compliance: parseFloat(analysis.metrics.mission_compliance),
      exercise: analysis.metrics.exercise_days,
      sleep: analysis.metrics.avg_sleep,
      mood: analysis.metrics.avg_mood,
      energy: analysis.metrics.avg_energy
    }));

  const riskDistribution = [
    { name: 'BAIXO', value: analyses.filter(a => a.risk_level === 'BAIXO').length, color: '#22c55e' },
    { name: 'MODERADO', value: analyses.filter(a => a.risk_level === 'MODERADO').length, color: '#f59e0b' },
    { name: 'ALTO', value: analyses.filter(a => a.risk_level === 'ALTO').length, color: '#ef4444' },
    { name: 'CRÍTICO', value: analyses.filter(a => a.risk_level === 'CRÍTICO').length, color: '#dc2626' }
  ].filter(item => item.value > 0);

  const latestAnalysis = analyses[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden">
              <img 
                src="http://45.67.221.216:8086/Dr.Vital.png"
                alt="Dr. Vital"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            Análises Preventivas - Dr. Vital
          </h2>
          <p className="text-muted-foreground">
            Análises automáticas quinzenais e mensais da sua saúde
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => generateAnalysis('quinzenal')}
            disabled={generating}
            variant="outline"
          >
            Gerar Quinzenal
          </Button>
          <Button 
            onClick={() => generateAnalysis('mensal')}
            disabled={generating}
          >
            Gerar Mensal
          </Button>
        </div>
      </div>

      {/* Análise Mais Recente */}
      {latestAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Análise Mais Recente - Dr. Vital
              <Badge variant={getRiskColor(latestAnalysis.risk_level)} className="ml-2">
                {getRiskIcon(latestAnalysis.risk_level)}
                {latestAnalysis.risk_level}
              </Badge>
            </CardTitle>
            <CardDescription>
              {latestAnalysis.analysis_type} • {new Date(latestAnalysis.analysis_date).toLocaleDateString('pt-BR')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h4 className="font-semibold text-blue-800 mb-2">📋 Diagnóstico do Dr. Vital:</h4>
              <div className="text-blue-700 whitespace-pre-wrap">
                {latestAnalysis.dr_vital_analysis}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Riscos */}
              {latestAnalysis.health_risks.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Riscos Identificados:</strong>
                    <ul className="mt-2 space-y-1">
                      {latestAnalysis.health_risks.map((risk, index) => (
                        <li key={index} className="text-sm">• {risk}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Pontos Positivos */}
              {latestAnalysis.positive_points.length > 0 && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription>
                    <strong className="text-green-800">Pontos Positivos:</strong>
                    <ul className="mt-2 space-y-1">
                      {latestAnalysis.positive_points.map((point, index) => (
                        <li key={index} className="text-sm text-green-700">• {point}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {/* Alertas Urgentes */}
              {latestAnalysis.urgent_warnings.length > 0 && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Alertas Urgentes:</strong>
                    <ul className="mt-2 space-y-1">
                      {latestAnalysis.urgent_warnings.map((warning, index) => (
                        <li key={index} className="text-sm">• {warning}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gráficos */}
      <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="quinzenal">Quinzenal</TabsTrigger>
          <TabsTrigger value="mensal">Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedPeriod} className="space-y-6">
          {/* Tendência de Risco */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Tendência de Risco ao Longo do Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsLineChart data={riskTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip 
                    formatter={(value, name) => [`${value}`, 'Score de Risco']}
                    labelFormatter={(label) => `Período: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="#ef4444" 
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 6 }}
                  />
                </RechartsLineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Métricas de Saúde */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Métricas de Saúde
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsBarChart data={metricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="compliance" name="Adesão (%)" fill="#3b82f6" />
                    <Bar dataKey="exercise" name="Exercício (dias)" fill="#10b981" />
                    <Bar dataKey="sleep" name="Sono (h)" fill="#8b5cf6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Distribuição de Níveis de Risco
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Histórico de Análises */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Histórico de Análises
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAnalyses.slice(0, 5).map((analysis) => (
                  <div key={analysis.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={getRiskColor(analysis.risk_level)}>
                          {getRiskIcon(analysis.risk_level)}
                          {analysis.risk_level}
                        </Badge>
                        <span className="font-medium">
                          Análise {analysis.analysis_type}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(analysis.analysis_date).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{analysis.risk_score}/100</div>
                        <div className="text-xs text-muted-foreground">Score de Risco</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Adesão</div>
                        <div>{analysis.metrics.mission_compliance}%</div>
                      </div>
                      <div>
                        <div className="font-medium">Exercício</div>
                        <div>{analysis.metrics.exercise_days} dias</div>
                      </div>
                      <div>
                        <div className="font-medium">Sono</div>
                        <div>{analysis.metrics.avg_sleep.toFixed(1)}h</div>
                      </div>
                      <div>
                        <div className="font-medium">Humor</div>
                        <div>{analysis.metrics.avg_mood.toFixed(1)}/10</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PreventiveAnalyticsDashboard;