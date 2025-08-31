import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Calendar,
  TrendingUp,
  BarChart3,
  Eye,
  Award,
  Activity,
  Clock,
  Target
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface HistoryResponse {
  id: string;
  user_id: string;
  date: string;
  section: string;
  question_id: string;
  answer: string;
  text_response?: string;
  points_earned: number;
  session_attempt_id?: string;
  created_at: string;
}

interface EvolutionHistoryProps {
  userId: string;
}

export function EvolutionHistory({ userId }: EvolutionHistoryProps) {
  const [responses, setResponses] = useState<HistoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar histórico de respostas
  useEffect(() => {
    loadHistory();
  }, [userId]);

  const loadHistory = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('daily_responses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setResponses(data || []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Agrupar respostas por data
  const responsesByDate = responses.reduce((acc, response) => {
    const date = response.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(response);
    return acc;
  }, {} as Record<string, HistoryResponse[]>);

  // Agrupar respostas por seção
  const responsesBySection = responses.reduce((acc, response) => {
    const section = response.section;
    if (!acc[section]) {
      acc[section] = [];
    }
    acc[section].push(response);
    return acc;
  }, {} as Record<string, HistoryResponse[]>);

  // Calcular estatísticas
  const stats = {
    totalResponses: responses.length,
    totalPoints: responses.reduce((sum, r) => sum + r.points_earned, 0),
    sectionsCompleted: Object.keys(responsesBySection).length,
    daysActive: Object.keys(responsesByDate).length,
    lastActivity: responses.length > 0 ? responses[0].created_at : null
  };

  // Filtrar respostas com base nas seleções
  const filteredResponses = responses.filter(response => {
    if (selectedSection && response.section !== selectedSection) return false;
    if (selectedDate && response.date !== selectedDate) return false;
    return true;
  });

  const sectionColors: Record<string, string> = {
    morning: 'bg-orange-500',
    habits: 'bg-green-500',
    mindset: 'bg-blue-500',
    sessions: 'bg-purple-500',
    health_wheel: 'bg-red-500',
    life_wheel: 'bg-indigo-500'
  };

  const getSectionName = (section: string) => {
    const names: Record<string, string> = {
      morning: 'Manhã',
      habits: 'Hábitos',
      mindset: 'Mindset',
      sessions: 'Sessões',
      health_wheel: 'Roda da Saúde',
      life_wheel: 'Roda da Vida'
    };
    return names[section] || section;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total de Respostas</p>
                <p className="text-2xl font-bold">{stats.totalResponses}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Award className="h-4 w-4 text-yellow-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pontos Totais</p>
                <p className="text-2xl font-bold">{stats.totalPoints}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Seções Ativas</p>
                <p className="text-2xl font-bold">{stats.sectionsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Dias Ativos</p>
                <p className="text-2xl font-bold">{stats.daysActive}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Filtros de Evolução
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant={selectedSection === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedSection(null)}
            >
              Todas as Seções
            </Button>
            {Object.keys(responsesBySection).map(section => (
              <Button
                key={section}
                variant={selectedSection === section ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSection(section)}
              >
                <div className={`w-2 h-2 rounded-full mr-2 ${sectionColors[section] || 'bg-gray-500'}`} />
                {getSectionName(section)} ({responsesBySection[section].length})
              </Button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedDate === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedDate(null)}
            >
              Todas as Datas
            </Button>
            {Object.keys(responsesByDate).slice(0, 10).map(date => (
              <Button
                key={date}
                variant={selectedDate === date ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDate(date)}
              >
                {format(new Date(date), 'dd/MM', { locale: ptBR })} ({responsesByDate[date].length})
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Respostas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Histórico de Evolução ({filteredResponses.length} respostas)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredResponses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma resposta encontrada com os filtros selecionados</p>
              </div>
            ) : (
              filteredResponses.map((response, index) => (
                <div key={response.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="secondary" 
                        className={`${sectionColors[response.section] || 'bg-gray-500'} text-white`}
                      >
                        {getSectionName(response.section)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(response.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                      </span>
                      {response.session_attempt_id && (
                        <Badge variant="outline" className="text-xs">
                          Tentativa: {response.session_attempt_id.split('_').slice(-1)[0]}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="font-semibold">+{response.points_earned} pts</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Pergunta: {response.question_id}</p>
                    <p className="text-sm">Resposta: <span className="font-semibold">{response.answer}</span></p>
                    {response.text_response && (
                      <p className="text-xs text-muted-foreground mt-1">{response.text_response}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}