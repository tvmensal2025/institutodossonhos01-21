import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, RefreshCw, ArrowRight } from 'lucide-react';

export const GoogleFitCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Verificar se estamos na porta errada e redirecionar
    if (window.location.port === '3000') {
      const currentUrl = new URL(window.location.href);
      currentUrl.port = '8080';
      window.location.href = currentUrl.toString();
      return;
    }

    // Processar o callback do Google OAuth
    const urlParams = new URLSearchParams(location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');

    if (error) {
      console.error('❌ Erro na autorização Google:', error);
      return;
    }

    if (code && state) {
      try {
        // Decodificar o state para obter informações
        const stateData = JSON.parse(decodeURIComponent(state));
        console.log('✅ Callback Google OAuth processado:', { code, stateData });
        
        // Redirecionar para a tela de progresso do dashboard após 2 segundos
        setTimeout(() => {
          navigate('/dashboard?tab=progress'); // Redirecionar para aba de progresso
        }, 2000);
      } catch (error) {
        console.error('❌ Erro ao processar callback:', error);
      }
    }
  }, [navigate, location]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-gray-900">
            Google Fit Conectado!
          </CardTitle>
          <CardDescription className="text-gray-600">
            Seus dados de saúde foram sincronizados com sucesso
          </CardDescription>
        </CardHeader>
        
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Redirecionando para o dashboard...</span>
          </div>
          
          <Button 
            onClick={() => navigate('/dashboard')}
            className="w-full bg-primary hover:bg-primary/90"
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Ir para o Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};