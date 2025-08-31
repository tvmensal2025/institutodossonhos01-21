import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdvancedTrackingData {
  id?: string;
  user_id?: string;
  date?: string;
  wake_up_time?: string;
  sleep_time?: string;
  energy_morning?: number;
  energy_afternoon?: number;
  energy_evening?: number;
  stress_triggers?: string;
  stress_level_general?: number;
  gratitude_notes?: string;
  daily_highlight?: string;
  improvement_area?: string;
  tomorrow_intention?: string;
  water_goal_ml?: number;
  water_current_ml?: number;
  sleep_quality_notes?: string;
  dream_recall?: boolean;
  wake_up_naturally?: boolean;
  workout_planned?: boolean;
  workout_completed?: boolean;
  workout_satisfaction?: number;
  steps_goal?: number;
  meal_planning_done?: boolean;
  mindful_eating?: boolean;
  emotional_eating?: boolean;
  nutrition_satisfaction?: number;
  priorities_defined?: boolean;
  goals_achieved?: number;
  focus_level?: number;
  daily_score?: number;
  completion_percentage?: number;
  personal_growth_moment?: string;
  created_at?: string;
  updated_at?: string;
}

export const useAdvancedTracking = () => {
  const [todayData, setTodayData] = useState<AdvancedTrackingData | null>(null);
  const [weeklyData, setWeeklyData] = useState<AdvancedTrackingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Carregar dados de hoje
  const loadTodayData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await (supabase as any)
        .from('daily_advanced_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;

      setTodayData(data);
    } catch (error) {
      console.error('Erro ao carregar dados de hoje:', error);
    }
  }, []);

  // Carregar dados da semana
  const loadWeeklyData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 6); // Últimos 7 dias

      const { data, error } = await (supabase as any)
        .from('daily_advanced_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate.toISOString().split('T')[0])
        .lte('date', endDate.toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (error) throw error;

      setWeeklyData(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados semanais:', error);
    }
  }, []);

  // Salvar dados do dia
  const saveTodayData = useCallback(async (data: Partial<AdvancedTrackingData>) => {
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const today = new Date().toISOString().split('T')[0];
      
      const { data: result, error } = await (supabase as any)
        .from('daily_advanced_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          ...data
        })
        .select()
        .single();

      if (error) throw error;

      setTodayData(result);
      
      toast({
        title: "✅ Dados salvos!",
        description: "Seu tracking foi atualizado com sucesso",
      });

      return result;
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar os dados. Tente novamente.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsSaving(false);
    }
  }, [toast]);

  // Calcular estatísticas da semana
  const getWeeklyStats = useCallback(() => {
    if (weeklyData.length === 0) {
      return {
        averageDailyScore: 0,
        averageEnergyLevel: 0,
        averageStressLevel: 0,
        daysWithWorkout: 0,
        hydrationAchievement: 0,
        completionRate: 0
      };
    }

    const totalDays = weeklyData.length;
    
    const averageDailyScore = weeklyData.reduce((sum, day) => 
      sum + (day.daily_score || 0), 0) / totalDays;
    
    const averageEnergyLevel = weeklyData.reduce((sum, day) => {
      const morning = day.energy_morning || 0;
      const afternoon = day.energy_afternoon || 0;
      const evening = day.energy_evening || 0;
      return sum + ((morning + afternoon + evening) / 3);
    }, 0) / totalDays;
    
    const averageStressLevel = weeklyData.reduce((sum, day) => 
      sum + (day.stress_level_general || 0), 0) / totalDays;
    
    const daysWithWorkout = weeklyData.filter(day => 
      day.workout_completed === true).length;
    
    const hydrationAchievement = weeklyData.filter(day => 
      (day.water_current_ml || 0) >= (day.water_goal_ml || 2000)).length;
    
    const completionRate = weeklyData.reduce((sum, day) => 
      sum + (day.completion_percentage || 0), 0) / totalDays;

    return {
      averageDailyScore: Math.round(averageDailyScore),
      averageEnergyLevel: Math.round(averageEnergyLevel * 10) / 10,
      averageStressLevel: Math.round(averageStressLevel * 10) / 10,
      daysWithWorkout,
      hydrationAchievement,
      completionRate: Math.round(completionRate)
    };
  }, [weeklyData]);

  // Obter insights da semana
  const getWeeklyInsights = useCallback(() => {
    const stats = getWeeklyStats();
    const insights: string[] = [];

    if (stats.averageDailyScore >= 80) {
      insights.push("🎉 Excelente desempenho essa semana!");
    } else if (stats.averageDailyScore >= 60) {
      insights.push("👍 Boa semana! Tem potencial para ainda mais.");
    } else {
      insights.push("💪 Vamos focar em pequenas melhorias para a próxima semana.");
    }

    if (stats.daysWithWorkout >= 5) {
      insights.push("🏃‍♀️ Parabéns pela consistência nos exercícios!");
    } else if (stats.daysWithWorkout >= 3) {
      insights.push("🚶‍♂️ Boa frequência de exercícios, tente aumentar um pouco.");
    } else {
      insights.push("🎯 Que tal definir uma meta de exercícios para esta semana?");
    }

    if (stats.hydrationAchievement >= 5) {
      insights.push("💧 Hidratação excelente! Continue assim.");
    } else {
      insights.push("💧 Lembre-se de beber mais água ao longo do dia.");
    }

    if (stats.averageStressLevel <= 3) {
      insights.push("😌 Ótimo controle do estresse!");
    } else if (stats.averageStressLevel <= 6) {
      insights.push("🧘‍♀️ Considere técnicas de relaxamento para reduzir o estresse.");
    } else {
      insights.push("⚠️ Níveis altos de estresse. Que tal conversar sobre isso?");
    }

    return insights;
  }, [getWeeklyStats]);

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([
        loadTodayData(),
        loadWeeklyData()
      ]);
      setIsLoading(false);
    };

    loadData();
  }, [loadTodayData, loadWeeklyData]);

  return {
    // Dados
    todayData,
    weeklyData,
    weeklyStats: getWeeklyStats(),
    weeklyInsights: getWeeklyInsights(),
    
    // Estados
    isLoading,
    isSaving,
    
    // Ações
    saveTodayData,
    refreshData: () => Promise.all([loadTodayData(), loadWeeklyData()]),
    
    // Utilitários
    hasDataForToday: !!todayData,
    getTodayField: (field: keyof AdvancedTrackingData) => todayData?.[field],
    updateTodayField: (field: keyof AdvancedTrackingData, value: any) => {
      if (todayData) {
        setTodayData({ ...todayData, [field]: value });
      }
    }
  };
};