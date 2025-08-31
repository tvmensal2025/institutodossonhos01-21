import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface PhysicalData {
  altura_cm: number | null;
  idade: number | null;
  sexo: 'Masculino' | 'Feminino' | null;
  nivel_atividade: 'Sedentário' | 'Leve' | 'Moderado' | 'Intenso' | null;
}

export const usePhysicalData = (user: User | null) => {
  const [physicalData, setPhysicalData] = useState<PhysicalData>({
    altura_cm: null,
    idade: null,
    sexo: null,
    nivel_atividade: null
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados físicos
  useEffect(() => {
    if (user) {
      loadPhysicalData();
    }
  }, [user]);

  const loadPhysicalData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar dados físicos:', error);
      }

      if (data) {
        setPhysicalData({
          altura_cm: data.altura_cm,
          idade: data.idade,
          sexo: data.sexo as 'Masculino' | 'Feminino' | null,
          nivel_atividade: data.nivel_atividade as 'Sedentário' | 'Leve' | 'Moderado' | 'Intenso' | null
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados físicos:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePhysicalData = async (newData: Partial<PhysicalData>) => {
    if (!user) return;

    try {
      setSaving(true);
      
      const updatedData = { ...physicalData, ...newData };
      
      // Atualizar no Supabase
      const { error } = await supabase
        .from('user_physical_data')
        .upsert({
          user_id: user.id,
          altura_cm: updatedData.altura_cm,
          idade: updatedData.idade,
          sexo: updatedData.sexo,
          nivel_atividade: updatedData.nivel_atividade,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar dados físicos:', error);
        throw error;
      }

      // Atualizar estado local
      setPhysicalData(updatedData);
      
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar dados físicos:', error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  return {
    physicalData,
    loading,
    saving,
    updatePhysicalData,
    loadPhysicalData
  };
};