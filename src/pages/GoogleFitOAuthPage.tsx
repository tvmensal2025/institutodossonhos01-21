import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  Heart, 
  Footprints, 
  Flame, 
  Clock, 
  Moon, 
  Smartphone,
  Shield,
  TrendingUp,
  ArrowLeft,
  CheckCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useGoogleFit } from '@/hooks/useGoogleFit';

const GoogleFitOAuthPage = () => {
  const [connecting, setConnecting] = useState(false);
  const [alreadyConnected, setAlreadyConnected] = useState<boolean | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { connectGoogleFit: connectFit, isConnected, checkConnectionStatus } = useGoogleFit();

  // Verificar conexão existente e redirecionar automaticamente
  useEffect(() => {
    checkConnectionStatus();
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { setAlreadyConnected(false); return; }
        
        const { data: tokenRow }: any = await (supabase as any)
          .from('google_fit_tokens')
          .select('expires_at')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (tokenRow && new Date(tokenRow.expires_at) > new Date()) {
          setAlreadyConnected(true);
          // Redirecionar suavemente
          navigate('/dashboard', { replace: true });
        } else {
          setAlreadyConnected(false);
        }
      } catch {
        setAlreadyConnected(false);
      }
    })();
  }, [navigate, checkConnectionStatus]);

  const connectGoogleFit = async () => {
    try {
      setConnecting(true);
      console.log('🚀 Iniciando conexão Google Fit via hook...');
      
      // Usar o hook useGoogleFit que já tem toda a lógica correta
      await connectFit();
      
    } catch (error) {
      console.error('❌ Erro ao conectar Google Fit:', error);
      setConnecting(false);
      toast({
        title: '❌ Erro',
        description: 'Erro ao conectar com Google Fit',
        variant: 'destructive',
      });
    }
  };

  const features = [
    {
      icon: <Footprints className="h-6 w-6" />,
      title: "Passos e Distância",
      description: "Acompanhe seus passos diários e distância percorrida"
    },
    {
      icon: <Flame className="h-6 w-6" />,
      title: "Calorias Queimadas", 
      description: "Monitore quantas calorias você queima durante o dia"
    },
    {
      icon: <Heart className="h-6 w-6" />,
      title: "Frequência Cardíaca",
      description: "Dados de frequência cardíaca em repouso e durante exercícios"
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Atividades Físicas",
      description: "Registros automáticos de corrida, caminhada, ciclismo e mais"
    },
    {
      icon: <Moon className="h-6 w-6" />,
      title: "Dados de Sono",
      description: "Duração e qualidade do sono para melhor recovery"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "Análises e Tendências",
      description: "Gráficos detalhados e insights sobre sua evolução"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Activity className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Conectar Google Fit</h1>
              <p className="text-sm text-muted-foreground">Sincronize seus dados de saúde e atividade</p>
            </div>
          </div>
          <Link to="/dashboard">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Seção Principal */}
        <div className="text-center space-y-6 mb-12">
          <div className="space-y-3">
            <h2 className="text-4xl font-bold text-foreground">
              Conecte-se ao Google Fit
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Sincronize automaticamente seus dados de atividade física, saúde e bem-estar 
              para ter uma visão completa do seu progresso
            </p>
          </div>

          <Alert className="max-w-2xl mx-auto">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Seus dados estão seguros.</strong> Utilizamos conexão criptografada e 
              seguimos todas as diretrizes de privacidade do Google. Você pode revogar o acesso a qualquer momento.
            </AlertDescription>
          </Alert>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <Card key={index} className="health-card">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Como Funciona */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Como Funciona</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold">Autorize o Acesso</h3>
                <p className="text-sm text-muted-foreground">
                  Clique em "Conectar Agora" e autorize o acesso aos seus dados do Google Fit
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold">Sincronização Automática</h3>
                <p className="text-sm text-muted-foreground">
                  Seus dados serão sincronizados automaticamente e estarão sempre atualizados
                </p>
              </div>
              
              <div className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold">Visualize seu Progresso</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe gráficos detalhados e insights sobre sua evolução na saúde
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados Coletados */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Dados que Serão Coletados</CardTitle>
            <CardDescription>
              Transparência total sobre quais informações acessamos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Contagem de passos e distância</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Calorias queimadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Minutos de atividade física</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Frequência cardíaca</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Dados de sono</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Histórico de atividades</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de Conexão */}
        <div className="text-center space-y-4">
          <Button 
            onClick={connectGoogleFit}
            disabled={connecting || alreadyConnected === true || isConnected}
            size="lg"
            className="px-12 py-6 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold shadow-lg"
          >
            {alreadyConnected || isConnected ? 'Já conectado' : (connecting ? 'Conectando...' : 'Conectar Agora')}
          </Button>
          {(alreadyConnected || isConnected) && (
            <p className="text-sm text-green-600">Conexão encontrada. Redirecionando...</p>
          )}
          <p className="text-sm text-muted-foreground">Ao conectar, você concorda em compartilhar seus dados do Google Fit conosco</p>
        </div>
      </div>
    </div>
  );
};

export default GoogleFitOAuthPage;