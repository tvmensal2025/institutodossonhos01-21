
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, CreditCard, Crown, Zap, Star, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useStripeSubscription } from '@/hooks/useStripeSubscription';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingPeriod: 'monthly' | 'yearly';
  features: string[];
  highlighted?: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Funcionalidades essenciais para começar sua jornada',
    price: 29.90,
    billingPeriod: 'monthly',
    features: [
      'Dashboard completo',
      'Missões diárias',
      'Teste de sabotadores',
      'Gráficos básicos',
      'Suporte por email'
    ],
    icon: Zap,
    color: 'text-blue-600'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Tudo do básico + recursos avançados',
    price: 49.90,
    billingPeriod: 'monthly',
    features: [
      'Todas as funcionalidades básicas',
      'Integração Google Fit',
      'Relatórios semanais personalizados',
      'Comunidade premium',
      'Suporte prioritário',
      'Sessões personalizadas'
    ],
    highlighted: true,
    icon: Crown,
    color: 'text-purple-600'
  },
  {
    id: 'pro',
    name: 'Professional',
    description: 'Para profissionais da saúde e coaches',
    price: 99.90,
    billingPeriod: 'monthly',
    features: [
      'Todas as funcionalidades premium',
      'Dashboard administrativo completo',
      'Gestão de múltiplos clientes',
      'Relatórios avançados',
      'API para integrações',
      'Suporte 24/7',
      'Treinamentos exclusivos'
    ],
    icon: Star,
    color: 'text-gold-600'
  }
];

export const PaymentPlans: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const { toast } = useToast();
  const { status, createCheckout, manageSubscription } = useStripeSubscription();

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    await createCheckout(planId);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Escolha seu Plano</h1>
        <p className="text-muted-foreground text-lg">
          Transforme sua saúde com as ferramentas certas para você
        </p>
        
        {/* Current Subscription Status */}
        {status.subscribed && (
          <Card className="bg-primary/10 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="w-5 h-5 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold">Plano Atual: {status.subscription_tier}</p>
                    {status.subscription_end && (
                      <p className="text-sm text-muted-foreground">
                        Renovação: {new Date(status.subscription_end).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={manageSubscription}>
                  <Settings className="w-4 h-4 mr-2" />
                  Gerenciar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isSelected = selectedPlan === plan.id;
          const isLoading = status.isLoading && isSelected;
          const isCurrentPlan = status.subscribed && 
            ((plan.id === 'basic' && status.subscription_tier === 'Básico') ||
             (plan.id === 'premium' && status.subscription_tier === 'Premium') ||
             (plan.id === 'pro' && status.subscription_tier === 'Professional'));
          
          return (
            <Card 
              key={plan.id} 
              className={`relative transition-all duration-300 ${
                plan.highlighted 
                  ? 'border-primary shadow-xl scale-105' 
                  : 'hover:shadow-lg hover:scale-102'
              } ${isSelected ? 'ring-2 ring-primary' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-white px-4 py-1">
                    Mais Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-br from-primary/20 to-primary/5`}>
                    <Icon className={`w-8 h-8 ${plan.color}`} />
                  </div>
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
                
                <div className="pt-4">
                  <div className="text-4xl font-bold">
                    R$ {plan.price.toFixed(2).replace('.', ',')}
                    <span className="text-lg text-muted-foreground font-normal">/mês</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Features */}
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {/* CTA Button */}
                <Button 
                  className={`w-full ${plan.highlighted ? 'btn-gradient' : ''}`}
                  variant={isCurrentPlan ? 'secondary' : plan.highlighted ? 'default' : 'outline'}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isLoading || isCurrentPlan}
                >
                  {isCurrentPlan ? (
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Plano Atual
                    </div>
                  ) : isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      Processando...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Escolher {plan.name}
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Por que escolher nossa plataforma?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Resultados Rápidos</h3>
                <p className="text-sm text-muted-foreground">
                  Veja mudanças significativas em suas métricas de saúde em poucas semanas
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Crown className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-semibold mb-2">Tecnologia Avançada</h3>
                <p className="text-sm text-muted-foreground">
                  IA e análise de dados para insights personalizados sobre sua saúde
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-semibold mb-2">Suporte Especializado</h3>
                <p className="text-sm text-muted-foreground">
                  Equipe de especialistas em saúde e bem-estar para te ajudar
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card>
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Posso cancelar a qualquer momento?</h4>
            <p className="text-sm text-muted-foreground">
              Sim, você pode cancelar sua assinatura a qualquer momento sem taxas adicionais.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Há garantia de satisfação?</h4>
            <p className="text-sm text-muted-foreground">
              Oferecemos 30 dias de garantia. Se não ficar satisfeito, devolvemos 100% do valor.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Como funciona o suporte?</h4>
            <p className="text-sm text-muted-foreground">
              Plano básico tem suporte por email, Premium tem suporte prioritário e Pro tem suporte 24/7.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentPlans;
