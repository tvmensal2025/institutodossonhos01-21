import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnamnesisContext {
  hasAnamnesis: boolean;
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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      throw new Error('Unauthorized');
    }
    
    console.log('🔍 Verificando dados da anamnese para usuário:', user.id);
    
    // Primeiro verificar se o usuário tem dados suficientes para análise
    const { data: completenessData, error: completenessError } = await supabase.functions.invoke('check-user-data-completeness');
    
    if (!completenessData?.canReceiveAnalysis) {
      console.log('⚠️ Usuário não possui dados suficientes para análise completa');
      return new Response(JSON.stringify({
        hasAnamnesis: false,
        hasMinimumData: completenessData?.minimumDataMet || false,
        completionStatus: completenessData?.completionStatus || {},
        missingData: completenessData?.missingData || [],
        completionPercentage: completenessData?.completionPercentage || 0,
        message: 'Dados insuficientes para análise personalizada completa'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    // Get user anamnesis
    const { data: anamnesis, error: anamnesisError } = await supabase
      .from('user_anamnesis')
      .select('*')
      .eq('user_id', user.id)
      .single();
      
    if (anamnesisError && anamnesisError.code !== 'PGRST116') {
      throw anamnesisError;
    }
    
    if (!anamnesis) {
      console.log('❌ Anamnese não encontrada para o usuário');
      return new Response(JSON.stringify({
        hasAnamnesis: false,
        hasMinimumData: false,
        message: 'Anamnese não preenchida'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('✅ Processando anamnese completa do usuário');
    
    // Build context for Sofia and Dr. Vital
    const context: AnamnesisContext = {
      hasAnamnesis: true,
      insights: {
        risk_factors: [],
        strengths: [],
        recommendations_focus: [],
        personality_indicators: []
      }
    };
    
    if (anamnesis) {
      // Process family health risks
      const familyRisks = [];
      if (anamnesis.family_obesity_history) familyRisks.push('Obesidade familiar');
      if (anamnesis.family_diabetes_history) familyRisks.push('Diabetes familiar');
      if (anamnesis.family_heart_disease_history) familyRisks.push('Cardiopatia familiar');
      if (anamnesis.family_eating_disorders_history) familyRisks.push('Distúrbios alimentares familiares');
      if (anamnesis.family_depression_anxiety_history) familyRisks.push('Histórico familiar de ansiedade/depressão');
      if (anamnesis.family_thyroid_problems_history) familyRisks.push('Problemas de tireoide familiares');
      
      // Generate insights
      const riskFactors = [];
      const strengths = [];
      const focusAreas = [];
      const personalityIndicators = [];
      
      // Risk factors analysis
      if (anamnesis.has_compulsive_eating) {
        riskFactors.push('Compulsão alimentar');
        focusAreas.push('Controle emocional da alimentação');
      }
      
      if (anamnesis.daily_stress_level && anamnesis.daily_stress_level >= 7) {
        riskFactors.push('Alto nível de estresse');
        focusAreas.push('Gerenciamento do estresse');
      }
      
      if (anamnesis.sleep_quality_score && anamnesis.sleep_quality_score <= 4) {
        riskFactors.push('Qualidade do sono inadequada');
        focusAreas.push('Higiene do sono');
      }
      
      if (anamnesis.had_rebound_effect) {
        riskFactors.push('Histórico de efeito rebote');
        focusAreas.push('Manutenção a longo prazo');
      }
      
      // Strengths analysis
      if (anamnesis.physical_activity_frequency && !['nenhuma', '1x_semana'].includes(anamnesis.physical_activity_frequency)) {
        strengths.push('Pratica atividade física regularmente');
      }
      
      if (anamnesis.food_relationship_score && anamnesis.food_relationship_score >= 7) {
        strengths.push('Boa relação com a comida');
      }
      
      if (anamnesis.general_quality_of_life && anamnesis.general_quality_of_life >= 7) {
        strengths.push('Boa qualidade de vida geral');
      }
      
      // Personality indicators
      if (anamnesis.feels_guilt_after_eating) {
        personalityIndicators.push('Tendência à culpa alimentar');
      }
      
      if (anamnesis.eats_in_secret) {
        personalityIndicators.push('Comportamento alimentar secreto');
      }
      
      if (anamnesis.motivation_for_seeking_treatment?.toLowerCase().includes('saúde')) {
        personalityIndicators.push('Motivação focada em saúde');
      }
      
      if (anamnesis.motivation_for_seeking_treatment?.toLowerCase().includes('autoestima')) {
        personalityIndicators.push('Motivação focada em autoestima');
      }
      
      context.profile = {
        profession: anamnesis.profession,
        marital_status: anamnesis.marital_status,
        how_found_method: anamnesis.how_found_method,
        
        family_health_risks: familyRisks,
        
        weight_history: {
          gain_started_age: anamnesis.weight_gain_started_age,
          lowest_weight: anamnesis.lowest_adult_weight,
          highest_weight: anamnesis.highest_adult_weight,
          fluctuation_type: anamnesis.weight_fluctuation_classification
        },
        
        previous_treatments: Array.isArray(anamnesis.previous_weight_treatments) ? anamnesis.previous_weight_treatments : [],
        treatment_experience: {
          most_effective: anamnesis.most_effective_treatment,
          least_effective: anamnesis.least_effective_treatment,
          had_rebound: anamnesis.had_rebound_effect
        },
        
        health_conditions: {
          chronic_diseases: Array.isArray(anamnesis.chronic_diseases) ? anamnesis.chronic_diseases : [],
          medications: Array.isArray(anamnesis.current_medications) ? anamnesis.current_medications : [],
          supplements: Array.isArray(anamnesis.supplements) ? anamnesis.supplements : []
        },
        
        food_relationship: {
          score: anamnesis.food_relationship_score,
          has_compulsive_eating: anamnesis.has_compulsive_eating,
          compulsive_situations: anamnesis.compulsive_eating_situations,
          problematic_foods: Array.isArray(anamnesis.problematic_foods) ? anamnesis.problematic_foods : [],
          forbidden_foods: Array.isArray(anamnesis.forbidden_foods) ? anamnesis.forbidden_foods : [],
          eating_behaviors: {
            feels_guilt: anamnesis.feels_guilt_after_eating,
            eats_in_secret: anamnesis.eats_in_secret,
            eats_until_uncomfortable: anamnesis.eats_until_uncomfortable
          }
        },
        
        lifestyle: {
          sleep_hours: anamnesis.sleep_hours_per_night,
          sleep_quality: anamnesis.sleep_quality_score,
          stress_level: anamnesis.daily_stress_level,
          energy_level: anamnesis.daily_energy_level,
          quality_of_life: anamnesis.general_quality_of_life,
          physical_activity: {
            type: anamnesis.physical_activity_type,
            frequency: anamnesis.physical_activity_frequency
          }
        },
        
        goals: {
          main_objectives: anamnesis.main_treatment_goals,
          ideal_weight: anamnesis.ideal_weight_goal,
          timeframe: anamnesis.timeframe_to_achieve_goal,
          biggest_challenge: anamnesis.biggest_weight_loss_challenge,
          success_definition: anamnesis.treatment_success_definition,
          motivation: anamnesis.motivation_for_seeking_treatment
        }
      };
      
      context.insights = {
        risk_factors: riskFactors,
        strengths: strengths,
        recommendations_focus: focusAreas,
        personality_indicators: personalityIndicators
      };
    }
    
    return new Response(JSON.stringify(context), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in get-user-anamnesis:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});