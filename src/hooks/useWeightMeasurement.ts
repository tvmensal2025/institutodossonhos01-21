import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BodyMetricsCalculator } from '@/services/BodyMetricsCalculator';

export interface WeightMeasurement {
  id: string;
  peso_kg: number;
  gordura_corporal_percent?: number;
  gordura_visceral?: number;
  massa_muscular_kg?: number;
  agua_corporal_percent?: number;
  osso_kg?: number;
  metabolismo_basal_kcal?: number;
  idade_metabolica?: number;
  risco_metabolico?: string;
  imc?: number;
  circunferencia_abdominal_cm?: number;
  circunferencia_braco_cm?: number;
  circunferencia_perna_cm?: number;
  device_type: string;
  notes?: string;
  measurement_date: string;
  created_at: string;
}

export interface UserPhysicalData {
  id: string;
  user_id: string;
  altura_cm: number;
  idade: number;
  sexo: string;
  nivel_atividade: string;
  created_at: string;
  updated_at: string;
}

export interface WeeklyAnalysis {
  id: string;
  user_id: string;
  week_start_date: string;
  week_end_date: string;
  summary_data?: any;
  insights?: string[];
  recommendations?: string[];
  overall_score?: number;
  trends?: any;
  goals_progress?: any;
  health_metrics?: any;
  created_at: string;
}

