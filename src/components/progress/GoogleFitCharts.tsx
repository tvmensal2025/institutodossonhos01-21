import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, ReferenceLine } from 'recharts';
import { Activity, Heart, Moon, Zap, Target } from 'lucide-react';

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

interface GoogleFitChartsProps {
  chartData: GoogleFitData[];
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

export const GoogleFitCharts: React.FC<GoogleFitChartsProps> = ({ 
  chartData, 
  cardVariants, 
  period,
  comparisonData,
  userGoals 
}) => {
  // Formatar dados para os gráficos baseado no período
  const formatChartData = () => {
    if (!chartData || chartData.length === 0) return [];

    switch (period) {
      case 'day':
        // Para dia, mostrar dados por hora (se disponível) ou apenas o valor total
        return [{
          name: 'Hoje',
          steps: chartData[0]?.steps || 0,
          calories: chartData[0]?.calories || 0,
          heartRate: chartData[0]?.heart_rate_avg || 0,
          activeMinutes: chartData[0]?.active_minutes || 0,
          sleep: chartData[0]?.sleep_duration_hours || 0
        }];
      
      case 'week':
        // Para semana, mostrar dados por dia
        return chartData.map(item => ({
          name: new Date(item.date).toLocaleDateString('pt-BR', { weekday: 'short' }),
          steps: item.steps || 0,
          calories: item.calories || 0,
          heartRate: item.heart_rate_avg || 0,
          activeMinutes: item.active_minutes || 0,
          sleep: item.sleep_duration_hours || 0,
          date: item.date
        }));
      
      case 'month':
        // Para mês, agrupar por semana ou mostrar dados por dia
        const weeklyData = [];
        for (let i = 0; i < chartData.length; i += 7) {
          const weekData = chartData.slice(i, i + 7);
          const weekStats = weekData.reduce((acc, item) => ({
            steps: acc.steps + (item.steps || 0),
            calories: acc.calories + (item.calories || 0),
            heartRate: acc.heartRate + (item.heart_rate_avg || 0),
            activeMinutes: acc.activeMinutes + (item.active_minutes || 0),
            sleep: acc.sleep + (item.sleep_duration_hours || 0)
          }), { steps: 0, calories: 0, heartRate: 0, activeMinutes: 0, sleep: 0 });
          
          weeklyData.push({
            name: `Semana ${Math.floor(i / 7) + 1}`,
            ...weekStats,
            heartRate: Math.round(weekStats.heartRate / weekData.length),
            sleep: Math.round((weekStats.sleep / weekData.length) * 100) / 100
          });
        }
        return weeklyData;
      
      default:
        return chartData;
    }
  };

  const formattedData = formatChartData();

  // Calcular estatísticas de comparação
  const getComparisonStats = () => {
    if (!comparisonData || comparisonData.length === 0) return null;

    const stats = comparisonData.reduce((acc, item) => ({
      steps: acc.steps + (item.steps || 0),
      calories: acc.calories + (item.calories || 0),
      heartRate: acc.heartRate + (item.heart_rate_avg || 0),
      activeMinutes: acc.activeMinutes + (item.active_minutes || 0),
      sleep: acc.sleep + (item.sleep_duration_hours || 0)
    }), { steps: 0, calories: 0, heartRate: 0, activeMinutes: 0, sleep: 0 });

    const count = comparisonData.length;
    return {
      steps: Math.round(stats.steps / count),
      calories: Math.round(stats.calories / count),
      heartRate: Math.round(stats.heartRate / count),
      activeMinutes: Math.round(stats.activeMinutes / count),
      sleep: Math.round((stats.sleep / count) * 100) / 100
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

  if (!chartData || chartData.length === 0) {
    return (
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle>Dados do Google Fit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-center py-8">
              Nenhum dado disponível para o período selecionado.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <>
      {/* Gráfico de Passos */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Passos - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
            </CardTitle>
            {comparisonStats && (
              <p className="text-sm text-muted-foreground">
                {getVariation(formattedData[0]?.steps || 0, comparisonStats.steps)}% vs {getComparisonLabel()}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="steps" fill="#3b82f6" />
                <ReferenceLine y={userGoals.stepsGoal} stroke="#ef4444" strokeDasharray="3 3" label="Meta" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráfico de Calorias */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-orange-600" />
              Calorias - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
            </CardTitle>
            {comparisonStats && (
              <p className="text-sm text-muted-foreground">
                {getVariation(formattedData[0]?.calories || 0, comparisonStats.calories)}% vs {getComparisonLabel()}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} />
                <ReferenceLine y={userGoals.caloriesGoal} stroke="#ef4444" strokeDasharray="3 3" label="Meta" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Gráfico de Sono */}
      <motion.div variants={cardVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-600" />
              Sono - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
            </CardTitle>
            {comparisonStats && (
              <p className="text-sm text-muted-foreground">
                {getVariation(formattedData[0]?.sleep || 0, comparisonStats.sleep)}% vs {getComparisonLabel()}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={formattedData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="sleep" stroke="#6366f1" strokeWidth={2} />
                <ReferenceLine y={userGoals.sleepGoal} stroke="#ef4444" strokeDasharray="3 3" label="Meta" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>
    </>
  );
};