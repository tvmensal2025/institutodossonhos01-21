import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Volume2, Settings, Play } from 'lucide-react';
// supabase client not required here

interface AIConfig {
  id: string;
  name: string;
  api_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AIUsage {
  id: string;
  ai_name: string;
  characters_used: number;
  cost_usd: number;
  date: string;
  user_id?: string;
}

interface VoiceConfig {
  speakingRate: number;
  pitch: number;
  volumeGainDb: number;
  voiceName: string;
  isEnabled: boolean;
}

export default function AIControlPanel() {
  const [voiceConfig, setVoiceConfig] = useState<VoiceConfig>({
    speakingRate: 0.85,
    pitch: 1.3,
    volumeGainDb: 1.2,
    voiceName: 'pt-BR-Neural2-C',
    isEnabled: true
  });
  const [loading, setLoading] = useState(true);
  const [isTesting, setIsTesting] = useState(false);

  // Carregar configuração
  useEffect(() => {
    loadVoiceConfig();
  }, []);

  const loadVoiceConfig = async () => {
    try {
      const saved = localStorage.getItem('voice_config');
      if (saved) setVoiceConfig(prev => ({ ...prev, ...JSON.parse(saved) }));
    } catch (error) {
      console.error('Erro ao carregar configuração de voz:', error);
    }
  };

  // Testar voz
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
          input: { text: 'Olá! Sou a Sofia, sua nutricionista virtual.' },
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

  const saveVoiceConfig = async () => {
    try {
      localStorage.setItem('voice_config', JSON.stringify(voiceConfig));
      alert('Configuração de voz salva!');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    }
  };

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Volume2 className="w-5 h-5 mr-2" />
            Voz da Sofia – Configuração Rápida
          </CardTitle>
          <CardDescription>
            Escolha a voz e ajuste velocidade, tom e volume. Teste e clique em "Salvar e Aplicar".
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="voiceName">Voz</Label>
            <select
              id="voiceName"
              value={voiceConfig.voiceName}
              onChange={(e) => updateVoiceConfig({ voiceName: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="pt-BR-Neural2-C">Feminina Suave (pt-BR-Neural2-C)</option>
              <option value="pt-BR-Neural2-A">Feminina Natural (pt-BR-Neural2-A)</option>
              <option value="pt-BR-Neural2-B">Feminina Expressiva (pt-BR-Neural2-B)</option>
              <option value="pt-BR-Neural2-D">Masculina Suave (pt-BR-Neural2-D)</option>
            </select>
          </div>

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

          <div className="flex gap-2">
            <Button onClick={testVoice} disabled={isTesting} variant="outline" className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Testar Voz
            </Button>
            <Button onClick={saveVoiceConfig} className="flex-1">
              <Settings className="w-4 h-4 mr-2" />
              Salvar e Aplicar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
