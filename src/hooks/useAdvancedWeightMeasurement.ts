import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface WeightMeasurement {
  id?: string;
  user_id: string;
  peso_kg: number;
  circunferencia_abdominal_cm: number;
  measurement_date: string;
  measurement_time?: string;
  measurement_type: 'balanca' | 'manual';
  
  // Dados calculados
  imc?: number;
  rce?: number;
  risco_cardiometabolico?: 'BAIXO' | 'MODERADO' | 'ALTO';
  classificacao_imc?: string;
  
  // Bioimpedância (opcional)
  gordura_corporal_percent?: number;
  massa_muscular_kg?: number;
  massa_magra_kg?: number;
  agua_corporal_percent?: number;
  agua_corporal_litros?: number;
  massa_ossea_kg?: number;
  metabolismo_basal_kcal?: number;
  idade_metabolica?: number;
  
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserPhysicalProfile {
  id?: string;
  user_id: string;
  altura_cm: number;
  idade?: number;
  sexo: 'masculino' | 'feminino';
  nivel_atividade?: 'sedentario' | 'leve' | 'moderado' | 'intenso' | 'muito_intenso';
  objetivo?: 'perder_peso' | 'ganhar_massa' | 'manter_peso' | 'melhorar_saude';
  peso_objetivo_kg?: number;
  created_at?: string;
  updated_at?: string;
}

export interface HealthStats {
  currentWeight: number;
  currentIMC: number;
  currentRCE: number;
  currentRisk: string;
  weightTrend: 'up' | 'down' | 'stable';
  weightChange: number;
  totalMeasurements: number;
  avgWeightLast30Days: number;
  avgRCELast30Days: number;
}

export const useAdvancedWeightMeasurement = (userId?: string) => {
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [userProfile, setUserProfile] = useState<UserPhysicalProfile | null>(null);
  const [stats, setStats] = useState<HealthStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Carrega perfil do usuário
  const loadUserProfile = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') { // Ignora erro de "não encontrado"
        throw error;
      }

      setUserProfile(data as UserPhysicalProfile);
      return data;
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
      setError('Erro ao carregar perfil do usuário');
      return null;
    }
  };

  // Carrega medições do usuário
  const loadMeasurements = async (targetUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', targetUserId)
        .order('measurement_date', { ascending: false })
        .order('measurement_time', { ascending: false });

      if (error) throw error;

      setMeasurements((data || []).map(item => ({
        ...item,
        measurement_type: (item as any).measurement_type || 'manual'
      })) as WeightMeasurement[]);
      return data || [];
    } catch (err) {
      console.error('Erro ao carregar medições:', err);
      setError('Erro ao carregar medições');
      return [];
    }
  };

  // Calcula estatísticas
  const calculateStats = (measurementData: WeightMeasurement[]): HealthStats | null => {
    if (measurementData.length === 0) return null;

    const latest = measurementData[0];
    const previous = measurementData[1];
    
    // Últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const last30Days = measurementData.filter(m => 
      new Date(m.measurement_date) >= thirtyDaysAgo
    );

    const weightChange = previous ? latest.peso_kg - previous.peso_kg : 0;
    const weightTrend = weightChange > 0.5 ? 'up' : weightChange < -0.5 ? 'down' : 'stable';

    const avgWeight = last30Days.length > 0 
      ? last30Days.reduce((sum, m) => sum + m.peso_kg, 0) / last30Days.length 
      : latest.peso_kg;

    const avgRCE = last30Days.length > 0 
      ? last30Days.reduce((sum, m) => sum + (m.rce || 0), 0) / last30Days.length 
      : (latest.rce || 0);

    return {
      currentWeight: latest.peso_kg,
      currentIMC: latest.imc || 0,
      currentRCE: latest.rce || 0,
      currentRisk: latest.risco_cardiometabolico || 'BAIXO',
      weightTrend,
      weightChange,
      totalMeasurements: measurementData.length,
      avgWeightLast30Days: avgWeight,
      avgRCELast30Days: avgRCE
    };
  };

  // Adiciona nova medição
  const addMeasurement = async (measurement: Omit<WeightMeasurement, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('weight_measurements')
        .insert([measurement])
        .select()
        .single();

      if (error) throw error;

      // Recarrega dados
      if (userId) {
        const newMeasurements = await loadMeasurements(userId);
        setStats(calculateStats(newMeasurements.map(item => ({
          ...item,
          measurement_type: (item as any).measurement_type || 'manual'
        })) as WeightMeasurement[]));
      }

      return data;
    } catch (err) {
      console.error('Erro ao adicionar medição:', err);
      setError('Erro ao salvar medição');
      throw err;
    }
  };

  // Atualiza perfil do usuário
  const updateUserProfile = async (profile: Partial<UserPhysicalProfile>) => {
    if (!userId) return null;

    try {
      // Map the profile to match database schema
      const dbProfile = {
        user_id: userId,
        altura_cm: profile.altura_cm || 170,
        idade: profile.idade || 30,
        sexo: profile.sexo || 'masculino',
        nivel_atividade: profile.nivel_atividade || 'moderado'
      };

      const { data, error } = await supabase
        .from('user_physical_data')
        .upsert([dbProfile])
        .select()
        .single();

      if (error) throw error;

      setUserProfile(data as UserPhysicalProfile);
      return data;
    } catch (err) {
      console.error('Erro ao atualizar perfil:', err);
      setError('Erro ao atualizar perfil');
      throw err;
    }
  };

  // Remove medição
  const deleteMeasurement = async (measurementId: string) => {
    try {
      const { error } = await supabase
        .from('weight_measurements')
        .delete()
        .eq('id', measurementId);

      if (error) throw error;

      // Recarrega dados
      if (userId) {
        const newMeasurements = await loadMeasurements(userId);
        setStats(calculateStats(newMeasurements.map(item => ({
          ...item,
          measurement_type: (item as any).measurement_type || 'manual'
        })) as WeightMeasurement[]));
      }
    } catch (err) {
      console.error('Erro ao deletar medição:', err);
      setError('Erro ao deletar medição');
      throw err;
    }
  };

  // Carrega dados quando userId muda
  useEffect(() => {
    const loadData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [profile, measurementData] = await Promise.all([
          loadUserProfile(userId),
          loadMeasurements(userId)
        ]);

        setStats(calculateStats(measurementData.map(item => ({
          ...item,
          measurement_type: (item as any).measurement_type || 'manual'
        })) as WeightMeasurement[]));
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userId]);

  return {
    measurements,
    userProfile,
    stats,
    loading,
    error,
    addMeasurement,
    updateUserProfile,
    deleteMeasurement,
    refresh: () => userId && loadMeasurements(userId)
  };
};

