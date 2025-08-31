import { useEffect, useState } from 'react';
import { supabase } from '../integrations/supabase/client';
import type { Database } from '../integrations/supabase/types';

export type WeightMeasurement = Database['public']['Tables']['weight_measurements']['Row'];
type UserGoal = Database['public']['Tables']['user_goals']['Row'];

interface ProgressData {
  weightHistory: { date: string; value: number }[];
  bodyComposition: { date: string; fat: number; muscle: number }[];
  bmiHistory: { date: string; value: number }[];
}

export function useProgressData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ProgressData | null>(null);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [weightTrend, setWeightTrend] = useState<number | null>(null);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bodyFat, setBodyFat] = useState<{ value: number; trend: number } | null>(null);
  const [muscleMass, setMuscleMass] = useState<{ value: number; trend: number } | null>(null);
  const [measurementDays, setMeasurementDays] = useState(0);
  const [metabolicAge, setMetabolicAge] = useState<{ value: number; trend: number } | null>(null);
  const [recentActivity, setRecentActivity] = useState(0);
  const [weightGoal, setWeightGoal] = useState<number | null>(null);
  const [predictions, setPredictions] = useState<{
    goalDate?: string;
    confidence: number;
    nextMilestone?: { value: number; date: string };
    recommendations: string[];
    riskFactors: string[];
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Buscar medições com cálculo automático de IMC
        const { data: measurements, error: measurementsError } = await supabase
          .from('weight_measurements')
          .select('*')
          .order('measurement_date', { ascending: true });

        if (measurementsError) throw measurementsError;

        // Buscar dados físicos para cálculo de IMC
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const { data: physicalData, error: physicalError } = await supabase
          .from('user_physical_data')
          .select('altura_cm')
          .eq('user_id', user.id)
          .single();

        if (physicalError && physicalError.code !== 'PGRST116') throw physicalError;

        // Buscar metas
        const { data: goals, error: goalsError } = await supabase
          .from('user_goals')
          .select('*')
          .eq('status', 'ativo')
          .limit(1)
          .order('created_at', { ascending: false });

        if (goalsError) throw goalsError;

        if (!measurements?.length) {
          setLoading(false);
          return;
        }

        // CALCULOS AUTOMÁTICOS - Ajuste automático dos gráficos
        const processedMeasurements = measurements.map(m => {
          // Calcular IMC automaticamente se não existir
          let imc = m.imc;
          if (!imc && physicalData?.altura_cm) {
            const alturaMetros = physicalData.altura_cm / 100;
            imc = m.peso_kg / (alturaMetros * alturaMetros);
          }

          // Calcular risco metabólico automaticamente
          let risco_metabolico = m.risco_metabolico;
          if (!risco_metabolico && imc) {
            if (imc < 18.5) risco_metabolico = 'baixo_peso';
            else if (imc < 25) risco_metabolico = 'normal';
            else if (imc < 30) risco_metabolico = 'sobrepeso';
            else if (imc < 35) risco_metabolico = 'obesidade_grau1';
            else if (imc < 40) risco_metabolico = 'obesidade_grau2';
            else risco_metabolico = 'obesidade_grau3';
          }

          return {
            ...m,
            imc,
            risco_metabolico
          };
        });

        // Processar dados históricos com cálculos automáticos
        const weightHistory = processedMeasurements.map(m => ({
          date: m.measurement_date || '',
          value: m.peso_kg
        }));

        const bodyComposition = processedMeasurements.map(m => ({
          date: m.measurement_date || '',
          fat: m.gordura_corporal_percent || 0,
          muscle: m.massa_muscular_kg || 0
        }));

        const bmiHistory = processedMeasurements.map(m => ({
          date: m.measurement_date || '',
          value: m.imc || 0
        }));

        // Calcular métricas atuais com tendências automáticas
        const latest = processedMeasurements[processedMeasurements.length - 1];
        const previousWeek = processedMeasurements.find(m => {
          const date = new Date(m.measurement_date || '');
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date >= weekAgo;
        });

        // Cálculo automático de tendências
        setCurrentWeight(latest.peso_kg);
        setWeightTrend(previousWeek ? latest.peso_kg - previousWeek.peso_kg : 0);
        setBmi(latest.imc || 0);
        setBodyFat({
          value: latest.gordura_corporal_percent || 0,
          trend: previousWeek ? (latest.gordura_corporal_percent || 0) - (previousWeek.gordura_corporal_percent || 0) : 0
        });
        setMuscleMass({
          value: latest.massa_muscular_kg || 0,
          trend: previousWeek ? (latest.massa_muscular_kg || 0) - (previousWeek.massa_muscular_kg || 0) : 0
        });
        setMetabolicAge({
          value: latest.idade_metabolica || 0,
          trend: previousWeek ? (latest.idade_metabolica || 0) - (previousWeek.idade_metabolica || 0) : 0
        });

        // Calcular dias de acompanhamento automaticamente
        const firstDate = new Date(processedMeasurements[0].measurement_date || '');
        const lastDate = new Date(latest.measurement_date || '');
        const days = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
        setMeasurementDays(days);

        // Calcular atividade recente automaticamente
        const recentMeasurements = processedMeasurements.filter(m => {
          const date = new Date(m.measurement_date || '');
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return date >= weekAgo;
        });
        setRecentActivity(recentMeasurements.length);

        // Cálculo automático de previsões e metas
        if (goals?.length) {
          setWeightGoal(goals[0].target_value || null);

          if (goals[0].target_value) {
            // Cálculo automático de previsões
            const weightChange = latest.peso_kg - processedMeasurements[0].peso_kg;
            const timeElapsed = days;
            const dailyRate = weightChange / timeElapsed;
            const remainingWeight = goals[0].target_value - latest.peso_kg;
            const daysToGoal = Math.abs(remainingWeight / dailyRate);

            const goalDate = new Date();
            goalDate.setDate(goalDate.getDate() + daysToGoal);

            const nextMilestone = {
              value: latest.peso_kg + (dailyRate > 0 ? 1 : -1),
              date: new Date(goalDate.setDate(goalDate.getDate() + (1 / Math.abs(dailyRate))))
                .toISOString()
            };

            setPredictions({
              goalDate: goalDate.toISOString(),
              confidence: calculateConfidence(processedMeasurements.length, Math.abs(dailyRate)),
              nextMilestone,
              recommendations: generateRecommendations(latest, dailyRate, recentMeasurements.length),
              riskFactors: identifyRiskFactors(latest, dailyRate, recentMeasurements.length)
            });
          }
        }

        setData({
          weightHistory,
          bodyComposition,
          bmiHistory
        });

        setLoading(false);
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar dados de progresso');
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    currentWeight,
    weightTrend,
    bmi,
    bodyFat,
    muscleMass,
    measurementDays,
    metabolicAge,
    recentActivity,
    weightGoal,
    predictions
  };
}

