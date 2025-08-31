
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { defaultRankingUsers } from '@/data/health-feed-data';

interface RankingUser {
  user_id: string;
  user_name: string;
  avatar_url?: string;
  total_points: number;
  streak_days: number;
  missions_completed: number;
  last_activity: string | null;
  position: number;
}

export const useRanking = () => {
  const [ranking, setRanking] = useState<RankingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Buscar dados das missões diárias para calcular estatísticas
      const { data: missionsData, error: missionsError } = await supabase
        .from('daily_mission_sessions')
        .select('user_id, total_points, streak_days, date')
        .order('date', { ascending: false });

      if (missionsError) {
        console.warn('Erro ao buscar missões:', missionsError);
      }

      // Buscar perfis de usuários
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .order('full_name');

      if (profilesError) throw profilesError;

      // Processar dados para criar o ranking
      const userStats = new Map();

      // Processar dados das missões se existirem
      if (missionsData && missionsData.length > 0) {
        missionsData.forEach((session) => {
          const userId = session.user_id;
          if (!userStats.has(userId)) {
            userStats.set(userId, {
              user_id: userId,
              total_points: 0,
              missions_completed: 0,
              streak_days: 0,
              last_activity: null
            });
          }

          const stats = userStats.get(userId);
          stats.total_points += session.total_points || 0;
          stats.missions_completed += 1;
          stats.streak_days = Math.max(stats.streak_days, session.streak_days || 0);
          
          // Atualizar última atividade
          if (!stats.last_activity || session.date > stats.last_activity) {
            stats.last_activity = session.date;
          }
        });
      }

      // Combinar com dados dos perfis
      const rankingUsers: RankingUser[] = [];
      
      profilesData?.forEach((profile, index) => {
        const userStat = userStats.get(profile.id);
        
        // Create simulated ranking with fake points for demo
        rankingUsers.push({
          user_id: profile.id,
          user_name: profile.full_name || 'Usuário',
          avatar_url: profile.avatar_url,
          total_points: userStat?.total_points || Math.floor(Math.random() * 1000),
          streak_days: userStat?.streak_days || Math.floor(Math.random() * 30),
          missions_completed: userStat?.missions_completed || Math.floor(Math.random() * 10),
          last_activity: userStat?.last_activity,
          position: 0 // Será definido após ordenação
        });
      });

      // Ordenar por pontos e definir posições
      rankingUsers.sort((a, b) => {
        if (b.total_points !== a.total_points) {
          return b.total_points - a.total_points;
        }
        // Em caso de empate, usar missões completadas
        if (b.missions_completed !== a.missions_completed) {
          return b.missions_completed - a.missions_completed;
        }
        // Por último, usar streak
        return b.streak_days - a.streak_days;
      });

      // Definir posições
      rankingUsers.forEach((user, index) => {
        user.position = index + 1;
      });

      // Se não houver dados reais, usar dados de demonstração
      if (rankingUsers.length === 0) {
        setRanking(defaultRankingUsers);
      } else {
        setRanking(rankingUsers);
      }
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar ranking:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar ranking');
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchRanking();
  };

  useEffect(() => {
    fetchRanking();
  }, []);

  return {
    ranking,
    loading,
    error,
    refetch
  };
};
