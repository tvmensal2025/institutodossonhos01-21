import React, { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Bot, 
  Mic, 
  Volume2, 
  Sparkles, 
  ArrowLeft,
  Settings,
  Headphones,
  MessageCircle,
  TestTube,
  Brain,
  ChefHat,
  Database,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SofiaVoiceChat from '@/components/sofia/SofiaVoiceChat';
import SofiaVoiceTest from '@/components/sofia/SofiaVoiceTest';
import { testOllamaConnection } from '@/utils/ollamaMealPlanGenerator';
import { testOllamaMealieIntegration } from '@/utils/ollamaMealPlanGenerator';
import { toast } from 'sonner';
import sofiaAvatar from '@/assets/sofia-avatar.png';

const SofiaVoicePage: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Estados para controle do Ollama
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

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando Sofia...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-purple-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-3">
                <img 
                  src={sofiaAvatar} 
                  alt="Sofia"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Sofia - Chat por Voz</h1>
                  <p className="text-sm text-gray-600">Nutricionista virtual com conversação natural</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <Headphones className="h-3 w-3 mr-1" />
                Voz Ativa
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                <Sparkles className="h-3 w-3 mr-1" />
                IA Avançada
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="chat" className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tabs Navigation */}
          <div className="lg:col-span-1">
            <TabsList className="grid w-full grid-cols-1 h-auto bg-white shadow-sm border border-purple-200">
              <TabsTrigger value="chat" className="flex items-center gap-2 py-3">
                <MessageCircle className="h-4 w-4" />
                Chat por Voz
              </TabsTrigger>
              <TabsTrigger value="test" className="flex items-center gap-2 py-3">
                <TestTube className="h-4 w-4" />
                Teste de Voz
              </TabsTrigger>
              <TabsTrigger value="ollama" className="flex items-center gap-2 py-3">
                <Brain className="h-4 w-4" />
                Controle Ollama
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Chat Tab */}
          <TabsContent value="chat" className="lg:col-span-3 mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SofiaVoiceChat user={currentUser} className="h-[600px]" />
            </motion.div>
          </TabsContent>

          {/* Tab de Teste de Voz */}
          <TabsContent value="test" className="lg:col-span-3">
            <SofiaVoiceTest />
          </TabsContent>

          {/* Tab de Controle Ollama */}
          <TabsContent value="ollama" className="lg:col-span-3">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-6">
                <Brain className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">Controle do Ollama</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Teste Ollama */}
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-purple-600" />
                      Teste Ollama
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button 
                      onClick={testOllama} 
                      disabled={ollamaStatus === 'testing'}
                      className="w-full bg-purple-600 hover:bg-purple-700"
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
                <Card className="border-2 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ChefHat className="w-5 h-5 text-purple-600" />
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
                      className="w-full bg-purple-600 hover:bg-purple-700"
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
                <Card className="border-2 border-purple-200">
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
          </TabsContent>

          {/* Sidebar com Informações - Aparece em ambas as tabs */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Card de Status */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Status da Voz
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Reconhecimento de Fala</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ativo
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Síntese de Voz</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ativo
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Auto-Fala</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Ativado
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Modo de Voz</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Gratuito
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Recursos */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Recursos Disponíveis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Mic className="h-4 w-4 text-purple-600" />
                    <span>Conversação por voz</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Volume2 className="h-4 w-4 text-purple-600" />
                    <span>Resposta falada da Sofia</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <MessageCircle className="h-4 w-4 text-purple-600" />
                    <span>Chat por texto</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Bot className="h-4 w-4 text-purple-600" />
                    <span>Análise de imagens</span>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Dicas */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-600" />
                    Dicas de Uso
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>🎤 <strong>Para falar:</strong> Clique no botão do microfone e fale claramente</p>
                    <p>🔊 <strong>Auto-fala:</strong> Sofia responde automaticamente por voz</p>
                    <p>📸 <strong>Fotos:</strong> Envie fotos das suas refeições para análise</p>
                    <p>⌨️ <strong>Texto:</strong> Digite suas mensagens normalmente</p>
                  </div>
                </CardContent>
              </Card>

              {/* Card de Configurações */}
              <Card className="border-2 border-purple-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-purple-600" />
                    Configurações
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => navigate('/sofia')}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Chat Tradicional
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Dashboard Principal
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SofiaVoicePage;
