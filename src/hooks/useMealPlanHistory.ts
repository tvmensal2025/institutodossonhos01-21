import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface MealPlanHistory {
  id: string;
  title: string;
  plan_type: 'weekly' | 'daily';
  meal_plan_data: any;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useMealPlanHistory = () => {
  const [history, setHistory] = useState<MealPlanHistory[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setHistory([]);
        return;
      }

      const { data, error } = await supabase
        .from('meal_plan_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory((data || []) as MealPlanHistory[]);
    } catch (error) {
      console.error('Error fetching meal plan history:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico de cardápios',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveMealPlan = async (
    title: string,
    planType: 'weekly' | 'daily',
    mealPlanData: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('meal_plan_history')
        .insert({
          title,
          plan_type: planType,
          meal_plan_data: mealPlanData,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar lista local
      setHistory(prev => [data as MealPlanHistory, ...prev]);
      
      toast({
        title: 'Sucesso',
        description: 'Cardápio salvo no histórico',
      });

      return data;
    } catch (error) {
      console.error('Error saving meal plan:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível salvar o cardápio',
        variant: 'destructive',
      });
    }
  };

  const deleteMealPlan = async (id: string) => {
    try {
      const { error } = await supabase
        .from('meal_plan_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setHistory(prev => prev.filter(item => item.id !== id));
      
      toast({
        title: 'Sucesso',
        description: 'Cardápio removido do histórico',
      });
    } catch (error) {
      console.error('Error deleting meal plan:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover o cardápio',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return {
    history,
    loading,
    saveMealPlan,
    deleteMealPlan,
    refetch: fetchHistory,
  };
};