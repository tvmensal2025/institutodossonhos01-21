import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSofiaDataRequirements } from "./useUserDataCompleteness";

interface AnamnesisContext {
  hasAnamnesis: boolean;
  hasMinimumData?: boolean;
  completionStatus?: any;
  missingData?: string[];
  completionPercentage?: number;
  message?: string;
  profile?: {
    // Dados Pessoais
    profession?: string;
    marital_status?: string;
    how_found_method?: string;
    
    // Histórico Familiar (resumo)
    family_health_risks: string[];
    
    // Histórico de Peso
    weight_history: {
      gain_started_age?: number;
      lowest_weight?: number;
      highest_weight?: number;
      fluctuation_type?: string;
    };
    
    // Tratamentos Anteriores
    previous_treatments: string[];
    treatment_experience: {
      most_effective?: string;
      least_effective?: string;
      had_rebound?: boolean;
    };
    
    // Medicações e Condições
    health_conditions: {
      chronic_diseases: string[];
      medications: string[];
      supplements: string[];
    };
    
    // Relacionamento com Comida
    food_relationship: {
      score?: number;
      has_compulsive_eating?: boolean;
      compulsive_situations?: string;
      problematic_foods: string[];
      forbidden_foods: string[];
      eating_behaviors: {
        feels_guilt?: boolean;
        eats_in_secret?: boolean;
        eats_until_uncomfortable?: boolean;
      };
    };
    
    // Qualidade de Vida
    lifestyle: {
      sleep_hours?: number;
      sleep_quality?: number;
      stress_level?: number;
      energy_level?: number;
      quality_of_life?: number;
      physical_activity?: {
        type?: string;
        frequency?: string;
      };
    };
    
    // Objetivos
    goals: {
      main_objectives?: string;
      ideal_weight?: number;
      timeframe?: string;
      biggest_challenge?: string;
      success_definition?: string;
      motivation?: string;
    };
  };
  
  // Insights para Sofia e Dr. Vital
  insights: {
    risk_factors: string[];
    strengths: string[];
    recommendations_focus: string[];
    personality_indicators: string[];
  };
}

export const useAnamnesisContext = (enabled: boolean = true) => {
  return useQuery<AnamnesisContext>({
    queryKey: ['anamnesis-context'],
    queryFn: async (): Promise<AnamnesisContext> => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase.functions.invoke('get-user-anamnesis');

      if (error) {
        console.error('Erro ao buscar contexto da anamnese:', error);
        throw error;
      }

      return data as AnamnesisContext;
    },
    enabled: enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos
    refetchOnWindowFocus: false,
  });
};

