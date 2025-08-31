import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserPoints {
  total_points: number;
  current_streak: number;
  level: number;
  experience: number;
}

export const useUserPoints = () => {
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserPoints();
  }, []);

  const fetchUserPoints = async () => {
    try {
      setLoading(true);
      // Buscar pontos do usuário
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Erro ao buscar pontos do usuário:', error);
        } else {
          setUserPoints({
            total_points: 0,
            current_streak: 0,
            level: 1,
            experience: 0
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar pontos do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPoints = async (pointsToAdd: number) => {
    try {
      // Atualizar pontos do usuário
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // Não atualizar pontos por enquanto (campo não existe na tabela)
      console.log('Pontos a adicionar:', pointsToAdd);

      // Atualizar estado local
      setUserPoints(prev => prev ? {
        ...prev,
        total_points: prev.total_points + pointsToAdd
      } : null);
    } catch (error) {
      console.error('Erro ao atualizar pontos:', error);
      throw error;
    }
  };

  return {
    userPoints,
    loading,
    updateUserPoints,
    fetchUserPoints
  };
}; 