import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SofiaIntegrationData {
  userId: string;
  messageType: 'chat' | 'food_analysis' | 'mission_update' | 'goal_progress' | 'challenge_update';
  content: string;
  metadata?: any;
  missionUpdate?: {
    section: string;
    question_id: string;
    answer: string;
    text_response?: string;
    points_earned: number;
  };
  goalProgress?: {
    goal_id: string;
    current_value: number;
    progress_percentage: number;
    points_earned: number;
  };
  challengeUpdate?: {
    challenge_id: string;
    progress: number;
    daily_log: any;
    points_earned: number;
  };
}

export const useSofiaIntegration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Função para integrar mensagem da Sofia com outros sistemas
  const integrateMessage = useMutation({
    mutationFn: async (data: SofiaIntegrationData) => {
      const { data: result, error } = await supabase.functions.invoke('sofia-integration', {
        body: data
      });

      if (error) throw error;
      return result;
    },
    onSuccess: (data) => {
      console.log('✅ Integração Sofia concluída:', data);
      
      // Invalidar queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ['daily-missions'] });
      queryClient.invalidateQueries({ queryKey: ['user-goals'] });
      queryClient.invalidateQueries({ queryKey: ['challenge-participations'] });
      queryClient.invalidateQueries({ queryKey: ['sofia-messages'] });
      // Atualizar gamificação aprimorada após integrações da Sofia
      queryClient.invalidateQueries({ queryKey: ['enhanced-gamification'] });
      
      toast({
        title: "Integração concluída",
        description: "Sua interação foi sincronizada com o sistema!",
        variant: "default"
      });
    },
    onError: (error) => {
      console.error('❌ Erro na integração Sofia:', error);
      toast({
        title: "Erro na integração",
        description: "Não foi possível sincronizar sua interação.",
        variant: "destructive"
      });
    }
  });

  // Função para atualizar missão do dia via Sofia
  const updateMissionViaSofia = async (
    section: string,
    questionId: string,
    answer: string,
    textResponse?: string,
    points = 10
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    return integrateMessage.mutateAsync({
      userId: user.id,
      messageType: 'mission_update',
      content: `Atualizei minha missão do dia: ${section} - ${answer}`,
      missionUpdate: {
        section,
        question_id: questionId,
        answer,
        text_response: textResponse,
        points_earned: points
      }
    });
  };

  // Função para atualizar progresso de meta via Sofia
  const updateGoalViaSofia = async (
    goalId: string,
    currentValue: number,
    progressPercentage: number,
    points = 0
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    return integrateMessage.mutateAsync({
      userId: user.id,
      messageType: 'goal_progress',
      content: `Atualizei o progresso da minha meta: ${progressPercentage}%`,
      goalProgress: {
        goal_id: goalId,
        current_value: currentValue,
        progress_percentage: progressPercentage,
        points_earned: points
      }
    });
  };

  // Função para atualizar desafio via Sofia
  const updateChallengeViaSofia = async (
    challengeId: string,
    progress: number,
    dailyLog: any,
    points = 0
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    return integrateMessage.mutateAsync({
      userId: user.id,
      messageType: 'challenge_update',
      content: `Atualizei meu desafio: ${progress}% de progresso`,
      challengeUpdate: {
        challenge_id: challengeId,
        progress,
        daily_log: dailyLog,
        points_earned: points
      }
    });
  };

  // Função para salvar mensagem de chat da Sofia
  const saveSofiaChatMessage = async (content: string, metadata?: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Usuário não autenticado");

    return integrateMessage.mutateAsync({
      userId: user.id,
      messageType: 'chat',
      content,
      metadata
    });
  };

  return {
    integrateMessage,
    updateMissionViaSofia,
    updateGoalViaSofia,
    updateChallengeViaSofia,
    saveSofiaChatMessage,
    isLoading: integrateMessage.isPending,
    error: integrateMessage.error
  };
}; 