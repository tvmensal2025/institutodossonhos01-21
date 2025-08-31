import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Heart, 
  Target, 
  Scale, 
  Activity, 
  Trophy, 
  Users, 
  ArrowRight, 
  ArrowLeft,
  CheckCircle,
  Play,
  Bluetooth,
  Smartphone,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
}

const OnboardingFlow: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Bem-vindo ao Instituto dos Sonhos!',
      description: 'Sua jornada de transformação começa aqui',
      icon: Heart,
      content: (
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-32 h-32">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-primary to-secondary rounded-full w-full h-full flex items-center justify-center">
              <Heart className="h-16 w-16 text-white" />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Transforme sua vida em 30 dias</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Plataforma completa de saúde e bem-estar com tecnologia de ponta, 
              gamificação e análise inteligente para resultados reais.
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">10k+</div>
                <div className="text-sm text-muted-foreground">Usuários</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-secondary">95%</div>
                <div className="text-sm text-muted-foreground">Sucesso</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'features',
      title: 'Suas Ferramentas de Transformação',
      description: 'Descubra o que você pode fazer na plataforma',
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg">
              <Scale className="h-6 w-6 text-primary mt-1" />
              <div>
                <h4 className="font-semibold">Balança Inteligente</h4>
                <p className="text-sm text-muted-foreground">
                  Conecte sua Xiaomi Scale para medições automáticas
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-secondary/5 rounded-lg">
              <Activity className="h-6 w-6 text-secondary mt-1" />
              <div>
                <h4 className="font-semibold">Missões Diárias</h4>
                <p className="text-sm text-muted-foreground">
                  Sistema gamificado para manter motivação
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-accent/5 rounded-lg">
              <BarChart3 className="h-6 w-6 text-accent mt-1" />
              <div>
                <h4 className="font-semibold">Análise Avançada</h4>
                <p className="text-sm text-muted-foreground">
                  Gráficos e relatórios do seu progresso
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-500/5 rounded-lg">
              <Users className="h-6 w-6 text-green-500 mt-1" />
              <div>
                <h4 className="font-semibold">Comunidade</h4>
                <p className="text-sm text-muted-foreground">
                  Conecte-se e compartilhe sua jornada
                </p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'device-setup',
      title: 'Conecte sua Balança (Opcional)',
      description: 'Para medições automáticas e precisas',
      icon: Bluetooth,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center">
            <Bluetooth className="h-12 w-12 text-blue-500" />
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Xiaomi Mi Body Composition Scale 2</h3>
            <p className="text-muted-foreground">
              Conecte sua balança para monitoramento automático de:
            </p>
            <div className="space-y-2">
              <Badge variant="outline">Peso</Badge>
              <Badge variant="outline">IMC</Badge>
              <Badge variant="outline">% Gordura</Badge>
              <Badge variant="outline">Massa Muscular</Badge>
              <Badge variant="outline">Água Corporal</Badge>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <Button 
                onClick={() => navigate('/app/scale-test')}
                className="w-full"
              >
                <Bluetooth className="h-4 w-4 mr-2" />
                Conectar Balança Agora
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep(currentStep + 1)}
                className="w-full"
              >
                Conectar Depois
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'navigation',
      title: 'Navegação pela Plataforma',
      description: 'Saiba onde encontrar cada funcionalidade',
      icon: Smartphone,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Dashboard</h4>
                <p className="text-sm text-muted-foreground">Visão geral do seu progresso</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/dashboard')}>
                <Play className="h-3 w-3 mr-1" />
                Visitar
              </Button>
            </div>
            
            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-secondary" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Missões Diárias</h4>
                <p className="text-sm text-muted-foreground">Complete desafios e ganhe pontos</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/app/missions')}>
                <Play className="h-3 w-3 mr-1" />
                Começar
              </Button>
            </div>
            
            <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 text-accent" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">Metas & Desafios</h4>
                <p className="text-sm text-muted-foreground">Defina objetivos e acompanhe resultados</p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => navigate('/app/goals')}>
                <Play className="h-3 w-3 mr-1" />
                Explorar
              </Button>
            </div>
          </div>
        </div>
      )
    },
    {
      id: 'complete',
      title: 'Tudo Pronto!',
      description: 'Sua jornada de transformação começa agora',
      icon: CheckCircle,
      content: (
        <div className="text-center space-y-6">
          <div className="mx-auto w-32 h-32 bg-green-500/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <div className="space-y-4">
            <h3 className="text-2xl font-bold">Parabéns! 🎉</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Você concluiu o onboarding! Agora é hora de começar sua jornada 
              de transformação e conquistar seus objetivos.
            </p>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Próximos Passos Recomendados:</h4>
              <ol className="text-sm text-muted-foreground space-y-1 text-left max-w-sm mx-auto">
                <li>1. Complete sua primeira missão diária</li>
                <li>2. Defina suas metas de saúde</li>
                <li>3. Conecte sua balança (se ainda não fez)</li>
                <li>4. Explore a comunidade</li>
              </ol>
            </div>
          </div>
        </div>
      )
    }
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStepData.id]);
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    try {
      // Marcar onboarding como completo no perfil do usuário
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Use profiles table instead
        await supabase
          .from('profiles')
          .upsert({
            user_id: user.id,
            onboarding_completed: true,
            onboarding_completed_at: new Date().toISOString()
          });
      }
      
      toast({
        title: "Onboarding Concluído!",
        description: "Bem-vindo ao Instituto dos Sonhos! Sua jornada começa agora.",
      });
      
      onComplete();
    } catch (error) {
      console.error('Erro ao completar onboarding:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o progresso do onboarding.",
        variant: "destructive",
      });
    }
  };

  const skipOnboarding = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-between mb-4">
            <Badge variant="outline">
              Passo {currentStep + 1} de {steps.length}
            </Badge>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={skipOnboarding}
              className="text-muted-foreground hover:text-foreground"
            >
              Pular Tutorial
            </Button>
          </div>
          
          <Progress value={progress} className="mb-6" />
          
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <currentStepData.icon className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          <CardTitle className="text-2xl mb-2">{currentStepData.title}</CardTitle>
          <p className="text-muted-foreground">{currentStepData.description}</p>
        </CardHeader>
        
        <CardContent>
          <div className="mb-8">
            {currentStepData.content}
          </div>
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            
            <Button onClick={handleNext}>
              {currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Começar Jornada
                </>
              ) : (
                <>
                  Próximo
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OnboardingFlow;