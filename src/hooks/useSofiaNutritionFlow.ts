import { useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { nutritionFlowController } from '@/utils/nutritionFlowController';

interface NutritionContext {
  finalized: boolean;
  analysis_type?: string;
  deterministic_result?: any;
  request_id: string;
}

interface DetectedFood {
  name: string;
  grams?: number;
  ml?: number;
  state?: 'cru' | 'cozido' | 'grelhado' | 'frito';
}

interface SofiaNutritionFlowProps {
  userId: string;
  userName: string;
  onSofiaResponse: (response: string, calories?: number) => void;
}

export const useSofiaNutritionFlow = ({ userId, userName, onSofiaResponse }: SofiaNutritionFlowProps) => {
  const { toast } = useToast();
  const nutritionContextRef = useRef<NutritionContext>({ 
    finalized: false, 
    request_id: nutritionFlowController.generateRequestId()
  });

  const resetContext = useCallback(() => {
    nutritionContextRef.current = { 
      finalized: false, 
      request_id: nutritionFlowController.generateRequestId()
    };
    nutritionFlowController.cleanup();
  }, []);

  const processDeterministicNutrition = useCallback(async (
    detectedFoods: DetectedFood[]
  ): Promise<{ success: boolean; response?: string; calories?: number }> => {
    const context = nutritionContextRef.current;

    // Auditoria: garantir contexto limpo por fluxo
    if (!context.finalized && !nutritionFlowController.isRequestActive(context.request_id)) {
      // Antes de iniciar qualquer fluxo nutricional, reset se necessário
      // garante novo request_id limpo
      // if (!isFinalized()) resetContext();
      // Implementação direta:
      resetContext();
    }

    // Gate: se já finalizou, não processar novamente
    if (context.finalized || nutritionFlowController.isRequestActive(context.request_id)) {
      console.log(`🚫 Nutrition already finalized or active for request ${context.request_id} - skipping deterministic calculation`);
      return { success: false };
    }

    // Mark request as active to prevent duplicates
    nutritionFlowController.markRequestActive(context.request_id);

    try {
      console.log(`🔥 Starting deterministic nutrition calculation for request ${context.request_id}`);
      
      const { data, error } = await supabase.functions.invoke('sofia-deterministic', {
        body: {
          detected_foods: detectedFoods,
          user_id: userId,
          analysis_type: 'nutritional_sum',
          request_id: context.request_id
        }
      });

      if (error) {
        console.error('❌ Error in deterministic calculation:', error);
        return { success: false };
      }

      if (data?.success && data?.deterministic) {
        // CRITICAL: Mark as finalized immediately to prevent any other flows
        context.finalized = true;
        context.analysis_type = 'nutritional_sum';
        context.deterministic_result = data;
        nutritionFlowController.markRequestFinalized(context.request_id);

        console.log(`✅ Deterministic calculation completed and finalized for request ${context.request_id}`);
        
        // Return the single standardized response
        const response = data.sofia_response || generateStandardNutritionResponse(data.nutrition_data);
        const calories = data.nutrition_data?.total_kcal || 0;

        return { 
          success: true, 
          response,
          calories
        };
      }

      return { success: false };
    } catch (error) {
      console.error('❌ Error in deterministic nutrition flow:', error);
      return { success: false };
    }
  }, [userId]);

  const processLegacyEstimate = useCallback(async (
    detectedFoods: string[]
  ): Promise<{ success: boolean; response?: string; calories?: number }> => {
    const context = nutritionContextRef.current;

    // Gate: if already finalized by deterministic, skip legacy
    if (context.finalized) {
      console.log(`🚫 Nutrition already finalized for request ${context.request_id} - skipping legacy estimate`);
      return { success: false };
    }

    // Check environment flags (Vite: import.meta.env)
    const SOFIA_DETERMINISTIC_ONLY =
      (import.meta.env.VITE_SOFIA_DETERMINISTIC_ONLY ?? 'false') === 'true';
    const SOFIA_USE_GPT =
      (import.meta.env.VITE_SOFIA_USE_GPT ?? 'true') !== 'false';

    if (SOFIA_DETERMINISTIC_ONLY) {
      console.log(`🚫 SOFIA_DETERMINISTIC_ONLY=true - skipping legacy estimate for request ${context.request_id}`);
      return { success: false };
    }

    if (!SOFIA_USE_GPT) {
      console.log(`🚫 SOFIA_USE_GPT=false - skipping legacy estimate for request ${context.request_id}`);
      return { success: false };
    }

    try {
      console.log(`🤖 Running legacy estimate for request ${context.request_id} (deterministic failed)`);
      
      // Only run legacy if deterministic completely failed
      const { data, error } = await supabase.functions.invoke('enrich-sofia-analysis', {
        body: {
          detected_foods: detectedFoods,
          user_id: userId,
          analysis_type: 'estimate',
          request_id: context.request_id
        }
      });

      if (error) {
        console.error('❌ Error in legacy estimate:', error);
        return { success: false };
      }

      if (data?.success) {
        // Mark as finalized to prevent further processing
        context.finalized = true;
        context.analysis_type = 'estimate';

        console.log(`✅ Legacy estimate completed and finalized for request ${context.request_id}`);
        
        return { 
          success: true, 
          response: data.sofia_response || 'Análise estimativa concluída.',
          calories: data.estimated_calories || 0
        };
      }

      return { success: false };
    } catch (error) {
      console.error('❌ Error in legacy estimate flow:', error);
      return { success: false };
    }
  }, [userId]);

  const handleConfirmation = useCallback(async (
    analysisId: string,
    detectedFoods: DetectedFood[],
    confirmed: boolean
  ): Promise<{ success: boolean; response?: string; calories?: number }> => {
    const context = nutritionContextRef.current;

    // Gate: if already finalized, prevent duplicate confirmations
    if (context.finalized) {
      console.log(`🚫 Nutrition already finalized for request ${context.request_id} - skipping confirmation`);
      return { success: false };
    }

    try {
      console.log(`🔄 Processing confirmation for request ${context.request_id}`);
      
      const { data, error } = await supabase.functions.invoke('sofia-food-confirmation', {
        body: {
          analysisId,
          confirmed,
          userId,
          userCorrections: {
            alimentos: detectedFoods.map(f => f.name),
            quantities: detectedFoods.reduce((acc, food) => {
              acc[food.name] = { 
                quantity: food.grams || food.ml || 100, 
                unit: food.ml ? 'ml' : 'g' 
              };
              return acc;
            }, {} as Record<string, { quantity: number; unit: string }>)
          },
          request_id: context.request_id
        }
      });

      if (error) {
        console.error('❌ Error in confirmation:', error);
        return { success: false };
      }

      if (data?.success) {
        // Mark as finalized after confirmation
        context.finalized = true;
        context.analysis_type = 'confirmed';

        console.log(`✅ Confirmation completed and finalized for request ${context.request_id}`);
        
        const response = data.sofia_response || generateConfirmationResponse(data.totals);
        const calories = data.estimated_calories || data.totals?.kcal || 0;

        return { 
          success: true, 
          response,
          calories
        };
      }

      return { success: false };
    } catch (error) {
      console.error('❌ Error in confirmation flow:', error);
      return { success: false };
    }
  }, [userId]);

  const isFinalized = useCallback(() => {
    return nutritionContextRef.current.finalized;
  }, []);

  return {
    processDeterministicNutrition,
    processLegacyEstimate,
    handleConfirmation,
    isFinalized,
    resetContext,
    getRequestId: () => nutritionContextRef.current.request_id
  };
};

// Standard response generators
function generateStandardNutritionResponse(nutrition: any): string {
  if (!nutrition) return 'Análise nutricional concluída.';
  
  return `💪 Proteínas: ${nutrition.total_proteina || 0} g
🍞 Carboidratos: ${nutrition.total_carbo || 0} g  
🥑 Gorduras: ${nutrition.total_gordura || 0} g
🔥 Estimativa calórica: ${nutrition.total_kcal || 0} kcal

✅ Obrigado! Seus dados estão salvos.`;
}

function generateConfirmationResponse(totals: any): string {
  if (!totals) return 'Confirmação concluída!';
  
  return `💪 Proteínas: ${totals.protein_g || 0} g
🍞 Carboidratos: ${totals.carbs_g || 0} g
🥑 Gorduras: ${totals.fat_g || 0} g
🔥 Estimativa calórica: ${totals.kcal || 0} kcal

✅ Obrigado! Seus dados estão salvos.`;
}