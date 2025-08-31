import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSofiaAnalysis } from '@/hooks/useSofiaAnalysis';

interface TrackingData {
  waterIntake: {
    today: number;
    goal: number;
    streak: number;
    weeklyData: { date: string; amount: number }[];
    todayTotal: number;
    weeklyAverage: number;
  };
  water: {
    today: { id: string; recorded_at: string; amount_ml: number }[];
    todayTotal: number;
    goal: number;
    weeklyAverage: number;
  };
  sleep: {
    lastNight: {
      hours: number;
      quality: number;
    };
    goal: number;
    quality: number;
    weeklyAverage: number;
    weeklyData: { date: string; hours: number; quality: number }[];
  };
  mood: {
    today: {
      day_rating: number;
      energy_level: number;
      stress_level: number;
    };
    average: number;
    weeklyData: { date: string; mood: number; energy: number; stress: number }[];
  };
  exercise: {
    todayMinutes: number;
    weeklyGoal: number;
    streak: number;
    weeklyData: { date: string; minutes: number; type: string }[];
  };
}

export const useTrackingData = () => {
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { detectAnomalies } = useSofiaAnalysis();

  useEffect(() => {
    loadTrackingData();
  }, []);

  const loadTrackingData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setTrackingData(null);
        setIsLoading(false);
        return;
      }

      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // 💧 Carregar dados de água (usando any temporariamente até types atualizarem)
      const { data: waterData } = await (supabase as any)
        .from('water_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      const { data: waterWeekly } = await (supabase as any)
        .from('water_tracking')
        .select('date, amount_ml')
        .eq('user_id', user.id)
        .gte('date', weekStartStr);

      // 😴 Carregar dados de sono
      const { data: sleepData } = await (supabase as any)
        .from('sleep_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // 😊 Carregar dados de humor
      const { data: moodData } = await (supabase as any)
        .from('mood_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single();

      // 🚶 Carregar dados de exercício
      const { data: exerciseData } = await (supabase as any)
        .from('exercise_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today);

      // Calcular totais
      const todayWaterTotal = waterData?.reduce((sum, entry) => sum + entry.amount_ml, 0) || 0;
      const weeklyWaterAvg = waterWeekly?.reduce((sum, entry) => sum + entry.amount_ml, 0) / 7 || 0;
      const todayExerciseMinutes = exerciseData?.reduce((sum, entry) => sum + (entry.duration_minutes || 0), 0) || 0;

      const trackingData: TrackingData = {
        waterIntake: {
          today: Math.ceil(todayWaterTotal / 250), // Converter ml para copos
          goal: 8,
          streak: 0, // TODO: calcular streak
          weeklyData: waterWeekly?.map(d => ({ date: d.date, amount: Math.ceil(d.amount_ml / 250) })) || [],
          todayTotal: Math.ceil(todayWaterTotal / 250),
          weeklyAverage: Math.ceil(weeklyWaterAvg / 250)
        },
        water: {
          today: waterData?.map(d => ({ 
            id: d.id, 
            recorded_at: d.recorded_at, 
            amount_ml: d.amount_ml 
          })) || [],
          todayTotal: Math.ceil(todayWaterTotal / 250),
          goal: 8,
          weeklyAverage: Math.ceil(weeklyWaterAvg / 250)
        },
        sleep: {
          lastNight: {
            hours: sleepData?.hours_slept || 0,
            quality: sleepData?.sleep_quality || 0
          },
          goal: 8,
          quality: sleepData?.sleep_quality ? sleepData.sleep_quality * 20 : 0, // Converter 1-5 para 0-100
          weeklyAverage: sleepData?.hours_slept || 0,
          weeklyData: []
        },
        mood: {
          today: {
            day_rating: moodData?.day_rating || 0,
            energy_level: moodData?.energy_level || 0,
            stress_level: moodData?.stress_level || 0
          },
          average: moodData?.day_rating || 0,
          weeklyData: []
        },
        exercise: {
          todayMinutes: todayExerciseMinutes,
          weeklyGoal: 150,
          streak: 0, // TODO: calcular streak
          weeklyData: exerciseData?.map(d => ({ 
            date: d.date, 
            minutes: d.duration_minutes || 0, 
            type: d.exercise_type 
          })) || []
        }
      };

      setTrackingData(trackingData);
    } catch (error) {
      console.error('Erro ao carregar dados de tracking:', error);
      setTrackingData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const addWaterIntake = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const amountMl = amount * 250; // Converter copos para ml
      
      const { data: inserted, error } = await (supabase as any)
        .from('water_tracking')
        .insert({
          user_id: user.id,
          amount_ml: amountMl,
          source: 'manual'
        })
        .select()
        .single();

      if (error) throw error;
      
      // Upsert de daily_advanced_tracking após salvar água e detecção de anomalias
      const today = new Date().toISOString().split('T')[0];
      const { data: newDailyRecord, error: advError } = await (supabase as any)
        .from('daily_advanced_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          water_current_ml: (trackingData?.water?.todayTotal || 0) * 250 + amountMl,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!advError && newDailyRecord) {
        detectAnomalies(user.id, newDailyRecord).catch(console.error);
      }

      // Atualizar estado local
      if (trackingData) {
        setTrackingData({
          ...trackingData,
          waterIntake: {
            ...trackingData.waterIntake,
            today: trackingData.waterIntake.today + amount
          }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar água:', error);
    }
  };

  const addSleepData = async (sleepForm: { hours: number; quality: number; notes: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: upserted, error } = await (supabase as any)
        .from('sleep_tracking')
        .upsert({
          user_id: user.id,
          hours_slept: sleepForm.hours,
          sleep_quality: sleepForm.quality,
          sleep_notes: sleepForm.notes,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      
      // Upsert de daily_advanced_tracking com qualidade e horas de sono e detecção de anomalias
      const today = new Date().toISOString().split('T')[0];
      const { data: newDailyRecord, error: advError } = await (supabase as any)
        .from('daily_advanced_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          sleep_quality_notes: sleepForm.notes,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!advError && newDailyRecord) {
        detectAnomalies(user.id, newDailyRecord).catch(console.error);
      }

      // Atualizar estado local
      if (trackingData) {
        setTrackingData({
          ...trackingData,
          sleep: {
            ...trackingData.sleep,
            lastNight: {
              hours: sleepForm.hours,
              quality: sleepForm.quality
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar sono:', error);
    }
  };

  const addMoodData = async (moodForm: { energy: number; stress: number; rating: number; gratitude: string }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await (supabase as any)
        .from('mood_tracking')
        .upsert({
          user_id: user.id,
          day_rating: moodForm.rating,
          energy_level: moodForm.energy,
          stress_level: moodForm.stress,
          gratitude_text: moodForm.gratitude,
          date: new Date().toISOString().split('T')[0]
        });

      if (error) throw error;
      
      // Upsert de daily_advanced_tracking e detecção de anomalias logo após salvar
      const today = new Date().toISOString().split('T')[0];
      const { data: newDailyRecord, error: advError } = await (supabase as any)
        .from('daily_advanced_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          mood_general: moodForm.rating,
          energy_morning: moodForm.energy,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!advError && newDailyRecord) {
        // Não bloquear a UI; log silencioso em caso de erro
        detectAnomalies(user.id, newDailyRecord).catch(console.error);
      }

      // Atualizar estado local
      if (trackingData) {
        setTrackingData({
          ...trackingData,
          mood: {
            ...trackingData.mood,
            today: {
              day_rating: moodForm.rating,
              energy_level: moodForm.energy,
              stress_level: moodForm.stress
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar humor:', error);
    }
  };

  const addExerciseData = async (minutes: number, type: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: inserted, error } = await (supabase as any)
        .from('exercise_tracking')
        .insert({
          user_id: user.id,
          exercise_type: type,
          duration_minutes: minutes,
          date: new Date().toISOString().split('T')[0]
        })
        .select()
        .single();

      if (error) throw error;
      
      // Upsert de daily_advanced_tracking: marcar treino concluído e detectar anomalias
      const today = new Date().toISOString().split('T')[0];
      const { data: newDailyRecord, error: advError } = await (supabase as any)
        .from('daily_advanced_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          workout_completed: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (!advError && newDailyRecord) {
        detectAnomalies(user.id, newDailyRecord).catch(console.error);
      }

      // Atualizar estado local
      if (trackingData) {
        setTrackingData({
          ...trackingData,
          exercise: {
            ...trackingData.exercise,
            todayMinutes: trackingData.exercise.todayMinutes + minutes
          }
        });
      }
    } catch (error) {
      console.error('Erro ao adicionar exercício:', error);
    }
  };

  return {
    trackingData,
    isLoading,
    addWaterIntake,
    addSleepData,
    addMoodData,
    addExerciseData,
    refreshData: loadTrackingData,
    // Aliases para compatibilidade
    addWater: addWaterIntake,
    addSleep: addSleepData,
    addMood: addMoodData,
    isAddingWater: false,
    isAddingSleep: false,
    isAddingMood: false,
    water: trackingData?.waterIntake
  };
};