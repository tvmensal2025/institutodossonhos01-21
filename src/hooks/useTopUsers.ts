import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TopUser {
  user_id: string;
  total_measurements: number;
  last_measurement: string;
  average_weight: number;
  weight_trend: string;
}

export const useTopUsers = () => {
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTopUsers();
  }, []);

  const fetchTopUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar usuários com mais medições
      const { data: measurementsData, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('user_id, measurement_date, peso_kg')
        .order('measurement_date', { ascending: false });

      if (measurementsError) throw measurementsError;

      // Agrupar dados por usuário
      const userStats = new Map<string, {
        measurements: number;
        lastMeasurement: string;
        weights: number[];
      }>();

      measurementsData?.forEach(measurement => {
        const userId = measurement.user_id;
        const existing = userStats.get(userId) || {
          measurements: 0,
          lastMeasurement: '',
          weights: []
        };

        existing.measurements++;
        if (!existing.lastMeasurement || measurement.measurement_date > existing.lastMeasurement) {
          existing.lastMeasurement = measurement.measurement_date;
        }
        if (measurement.peso_kg) {
          existing.weights.push(measurement.peso_kg);
        }

        userStats.set(userId, existing);
      });

      // Calcular estatísticas e ordenar
      const topUsersData: TopUser[] = Array.from(userStats.entries())
        .map(([userId, stats]) => {
          const averageWeight = stats.weights.length > 0 
            ? stats.weights.reduce((a, b) => a + b, 0) / stats.weights.length 
            : 0;

          // Calcular tendência (simplificado)
          const sortedWeights = [...stats.weights].sort((a, b) => a - b);
          const weightTrend = sortedWeights.length >= 2 
            ? sortedWeights[sortedWeights.length - 1] > sortedWeights[0] ? 'up' : 'down'
            : 'stable';

          return {
            user_id: userId,
            total_measurements: stats.measurements,
            last_measurement: stats.lastMeasurement,
            average_weight: averageWeight,
            weight_trend: weightTrend
          };
        })
        .sort((a, b) => b.total_measurements - a.total_measurements)
        .slice(0, 10);

      setTopUsers(topUsersData);
    } catch (err) {
      console.error('Error fetching top users:', err);
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuários');
    } finally {
      setLoading(false);
    }
  };

  return { topUsers, loading, error, refetch: fetchTopUsers };
}; 