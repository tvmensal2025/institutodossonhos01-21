import React, { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Bot, 
  User as UserIcon, 
  Mic, 
  MicOff, 
  Camera, 
  Send, 
  Image, 
  X, 
  Loader2, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useConversation } from '@/hooks/useConversation';
import SofiaConfirmationModal from './SofiaConfirmationModal';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  imageUrl?: string;
  isVoice?: boolean;
}

interface SofiaVoiceChatProps {
  user: User | null;
  className?: string;
}

const SofiaVoiceChat: React.FC<SofiaVoiceChatProps> = ({ user, className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Hook de conversação com voz
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
    cleanup,
    hasSpeechRecognition,
    hasSpeechSynthesis
  } = useConversation({
    onSpeechStart: () => {
      toast.info('🎤 Sofia está falando...');
    },
    onSpeechEnd: () => {
      toast.success('✅ Sofia terminou de falar');
    },
    onError: (errorMsg) => {
      toast.error(`❌ ${errorMsg}`);
    }
  });

  // Criar mensagem inicial quando o usuário estiver disponível
  useEffect(() => {
    if (user && messages.length === 0) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'querido(a)';
      const welcomeMessage = `Oi ${userName}! 👋 Sou a Sofia, sua nutricionista virtual do Instituto dos Sonhos!

Estou aqui para te ajudar com:
🍽️ Análise de refeições (envie fotos!)
📊 Dicas nutricionais personalizadas
💪 Orientações sobre alimentação saudável
🎯 Apoio na sua jornada de transformação

Agora posso falar com você! 🎤 Use o microfone para conversar ou digite suas mensagens. Pode me enviar uma foto da sua refeição ou fazer qualquer pergunta sobre nutrição! ✨`;

      const initialMessage: Message = {
        id: '1',
        type: 'sofia',
        content: welcomeMessage,
        timestamp: new Date()
      };

      setMessages([initialMessage]);

      // Falar mensagem inicial apenas se voz estiver ativada E autoSpeak ativo
      if (voiceEnabled && autoSpeak) {
        setTimeout(() => {
          console.log('🎤 Voz ativa - Sofia vai falar a mensagem de boas-vindas');
          speak(welcomeMessage);
        }, 1000);
      } else {
        console.log('📝 Voz inativa - Sofia apenas escreve (sem falar)');
      }
    }
  }, [user, messages.length, autoSpeak, voiceEnabled, speak]);

  // Atualizar input com transcrição
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);

  // Mostrar erros de voz
  useEffect(() => {
    if (error) {
      toast.error(`Erro de voz: ${error}`);
    }
  }, [error]);

  // Scroll automático
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || !user || isLoading) return;

    let imageUrl: string | undefined;

    // Upload da imagem se houver
    if (selectedImage) {
      toast.info('📸 Fazendo upload da imagem...');
      imageUrl = await handleImageUpload(selectedImage);
      if (!imageUrl) return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage || '📷 Imagem enviada',
      timestamp: new Date(),
      imageUrl,
      isVoice: isListening
    };

    setMessages(prev => [...prev, newMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);

    // Parar gravação se estiver ativa
    if (isListening) {
      stopListening();
    }

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      let data, error;

      if (selectedImage) {
        // Processar imagem
        const formData = new FormData();
        formData.append('image', selectedImage);
        formData.append('userId', user.id);
        formData.append('userName', user.user_metadata?.full_name || user.email?.split('@')[0] || 'usuário');

        const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/sofia-image-analysis', {
          method: 'POST',
          body: formData
        });

        data = await response.json();
        error = !response.ok ? new Error(data.error || 'Erro no processamento') : null;
      } else {
        // Processar mensagem de texto
        const chatResult = await supabase.functions.invoke('health-chat-bot', {
          body: {
            message: currentMessage,
            userId: user.id,
            conversationHistory
          }
        });
        data = chatResult.data;
        error = chatResult.error;
      }

      if (error) {
        console.error('❌ Erro da Edge Function:', error);
        throw new Error(error.message || 'Erro na comunicação com o servidor');
      }

      const sofiaMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: data.response || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, sofiaMessage]);

      // Sofia só fala se a voz estiver ativada E autoSpeak ativo
      console.log('🎤 [DEBUG] voiceEnabled:', voiceEnabled);
      console.log('🎤 [DEBUG] autoSpeak:', autoSpeak);
      console.log('🎤 [DEBUG] data.response existe:', !!data.response);
      
      if (voiceEnabled && autoSpeak && data.response) {
        console.log('🎤 [SOFIA] Voz ativa - Sofia vai falar a resposta');
        setTimeout(() => {
          // Processar o texto antes de falar para garantir remoção completa de emojis
          const cleanText = data.response
            .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F018}-\u{1F270}]|[\u{238C}-\u{2454}]|[\u{20D0}-\u{20FF}]|[\u{FE00}-\u{FE0F}]|[\u{1F004}]|[\u{1F0CF}]|[\u{1F170}-\u{1F251}]/gu, '')
            .replace(/[^\w\s.,!?;:\-()áéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
          console.log('🎤 [SOFIA] Texto original:', data.response);
          console.log('🎤 [SOFIA] Texto limpo para TTS:', cleanText);
          console.log('🎤 [SOFIA] Chamando função speak...');
          speak(cleanText);
        }, 500);
      } else {
        console.log('📝 [SOFIA] Voz inativa - Sofia apenas escreve (sem falar)');
        if (!voiceEnabled) console.log('📝 [SOFIA] Motivo: voiceEnabled = false');
        if (!autoSpeak) console.log('📝 [SOFIA] Motivo: autoSpeak = false');
        if (!data.response) console.log('📝 [SOFIA] Motivo: data.response vazio');
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast.error('Erro ao enviar mensagem. Tente novamente!');
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        type: 'sofia',
        content: 'Ops! Tive um probleminha técnico. Pode tentar novamente? 😊',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;
      const filePath = `sofia-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      toast.error('Erro ao fazer upload da imagem');
      return null;
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVoiceRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const toggleAutoSpeak = () => {
    setAutoSpeak(!autoSpeak);
    if (autoSpeak && isSpeaking) {
      stopSpeaking();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header com controles de voz */}
      <Card className="border-2 border-purple-200 mb-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Bot className="h-6 w-6 text-purple-600" />
                <h3 className="font-semibold text-lg">Sofia - Chat por Voz</h3>
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Controle de Auto-Fala */}
              <Button
                variant="outline"
                size="sm"
                onClick={toggleAutoSpeak}
                className={`gap-2 ${autoSpeak ? 'bg-green-50 border-green-200' : ''}`}
                title={autoSpeak ? 'Desativar fala automática' : 'Ativar fala automática'}
              >
                {autoSpeak ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                <span className="hidden sm:inline">Auto-Fala</span>
              </Button>

                             {/* Status de voz */}
               {isSpeaking && (
                 <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                   <Loader2 className="h-3 w-3 animate-spin mr-1" />
                   Sofia falando...
                   {usingFreeFallback && <span className="ml-1">(Gratuito)</span>}
                 </Badge>
               )}
               
               {isListening && (
                 <Badge variant="secondary" className="bg-red-100 text-red-800 animate-pulse">
                   <Mic className="h-3 w-3 mr-1" />
                   Gravando...
                 </Badge>
               )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Área de mensagens */}
      <Card className="flex-1 border-2 border-purple-200">
        <ScrollArea ref={scrollAreaRef} className="h-[400px] p-4">
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] ${message.type === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`flex items-start gap-2 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-green-600 text-white'
                      }`}>
                        {message.type === 'user' ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>
                      
                      <div className={`rounded-lg p-3 ${
                        message.type === 'user'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.imageUrl && (
                          <img 
                            src={message.imageUrl} 
                            alt="Imagem enviada" 
                            className="w-32 h-32 object-cover rounded mb-2"
                          />
                        )}
                        <p className="whitespace-pre-wrap">{message.content}</p>
                        <div className={`text-xs mt-1 ${
                          message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
                        }`}>
                          {formatTime(message.timestamp)}
                          {message.isVoice && (
                            <span className="ml-2">🎤</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </Card>

      {/* Área de input com controles de voz */}
      <Card className="border-2 border-purple-200 mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Input
              placeholder={isListening ? "🎤 Falando..." : "⌨️ Digite sua mensagem ou use o microfone..."}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              disabled={isLoading}
            />
            
            {/* Botão de microfone */}
            <Button 
              variant={isListening ? "destructive" : "outline"}
              size="sm" 
              className="gap-2" 
              onClick={toggleVoiceRecording}
              disabled={isLoading || !hasSpeechRecognition}
              title={hasSpeechRecognition ? "Usar microfone" : "Microfone não suportado"}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              <span className="hidden sm:inline">Voz</span>
            </Button>

            {/* Botões de imagem */}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={() => cameraInputRef.current?.click()} 
              disabled={isLoading}
              title="Tirar foto"
            >
              <Camera className="h-4 w-4" />
              <span className="hidden sm:inline">Câmera</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2" 
              onClick={() => fileInputRef.current?.click()} 
              disabled={isLoading}
              title="Selecionar da galeria"
            >
              <Image className="h-4 w-4" />
              <span className="hidden sm:inline">Galeria</span>
            </Button>

            {/* Botão enviar */}
            <Button 
              onClick={handleSendMessage} 
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading} 
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
              title="Enviar mensagem"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          {/* Preview de imagem */}
          {imagePreview && (
            <div className="mt-3 relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-20 h-20 object-cover rounded border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 w-6 h-6 p-0 rounded-full"
                onClick={removeSelectedImage}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Transcrição em tempo real */}
          {isListening && transcript && (
            <div className="mt-3 p-2 bg-blue-50 rounded border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>🎤 Você disse:</strong> {transcript}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Inputs ocultos */}
      <input 
        ref={fileInputRef} 
        type="file" 
        accept="image/*" 
        onChange={handleImageSelect} 
        className="hidden" 
      />
      <input 
        ref={cameraInputRef} 
        type="file" 
        accept="image/*" 
        capture="environment" 
        onChange={handleImageSelect} 
        className="hidden" 
      />

      {/* Modal de confirmação */}
      {showConfirmationModal && pendingAnalysis && (
        <SofiaConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => { setShowConfirmationModal(false); setPendingAnalysis(null); }}
          analysisId={pendingAnalysis.analysisId}
          detectedFoods={pendingAnalysis.detectedFoods}
          userName={pendingAnalysis.userName}
          userId={user?.id || 'guest'}
          onConfirmation={(response: string) => {
            const sofiaMessage: Message = {
              id: (Date.now() + 3).toString(),
              type: 'sofia',
              content: response,
              timestamp: new Date()
            };
            setMessages(prev => [...prev, sofiaMessage]);
            setShowConfirmationModal(false);
            setPendingAnalysis(null);
          }}
        />
      )}
    </div>
  );
};

export default SofiaVoiceChat;
