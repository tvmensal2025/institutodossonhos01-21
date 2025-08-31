
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type MealSlot = 'breakfast' | 'lunch' | 'snack' | 'dinner' | 'refeicao';

export interface MacroRow {
  day: string; // yyyy-mm-dd
  meal_type: MealSlot;
  kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g?: number;
  sodium_mg?: number;
  items?: Array<{ name?: string; quantity?: number; unit?: string }>;
}

export interface DailyAggregates {
  byMeal: Record<MealSlot, { kcal: number; protein_g: number; carbs_g: number; fat_g: number }>;
  totals: { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
}

export function useDailyNutritionReport(date: Date) {
  const [rows, setRows] = useState<MacroRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data: session } = await supabase.auth.getSession();
        const userId = session.session?.user?.id;
        
        if (!userId) {
          console.log('❌ Usuário não autenticado');
          setRows([]);
          setLoading(false);
          return;
        }

        const dayStr = date.toISOString().slice(0, 10);
        console.log('🔍 Buscando dados nutricionais para:', dayStr, 'userId:', userId);
        
        // Buscar dados da tabela food_analysis
        const { data, error } = await supabase
          .from('food_analysis')
          .select('*')
          .eq('user_id', userId)
          .gte('created_at', `${dayStr}T00:00:00`)
          .lte('created_at', `${dayStr}T23:59:59`)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('❌ Erro ao buscar food_analysis:', error);
          throw error;
        }

        console.log('📊 Dados encontrados:', data?.length || 0, 'registros');

        const parsed: MacroRow[] = (data || []).map((r: any) => {
          // Extrair dados nutricionais do campo nutrition_analysis ou user_context
          const nutritionData = r.nutrition_analysis || {};
          const userContext = r.user_context || {};
          
          return {
            day: r.created_at.slice(0, 10),
            meal_type: (r.meal_type || 'refeicao') as MealSlot,
            kcal: Number(nutritionData.total_kcal || nutritionData.totalCalories || userContext.calories || 0),
            protein_g: Number(nutritionData.total_proteina || nutritionData.totalProtein || userContext.protein || 0),
            carbs_g: Number(nutritionData.total_carbo || nutritionData.totalCarbs || userContext.carbs || 0),
            fat_g: Number(nutritionData.total_gordura || nutritionData.totalFat || userContext.fat || 0),
            fiber_g: Number(nutritionData.total_fibras || nutritionData.totalFiber || userContext.fiber || 0),
            sodium_mg: Number(nutritionData.total_sodio || nutritionData.totalSodium || userContext.sodium || 0),
            items: Array.isArray(r.food_items) ? r.food_items : (userContext.foods_detected || []).map((name: string) => ({ name })),
          };
        });

        if (!mounted) return;
        console.log('✅ Dados processados:', parsed);
        setRows(parsed);
      } catch (e: any) {
        console.error('❌ Erro no useDailyNutritionReport:', e);
        if (!mounted) return;
        setError(e?.message || 'Erro ao carregar dados nutricionais');
        setRows([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [date]);

  const aggregates: DailyAggregates = useMemo(() => {
    const init = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
    const byMeal: DailyAggregates['byMeal'] = {
      breakfast: { ...init },
      lunch: { ...init },
      snack: { ...init },
      dinner: { ...init },
      refeicao: { ...init },
    };
    
    for (const r of rows) {
      const mealType = r.meal_type in byMeal ? r.meal_type : 'refeicao';
      const m = byMeal[mealType];
      m.kcal += r.kcal;
      m.protein_g += r.protein_g;
      m.carbs_g += r.carbs_g;
      m.fat_g += r.fat_g;
    }
    
    const totals = Object.values(byMeal).reduce((acc, m) => ({
      kcal: acc.kcal + m.kcal,
      protein_g: acc.protein_g + m.protein_g,
      carbs_g: acc.carbs_g + m.carbs_g,
      fat_g: acc.fat_g + m.fat_g,
    }), { ...init });
    
    return { byMeal, totals };
  }, [rows]);

  return { rows, aggregates, loading, error };
}
