import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { startOfWeek, endOfWeek, subWeeks } from 'date-fns';

export const useWeeklyGoalProgress = () => {
  return useQuery({
    queryKey: ['weekly-goal-progress'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const previousWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      const previousWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

      // Buscar metas ativas do usuário
      const { data: goals, error: goalsError } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['aprovada', 'em_progresso', 'ativo']);

      if (goalsError) throw goalsError;

      // Buscar pesagens da semana atual e anterior
      const { data: weighings, error: weighingsError } = await supabase
        .from('weighings')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', previousWeekStart.toISOString())
        .lte('created_at', weekEnd.toISOString())
        .order('created_at', { ascending: false });

      if (weighingsError) throw weighingsError;

      // Mock data - tabela google_fit_data ainda não existe
      const fitData = [];

      // Calcular progresso do peso
      const currentWeekWeighings = weighings?.filter(w => 
        new Date(w.created_at) >= weekStart && new Date(w.created_at) <= weekEnd
      ) || [];
      
      const previousWeekWeighings = weighings?.filter(w => 
        new Date(w.created_at) >= previousWeekStart && new Date(w.created_at) <= previousWeekEnd
      ) || [];

      const currentWeight = currentWeekWeighings[0]?.weight || 0;
      const previousWeight = previousWeekWeighings[0]?.weight || currentWeight;
      const weightChange = currentWeight - previousWeight;

      // Encontrar meta de peso
      const weightGoal = goals?.find(g => g.target_value && (g as any).category === 'peso') || null;
      const targetWeight = weightGoal?.target_value || currentWeight;

      // Calcular progresso de exercícios (mock)
      const exerciseDays = 4; // Mock - 4 dias de exercício
      const exerciseTarget = 7; // Meta padrão de 7 dias por semana

      // Calcular hidratação (simulado - pode ser integrado com apps de hidratação)
      const hydrationProgress = Math.min(85 + Math.random() * 15, 100); // Simulado entre 85-100%

      // Calcular progresso geral baseado nas metas
      let overallProgress = 0;
      let progressCount = 0;

      // Progresso do peso (se tem meta)
      if (weightGoal) {
        const weightProgressPercent = Math.max(0, Math.min(100, 
          100 - (Math.abs(currentWeight - targetWeight) / targetWeight * 100)
        ));
        overallProgress += weightProgressPercent;
        progressCount++;
      }

      // Progresso de exercícios
      const exerciseProgressPercent = (exerciseDays / exerciseTarget) * 100;
      overallProgress += exerciseProgressPercent;
      progressCount++;

      // Progresso de hidratação
      overallProgress += hydrationProgress;
      progressCount++;

      const finalProgress = progressCount > 0 ? overallProgress / progressCount : 0;

      // Determinar tendência
      let trend: 'positive' | 'negative' | 'neutral' = 'neutral';
      if (finalProgress >= 70 && weightChange <= 0 && exerciseProgressPercent >= 60) {
        trend = 'positive';
      } else if (finalProgress < 50 || weightChange > 1) {
        trend = 'negative';
      }

      return {
        weightProgress: {
          current: currentWeight,
          target: targetWeight,
          change: weightChange,
          unit: 'kg'
        },
        exerciseProgress: {
          completed: exerciseDays,
          target: exerciseTarget,
          unit: 'dias'
        },
        hydrationProgress: {
          current: hydrationProgress,
          target: 100,
          unit: '%'
        },
        overallProgress: finalProgress,
        trend,
        goals: goals || [],
        hasActiveGoals: (goals?.length || 0) > 0
      };
    },
    refetchInterval: 1000 * 60 * 15, // Atualizar a cada 15 minutos
  });
};