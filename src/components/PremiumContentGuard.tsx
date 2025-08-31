import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
// import { useSubscription } from '@/hooks/useSubscription';
import { useToast } from '@/hooks/use-toast';
import { 
  Lock, 
  Crown, 
  Star, 
  CreditCard, 
  Check,
  Gift,
  Zap
} from 'lucide-react';

interface PremiumContentGuardProps {
  children: React.ReactNode;
  contentType: string;
  contentId: string;
  title?: string;
  description?: string;
  fallbackContent?: React.ReactNode;
  showPreview?: boolean;
  previewContent?: React.ReactNode;
}

const PremiumContentGuard: React.FC<PremiumContentGuardProps> = ({
  children,
  contentType,
  contentId,
  title = "Conteúdo Premium",
  description = "Este conteúdo está disponível apenas para assinantes premium.",
  fallbackContent,
  showPreview = false,
  previewContent
}) => {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // const { userSubscription, isLoading } = useSubscription();
  const hasActiveSubscription = false;
  const checkContentAccess = async () => false;
  const availablePlans = [];
  const createSubscription = async () => {};
  const currentSubscription = null;
  const subscriptionLoading = false;

  const { toast } = useToast();

  useEffect(() => {
    checkAccess();
  }, [contentType, contentId, hasActiveSubscription]);

  const checkAccess = async () => {
    setIsLoading(true);
    try {
      const access = await checkContentAccess();
      setHasAccess(access);
    } catch (error) {
      console.error('Erro ao verificar acesso:', error);
      setHasAccess(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    try {
      await createSubscription();
      setShowSubscriptionModal(false);
      await checkAccess();
      toast({
        title: "Assinatura Iniciada!",
        description: "Verifique seu email para instruções de pagamento."
      });
    } catch (error) {
      console.error('Erro ao criar assinatura:', error);
    }
  };

  // Enquanto carrega, mostrar skeleton
  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-32 bg-muted rounded-lg"></div>
      </div>
    );
  }

  // Se tem acesso, mostrar conteúdo normalmente
  if (hasAccess) {
    return <>{children}</>;
  }

  // Se não tem acesso, mostrar bloqueio
  return (
    <div className="relative">
      {/* Preview do conteúdo (opcional) */}
      {showPreview && previewContent && (
        <div className="relative">
          <div className="blur-sm pointer-events-none">
            {previewContent}
          </div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background"></div>
        </div>
      )}

      {/* Card de bloqueio - Design mais sutil */}
      <Card className="border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-blue-600">
            <Crown className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-lg">
            <Lock className="h-4 w-4" />
            {title}
          </CardTitle>
          <CardDescription className="text-center text-sm">
            {description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status atual */}
          <div className="text-center">
            {currentSubscription ? (
              <div className="space-y-2">
                <Badge variant="outline" className="text-sm">
                  Status: {currentSubscription.status === 'pending' ? 'Pagamento Pendente' : 'Assinatura Inativa'}
                </Badge>
                {currentSubscription.status === 'pending' && (
                  <p className="text-sm text-muted-foreground">
                    Complete o pagamento para liberar o acesso
                  </p>
                )}
              </div>
            ) : (
              <Badge variant="secondary">
                Não Assinante
              </Badge>
            )}
          </div>

          {/* Benefícios */}
          <div className="space-y-3">
            <h4 className="font-semibold text-center">Com a Assinatura Premium você terá:</h4>
            <div className="grid grid-cols-1 gap-2">
              {[
                "🎯 Acesso completo a todos os cursos",
                "📚 Conteúdo premium desbloqueado",
                "🏆 Certificados de conclusão",
                "📱 Suporte prioritário",
                "📄 Download de materiais"
              ].map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de ação */}
          <div className="space-y-3">
            {!currentSubscription ? (
              <Dialog open={showSubscriptionModal} onOpenChange={setShowSubscriptionModal}>
                <DialogTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700">
                    <Crown className="mr-2 h-4 w-4" />
                    Assinar por R$ 29,90/mês
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Crown className="h-5 w-5 text-yellow-500" />
                      Plataforma dos Sonhos Premium
                    </DialogTitle>
                    <DialogDescription>
                      Escolha seu plano e comece agora mesmo!
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4">
                    {availablePlans.map((plan) => (
                      <Card key={plan.id} className="border-2 border-yellow-200">
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-lg">{plan.name}</CardTitle>
                              <CardDescription>{plan.description}</CardDescription>
                            </div>
                                                         <Badge className="bg-gradient-to-r from-purple-500 to-blue-600">
                               <Star className="w-3 h-3 mr-1" />
                               Premium
                             </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                              R$ {plan.price.toFixed(2).replace('.', ',')}
                            </div>
                            <div className="text-sm text-muted-foreground">por mês</div>
                          </div>

                          <div className="space-y-2">
                            {plan.features.map((feature, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Check className="h-4 w-4 text-green-600" />
                                <span>{feature}</span>
                              </div>
                            ))}
                          </div>

                                                     <Button 
                             className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                             onClick={() => handleSubscribe(plan.id)}
                             disabled={subscriptionLoading}
                           >
                            {subscriptionLoading ? (
                              "Processando..."
                            ) : (
                              <>
                                <CreditCard className="mr-2 h-4 w-4" />
                                Assinar Agora
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>
                    ))}

                    <div className="text-center text-sm text-muted-foreground">
                      <Zap className="inline h-4 w-4 mr-1" />
                      Ativação imediata após confirmação do pagamento
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            ) : currentSubscription.status === 'pending' ? (
              <div className="text-center space-y-2">
                <Button variant="outline" className="w-full" onClick={checkAccess}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Verificar Pagamento
                </Button>
                <p className="text-xs text-muted-foreground">
                  Já efetuou o pagamento? Clique para verificar
                </p>
              </div>
            ) : (
              <Button variant="outline" className="w-full">
                <Gift className="mr-2 h-4 w-4" />
                Reativar Assinatura
              </Button>
            )}

            {/* Conteúdo alternativo se fornecido */}
            {fallbackContent && (
              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground text-center mb-3">
                  Ou acesse nosso conteúdo gratuito:
                </p>
                {fallbackContent}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumContentGuard; 