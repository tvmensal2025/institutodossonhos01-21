import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, AlertCircle, CheckCircle } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';

export const SubscriptionStatus: React.FC = () => {
  const { subscription, plan, hasActiveSubscription, daysUntilExpiration, isExpiringSoon } = useSubscription();
  const { toast } = useToast();

  if (!subscription) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Crown className="w-3 h-3 mr-1" />
        Gratuito
      </Badge>
    );
  }

  if (hasActiveSubscription) {
    return (
      <div className="flex items-center gap-2">
        <Badge variant="default" className="text-xs">
          <CheckCircle className="w-3 h-3 mr-1" />
          {plan?.name || 'Premium'}
        </Badge>
        
        {isExpiringSoon && (
          <Badge variant="destructive" className="text-xs">
            <AlertCircle className="w-3 h-3 mr-1" />
            Expira em {daysUntilExpiration} dias
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Badge variant="outline" className="text-xs">
      <AlertCircle className="w-3 h-3 mr-1" />
      Assinatura Inativa
    </Badge>
  );
};

export default SubscriptionStatus; 