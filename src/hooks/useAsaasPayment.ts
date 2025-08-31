import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAsaasPayment() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createPayment = async (planId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-asaas-payment', {
        body: { planId },
      });
      
      if (error) throw error;
      
      if (data.success && data.paymentUrl) {
        // Open payment URL in new tab
        window.open(data.paymentUrl, '_blank');
        toast({
          title: "Pagamento criado",
          description: "Redirecionando para o pagamento via PIX",
        });
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPayment,
    isLoading,
  };
}