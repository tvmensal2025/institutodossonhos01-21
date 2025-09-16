import React, { useState, useEffect, Suspense } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Heart, Activity, Droplets, Target, TrendingUp, Scale, Zap, Calendar, Award, Timer, Bluetooth, MessageCircle, Bot, Utensils } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { XiaomiScaleFlow } from '@/components/XiaomiScaleFlow';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { useUserGender } from '@/hooks/useUserGender';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { PersonIcon, BodyCompositionIcon, HealthIndicatorIcon } from '@/components/ui/person-icon';
import { BodyEvolutionChart } from './BodyEvolutionChart';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { useNavigate } from 'react-router-dom';
import { User } from '@supabase/supabase-js';
import { CalorieGoalSection } from '@/components/nutrition/CalorieGoalSection';

const weeklyStats = [{
  day: 'Seg',
  exercicio: 45,
  hidratacao: 1.8,
  sono: 7.5
}, {
  day: 'Ter',
  exercicio: 30,
  hidratacao: 2.1,
  sono: 8.0
}, {
  day: 'Qua',
  exercicio: 60,
  hidratacao: 2.0,
  sono: 7.0
}, {
  day: 'Qui',
  exercicio: 40,
  hidratacao: 1.9,
  sono: 7.5
}, {
  day: 'Sex',
  exercicio: 50,
  hidratacao: 2.2,
  sono: 8.5
}, {
  day: 'Sab',
  exercicio: 75,
  hidratacao: 2.0,
  sono: 9.0
}, {
  day: 'Dom',
  exercicio: 35,
  hidratacao: 1.7,
  sono: 8.0
}];
const chartConfig = {
  peso: {
    label: 'Peso',
    color: '#F97316'
  },
  meta: {
    label: 'Meta',
    color: '#10B981'
  },
  exercicio: {
    label: 'Exercício (min)',
    color: '#3B82F6'
  },
  hidratacao: {
    label: 'Hidratação (L)',
    color: '#06B6D4'
  },
  sono: {
    label: 'Sono (h)',
    color: '#8B5CF6'
  }
};
const StatCard = ({
  title,
  value,
  unit,
  change,
  icon: Icon,
  color,
  description
}: {
  title: string;
  value: string | number;
  unit?: string;
  change?: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  color: string;
  description?: string;
}) => <Card className="stat-card stat-card-responsive">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm sm:text-base font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${color}`} />
    </CardHeader>
    <CardContent className="p-3 sm:p-4">
      <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
        {value}
        {unit && <span className="text-sm sm:text-base text-muted-foreground ml-2">{unit}</span>}
      </div>
      {change && <p className="text-xs sm:text-sm text-muted-foreground">
          {change}
        </p>}
      {description && <p className="text-xs sm:text-sm text-muted-foreground mt-2">
          {description}
        </p>}
    </CardContent>
  </Card>;
const DashboardOverview: React.FC = () => {
  const {
    measurements,
    stats,
    loading
  } = useWeightMeasurement();
  const [weightData, setWeightData] = useState<any[]>([]);
  const [bodyComposition, setBodyComposition] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [exerciseData, setExerciseData] = useState<any[]>([]);
  const [waterData, setWaterData] = useState<any[]>([]);
  const navigate = useNavigate();

  // Obter gênero do usuário
  const [user, setUser] = useState<User | null>(null);
  const {
    gender,
    loading: genderLoading
  } = useUserGender(user);

  // Carregar usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Carregar dados de exercícios e água da semana atual
  useEffect(() => {
    const loadWeeklyData = async () => {
      if (!user) return;

      try {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay()); // Domingo
        const weekStartStr = weekStart.toISOString().split('T')[0];
        const todayStr = today.toISOString().split('T')[0];

        // Carregar exercícios da semana
        const { data: exerciseWeekData } = await supabase
          .from('exercise_tracking')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', weekStartStr)
          .lte('date', todayStr);

        // Carregar dados de água da semana
        const { data: waterWeekData } = await supabase
          .from('water_tracking')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', weekStartStr)
          .lte('date', todayStr);

        setExerciseData(exerciseWeekData || []);
        setWaterData(waterWeekData || []);
      } catch (error) {
        console.error('Erro ao carregar dados semanais:', error);
      }
    };

    loadWeeklyData();
  }, [user]);

  // Atualização em tempo real
  useEffect(() => {
    const channel = supabase.channel('weight-measurements-changes').on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'weight_measurements'
    }, () => {
      // Atualizar dados sem recarregar a página
      console.log('Mudança detectada nas medições, atualizando dados...');
      // Os hooks irão recarregar automaticamente os dados
    }).subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Preparar dados do gráfico de peso
  useEffect(() => {
    if (measurements && measurements.length > 0) {
      const last7Days = measurements.slice(-7).map(m => ({
        date: format(new Date(m.measurement_date || m.created_at), 'dd/MM'),
        peso: Number(m.peso_kg) || 0,
        meta: 70 // Meta padrão - será calculada dinamicamente quando tivermos dados físicos
      }));
      setWeightData(last7Days);
    } else {
      setWeightData([]);
    }
  }, [measurements]);

  // Preparar dados de composição corporal
  useEffect(() => {
    if (measurements && measurements.length > 0) {
      const latest = measurements[0];
      if (latest) {
        const composition = [{
          name: 'Massa Muscular',
          value: Number(latest.massa_muscular_kg) || 35,
          color: '#10B981'
        }, {
          name: 'Gordura',
          value: Number(latest.gordura_corporal_percent) || 20,
          color: '#F59E0B'
        }, {
          name: 'Água',
          value: Number(latest.agua_corporal_percent) || 45,
          color: '#3B82F6'
        }];
        setBodyComposition(composition);
      }
    } else {
      setBodyComposition([]);
    }
  }, [measurements]);

  // Calcular mudança de peso
  const weightChange = () => {
    if (measurements && measurements.length >= 2) {
      const current = Number(measurements[0]?.peso_kg) || 0;
      const previous = Number(measurements[1]?.peso_kg) || 0;
      const change = current - previous;
      return change > 0 ? `+${change.toFixed(1)}kg` : `${change.toFixed(1)}kg`;
    }
    return "Primeiro registro";
  };

  // Calcular classificação do IMC
  const getIMCClassification = (imc: number) => {
    if (!imc || isNaN(imc)) return "N/A";
    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidade";
  };

  // Calcular progresso semanal real
  const getWeeklyProgress = () => {
    if (!measurements || measurements.length === 0) {
      return {
        overallProgress: 0,
        weightChange: 0,
        exerciseDays: 0,
        hydrationProgress: 0,
        trend: 'neutral'
      };
    }

    // Calcular mudança de peso na semana
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const currentWeight = Number(measurements[0]?.peso_kg) || 0;
    const weekAgoMeasurement = measurements.find(m => 
      new Date(m.measurement_date || m.created_at) <= weekAgo
    );
    const weekAgoWeight = Number(weekAgoMeasurement?.peso_kg) || currentWeight;
    const weightChange = currentWeight - weekAgoWeight;

    // Calcular dados reais de exercícios
    const today = new Date().toISOString().split('T')[0];
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekStartStr = weekStart.toISOString().split('T')[0];

    // Contar dias com exercícios na semana
    const exerciseDaysThisWeek = exerciseData.filter(exercise => 
      exercise.date >= weekStartStr && exercise.date <= today && exercise.duration_minutes > 0
    ).length;

    // Calcular total de minutos de exercício na semana
    const totalExerciseMinutes = exerciseData
      .filter(exercise => exercise.date >= weekStartStr && exercise.date <= today)
      .reduce((total, exercise) => total + (exercise.duration_minutes || 0), 0);

    // Calcular dados reais de hidratação
    const todayWaterTotal = waterData
      .filter(water => water.date === today)
      .reduce((total, water) => total + (water.amount_ml || 0), 0);
    
    const waterGoal = 2000; // Meta padrão de 2L
    const hydrationProgress = Math.min(100, Math.round((todayWaterTotal / waterGoal) * 100));

    // Calcular progresso geral
    const weightProgress = weightChange <= 0 ? 80 : 40; // Progresso se perdeu peso
    const exerciseProgress = Math.min(100, (exerciseDaysThisWeek / 7) * 100);
    const overallProgress = Math.round((weightProgress + exerciseProgress + hydrationProgress) / 3);

    // Determinar tendência
    let trend: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (weightChange <= 0 && exerciseDaysThisWeek >= 4 && hydrationProgress >= 80) {
      trend = 'positive';
    } else if (weightChange > 1 || exerciseDaysThisWeek < 3) {
      trend = 'negative';
    }

    return {
      overallProgress,
      weightChange: parseFloat(weightChange.toFixed(1)),
      exerciseDays: exerciseDaysThisWeek,
      hydrationProgress,
      trend,
      totalExerciseMinutes
    };
  };

  // Obter dados de progresso semanal
  const weeklyProgress = getWeeklyProgress();

  // Função para registrar exercício
  const addExercise = async (duration: number, type: string = 'caminhada') => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exercise_tracking')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          exercise_type: type,
          duration_minutes: duration,
          source: 'manual'
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar dados locais
      setExerciseData(prev => [...prev, data]);
      
      // Recarregar dados da semana
      const today = new Date();
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];

      const { data: exerciseWeekData } = await supabase
        .from('exercise_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .lte('date', todayStr);

      setExerciseData(exerciseWeekData || []);

    } catch (error) {
      console.error('Erro ao registrar exercício:', error);
    }
  };

  // Removed global error handler that was capturing external library errors
  return <div className="space-y-4 animate-fade-up p-4">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-4 gap-4">
        <div className="text-center xs:text-left">
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-foreground">Dashboard</h1>
          <p className="text-base xs:text-lg sm:text-xl text-muted-foreground">Acompanhe sua jornada de saúde</p>
        </div>
        <Button className="btn-gradient h-10 xs:h-12 px-4 xs:px-6 text-sm xs:text-base text-slate-950 bg-[#a6a6ef]/35 w-full xs:w-auto">
          <Calendar className="w-4 h-4 xs:w-5 xs:h-5 mr-2" />
          Hoje
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <h3 className="text-sm font-medium text-red-800">
              Erro Detectado
            </h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-3 px-3 py-2 text-sm bg-red-100 text-red-700 rounded border border-red-200 hover:bg-red-200"
          >
            Fechar
          </button>
        </div>
      )}

      {/* Nova seção de Meta Calórica */}
      <CalorieGoalSection className="mb-6" />

      {/* Quick Stats - Layout responsivo melhorado */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
        <Card className="stat-card min-h-[140px] xs:min-h-[160px] sm:min-h-[180px] md:min-h-[200px] hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm xs:text-base sm:text-lg font-medium text-muted-foreground">
              Peso Atual
            </CardTitle>
            <Scale className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-primary" />
          </CardHeader>
          <CardContent className="p-3 xs:p-4">
            <div className="text-2xl xs:text-3xl sm:text-4xl font-bold text-foreground text-center">
              {stats?.currentWeight || 'N/A'}
              <span className="text-sm xs:text-base sm:text-lg text-muted-foreground ml-2">kg</span>
            </div>
            {weightChange() && <p className="text-xs xs:text-sm sm:text-base text-muted-foreground text-center mt-2">
              {weightChange()}
            </p>}
            
            {/* Últimas medições */}
            {measurements && measurements.length > 0 && <div className="mt-2 space-y-1">
                <p className="text-xs xs:text-sm text-muted-foreground font-medium text-center">Últimas medições:</p>
                {measurements.slice(0, 2).map((measurement, index) => <div key={`measurement-${measurement.id || index}`} className="flex justify-between items-center text-xs xs:text-sm">
                    <span className="text-muted-foreground">
                      {measurement?.measurement_date || measurement?.created_at ? 
                        format(new Date(measurement.measurement_date || measurement.created_at), 'dd/MM') : 'N/A'}
                    </span>
                    <span className={`font-medium ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {measurement?.peso_kg ? Number(measurement.peso_kg).toFixed(1) : 'N/A'} kg
                    </span>
                  </div>)}
              </div>}
          </CardContent>
        </Card>
        
        <Card className="stat-card min-h-[140px] xs:min-h-[160px] sm:min-h-[180px] md:min-h-[200px] hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm xs:text-base sm:text-lg font-medium text-muted-foreground">
              Métricas Corporais
            </CardTitle>
            <Target className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-success" />
          </CardHeader>
          <CardContent className="p-3 xs:p-4">
            <div className="flex flex-col gap-2">
              {/* IMC Principal */}
              <div className="text-center">
                <div className="text-2xl xs:text-3xl sm:text-4xl font-bold text-slate-700 mb-2">
                  {stats?.currentIMC || 'N/A'}
                </div>
                <div className="text-xs xs:text-sm text-muted-foreground mb-2 font-medium">IMC</div>
                {stats?.currentIMC && (
                  <div className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg">
                    <span className="text-xs xs:text-sm font-semibold">
                      {getIMCClassification(stats.currentIMC)}
                    </span>
                  </div>
                )}
              </div>
              
              {/* Outras Métricas - Grid responsivo */}
              <div className="grid grid-cols-2 gap-2">
                {/* Massa Magra */}
                <div className="text-center">
                  <div className="text-sm xs:text-base sm:text-lg font-bold text-blue-600 mb-1 whitespace-nowrap">
                    {stats?.muscleMass ? `${stats.muscleMass.toFixed(1)}kg` : 'N/A'}
                  </div>
                  <div className="text-xs xs:text-sm text-slate-600 font-medium">Massa Magra</div>
                </div>
                
                {/* Metabolismo */}
                <div className="text-center">
                  <div className="text-sm xs:text-base sm:text-lg font-bold text-orange-600 mb-1 whitespace-nowrap">
                    {stats?.metabolism ? Math.round(stats.metabolism).toLocaleString() : 'N/A'}
                  </div>
                  <div className="text-xs xs:text-sm text-slate-600 font-medium">Metabolismo</div>
                </div>
                
                {/* Gordura Corporal */}
                <div className="text-center">
                  <div className="text-sm xs:text-base sm:text-lg font-bold text-red-500 mb-1 whitespace-nowrap">
                    {stats?.bodyFat ? `${stats.bodyFat.toFixed(1)}%` : 'N/A'}
                  </div>
                  <div className="text-xs xs:text-sm text-slate-600 font-medium">Gordura</div>
                </div>
                
                {/* Idade Metabólica */}
                <div className="text-center">
                  <div className="text-sm xs:text-base sm:text-lg font-bold text-purple-600 mb-1 whitespace-nowrap">
                    {stats?.metabolicAge ? stats.metabolicAge : 'N/A'}
                  </div>
                  <div className="text-xs xs:text-sm text-slate-600 font-medium">Idade Met.</div>
                </div>
              </div>
              
              {/* Gordura Visceral */}
              <div className="pt-2 border-t border-slate-200">
                <div className="text-center">
                  <div className="text-sm xs:text-base sm:text-lg font-bold text-red-600 mb-1">
                    {stats?.visceralFat ? stats.visceralFat : 'N/A'}
                  </div>
                  <div className="text-xs xs:text-sm text-slate-600 font-medium">Gordura Visceral</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card min-h-[140px] xs:min-h-[160px] sm:min-h-[180px] md:min-h-[200px] hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm xs:text-base sm:text-lg font-medium text-muted-foreground text-center">
              Progresso Semanal
            </CardTitle>
            <Award className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-yellow-500" />
          </CardHeader>
          <CardContent className="p-3 xs:p-4">
            <div className="text-2xl xs:text-3xl sm:text-4xl font-bold text-foreground text-center">
              {weeklyProgress.overallProgress}%
              <span className="text-sm xs:text-base sm:text-lg text-muted-foreground ml-2">Meta</span>
            </div>
            <div className="mt-2 space-y-1">
              {/* Resumo da semana */}
              <div className="flex justify-between items-center text-xs xs:text-sm">
                <span className="text-muted-foreground">Peso:</span>
                <span className={`font-medium ${weeklyProgress.weightChange <= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {weeklyProgress.weightChange > 0 ? '+' : ''}{weeklyProgress.weightChange}kg
                </span>
              </div>
              <div className="flex justify-between items-center text-xs xs:text-sm">
                <span className="text-muted-foreground">Exercícios:</span>
                <span className="font-medium text-blue-500">{weeklyProgress.exerciseDays}/7 dias</span>
              </div>
              <div className="flex justify-between items-center text-xs xs:text-sm">
                <span className="text-muted-foreground">Hidratação:</span>
                <span className="font-medium text-cyan-500">{weeklyProgress.hydrationProgress}%</span>
              </div>
            </div>
            <div className="mt-2">
              <div className="flex justify-between items-center text-xs xs:text-sm mb-2">
                <span className="text-muted-foreground">Progresso Geral</span>
                <span className="font-medium">{weeklyProgress.overallProgress}%</span>
              </div>
              <Progress value={weeklyProgress.overallProgress} className="h-2" />
            </div>
            <p className="text-xs xs:text-sm text-muted-foreground mt-2">
              Tendência: <span className={`font-medium ${
                weeklyProgress.trend === 'positive' ? 'text-green-500' : 
                weeklyProgress.trend === 'negative' ? 'text-red-500' : 'text-yellow-500'
              }`}>
                {weeklyProgress.trend === 'positive' ? '↗️ Positiva' : 
                 weeklyProgress.trend === 'negative' ? '↘️ Negativa' : '→ Estável'}
              </span>
            </p>
            
            {/* Botão para adicionar exercício */}
            <div className="mt-2 flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs xs:text-sm h-8 xs:h-10 px-3"
                onClick={() => addExercise(30, 'caminhada')}
              >
                + 30min Caminhada
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="text-xs xs:text-sm h-8 xs:h-10 px-3"
                onClick={() => addExercise(45, 'corrida')}
              >
                + 45min Corrida
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="stat-card min-h-[120px] xs:min-h-[140px] sm:min-h-[160px] md:min-h-[180px] hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
            <CardTitle className="text-xs xs:text-sm sm:text-base font-medium text-muted-foreground text-center">
              Pesagem
            </CardTitle>
            <div className="flex items-center gap-2">
              <Bluetooth className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-blue-500" />
              <MessageCircle className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 text-purple-500" />
            </div>
          </CardHeader>
          <CardContent className="p-3 xs:p-4 pt-1">
            <div className="text-center mb-2">
              <Scale className="h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-2" />
              <p className="text-xs xs:text-sm text-muted-foreground">Balança Xiaomi</p>
            </div>
            <XiaomiScaleFlow />
          </CardContent>
        </Card>
      </div>

      {/* Main Charts - Body Evolution */}
      <div className="grid grid-cols-1 gap-3">
        {/* Personagem 3D - SEMPRE VISÍVEL com ErrorBoundary específico */}
        <ErrorBoundary 
          onError={(error, errorInfo) => {
            console.warn('Erro no personagem 3D capturado:', error.message);
            // Não fazer nada crítico, apenas logar o erro
          }}
          fallback={
            <Card className="bg-black text-white border-gray-800">
              <CardHeader className="p-3">
                <CardTitle className="text-yellow-400 text-center text-sm">
                  Personagem 3D Temporariamente Indisponível
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-2xl">👤</span>
                  </div>
                  <p className="text-gray-400 mb-2 text-sm">
                    O personagem 3D está sendo carregado...
                  </p>
                  <div className="animate-pulse">
                    <div className="w-24 h-36 bg-gray-700 rounded-xl mx-auto"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          }
        >
          <Suspense fallback={
             <Card className="bg-black text-white border-gray-800">
               <CardHeader className="p-3">
                 <CardTitle className="text-yellow-400 text-center text-sm">
                   Carregando Evolução Corporal...
                 </CardTitle>
               </CardHeader>
               <CardContent className="p-3">
                 <div className="flex items-center justify-center h-60">
                   <div className="text-center">
                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
                     <p className="text-gray-400 text-sm">Preparando gráfico de evolução...</p>
                   </div>
                 </div>
               </CardContent>
             </Card>
           }>
            <BodyEvolutionChart 
              weightData={weightData.length > 0 ? weightData.map((item, index) => ({
                date: item.date,
                time: '08:30', // Hora padrão
                value: item.peso,
                type: 'peso' as const
              })) : [
                // Dados padrão para garantir que o personagem 3D apareça
                {
                  date: 'Hoje',
                  time: '08:30',
                  value: 70.0,
                  type: 'peso' as const
                }
              ]} 
              bodyCompositionData={{
                gordura: measurements[0]?.gordura_corporal_percent || 44.1,
                musculo: measurements[0]?.massa_muscular_kg || 24.0,
                agua: measurements[0]?.agua_corporal_percent || 39.9,
                osso: 15.0
              }} 
              userGender={gender} 
            />
          </Suspense>
        </ErrorBoundary>
      </div>

      {/* Weekly Activity Chart */}
      <Card className="health-card">
        <CardHeader className="p-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Activity className="w-5 h-5 text-health-steps" />
            <span>Atividade Semanal</span>
          </CardTitle>
          <CardDescription className="text-sm">
            Exercício, hidratação e qualidade do sono
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3">
          <div className="h-64 -mx-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyStats} barSize={16} barGap={6} barCategoryGap={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" strokeOpacity={0.2} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} padding={{
                left: 5,
                right: 5
              }} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} axisLine={false} tickLine={false} padding={{
                top: 5,
                bottom: 5
              }} />
                <Tooltip contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }} />
                <Legend wrapperStyle={{
                fontSize: '12px',
                paddingTop: '8px'
              }} />
                <Bar dataKey="exercicio" fill="hsl(var(--health-steps))" radius={[4, 4, 0, 0]} stroke="hsl(var(--health-steps))" strokeWidth={1} />
                <Bar dataKey="hidratacao" fill="hsl(var(--health-hydration))" radius={[4, 4, 0, 0]} stroke="hsl(var(--health-hydration))" strokeWidth={1} />
                <Bar dataKey="sono" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} stroke="hsl(var(--accent))" strokeWidth={1} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access - Sofia */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 mb-3 xs:mb-4">
        <Card className="mission-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/sofia'}>
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-sm xs:text-base flex items-center space-x-2">
              <MessageCircle className="w-4 h-4 xs:w-5 xs:h-5 text-green-600" />
              <span>Sofia Chat</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 xs:w-6 xs:h-6 text-green-500" />
                <span className="text-sm xs:text-base font-medium">Assistente IA</span>
              </div>
              <p className="text-xs xs:text-sm text-muted-foreground">Converse com a Sofia sobre nutrição e saúde</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs xs:text-sm text-green-600">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/sofia-nutricional'}>
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-sm xs:text-base flex items-center space-x-2">
              <Utensils className="w-4 h-4 xs:w-5 xs:h-5 text-emerald-600" />
              <span>Sofia Nutricional</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 xs:w-6 xs:h-6 text-emerald-500" />
                <span className="text-sm xs:text-base font-medium">Planejamento</span>
              </div>
              <p className="text-xs xs:text-sm text-muted-foreground">Planeje suas refeições e acompanhe nutrição</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs xs:text-sm text-emerald-600">Disponível</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.location.href = '/app/missions'}>
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-sm xs:text-base flex items-center space-x-2">
              <Activity className="w-4 h-4 xs:w-5 xs:h-5 text-blue-600" />
              <span>Missão do Dia</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 xs:w-6 xs:h-6 text-blue-500" />
                <span className="text-sm xs:text-base font-medium">Gamificação</span>
              </div>
              <p className="text-xs xs:text-sm text-muted-foreground">Complete missões e ganhe pontos</p>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-2 h-2 xs:w-2.5 xs:h-2.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs xs:text-sm text-blue-600">Nova missão</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goals Progress */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4">
        <Card className="mission-card">
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-sm xs:text-base flex items-center space-x-2">
              <Heart className="w-4 h-4 xs:w-5 xs:h-5 text-health-heart" />
              <span>Exercício Diário</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs xs:text-sm">
                <span>45 min</span>
                <span>Meta: 30 min</span>
              </div>
              <Progress value={150} className="h-2" />
              <p className="text-xs xs:text-sm text-success font-medium">Meta superada! 🎉</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-sm xs:text-base flex items-center space-x-2">
              <Droplets className="w-4 h-4 xs:w-5 xs:h-5 text-health-hydration" />
              <span>Hidratação</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs xs:text-sm">
                <span>1.8 L</span>
                <span>Meta: 2.0 L</span>
              </div>
              <Progress value={90} className="h-2" />
              <p className="text-xs xs:text-sm text-muted-foreground">Falta apenas 200ml</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mission-card">
          <CardHeader className="pb-2 p-3">
            <CardTitle className="text-sm xs:text-base flex items-center space-x-2">
              <Timer className="w-4 h-4 xs:w-5 xs:h-5 text-accent" />
              <span>Sono</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex justify-between text-xs xs:text-sm">
                <span>7.5 h</span>
                <span>Meta: 8.0 h</span>
              </div>
              <Progress value={94} className="h-2" />
              <p className="text-xs xs:text-sm text-muted-foreground">Quase na meta!</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
};
export default DashboardOverview;