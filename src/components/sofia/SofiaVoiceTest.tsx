import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Volume2, VolumeX, Mic, MicOff, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { useConversation } from '@/hooks/useConversation';
import { toast } from 'react-toastify';

const SofiaVoiceTest: React.FC = () => {
  const [testText, setTestText] = useState(
    'Oi! Sou a Sofia, sua nutricionista virtual! Estou aqui para te ajudar na sua jornada de saúde e bem-estar. Como posso te ajudar hoje?'
  );
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  const {
    isListening,
    isSpeaking,
    transcript,
    error,
    usingFreeFallback,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    hasSpeechRecognition,
    hasSpeechSynthesis
  } = useConversation({
    onSpeechStart: () => {
      toast.info('🎤 Sofia começou a falar...');
    },
    onSpeechEnd: () => {
      toast.success('✅ Sofia terminou de falar');
    },
    onError: (errorMsg) => {
      toast.error(`❌ Erro: ${errorMsg}`);
    },
  });

  const handleVoiceToggle = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    if (isVoiceEnabled) {
      stopSpeaking();
      stopListening();
    }
  };

  const handleTestVoice = async () => {
    if (!isVoiceEnabled) {
      toast.warning('Ative a voz da Sofia primeiro!');
      return;
    }

    if (isSpeaking) {
      stopSpeaking();
      return;
    }

    try {
      await speak(testText);
    } catch (error) {
      console.error('Erro no teste de voz:', error);
    }
  };

  const handleMicToggle = () => {
    if (!isVoiceEnabled) {
      toast.warning('Ative a voz da Sofia primeiro!');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const predefinedTexts = [
    "Oi! Sou a Sofia, sua nutricionista virtual!",
    "Que bom te ver! Como foi sua alimentação hoje?",
    "Vamos analisar sua refeição? Envie uma foto!",
    "Parabéns! Você está no caminho certo para uma vida mais saudável!",
    "Lembre-se de beber água e manter uma alimentação balanceada."
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            👩‍⚕️
          </div>
          <div>
            <h2>🎤 Teste da Voz da Sofia</h2>
            <p className="text-sm opacity-90">Configure e teste a voz da sua nutricionista virtual</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Status da Voz */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h3 className="font-semibold">Status da Voz</h3>
            <p className="text-sm text-gray-600">
              {isVoiceEnabled ? 'Voz ativada - pronta para falar!' : 'Voz desativada'}
            </p>
          </div>
          <Button
            onClick={handleVoiceToggle}
            variant={isVoiceEnabled ? "destructive" : "default"}
            className="flex items-center gap-2"
          >
            {isVoiceEnabled ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            {isVoiceEnabled ? 'Desativar' : 'Ativar'} Voz
          </Button>
        </div>

        {/* Indicadores de Estado */}
        {isVoiceEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex flex-wrap gap-2"
          >
            <Badge variant={isSpeaking ? "destructive" : "outline"}>
              {isSpeaking ? '🗣️ Falando' : '🔇 Silenciosa'}
            </Badge>
            <Badge variant={isListening ? "destructive" : "outline"}>
              {isListening ? '🎤 Ouvindo' : '👂 Parada'}
            </Badge>
            {usingFreeFallback && (
              <Badge variant="secondary">
                💡 Modo Gratuito (Web Speech)
              </Badge>
            )}
            {error && (
              <Badge variant="destructive">
                ❌ {error}
              </Badge>
            )}
          </motion.div>
        )}

        {/* Texto de Teste */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Texto para Teste:</label>
          <Input
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            placeholder="Digite o texto que a Sofia deve falar..."
            className="w-full"
          />
        </div>

        {/* Textos Predefinidos */}
        <div className="space-y-3">
          <label className="block text-sm font-medium">Frases da Sofia:</label>
          <div className="grid gap-2">
            {predefinedTexts.map((text, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => setTestText(text)}
                className="text-left justify-start h-auto py-2 px-3"
              >
                {text}
              </Button>
            ))}
          </div>
        </div>

        {/* Controles de Teste */}
        <div className="flex gap-3">
          <Button
            onClick={handleTestVoice}
            disabled={!isVoiceEnabled || !testText.trim()}
            className="flex-1 flex items-center gap-2"
            variant={isSpeaking ? "destructive" : "default"}
          >
            {isSpeaking ? (
              <>
                <Square className="w-4 h-4" />
                Parar Fala
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Testar Voz
              </>
            )}
          </Button>

          <Button
            onClick={handleMicToggle}
            disabled={!isVoiceEnabled}
            variant={isListening ? "destructive" : "outline"}
            className="flex items-center gap-2"
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isListening ? 'Parar' : 'Ouvir'}
          </Button>
        </div>

        {/* Transcrição */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <h4 className="font-medium text-blue-800 mb-1">Você disse:</h4>
            <p className="text-blue-700">{transcript}</p>
          </motion.div>
        )}

        {/* Informações Técnicas */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>🎤 Reconhecimento de fala: {hasSpeechRecognition ? '✅ Disponível' : '❌ Não disponível'}</p>
          <p>🗣️ Síntese de fala: {hasSpeechSynthesis ? '✅ Disponível' : '❌ Não disponível'}</p>
          <p>🤖 Google TTS configurado via Edge Function para melhor qualidade</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SofiaVoiceTest;