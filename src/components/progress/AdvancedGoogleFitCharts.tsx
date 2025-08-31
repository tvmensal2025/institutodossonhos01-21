import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, AreaChart, Area, ReferenceLine, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target, Activity, Heart, Moon, Zap, Calendar, Clock } from 'lucide-react';

interface GoogleFitData {
  date: string;
  steps: number;
  calories: number;
  distance_meters: number;
  heart_rate_avg: number;
  active_minutes: number;
  sleep_duration_hours: number;
  weight_kg?: number;
  height_cm?: number;
}

interface AdvancedGoogleFitChartsProps {
  data: GoogleFitData[];
  cardVariants: any;
  period: 'day' | 'week' | 'month';
  comparisonData: GoogleFitData[];
  userGoals: {
    stepsGoal: number;
    sleepGoal: number;
    activeMinutesGoal: number;
    caloriesGoal: number;
  };
}

export const AdvancedGoogleFitCharts: React.FC<AdvancedGoogleFitChartsProps> = ({ 
  data, 
  cardVariants, 
  period,
  comparisonData,
  userGoals 
}) => {
  // Formatar dados para os gráficos avançados baseado no período
  const formatAdvancedData = () => {
    if (!data || data.length === 0) return [];

    switch (period) {
      case 'day':
        // Para dia, mostrar dados por hora (se disponível) ou apenas o valor total
        return [{
          name: 'Hoje',
          steps: data[0]?.steps || 0,
          calories: data[0]?.calories || 0,
          heartRate: data[0]?.heart_rate_avg || 0,
          activeMinutes: data[0]?.active_minutes || 0,
          sleep: data[0]?.sleep_duration_hours || 0,
          distance: data[0]?.distance_meters || 0
        }];
      
      case 'week':
        // Para semana, mostrar dados por dia
        return data.map(item => ({
          name: new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
          steps: item.steps || 0,
          calories: item.calories || 0,
          heartRate: item.heart_rate_avg || 0,
          activeMinutes: item.active_minutes || 0,
          sleep: item.sleep_duration_hours || 0,
          distance: item.distance_meters || 0,
          date: item.date
        }));
      
      case 'month':
        // Para mês, agrupar por semana
        const weeklyData = [];
        for (let i = 0; i < data.length; i += 7) {
          const weekData = data.slice(i, i + 7);
          const weekStats = weekData.reduce((acc, item) => ({
            steps: acc.steps + (item.steps || 0),
            calories: acc.calories + (item.calories || 0),
            heartRate: acc.heartRate + (item.heart_rate_avg || 0),
            activeMinutes: acc.activeMinutes + (item.active_minutes || 0),
            sleep: acc.sleep + (item.sleep_duration_hours || 0),
            distance: acc.distance + (item.distance_meters || 0)
          }), { steps: 0, calories: 0, heartRate: 0, activeMinutes: 0, sleep: 0, distance: 0 });
          
          weeklyData.push({
            name: `Semana ${Math.floor(i / 7) + 1}`,
            ...weekStats,
            heartRate: Math.round(weekStats.heartRate / weekData.length),
            sleep: Math.round((weekStats.sleep / weekData.length) * 100) / 100
          });
        }
        return weeklyData;
      
      default:
        return data;
    }
  };

  const formattedData = formatAdvancedData();

  // Calcular estatísticas de comparação
  const getComparisonStats = () => {
    if (!comparisonData || comparisonData.length === 0) return null;

    const stats = comparisonData.reduce((acc, item) => ({
      steps: acc.steps + (item.steps || 0),
      calories: acc.calories + (item.calories || 0),
      heartRate: acc.heartRate + (item.heart_rate_avg || 0),
      activeMinutes: acc.activeMinutes + (item.active_minutes || 0),
      sleep: acc.sleep + (item.sleep_duration_hours || 0),
      distance: acc.distance + (item.distance_meters || 0)
    }), { steps: 0, calories: 0, heartRate: 0, activeMinutes: 0, sleep: 0, distance: 0 });

    const count = comparisonData.length;
    return {
      steps: Math.round(stats.steps / count),
      calories: Math.round(stats.calories / count),
      heartRate: Math.round(stats.heartRate / count),
      activeMinutes: Math.round(stats.activeMinutes / count),
      sleep: Math.round((stats.sleep / count) * 100) / 100,
      distance: Math.round(stats.distance / count)
    };
  };

  const comparisonStats = getComparisonStats();

  // Calcular variação percentual
  const getVariation = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  // Obter label de comparação baseado no período
  const getComparisonLabel = () => {
    switch (period) {
      case 'day': return 'ontem';
      case 'week': return 'semana passada';
      case 'month': return 'mês passado';
      default: return 'período anterior';
    }
  };

  // Calcular consistência (quantos dias atingiu a meta)
  const calculateConsistency = (metric: 'steps' | 'calories' | 'activeMinutes' | 'sleep') => {
    if (!data || data.length === 0) return 0;
    
    let targetValue: number;
    let actualValues: number[];
    
    switch (metric) {
      case 'steps':
        targetValue = userGoals.stepsGoal;
        actualValues = data.map(item => item.steps || 0);
        break;
      case 'calories':
        targetValue = userGoals.caloriesGoal;
        actualValues = data.map(item => item.calories || 0);
        break;
      case 'activeMinutes':
        targetValue = userGoals.activeMinutesGoal;
        actualValues = data.map(item => item.active_minutes || 0);
        break;
      case 'sleep':
        targetValue = userGoals.sleepGoal;
        actualValues = data.map(item => item.sleep_duration_hours || 0);
        break;
      default:
        return 0;
    }
    
    const daysAchieved = actualValues.filter(value => value >= targetValue).length;
    return Math.round((daysAchieved / data.length) * 100);
  };

  // Dados para o gráfico de pizza de consistência
  const consistencyData = [
    { name: 'Passos', value: calculateConsistency('steps'), color: '#3b82f6' },
    { name: 'Calorias', value: calculateConsistency('calories'), color: '#f97316' },
    { name: 'Minutos Ativos', value: calculateConsistency('activeMinutes'), color: '#22c55e' },
    { name: 'Sono', value: calculateConsistency('sleep'), color: '#6366f1' }
  ];

  if (!data || data.length === 0) {
    return (
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Análise Avançada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhum dado disponível para análise avançada.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      {/* Gráfico de Consistência (Pizza) */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Consistência de Metas - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Percentual de dias que atingiu cada meta
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <ResponsiveContainer width={300} height={300}>
                <PieChart>
                  <Pie
                    data={consistencyData}
                    cx={150}
                    cy={150}
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {consistencyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value}%`, 'Consistência']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {consistencyData.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="text-lg font-bold" style={{ color: item.color }}>
                    {item.value}%
                  </div>
                  <div className="text-sm text-muted-foreground">{item.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Resumo de Performance */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-600" />
              Resumo de Performance - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {data.reduce((sum, item) => sum + (item.steps || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Passos</div>
                {comparisonStats && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {getVariation(
                      data.reduce((sum, item) => sum + (item.steps || 0), 0),
                      comparisonStats.steps * data.length
                    )}% vs {getComparisonLabel()}
                  </div>
                )}
              </div>
              
              <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {data.reduce((sum, item) => sum + (item.calories || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Calorias</div>
                {comparisonStats && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {getVariation(
                      data.reduce((sum, item) => sum + (item.calories || 0), 0),
                      comparisonStats.calories * data.length
                    )}% vs {getComparisonLabel()}
                  </div>
                )}
              </div>
              
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {data.reduce((sum, item) => sum + (item.active_minutes || 0), 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Min. Ativos</div>
                {comparisonStats && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {getVariation(
                      data.reduce((sum, item) => sum + (item.active_minutes || 0), 0),
                      comparisonStats.activeMinutes * data.length
                    )}% vs {getComparisonLabel()}
                  </div>
                )}
              </div>
              
              <div className="text-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                <div className="text-2xl font-bold text-indigo-600">
                  {(data.reduce((sum, item) => sum + (item.sleep_duration_hours || 0), 0) / data.length).toFixed(1)}h
                </div>
                <div className="text-sm text-muted-foreground">Média Sono</div>
                {comparisonStats && (
                  <div className="text-xs text-muted-foreground mt-1">
                    {getVariation(
                      data.reduce((sum, item) => sum + (item.sleep_duration_hours || 0), 0) / data.length,
                      comparisonStats.sleep
                    )}% vs {getComparisonLabel()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};

export default AdvancedGoogleFitCharts;