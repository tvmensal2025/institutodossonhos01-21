import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SymptomMapping {
  id: string;
  user_id: string;
  assessment_date: string;
  total_score: number;
  system_scores: any; // Using any instead of Record<string, any> to match database type
  created_at: string;
}

export interface EvolutionDataPoint {
  date: string;
  score: number;
  month: string;
}

export const useSymptomHistory = (userId?: string) => {
  const [history, setHistory] = useState<SymptomMapping[]>([]);
  const [evolutionData, setEvolutionData] = useState<EvolutionDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const fetchHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        // Since the health_symptom_mappings table doesn't exist, return empty data
        setHistory([]);

        // Preparar dados para o gráfico de evolução (empty since no data)
        const evolutionPoints: EvolutionDataPoint[] = [];
        setEvolutionData([]);
      } catch (err) {
        console.error('Error fetching symptom history:', err);
        setError(err instanceof Error ? err.message : 'Erro ao carregar histórico');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  const getLatestMapping = (): SymptomMapping | null => {
    if (history.length === 0) return null;
    return history[history.length - 1];
  };

  const getPreviousMapping = (): SymptomMapping | null => {
    if (history.length < 2) return null;
    return history[history.length - 2];
  };

  const getTrend = (): 'improving' | 'worsening' | 'stable' | 'no_data' => {
    const latest = getLatestMapping();
    const previous = getPreviousMapping();
    
    if (!latest || !previous) return 'no_data';
    
    const diff = latest.total_score - previous.total_score;
    
    if (diff < -5) return 'improving'; // Diminuiu mais de 5 pontos
    if (diff > 5) return 'worsening';  // Aumentou mais de 5 pontos
    return 'stable';
  };

  const getSystemEvolution = (systemName: string): EvolutionDataPoint[] => {
    return history.map(mapping => {
      const systemScore = mapping.system_scores[systemName]?.score || 0;
      const date = new Date(mapping.assessment_date);
      const monthNames = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 
                        'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      
      return {
        date: mapping.assessment_date,
        score: systemScore,
        month: monthNames[date.getMonth()]
      };
    });
  };

  return {
    history,
    evolutionData,
    loading,
    error,
    getLatestMapping,
    getPreviousMapping,
    getTrend,
    getSystemEvolution
  };
};