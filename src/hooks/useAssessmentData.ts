// @ts-nocheck
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AssessmentData {
  user_id: string;
  week_start_date: string;
  satisfaction_rating?: number;
  goal_achievement_rating?: number;
  weight_change?: number;
  challenges_faced?: string;
  improvements_noted?: string;
  next_week_goals?: string;
}

export const useAssessmentData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveAssessment = async (assessmentData: {
    satisfaction_rating?: number;
    goal_achievement_rating?: number;
    weight_change?: number;
    challenges_faced?: string;
    improvements_noted?: string;
    next_week_goals?: string;
  }) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Calcular data de início da semana (segunda-feira)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
      const monday = new Date(now.setDate(diff));
      const weekStartDate = monday.toISOString().split('T')[0];

      const dataToSave: AssessmentData = {
        ...assessmentData,
        user_id: user.id,
        week_start_date: weekStartDate
      };

      const { error } = await supabase
        .from('assessments')
        .upsert(dataToSave);

      if (error) throw error;

      return { success: true };
    } catch (error: any) {
      console.error('Erro ao salvar avaliação:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const getAssessmentHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error: any) {
      console.error('Erro ao buscar histórico de avaliações:', error);
      return [];
    }
  };

  return {
    saveAssessment,
    getAssessmentHistory,
    isLoading
  };
};