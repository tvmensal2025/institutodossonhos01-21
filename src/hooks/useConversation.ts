import { useState, useRef, useCallback } from 'react';
import { preprocessTextForTTS, TTSPreprocessorConfig, DEFAULT_CONFIG } from '../utils/ttsPreprocessor';

interface UseConversationOptions {
  voiceId?: string;
  apiKey?: string;
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: string) => void;
  useFreeFallback?: boolean; // Usar Web Speech API como fallback
  ttsPreprocessor?: TTSPreprocessorConfig; // Configuração do pré-processamento
}

export const useConversation = (options: UseConversationOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [usingFreeFallback, setUsingFreeFallback] = useState(false);
  
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Configuração da API ElevenLabs será feita diretamente na função speak

  // Inicializar reconhecimento de fala
  const initializeSpeechRecognition = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Reconhecimento de fala não suportado neste navegador');
      return false;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = 'pt-BR';

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    recognitionRef.current.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognitionRef.current.onerror = (event) => {
      console.error('Erro no reconhecimento de fala:', event.error);
      setError(`Erro no reconhecimento: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    return true;
  }, []);

  // Iniciar gravação de áudio
  const startListening = useCallback(() => {
    if (!recognitionRef.current && !initializeSpeechRecognition()) {
      return;
    }

    setTranscript('');
    setError(null);
    recognitionRef.current?.start();
  }, [initializeSpeechRecognition]);

  // Parar gravação de áudio
  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  // Falar usando Web Speech API (GRATUITO)
  const speakWithWebSpeech = useCallback((text: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Síntese de fala não suportada'));
        return;
      }

      // Parar qualquer áudio anterior primeiro
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current = null;
      }
      
      // Parar síntese de fala anterior
      window.speechSynthesis.cancel();

      // Pré-processar texto para TTS
      const preprocessorConfig = options.ttsPreprocessor || DEFAULT_CONFIG;
      const processedText = preprocessTextForTTS(text, preprocessorConfig);

      const utterance = new SpeechSynthesisUtterance(processedText);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.8; // Velocidade equilibrada
      utterance.pitch = 1.1; // Pitch mais natural
      utterance.volume = 1.0;
      
      // Tentar selecionar uma voz feminina brasileira se disponível
      const voices = window.speechSynthesis.getVoices();
      const brazilianVoice = voices.find(voice => 
        voice.lang.includes('pt-BR') && voice.name.toLowerCase().includes('female')
      );
      if (brazilianVoice) {
        utterance.voice = brazilianVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        options.onSpeechStart?.();
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        options.onSpeechEnd?.();
        resolve();
      };

      utterance.onerror = (event) => {
        setIsSpeaking(false);
        const errorMsg = 'Erro na síntese de fala';
        setError(errorMsg);
        options.onError?.(errorMsg);
        reject(new Error(errorMsg));
      };

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }, [options]);

  // Falar texto usando Google Text-to-Speech diretamente (PREMIUM)
  const speakWithGoogleTTS = useCallback(async (text: string) => {
    try {
      console.log('🎤 [Google TTS] Iniciando síntese de voz:', text.substring(0, 50) + '...');
      
      // Parar qualquer áudio anterior primeiro
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current = null;
      }
      
      // Parar síntese de fala anterior
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }
      
      setIsSpeaking(true);
      options.onSpeechStart?.();

      // Pré-processar texto para TTS (remover emojis e caracteres especiais)
      const preprocessorConfig = options.ttsPreprocessor || DEFAULT_CONFIG;
      const processedText = preprocessTextForTTS(text, preprocessorConfig);

      if (processedText.length === 0) {
        console.log('⚠️ [Google TTS] Texto vazio após processamento');
        setIsSpeaking(false);
        options.onSpeechEnd?.();
        return;
      }

      console.log('🚀 [Google TTS] Chamando API diretamente...');

      // Obter API key do Google TTS
      const apiKey = options.apiKey || import.meta.env.VITE_GOOGLE_TTS_API_KEY;
      
      if (!apiKey) {
        throw new Error('API Key do Google TTS não configurada');
      }

      // Chamar API do Google Text-to-Speech diretamente
      const response = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: {
            text: processedText
          },
          voice: {
            languageCode: 'pt-BR',
            name: 'pt-BR-Neural2-C', // Voz feminina neural brasileira da Sofia
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 0.75, // Velocidade mais lenta para pausas naturais
            pitch: 1.1, // Pitch mais natural
            volumeGainDb: 1.5, // Volume mais alto
            effectsProfileId: ['headphone-class-device'], // Otimizado para fones
            sampleRateHertz: 24000 // Qualidade de áudio otimizada
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ [Google TTS] Erro na API:', errorText);
        throw new Error(`Erro na síntese: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      if (!data.audioContent) {
        console.error('❌ [Google TTS] Resposta inválida:', data);
        throw new Error('Resposta inválida da síntese de voz');
      }

      console.log('✅ [Google TTS] Áudio recebido, reproduzindo...');

      // Converter base64 para blob de áudio
      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))],
        { type: 'audio/mpeg' }
      );

      const audioUrl = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(audioUrl);
      
      audioRef.current.onloadeddata = () => {
        console.log('🎵 [Google TTS] Áudio carregado');
      };

      audioRef.current.onplay = () => {
        console.log('▶️ [Google TTS] Reprodução iniciada');
      };

      audioRef.current.onended = () => {
        console.log('✅ [Google TTS] Reprodução concluída');
        setIsSpeaking(false);
        options.onSpeechEnd?.();
        URL.revokeObjectURL(audioUrl);
      };

      audioRef.current.onerror = (e) => {
        console.error('❌ [Google TTS] Erro na reprodução:', e);
        setIsSpeaking(false);
        setError('Erro ao reproduzir áudio da Sofia');
        options.onError?.('Erro ao reproduzir áudio da Sofia');
        URL.revokeObjectURL(audioUrl);
      };

      await audioRef.current.play();
      
    } catch (err) {
      console.error('❌ [Google TTS] Erro geral:', err);
      setIsSpeaking(false);
      setError('Erro na voz da Sofia - usando fallback');
      options.onError?.('Erro na voz da Sofia - usando fallback');
      
      // Não fazer fallback automático aqui - deixar o speak() principal decidir
      throw err;
    }
  }, [options]);

  // Parar fala atual
  const stopSpeaking = useCallback(() => {
    console.log('🛑 Parando todas as vozes...');
    
    // Parar áudio do Google TTS
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current = null;
      console.log('🛑 Áudio do Google TTS parado');
    }
    
    // Parar síntese de fala do Web Speech API
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      console.log('🛑 Web Speech API parado');
    }
    
    // Limpar referências
    if (speechSynthesisRef.current) {
      speechSynthesisRef.current.onstart = null;
      speechSynthesisRef.current.onend = null;
      speechSynthesisRef.current.onerror = null;
      speechSynthesisRef.current = null;
    }
    
    setIsSpeaking(false);
    options.onSpeechEnd?.();
    console.log('🛑 Todas as vozes paradas');
  }, [options]);

  // Função principal de fala (Google TTS como padrão)
  const speak = useCallback(async (text: string) => {
    try {
      console.log('🎤 [SPEAK] Iniciando fala...');
      console.log('🎤 [SPEAK] Texto recebido:', text);
      console.log('🎤 [SPEAK] isSpeaking atual:', isSpeaking);
      
      // Se já está falando, parar primeiro
      if (isSpeaking) {
        console.log('🎤 [SPEAK] Já está falando, parando primeiro...');
        stopSpeaking();
        // Aguardar um pouco para garantir que parou
        await new Promise(resolve => setTimeout(resolve, 200));
      }
      
      // Tentar Google TTS primeiro (voz natural)
      const apiKey = options.apiKey || import.meta.env.VITE_GOOGLE_TTS_API_KEY;
      
      console.log('🔑 [API] API Key disponível:', !!apiKey);
      console.log('🔑 [API] API Key (primeiros 10 chars):', apiKey ? apiKey.substring(0, 10) + '...' : 'NÃO ENCONTRADA');
      
      if (apiKey && apiKey.trim() && apiKey !== 'undefined') {
        console.log('🎤 [TTS] Tentando Google TTS...');
        try {
          await speakWithGoogleTTS(text);
          setUsingFreeFallback(false);
          console.log('✅ [TTS] Google TTS funcionou!');
        } catch (error) {
          console.error('❌ [TTS] Erro no Google TTS:', error);
          console.log('🔄 [TTS] Fallback para Web Speech API...');
          setUsingFreeFallback(true);
          await speakWithWebSpeech(text);
        }
      } else {
        console.log('⚠️ [TTS] API Key não encontrada ou vazia, usando Web Speech API');
        setUsingFreeFallback(true);
        await speakWithWebSpeech(text);
      }
      
    } catch (err) {
      console.error('❌ [SPEAK] Erro geral ao gerar fala:', err);
      setIsSpeaking(false);
      const errorMsg = 'Erro ao gerar fala da Sofia';
      setError(errorMsg);
      options.onError?.(errorMsg);
    }
  }, [options, speakWithGoogleTTS, speakWithWebSpeech, isSpeaking, stopSpeaking]);

  // Limpar recursos
  const cleanup = useCallback(() => {
    // Parar reconhecimento de fala
    stopListening();
    
    // Parar fala
    stopSpeaking();
    
    // Limpar URLs de áudio
    if (audioRef.current) {
      URL.revokeObjectURL(audioRef.current.src);
      audioRef.current = null;
    }
    
    // Limpar reconhecimento
    if (recognitionRef.current) {
      recognitionRef.current = null;
    }
  }, [stopListening, stopSpeaking]);

  return {
    // Estados
    isListening,
    isSpeaking,
    transcript,
    error,
    usingFreeFallback,
    
    // Ações
    startListening,
    stopListening,
    speak,
    stopSpeaking,
    cleanup,
    
    // Utilitários
    hasSpeechRecognition: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
    hasSpeechSynthesis: 'speechSynthesis' in window,
  };
};

