// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  activeSessions: number;
  pendingGoals: number;
  completedGoals: number;
  activeChallenges: number;
  totalRevenue: number;
}

interface PendingGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  user_name: string;
  user_email: string;
  created_at: string;
  difficulty: string;
  estimated_points: number;
}

export const useAdminDashboard = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar estatísticas do dashboard
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async (): Promise<AdminStats> => {
      // Buscar contagem de usuários
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Buscar usuários ativos (login nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      // Buscar sessões
      const { count: totalSessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true });

      const { count: activeSessions } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Buscar metas
      const { count: pendingGoals } = await supabase
        .from('user_goals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente');

      const { count: completedGoals } = await supabase
        .from('user_goals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'concluida');

      // Buscar desafios ativos
      const { count: activeChallenges } = await supabase
        .from('challenges')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalSessions: totalSessions || 0,
        activeSessions: activeSessions || 0,
        pendingGoals: pendingGoals || 0,
        completedGoals: completedGoals || 0,
        activeChallenges: activeChallenges || 0,
        totalRevenue: 0 // Implementar quando tiver sistema de pagamentos
      };
    },
    refetchInterval: 30000 // Atualizar a cada 30 segundos
  });

  // Buscar metas pendentes para aprovação
  const { data: pendingGoals, isLoading: goalsLoading } = useQuery({
    queryKey: ['pending-goals'],
    queryFn: async (): Promise<PendingGoal[]> => {
      const { data, error } = await supabase
        .from('user_goals')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('status', 'pendente')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar metas pendentes:', error);
        return [];
      }

      return data?.map(goal => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        user_name: goal.profiles?.full_name || 'Usuário',
        user_email: goal.profiles?.email || '',
        created_at: goal.created_at,
        difficulty: goal.difficulty,
        estimated_points: goal.estimated_points || 0
      })) || [];
    }
  });

  // Aprovar meta
  const approveGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_goals')
        .update({
          status: 'aprovada',
          approved_by: user.id
        })
        .eq('id', goalId);

      if (error) throw error;
      return goalId;
    },
    onSuccess: () => {
      toast({
        title: 'Meta Aprovada! ✅',
        description: 'A meta foi aprovada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['pending-goals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  // Rejeitar meta
  const rejectGoalMutation = useMutation({
    mutationFn: async (goalId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('user_goals')
        .update({
          status: 'rejeitada',
          approved_by: user.id
        })
        .eq('id', goalId);

      if (error) throw error;
      return goalId;
    },
    onSuccess: () => {
      toast({
        title: 'Meta Rejeitada',
        description: 'A meta foi rejeitada.',
        variant: 'destructive'
      });
      queryClient.invalidateQueries({ queryKey: ['pending-goals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  // Criar sessão
  const createSessionMutation = useMutation({
    mutationFn: async (sessionData: {
      title: string;
      description: string;
      session_data: any;
      is_active: boolean;
    }) => {
      const { data, error } = await supabase
        .from('sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Sessão Criada! 🎯',
        description: 'Nova sessão foi criada com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  // Atribuir sessão para usuários
  const assignSessionMutation = useMutation({
    mutationFn: async ({ sessionId, userIds }: { sessionId: string; userIds: string[] }) => {
      const assignments = userIds.map(userId => ({
        user_id: userId,
        session_id: sessionId,
        status: 'pending',
        progress: 0,
        assigned_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('user_sessions')
        .insert(assignments);

      if (error) throw error;
      return { sessionId, assignedCount: userIds.length };
    },
    onSuccess: (data) => {
      toast({
        title: 'Sessões Atribuídas! 📤',
        description: `Sessão atribuída para ${data.assignedCount} usuários.`,
      });
    }
  });

  // Criar desafio
  const createChallengeMutation = useMutation({
    mutationFn: async (challengeData: {
      title: string;
      description: string;
      category: string;
      difficulty: string;
      start_date: string;
      end_date: string;
      points_reward: number;
      is_group_challenge: boolean;
    }) => {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          ...challengeData,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: 'Desafio Criado! 🏆',
        description: 'Novo desafio foi criado com sucesso.',
      });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    }
  });

  return {
    stats,
    pendingGoals,
    isLoading: statsLoading || goalsLoading,
    approveGoal: approveGoalMutation.mutate,
    rejectGoal: rejectGoalMutation.mutate,
    createSession: createSessionMutation.mutate,
    assignSession: assignSessionMutation.mutate,
    createChallenge: createChallengeMutation.mutate,
    isApprovingGoal: approveGoalMutation.isPending,
    isRejectingGoal: rejectGoalMutation.isPending,
    isCreatingSession: createSessionMutation.isPending,
    isAssigningSession: assignSessionMutation.isPending,
    isCreatingChallenge: createChallengeMutation.isPending
  };
};