export const useWeightMeasurement = () => {
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [physicalData, setPhysicalData] = useState<UserPhysicalData | null>(null);
  const [weeklyAnalyses, setWeeklyAnalyses] = useState<WeeklyAnalysis[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataFreshness, setDataFreshness] = useState<Date>(new Date());
  const { toast } = useToast();

  // Tipos auxiliares e utilitários
  type DerivedMetrics = {
    imc: number;
    risco_metabolico: string;
    // Os campos abaixo só refletem o QUE FOI MEDIDO; sem estimativas
    gordura_corporal_percent?: number;
    agua_corporal_percent?: number;
    massa_muscular_kg?: number;
    metabolismo_basal_kcal?: number;
    idade_metabolica?: number;
    rce?: number;
    risco_cardiometabolico?: 'BAIXO' | 'MODERADO' | 'ALTO';
  };

  const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
  const almostEqual = (a: number | undefined | null, b: number | undefined | null, eps = 0.1) => {
    if (a == null || b == null) return false;
    return Math.abs(a - b) <= eps;
  };

  // Usa o novo serviço centralizado para cálculos padronizados
  const computeDerivedMetrics = (measurement: WeightMeasurement, physical: UserPhysicalData): DerivedMetrics => {
    const device = (measurement.device_type || '').toLowerCase();
    const isManual = ['manual', 'digital_scale', 'professional_evaluation'].includes(device) || ((measurement as any).measurement_type === 'manual');

    // Converter dados para o formato do calculador
    const physicalData = {
      altura_cm: Number(physical.altura_cm || 0),
      idade: Number(physical.idade || 0),
      sexo: (physical.sexo || 'masculino').toLowerCase() as 'masculino' | 'feminino'
    };

    const bodyMeasurement = {
      peso_kg: Number(measurement.peso_kg || 0),
      circunferencia_abdominal_cm: Number(measurement.circunferencia_abdominal_cm || 0) || undefined,
      gordura_corporal_percent: measurement.gordura_corporal_percent ? Number(measurement.gordura_corporal_percent) : undefined,
      agua_corporal_percent: measurement.agua_corporal_percent ? Number(measurement.agua_corporal_percent) : undefined,
      massa_muscular_kg: measurement.massa_muscular_kg ? Number(measurement.massa_muscular_kg) : undefined,
      osso_kg: measurement.osso_kg ? Number(measurement.osso_kg) : undefined,
      metabolismo_basal_kcal: measurement.metabolismo_basal_kcal ? Number(measurement.metabolismo_basal_kcal) : undefined
    };

    // Calcular métricas usando o serviço padronizado
    const calculatedMetrics = BodyMetricsCalculator.calculateMetrics(bodyMeasurement, physicalData, isManual);

    return {
      imc: calculatedMetrics.imc,
      risco_metabolico: calculatedMetrics.risco_metabolico,
      gordura_corporal_percent: calculatedMetrics.gordura_corporal_percent,
      agua_corporal_percent: calculatedMetrics.agua_corporal_percent,
      massa_muscular_kg: calculatedMetrics.massa_muscular_kg,
      metabolismo_basal_kcal: calculatedMetrics.metabolismo_basal_kcal,
      idade_metabolica: calculatedMetrics.idade_metabolica,
      rce: calculatedMetrics.rce,
      risco_cardiometabolico: calculatedMetrics.risco_cardiometabolico,
    };
  };

  // Buscar dados físicos do usuário com cache
  const fetchPhysicalData = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Usuário não autenticado');
        return;
      }

      const { data, error } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setPhysicalData(null);
          return;
        }
        throw error;
      }

      setPhysicalData(data);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Salvar dados físicos do usuário
  const savePhysicalData = async (data: Omit<UserPhysicalData, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: result, error } = await supabase
        .from('user_physical_data')
        .upsert({
          user_id: user.id,
          ...data
        })
        .select()
        .single();

      if (error) throw error;
      setPhysicalData(result);
      toast({ title: 'Dados salvos!', description: 'Seus dados físicos foram salvos com sucesso.' });
      return result;
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Erro', description: 'Erro ao salvar dados físicos: ' + err.message, variant: 'destructive' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Salvar medição de peso
  const saveMeasurement = async (measurement: Omit<WeightMeasurement, 'id' | 'measurement_date' | 'created_at'>) => {
    try {
      if (loading) throw new Error('Salvamento já em andamento');
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      if (!physicalData) {
        await fetchPhysicalData();
        if (!physicalData) throw new Error('Cadastre seus dados físicos (altura, idade, sexo) primeiro');
      }

      if (!measurement.peso_kg || measurement.peso_kg <= 0) throw new Error('Peso é obrigatório e deve ser maior que zero');

      // Preparar dados, adicionando cálculos automáticos apenas para medições manuais
      let measurementData: any = {
        user_id: user.id,
        ...measurement,
        measurement_date: new Date().toISOString()
      };

      // Se for manual, calcular métricas complementares ausentes
      const device = (measurement.device_type || '').toLowerCase();
      const isManual = ['manual', 'digital_scale', 'professional_evaluation'].includes(device) || ((measurement as any).measurement_type === 'manual');
      if (isManual && physicalData) {
        const derived = computeDerivedMetrics({ ...(measurement as any), device_type: 'manual' } as WeightMeasurement, physicalData);
        if (derived.gordura_corporal_percent != null) {
          measurementData.gordura_corporal_percent = parseFloat(derived.gordura_corporal_percent.toFixed(1));
        }
        if (derived.agua_corporal_percent != null) {
          measurementData.agua_corporal_percent = parseFloat(derived.agua_corporal_percent.toFixed(1));
        }
        if (derived.metabolismo_basal_kcal != null) {
          measurementData.metabolismo_basal_kcal = derived.metabolismo_basal_kcal;
        }
        if (derived.idade_metabolica != null) {
          measurementData.idade_metabolica = derived.idade_metabolica;
        }
        // IMC e risco também podem ser enviados; o banco recalcula de qualquer forma
        measurementData.imc = parseFloat(derived.imc.toFixed(2));
        measurementData.risco_metabolico = derived.risco_metabolico;
        if (derived.rce != null) (measurementData as any).rce = parseFloat(derived.rce.toFixed(3));
        if (derived.risco_cardiometabolico) (measurementData as any).risco_cardiometabolico = derived.risco_cardiometabolico;
      }

      const { data, error } = await supabase
        .from('weight_measurements')
        .insert(measurementData)
        .select()
        .single();

      if (error) throw error;

      setMeasurements(prev => [data, ...prev].slice(0, 30));
      setDataFreshness(new Date());
      fetchWeeklyAnalysis().catch(console.error);

      const riskMessages = {
        'baixo_peso': 'Seu IMC indica baixo peso. Considere consultar um profissional.',
        'normal': 'Parabéns! Seu IMC está dentro do ideal.',
        'sobrepeso': 'Seu IMC indica sobrepeso. Continue se cuidando!',
        'obesidade_grau1': 'Seu IMC indica obesidade grau I. Busque orientação profissional.',
        'obesidade_grau2': 'Seu IMC indica obesidade grau II. Recomendamos acompanhamento médico.',
        'obesidade_grau3': 'Seu IMC indica obesidade grau III. Procure acompanhamento médico urgente.'
      } as const;

      toast({
        title: 'Pesagem salva!',
        description: `Peso: ${data.peso_kg}kg | IMC: ${data.imc?.toFixed(1)} | ${riskMessages[(data.risco_metabolico || 'normal') as keyof typeof riskMessages] || 'Pesagem registrada com sucesso'}`,
        duration: 5000,
      });

      return data;
    } catch (err: any) {
      setError(err.message);
      toast({ title: 'Erro', description: err.message, variant: 'destructive' });
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Buscar histórico de pesagens com cache inteligente
  const fetchMeasurements = useCallback(async (limit = 30, forceRefresh = false) => {
    try {
      if (!forceRefresh && measurements.length > 0) {
        const lastFetch = dataFreshness.getTime();
        const now = new Date().getTime();
        const fiveMinutes = 5 * 60 * 1000;
        if (now - lastFetch < fiveMinutes) return;
      }

      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setMeasurements(data || []);
      setDataFreshness(new Date());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [measurements.length, dataFreshness]);

  // Buscar análise semanal (simplificado)
  const fetchWeeklyAnalysis = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('weekly_analyses')
        .select('id, user_id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(8);

      if (error) throw error;
      const transformed = (data || []).map(item => ({
        ...item,
        week_start_date: item.created_at,
        week_end_date: item.created_at,
        summary_data: {},
        insights: [],
        recommendations: [],
        overall_score: 0,
        trends: {},
        goals_progress: {},
        health_metrics: {}
      }));
      setWeeklyAnalyses(transformed);
      return data;
    } catch (err: any) {
      setError(err.message);
      return [];
    }
  }, []);

  // Estatísticas para UI
  const stats = useMemo(() => {
    if (measurements.length === 0) return null;
    const latest = measurements[0];
    const previous = measurements[1];
    const calculatedIMC = latest.imc || (physicalData ? (latest.peso_kg / Math.pow(physicalData.altura_cm / 100, 2)) : 0);
    
    // CORREÇÃO: Cálculo de massa magra com limites realistas
    let leanMassFallback: number | undefined;
    if (latest.gordura_corporal_percent != null && latest.peso_kg != null) {
      // Aplicar limites realistas para gordura corporal antes de calcular massa magra
      const gorduraRealista = Math.max(5, Math.min(50, latest.gordura_corporal_percent));
      leanMassFallback = latest.peso_kg * (1 - (gorduraRealista / 100));
      // Garantir que a massa magra seja pelo menos 30% do peso corporal
      const massaMagraMinima = latest.peso_kg * 0.3;
      leanMassFallback = Math.max(massaMagraMinima, leanMassFallback);
    }

    return {
      currentWeight: parseFloat(latest.peso_kg.toFixed(1)),
      currentIMC: parseFloat(calculatedIMC.toFixed(1)),
      weightChange: previous ? parseFloat((latest.peso_kg - previous.peso_kg).toFixed(1)) : 0,
      trend: previous ? (latest.peso_kg > previous.peso_kg ? 'increasing' : latest.peso_kg < previous.peso_kg ? 'decreasing' : 'stable') : 'stable',
      riskLevel: latest.risco_metabolico,
      totalMeasurements: measurements.length,
      averageWeight: parseFloat((measurements.reduce((sum, m) => sum + m.peso_kg, 0) / measurements.length).toFixed(1)),
      bodyFat: latest.gordura_corporal_percent ? parseFloat(latest.gordura_corporal_percent.toFixed(1)) : 0,
      muscleMass: latest.massa_muscular_kg != null
        ? parseFloat(latest.massa_muscular_kg.toFixed(1))
        : (leanMassFallback != null ? parseFloat(leanMassFallback.toFixed(1)) : 0),
      bodyWater: latest.agua_corporal_percent ? parseFloat(latest.agua_corporal_percent.toFixed(1)) : 0,
      metabolism: latest.metabolismo_basal_kcal || 0,
      metabolicAge: latest.idade_metabolica || 0,
      visceralFat: latest.gordura_visceral || 0
    };
  }, [measurements, physicalData]);

  // Reconciliação: garantir consistência entre DB e UI para o último registro
  const reconcileLatestMeasurement = useCallback(async () => {
    try {
      if (!physicalData || measurements.length === 0) return;
      const latest = measurements[0];
      const derived = computeDerivedMetrics(latest, physicalData);
      const device = (latest.device_type || '').toLowerCase();
      const isManual = ['manual', 'digital_scale', 'professional_evaluation'].includes(device) || ((latest as any).measurement_type === 'manual');

      const updates: Partial<WeightMeasurement & { rce?: number; risco_cardiometabolico?: string; }> = {};
      if (!almostEqual(latest.imc, derived.imc, 0.01)) updates.imc = Number(derived.imc.toFixed(2));
      if ((latest.risco_metabolico || '') !== derived.risco_metabolico) updates.risco_metabolico = derived.risco_metabolico;
      // Só preencher métricas de composição automaticamente se for medição manual e se houver valor derivado
      if (isManual && derived.gordura_corporal_percent != null && !almostEqual(latest.gordura_corporal_percent, derived.gordura_corporal_percent, 0.5)) {
        updates.gordura_corporal_percent = Number(derived.gordura_corporal_percent.toFixed(1));
      }
      if (isManual && derived.agua_corporal_percent != null && !almostEqual(latest.agua_corporal_percent, derived.agua_corporal_percent, 0.5)) {
        updates.agua_corporal_percent = Number(derived.agua_corporal_percent.toFixed(1));
      }
      // Massa muscular continua apenas se tiver sido informada (não estimamos)
      if (isManual && derived.massa_muscular_kg != null && !almostEqual(latest.massa_muscular_kg, derived.massa_muscular_kg, 0.5)) {
        updates.massa_muscular_kg = Number(derived.massa_muscular_kg.toFixed(1));
      }
      if (isManual && derived.metabolismo_basal_kcal != null && !almostEqual(latest.metabolismo_basal_kcal, derived.metabolismo_basal_kcal, 10)) {
        updates.metabolismo_basal_kcal = derived.metabolismo_basal_kcal;
      }
      if (isManual && derived.idade_metabolica != null && !almostEqual(latest.idade_metabolica, derived.idade_metabolica, 1)) {
        updates.idade_metabolica = derived.idade_metabolica;
      }
      if (derived.rce != null && !almostEqual((latest as any).rce, derived.rce, 0.01)) (updates as any).rce = Number(derived.rce.toFixed(3));
      if (derived.risco_cardiometabolico && (latest as any).risco_cardiometabolico !== derived.risco_cardiometabolico) (updates as any).risco_cardiometabolico = derived.risco_cardiometabolico;

      if (Object.keys(updates).length === 0) return;

      const { data, error } = await supabase
        .from('weight_measurements')
        .update(updates)
        .eq('id', latest.id)
        .select()
        .single();
      if (error) throw error;
      if (data) setMeasurements(prev => [data as WeightMeasurement, ...prev.slice(1)]);
    } catch (err) {
      // Melhor-esforço, não interrompe a UI
      console.log('Reconciliação falhou:', err);
    }
  }, [measurements, physicalData]);

  // Carregar dados iniciais
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (!isMounted) return;
      try {
        await Promise.all([
          fetchPhysicalData(),
          fetchMeasurements(),
          fetchWeeklyAnalysis()
        ]);
      } catch (e) {
        if (isMounted) console.error('Erro ao carregar dados iniciais:', e);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [fetchPhysicalData, fetchMeasurements, fetchWeeklyAnalysis]);

  // Rodar reconciliação quando tivermos dados físicos + última medição
  useEffect(() => {
    reconcileLatestMeasurement();
  }, [reconcileLatestMeasurement]);

  return {
    measurements,
    physicalData,
    weeklyAnalyses,
    loading,
    error,
    stats,
    saveMeasurement,
    savePhysicalData,
    fetchMeasurements,
    fetchPhysicalData,
    fetchWeeklyAnalysis
  };
};