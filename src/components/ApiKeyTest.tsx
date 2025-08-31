import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const ApiKeyTest: React.FC = () => {
  const [apiKeyStatus, setApiKeyStatus] = useState<string>('Verificando...');
  const [apiKeyPreview, setApiKeyPreview] = useState<string>('');
  const [testResult, setTestResult] = useState<string>('');

  useEffect(() => {
    // Verificar se a API key está disponível
    const apiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
    
    if (apiKey && apiKey !== 'undefined' && apiKey.trim()) {
      setApiKeyStatus('✅ ENCONTRADA');
      setApiKeyPreview(apiKey.substring(0, 10) + '...');
    } else {
      setApiKeyStatus('❌ NÃO ENCONTRADA');
      setApiKeyPreview('N/A');
    }
  }, []);

  const testApiKey = async () => {
    try {
      setTestResult('Testando...');
      
      const apiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
      
      if (!apiKey || apiKey === 'undefined') {
        setTestResult('❌ API Key não configurada');
        return;
      }

      // Testar a API
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            text: 'Teste da Sofia'
          },
          voice: {
            languageCode: 'pt-BR',
            name: 'pt-BR-Neural2-C',
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.85,
            pitch: 1.3,
            volumeGainDb: 1.2
          }
        })
      });

      if (response.ok) {
        setTestResult('✅ API funcionando perfeitamente!');
      } else {
        const errorData = await response.json();
        setTestResult(`❌ Erro: ${errorData.error?.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      setTestResult(`❌ Erro: ${error}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🔑 Teste da API Key do Google TTS</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium">Status da API Key:</p>
          <Badge variant={apiKeyStatus.includes('ENCONTRADA') ? 'default' : 'destructive'}>
            {apiKeyStatus}
          </Badge>
        </div>
        
        <div>
          <p className="text-sm font-medium">Preview:</p>
          <p className="text-sm text-muted-foreground">{apiKeyPreview}</p>
        </div>

        <Button onClick={testApiKey} className="w-full">
          🧪 Testar API
        </Button>

        {testResult && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm">{testResult}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>🌐 Acesse: http://localhost:8081/sofia-voice</p>
          <p>🎤 Teste a voz da Sofia no chat</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiKeyTest;



