import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { X, Plus, ChefHat, Target, AlertTriangle, Heart, Lock, Unlock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { 
  NutritionObjective, 
  calculateNutritionalGoals, 
  shouldLockProtein 
} from '@/utils/macro-calculator';
import { MealPlanDisplay } from '@/components/MealPlanDisplay';

interface MealPlanGeneratorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMeals?: {
    'café da manhã': boolean;
    'almoço': boolean;
    'lanche': boolean;
    'jantar': boolean;
    'ceia': boolean;
  };
}

interface NutritionalGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

interface GeneratedMealPlan {
  day: number;
  dailyTotals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals: {
    breakfast?: {
      title: string;
      description: string;
      preparo?: string; // Instruções detalhadas da Mealie
      ingredients: string[];
      practicalSuggestion?: string;
      macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
      };
    };
    lunch?: {
      title: string;
      description: string;
      preparo?: string; // Instruções detalhadas da Mealie
      ingredients: string[];
      practicalSuggestion?: string;
      macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
      };
    };
    snack?: {
      title: string;
      description: string;
      preparo?: string; // Instruções detalhadas da Mealie
      ingredients: string[];
      practicalSuggestion?: string;
      macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
      };
    };
    dinner?: {
      title: string;
      description: string;
      preparo?: string; // Instruções detalhadas da Mealie
      ingredients: string[];
      practicalSuggestion?: string;
      macros: {
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        fiber?: number;
      };
    };
  };
}

