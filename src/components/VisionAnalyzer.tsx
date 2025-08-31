import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Upload, Eye, FileText, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VisionResult {
  success: boolean;
  timestamp: string;
  results: any;
  summary: {
    textsDetected: number;
    objectsDetected: number;
    facesDetected: number;
    labelsDetected: number;
  };
  extractedText?: string;
  detectedObjects?: Array<{
    name: string;
    confidence: number;
    boundingBox: any;
  }>;
}

export const VisionAnalyzer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<VisionResult | null>(null);
  const { toast } = useToast();

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
    setResults(null);
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const base64Image = await convertToBase64(selectedFile);
      
      const { data, error } = await supabase.functions.invoke('vision-api', {
        body: {
          image: base64Image,
          features: ['TEXT_DETECTION', 'OBJECT_LOCALIZATION', 'LABEL_DETECTION', 'FACE_DETECTION']
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setResults(data);
      toast({
        title: "Análise concluída",
        description: "A imagem foi analisada com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao analisar imagem:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar a imagem. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Análise de Imagem com Vision API
          </CardTitle>
          <CardDescription>
            Carregue uma imagem para detectar texto, objetos, rostos e rótulos automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                  <span className="font-semibold">Clique para carregar</span> ou arraste uma imagem
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF (MAX. 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
              />
            </label>
          </div>

          {previewUrl && (
            <div className="space-y-4">
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-96 object-contain rounded-lg border"
                />
              </div>
              
              <Button
                onClick={analyzeImage}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analisando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analisar Imagem
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {results && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumo da Análise</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Textos detectados:</span>
                <Badge variant="secondary">{results.summary.textsDetected}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Objetos detectados:</span>
                <Badge variant="secondary">{results.summary.objectsDetected}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Rostos detectados:</span>
                <Badge variant="secondary">{results.summary.facesDetected}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Rótulos detectados:</span>
                <Badge variant="secondary">{results.summary.labelsDetected}</Badge>
              </div>
            </CardContent>
          </Card>

          {results.extractedText && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Texto Extraído
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm whitespace-pre-wrap">{results.extractedText}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {results.detectedObjects && results.detectedObjects.length > 0 && (
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Objetos Detectados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {results.detectedObjects.map((obj, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="font-medium">{obj.name}</span>
                      <Badge variant="outline">
                        {Math.round(obj.confidence * 100)}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};