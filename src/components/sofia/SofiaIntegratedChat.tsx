import React, { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

interface SofiaIntegratedChatProps {
  user: User | null;
  className?: string;
  compact?: boolean;
}

const SofiaIntegratedChat: React.FC<SofiaIntegratedChatProps> = ({ 
  user, 
  className = '', 
  compact = false 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Inicia muda
  const [autoSpeak, setAutoSpeak] = useState(false); // Inicia desativado

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
      if (voiceEnabled) {
        toast.info('🎤 Sofia está falando...');
      }
    },
    onSpeechEnd: () => {
      if (voiceEnabled) {
        toast.success('✅ Sofia terminou de falar');
      }
    },
    onError: (errorMsg) => {
      if (voiceEnabled) {
        toast.error(`❌ Erro de voz: ${errorMsg}`);
      }
    },
  });

  // Criar mensagem inicial quando o usuário estiver disponível
  useEffect(() => {
    if (user && messages.length === 0) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'querido(a)';
      setMessages([{
        id: '1',
        type: 'sofia',
        content: `Oi ${userName}! Sou a Sofia, sua nutricionista virtual do Instituto dos Sonhos!

Estou aqui para te ajudar com:
📸 Análise de refeições (envie fotos!)
💡 Dicas nutricionais personalizadas
🥗 Orientações sobre alimentação saudável
🎯 Apoio na sua jornada de transformação

O que você gostaria de conversar hoje? Pode me enviar uma foto da sua refeição ou fazer qualquer pergunta sobre nutrição!`,
        timestamp: new Date(),
      }]);
    }
  }, [user]);

  // Auto-scroll para a última mensagem
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  // Limpar transcrição quando parar de escutar
  useEffect(() => {
    if (!isListening && transcript) {
      // Só limpa se não estiver ouvindo
      setTimeout(() => {
        // Lógica para processar transcrição final se necessário
      }, 100);
    }
  }, [isListening, transcript]);

  // Cleanup apenas na desmontagem (evita cancelar voz a cada re-render)
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

  const handleSendMessage = async (messageContent: string, imageFile?: File) => {
    if (!messageContent.trim() && !imageFile) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
      imageUrl: imageFile ? URL.createObjectURL(imageFile) : undefined,
      isVoice: isListening && !!transcript
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);

    try {
      let prompt = messageContent;
      let base64Image = null;

      if (imageFile) {
        // Converter imagem para base64
        const reader = new FileReader();
        base64Image = await new Promise<string>((resolve) => {
          reader.onloadend = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]);
          };
          reader.readAsDataURL(imageFile);
        });

        prompt = `${messageContent}\n\n[Usuário enviou uma imagem para análise]`;
      }

      // Chamar edge function
      const { data, error } = await supabase.functions.invoke('gpt-chat', {
        body: {
          prompt,
          image: base64Image,
          context: 'sofia-nutrition'
        }
      });

      if (error) throw error;

      const sofiaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: data.response || 'Desculpe, não consegui processar sua mensagem.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, sofiaResponse]);

      // Auto-fala se habilitada e voz estiver ativada
      if (voiceEnabled && autoSpeak && sofiaResponse.content) {
        // Remove emojis e caracteres especiais para melhor síntese
        const cleanContent = sofiaResponse.content.replace(/[^\w\s.,!?;:\-()]/g, '');
        speak(cleanContent);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!voiceEnabled) {
      setVoiceEnabled(true);
      setAutoSpeak(true); // Ativar auto-fala ao ligar a voz
      toast.success('🎤 Voz da Sofia ativada!');
    } else {
      setVoiceEnabled(false);
      setAutoSpeak(false);
      stopSpeaking();
      stopListening();
      toast.info('🔇 Voz da Sofia desativada');
    }
  };

  const handleMicToggle = () => {
    if (!voiceEnabled) {
      toast.warning('Ative a voz da Sofia primeiro!');
      return;
    }

    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleImageSelect = (file: File) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalMessage = inputMessage;
    if (transcript && isListening) {
      finalMessage = transcript;
    }
    
    handleSendMessage(finalMessage, selectedImage || undefined);
  };

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className={`${compact ? 'py-3' : 'py-4'} border-b border-border/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              {voiceEnabled && (
                <motion.div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Volume2 className="w-2 h-2 text-white" />
                </motion.div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                Sofia
                <Sparkles className="w-4 h-4 text-purple-500" />
              </h3>
              <p className="text-sm text-muted-foreground">
                {voiceEnabled ? 'Nutricionista Virtual - Voz Ativa' : 'Nutricionista Virtual'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {voiceEnabled && (
              <>
                <Badge variant={autoSpeak ? "default" : "secondary"} className="text-xs">
                  {autoSpeak ? "Auto-fala" : "Manual"}
                </Badge>
                {usingFreeFallback && (
                  <Badge variant="outline" className="text-xs">
                    Gratuito
                  </Badge>
                )}
              </>
            )}
            
            <Button
              size="sm"
              variant={voiceEnabled ? "default" : "outline"}
              onClick={handleVoiceToggle}
              className="text-xs"
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Status indicators quando voz está ativa */}
        <AnimatePresence>
          {voiceEnabled && (isListening || isSpeaking || transcript) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 space-y-2"
            >
              {isListening && (
                <Badge variant="destructive" className="animate-pulse">
                  🎤 Gravando...
                </Badge>
              )}
              
              {isSpeaking && (
                <Badge variant="default" className="animate-pulse">
                  🗣️ Sofia falando...
                </Badge>
              )}
              
              {transcript && (
                <div className="p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Você disse:</strong> {transcript}
                  </p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </CardHeader>

      <CardContent className="flex-1 p-0 flex flex-col min-h-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {message.type === 'sofia' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-3 rounded-lg ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  }`}>
                    {message.imageUrl && (
                      <img 
                        src={message.imageUrl} 
                        alt="Imagem enviada" 
                        className="max-w-full h-auto rounded-lg mb-2"
                      />
                    )}
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.isVoice && (
                      <Badge variant="outline" className="mt-2 text-xs">
                        <Mic className="w-3 h-3 mr-1" />
                        Mensagem por voz
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 px-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>

                {message.type === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3 justify-start"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Sofia está pensando...</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>

        {/* Image Preview */}
        {imagePreview && (
          <div className="p-4 border-t border-border/20">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-w-32 h-auto rounded-lg"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                onClick={removeImage}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-border/20">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                value={transcript || inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={voiceEnabled ? "Digite ou fale sua mensagem..." : "Digite sua mensagem..."}
                disabled={isListening}
                className="pr-24"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                {voiceEnabled && hasSpeechRecognition && (
                  <Button
                    type="button"
                    size="sm"
                    variant={isListening ? "destructive" : "ghost"}
                    className="h-8 w-8 p-0"
                    onClick={handleMicToggle}
                  >
                    {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </Button>
                )}
                
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => cameraInputRef.current?.click()}
                >
                  <Camera className="w-4 h-4" />
                </Button>
                
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Image className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <Button type="submit" size="sm" disabled={isLoading || (!inputMessage.trim() && !transcript && !selectedImage)}>
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {/* Hidden file inputs */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
            className="hidden"
          />
        </div>
      </CardContent>

      {/* Modal de confirmação */}
      {showConfirmationModal && pendingAnalysis && (
        <SofiaConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setPendingAnalysis(null);
          }}
          analysisId={pendingAnalysis.id || ''}
          detectedFoods={pendingAnalysis.foods || []}
          userName={user?.user_metadata?.full_name || 'Usuário'}
          userId={user?.id || ''}
          onConfirmation={(response) => {
            setShowConfirmationModal(false);
            setPendingAnalysis(null);
          }}
        />
      )}
    </Card>
  );
};

export default SofiaIntegratedChat;