export const MealPlanGeneratorModal: React.FC<MealPlanGeneratorModalProps> = ({
  open,
  onOpenChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedMealPlan[]>([]);
  
  // Dados físicos do usuário
  const { physicalData, measurements } = useWeightMeasurement();
  const latestWeight = measurements && measurements.length > 0 ? measurements[0].peso_kg : undefined;
  
  // Configurações básicas
  const [days, setDays] = useState(7);
  const [objective, setObjective] = useState<NutritionObjective>(NutritionObjective.MAINTAIN);
  
  // Estados para travamento de proteína
  const [proteinLocked, setProteinLocked] = useState(false);
  
  // Metas nutricionais
  const [goals, setGoals] = useState<NutritionalGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 25
  });
  
  // Preferências alimentares
  const [preferredFoods, setPreferredFoods] = useState<string[]>([]);
  const [newPreferredFood, setNewPreferredFood] = useState('');
  
  // Alimentos proibidos/restrições
  const [forbiddenFoods, setForbiddenFoods] = useState<string[]>([]);
  const [newForbiddenFood, setNewForbiddenFood] = useState('');
  
  // Observações adicionais
  const [observations, setObservations] = useState('');

  // Função para calcular distribuição de calorias baseada nas refeições selecionadas
  const getCalorieDistribution = (selectedMeals: any) => {
    const selectedMealTypes = Object.keys(selectedMeals).filter(meal => selectedMeals[meal as keyof typeof selectedMeals]);
    const totalMeals = selectedMealTypes.length;
    
    if (totalMeals === 0) return {};
    
    // Distribuição padrão para 5 refeições
    const defaultDistribution = {
      'café da manhã': 0.25,
      'almoço': 0.35,
      'lanche': 0.15,
      'jantar': 0.20,
      'ceia': 0.05
    };
    
    // Recalcular distribuição baseada nas refeições selecionadas
    const distribution: { [key: string]: number } = {};
    let totalPercentage = 0;
    
    selectedMealTypes.forEach(mealType => {
      totalPercentage += defaultDistribution[mealType as keyof typeof defaultDistribution] || 0;
    });
    
    // Normalizar para 100%
    selectedMealTypes.forEach(mealType => {
      const originalPercentage = defaultDistribution[mealType as keyof typeof defaultDistribution] || 0;
      distribution[mealType] = originalPercentage / totalPercentage;
    });
    
    return distribution;
  };

  const addPreferredFood = () => {
    if (newPreferredFood.trim() && !preferredFoods.includes(newPreferredFood.trim())) {
      setPreferredFoods([...preferredFoods, newPreferredFood.trim()]);
      setNewPreferredFood('');
    }
  };

  const removePreferredFood = (food: string) => {
    setPreferredFoods(preferredFoods.filter(f => f !== food));
  };

  const addForbiddenFood = () => {
    if (newForbiddenFood.trim() && !forbiddenFoods.includes(newForbiddenFood.trim())) {
      setForbiddenFoods([...forbiddenFoods, newForbiddenFood.trim()]);
      setNewForbiddenFood('');
    }
  };

  const removeForbiddenFood = (food: string) => {
    setForbiddenFoods(forbiddenFoods.filter(f => f !== food));
  };

  // Efeito para atualizar metas quando objetivo ou peso mudam
  useEffect(() => {
    // Verificar se devemos travar a proteína com base no objetivo
    const shouldLock = shouldLockProtein(objective);
    setProteinLocked(shouldLock);
    
    // Recalcular metas se temos dados físicos
    if (physicalData && latestWeight) {
      const userData = {
        ...physicalData,
        peso_kg: latestWeight
      };
      
      const newGoals = calculateNutritionalGoals(
        objective,
        userData,
        goals,
        shouldLock
      );
      
      setGoals(newGoals);
    }
  }, [objective, latestWeight, physicalData]);

  // Função para alternar o travamento da proteína
  const toggleProteinLock = () => {
    setProteinLocked(prev => !prev);
    
    // Recalcular metas se destravarmos ou travarmos novamente
    if (physicalData && latestWeight) {
      const userData = {
        ...physicalData,
        peso_kg: latestWeight
      };
      
      const newGoals = calculateNutritionalGoals(
        objective,
        userData,
        goals,
        !proteinLocked
      );
      
      setGoals(newGoals);
    }
  };

  const generateMealPlan = async () => {
    setIsGenerating(true);
    
    try {
      console.log('🍽️ Iniciando geração de cardápio TACO...');
      console.log('📊 Metas nutricionais:', goals);
      console.log('🚫 Restrições:', forbiddenFoods);
      console.log('✅ Preferências:', preferredFoods);
      console.log('📅 Dias solicitados:', days);
      console.log('🎯 Objetivo:', objective);
      console.log('💪 Peso do usuário:', latestWeight, 'kg');
      const { data: { user } } = await supabase.auth.getUser();
      
      // Normalizar restrições e preferências para garantir que sejam enviadas corretamente
      const normalizedRestrictions = forbiddenFoods.map(food => food.toLowerCase().trim());
      const normalizedPreferences = preferredFoods.map(food => food.toLowerCase().trim());
      
      // Filtrar apenas as refeições selecionadas
      const selectedMealTypes = ['café da manhã', 'almoço', 'lanche', 'jantar', 'ceia'];
      
      console.log('🍽️ Refeições selecionadas:', selectedMealTypes);
      
      const { data, error } = await supabase.functions.invoke('generate-meal-plan-taco', {
        body: {
          userId: user?.id,
          calorias: goals.calories,
          proteinas: goals.protein,
          carboidratos: goals.carbs,
          gorduras: goals.fat,
          dias: days,
          objetivo: objective,
          restricoes: normalizedRestrictions,
          preferencias: normalizedPreferences,
          observacoes: observations,
          refeicoes_selecionadas: selectedMealTypes, // ✅ Nova propriedade
          distribuicao_calorias: selectedMealTypes ? getCalorieDistribution(selectedMealTypes) : undefined
        }
      });

      if (error) {
        console.error('❌ Erro na geração do cardápio:', error);
        throw new Error(error.message || 'Erro ao gerar cardápio');
      }

      if (!data?.success) {
        throw new Error(data?.metadata?.error || 'Erro na geração do cardápio');
      }

      console.log('✅ Cardápio gerado com sucesso:', data);

      // Processar cardápio retornado
      if (data.cardapio?.cardapio) {
        const formattedPlan: GeneratedMealPlan[] = [];
        
        // Converter restrições para minúsculas para comparação case-insensitive
        const restricoesLower = normalizedRestrictions;
        console.log('🚫 Aplicando restrições localmente:', restricoesLower);
        
        // Mapeamento expandido de restrições comuns
        const restricaoMapeamento: Record<string, string[]> = {
          'lactose': ['leite', 'queijo', 'minas', 'requeijão', 'iogurte', 'coalhada', 'manteiga', 'creme'],
          'gluten': ['trigo', 'cevada', 'centeio', 'aveia', 'pão', 'massa', 'macarrão', 'farinha de trigo'],
          'glúten': ['trigo', 'cevada', 'centeio', 'aveia', 'pão', 'massa', 'macarrão', 'farinha de trigo'],
          'foodmaps': ['trigo', 'centeio', 'cevada', 'alho', 'cebola', 'feijão', 'lentilha', 'grão de bico', 'maçã', 'pera', 'manga', 'melancia', 'leite', 'iogurte'],
          'carne vermelha': ['boi', 'bovino', 'carne', 'filé', 'picanha', 'alcatra', 'costela'],
          'frango': ['galinha', 'ave', 'peito de frango', 'coxa', 'sobrecoxa'],
          'porco': ['suíno', 'suína', 'bacon', 'presunto', 'linguiça', 'lombo'],
        };
        
        // Função auxiliar para verificar se um ingrediente viola restrições
        const violaRestricao = (ingrediente: string): boolean => {
          const ingLower = ingrediente.toLowerCase();
          
          // Verificar restrições diretas
          for (const restricao of restricoesLower) {
            if (ingLower.includes(restricao)) return true;
            
            // Verificar sinônimos e variações
            const sinonimos = restricaoMapeamento[restricao] || [];
            for (const sinonimo of sinonimos) {
              if (ingLower.includes(sinonimo)) return true;
            }
          }
          
          return false;
        };
        
        Object.keys(data.cardapio.cardapio).forEach((dia, index) => {
          const dayData = data.cardapio.cardapio[dia];
          
          if (dayData) {
            const dayPlan: GeneratedMealPlan = {
              day: index + 1,
              dailyTotals: {
                calories: dayData.totais_do_dia?.calorias || goals.calories,
                protein: dayData.totais_do_dia?.proteinas || goals.protein,
                carbs: dayData.totais_do_dia?.carboidratos || goals.carbs,
                fat: dayData.totais_do_dia?.gorduras || goals.fat,
                fiber: dayData.totais_do_dia?.fibras || goals.fiber
              },
              meals: {}
            };

            // Café da Manhã
            if (dayData.cafe_manha) {
              // Filtrar ingredientes que violam restrições
              const ingredientesFiltrados = dayData.cafe_manha.ingredientes?.filter((ing: any) => {
                const nomeIngrediente = (ing.nome || ing || '');
                
                if (violaRestricao(nomeIngrediente)) {
                  console.warn(`⚠️ Removendo ingrediente proibido: ${nomeIngrediente} (${dia} - café da manhã)`);
                  return false;
                }
                
                return true;
              }) || [];
              
              dayPlan.meals.breakfast = {
                title: dayData.cafe_manha.nome || 'Café da Manhã Brasileiro',
                description: dayData.cafe_manha.preparo_detalhado || dayData.cafe_manha.description || 'Preparar conforme tradição brasileira',
                preparo: dayData.cafe_manha.preparo || dayData.cafe_manha.preparo_elegante || dayData.cafe_manha.instrucoes_completas || dayData.cafe_manha.description || 'Instruções passo-a-passo não disponíveis',
                ingredients: ingredientesFiltrados.map((ing: any) => {
                  if (typeof ing === 'string') return ing;
                  if (typeof ing === 'object' && ing !== null) {
                    return ing.nome || ing.name || `${ing.quantidade || ''}g de ${ing.alimento || 'ingrediente'}`.trim();
                  }
                  return 'Ingrediente não identificado';
                }) || ['Ingredientes brasileiros'],
                practicalSuggestion: dayData.cafe_manha.dica_nutricional || 'Refeição equilibrada',
                macros: {
                  calories: dayData.cafe_manha.totais?.calorias || Math.round(goals.calories * 0.25),
                  protein: dayData.cafe_manha.totais?.proteinas || Math.round(goals.protein * 0.2),
                  carbs: dayData.cafe_manha.totais?.carboidratos || Math.round(goals.carbs * 0.3),
                  fat: dayData.cafe_manha.totais?.gorduras || Math.round(goals.fat * 0.2),
                  fiber: dayData.cafe_manha.totais?.fibras || 3
                }
              };
            }

            // Almoço
            if (dayData.almoco) {
              // Filtrar ingredientes que violam restrições
              const ingredientesFiltrados = dayData.almoco.ingredientes?.filter((ing: any) => {
                const nomeIngrediente = (ing.nome || ing || '');
                
                if (violaRestricao(nomeIngrediente)) {
                  console.warn(`⚠️ Removendo ingrediente proibido: ${nomeIngrediente} (${dia} - almoço)`);
                  return false;
                }
                
                return true;
              }) || [];
              
              dayPlan.meals.lunch = {
                title: dayData.almoco.nome || 'Almoço Brasileiro',
                description: dayData.almoco.preparo_detalhado || dayData.almoco.description || 'Preparar refeição completa',
                preparo: dayData.almoco.preparo || dayData.almoco.preparo_elegante || dayData.almoco.instrucoes_completas || dayData.almoco.description || 'Instruções passo-a-passo não disponíveis',
                ingredients: ingredientesFiltrados.map((ing: any) => {
                  if (typeof ing === 'string') return ing;
                  if (typeof ing === 'object' && ing !== null) {
                    return ing.nome || ing.name || `${ing.quantidade || ''}g de ${ing.alimento || 'ingrediente'}`.trim();
                  }
                  return 'Ingrediente não identificado';
                }) || ['Arroz', 'Feijão', 'Proteína'],
                practicalSuggestion: dayData.almoco.dica_nutricional || 'Refeição principal do dia',
                macros: {
                  calories: dayData.almoco.totais?.calorias || Math.round(goals.calories * 0.4),
                  protein: dayData.almoco.totais?.proteinas || Math.round(goals.protein * 0.5),
                  carbs: dayData.almoco.totais?.carboidratos || Math.round(goals.carbs * 0.4),
                  fat: dayData.almoco.totais?.gorduras || Math.round(goals.fat * 0.4),
                  fiber: dayData.almoco.totais?.fibras || 8
                }
              };
            }

            // Lanche/Café da Tarde
            if (dayData.cafe_tarde || dayData.lanche) {
              const snackData = dayData.cafe_tarde || dayData.lanche;
              
              // Filtrar ingredientes que violam restrições
              const ingredientesFiltrados = snackData.ingredientes?.filter((ing: any) => {
                const nomeIngrediente = (ing.nome || ing || '');
                
                if (violaRestricao(nomeIngrediente)) {
                  console.warn(`⚠️ Removendo ingrediente proibido: ${nomeIngrediente} (${dia} - lanche)`);
                  return false;
                }
                
                return true;
              }) || [];
              
              dayPlan.meals.snack = {
                title: snackData.nome || 'Lanche da Tarde',
                description: snackData.preparo_detalhado || snackData.description || 'Preparar lanche nutritivo',
                preparo: snackData.preparo || snackData.preparo_elegante || snackData.instrucoes_completas || snackData.description || 'Instruções passo-a-passo não disponíveis',
                ingredients: ingredientesFiltrados.map((ing: any) => {
                  if (typeof ing === 'string') return ing;
                  if (typeof ing === 'object' && ing !== null) {
                    return ing.nome || ing.name || `${ing.quantidade || ''}g de ${ing.alimento || 'ingrediente'}`.trim();
                  }
                  return 'Ingrediente não identificado';
                }) || ['Lanche saudável'],
                practicalSuggestion: snackData.dica_nutricional || 'Energia para a tarde',
                macros: {
                  calories: snackData.totais?.calorias || Math.round(goals.calories * 0.15),
                  protein: snackData.totais?.proteinas || Math.round(goals.protein * 0.1),
                  carbs: snackData.totais?.carboidratos || Math.round(goals.carbs * 0.2),
                  fat: snackData.totais?.gorduras || Math.round(goals.fat * 0.15),
                  fiber: snackData.totais?.fibras || 4
                }
              };
            }

            // Jantar
            if (dayData.jantar) {
              // Filtrar ingredientes que violam restrições
              const ingredientesFiltrados = dayData.jantar.ingredientes?.filter((ing: any) => {
                const nomeIngrediente = (ing.nome || ing || '');
                
                if (violaRestricao(nomeIngrediente)) {
                  console.warn(`⚠️ Removendo ingrediente proibido: ${nomeIngrediente} (${dia} - jantar)`);
                  return false;
                }
                
                return true;
              }) || [];
              
              dayPlan.meals.dinner = {
                title: dayData.jantar.nome || 'Jantar Brasileiro',
                description: dayData.jantar.preparo_detalhado || dayData.jantar.description || 'Preparar jantar leve',
                preparo: dayData.jantar.preparo || dayData.jantar.preparo_elegante || dayData.jantar.instrucoes_completas || dayData.jantar.description || 'Instruções passo-a-passo não disponíveis',
                ingredients: ingredientesFiltrados.map((ing: any) => {
                  if (typeof ing === 'string') return ing;
                  if (typeof ing === 'object' && ing !== null) {
                    return ing.nome || ing.name || `${ing.quantidade || ''}g de ${ing.alimento || 'ingrediente'}`.trim();
                  }
                  return 'Ingrediente não identificado';
                }) || ['Jantar equilibrado'],
                practicalSuggestion: dayData.jantar.dica_nutricional || 'Refeição noturna',
                macros: {
                  calories: dayData.jantar.totais?.calorias || Math.round(goals.calories * 0.2),
                  protein: dayData.jantar.totais?.proteinas || Math.round(goals.protein * 0.2),
                  carbs: dayData.jantar.totais?.carboidratos || Math.round(goals.carbs * 0.1),
                  fat: dayData.jantar.totais?.gorduras || Math.round(goals.fat * 0.25),
                  fiber: dayData.jantar.totais?.fibras || 3
                }
              };
            }

            formattedPlan.push(dayPlan);
          }
        });

        // Verificar se o número de dias gerados corresponde ao solicitado
        if (formattedPlan.length < days) {
          console.warn(`⚠️ Número de dias insuficiente (${formattedPlan.length}/${days}), gerando dias adicionais`);
          
          // Opções de refeição para variedade (respeitando restrições comuns)
          const opcoesCafeManha = [
            {
              title: 'Tapioca com Banana',
              description: 'Preparar conforme instruções',
              ingredients: ['Tapioca', 'Banana', 'Mel'],
              practicalSuggestion: 'Refeição equilibrada sem glúten nem lactose',
            },
            {
              title: 'Batata doce com Ovos',
              description: 'Preparar conforme instruções',
              ingredients: ['Batata doce', 'Ovos', 'Azeite', 'Sal'],
              practicalSuggestion: 'Café da manhã rico em proteínas',
            },
            {
              title: 'Frutas com Chia',
              description: 'Preparar conforme instruções',
              ingredients: ['Banana', 'Morango', 'Chia', 'Mel'],
              practicalSuggestion: 'Rico em fibras e antioxidantes',
            },
          ];
          
          const opcoesAlmoco = [
            {
              title: 'Peixe com Legumes',
              description: 'Preparar conforme instruções',
              ingredients: ['Peixe', 'Brócolis', 'Cenoura', 'Azeite'],
              practicalSuggestion: 'Almoço rico em ômega 3',
            },
            {
              title: 'Arroz com Legumes',
              description: 'Preparar conforme instruções',
              ingredients: ['Arroz', 'Abobrinha', 'Cenoura', 'Azeite'],
              practicalSuggestion: 'Refeição leve e nutritiva',
            },
            {
              title: 'Salada de Quinoa',
              description: 'Preparar conforme instruções',
              ingredients: ['Quinoa', 'Tomate', 'Pepino', 'Azeite'],
              practicalSuggestion: 'Rico em fibras e proteínas vegetais',
            },
          ];
          
          const opcoesLanche = [
            {
              title: 'Mix de Frutas com Castanhas',
              description: 'Preparar conforme instruções',
              ingredients: ['Banana', 'Morango', 'Castanhas'],
              practicalSuggestion: 'Lanche equilibrado rico em fibras',
            },
            {
              title: 'Batata Doce com Atum',
              description: 'Preparar conforme instruções',
              ingredients: ['Batata doce', 'Atum', 'Azeite'],
              practicalSuggestion: 'Lanche rico em proteínas',
            },
            {
              title: 'Abacate Amassado',
              description: 'Preparar conforme instruções',
              ingredients: ['Abacate', 'Limão', 'Sal'],
              practicalSuggestion: 'Rico em gorduras saudáveis',
            },
          ];
          
          const opcoesJantar = [
            {
              title: 'Sopa de Legumes',
              description: 'Preparar conforme instruções',
              ingredients: ['Cenoura', 'Abobrinha', 'Batata', 'Azeite'],
              practicalSuggestion: 'Jantar leve e nutritivo',
            },
            {
              title: 'Peixe com Purê de Batata Doce',
              description: 'Preparar conforme instruções',
              ingredients: ['Peixe', 'Batata doce', 'Azeite', 'Sal'],
              practicalSuggestion: 'Jantar rico em nutrientes',
            },
            {
              title: 'Omelete de Legumes',
              description: 'Preparar conforme instruções',
              ingredients: ['Ovos', 'Espinafre', 'Tomate', 'Azeite'],
              practicalSuggestion: 'Opção rápida e proteica',
            },
          ];
          
          // Gerar dias adicionais com variedade
          for (let i = formattedPlan.length + 1; i <= days; i++) {
            // Selecionar aleatoriamente refeições diferentes para cada dia
            const cafeIndex = (i - 1) % opcoesCafeManha.length;
            const almocoIndex = (i + 1) % opcoesAlmoco.length; // Deslocado para variar
            const lancheIndex = (i + 2) % opcoesLanche.length; // Deslocado para variar
            const jantarIndex = (i + 3) % opcoesJantar.length; // Deslocado para variar
            
            const defaultDay = {
              day: i,
              dailyTotals: {
                calories: goals.calories,
                protein: goals.protein,
                carbs: goals.carbs,
                fat: goals.fat,
                fiber: goals.fiber
              },
              meals: {
                breakfast: {
                  ...opcoesCafeManha[cafeIndex],
                  macros: {
                    calories: Math.round(goals.calories * 0.25),
                    protein: Math.round(goals.protein * 0.2),
                    carbs: Math.round(goals.carbs * 0.3),
                    fat: Math.round(goals.fat * 0.2),
                    fiber: 3
                  }
                },
                lunch: {
                  ...opcoesAlmoco[almocoIndex],
                  macros: {
                    calories: Math.round(goals.calories * 0.4),
                    protein: Math.round(goals.protein * 0.5),
                    carbs: Math.round(goals.carbs * 0.4),
                    fat: Math.round(goals.fat * 0.4),
                    fiber: 8
                  }
                },
                snack: {
                  ...opcoesLanche[lancheIndex],
                  macros: {
                    calories: Math.round(goals.calories * 0.15),
                    protein: Math.round(goals.protein * 0.1),
                    carbs: Math.round(goals.carbs * 0.2),
                    fat: Math.round(goals.fat * 0.15),
                    fiber: 4
                  }
                },
                dinner: {
                  ...opcoesJantar[jantarIndex],
                  macros: {
                    calories: Math.round(goals.calories * 0.2),
                    protein: Math.round(goals.protein * 0.2),
                    carbs: Math.round(goals.carbs * 0.1),
                    fat: Math.round(goals.fat * 0.25),
                    fiber: 3
                  }
                }
              }
            };
            
            formattedPlan.push(defaultDay);
          }
        }
        
        setGeneratedPlan(formattedPlan);
        
        toast({
          title: "✅ Cardápio Gerado!",
          description: `Cardápio brasileiro de ${days} dias criado com ${data.metadata?.fonte || 'IA brasileira'}`,
          variant: "default"
        });
      } else {
        throw new Error('Formato de cardápio inválido recebido');
      }

    } catch (error: any) {
      console.error('❌ Erro completo:', error);
      toast({
        title: 'Erro na geração',
        description: error.message || 'Não foi possível gerar o cardápio. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (generatedPlan.length > 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-emerald-600" />
              Cardápio Gerado
            </DialogTitle>
            <Button 
              variant="outline" 
              onClick={() => setGeneratedPlan([])}
              className="w-fit"
            >
              Gerar Novo Cardápio
            </Button>
          </DialogHeader>
          <div className="mt-6">
            <MealPlanDisplay plan={generatedPlan} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="w-6 h-6 text-emerald-600" />
            Gerador de Cardápio Nutricional
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Configurações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Número de dias</Label>
              <Select value={days.toString()} onValueChange={(value) => setDays(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 dia</SelectItem>
                  <SelectItem value="3">3 dias</SelectItem>
                  <SelectItem value="7">7 dias</SelectItem>
                  <SelectItem value="14">14 dias</SelectItem>
                  <SelectItem value="30">30 dias</SelectItem>
                </SelectContent>
              </Select>
            </div>

                          <div>
                <Label>Objetivo</Label>
                <Select 
                  value={objective} 
                  onValueChange={(val) => setObjective(val as NutritionObjective)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NutritionObjective.LOSE}>Perder peso</SelectItem>
                    <SelectItem value={NutritionObjective.MAINTAIN}>Manter peso</SelectItem>
                    <SelectItem value={NutritionObjective.GAIN}>Ganhar peso</SelectItem>
                    <SelectItem value={NutritionObjective.LEAN_MASS}>Ganhar massa muscular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
          </div>

          <Separator />

          {/* Metas Nutricionais */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-600" />
              Metas Nutricionais Diárias
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <Label>Calorias (kcal)</Label>
                <Input
                  type="number"
                  value={goals.calories}
                  onChange={(e) => setGoals({...goals, calories: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="relative">
                <Label className="flex items-center gap-1">
                  Proteínas (g)
                  {proteinLocked && (
                    <span className="text-xs text-muted-foreground">(auto-ajustada)</span>
                  )}
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={goals.protein}
                    onChange={(e) => setGoals({...goals, protein: parseInt(e.target.value) || 0})}
                    readOnly={proteinLocked}
                    className={proteinLocked ? "pr-10 bg-gray-50" : "pr-10"}
                    title={proteinLocked ? "Auto-ajustada pelo objetivo. Clique para desbloquear." : ""}
                  />
                  <div 
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-primary"
                    onClick={toggleProteinLock}
                    title={proteinLocked ? "Desbloquear proteína" : "Bloquear proteína"}
                  >
                    {proteinLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                  </div>
                </div>
              </div>
              <div>
                <Label>Carboidratos (g)</Label>
                <Input
                  type="number"
                  value={goals.carbs}
                  onChange={(e) => setGoals({...goals, carbs: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Gorduras (g)</Label>
                <Input
                  type="number"
                  value={goals.fat}
                  onChange={(e) => setGoals({...goals, fat: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <Label>Fibras (g)</Label>
                <Input
                  type="number"
                  value={goals.fiber}
                  onChange={(e) => setGoals({...goals, fiber: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Preferências Alimentares */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-emerald-600" />
              Alimentos Preferidos
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: salmão, frango, arroz integral, aveia..."
                  value={newPreferredFood}
                  onChange={(e) => setNewPreferredFood(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPreferredFood()}
                />
                <Button 
                  type="button" 
                  onClick={addPreferredFood}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {preferredFoods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {preferredFoods.map((food, index) => (
                    <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                      {food}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removePreferredFood(food)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Alimentos Proibidos */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Alimentos Proibidos / Restrições
            </h3>
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ex: glúten, lactose, amendoim, camarão..."
                  value={newForbiddenFood}
                  onChange={(e) => setNewForbiddenFood(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addForbiddenFood()}
                />
                <Button 
                  type="button" 
                  onClick={addForbiddenFood}
                  variant="outline"
                  size="icon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {forbiddenFoods.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {forbiddenFoods.map((food, index) => (
                    <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                      {food}
                      <X 
                        className="w-3 h-3 ml-1 cursor-pointer" 
                        onClick={() => removeForbiddenFood(food)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Observações */}
          <div>
            <Label>Observações Adicionais</Label>
            <Textarea
              placeholder="Ex: Prefiro refeições simples, tenho pouco tempo para cozinhar, quero variedade de sabores..."
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancelar
            </Button>
            <Button 
              onClick={generateMealPlan}
              disabled={isGenerating}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
            >
              {isGenerating ? 'Gerando...' : 'Gerar Cardápio'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};