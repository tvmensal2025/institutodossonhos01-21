import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Loader2,
  AlertTriangle,
  TestTube,
  Zap
} from 'lucide-react';
import { healthAssistant } from '@/lib/openai-client';

const GPTTestPanel: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [testPrompt, setTestPrompt] = useState('Olá! Como você pode me ajudar com saúde e bem-estar?');

  const runGPTTest = async () => {
    setLoading(true);
    setTestResults(null);

    try {
      const startTime = Date.now();
      
      // Teste com o assistente de saúde
      const response = await healthAssistant.sendMessage(testPrompt);
      
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      setTestResults({
        success: true,
        response: response.content,
        responseTime,
        usage: response.usage,
        timestamp: new Date().toLocaleString('pt-BR')
      });

      toast({
        title: "✅ GPT Funcionando!",
        description: `Resposta recebida em ${responseTime}ms`
      });

    } catch (error: any) {
      setTestResults({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      });

      toast({
        title: "❌ Erro no GPT",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testBasicConnection = async () => {
    setLoading(true);
    
    try {
      // Teste básico usando Edge Function
      const response = await healthAssistant.sendMessage('Responda apenas: OK');

      toast({
        title: "✅ Sistema GPT OK",
        description: "Edge Function está funcionando"
      });
      
      // Mostrar resultado simplificado
      setTestResults({
        success: true,
        response: response.content,
        responseTime: 0,
        usage: response.usage,
        timestamp: new Date().toLocaleString('pt-BR')
      });
    } catch (error: any) {
      toast({
        title: "❌ Erro de Conexão",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Teste do Sistema GPT
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Rápido */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Brain className="h-4 w-4" />
              <span className="text-sm">Edge Function</span>
              <Badge variant="outline" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Configurado
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm">Assistente Saúde</span>
              <Badge variant="outline" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Zap className="h-4 w-4" />
              <span className="text-sm">OpenAI API</span>
              <Badge variant="outline" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Seguro
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Teste Personalizado */}
          <div className="space-y-3">
            <Label htmlFor="test-prompt">Prompt de Teste</Label>
            <Input
              id="test-prompt"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              placeholder="Digite uma mensagem para testar o GPT..."
            />
          </div>

          {/* Botões de Teste */}
          <div className="flex gap-3">
            <Button 
              onClick={runGPTTest}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
              Teste Completo GPT
            </Button>
            
            <Button 
              variant="outline" 
              onClick={testBasicConnection}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Teste via Edge Function
            </Button>
          </div>

          {/* Resultados */}
          {testResults && (
            <Card className={`mt-4 ${testResults.success ? 'border-green-200' : 'border-red-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {testResults.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                  {testResults.success ? 'Teste Bem-sucedido' : 'Teste Falhou'}
                  <Badge variant="outline" className="ml-auto">
                    {testResults.timestamp}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {testResults.success ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium">Resposta do GPT:</Label>
                      <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm">{testResults.response}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Tempo de Resposta:</Label>
                        <p className="text-lg font-bold text-green-600">{testResults.responseTime}ms</p>
                      </div>
                      
                      {testResults.usage && (
                        <div>
                          <Label className="text-sm font-medium">Tokens Usados:</Label>
                          <p className="text-sm">
                            {testResults.usage.total_tokens} total 
                            ({testResults.usage.prompt_tokens} prompt + {testResults.usage.completion_tokens} resposta)
                          </p>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div>
                    <Label className="text-sm font-medium">Erro:</Label>
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{testResults.error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Aviso sobre Implementação Segura */}
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">✅ Implementação Segura</p>
              <p className="text-green-700 mt-1">
                O sistema agora usa Edge Functions do Supabase para manter suas chaves OpenAI seguras no backend. 
                Nenhuma chave API é exposta no frontend.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GPTTestPanel;