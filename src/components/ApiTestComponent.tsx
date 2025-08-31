import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const ApiTestComponent = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const testApis = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-api-keys');
      
      if (error) {
        toast({
          title: "Erro no teste",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setResults(data);
      
      if (data.summary?.both_working) {
        toast({
          title: "✅ APIs funcionando!",
          description: "OpenAI e Google AI estão operacionais",
        });
      } else {
        toast({
          title: "⚠️ Problemas detectados",
          description: "Algumas APIs não estão funcionando",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro no teste",
        description: "Falha ao testar as APIs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSofiaChat = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('health-chat-bot', {
        body: {
          message: 'Oi Sofia, você está funcionando?',
          userId: 'test-user',
          userName: 'Teste'
        }
      });
      
      if (error) {
        toast({
          title: "Erro no chat",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "✅ Sofia respondeu!",
        description: data.message?.substring(0, 100) + "...",
      });
    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro no chat",
        description: "Falha ao testar a Sofia",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>🔧 Teste das APIs da Sofia</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testApis} 
              disabled={loading}
              variant="outline"
            >
              {loading ? "Testando..." : "Testar APIs"}
            </Button>
            <Button 
              onClick={testSofiaChat} 
              disabled={loading}
              variant="default"
            >
              {loading ? "Testando..." : "Testar Sofia Chat"}
            </Button>
          </div>

          {results && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">OpenAI Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge 
                      variant={results.results?.openai?.status === 'success' ? 'default' : 'destructive'}
                    >
                      {results.results?.openai?.status === 'success' ? '✅ Funcionando' : '❌ Erro'}
                    </Badge>
                    {results.results?.openai?.error && (
                      <p className="text-sm text-red-500 mt-2">
                        {results.results.openai.error}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Google AI Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge 
                      variant={results.results?.google?.status === 'success' ? 'default' : 'destructive'}
                    >
                      {results.results?.google?.status === 'success' ? '✅ Funcionando' : '❌ Erro'}
                    </Badge>
                    {results.results?.google?.error && (
                      <p className="text-sm text-red-500 mt-2">
                        {results.results.google.error}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Resumo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>OpenAI: {results.summary?.openai_working ? '✅' : '❌'}</p>
                    <p>Google AI: {results.summary?.google_working ? '✅' : '❌'}</p>
                    <p>Ambas funcionando: {results.summary?.both_working ? '✅' : '❌'}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiTestComponent;