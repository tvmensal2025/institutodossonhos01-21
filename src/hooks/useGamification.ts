// @ts-nocheck
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { GameBadge } from '@/components/gamification/BadgeSystem';
import type { DailyChallenge } from '@/components/gamification/DailyChallenge';

// Este hook está sendo substituído pelo useEnhancedGamification
// Mantido para compatibilidade com componentes existentes

interface GamificationData {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  currentStreak: number;
  bestStreak: number;
  badges: GameBadge[];
  dailyChallenges: DailyChallenge[];
  achievements: number;
  rank: string;
}

export const useGamification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar dados de gamificação do usuário
  const { data: gamificationData, isLoading } = useQuery({
    queryKey: ['user-gamification'],
    queryFn: async (): Promise<GamificationData> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar XP e nível
      const { data: userStats, error: statsError } = await supabase
        .from('user_goals')
        .select('estimated_points')
        .eq('user_id', user.id)
        .eq('status', 'concluida');

      if (statsError) throw statsError;

      const totalXP = userStats?.reduce((sum, goal) => sum + (goal.estimated_points || 0), 0) || 0;
      const currentLevel = totalXP === 0 ? 1 : Math.floor(totalXP / 1000) + 1;
      const currentXP = totalXP % 1000;
      const xpToNextLevel = 1000 - currentXP;

      // Para novos usuários, streak inicia em 0
      let initialCurrentStreak = 0;
      let initialBestStreak = 0;

      // Buscar desafios ativos do banco de dados
      const { data: challenges, error: challengesError } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true);

      // Buscar participações do usuário
      const { data: participations, error: participationsError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', user.id);

      // Calcular streak baseado nas atividades recentes
      const { data: recentActivities, error: activitiesError } = await supabase
        .from('goal_updates')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      let finalCurrentStreak = initialCurrentStreak;
      let finalBestStreak = initialBestStreak;
      
      if (recentActivities && recentActivities.length > 0) {
        const today = new Date();
        let streakDate = new Date(today);
        
        for (const activity of recentActivities) {
          const activityDate = new Date(activity.created_at);
          const daysDiff = Math.floor((streakDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff <= 1) {
            finalCurrentStreak++;
            streakDate = activityDate;
          } else {
            break;
          }
        }
        
        finalBestStreak = finalCurrentStreak;
      }

      // Badges baseados em dados reais
      const badges: GameBadge[] = [
        {
          id: '1',
          name: 'Primeira Meta',
          description: 'Complete sua primeira meta',
          icon: 'target',
          color: 'bronze',
          tier: 'bronze',
          requirement: 'Complete 1 meta',
          earned: totalXP > 0,
          earnedAt: totalXP > 0 ? new Date() : undefined
        },
        {
          id: '2',
          name: 'Sequência de Fogo',
          description: 'Mantenha uma sequência de 7 dias',
          icon: 'flame',
          color: 'gold',
          tier: 'gold',
          requirement: 'Sequência de 7 dias',
          earned: finalCurrentStreak >= 7,
          progress: finalCurrentStreak,
          maxProgress: 7
        },
        {
          id: '3',
          name: 'Mestre dos Pontos',
          description: 'Acumule 5000 pontos de experiência',
          icon: 'crown',
          color: 'platinum',
          tier: 'platinum',
          requirement: '5000 XP',
          earned: totalXP >= 5000,
          progress: totalXP,
          maxProgress: 5000
        },
        {
          id: '4',
          name: 'Lenda',
          description: 'Alcance o nível 10',
          icon: 'gem',
          color: 'diamond',
          tier: 'diamond',
          requirement: 'Nível 10',
          earned: currentLevel >= 10,
          progress: currentLevel,
          maxProgress: 10
        }
      ];

      // Converter desafios do banco para o formato esperado
      const dailyChallenges: DailyChallenge[] = challenges?.map(challenge => {
        const participation = participations?.find(p => p.challenge_id === challenge.id);
        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description || '',
          type: challenge.is_group_challenge ? 'community' : 'individual',
          difficulty: challenge.difficulty,
          category: challenge.category || 'Geral',
          target_value: 100,
          current: participation?.progress || 0,
          unit: 'progresso',
          xp_reward: challenge.points_reward || 50,
          expiresAt: challenge.end_date ? new Date(challenge.end_date) : new Date(Date.now() + 24 * 60 * 60 * 1000),
          completed: participation?.status === 'completed'
        };
      }) || [];

      return {
        currentLevel,
        currentXP,
        xpToNextLevel,
        totalXP,
        currentStreak: finalCurrentStreak,
        bestStreak: finalBestStreak,
        badges,
        dailyChallenges,
        achievements: badges.filter(b => b.earned).length,
        rank: currentLevel >= 10 ? 'Diamond' : currentLevel >= 6 ? 'Gold' : currentLevel >= 3 ? 'Silver' : 'Bronze'
      };
    }
  });

  // Atualizar XP
  const addXPMutation = useMutation({
    mutationFn: async ({ amount, reason }: { amount: number; reason: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Criar uma nova meta ou atualização que adicione XP
      const { data, error } = await supabase
        .from('goal_updates')
        .insert({
          user_id: user.id,
          description: reason,
          points_earned: amount,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      
      return { success: true, newXP: (gamificationData?.totalXP || 0) + amount };
    },
    onSuccess: (data, variables) => {
      toast({
        title: `+${variables.amount} XP!`,
        description: variables.reason,
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-gamification'] });
    }
  });

  // Completar desafio
  const completeChallengeMutation = useMutation({
    mutationFn: async (challengeId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const challenge = gamificationData?.dailyChallenges.find(c => c.id === challengeId);
      if (!challenge) throw new Error('Desafio não encontrado');

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
        const { error: updateError } = await supabase
          .from('challenge_participations')
          .update({
            status: 'completed',
            progress: 100,
            completed_at: new Date().toISOString()
          })
          .eq('id', participation.id);

        if (updateError) throw updateError;
      }
      
      return { challenge, xpEarned: challenge.xp_reward };
    },
    onSuccess: (data) => {
      toast({
        title: 'Desafio Concluído! 🎉',
        description: `Você ganhou ${data.xpEarned} XP!`,
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-gamification'] });
    }
  });

  return {
    gamificationData,
    isLoading,
    addXP: addXPMutation.mutate,
    isAddingXP: addXPMutation.isPending,
    completeChallenge: completeChallengeMutation.mutate,
    isCompletingChallenge: completeChallengeMutation.isPending
  };
};