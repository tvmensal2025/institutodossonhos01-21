import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubscriptionStatus {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  isLoading: boolean;
  error?: string;
}

export function useStripeSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>({
    subscribed: false,
    isLoading: true,
  });
  const { toast } = useToast();

  // Check subscription status
  const checkSubscription = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true, error: undefined }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setStatus({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setStatus({
        subscribed: false,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to check subscription',
      });
    }
  }, []);

  // Create checkout session
  const createCheckout = useCallback(async (planId: string) => {
    try {
      setStatus(prev => ({ ...prev, isLoading: true }));
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planId },
      });
      
      if (error) throw error;
      
      if (data.url) {
        // Open Stripe checkout in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating checkout:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar pagamento",
        variant: "destructive",
      });
    } finally {
      setStatus(prev => ({ ...prev, isLoading: false }));
    }
  }, [toast]);

  // Manage subscription (customer portal)
  const manageSubscription = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data.url) {
        // Open customer portal in a new tab
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao abrir portal",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Check subscription on component mount and auth changes
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        checkSubscription();
      } else {
        setStatus({
          subscribed: false,
          isLoading: false,
        });
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        checkSubscription();
      } else if (event === 'SIGNED_OUT') {
        setStatus({
          subscribed: false,
          isLoading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [checkSubscription]);

  return {
    status,
    checkSubscription,
    createCheckout,
    manageSubscription,
  };
}