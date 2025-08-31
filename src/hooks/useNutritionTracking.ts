// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  openNutriTrackerDatabase, 
  findFoodByName,
  type OpenNutriTrackerFood 
} from '@/data/open-nutri-tracker-database';
import { 
  calculateNutritionalGoals, 
  NutritionObjective,
  type PhysicalData 
} from '@/utils/macro-calculator';
import { usePhysicalData } from './usePhysicalData';
import { User } from '@supabase/supabase-js';

export interface MealEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    food: OpenNutriTrackerFood;
    quantity: number;
    unit: string;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  createdAt: string;
  updatedAt: string;
}

export interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DailyNutrition {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  meals: MealEntry[];
  goals: NutritionGoals;
  progress: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
}

export interface NutritionStats {
  averageCalories: number;
  averageProtein: number;
  averageCarbs: number;
  averageFat: number;
  averageFiber: number;
  daysTracked: number;
  goalAchievementRate: number;
  mostConsumedFoods: Array<{
    food: OpenNutriTrackerFood;
    frequency: number;
    totalQuantity: number;
  }>;
}

export const useNutritionTracking = () => {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [goals, setGoals] = useState<NutritionGoals>({
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 25
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [objective, setObjective] = useState<NutritionObjective>(NutritionObjective.MAINTAIN);

  // Hook para dados físicos do usuário
  const { physicalData, loading: physicalLoading } = usePhysicalData(user);

  // Carregar refeições do usuário
  const loadMeals = useCallback(async (startDate?: string, endDate?: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      let query = (supabase as any)
        .from('nutrition_tracking')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (startDate) {
        query = query.gte('date', startDate);
      }
      if (endDate) {
        query = query.lte('date', endDate);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Converter dados do banco para formato local
      const convertedMeals: MealEntry[] = data?.map(item => ({
        id: item.id,
        date: item.date,
        mealType: item.meal_type,
        foods: item.foods.map((foodItem: any) => ({
          food: findFoodByName(foodItem.name) || openNutriTrackerDatabase[0], // fallback
          quantity: foodItem.quantity,
          unit: foodItem.unit
        })),
        totalCalories: item.total_calories,
        totalProtein: item.total_protein,
        totalCarbs: item.total_carbs,
        totalFat: item.total_fat,
        totalFiber: item.total_fiber,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })) || [];

      setMeals(convertedMeals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar refeições');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar metas do usuário (agora calcula baseado nos dados físicos)
  const loadGoals = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Primeiro carregar dados físicos atualizados
      const { data: physicalResponse } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Carregar objetivo nutricional salvo
      const { data: goalsResponse } = await (supabase as any)
        .from('nutrition_goals')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      // Definir objetivo (padrão: manter peso)
      const currentObjective = goalsResponse?.objective || NutritionObjective.MAINTAIN;
      setObjective(currentObjective);

      // Se há dados físicos completos, calcular metas baseadas no metabolismo
      if (physicalResponse && physicalResponse.peso_kg && physicalResponse.altura_cm && 
          physicalResponse.idade && physicalResponse.sexo) {
        
        const physicalDataForCalc: PhysicalData = {
          peso_kg: physicalResponse.peso_kg,
          altura_cm: physicalResponse.altura_cm,
          idade: physicalResponse.idade,
          sexo: physicalResponse.sexo,
          nivel_atividade: physicalResponse.nivel_atividade || 'Moderado'
        };

        console.log('🔢 Calculando metas com dados físicos:', physicalDataForCalc);

        const calculatedGoals = calculateNutritionalGoals(
          currentObjective,
          physicalDataForCalc
        );

        console.log('📊 Metas calculadas:', calculatedGoals);
        
        setGoals(calculatedGoals);
        
        // Salvar no banco para manter sincronizado
        await updateGoalsInDB(calculatedGoals, currentObjective);
        
      } else if (goalsResponse) {
        // Se não há dados físicos, usar metas salvas
        console.log('📋 Usando metas salvas (sem dados físicos)');
        setGoals({
          calories: goalsResponse.calories || 2000,
          protein: goalsResponse.protein || 150,
          carbs: goalsResponse.carbs || 250,
          fat: goalsResponse.fat || 65,
          fiber: goalsResponse.fiber || 25
        });
      } else {
        // Metas padrão se não há nada salvo
        console.log('🔧 Usando metas padrão');
        setGoals({
          calories: 2000,
          protein: 150,
          carbs: 250,
          fat: 65,
          fiber: 25
        });
      }
    } catch (err) {
      console.error('Erro ao carregar metas:', err);
    }
  }, []);

  // Função auxiliar para salvar metas no banco
  const updateGoalsInDB = useCallback(async (newGoals: NutritionGoals, newObjective?: NutritionObjective) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await (supabase as any)
        .from('nutrition_goals')
        .upsert({
          user_id: user.id,
          calories: newGoals.calories,
          protein: newGoals.protein,
          carbs: newGoals.carbs,
          fat: newGoals.fat,
          fiber: newGoals.fiber,
          objective: newObjective || objective
        });

      if (error) throw error;
    } catch (err) {
      console.error('Erro ao salvar metas no banco:', err);
    }
  }, [objective]);

  // Salvar refeição
  const saveMeal = useCallback(async (meal: Omit<MealEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const mealData = {
        user_id: user.id,
        date: meal.date,
        meal_type: meal.mealType,
        foods: meal.foods.map(food => ({
          name: food.food.name,
          quantity: food.quantity,
          unit: food.unit
        })),
        total_calories: meal.totalCalories,
        total_protein: meal.totalProtein,
        total_carbs: meal.totalCarbs,
        total_fat: meal.totalFat,
        total_fiber: meal.totalFiber
      };

      const { data, error } = await (supabase as any)
        .from('nutrition_tracking')
        .insert([mealData])
        .select()
        .single();

      if (error) throw error;

      const newMeal: MealEntry = {
        id: data.id,
        date: data.date,
        mealType: data.meal_type,
        foods: data.foods.map((foodItem: any) => ({
          food: findFoodByName(foodItem.name) || openNutriTrackerDatabase[0],
          quantity: foodItem.quantity,
          unit: foodItem.unit
        })),
        totalCalories: data.total_calories,
        totalProtein: data.total_protein,
        totalCarbs: data.total_carbs,
        totalFat: data.total_fat,
        totalFiber: data.total_fiber,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setMeals(prev => [newMeal, ...prev]);
      return newMeal;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar refeição');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar metas
  const updateGoals = useCallback(async (newGoals: NutritionGoals) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await (supabase as any)
        .from('nutrition_goals')
        .upsert({
          user_id: user.id,
          calories: newGoals.calories,
          protein: newGoals.protein,
          carbs: newGoals.carbs,
          fat: newGoals.fat,
          fiber: newGoals.fiber
        });

      if (error) throw error;

      setGoals(newGoals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar metas');
      throw err;
    }
  }, []);

  // Deletar refeição
  const deleteMeal = useCallback(async (mealId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await (supabase as any)
        .from('nutrition_tracking')
        .delete()
        .eq('id', mealId);

      if (error) throw error;

      setMeals(prev => prev.filter(meal => meal.id !== mealId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar refeição');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Calcular nutrição diária
  const getDailyNutrition = useCallback((date: string): DailyNutrition => {
    const dayMeals = meals.filter(meal => meal.date === date);
    
    const totals = dayMeals.reduce((acc, meal) => ({
      totalCalories: acc.totalCalories + meal.totalCalories,
      totalProtein: acc.totalProtein + meal.totalProtein,
      totalCarbs: acc.totalCarbs + meal.totalCarbs,
      totalFat: acc.totalFat + meal.totalFat,
      totalFiber: acc.totalFiber + meal.totalFiber
    }), {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0
    });

    const progress = {
      calories: Math.min((totals.totalCalories / goals.calories) * 100, 100),
      protein: Math.min((totals.totalProtein / goals.protein) * 100, 100),
      carbs: Math.min((totals.totalCarbs / goals.carbs) * 100, 100),
      fat: Math.min((totals.totalFat / goals.fat) * 100, 100),
      fiber: Math.min((totals.totalFiber / goals.fiber) * 100, 100)
    };

    return {
      date,
      ...totals,
      meals: dayMeals,
      goals,
      progress
    };
  }, [meals, goals]);

  // Calcular estatísticas
  const getNutritionStats = useCallback((days: number = 7): NutritionStats => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const recentMeals = meals.filter(meal => {
      const mealDate = new Date(meal.date);
      return mealDate >= startDate && mealDate <= endDate;
    });

    if (recentMeals.length === 0) {
      return {
        averageCalories: 0,
        averageProtein: 0,
        averageCarbs: 0,
        averageFat: 0,
        averageFiber: 0,
        daysTracked: 0,
        goalAchievementRate: 0,
        mostConsumedFoods: []
      };
    }

    const uniqueDates = new Set(recentMeals.map(meal => meal.date));
    const daysTracked = uniqueDates.size;

    const totals = recentMeals.reduce((acc, meal) => ({
      calories: acc.calories + meal.totalCalories,
      protein: acc.protein + meal.totalProtein,
      carbs: acc.carbs + meal.totalCarbs,
      fat: acc.fat + meal.totalFat,
      fiber: acc.fiber + meal.totalFiber
    }), { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

    // Calcular alimentos mais consumidos
    const foodCount: Record<string, { food: OpenNutriTrackerFood; frequency: number; totalQuantity: number }> = {};
    
    recentMeals.forEach(meal => {
      meal.foods.forEach(foodItem => {
        const key = foodItem.food.id;
        if (!foodCount[key]) {
          foodCount[key] = {
            food: foodItem.food,
            frequency: 0,
            totalQuantity: 0
          };
        }
        foodCount[key].frequency += 1;
        foodCount[key].totalQuantity += foodItem.quantity;
      });
    });

    const mostConsumedFoods = Object.values(foodCount)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Calcular taxa de alcance de metas
    const goalDays = Array.from(uniqueDates).filter(date => {
      const daily = getDailyNutrition(date);
      return daily.totalCalories >= goals.calories * 0.8; // 80% da meta
    }).length;

    const goalAchievementRate = (goalDays / daysTracked) * 100;

    return {
      averageCalories: Math.round(totals.calories / daysTracked),
      averageProtein: Math.round((totals.protein / daysTracked) * 10) / 10,
      averageCarbs: Math.round((totals.carbs / daysTracked) * 10) / 10,
      averageFat: Math.round((totals.fat / daysTracked) * 10) / 10,
      averageFiber: Math.round((totals.fiber / daysTracked) * 10) / 10,
      daysTracked,
      goalAchievementRate: Math.round(goalAchievementRate),
      mostConsumedFoods
    };
  }, [meals, goals, getDailyNutrition]);

  // Carregar usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Carregar dados iniciais quando usuário ou dados físicos mudarem
  useEffect(() => {
    if (user) {
      loadMeals();
    }
  }, [user, loadMeals]);

  // Recarregar metas quando dados físicos mudarem
  useEffect(() => {
    if (user) {
      loadGoals();
    }
  }, [user, loadGoals]);

  // Função para atualizar objetivo nutricional
  const updateObjective = useCallback(async (newObjective: NutritionObjective) => {
    if (!user) return;

    try {
      setObjective(newObjective);
      
      // Recarregar dados físicos e recalcular
      const { data: physicalResponse } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (physicalResponse && physicalResponse.peso_kg && physicalResponse.altura_cm && 
          physicalResponse.idade && physicalResponse.sexo) {
        
        const physicalDataForCalc: PhysicalData = {
          peso_kg: physicalResponse.peso_kg,
          altura_cm: physicalResponse.altura_cm,
          idade: physicalResponse.idade,
          sexo: physicalResponse.sexo,
          nivel_atividade: physicalResponse.nivel_atividade || 'Moderado'
        };

        console.log('🎯 Recalculando para objetivo:', newObjective);
        console.log('📊 Dados físicos:', physicalDataForCalc);

        const calculatedGoals = calculateNutritionalGoals(newObjective, physicalDataForCalc);
        
        console.log('✅ Novas metas:', calculatedGoals);
        
        setGoals(calculatedGoals);
        await updateGoalsInDB(calculatedGoals, newObjective);
      }
    } catch (err) {
      console.error('Erro ao atualizar objetivo:', err);
      setError(err instanceof Error ? err.message : 'Erro ao atualizar objetivo');
    }
  }, [user, updateGoalsInDB]);

  return {
    meals,
    goals,
    loading,
    error,
    objective,
    physicalData,
    loadMeals,
    loadGoals,
    saveMeal,
    updateGoals,
    updateObjective,
    deleteMeal,
    getDailyNutrition,
    getNutritionStats
  };
};
