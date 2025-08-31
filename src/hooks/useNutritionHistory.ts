// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  state?: string;
}

interface NutritionAnalysis {
  id: string;
  analysis_date: string;
  analysis_time: string;
  meal_type: string;
  food_items: FoodItem[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber: number;
  total_sodium: number;
  nutrition_summary: any;
  sofia_analysis: string;
  created_at: string;
}

export const useNutritionHistory = () => {
  const [analyses, setAnalyses] = useState<NutritionAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyses = async (limit = 20) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('food_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setAnalyses(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAnalysesByDate = async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('food_analysis')
        .select('*')
        .eq('analysis_date', date)
        .order('analysis_time', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getDailyTotals = (date: string) => {
    const dayAnalyses = analyses.filter(a => a.analysis_date === date);
    
    return dayAnalyses.reduce((totals, analysis) => ({
      calories: totals.calories + analysis.total_calories,
      protein: totals.protein + analysis.total_protein,
      carbs: totals.carbs + analysis.total_carbs,
      fat: totals.fat + analysis.total_fat,
      fiber: totals.fiber + analysis.total_fiber,
      sodium: totals.sodium + analysis.total_sodium
    }), {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sodium: 0
    });
  };

  const deleteAnalysis = async (id: string) => {
    try {
      const { error } = await supabase
        .from('food_analysis')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAnalyses(prev => prev.filter(a => a.id !== id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  useEffect(() => {
    fetchAnalyses();
  }, []);

  return {
    analyses,
    loading,
    error,
    fetchAnalyses,
    getAnalysesByDate,
    getDailyTotals,
    deleteAnalysis
  };
};