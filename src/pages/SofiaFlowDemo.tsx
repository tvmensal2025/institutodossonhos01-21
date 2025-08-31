import React, { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Camera, Upload, Loader2, CheckCircle, User, Brain, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SofiaAnalysisResult {
  success: boolean;
  requires_confirmation: boolean;
  analysis_id: string;
  sofia_analysis: {
    analysis: string;
    personality: string;
    foods_detected: string[];
    confidence: number;
    estimated_calories: number;
    confirmation_required: boolean;
  };
  food_detection: {
    foods_detected: string[];
    is_food: boolean;
    confidence: number;
    estimated_calories: number;
    meal_type: string;
  };
}

export default function SofiaFlowDemo() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [publicImageUrl, setPublicImageUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<SofiaAnalysisResult | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const addLog = (message: string) => {
    setProcessingLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setAnalysisResult(null);
    setProcessingLogs([]);
    setPublicImageUrl('');
  };

  const simulateSofiaFlow = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingLogs([]);
    
    try {
      // PASSO 1: Identificar usuário logado
      setCurrentStep('1. Identificando usuário logado...');
      addLog('🔍 Verificando usuário autenticado...');
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        addLog('❌ Usuário não autenticado');
        toast({
          title: "Erro de autenticação",
          description: "É necessário estar logado para usar a Sofia.",
          variant: "destructive"
        });
        return;
      }

      setUserInfo(user);
      addLog(`✅ Usuário identificado: ${user.email}`);
      
      // PASSO 2: Upload da imagem para o bucket chat-images
      setCurrentStep('2. Fazendo upload da imagem...');
      addLog('📤 Iniciando upload para bucket chat-images...');
      
      const fileName = `user-${user.id}/food-${Date.now()}-${selectedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        addLog(`❌ Erro no upload: ${uploadError.message}`);
        throw uploadError;
      }

      addLog(`✅ Upload realizado: ${fileName}`);

      // PASSO 3: Gerar URL pública
      setCurrentStep('3. Gerando URL pública...');
      addLog('🔗 Gerando URL pública da imagem...');
      
      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      setPublicImageUrl(publicUrl);
      addLog(`✅ URL pública gerada: ${publicUrl.substring(0, 50)}...`);

      // PASSO 4: Análise com Sofia
      setCurrentStep('4. Analisando com Sofia IA...');
      addLog('🧠 Enviando para análise da Sofia...');
      addLog('🔎 Usando Google Vision API com LABEL_DETECTION...');
      
      const { data: sofiaData, error: sofiaError } = await supabase.functions.invoke('sofia-image-analysis', {
        body: {
          imageUrl: publicUrl,
          userId: user.id,
          userContext: {
            currentMeal: 'lunch',
            userName: user.email?.split('@')[0] || 'usuário'
          }
        }
      });

      if (sofiaError) {
        addLog(`❌ Erro na análise: ${sofiaError.message}`);
        throw sofiaError;
      }

      addLog(`✅ Análise concluída pela Sofia`);
      setAnalysisResult(sofiaData);

      // PASSO 5: Dados armazenados
      setCurrentStep('5. Dados armazenados!');
      addLog('💾 Dados salvos na tabela sofia_food_analysis');
      addLog(`📊 Alimentos detectados: ${sofiaData.sofia_analysis?.foods_detected?.join(', ') || 'Nenhum'}`);
      addLog(`🔥 Calorias estimadas: ${sofiaData.sofia_analysis?.estimated_calories || 0} kcal`);
      
      toast({
        title: "🎉 Análise completa!",
        description: "Sofia analisou sua imagem com sucesso.",
      });

    } catch (error: any) {
      console.error('Erro no fluxo da Sofia:', error);
      addLog(`❌ Erro geral: ${error.message}`);
      toast({
        title: "Erro na análise",
        description: "Não foi possível completar a análise. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      setCurrentStep('');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight flex items-center justify-center gap-2">
            <Brain className="h-8 w-8 text-primary" />
            Demonstração do Fluxo Sofia IA
          </h1>
          <p className="text-muted-foreground mt-2">
            Veja como funciona a análise completa de imagens alimentares
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Lado esquerdo - Upload e controles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Enviar Imagem para Sofia
              </CardTitle>
              <CardDescription>
                Carregue uma foto de comida para demonstrar o fluxo completo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Clique para carregar</span> uma foto de comida
                    </p>
                    <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 10MB)</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileSelect}
                  />
                </label>
              </div>

              {previewUrl && (
                <div className="space-y-4">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full max-h-64 object-contain rounded-lg border"
                  />
                  
                  <Button
                    onClick={simulateSofiaFlow}
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {currentStep || 'Processando...'}
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Simular Fluxo Completo da Sofia
                      </>
                    )}
                  </Button>
                </div>
              )}

              {userInfo && (
                <Alert>
                  <User className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Usuário autenticado:</strong> {userInfo.email}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Lado direito - Logs e resultados */}
          <div className="space-y-6">
            {/* Logs de processamento */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Log do Processamento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                  {processingLogs.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Aguardando início do processamento...
                    </p>
                  ) : (
                    <div className="space-y-1">
                      {processingLogs.map((log, index) => (
                        <p key={index} className="text-xs font-mono">
                          {log}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* URL pública gerada */}
            {publicImageUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">URL Pública Gerada</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted p-3 rounded text-xs break-all">
                    {publicImageUrl}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Resposta da Sofia */}
            {analysisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Resposta Personalizada da Sofia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-primary/10 p-4 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {analysisResult.sofia_analysis?.analysis}
                    </p>
                  </div>

                  <Separator />

                  <div className="grid gap-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Alimentos detectados:</span>
                      <Badge variant="secondary">
                        {analysisResult.sofia_analysis?.foods_detected?.length || 0}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Confiança:</span>
                      <Badge variant="outline">
                        {Math.round((analysisResult.sofia_analysis?.confidence || 0) * 100)}%
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Calorias estimadas:</span>
                      <Badge variant="default">
                        {analysisResult.sofia_analysis?.estimated_calories || 0} kcal
                      </Badge>
                    </div>

                    {analysisResult.analysis_id && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm">ID da análise:</span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {analysisResult.analysis_id.substring(0, 8)}...
                        </Badge>
                      </div>
                    )}
                  </div>

                  {analysisResult.sofia_analysis?.foods_detected && (
                    <div>
                      <p className="text-sm font-medium mb-2">Alimentos identificados:</p>
                      <div className="flex flex-wrap gap-1">
                        {analysisResult.sofia_analysis.foods_detected.map((food, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {food}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Explicação do fluxo */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>🔄 Fluxo Técnico Implementado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-5">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6" />
                </div>
                <h4 className="font-medium">1. Identificar Usuário</h4>
                <p className="text-xs text-muted-foreground">auth.getUser()</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="font-medium">2. Upload Imagem</h4>
                <p className="text-xs text-muted-foreground">bucket: chat-images</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="font-medium">3. URL Pública</h4>
                <p className="text-xs text-muted-foreground">getPublicUrl()</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Brain className="w-6 h-6" />
                </div>
                <h4 className="font-medium">4. Sofia IA</h4>
                <p className="text-xs text-muted-foreground">Google Vision API</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h4 className="font-medium">5. Armazenar</h4>
                <p className="text-xs text-muted-foreground">sofia_food_analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}