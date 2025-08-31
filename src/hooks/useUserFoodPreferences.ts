import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UserFoodPreference {
  id: string;
  user_id: string;
  food_name: string;
  preference_type: 'restriction' | 'preference' | 'allergy' | 'dislike';
  severity_level: number;
  notes?: string;
  auto_detected: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserFoodPreferences = () => {
  const [preferences, setPreferences] = useState<UserFoodPreference[]>([]);
  const [restrictions, setRestrictions] = useState<UserFoodPreference[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_food_preferences')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar preferências:', error);
        return;
      }

      const prefs = data?.filter(p => p.preference_type === 'preference').map(p => p as UserFoodPreference) || [];
      const rests = data?.filter(p => ['restriction', 'allergy', 'dislike'].includes(p.preference_type)).map(p => p as UserFoodPreference) || [];

      setPreferences(prefs);
      setRestrictions(rests);
    } catch (error) {
      console.error('Erro ao buscar preferências do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPreference = async (foodName: string, type: UserFoodPreference['preference_type'], notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('user_food_preferences')
        .upsert({
          user_id: user.id,
          food_name: foodName.toLowerCase().trim(),
          preference_type: type,
          notes,
          auto_detected: false
        }, {
          onConflict: 'user_id,food_name,preference_type',
          ignoreDuplicates: false
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao salvar preferência:', error);
        toast.error('Erro ao salvar preferência');
        return false;
      }

      if (data) {
        await fetchPreferences(); // Recarregar dados
        toast.success(`${type === 'preference' ? 'Preferência' : 'Restrição'} salva com sucesso!`);
        return true;
      }
    } catch (error) {
      console.error('Erro ao adicionar preferência:', error);
      toast.error('Erro ao adicionar preferência');
      return false;
    }
  };

  const removePreference = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_food_preferences')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Erro ao remover preferência:', error);
        toast.error('Erro ao remover preferência');
        return false;
      }

      await fetchPreferences(); // Recarregar dados
      toast.success('Preferência removida com sucesso!');
      return true;
    } catch (error) {
      console.error('Erro ao remover preferência:', error);
      toast.error('Erro ao remover preferência');
      return false;
    }
  };

  const getRestrictionsArray = (): string[] => {
    return restrictions.map(r => r.food_name);
  };

  const getPreferencesArray = (): string[] => {
    return preferences.map(p => p.food_name);
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  return {
    preferences,
    restrictions,
    loading,
    addPreference,
    removePreference,
    getRestrictionsArray,
    getPreferencesArray,
    refreshPreferences: fetchPreferences
  };
};