// Hook para análise de risco cardiometabólico
export const useCardiometabolicRisk = (rce: number, imc: number, age: number, gender: 'M' | 'F') => {
  const [riskAnalysis, setRiskAnalysis] = useState<{
    level: 'BAIXO' | 'MODERADO' | 'ALTO';
    score: number;
    factors: string[];
    recommendations: string[];
    color: string;
  } | null>(null);

  useEffect(() => {
    const analyzeRisk = () => {
      let score = 0;
      const factors: string[] = [];
      const recommendations: string[] = [];

      // Análise RCE
      if (rce >= 0.6) {
        score += 3;
        factors.push('RCE elevado (≥0.6)');
        recommendations.push('Reduzir circunferência abdominal');
      } else if (rce >= 0.5) {
        score += 2;
        factors.push('RCE moderado (0.5-0.6)');
        recommendations.push('Monitorar circunferência abdominal');
      }

      // Análise IMC
      if (imc >= 30) {
        score += 2;
        factors.push('Obesidade (IMC ≥30)');
        recommendations.push('Programa de perda de peso supervisionado');
      } else if (imc >= 25) {
        score += 1;
        factors.push('Sobrepeso (IMC 25-30)');
        recommendations.push('Controle de peso');
      }

      // Análise por idade
      if (age >= 60) {
        score += 1;
        factors.push('Idade avançada (≥60 anos)');
        recommendations.push('Acompanhamento médico regular');
      } else if (age >= 45) {
        score += 0.5;
        factors.push('Idade de risco moderado (45-60 anos)');
      }

      // Recomendações gerais
      if (score >= 4) {
        recommendations.push('Consulta cardiológica urgente');
        recommendations.push('Exames laboratoriais completos');
      } else if (score >= 2) {
        recommendations.push('Consulta médica de rotina');
        recommendations.push('Atividade física regular');
      } else {
        recommendations.push('Manter hábitos saudáveis');
        recommendations.push('Monitoramento anual');
      }

      const level = score >= 4 ? 'ALTO' : score >= 2 ? 'MODERADO' : 'BAIXO';
      const color = level === 'ALTO' ? '#ef4444' : level === 'MODERADO' ? '#f59e0b' : '#22c55e';

      setRiskAnalysis({
        level,
        score,
        factors,
        recommendations,
        color
      });
    };

    analyzeRisk();
  }, [rce, imc, age, gender]);

  return riskAnalysis;
};