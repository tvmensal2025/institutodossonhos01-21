// @ts-nocheck
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GamificationData {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  badges: any[];
  dailyChallenges: DailyChallenge[];
  achievements: number;
  rank: string;
  lastActivityDate: string;
}

interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  challenge_type: string;
  difficulty: string;
  target_value: number;
  xp_reward: number;
  category: string;
  progress?: number;
  is_completed?: boolean;
  expires_at?: Date;
}

export const useEnhancedGamification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: gamificationData, isLoading } = useQuery({
    queryKey: ['enhanced-gamification'],
    queryFn: async (): Promise<GamificationData | null> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Buscar desafios ativos do banco de dados
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true);

      if (challengesError) {
        console.error('Erro ao buscar desafios:', challengesError);
      }

      // Buscar participações do usuário
      const { data: participations, error: participationsError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user.id);

      if (participationsError) {
        console.error('Erro ao buscar participações:', participationsError);
      }

      // Converter desafios para o formato esperado
      const dailyChallenges: DailyChallenge[] = challenges?.map(challenge => {
        const participation = participations?.find(p => p.challenge_id === challenge.id);
        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description || '',
          challenge_type: challenge.category || 'general',
          difficulty: challenge.difficulty,
          target_value: 100,
          xp_reward: challenge.points_reward || 50,
          category: challenge.category || 'general',
          progress: participation?.progress || 0,
          is_completed: participation?.status === 'completed',
          expires_at: challenge.end_date ? new Date(challenge.end_date) : new Date(Date.now() + (24 * 60 * 60 * 1000))
        };
      }) || [];

      // Buscar XP total do usuário
      const { data: userGoals, error: goalsError } = await supabase
        .from('user_goals')
        .select('estimated_points')
        .eq('user_id', user.id)
        .eq('status', 'concluida');

      const totalXP = userGoals?.reduce((sum, goal) => sum + (goal.estimated_points || 0), 0) || 0;
      const currentLevel = Math.floor(totalXP / 1000) + 1;
      const currentXP = totalXP % 1000;
      const xpToNextLevel = 1000 - currentXP;

      // Calcular streak baseado nas atividades recentes
      const { data: recentActivities, error: activitiesError } = await supabase
        .from('goal_updates')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      let currentStreak = 0;
      let bestStreak = 0;
      
      if (recentActivities && recentActivities.length > 0) {
        // Calcular streak atual
        const today = new Date();
        let streakDate = new Date(today);
        
        for (const activity of recentActivities) {
          const activityDate = new Date(activity.created_at);
          const daysDiff = Math.floor((streakDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff <= 1) {
            currentStreak++;
            streakDate = activityDate;
          } else {
            break;
          }
        }
        
        bestStreak = currentStreak;
      }

      // Badges baseados em dados reais
      const badges = [
        {
          id: '1',
          name: 'Primeira Meta',
          description: 'Complete sua primeira meta',
          icon: 'target',
          color: 'bronze',
          tier: 'bronze',
          earned: totalXP > 0,
          progress: Math.min(totalXP, 1),
          maxProgress: 1
        },
        {
          id: '2',
          name: 'Sequência de Fogo',
          description: 'Mantenha uma sequência de 7 dias',
          icon: 'flame',
          color: 'gold',
          tier: 'gold',
          earned: currentStreak >= 7,
          progress: currentStreak,
          maxProgress: 7
        },
        {
          id: '3',
          name: 'Mestre dos Pontos',
          description: 'Acumule 5000 pontos de experiência',
          icon: 'crown',
          color: 'platinum',
          tier: 'platinum',
          earned: totalXP >= 5000,
          progress: totalXP,
          maxProgress: 5000
        }
      ];

      return {
        currentLevel,
        currentXP,
        xpToNextLevel,
        totalXP,
        currentStreak,
        bestStreak,
        badges,
        dailyChallenges,
        achievements: badges.filter(b => b.earned).length,
        rank: currentLevel >= 10 ? 'Diamond' : currentLevel >= 6 ? 'Gold' : currentLevel >= 3 ? 'Silver' : 'Bronze',
        lastActivityDate: recentActivities?.[0]?.created_at || new Date().toISOString()
      };
    },
    refetchInterval: 30000
  });

  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar ou criar participação
      let { data: participation, error: participationError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();

      if (participationError && participationError.code === 'PGRST116') {
        // Criar nova participação
        const { data: newParticipation, error: createError } = await supabase
          .from('challenge_participations')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            status: 'completed',
            progress: 100,
            completed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        participation = newParticipation;
      } else if (participationError) {
        throw participationError;
      } else {
        // Atualizar participação existente
        const { data: updatedParticipation, error: updateError } = await supabase
          .from('challenge_participations')
          .update({
            status: 'completed',
            progress: 100,
            completed_at: new Date().toISOString()
          })
          .eq('id', participation.id)
          .select()
          .single();

        if (updateError) throw updateError;
        participation = updatedParticipation;
      }

      // Buscar o desafio para pegar a recompensa
      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .select('points_reward')
        .eq('id', challengeId)
        .single();

      if (challengeError) throw challengeError;

      return { challengeId, xpEarned: challenge.points_reward || 50 };
    },
    onMutate: async (challengeId: string) => {
      await queryClient.cancelQueries({ queryKey: ['enhanced-gamification'] });
      const previous = queryClient.getQueryData<GamificationData | null>(['enhanced-gamification']);

      if (previous) {
        const wasCompleted = previous.dailyChallenges.find(dc => dc.id === challengeId)?.is_completed;
        const xpDelta = wasCompleted ? 0 : 50;
        const updated: GamificationData = {
          ...previous,
          totalXP: previous.totalXP + xpDelta,
          currentXP: (previous.currentXP + xpDelta) % 1000,
          xpToNextLevel: 1000 - ((previous.currentXP + xpDelta) % 1000),
          dailyChallenges: previous.dailyChallenges.map(dc =>
            dc.id === challengeId
              ? { ...dc, is_completed: true, progress: 100 }
              : dc
          )
        };
        queryClient.setQueryData(['enhanced-gamification'], updated);
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['enhanced-gamification'], context.previous);
      }
    },
    onSuccess: (data) => {
      toast({
        title: 'Desafio Concluído! 🎉',
        description: `Você ganhou ${data.xpEarned} XP!`,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-gamification'] });
    }
  });

  const updateChallengeProgressMutation = useMutation({
    mutationFn: async ({ challengeId, progress }: { challengeId: string; progress: number }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const isCompleted = progress >= 100;

      // Buscar ou criar participação
      let { data: participation, error: participationError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)
        .single();

      if (participationError && participationError.code === 'PGRST116') {
        // Criar nova participação
        const { data: newParticipation, error: createError } = await supabase
          .from('challenge_participations')
          .insert({
            user_id: user.id,
            challenge_id: challengeId,
            progress: Math.min(progress, 100),
            status: isCompleted ? 'completed' : 'active',
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .select()
          .single();

        if (createError) throw createError;
        participation = newParticipation;
      } else if (participationError) {
        throw participationError;
      } else {
        // Atualizar participação existente
        const { data: updatedParticipation, error: updateError } = await supabase
          .from('challenge_participations')
          .update({
            progress: Math.min(progress, 100),
            status: isCompleted ? 'completed' : 'active',
            completed_at: isCompleted ? new Date().toISOString() : null
          })
          .eq('id', participation.id)
          .select()
          .single();

        if (updateError) throw updateError;
        participation = updatedParticipation;
      }

      // Buscar o desafio para pegar a recompensa se completou
      let xpEarned = 0;
      if (isCompleted) {
        const { data: challenge, error: challengeError } = await supabase
          .from('challenges')
          .select('points_reward')
          .eq('id', challengeId)
          .single();

        if (!challengeError) {
          xpEarned = challenge.points_reward || 50;
        }
      }

      return { challengeId, progress, isCompleted, xpEarned };
    },
    onMutate: async ({ challengeId, progress }) => {
      await queryClient.cancelQueries({ queryKey: ['enhanced-gamification'] });
      const previous = queryClient.getQueryData<GamificationData | null>(['enhanced-gamification']);

      if (previous) {
        const isCompleted = progress >= 100;
        const xpDelta = isCompleted && !(previous.dailyChallenges.find(dc => dc.id === challengeId)?.is_completed)
          ? 50
          : 0;

        const updated: GamificationData = {
          ...previous,
          totalXP: previous.totalXP + xpDelta,
          currentXP: (previous.currentXP + xpDelta) % 1000,
          xpToNextLevel: 1000 - ((previous.currentXP + xpDelta) % 1000),
          dailyChallenges: previous.dailyChallenges.map(dc =>
            dc.id === challengeId
              ? { ...dc, progress: Math.min(progress, 100), is_completed: isCompleted }
              : dc
          )
        };
        queryClient.setQueryData(['enhanced-gamification'], updated);
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['enhanced-gamification'], context.previous);
      }
    },
    onSuccess: (data) => {
      if (data.isCompleted) {
        toast({
          title: 'Desafio Concluído! 🎉',
          description: `+${data.xpEarned} XP!`,
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-gamification'] });
    }
  });

  const getTrackingProgress = async (type: string): Promise<number> => {
    console.log('Getting tracking progress for:', type);
    return 0;
  };

  return {
    gamificationData,
    isLoading,
    completeChallenge: completeChallengeMutation.mutate,
    isCompletingChallenge: completeChallengeMutation.isPending,
    updateChallengeProgress: updateChallengeProgressMutation.mutate,
    isUpdatingProgress: updateChallengeProgressMutation.isPending,
    getTrackingProgress
  };
};