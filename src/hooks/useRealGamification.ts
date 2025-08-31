// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserSession {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  assigned_at: string;
  session_data: any;
}

interface UserGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  target_value: number;
  current_value: number;
  unit: string;
  status: 'pendente' | 'aprovada' | 'rejeitada' | 'concluida';
  target_date: string;
  difficulty: string;
  estimated_points: number;
}

export const useRealGamification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar sessões do usuário
  const { data: userSessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ['user-sessions'],
    queryFn: async (): Promise<UserSession[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          sessions (
            id,
            title,
            description,
            session_data
          )
        `)
        .eq('user_id', user.id)
        .order('assigned_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar sessões:', error);
        return [];
      }

      return data?.map(userSession => ({
        id: userSession.session_id,
        title: userSession.sessions?.title || 'Sessão',
        description: userSession.sessions?.description || '',
        status: userSession.status as 'pending' | 'in_progress' | 'completed',
        progress: userSession.progress || 0,
        assigned_at: userSession.assigned_at,
        session_data: userSession.sessions?.session_data
      })) || [];
    }
  });

  // Buscar metas do usuário
  const { data: userGoals, isLoading: goalsLoading } = useQuery({
    queryKey: ['user-goals'],
    queryFn: async (): Promise<UserGoal[]> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar metas:', error);
        return [];
      }

      return data || [];
    }
  });

  // Atualizar progresso da sessão
  const updateSessionProgressMutation = useMutation({
    mutationFn: async ({ sessionId, progress }: { sessionId: string; progress: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const status = progress >= 100 ? 'completed' : 'in_progress';

      const { error } = await supabase
        .from('user_sessions')
        .update({
          progress: Math.min(progress, 100),
          status
        })
        .eq('user_id', user.id)
        .eq('session_id', sessionId);

      if (error) throw error;

      return { sessionId, progress, status };
    },
    onSuccess: (data) => {
      if (data.status === 'completed') {
        toast({
          title: 'Sessão Concluída! 🎉',
          description: 'Parabéns por completar esta sessão!',
        });
      }
      queryClient.invalidateQueries({ queryKey: ['user-sessions'] });
    }
  });

  // Atualizar progresso da meta
  const updateGoalProgressMutation = useMutation({
    mutationFn: async ({ goalId, currentValue, description }: { goalId: string; currentValue: number; description?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Atualizar a meta
      const { error: goalError } = await supabase
        .from('user_goals')
        .update({
          current_value: currentValue
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (goalError) throw goalError;

      // Criar registro de atualização
      const { error: updateError } = await supabase
        .from('goal_updates')
        .insert({
          goal_id: goalId,
          user_id: user.id,
          description: description || 'Progresso atualizado',
          points_earned: 10
        });

      if (updateError) throw updateError;

      return { goalId, currentValue };
    },
    onSuccess: () => {
      toast({
        title: 'Progresso Atualizado! ✅',
        description: '+10 XP ganhos!',
      });
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
    }
  });

  // Criar nova meta
  const createGoalMutation = useMutation({
    mutationFn: async (goalData: Omit<UserGoal, 'id' | 'status'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('user_goals')
        .insert({
          ...goalData,
          user_id: user.id,
          status: 'pendente'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Meta Criada! 🎯',
        description: 'Sua nova meta foi enviada para aprovação.',
      });
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
    }
  });

  return {
    userSessions,
    userGoals,
    isLoading: sessionsLoading || goalsLoading,
    updateSessionProgress: updateSessionProgressMutation.mutate,
    updateGoalProgress: updateGoalProgressMutation.mutate,
    createGoal: createGoalMutation.mutate,
    isUpdatingSession: updateSessionProgressMutation.isPending,
    isUpdatingGoal: updateGoalProgressMutation.isPending,
    isCreatingGoal: createGoalMutation.isPending
  };
};