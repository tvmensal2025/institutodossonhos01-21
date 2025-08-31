import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { 
  Lock, 
  Crown, 
  Star, 
  CreditCard, 
  Check,
  Gift,
  Zap,
  Target,
  Users,
  Calendar,
  CreditCard as CreditCardIcon
} from 'lucide-react';

interface FeatureLockGuardProps {
  children: React.ReactNode;
  feature: 'desafios' | 'comunidade' | 'sessoes' | 'assinatura';
  title?: string;
  description?: string;
  showPreview?: boolean;
  previewContent?: React.ReactNode;
}

const featureConfig = {
  desafios: {
    title: "Desafios Premium",
    description: "Acesse desafios personalizados, competições e gamificação avançada",
    icon: Target,
    benefits: [
      "🎯 Desafios personalizados",
      "🏆 Competições em tempo real", 
      "📊 Progresso detalhado",
      "🏅 Sistema de conquistas",
      "📈 Rankings e estatísticas"
    ]
  },
  comunidade: {
    title: "Comunidade Premium",
    description: "Conecte-se com outros usuários, compartilhe progresso e inspire-se",
    icon: Users,
    benefits: [
      "👥 Comunidade exclusiva",
      "💬 Chat em tempo real",
      "📱 Compartilhamento de progresso",
      "🤝 Grupos de apoio",
      "🏆 Desafios em grupo"
    ]
  },
  sessoes: {
    title: "Sessões Personalizadas",
    description: "Acesse sessões exclusivas com especialistas e coaches",
    icon: Calendar,
    benefits: [
      "🎓 Sessões com especialistas",
      "📅 Agendamento flexível",
      "📹 Videochamadas",
      "📋 Relatórios personalizados",
      "🎯 Acompanhamento individual"
    ]
  },
  assinatura: {
    title: "Gestão de Assinatura",
    description: "Gerencie sua assinatura, planos e pagamentos",
    icon: CreditCardIcon,
    benefits: [
      "💳 Gestão de pagamentos",
      "📊 Histórico de faturas",
      "🔄 Alteração de planos",
      "📱 Notificações automáticas",
      "🎁 Benefícios exclusivos"
    ]
  }
};

const FeatureLockGuard: React.FC<FeatureLockGuardProps> = ({
  children,
  feature,
  title,
  description,
  showPreview = false,
  previewContent
}) => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const { toast } = useToast();
  const { subscription, plan, loading, hasActiveSubscription } = useSubscription();

  const config = featureConfig[feature];
  const IconComponent = config.icon;

  // Enquanto carrega, mostrar skeleton
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    );
  }

  // Se tem acesso, mostrar conteúdo normalmente
  if (hasActiveSubscription) {
    return <>{children}</>;
  }

  const handleSubscribe = async () => {
    try {
      setShowSubscriptionModal(false);
      
      // Redirecionar para página de planos
      window.location.href = '/assinatura';
      
      toast({
        title: "Redirecionando...",
        description: "Você será direcionado para escolher seu plano.",
      });
    } catch (error) {
      console.error('Erro ao redirecionar:', error);
      toast({
        title: "Erro",
        description: "Erro ao redirecionar para assinatura.",
        variant: "destructive",
      });
    }
  };



  // Se não tem acesso, mostrar bloqueio
  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-lg flex items-center justify-center gap-2">
            <IconComponent className="h-5 w-5" />
            {title || config.title}
          </CardTitle>
          <CardDescription>
            {description || config.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status atual */}
          <div className="text-center">
            <Badge variant="secondary" className="mb-2">
              <Lock className="h-3 w-3 mr-1" />
              Conteúdo Bloqueado
            </Badge>
            <p className="text-sm text-muted-foreground">
              Esta funcionalidade está disponível apenas para assinantes premium
            </p>
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center">Com a Assinatura Premium você terá:</h4>
            <div className="grid grid-cols-1 gap-2">
              {config.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Preview do conteúdo se habilitado */}
          {showPreview && previewContent && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">Preview do conteúdo:</p>
              {previewContent}
            </div>
          )}

          {/* Botões de ação */}
          <div className="space-y-3">
            <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Crown className="mr-2 h-4 w-4" />
                  Desbloquear Premium
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Escolha seu Plano</DialogTitle>
                  <DialogDescription>
                    Selecione o plano ideal para você e desbloqueie todas as funcionalidades premium.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-3">
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={handleSubscribe}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Zap className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Básico</div>
                          <div className="text-sm text-muted-foreground">R$ 29,90/mês</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      className="justify-start"
                      onClick={handleSubscribe}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Crown className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Premium</div>
                          <div className="text-sm text-muted-foreground">R$ 49,90/mês</div>
                        </div>
                      </div>
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="justify-start"
                      onClick={handleSubscribe}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Star className="h-4 w-4 text-red-600" />
                        </div>
                        <div className="text-left">
                          <div className="font-medium">Professional</div>
                          <div className="text-sm text-muted-foreground">R$ 99,90/mês</div>
                        </div>
                      </div>
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full" onClick={() => window.history.back()}>
              Voltar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeatureLockGuard; 