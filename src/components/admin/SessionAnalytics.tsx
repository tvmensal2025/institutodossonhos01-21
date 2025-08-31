import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@/components/ui/chart';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  PieChart as PieChartIcon, 
  TrendingUp, 
  Users,
  Calendar,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionAnalyticsProps {
  sessionId: string;
  sessionTitle: string;
}

interface AnalyticsData {
  totalResponses: number;
  completionRate: number;
  avgCompletionTime: number;
  questionAnalytics: QuestionAnalytics[];
  evolutionData: EvolutionData[];
  userProgress: UserProgress[];
}

interface QuestionAnalytics {
  question_id: string;
  question_text: string;
  question_type: string;
  responses: any[];
  chartData: any[];
}

interface EvolutionData {
  date: string;
  responses: number;
  completion_rate: number;
  [key: string]: unknown;
}

interface UserProgress {
  user_id: string;
  user_name: string;
  completion_date: string;
  responses: number;
  score?: number;
}

export const SessionAnalytics: React.FC<SessionAnalyticsProps> = ({
  sessionId,
  sessionTitle
}) => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  useEffect(() => {
    loadAnalytics();
  }, [sessionId, selectedPeriod]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      // Mock de dados de respostas já que session_responses não existe
      const responses: any[] = [];
      const responsesError = null;

      // Mock de dados de atribuições já que session_assignments não existe
      const assignments: any[] = [];
      const assignmentsError = null;

      // Processar dados
      const analyticsData = processAnalyticsData(responses || [], assignments || []);
      setAnalytics(analyticsData);

    } catch (error: any) {
      console.error('Erro ao carregar analytics:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (responses: any[], assignments: any[]): AnalyticsData => {
    const totalAssigned = assignments.length;
    const uniqueRespondents = new Set(responses.map(r => r.user_id)).size;
    const completed = assignments.filter(a => a.is_completed).length;
    
    // Agrupar respostas por pergunta
    const questionGroups = responses.reduce((acc, response) => {
      const questionId = response.question_id;
      if (!acc[questionId]) {
        acc[questionId] = {
          question_id: questionId,
          question_text: response.session_questions.question_text,
          question_type: response.session_questions.question_type,
          responses: []
        };
      }
      acc[questionId].responses.push(response);
      return acc;
    }, {});

    // Gerar dados para gráficos de pizza para cada pergunta
    const questionAnalytics: QuestionAnalytics[] = Object.values(questionGroups).map((group: any) => {
      let chartData = [];
      
      if (group.question_type === 'single_choice' || group.question_type === 'multiple_choice') {
        const valueCounts = group.responses.reduce((acc: any, r: any) => {
          const value = typeof r.response_value === 'string' ? r.response_value : JSON.stringify(r.response_value);
          acc[value] = (acc[value] || 0) + 1;
          return acc;
        }, {});
        
        chartData = Object.entries(valueCounts).map(([value, count]) => ({
          name: value,
          value: count
        }));
      } else if (group.question_type === 'numeric_scale' || group.question_type === 'percentage') {
        const values = group.responses.map((r: any) => Number(r.response_value) || 0);
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const ranges = [
          { name: '0-25%', value: values.filter(v => v <= 25).length },
          { name: '26-50%', value: values.filter(v => v > 25 && v <= 50).length },
          { name: '51-75%', value: values.filter(v => v > 50 && v <= 75).length },
          { name: '76-100%', value: values.filter(v => v > 75).length }
        ];
        chartData = ranges.filter(r => r.value > 0);
      } else if (group.question_type === 'boolean') {
        const valueCounts = group.responses.reduce((acc: any, r: any) => {
          const value = r.response_value === true || r.response_value === 'true' || r.response_value === 'Sim' ? 'Sim' : 'Não';
          acc[value] = (acc[value] || 0) + 1;
          return acc;
        }, {});
        
        chartData = Object.entries(valueCounts).map(([value, count]) => ({
          name: value,
          value: count
        }));
      }

      return {
        ...group,
        chartData
      };
    });

    // Dados de evolução ao longo do tempo
    const evolutionData = generateEvolutionData(responses, selectedPeriod);

    // Progresso dos usuários
    const userProgress: UserProgress[] = assignments.map(assignment => ({
      user_id: assignment.user_id,
      user_name: assignment.profiles.full_name,
      completion_date: assignment.completed_at,
      responses: responses.filter(r => r.user_id === assignment.user_id).length,
      score: assignment.is_completed ? 100 : 0
    }));

    return {
      totalResponses: responses.length,
      completionRate: totalAssigned > 0 ? (completed / totalAssigned) * 100 : 0,
      avgCompletionTime: 0, // Calcular depois se necessário
      questionAnalytics,
      evolutionData,
      userProgress
    };
  };

  const generateEvolutionData = (responses: any[], period: string): EvolutionData[] => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
    const data: EvolutionData[] = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayResponses = responses.filter(r => 
        r.created_at.split('T')[0] === dateStr
      );
      
      data.push({
        date: dateStr,
        responses: dayResponses.length,
        completion_rate: dayResponses.length // Simplificado
      });
    }
    
    return data;
  };

  const exportData = async () => {
    if (!analytics) return;
    
    try {
      const csvContent = generateCSV(analytics);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${sessionTitle}_analytics.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Sucesso",
        description: "Dados exportados com sucesso!"
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao exportar dados",
        variant: "destructive"
      });
    }
  };

  const generateCSV = (data: AnalyticsData): string => {
    let csv = 'Relatório da Sessão,' + sessionTitle + '\n\n';
    csv += 'Resumo Geral\n';
    csv += 'Total de Respostas,' + data.totalResponses + '\n';
    csv += 'Taxa de Conclusão,' + data.completionRate.toFixed(1) + '%\n\n';
    
    csv += 'Progresso dos Usuários\n';
    csv += 'Usuário,Data de Conclusão,Respostas,Score\n';
    data.userProgress.forEach(user => {
      csv += `${user.user_name},${user.completion_date || 'Não concluído'},${user.responses},${user.score || 0}%\n`;
    });
    
    return csv;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">
            Não foi possível carregar os dados de analytics
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Analytics da Sessão</h3>
          <p className="text-sm text-muted-foreground">{sessionTitle}</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo Geral */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Total de Respostas</p>
                <p className="text-2xl font-bold">{analytics.totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Taxa de Conclusão</p>
                <p className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Perguntas</p>
                <p className="text-2xl font-bold">{analytics.questionAnalytics.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="ml-2">
                <p className="text-sm font-medium">Usuários Ativos</p>
                <p className="text-2xl font-bold">{analytics.userProgress.filter(u => u.responses > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Evolução das Respostas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart
            data={analytics.evolutionData}
            xField="date"
            yField="responses"
            height={300}
          />
        </CardContent>
      </Card>

      {/* Análise por Pergunta */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium">Análise por Pergunta</h4>
        
        {analytics.questionAnalytics.map((questionData, index) => (
          <Card key={questionData.question_id}>
            <CardHeader>
              <CardTitle className="text-base">
                Pergunta {index + 1}: {questionData.question_text}
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{questionData.question_type}</Badge>
                <Badge variant="outline">{questionData.responses.length} respostas</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {questionData.chartData.length > 0 ? (
                <div className="space-y-2">
                  {questionData.chartData.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-2 border rounded">
                      <span>{item.name}</span>
                      <span className="font-bold">{item.value}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Dados insuficientes para gerar gráfico
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Progresso dos Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Progresso dos Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {analytics.userProgress.map((user) => (
              <div
                key={user.user_id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div>
                  <p className="font-medium">{user.user_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {user.responses} respostas • {user.completion_date ? 
                      `Concluído em ${new Date(user.completion_date).toLocaleDateString()}` : 
                      'Em andamento'
                    }
                  </p>
                </div>
                <Badge 
                  variant={user.score === 100 ? "default" : "secondary"}
                >
                  {user.score || 0}%
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};