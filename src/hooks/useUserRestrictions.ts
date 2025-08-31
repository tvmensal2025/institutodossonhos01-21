// @ts-nocheck
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserRestrictions {
  forbidden_foods: string[];
  problematic_foods: string[];
  preferences: string[];
  last_used_restrictions?: string[];
  last_used_preferences?: string[];
}

export const useUserRestrictions = () => {
  const [restrictions, setRestrictions] = useState<UserRestrictions>({
    forbidden_foods: [],
    problematic_foods: [],
    preferences: [],
    last_used_restrictions: [],
    last_used_preferences: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carregar restrições de todas as fontes
  const loadUserRestrictions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // 1. Carregar da anamnese (restrições permanentes)
      const { data: anamnesisData } = await supabase
        .from('user_anamnesis')
        .select('forbidden_foods, problematic_foods')
        .eq('user_id', user.id)
        .maybeSingle();

      // 2. Carregar do último cardápio salvo (preferências e restrições usadas)
      const { data: lastMealPlan } = await supabase
        .from('meal_plan_history')
        .select('meal_plan_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      // 3. Carregar favoritos nutricionais
      const { data: favorites } = await supabase
        .from('nutrition_favorites')
        .select('food_name')
        .eq('user_id', user.id)
        .order('usage_count', { ascending: false })
        .limit(10);

      // Processar dados da anamnese
      const anamnesisRestrictions = Array.isArray(anamnesisData?.forbidden_foods) 
        ? anamnesisData.forbidden_foods 
        : [];
      const anamnesisProblematic = Array.isArray(anamnesisData?.problematic_foods) 
        ? anamnesisData.problematic_foods 
        : [];

      // Processar dados do último cardápio
      const lastPlanMetadata = lastMealPlan?.meal_plan_data && typeof lastMealPlan.meal_plan_data === 'object' ? (lastMealPlan.meal_plan_data as any)?.metadata : null;
      const lastRestrictions = Array.isArray(lastPlanMetadata?.restrictions) 
        ? lastPlanMetadata.restrictions 
        : [];
      const lastPreferences = Array.isArray(lastPlanMetadata?.preferences) 
        ? lastPlanMetadata.preferences 
        : [];

      // Processar favoritos
      const favoriteFoods = Array.isArray(favorites) 
        ? favorites.map(f => f.food_name) 
        : [];

      setRestrictions({
        forbidden_foods: anamnesisRestrictions as string[],
        problematic_foods: anamnesisProblematic as string[],
        preferences: favoriteFoods,
        last_used_restrictions: lastRestrictions,
        last_used_preferences: lastPreferences
      });

    } catch (err) {
      console.error('Erro ao carregar restrições do usuário:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar preferências de uso no último cardápio
  const saveUsedRestrictions = useCallback(async (
    restrictions: string[], 
    preferences: string[]
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Atualizar na tabela meal_plans para facilitar consultas futuras
      const { error } = await supabase
        .from('meal_plans')
        .update({
          context: {
            restrictions,
            preferences,
            updated_at: new Date().toISOString()
          }
        })
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        console.warn('Aviso ao salvar preferências:', error);
      }

      // Atualizar estado local
      setRestrictions(prev => ({
        ...prev,
        last_used_restrictions: restrictions,
        last_used_preferences: preferences
      }));

    } catch (error) {
      console.error('Erro ao salvar preferências usadas:', error);
    }
  }, []);

  // Obter restrições combinadas (anamnese + últimas usadas)
  const getCombinedRestrictions = useCallback(() => {
    const combined = new Set([
      ...restrictions.forbidden_foods,
      ...restrictions.problematic_foods,
      ...restrictions.last_used_restrictions
    ]);
    return Array.from(combined).filter(Boolean);
  }, [restrictions]);

  // Obter preferências combinadas (favoritos + últimas usadas)
  const getCombinedPreferences = useCallback(() => {
    const combined = new Set([
      ...restrictions.preferences,
      ...restrictions.last_used_preferences
    ]);
    return Array.from(combined).filter(Boolean);
  }, [restrictions]);

  useEffect(() => {
    loadUserRestrictions();
  }, [loadUserRestrictions]);

  return {
    restrictions,
    isLoading,
    error,
    loadUserRestrictions,
    saveUsedRestrictions,
    getCombinedRestrictions,
    getCombinedPreferences
  };
};
