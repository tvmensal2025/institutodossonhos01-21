// @ts-nocheck
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AnalysisResult {
  patterns: {
    sleep_patterns: string;
    water_patterns: string;
    mood_patterns: string;
    exercise_patterns: string;
    weight_patterns: string;
    food_patterns: string;
  };
  insights: string[];
  recommendations: string[];
  anomalies: string[];
  predictions: {
    weight_trend: string;
    energy_forecast: string;
    goal_likelihood: string;
  };
  personalized_tips: string[];
  sofia_learning: string;
}

interface AnalysisHistory {
  id: string;
  created_at: string;
  analysis_data: any;
  recommendations: any;
  risk_factors: any;
  risk_score: number;
}

export const useSofiaAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResult | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisHistory[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Realizar análise completa
  const performAnalysis = useCallback(async (userId: string, analysisType: string = 'complete') => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      console.log('Iniciando análise Sofia para usuário:', userId);
      
      const { data, error } = await supabase.functions.invoke('sofia-tracking-analysis', {
        body: {
          userId: userId,
          analysis_type: analysisType
        }
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || 'Erro na análise');
      }

      setCurrentAnalysis(data.analysis);
      
      toast({
        title: "✨ Análise Completa!",
        description: "Sofia analisou seus dados e descobriu insights personalizados",
        duration: 5000,
      });

      return data.analysis;
      
    } catch (error) {
      console.error('Erro na análise Sofia:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setError(errorMessage);
      
      toast({
        title: "Erro na Análise",
        description: errorMessage,
        variant: "destructive",
        duration: 5000,
      });
      
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [toast]);

  // Buscar histórico de análises
  const loadAnalysisHistory = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('preventive_health_analyses')
        .select('*')
        .eq('user_id', userId)
        .eq('analysis_type', 'sofia_tracking_analysis')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        throw error;
      }

      setAnalysisHistory(data || []);
      return data;
      
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setError('Erro ao carregar histórico de análises');
      return [];
    }
  }, []);

  // Buscar conhecimento da Sofia sobre o usuário
  const getSofiaKnowledge = async (userId: string): Promise<any[]> => {
    try {
      console.log('Buscando conhecimento Sofia (simulado)');
      // Simular dados até tabela ser criada
      return [];
      
    } catch (error) {
      console.error('Erro ao buscar conhecimento Sofia:', error);
      return [];
    }
  };

  // Análise automática baseada em triggers
  const triggerAutomaticAnalysis = useCallback(async (userId: string, trigger: string) => {
    try {
      console.log(`Trigger automático: ${trigger} para usuário ${userId}`);
      
      // Verificar se já foi feita análise recente
      const { data: recentAnalysis } = await supabase
        .from('preventive_health_analyses')
        .select('created_at')
        .eq('user_id', userId)
        .eq('analysis_type', 'sofia_tracking_analysis')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .limit(1);

      // Se não há análise recente, fazer nova análise
      if (!recentAnalysis || recentAnalysis.length === 0) {
        return await performAnalysis(userId, 'automatic');
      }
      
      return null;
    } catch (error) {
      console.error('Erro em análise automática:', error);
      return null;
    }
  }, [performAnalysis]);

  // Detectar anomalias em tempo real
  const detectAnomalies = useCallback(async (userId: string, newData: any) => {
    try {
      // Buscar dados recentes para comparação
      const { data: recentData } = await supabase
        .from('daily_advanced_tracking')
        .select('*')
        .eq('user_id', userId)
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });

      if (!recentData || recentData.length < 3) {
        return []; // Poucos dados para detectar anomalias
      }

      const anomalies = [];

      // Detectar anomalias simples baseadas em desvios
      const avgScore = recentData.reduce((sum, item) => sum + (item.daily_score || 0), 0) / recentData.length;
      if (newData.daily_score && Math.abs(newData.daily_score - avgScore) > 30) {
        anomalies.push(`Score diário ${newData.daily_score < avgScore ? 'muito baixo' : 'muito alto'} comparado à média`);
      }

      const avgWater = recentData.reduce((sum, item) => sum + (item.water_current_ml || 0), 0) / recentData.length;
      if (newData.water_current_ml && Math.abs(newData.water_current_ml - avgWater) > 500) {
        anomalies.push(`Consumo de água ${newData.water_current_ml < avgWater ? 'muito baixo' : 'muito alto'}`);
      }

      if (anomalies.length > 0) {
        toast({
          title: "🚨 Sofia Detectou Anomalias",
          description: `${anomalies.length} padrão(ões) atípico(s) identificado(s)`,
          variant: "destructive",
          duration: 7000,
        });
      }

      return anomalies;
      
    } catch (error) {
      console.error('Erro na detecção de anomalias:', error);
      return [];
    }
  }, [toast]);

  // Obter insights específicos por categoria
  const getCategoryInsights = useCallback((analysis: AnalysisResult | null, category: string) => {
    if (!analysis) return null;
    
    const categoryMap: { [key: string]: keyof AnalysisResult['patterns'] } = {
      sleep: 'sleep_patterns',
      water: 'water_patterns',
      mood: 'mood_patterns',
      exercise: 'exercise_patterns',
      weight: 'weight_patterns',
      food: 'food_patterns'
    };
    
    const patternKey = categoryMap[category];
    if (!patternKey) return null;
    
    return {
      pattern: analysis.patterns[patternKey],
      relevantInsights: analysis.insights.filter(insight => 
        insight.toLowerCase().includes(category)
      ),
      relevantRecommendations: analysis.recommendations.filter(rec => 
        rec.toLowerCase().includes(category)
      ),
      relevantTips: analysis.personalized_tips.filter(tip => 
        tip.toLowerCase().includes(category)
      )
    };
  }, []);

  return {
    // Estados
    isAnalyzing,
    currentAnalysis,
    analysisHistory,
    error,
    
    // Ações principais
    performAnalysis,
    loadAnalysisHistory,
    getSofiaKnowledge,
    
    // Análise automática
    triggerAutomaticAnalysis,
    detectAnomalies,
    
    // Utilitários
    getCategoryInsights,
    
    // Limpar estado
    clearError: () => setError(null),
    clearAnalysis: () => setCurrentAnalysis(null)
  };
};