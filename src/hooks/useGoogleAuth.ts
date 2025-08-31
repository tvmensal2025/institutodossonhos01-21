import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useGoogleAuth = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) throw error;

      // OAuth redireciona automaticamente, então não precisamos retornar dados aqui
      return { success: true };
      
    } catch (error) {
      console.error('Erro no login Google:', error);
      return { success: false, error };
    } finally {
      setIsLoading(false);
    }
  };

  return { signInWithGoogle, isLoading };
};
