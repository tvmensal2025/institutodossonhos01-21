import React, { useState, useRef, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Bot, 
  User as UserIcon, 
  Mic, 
  Camera, 
  Send, 
  Image, 
  X, 
  Loader2, 
  Volume2, 
  VolumeX,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

interface SofiaSimpleChatProps {
  user: SupabaseUser | null;
  isOpen: boolean;
  onClose: () => void;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

const SofiaSimpleChat: React.FC<SofiaSimpleChatProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  isMinimized = false,
  onToggleMinimize 
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Criar mensagem inicial quando o usuário estiver disponível
  useEffect(() => {
    if (user && messages.length === 0) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'querido(a)';
      setMessages([{
        id: '1',
        type: 'sofia',
        content: `Oi ${userName}! 👋 Sou a Sofia, sua assistente de saúde!

Como posso te ajudar hoje? Pode me enviar uma foto da sua refeição ou fazer qualquer pergunta! ✨`,
        timestamp: new Date()
      }]);
    }
  }, [user, messages.length]);

  // Scroll para baixo quando novas mensagens chegarem
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleImageUpload = async (file: File): Promise<string | null> => {
    try {
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para enviar imagens",
          variant: "destructive",
        });
        return null;
      }

      const fileName = `${user.id}/${Date.now()}_${file.name}`;
      const { data, error } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (error) {
        console.error('Erro ao fazer upload da imagem:', error);
        toast({
          title: "Erro",
          description: "Erro ao fazer upload da imagem",
          variant: "destructive",
        });
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar imagem",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if ((!inputMessage.trim() && !selectedImage) || !user || isLoading) return;

    let imageUrl: string | undefined;

    if (selectedImage) {
      toast({
        title: "📸 Fazendo upload da imagem...",
        description: "Aguarde um momento",
      });
      imageUrl = await handleImageUpload(selectedImage);
      if (!imageUrl) return;
    }

    const currentMessage = inputMessage.trim();
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
      imageUrl: imageUrl
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setSelectedImage(null);
    setImagePreview(null);
    setIsLoading(true);

    try {
      const conversationHistory = messages.slice(-5).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      let data, error;

      if (imageUrl) {
        toast({
          title: "🔍 Sofia está analisando sua imagem...",
          description: "Processando análise nutricional",
        });
        
        const analysisResult = await supabase.functions.invoke('sofia-image-analysis', {
          body: {
            imageUrl: imageUrl,
            userId: user.id,
            userContext: {
              currentMeal: 'refeicao',
              userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'usuário'
            }
          }
        });

        data = analysisResult.data;
        error = analysisResult.error;

        if (analysisResult.data && analysisResult.data.sofia_analysis) {
          const sofiaResponse: Message = {
            id: (Date.now() + 1).toString(),
            type: 'sofia',
            content: analysisResult.data.sofia_analysis.analysis || 'Analisei sua refeição!',
            timestamp: new Date()
          };
          setMessages(prev => [...prev, sofiaResponse]);
          toast({
            title: "✅ Análise da Sofia concluída!",
            description: "Sua refeição foi analisada com sucesso",
          });
        } else {
          error = analysisResult.error;
        }
      } else {
        const chatResult = await supabase.functions.invoke('sofia-enhanced-memory', {
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

      if (data && data.response) {
        const sofiaResponse: Message = {
          id: (Date.now() + 2).toString(),
          type: 'sofia',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, sofiaResponse]);
      } else {
        throw new Error('Resposta inválida do servidor');
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro",
        description: "Erro ao enviar mensagem. Tente novamente!",
        variant: "destructive",
      });
      
      const errorMessage: Message = {
        id: (Date.now() + 3).toString(),
        type: 'sofia',
        content: 'Ops! Tive um probleminha técnico. Pode tentar novamente? 🤖💭',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCameraClick = () => {
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    fileInputRef.current?.click();
  };

  const handleMicClick = () => {
    if (voiceEnabled) {
      setIsListening(!isListening);
      toast({
        title: isListening ? "Parando gravação..." : "Iniciando gravação...",
        description: isListening ? "Processando sua mensagem..." : "Fale agora!",
      });
    } else {
      toast({
        title: "Ative a voz primeiro!",
        description: "Clique no botão de voz para ativar o modo áudio",
      });
    }
  };

  const toggleVoice = () => {
    setVoiceEnabled(!voiceEnabled);
    if (!voiceEnabled) {
      toast({
        title: "Voz ativada!",
        description: "Agora você pode conversar com a Sofia por voz",
      });
    } else {
      setIsListening(false);
      setIsSpeaking(false);
      toast({
        title: "Voz desativada",
        description: "Modo texto ativado",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="fixed bottom-20 right-6 z-50"
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-white font-medium text-sm">Sofia</h3>
              <p className="text-emerald-100 text-xs">Assistente IA</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {onToggleMinimize && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-white/20"
                onClick={onToggleMinimize}
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 text-white hover:bg-white/20"
              onClick={onClose}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 400 }}
            exit={{ height: 0 }}
            className="w-80"
          >
            {/* Messages */}
            <ScrollArea className="h-64 p-3" ref={scrollAreaRef}>
              <div className="space-y-3">
                {messages.map(message => {
                  const time = message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                  const isUser = message.type === 'user';
                  return (
                    <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-2xl ${
                        isUser 
                          ? 'bg-emerald-600 text-white rounded-br-md' 
                          : 'bg-gray-100 text-gray-800 rounded-bl-md'
                      } px-3 py-2`}>
                        {message.imageUrl && (
                          <img src={message.imageUrl} alt="Imagem enviada" className="max-w-[200px] h-auto rounded-lg mb-2" />
                        )}
                        <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                        <div className={`mt-1 text-[10px] text-right ${isUser ? 'text-emerald-100' : 'text-gray-500'}`}>
                          {time}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-2xl rounded-bl-md px-3 py-2 text-sm flex items-center gap-2 text-gray-600">
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-500" />
                      Sofia está digitando...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-3 border-t border-gray-200">
              <div className="flex items-center gap-2">
                {/* Voice Toggle */}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 rounded-full ${
                    voiceEnabled 
                      ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={toggleVoice}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </Button>

                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="w-8 h-8 rounded object-cover" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white hover:bg-red-600"
                      onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                    >
                      <X className="w-2 h-2" />
                    </Button>
                  </div>
                )}

                {/* Input */}
                <div className="relative flex-1">
                  <Input
                    placeholder={voiceEnabled ? "Digite ou use o microfone..." : "Digite sua mensagem..."}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="pr-20 text-sm"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleCameraClick} disabled={isLoading}>
                      <Camera className="h-3 w-3" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={handleGalleryClick} disabled={isLoading}>
                      <Image className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Send/Mic Button */}
                <Button
                  onClick={inputMessage.trim() || selectedImage ? handleSendMessage : handleMicClick}
                  disabled={isLoading}
                  size="icon"
                  className={`h-8 w-8 rounded-full ${
                    isListening ? 'bg-red-500 text-white animate-pulse' : 
                    voiceEnabled ? 'bg-green-500 text-white' : 'bg-emerald-500 text-white'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : inputMessage.trim() || selectedImage ? (
                    <Send className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hidden file inputs */}
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
      </div>
    </motion.div>
  );
};

export default SofiaSimpleChat;
