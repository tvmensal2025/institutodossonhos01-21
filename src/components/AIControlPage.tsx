import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, TestTube, Brain, ChefHat, Database, CheckCircle, XCircle } from 'lucide-react';
import { testOllamaConnection } from '@/utils/ollamaMealPlanGenerator';
import { testOllamaMealieIntegration, generateMealPlanWithOllamaAndMealie } from '@/utils/ollamaMealPlanGenerator';
import { toast } from 'sonner';

export const AIControlPage: React.FC = () => {
  const [ollamaStatus, setOllamaStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [ollamaResult, setOllamaResult] = useState<any>(null);
  
  const [mealieStatus, setMealieStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [mealieResult, setMealieResult] = useState<any>(null);
  
  const [mealieConfig, setMealieConfig] = useState({
    baseUrl: 'https://mealie.yourdomain.com',
    apiKey: '',
    ollamaModel: 'llama3.2:3b'
  });

  const testOllama = async () => {
    setOllamaStatus('testing');
    try {
      const result = await testOllamaConnection();
      setOllamaResult(result);
      setOllamaStatus(result.success ? 'success' : 'error');
      toast(result.success ? 'Ollama conectado!' : 'Erro no Ollama');
    } catch (error) {
      setOllamaResult({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
      setOllamaStatus('error');
      toast.error('Erro ao testar Ollama');
    }
  };

  const testMealieIntegration = async () => {
    setMealieStatus('testing');
    try {
      const result = await testOllamaMealieIntegration({
        mealieBaseUrl: mealieConfig.baseUrl,
        mealieApiKey: mealieConfig.apiKey || undefined,
        ollamaModel: mealieConfig.ollamaModel
      });
      setMealieResult(result);
      setMealieStatus(result.success ? 'success' : 'error');
      toast(result.success ? 'Integração funcionando!' : 'Erro na integração');
    } catch (error) {
      setMealieResult({ error: error instanceof Error ? error.message : 'Erro desconhecido' });
      setMealieStatus('error');
      toast.error('Erro ao testar integração');
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Brain className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">Controle de IA</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Teste Ollama */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5" />
              Teste Ollama
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testOllama} 
              disabled={ollamaStatus === 'testing'}
              className="w-full"
            >
              {ollamaStatus === 'testing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Testar Conexão Ollama
                </>
              )}
            </Button>

            {ollamaResult && (
              <Alert variant={ollamaStatus === 'success' ? 'default' : 'destructive'}>
                <AlertDescription>
                  {ollamaStatus === 'success' ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      <span>Ollama conectado com sucesso!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      <span>Erro: {ollamaResult.error}</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Integração Ollama + Mealie */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="w-5 h-5" />
              Integração Ollama + Mealie
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mealieUrl">URL da Mealie</Label>
              <Input
                id="mealieUrl"
                placeholder="https://mealie.yourdomain.com"
                value={mealieConfig.baseUrl}
                onChange={(e) => setMealieConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mealieApiKey">API Key (opcional)</Label>
              <Input
                id="mealieApiKey"
                type="password"
                placeholder="Bearer token..."
                value={mealieConfig.apiKey}
                onChange={(e) => setMealieConfig(prev => ({ ...prev, apiKey: e.target.value }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="ollamaModel">Modelo Ollama</Label>
              <Input
                id="ollamaModel"
                placeholder="llama3.2:3b"
                value={mealieConfig.ollamaModel}
                onChange={(e) => setMealieConfig(prev => ({ ...prev, ollamaModel: e.target.value }))}
              />
            </div>

            <Button 
              onClick={testMealieIntegration} 
              disabled={mealieStatus === 'testing'}
              className="w-full"
            >
              {mealieStatus === 'testing' ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando Integração...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4 mr-2" />
                  Testar Integração
                </>
              )}
            </Button>

            {mealieResult && (
              <Alert variant={mealieStatus === 'success' ? 'default' : 'destructive'}>
                <AlertDescription>
                  {mealieStatus === 'success' ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        <span>Integração funcionando!</span>
                      </div>
                      <div className="text-sm">
                        <p>Receitas encontradas: {mealieResult.recipeCount}</p>
                        <p>Modelo: {mealieConfig.ollamaModel}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4" />
                      <span>Erro: {mealieResult.error}</span>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Resultados Detalhados */}
      {mealieResult && mealieStatus === 'success' && (
        <Card>
          <CardHeader>
            <CardTitle>Receitas da Mealie</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {mealieResult.sampleRecipes?.map((recipe: any, index: number) => (
                <div key={index} className="p-3 border rounded-lg">
                  <h4 className="font-semibold">{recipe.name}</h4>
                  <p className="text-sm text-muted-foreground">{recipe.description}</p>
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {recipe.ingredients?.split(',').length || 0} ingredientes
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
