import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface UserDataCompleteness {
  hasRequiredData: boolean;
  completionStatus: {
    anamnesis: boolean;
    dailyMission: boolean;
    physicalData: boolean;
    goals: boolean;
    profile: boolean;
  };
  missingData: string[];
  completionPercentage: number;
  canReceiveAnalysis: boolean;
  minimumDataMet: boolean;
}

export const useUserDataCompleteness = (enabled: boolean = true) => {
  return useQuery<UserDataCompleteness>({
    queryKey: ['user-data-completeness'],
    queryFn: async (): Promise<UserDataCompleteness> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('check-user-data-completeness');

      if (error) {
        console.error('Erro ao verificar completude dos dados:', error);
        throw error;
      }

      return data as UserDataCompleteness;
    },
    enabled: enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    refetchInterval: 10 * 60 * 1000, // Recheck every 10 minutes
  });
};

// Hook para fornecer informações sobre o que falta para Sofia fazer análises completas
export const useSofiaDataRequirements = () => {
  const { data: completenessData, isLoading, error } = useUserDataCompleteness();

  const getDataRequirementMessage = () => {
    if (!completenessData) return null;

    const { completionStatus, missingData, completionPercentage, canReceiveAnalysis } = completenessData;

    if (canReceiveAnalysis) {
      return {
        type: 'success' as const,
        title: 'Dados suficientes para análise completa!',
        message: 'Sofia pode agora oferecer recomendações totalmente personalizadas baseadas no seu perfil.',
        icon: '✅'
      };
    }

    if (completionPercentage >= 60) {
      return {
        type: 'warning' as const,
        title: 'Quase lá! Dados parciais disponíveis',
        message: `Você completou ${completionPercentage}% dos dados necessários. Falta: ${missingData.join(', ')}`,
        icon: '⚠️'
      };
    }

    return {
      type: 'info' as const,
      title: 'Dados insuficientes para análise personalizada',
      message: `Complete mais dados para Sofia te conhecer melhor: ${missingData.join(', ')}`,
      icon: '📝'
    };
  };

  const getMissingDataActions = () => {
    if (!completenessData) return [];

    const actions = [];
    const { completionStatus, missingData } = completenessData;

    if (!completionStatus.anamnesis) {
      actions.push({
        label: 'Completar Anamnese',
        description: 'Questionário detalhado sobre sua saúde e objetivos',
        route: '/anamnesis',
        priority: 'high' as const,
        icon: '📋'
      });
    }

    if (!completionStatus.dailyMission) {
      actions.push({
        label: 'Fazer Missão do Dia',
        description: 'Complete pelo menos uma missão diária',
        route: '/daily-missions',
        priority: 'medium' as const,
        icon: '🎯'
      });
    }

    if (!completionStatus.physicalData) {
      actions.push({
        label: 'Completar Dados Físicos',
        description: 'Informações básicas como altura, idade e sexo',
        route: '/profile',
        priority: 'high' as const,
        icon: '📏'
      });
    }

    if (!completionStatus.goals) {
      actions.push({
        label: 'Criar uma Meta',
        description: 'Defina seus objetivos de saúde e bem-estar',
        route: '/goals',
        priority: 'medium' as const,
        icon: '🎯'
      });
    }

    if (!completionStatus.profile) {
      actions.push({
        label: 'Completar Perfil',
        description: 'Informações básicas do seu perfil',
        route: '/profile',
        priority: 'high' as const,
        icon: '👤'
      });
    }

    return actions.sort((a, b) => {
      const priorities = { high: 3, medium: 2, low: 1 };
      return priorities[b.priority] - priorities[a.priority];
    });
  };

  const getProgressMessage = () => {
    if (!completenessData) return null;

    const { completionPercentage, canReceiveAnalysis } = completenessData;

    if (canReceiveAnalysis) {
      return "🎉 Perfeito! Sofia tem todos os dados necessários para te ajudar de forma personalizada!";
    }

    if (completionPercentage >= 80) {
      return "🔥 Você está quase lá! Mais alguns dados e Sofia poderá fazer análises completas!";
    }

    if (completionPercentage >= 60) {
      return "📈 Bom progresso! Continue completando seus dados para uma experiência mais personalizada!";
    }

    if (completionPercentage >= 40) {
      return "🌱 Você começou bem! Mais alguns dados e Sofia poderá te conhecer melhor!";
    }

    return "🚀 Vamos começar! Complete seus dados para Sofia te oferecer a melhor experiência personalizada!";
  };

  return {
    completenessData,
    isLoading,
    error,
    canReceiveAnalysis: completenessData?.canReceiveAnalysis || false,
    hasMinimumData: completenessData?.minimumDataMet || false,
    completionPercentage: completenessData?.completionPercentage || 0,
    getDataRequirementMessage,
    getMissingDataActions,
    getProgressMessage,
    missingDataCount: completenessData?.missingData.length || 0,
    isComplete: completenessData?.hasRequiredData || false
  };
};