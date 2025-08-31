import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, TestTube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ApiTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const { toast } = useToast();

  // Imagem de teste em base64 (pequena imagem com texto "TEST")
  const testImageBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

  const testVisionApi = async () => {
    setIsLoading(true);
    setError('');
    setTestResult(null);

    try {
      console.log('🧪 Iniciando teste da Vision API...');
      
      const { data, error } = await supabase.functions.invoke('vision-api', {
        body: {
          image: testImageBase64,
          features: ['LABEL_DETECTION']
        }
      });

      console.log('📊 Resposta da API:', { data, error });

      if (error) {
        throw new Error(error.message || 'Erro desconhecido');
      }

      setTestResult(data);
      
      if (data.success) {
        toast({
          title: "✅ Teste bem-sucedido!",
          description: "Sua chave da Vision API está funcionando corretamente.",
        });
      } else {
        toast({
          title: "⚠️ Teste com problemas",
          description: "A API respondeu, mas houve algum problema.",
          variant: "destructive"
        });
      }

    } catch (err: any) {
      console.error('❌ Erro no teste:', err);
      setError(err.message);
      toast({
        title: "❌ Teste falhou",
        description: err.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            <TestTube className="h-8 w-8" />
            Teste da Vision API
          </h1>
          <p className="text-muted-foreground mt-2">
            Verifique se sua chave da Google Vision API está configurada corretamente
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status da Configuração</CardTitle>
              <CardDescription>
                Clique no botão abaixo para testar se a API está funcionando
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={testVisionApi} 
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testando API...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Testar Vision API
                  </>
                )}
              </Button>

              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Erro:</strong> {error}
                  </AlertDescription>
                </Alert>
              )}

              {testResult && (
                <div className="space-y-4">
                  {testResult.success ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Sucesso!</strong> A Vision API está funcionando corretamente.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <Alert variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Falha:</strong> Houve um problema com a Vision API.
                      </AlertDescription>
                    </Alert>
                  )}

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detalhes do Teste</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3">
                        <div className="flex justify-between items-center">
                          <span>Status:</span>
                          <Badge variant={testResult.success ? "default" : "destructive"}>
                            {testResult.success ? "Sucesso" : "Falha"}
                          </Badge>
                        </div>
                        
                        {testResult.timestamp && (
                          <div className="flex justify-between items-center">
                            <span>Timestamp:</span>
                            <Badge variant="outline">
                              {new Date(testResult.timestamp).toLocaleString()}
                            </Badge>
                          </div>
                        )}

                        {testResult.summary && (
                          <>
                            <div className="flex justify-between items-center">
                              <span>Textos detectados:</span>
                              <Badge variant="secondary">
                                {testResult.summary.textsDetected}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Objetos detectados:</span>
                              <Badge variant="secondary">
                                {testResult.summary.objectsDetected}
                              </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span>Rótulos detectados:</span>
                              <Badge variant="secondary">
                                {testResult.summary.labelsDetected}
                              </Badge>
                            </div>
                          </>
                        )}
                      </div>

                      {testResult.results && (
                        <details className="mt-4">
                          <summary className="cursor-pointer text-sm font-medium">
                            Ver resposta completa da API
                          </summary>
                          <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-60">
                            {JSON.stringify(testResult, null, 2)}
                          </pre>
                        </details>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instruções</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-muted-foreground">
                • Se o teste <strong>funcionar</strong>: Sua chave está configurada corretamente ✅
              </p>
              <p className="text-sm text-muted-foreground">
                • Se der <strong>erro 401/403</strong>: Verifique se a chave está correta
              </p>
              <p className="text-sm text-muted-foreground">
                • Se der <strong>erro 400</strong>: Verifique se a Vision API está habilitada no Google Cloud
              </p>
              <p className="text-sm text-muted-foreground">
                • Se der outro erro: Verifique os logs da função para mais detalhes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}