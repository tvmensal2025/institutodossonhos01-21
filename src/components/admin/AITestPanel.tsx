import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Play, Settings, Volume2 } from 'lucide-react';

interface VoiceConfig {
  speakingRate: number;
  pitch: number;
  volumeGainDb: number;
  voiceName: string;
  isEnabled: boolean;
}

export default function AITestPanel() {
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    speakingRate: 0.85,
    pitch: 1.3,
    volumeGainDb: 1.2,
    voiceName: 'pt-BR-Neural2-C',
    isEnabled: true
  });
  const [testText, setTestText] = useState('Olá! Sou a Sofia, sua nutricionista virtual. Como posso ajudar você hoje?');
  const [isTesting, setIsTesting] = useState(false);

  const testVoice = async () => {
    setIsTesting(true);
    try {
      const apiKey = import.meta.env.VITE_GOOGLE_TTS_API_KEY;
      if (!apiKey) {
        alert('API Key do Google TTS não configurada!');
        return;
      }

      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text: testText },
          voice: {
            languageCode: 'pt-BR',
            name: voiceConfig.voiceName,
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: voiceConfig.speakingRate,
            pitch: voiceConfig.pitch,
            volumeGainDb: voiceConfig.volumeGainDb,
            effectsProfileId: ['headphone-class-device']
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const audioContent = data.audioContent;
      const audioBlob = new Blob(
        [Uint8Array.from(atob(audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );

      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      await audio.play();

    } catch (error) {
      console.error('Erro no teste de voz:', error);
      alert(`Erro no teste: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const updateVoiceConfig = (updates: Partial<VoiceConfig>) => {
    setVoiceConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="w-5 h-5 mr-2" />
            Teste Rápido de Voz da Sofia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Velocidade: {voiceConfig.speakingRate}</Label>
            <Slider
              value={[voiceConfig.speakingRate]}
              onValueChange={([value]) => updateVoiceConfig({ speakingRate: value })}
              max={1.5}
              min={0.25}
              step={0.05}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Tom: {voiceConfig.pitch}</Label>
            <Slider
              value={[voiceConfig.pitch]}
              onValueChange={([value]) => updateVoiceConfig({ pitch: value })}
              max={2.0}
              min={0.5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Volume: {voiceConfig.volumeGainDb}dB</Label>
            <Slider
              value={[voiceConfig.volumeGainDb]}
              onValueChange={([value]) => updateVoiceConfig({ volumeGainDb: value })}
              max={2.0}
              min={0.0}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testText">Texto para Teste</Label>
            <textarea
              id="testText"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full p-2 border rounded-md h-20 resize-none"
              placeholder="Digite o texto para testar..."
            />
          </div>

          <Button 
            onClick={testVoice} 
            disabled={isTesting}
            className="w-full"
          >
            {isTesting ? (
              <>
                <Settings className="w-4 h-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Testar Voz
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
