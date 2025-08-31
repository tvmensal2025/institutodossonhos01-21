import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useUserGender = (user: User | null) => {
  const [gender, setGender] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserGender();
    }
  }, [user]);

  const loadUserGender = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Tentar buscar da tabela profiles primeiro
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .single();

      if (!profileError && profileData?.gender) {
        console.log('Gênero encontrado no perfil:', profileData.gender);
        setGender(profileData.gender);
        return;
      }

      // Se não encontrou na tabela profiles, tentar user_physical_data
      const { data: physicalData, error: physicalError } = await supabase
        .from('user_physical_data')
        .select('sexo')
        .eq('user_id', user.id)
        .single();

      if (!physicalError && physicalData?.sexo) {
        console.log('Gênero encontrado em user_physical_data:', physicalData.sexo);
        setGender(physicalData.sexo);
        return;
      }

      // Se não encontrou em nenhuma tabela, usar metadata do usuário
      const userGender = user.user_metadata?.gender;
      if (userGender) {
        setGender(userGender);
        return;
      }

      // Padrão neutro se não encontrar
      console.log('Gênero não encontrado, usando padrão neutro');
      setGender(null); // Não definir padrão, deixar o usuário escolher
    } catch (error) {
      console.error('Erro ao carregar gênero do usuário:', error);
      setGender('neutral');
    } finally {
      setLoading(false);
    }
  };

  return { gender, loading };
}; 