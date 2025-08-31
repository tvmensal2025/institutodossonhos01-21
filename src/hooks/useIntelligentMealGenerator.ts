import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StandardDayPlan } from '@/utils/meal-plan-adapter';

export interface IntelligentMealParams {
  calorias: number;
  proteinas: number;
  carboidratos: number;
  gorduras: number;
  fibras: number;
  dias: number;
  objetivo: string;
  restricoes: string[];
  preferencias: string[];
  observacoes?: string;
  peso_kg?: number;
}

// Sistema inteligente de geração de cardápios únicos e personalizados
export const useIntelligentMealGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<StandardDayPlan[]>([]);

  const generateUniqueIntelligentPlan = async (params: IntelligentMealParams) => {
    try {
      setIsGenerating(true);
      
      console.log('🧠 GERADOR INTELIGENTE INICIADO');
      console.log('📊 Parâmetros:', params);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // 🔥 SEMPRE USAR GPT-5 PARA MÁXIMA QUALIDADE E VARIEDADE
      console.log('🚀 Usando GPT-5 para geração inteligente...');
      
      const { data: intelligentData, error: intelligentError } = await supabase.functions.invoke('generate-meal-plan-gpt4', {
        body: {
          ...params,
          userId: user.id,
          forceNewRecipes: true, // Força receitas novas
          intelligentMode: true   // Ativa modo inteligente
        }
      });

      if (intelligentError) {
        console.error('❌ Erro no gerador inteligente:', intelligentError);
        throw intelligentError;
      }

      if (!intelligentData || !intelligentData.success) {
        console.error('❌ Dados inválidos do gerador inteligente:', intelligentData);
        throw new Error('Falha na geração inteligente do cardápio');
      }

      console.log('✅ Cardápio inteligente gerado:', intelligentData);

      // Adaptar para formato padrão
      const adaptedPlan = adaptIntelligentToStandard(intelligentData.cardapio);
      
      setGeneratedPlan(adaptedPlan);
      
      toast.success(`🧠 Cardápio único gerado com IA avançada! Variedade garantida com ${intelligentData.metadata?.ingredientes_rastreados || 0} ingredientes únicos`);
      
      return adaptedPlan;

    } catch (error) {
      console.error('💥 Erro no gerador inteligente:', error);
      toast.error(`Erro na geração inteligente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      return [];
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateUniqueIntelligentPlan,
    isGenerating,
    generatedPlan,
    setGeneratedPlan
  };
};

// Adaptar formato do GPT-5 para o padrão da aplicação
const adaptIntelligentToStandard = (cardapio: any): StandardDayPlan[] => {
  if (!cardapio || typeof cardapio !== 'object') {
    console.error('❌ Cardápio inválido para adaptação:', cardapio);
    return [];
  }

  const adapted: StandardDayPlan[] = [];

  Object.entries(cardapio).forEach(([diaKey, diaData]: [string, any]) => {
    if (!diaData || typeof diaData !== 'object') return;

    const dayPlan: StandardDayPlan = {
      day: parseInt(diaKey.replace('dia', '')) || adapted.length + 1,
      meals: {
        breakfast: adaptMeal(diaData.cafe_manha || diaData.cafe_da_manha),
        lunch: adaptMeal(diaData.almoco || diaData.almoço),
        snack: adaptMeal(diaData.cafe_tarde || diaData.lanche_tarde),
        dinner: adaptMeal(diaData.jantar)
      },
      dailyTotals: {
        calories: diaData.totais_do_dia?.calorias || 0,
        protein: diaData.totais_do_dia?.proteinas || 0,
        carbs: diaData.totais_do_dia?.carboidratos || 0,
        fat: diaData.totais_do_dia?.gorduras || 0,
        fiber: diaData.totais_do_dia?.fibras || 0
      }
    };

    adapted.push(dayPlan);
  });

  console.log('🔄 Cardápio adaptado com sucesso:', adapted);
  return adapted;
};

// Adaptar refeição individual para formato StandardMeal
const adaptMeal = (mealData: any) => {
  if (!mealData) return undefined;

  return {
    title: mealData.nome || 'Refeição',
    description: mealData.preparo || '1. Organizar todos os ingredientes na bancada de trabalho\n2. Verificar se todos os utensílios estão limpos\n3. Seguir as instruções de preparo específicas\n4. Temperar adequadamente com sal e especiarias\n5. Verificar o ponto de cozimento dos alimentos\n6. Servir na temperatura adequada para cada alimento\n7. Consumir com moderação e atenção\n8. Acompanhar com bebidas adequadas\n9. Limpar a área de preparo após o consumo\n10. Guardar sobras adequadamente\n11. Verificar se todos os nutrientes estão presentes\n12. Aproveitar a refeição com calma e atenção',
    ingredients: mealData.ingredientes?.map((ing: any) => 
      typeof ing === 'string' ? ing : `${ing.nome || ing} ${ing.quantidade || ''}`
    ) || [],
    practicalSuggestion: `Tempo de preparo: ${mealData.tempo_preparo || '15 minutos'}`,
    macros: {
      calories: mealData.calorias_totais || 0,
      protein: mealData.proteinas_totais || 0,
      carbs: mealData.carboidratos_totais || 0,
      fat: mealData.gorduras_totais || 0,
      fiber: mealData.fibras_totais || 0
    }
  };
};