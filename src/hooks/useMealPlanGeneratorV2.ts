import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { adaptGPT4ToStandard, adaptUltraSafeToStandard, adaptMealieRealToStandard, type StandardDayPlan } from '@/utils/meal-plan-adapter';
import { useMealPlanHistory } from './useMealPlanHistory';
import { useToast } from './use-toast';
// import { mealPlanErrorHandler } from '@/utils/meal-plan-error-handler';
// import { runMealPlanTests } from '@/utils/meal-plan-tests';

export function useMealPlanGeneratorV2() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StandardDayPlan[]>([]);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const { saveMealPlan } = useMealPlanHistory();
  const { toast } = useToast();

  const generateMealPlan = async (params: {
    calorias: number;
    dias: number;
    restricoes: string[];
    preferencias: string[];
    peso_kg?: number;
    refeicoes_selecionadas?: string[];
  }) => {
    setIsGenerating(true);
    setShowSuccessEffect(false);

    try {
      console.log('🚀 Iniciando geração de cardápio com parâmetros:', params);

      // Validar parâmetros
      if (!params.calorias || !params.dias) {
        throw new Error('Calorias e dias são obrigatórios');
      }

      // Gerar função principal
      const generatorFunction = async () => {
        console.log('📤 Enviando dados para mealie-real:', {
          calorias: params.calorias,
          dias: params.dias,
          restricoes: params.restricoes,
          preferencias: params.preferencias,
          peso_kg: params.peso_kg
        });
        
        const { data, error } = await supabase.functions.invoke('mealie-real', {
          body: {
            calorias: params.calorias,
            dias: params.dias,
            restricoes: params.restricoes || [],
            preferencias: params.preferencias || [],
            refeicoes_selecionadas: params.refeicoes_selecionadas || [],
            peso_kg: params.peso_kg,
            userId: (await supabase.auth.getUser()).data.user?.id
          }
        });

        if (error) throw error;
        if (!data || !data.success) throw new Error('Dados inválidos retornados');
        
        return data;
      };

      const validator = {
        validateMealieData: (data: any) => {
          // Validação básica para dados do Mealie
          if (!data) return { isValid: false, errors: ['Dados vazios'] };
          if (typeof data !== 'object') return { isValid: false, errors: ['Dados não são um objeto'] };
          return { isValid: true, errors: [] };
        },
        validateMealPlan: (data: any) => {
          // Validação para meal plan
          if (!data) return { isValid: false, errors: ['Dados vazios'] };
          if (typeof data !== 'object') return { isValid: false, errors: ['Dados não são um objeto'] };
          return { isValid: true, errors: [] };
        }
      };

      // Chamar função diretamente sem error handler
      const result = await generatorFunction();

      if (result.success && result.data) {
        console.log('✅ Geração bem-sucedida!');
        
        const mealieData = result.data.cardapio || result.data.mealPlan;
        
        // Verificar se são dados do Mealie real
        const isMealieReal = result.metadata?.modelo_usado === 'MEALIE_REAL';
        
        if (isMealieReal) {
          console.log('✅ Dados do Mealie Real detectados');
          const adaptedPlan = adaptMealieRealToStandard(mealieData);
          
          if (adaptedPlan.length > 0) {
            setGeneratedPlan(adaptedPlan);
            await saveMealPlan(
              `Cardápio Mealie ${adaptedPlan.length > 1 ? 'Semanal' : 'Diário'} - ${new Date().toLocaleDateString('pt-BR')}`,
              adaptedPlan.length > 1 ? 'weekly' : 'daily',
              adaptedPlan
            );
            setShowSuccessEffect(true);
            toast({ title: "🍽️ Cardápio Mealie gerado!", description: "Receitas reais do seu Mealie" });
            return adaptedPlan;
          }
        }
        
        // Fallback para adaptador padrão
        const adaptedPlan = adaptUltraSafeToStandard(mealieData);
        
        if (adaptedPlan.length > 0) {
          setGeneratedPlan(adaptedPlan);
          await saveMealPlan(
            `Cardápio ${adaptedPlan.length > 1 ? 'Semanal' : 'Diário'} - ${new Date().toLocaleDateString('pt-BR')}`,
            adaptedPlan.length > 1 ? 'weekly' : 'daily',
            adaptedPlan
          );
          setShowSuccessEffect(true);
          toast({ title: "✅ Cardápio gerado!", description: "Cardápio personalizado criado" });
          return adaptedPlan;
        }
      } else {
        console.error('❌ Falha na geração:', result.error);
        throw new Error(`Falha na geração: ${result.error || 'Erro desconhecido'}`);
      }

      // Fallback para ultra-safe se GPT-4 falhar
      console.log('🔄 Usando fallback ultra-safe...');
      const { data: ultraSafeData, error: ultraSafeError } = await supabase.functions.invoke('generate-meal-plan-ultra-safe', {
        body: {
          ...params,
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (ultraSafeError) {
        console.error('❌ Erro no fallback ultra-safe:', ultraSafeError);
        throw ultraSafeError;
      }

      if (!ultraSafeData || !ultraSafeData.success) {
        console.error('❌ Fallback ultra-safe retornou dados inválidos:', ultraSafeData);
        throw new Error('Falha na geração do cardápio');
      }

      console.log('✅ Fallback ultra-safe bem-sucedido:', ultraSafeData);
      
      const adaptedPlan = adaptUltraSafeToStandard(ultraSafeData.cardapio);
      
      if (adaptedPlan.length === 0) {
        throw new Error('Nenhum plano foi gerado');
      }

      setGeneratedPlan(adaptedPlan);
      
      // Salvar automaticamente no histórico
      await saveMealPlan(
        `Cardápio ${adaptedPlan.length > 1 ? 'Semanal' : 'Diário'} - ${new Date().toLocaleDateString('pt-BR')}`,
        adaptedPlan.length > 1 ? 'weekly' : 'daily',
        adaptedPlan
      );
      
      // Mostrar efeito de sucesso
      setShowSuccessEffect(true);
      toast({ title: "Cardápio gerado e salvo automaticamente!" });
      return adaptedPlan;

    } catch (error) {
      console.error('💥 Erro na geração do cardápio:', error);
      toast({ title: "Erro ao gerar cardápio", description: error instanceof Error ? error.message : 'Erro desconhecido', variant: "destructive" });
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateMealPlan,
    isGenerating,
    generatedPlan,
    setGeneratedPlan,
    showSuccessEffect,
    setShowSuccessEffect
  };
}