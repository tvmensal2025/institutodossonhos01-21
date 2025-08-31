// @ts-nocheck
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'pending' | 'cancelled' | 'expired';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setSubscription(null);
        setPlan(null);
        return;
      }

      // Buscar assinatura ativa do usuário
      const { data: subscriptionData, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subscriptionError && subscriptionError.code !== 'PGRST116') {
        console.error('Erro ao buscar assinatura:', subscriptionError);
        setError(subscriptionError.message);
      }

      if (subscriptionData) {
        setSubscription({
          ...subscriptionData,
          status: subscriptionData.status as 'active' | 'pending' | 'cancelled' | 'expired'
        });
        const features = subscriptionData.subscription_plans?.features;
        setPlan({
          ...subscriptionData.subscription_plans,
          features: Array.isArray(features) 
            ? features.map((f: any) => typeof f === 'string' ? f : String(f))
            : []
        });
      } else {
        setSubscription(null);
        setPlan(null);
      }

    } catch (err) {
      console.error('Erro ao verificar assinatura:', err);
      setError('Erro ao verificar assinatura');
    } finally {
      setLoading(false);
    }
  };

  const hasActiveSubscription = () => {
    if (!subscription) return false;
    
    // Verificar se a assinatura está ativa e não expirou
    const now = new Date();
    const endDate = new Date(subscription.current_period_end);
    
    return subscription.status === 'active' && endDate > now;
  };

  const getDaysUntilExpiration = () => {
    if (!subscription) return 0;
    
    const now = new Date();
    const endDate = new Date(subscription.current_period_end);
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, diffDays);
  };

  const isSubscriptionExpiringSoon = () => {
    const daysUntilExpiration = getDaysUntilExpiration();
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  };

  return {
    subscription,
    plan,
    loading,
    error,
    hasActiveSubscription: hasActiveSubscription(),
    daysUntilExpiration: getDaysUntilExpiration(),
    isExpiringSoon: isSubscriptionExpiringSoon(),
    refreshSubscription: checkSubscription
  };
}; 