// Funções auxiliares para cálculos automáticos
function calculateBMI(weight: number, height: number): number {
  return weight / (height * height);
}

function calculateConfidence(measurementCount: number, dailyRate: number): number {
  // Quanto mais medições e mais consistente a taxa de mudança, maior a confiança
  const measurementFactor = Math.min(measurementCount / 30, 1); // Máximo com 30 medições
  const rateFactor = Math.min(Math.abs(dailyRate) / 0.1, 1); // Taxa ideal ~100g por dia
  return Math.round((measurementFactor * 0.7 + rateFactor * 0.3) * 100);
}

function generateRecommendations(
  latest: WeightMeasurement,
  dailyRate: number,
  recentMeasurements: number
): string[] {
  const recommendations: string[] = [];

  if (recentMeasurements < 3) {
    recommendations.push('Aumente a frequência de medições para melhor acompanhamento');
  }

  if (Math.abs(dailyRate) > 0.2) {
    recommendations.push('Mantenha uma taxa de mudança mais gradual para resultados sustentáveis');
  }

  if (latest.gordura_corporal_percent && latest.gordura_corporal_percent > 25) {
    recommendations.push('Foque em exercícios de força para melhorar a composição corporal');
  }

  recommendations.push('Mantenha-se hidratado para otimizar seus resultados');
  recommendations.push('Priorize o sono para melhor recuperação');

  return recommendations;
}

function identifyRiskFactors(
  latest: WeightMeasurement,
  dailyRate: number,
  recentMeasurements: number
): string[] {
  const risks: string[] = [];

  if (Math.abs(dailyRate) > 0.3) {
    risks.push('Taxa de mudança muito acelerada');
  }

  if (recentMeasurements < 2) {
    risks.push('Dados insuficientes para análise precisa');
  }

  if (latest.idade_metabolica && latest.idade_metabolica > latest.idade_metabolica + 5) {
    risks.push('Idade metabólica elevada');
  }

  return risks;
} 