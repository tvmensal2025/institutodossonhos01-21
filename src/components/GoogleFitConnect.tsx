import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useGoogleFit } from '@/hooks/useGoogleFit';
import { Activity, Heart, Zap, Clock, TrendingUp, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const GoogleFitConnect: React.FC = () => {
  const { isConnected, isLoading, connectGoogleFit, disconnectGoogleFit, syncGoogleFitData, checkConnectionStatus } = useGoogleFit();
  const { toast } = useToast();

  useEffect(() => {
    // Ouvir mensagens do popup de autorização
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'GOOGLE_FIT_CONNECTED') {
        if (event.data.success) {
          toast({
            title: "✅ Conectado!",
            description: "Google Fit conectado com sucesso!"
          });
          checkConnectionStatus();
        }
      } else if (event.data?.type === 'GOOGLE_FIT_ERROR') {
        toast({
          title: "❌ Erro na Conexão",
          description: event.data.message || "Erro ao conectar com Google Fit",
          variant: "destructive"
        });
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [toast, checkConnectionStatus]);

  const handleConnect = async () => {
    try {
      await connectGoogleFit();
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao conectar com Google Fit",
        variant: "destructive"
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectGoogleFit();
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao desconectar Google Fit",
        variant: "destructive"
      });
    }
  };

  const handleSync = async () => {
    try {
      await syncGoogleFitData();
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Erro ao sincronizar dados do Google Fit",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="p-4 xs:p-5 sm:p-6">
        <CardTitle className="flex items-center gap-2 xs:gap-3 text-lg xs:text-xl sm:text-2xl">
          <Activity className="h-6 w-6 xs:h-7 xs:w-7 sm:h-8 sm:w-8 text-primary" />
          Conecte o Google Fit e acompanhe sua evolução
        </CardTitle>
        <CardDescription className="text-base xs:text-lg sm:text-xl">
          Sincronize automaticamente seus passos, calorias ativas, minutos de intensidade, 
          sono e frequência cardíaca para análises inteligentes e relatórios do Dr. Vital.
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 xs:space-y-5 sm:space-y-6 p-4 xs:p-5 sm:p-6">
        {/* Status da conexão */}
        <div className="flex items-center justify-between p-3 xs:p-4 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2 xs:gap-3">
            {isConnected ? (
              <>
                <CheckCircle className="h-6 w-6 xs:h-7 xs:w-7 text-green-500" />
                <span className="font-medium text-base xs:text-lg">Conectado ao Google Fit</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-sm xs:text-base px-2 xs:px-3 py-1 xs:py-2">
                  Ativo
                </Badge>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 xs:h-7 xs:w-7 text-red-500" />
                <span className="font-medium text-base xs:text-lg">Não conectado</span>
                <Badge variant="secondary" className="bg-red-100 text-red-800 text-sm xs:text-base px-2 xs:px-3 py-1 xs:py-2">
                  Inativo
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Dados que serão sincronizados */}
        <div className="grid grid-cols-1 gap-3 xs:gap-4">
          <div className="flex items-center gap-3 xs:gap-4 p-3 xs:p-4 bg-blue-50 rounded-lg">
            <TrendingUp className="h-6 w-6 xs:h-7 xs:w-7 text-blue-600" />
            <div>
              <p className="font-medium text-base xs:text-lg">Passos e distância</p>
              <p className="text-sm xs:text-base text-muted-foreground">Contagem diária</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 xs:gap-4 p-3 xs:p-4 bg-red-50 rounded-lg">
            <Heart className="h-6 w-6 xs:h-7 xs:w-7 text-red-600" />
            <div>
              <p className="font-medium text-base xs:text-lg">FC min/média/máx</p>
              <p className="text-sm xs:text-base text-muted-foreground">Frequência cardíaca</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 xs:gap-4 p-3 xs:p-4 bg-yellow-50 rounded-lg">
            <Zap className="h-6 w-6 xs:h-7 xs:w-7 text-yellow-600" />
            <div>
              <p className="font-medium text-base xs:text-lg">Calorias ativas</p>
              <p className="text-sm xs:text-base text-muted-foreground">Queima calórica</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 xs:gap-4 p-3 xs:p-4 bg-green-50 rounded-lg">
            <Clock className="h-6 w-6 xs:h-7 xs:w-7 text-green-600" />
            <div>
              <p className="font-medium text-base xs:text-lg">Heart minutes e sono</p>
              <p className="text-sm xs:text-base text-muted-foreground">Atividade e descanso</p>
            </div>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col gap-3 xs:gap-4">
          {!isConnected ? (
            <Button 
              onClick={handleConnect} 
              disabled={isLoading}
              className="flex-1 h-12 xs:h-14 sm:h-16 text-base xs:text-lg sm:text-xl"
              size="lg"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 border-b-2 border-white mr-2 xs:mr-3" />
                  Conectando...
                </>
              ) : (
                <>
                  <Activity className="mr-2 h-5 w-5 xs:h-6 xs:w-6" />
                  Conectar Google Fit
                </>
              )}
            </Button>
          ) : (
            <>
              <Button 
                onClick={handleSync} 
                disabled={isLoading}
                className="flex-1 h-12 xs:h-14 sm:h-16 text-base xs:text-lg sm:text-xl"
                size="lg"
                variant="default"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 xs:h-6 xs:w-6 border-b-2 border-white mr-2 xs:mr-3" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 xs:h-6 xs:w-6" />
                    Sincronizar Dados
                  </>
                )}
              </Button>
              
              <Button 
                onClick={handleDisconnect} 
                variant="outline"
                className="flex-1 h-12 xs:h-14 sm:h-16 text-base xs:text-lg sm:text-xl"
                size="lg"
              >
                <XCircle className="mr-2 h-5 w-5 xs:h-6 xs:w-6" />
                Desconectar
              </Button>
            </>
          )}
        </div>

        {/* Nota de sucesso */}
        {isConnected && (
          <div className="p-3 xs:p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-base xs:text-lg text-green-700 text-center">
              🎉 Google Fit conectado com sucesso! Clique em "Sincronizar Dados" para começar a coletar suas informações de saúde e atividade.
            </p>
          </div>
        )}

        {/* Nota de segurança */}
        <div className="p-3 xs:p-4 bg-muted/30 border border-muted rounded-lg">
          <p className="text-sm xs:text-base text-muted-foreground text-center">
            🔒 Autorização única. Seus dados permanecem salvos com segurança no Supabase.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
