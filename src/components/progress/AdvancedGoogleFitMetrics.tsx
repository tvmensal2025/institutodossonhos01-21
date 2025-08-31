import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ReferenceLine, PieChart, Pie, Cell } from 'recharts';
import { Heart, Moon, Scale, TrendingUp, Activity, Zap, Target, Clock } from 'lucide-react';
interface AdvancedGoogleFitMetricsProps {
  data: any[];
  period: 'day' | 'week' | 'month';
  userGoals: {
    stepsGoal: number;
    sleepGoal: number;
    activeMinutesGoal: number;
    caloriesGoal: number;
    heartRateGoal: number;
    weightGoal: number;
  };
}
export const AdvancedGoogleFitMetrics: React.FC<AdvancedGoogleFitMetricsProps> = ({
  data,
  period,
  userGoals
}) => {
  // Verificar se há dados de frequência cardíaca
  const hasHeartRateData = data.some(d => d.heart_rate_avg > 0 || d.heart_rate_min > 0 || d.heart_rate_max > 0);

  // Verificar se há dados de sono
  const hasSleepData = data.some(d => d.sleep_hours > 0);

  // Verificar se há dados de peso
  const hasWeightData = data.some(d => d.weight_kg !== null);

  // Verificar se há dados de exercício
  const hasExerciseData = data.some(d => d.exercise_minutes > 0 || d.workout_sessions > 0);

  // DEBUG: Forçar visibilidade para teste
  console.log('AdvancedGoogleFitMetrics - hasHeartRateData:', hasHeartRateData);
  console.log('AdvancedGoogleFitMetrics - hasSleepData:', hasSleepData);
  console.log('AdvancedGoogleFitMetrics - hasWeightData:', hasWeightData);
  console.log('AdvancedGoogleFitMetrics - hasExerciseData:', hasExerciseData);
  console.log('AdvancedGoogleFitMetrics - data sample:', data.slice(0, 2));
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  const formatChartData = () => {
    if (!data || data.length === 0) return [];
    switch (period) {
      case 'day':
        return [{
          name: 'Hoje',
          heartRateAvg: data[0]?.heart_rate_avg || 0,
          heartRateMin: data[0]?.heart_rate_min || 0,
          heartRateMax: data[0]?.heart_rate_max || 0,
          sleepHours: data[0]?.sleep_hours || 0,
          weightKg: data[0]?.weight_kg || 0,
          exerciseMinutes: data[0]?.exercise_minutes || 0,
          workoutSessions: data[0]?.workout_sessions || 0
        }];
      case 'week':
        return data.map(item => ({
          name: new Date(item.date).toLocaleDateString('pt-BR', {
            weekday: 'short'
          }),
          heartRateAvg: item.heart_rate_avg || 0,
          heartRateMin: item.heart_rate_min || 0,
          heartRateMax: item.heart_rate_max || 0,
          sleepHours: item.sleep_hours || 0,
          weightKg: item.weight_kg || 0,
          exerciseMinutes: item.exercise_minutes || 0,
          workoutSessions: item.workout_sessions || 0,
          date: item.date
        }));
      case 'month':
        const weeklyData = [];
        for (let i = 0; i < data.length; i += 7) {
          const weekData = data.slice(i, i + 7);
          const weekStats = weekData.reduce((acc, item) => ({
            heartRateAvg: acc.heartRateAvg + (item.heart_rate_avg || 0),
            heartRateMin: acc.heartRateMin + (item.heart_rate_min || 0),
            heartRateMax: acc.heartRateMax + (item.heart_rate_max || 0),
            sleepHours: acc.sleepHours + (item.sleep_hours || 0),
            weightKg: acc.weightKg + (item.weight_kg || 0),
            exerciseMinutes: acc.exerciseMinutes + (item.exercise_minutes || 0),
            workoutSessions: acc.workoutSessions + (item.workout_sessions || 0)
          }), {
            heartRateAvg: 0,
            heartRateMin: 0,
            heartRateMax: 0,
            sleepHours: 0,
            weightKg: 0,
            exerciseMinutes: 0,
            workoutSessions: 0
          });
          weeklyData.push({
            name: `Semana ${Math.floor(i / 7) + 1}`,
            heartRateAvg: Math.round(weekStats.heartRateAvg / weekData.length),
            heartRateMin: Math.round(weekStats.heartRateMin / weekData.length),
            heartRateMax: Math.round(weekStats.heartRateMax / weekData.length),
            sleepHours: Math.round(weekStats.sleepHours / weekData.length * 100) / 100,
            weightKg: Math.round(weekStats.weightKg / weekData.length * 100) / 100,
            exerciseMinutes: weekStats.exerciseMinutes,
            workoutSessions: weekStats.workoutSessions
          });
        }
        return weeklyData;
      default:
        return data;
    }
  };
  const formattedData = formatChartData();
  return <>
      {/* Gráfico de Frequência Cardíaca - Só mostra se há dados */}
      {hasHeartRateData && <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-red-600" />
                Frequência Cardíaca - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="heartRateAvg" stroke="#dc2626" strokeWidth={2} name="Média" />
                  <Line type="monotone" dataKey="heartRateMin" stroke="#7c3aed" strokeWidth={2} name="Mínima" />
                  <Line type="monotone" dataKey="heartRateMax" stroke="#ea580c" strokeWidth={2} name="Máxima" />
                  <ReferenceLine y={userGoals.heartRateGoal} stroke="#ef4444" strokeDasharray="3 3" label="Meta" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>}

      {/* Gráfico de Sono - Só mostra se há dados */}
      {hasSleepData && <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-600" />
                Sono - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="sleepHours" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} />
                  <ReferenceLine y={userGoals.sleepGoal} stroke="#ef4444" strokeDasharray="3 3" label="Meta" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>}

      {/* Gráfico de Peso - Só mostra se há dados */}
      {hasWeightData && <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Peso - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="weightKg" stroke="#2563eb" strokeWidth={2} />
                  <ReferenceLine y={userGoals.weightGoal} stroke="#ef4444" strokeDasharray="3 3" label="Meta" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>}

      {/* Gráfico de Exercícios - Só mostra se há dados */}
      {hasExerciseData && <motion.div variants={cardVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Exercícios - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="exerciseMinutes" fill="#22c55e" name="Minutos" />
                  <Bar dataKey="workoutSessions" fill="#16a34a" name="Sessões" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>}

      {/* Mensagem quando não há dados avançados - SEMPRE MOSTRAR PARA TESTE */}
      <motion.div variants={cardVariants}>
        <Card>
          
          <CardContent>
            
          </CardContent>
        </Card>
      </motion.div>
    </>;
};