// Hook auxiliar para fornecer informações contextuais para Sofia
export const useSofiaPersonalizationContext = () => {
  const { data: anamnesisContext, isLoading, error } = useAnamnesisContext();
  const { 
    canReceiveAnalysis, 
    hasMinimumData, 
    completionPercentage,
    getMissingDataActions,
    getDataRequirementMessage
  } = useSofiaDataRequirements();

  // Gerar mensagem personalizada baseada no contexto
  const generatePersonalizedGreeting = () => {
    // Se não pode receber análise completa, retornar mensagem de incentivo
    if (!canReceiveAnalysis) {
      const requirementMessage = getDataRequirementMessage();
      if (requirementMessage) {
        return `${requirementMessage.icon} ${requirementMessage.title}\n\n${requirementMessage.message}`;
      }
      return "Oi! Para te ajudar melhor, que tal completar mais alguns dados? Assim posso personalizar minhas recomendações! 📋✨";
    }

    // Se não tem anamnese específica, mas tem dados mínimos
    if (!anamnesisContext?.hasAnamnesis) {
      return "Oi! Para te ajudar melhor, que tal completar sua anamnese primeiro? Assim posso personalizar minhas recomendações! 📋✨";
    }

    const { profile, insights } = anamnesisContext;
    let greeting = "Oi! ";

    // Adicionar saudação baseada na profissão
    if (profile?.profession) {
      greeting += `Como está sua rotina de ${profile.profession.toLowerCase()}? `;
    }

    // Mencionar pontos fortes
    if (insights.strengths.length > 0) {
      greeting += `Que bom ver alguém que ${insights.strengths[0].toLowerCase()}! `;
    }

    // Focar nas áreas de recomendação
    if (insights.recommendations_focus.length > 0) {
      greeting += `Hoje podemos focar em ${insights.recommendations_focus[0].toLowerCase()}. `;
    }

    greeting += "Como posso te ajudar hoje? 😊";

    return greeting;
  };

  // Gerar dicas personalizadas baseadas no perfil
  const generatePersonalizedTips = () => {
    // Só gerar dicas personalizadas se tiver dados suficientes
    if (!canReceiveAnalysis || !anamnesisContext?.hasAnamnesis) {
      return [];
    }

    const tips = [];
    const { profile, insights } = anamnesisContext;

    // Dicas baseadas no relacionamento com comida
    if (profile?.food_relationship.score && profile.food_relationship.score < 6) {
      tips.push("💡 Que tal praticarmos a alimentação consciente hoje? Comer devagar e prestar atenção nos sabores pode ajudar muito!");
    }

    // Dicas baseadas no nível de estresse
    if (profile?.lifestyle.stress_level && profile.lifestyle.stress_level > 7) {
      tips.push("🧘‍♀️ Com seu nível de estresse elevado, técnicas de respiração antes das refeições podem ser muito benéficas!");
    }

    // Dicas baseadas no sono
    if (profile?.lifestyle.sleep_quality && profile.lifestyle.sleep_quality < 6) {
      tips.push("😴 Que tal evitarmos cafeína após as 14h? Um sono melhor pode ajudar bastante no controle do peso!");
    }

    // Dicas baseadas em compulsão alimentar
    if (profile?.food_relationship.has_compulsive_eating) {
      tips.push("🤗 Lembre-se: não existem alimentos proibidos, apenas escolhas conscientes. Vamos trabalhar isso juntas!");
    }

    return tips;
  };

  // Identificar alertas baseados no perfil
  const getPersonalizedAlerts = () => {
    // Só gerar alertas se tiver dados suficientes
    if (!canReceiveAnalysis || !anamnesisContext?.hasAnamnesis) {
      return [];
    }

    const alerts = [];
    const { insights } = anamnesisContext;

    insights.risk_factors.forEach(risk => {
      switch (risk) {
        case 'Compulsão alimentar':
          alerts.push("⚠️ Vamos trabalhar estratégias para lidar com a compulsão alimentar de forma gentil e eficaz.");
          break;
        case 'Alto nível de estresse':
          alerts.push("⚠️ O estresse pode afetar seus objetivos. Que tal incluirmos técnicas de relaxamento na rotina?");
          break;
        case 'Qualidade do sono inadequada':
          alerts.push("⚠️ O sono é fundamental para o metabolismo. Vamos conversar sobre higiene do sono?");
          break;
        case 'Histórico de efeito rebote':
          alerts.push("⚠️ Vamos focar em mudanças sustentáveis para evitar o efeito rebote dessa vez!");
          break;
      }
    });

    return alerts;
  };

  // Gerar ações sugeridas para completar dados
  const getCompletionSuggestions = () => {
    if (canReceiveAnalysis) return [];
    
    const actions = getMissingDataActions();
    return actions.slice(0, 3); // Mostrar apenas as 3 ações mais importantes
  };

  return {
    anamnesisContext,
    isLoading,
    error,
    hasAnamnesis: anamnesisContext?.hasAnamnesis || false,
    canReceiveAnalysis,
    hasMinimumData,
    completionPercentage,
    generatePersonalizedGreeting,
    generatePersonalizedTips,
    getPersonalizedAlerts,
    getCompletionSuggestions,
    userInsights: anamnesisContext?.insights || {
      risk_factors: [],
      strengths: [],
      recommendations_focus: [],
      personality_indicators: []
    }
  };
};