import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../integrations/supabase/client';

// Hook para perfil do usuário com cache
export function useUserData(userId: string) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
    enabled: !!userId,
  });
}

// Hook para medições com paginação
export function useMeasurements(userId: string, limit = 30) {
  return useQuery({
    queryKey: ['measurements', userId, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!userId,
  });
}

// Hook para adicionar medição com otimistic update
export function useAddMeasurement() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (measurement: any) => {
      const { data, error } = await supabase
        .from('weight_measurements')
        .insert(measurement)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onMutate: async (newMeasurement) => {
      await queryClient.cancelQueries({ queryKey: ['measurements'] });
      
      const previousMeasurements = queryClient.getQueryData(['measurements']);
      
      queryClient.setQueryData(['measurements'], (old: any) => {
        return [newMeasurement, ...(old || [])];
      });
      
      return { previousMeasurements };
    },
    onError: (err, newMeasurement, context) => {
      queryClient.setQueryData(['measurements'], context?.previousMeasurements);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['measurements'] });
    },
  });
}

// Hook para perfil do usuário
export function useProfile(userId: string) {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: !!userId,
  });
}

// Hook para atualizar perfil
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, updates }: { userId: string; updates: any }) => {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['profile', data.user_id], data);
      queryClient.invalidateQueries({ queryKey: ['user', data.user_id] });
    },
  });
}