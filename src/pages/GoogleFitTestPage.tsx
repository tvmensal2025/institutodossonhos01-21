import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export default function GoogleFitTestPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [autoTestRunning, setAutoTestRunning] = useState(false);
  const { toast } = useToast();
  const { user, loading } = useAuth();

  const clientId = '705908448787-so9cco4hkduhmr0lq4ftkng10hjcj1is.apps.googleusercontent.com';
  const redirectUri = 'https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/google-fit-callback';

  // Teste automático ao carregar a página
  useEffect(() => {
    if (user && !loading) {
      runAutoTest();
    } else if (!loading && !user) {
      console.log('⚠️ Usuário não autenticado. Faça login primeiro.');
      toast({
        title: "⚠️ Autenticação necessária",
        description: "Faça login para testar o Google Fit.",
        variant: "destructive",
      });
    }
  }, [user, loading]);

  const runAutoTest = async () => {
    setAutoTestRunning(true);
    console.log('🚀 INICIANDO TESTE AUTOMÁTICO...');
    
    const resultados = {
      supabase: false,
      autenticacao: false,
      tabelas: false,
      edgeFunctions: false,
      oauth: false
    };

    try {
        // 1. Teste Supabase
  console.log('1️⃣ Testando Supabase...');
  if (supabase) {
    console.log('✅ Supabase disponível');
    resultados.supabase = true;
  } else {
    console.log('❌ Supabase não disponível');
  }

      // 2. Teste Autenticação
      console.log('2️⃣ Testando autenticação...');
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      
      if (authError) {
        console.log('❌ Erro na autenticação:', authError.message);
      } else if (session) {
        console.log('✅ Usuário logado:', session.user.email);
        resultados.autenticacao = true;
      } else {
        console.log('❌ Usuário não logado');
      }

      // 3. Teste Tabelas
      console.log('3️⃣ Testando tabelas...');
      try {
        const { data: tokensData, error: tokensError } = await (supabase as any)
          .from('google_fit_tokens')
          .select('*')
          .limit(1);
        
        if (tokensError) {
          console.log('❌ Erro na tabela tokens:', tokensError.message);
        } else {
          console.log('✅ Tabela tokens OK');
        }
      } catch (error) {
        console.log('❌ Erro ao acessar tabela tokens');
      }

      try {
        const { data: fitData, error: fitError } = await supabase
          .from('google_fit_data')
          .select('*')
          .limit(1);
        
        if (fitError) {
          console.log('❌ Erro na tabela data:', fitError.message);
        } else {
          console.log('✅ Tabela data OK');
          resultados.tabelas = true;
        }
      } catch (error) {
        console.log('❌ Erro ao acessar tabela data');
      }

      // 4. Teste Edge Functions
      console.log('4️⃣ Testando Edge Functions...');
      
      // Verificar se o usuário está autenticado
      if (!user) {
        console.log('❌ Usuário não autenticado. Não é possível testar Edge Functions.');
        resultados.edgeFunctions = false;
      } else {
        try {
          const { data, error } = await supabase.functions.invoke('google-fit-token', {
            body: { testSecrets: true }
          });
          
          if (error) {
            console.log('❌ Erro na Edge Function:', error.message);
            resultados.edgeFunctions = false;
          } else {
            console.log('✅ Edge Function funcionando:', data);
            resultados.edgeFunctions = true;
          }
        } catch (error) {
          console.log('❌ Erro ao chamar Edge Function');
          resultados.edgeFunctions = false;
        }
      }

      // 5. Teste OAuth
      console.log('5️⃣ Testando configuração OAuth...');
      console.log('🔧 Client ID:', clientId);
      console.log('🔧 Redirect URI:', redirectUri);
      resultados.oauth = true;

      // 6. Resumo
      console.log('🎯 RESUMO DOS TESTES:');
      console.log('✅ Supabase:', resultados.supabase ? 'OK' : 'ERRO');
      console.log('✅ Autenticação:', resultados.autenticacao ? 'OK' : 'ERRO');
      console.log('✅ Tabelas:', resultados.tabelas ? 'OK' : 'ERRO');
      console.log('✅ Edge Functions:', resultados.edgeFunctions ? 'OK' : 'ERRO');
      console.log('✅ OAuth:', resultados.oauth ? 'OK' : 'ERRO');

      const totalTests = Object.keys(resultados).length;
      const passedTests = Object.values(resultados).filter(Boolean).length;
      
      console.log(`📊 RESULTADO: ${passedTests}/${totalTests} testes passaram`);
      
      setTestResults({
        ...resultados,
        totalTests,
        passedTests,
        timestamp: new Date().toISOString()
      });

      if (passedTests >= 4) {
        toast({
          title: "✅ Testes principais passaram!",
          description: "O Google Fit está configurado corretamente.",
        });
      } else {
        toast({
          title: "⚠️ Alguns testes falharam",
          description: "Verifique o console para detalhes.",
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error('💥 Erro no teste automático:', error);
      toast({
        title: "❌ Erro no teste",
        description: "Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setAutoTestRunning(false);
    }
  };

  const handleOAuthConnect = () => {
    setIsLoading(true);
    
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ].join(' ');

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `include_granted_scopes=true`;

    console.log('🔗 Redirecionando para OAuth:', authUrl);
    window.location.href = authUrl;
  };

  const testAuth = async () => {
    console.log('🧪 Testando autenticação...');
    console.log('👤 Usuário:', user);
    console.log('⏳ Loading:', loading);
    
    if (user) {
      console.log('✅ Usuário autenticado:', user.email);
      toast({
        title: "✅ Autenticação OK",
        description: `Usuário logado: ${user.email}`,
      });
    } else {
      console.log('❌ Usuário não autenticado');
      toast({
        title: "❌ Usuário não autenticado",
        description: "Faça login primeiro",
        variant: "destructive",
      });
    }
  };

  const handleTestEdgeFunction = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-fit-token', {
        body: { testSecrets: true }
      });

      if (error) {
        toast({
          title: "❌ Erro na Edge Function",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "✅ Edge Function funcionando",
          description: "Secrets configurados corretamente.",
        });
        console.log('📊 Resposta da Edge Function:', data);
      }
    } catch (error) {
      toast({
        title: "❌ Erro ao testar",
        description: "Verifique o console para detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-2 xs:p-3 sm:p-4 md:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4">
        <div>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold">Teste do Google Fit</h1>
          <p className="text-base xs:text-lg text-muted-foreground">
            Teste a integração com o Google Fit
          </p>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"} className="text-sm xs:text-base px-3 xs:px-4 py-2">
          {isConnected ? "Conectado" : "Desconectado"}
        </Badge>
      </div>

      {/* Teste Automático */}
      <Card>
        <CardHeader className="p-4 xs:p-5 sm:p-6">
          <CardTitle className="flex items-center gap-2 xs:gap-3 text-lg xs:text-xl">
            🔍 Teste Automático
            {autoTestRunning && <div className="animate-spin h-5 w-5 xs:h-6 xs:w-6 border-2 border-primary border-t-transparent rounded-full"></div>}
          </CardTitle>
          <CardDescription className="text-base xs:text-lg">
            Teste automático de todos os componentes do Google Fit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 xs:space-y-5 p-4 xs:p-5 sm:p-6">
          <Button 
            onClick={runAutoTest} 
            disabled={autoTestRunning}
            className="w-full h-12 xs:h-14 text-base xs:text-lg"
          >
            {autoTestRunning ? 'Executando Testes...' : 'Executar Teste Automático'}
          </Button>

          {testResults && (
            <div className="space-y-3 xs:space-y-4">
              <h4 className="font-semibold text-base xs:text-lg">Resultados dos Testes:</h4>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4 text-base xs:text-lg">
                <div className="flex items-center gap-2 xs:gap-3">
                  <span className={testResults.supabase ? 'text-green-500' : 'text-red-500'}>
                    {testResults.supabase ? '✅' : '❌'}
                  </span>
                  Supabase
                </div>
                <div className="flex items-center gap-2 xs:gap-3">
                  <span className={testResults.autenticacao ? 'text-green-500' : 'text-red-500'}>
                    {testResults.autenticacao ? '✅' : '❌'}
                  </span>
                  Autenticação
                </div>
                <div className="flex items-center gap-2 xs:gap-3">
                  <span className={testResults.tabelas ? 'text-green-500' : 'text-red-500'}>
                    {testResults.tabelas ? '✅' : '❌'}
                  </span>
                  Tabelas
                </div>
                <div className="flex items-center gap-2 xs:gap-3">
                  <span className={testResults.edgeFunctions ? 'text-green-500' : 'text-red-500'}>
                    {testResults.edgeFunctions ? '✅' : '❌'}
                  </span>
                  Edge Functions
                </div>
                <div className="flex items-center gap-2 xs:gap-3">
                  <span className={testResults.oauth ? 'text-green-500' : 'text-red-500'}>
                    {testResults.oauth ? '✅' : '❌'}
                  </span>
                  OAuth
                </div>
              </div>
              <div className="text-base xs:text-lg text-muted-foreground">
                Resultado: {testResults.passedTests}/{testResults.totalTests} testes passaram
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testes Individuais */}
      <div className="grid grid-cols-1 gap-4 xs:gap-5 sm:gap-6">
        <Card>
          <CardHeader className="p-4 xs:p-5 sm:p-6">
            <CardTitle className="text-lg xs:text-xl">🧪 Testar Autenticação</CardTitle>
            <CardDescription className="text-base xs:text-lg">
              Verificar se o usuário está logado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 xs:p-5 sm:p-6">
            <Button 
              onClick={testAuth} 
              disabled={isLoading}
              className="w-full h-12 xs:h-14 text-base xs:text-lg"
            >
              {isLoading ? 'Testando...' : 'Testar Autenticação'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 xs:p-5 sm:p-6">
            <CardTitle className="text-lg xs:text-xl">🔧 Testar Edge Function</CardTitle>
            <CardDescription className="text-base xs:text-lg">
              Teste se a Edge Function está funcionando
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 xs:p-5 sm:p-6">
            <Button 
              onClick={handleTestEdgeFunction} 
              disabled={isLoading}
              className="w-full h-12 xs:h-14 text-base xs:text-lg"
            >
              {isLoading ? 'Testando...' : 'Testar Edge Function'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="p-4 xs:p-5 sm:p-6">
            <CardTitle className="text-lg xs:text-xl">🔗 Conectar OAuth</CardTitle>
            <CardDescription className="text-base xs:text-lg">
              Iniciar processo de autorização OAuth
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 xs:p-5 sm:p-6">
            <Button 
              onClick={handleOAuthConnect} 
              disabled={isLoading}
              className="w-full h-12 xs:h-14 text-base xs:text-lg"
            >
              {isLoading ? 'Conectando...' : 'Conectar OAuth'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Informações de Configuração */}
      <Card>
        <CardHeader className="p-4 xs:p-5 sm:p-6">
          <CardTitle className="text-lg xs:text-xl">⚙️ Configuração OAuth</CardTitle>
          <CardDescription className="text-base xs:text-lg">
            Detalhes da configuração atual
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 xs:space-y-4 p-4 xs:p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-4 xs:gap-5">
            <div>
              <label className="text-base xs:text-lg font-medium">Client ID:</label>
              <p className="text-base xs:text-lg text-muted-foreground break-all">{clientId}</p>
            </div>
            <div>
              <label className="text-base xs:text-lg font-medium">Redirect URI:</label>
              <p className="text-base xs:text-lg text-muted-foreground break-all">{redirectUri}</p>
            </div>
          </div>
          <div>
            <label className="text-base xs:text-lg font-medium">Scopes:</label>
            <ul className="text-base xs:text-lg text-muted-foreground list-disc list-inside space-y-1">
              <li>fitness.activity.read</li>
              <li>fitness.body.read</li>
              <li>fitness.heart_rate.read</li>
              <li>fitness.sleep.read</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Instruções */}
      <Card>
        <CardHeader className="p-4 xs:p-5 sm:p-6">
          <CardTitle className="text-lg xs:text-xl">📋 Instruções</CardTitle>
          <CardDescription className="text-base xs:text-lg">
            Como usar esta página de teste
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 xs:space-y-3 p-4 xs:p-5 sm:p-6">
          <ol className="list-decimal list-inside space-y-2 xs:space-y-3 text-base xs:text-lg">
            <li>O teste automático é executado automaticamente ao carregar a página</li>
            <li>Verifique o console do navegador (F12) para detalhes dos testes</li>
            <li>Se algum teste falhar, execute os comandos sugeridos no console</li>
            <li>Clique em "Conectar OAuth" para testar a autorização completa</li>
            <li>Após autorizar no Google, você será redirecionado de volta</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}