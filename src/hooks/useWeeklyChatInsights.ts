import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WeeklyChatInsights {
  id: string;
  user_id: string;
  week_start_date: string;
  total_conversations: number;
  average_sentiment: number;
  dominant_emotions: string[];
  average_pain_level?: number;
  average_stress_level?: number;
  average_energy_level?: number;
  most_discussed_topics: string[];
  main_concerns: string[];
  progress_noted: string[];
  recommendations: string[];
  emotional_summary: string;
  ai_analysis: any;
  created_at: string;
  updated_at: string;
}

export const useWeeklyChatInsights = () => {
  const [insights, setInsights] = useState<WeeklyChatInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const getCurrentWeekStart = () => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() + 1); // Segunda-feira
    return weekStart.toISOString().split('T')[0];
  };

  const fetchCurrentWeekInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Mock data temporário
      const mockInsights: WeeklyChatInsights = {
        id: '1',
        user_id: user.id,
        week_start_date: getCurrentWeekStart(),
        total_conversations: 5,
        average_sentiment: 0.7,
        dominant_emotions: ['positivo', 'motivado'],
        average_pain_level: 3,
        average_stress_level: 4,
        average_energy_level: 6,
        most_discussed_topics: ['exercícios', 'alimentação'],
        main_concerns: [],
        progress_noted: ['melhora no sono'],
        recommendations: ['manter rotina'],
        emotional_summary: 'Semana positiva com progresso',
        ai_analysis: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      setInsights(mockInsights);
      return mockInsights;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao buscar insights:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const weekStart = getCurrentWeekStart();

      console.log('Gerando insights semanais...');

      const { data, error } = await supabase.functions.invoke('generate-weekly-chat-insights', {
        body: {
          userId: user.id,
          weekStartDate: weekStart
        }
      });

      if (error) {
        throw error;
      }

      if (data?.insights) {
        setInsights(data.insights);
        toast({
          title: "Insights Gerados",
          description: "Análise semanal atualizada com sucesso!",
        });
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      console.error('Erro ao gerar insights:', err);
      toast({
        title: "Erro",
        description: "Não foi possível gerar a análise semanal.",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const checkAndGenerateIfNeeded = async () => {
    const existingInsights = await fetchCurrentWeekInsights();
    
    if (!existingInsights) {
      // Verificar se há conversas esta semana
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const weekStart = getCurrentWeekStart();
      // Mock - simular que há conversas
      const conversations = [{ id: '1' }];

      if (conversations && conversations.length > 0) {
        console.log('Conversas encontradas, gerando insights automaticamente...');
        await generateInsights();
      }
    }
  };

  useEffect(() => {
    fetchCurrentWeekInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    fetchCurrentWeekInsights,
    generateInsights,
    checkAndGenerateIfNeeded,
    getCurrentWeekStart
  };
};