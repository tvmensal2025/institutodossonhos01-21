import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, Loader2, ArrowLeft, Phone, Upload, MoreVertical, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { PremiumExamUploader } from '@/components/sofia/PremiumExamUploader';
import { useWeeklyChatInsights } from '@/hooks/useWeeklyChatInsights';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Character {
  name: string;
  avatar: string;
  subtitle: string;
  colors: {
    primary: string;
    secondary: string;
  };
}

const WhatsAppChatPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState<Character | null>(null);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAndGenerateIfNeeded } = useWeeklyChatInsights();

  // Função para determinar personagem baseado no dia
  const getCurrentCharacter = (): Character => {
    const currentDay = new Date().getDay();
    const isFriday = currentDay === 5;
    
    if (isFriday) {
      return {
        name: 'Dr. Vita',
        avatar: 'DV',
        subtitle: 'online',
        colors: {
          primary: 'from-blue-600 to-blue-800',
          secondary: 'bg-blue-50 text-blue-800'
        }
      };
    } else {
      return {
        name: 'Sof.ia',
        avatar: 'SF',
        subtitle: 'online',
        colors: {
          primary: 'from-purple-500 to-pink-600',
          secondary: 'bg-purple-50 text-purple-800'
        }
      };
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const character = getCurrentCharacter();
    setCurrentCharacter(character);
    
    // Mensagem de boas-vindas personalizada por personagem
    let welcomeContent = '';
    
    if (character.name === 'Dr. Vita') {
      welcomeContent = '👨‍⚕️ Oi! Sou o Dr. Vita.\n\nSexta-feira, hora do seu resumo semanal!\n\nComo você está?';
    } else {
      welcomeContent = '💜 Oi!\n\nSou a Sof.ia, sua amiga de bem-estar.\n\nComo foi seu dia?';
    }
    
    const welcomeMessage: Message = {
      id: 'welcome',
      content: welcomeContent,
      isUser: false,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Erro ao obter usuário:', error);
        return null;
      }
      return user;
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      return null;
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const user = await getCurrentUser();
    if (!user) {
      toast({
        title: "Erro de autenticação",
        description: "Você precisa estar logado para usar o chat.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Preparar histórico da conversa para a IA
      const conversationHistory = messages
        .filter(msg => msg.id !== 'welcome')
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.content
        }));

      const { data, error } = await supabase.functions.invoke('health-chat-bot', {
        body: {
          message: currentMessage,
          userId: user.id,
          conversationHistory
        }
      });

      if (error) {
        console.error('Erro da Edge Function:', error);
        throw new Error(error.message || 'Erro na comunicação com o servidor');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || 'Desculpe, não consegui gerar uma resposta.',
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Verificar e gerar insights semanais se necessário
      setTimeout(() => {
        checkAndGenerateIfNeeded();
      }, 2000);

    } catch (error: any) {
      console.error('Erro ao enviar mensagem:', error);
      
      toast({
        title: "Erro no chat",
        description: "Não foi possível enviar a mensagem. Tente novamente.",
        variant: "destructive"
      });

      const errorBotMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `😔 Não foi possível enviar a mensagem. Tente novamente.\n\nTente reformular sua pergunta ou aguarde alguns instantes.`,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorBotMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0a]">
      {/* Header estilo WhatsApp */}
      <div className={`bg-gradient-to-r ${currentCharacter?.colors.primary || 'from-primary to-blue-600'} text-white p-4 flex items-center justify-between shadow-lg`}>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <Avatar className="h-10 w-10 border-2 border-white/20">
            <AvatarImage src="/placeholder.svg" />
            <AvatarFallback className="bg-white/20 text-white text-sm font-semibold">
              {currentCharacter?.avatar || 'DV'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <h1 className="font-semibold text-lg">{currentCharacter?.name || 'Dr. Vita'}</h1>
            <p className="text-sm text-white/80">{currentCharacter?.subtitle || 'online'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10"
            onClick={() => window.open(`tel:+5511973125846`, '_self')}
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-white hover:bg-white/10"
            onClick={() => setIsExamModalOpen(true)}
          >
            <Upload className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Área de mensagens estilo WhatsApp */}
      <div 
        className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-2 min-h-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3e%3cg fill='none' fill-rule='evenodd'%3e%3cg fill='%23ffffff' fill-opacity='0.05'%3e%3cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3e%3c/g%3e%3c/g%3e%3c/svg%3e")`,
          backgroundColor: '#0a0a0a'
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} mb-4`}
          >
            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2 relative break-words overflow-wrap-anywhere ${
                message.isUser
                  ? 'bg-primary text-primary-foreground rounded-br-md'
                  : 'bg-muted text-muted-foreground rounded-bl-md'
              }`}
              style={{
                boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                overflowWrap: 'break-word',
                wordBreak: 'break-word'
              }}
            >
              <div className="text-sm leading-relaxed">
                {formatMessage(message.content)}
              </div>
              <div className={`text-xs mt-1 opacity-70 ${
                message.isUser ? 'text-right' : 'text-left'
              }`}>
                {message.timestamp.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              
              {/* Triângulo indicador */}
              <div
                className={`absolute top-0 w-0 h-0 ${
                  message.isUser
                    ? 'right-0 border-l-8 border-l-primary border-t-8 border-t-transparent'
                    : 'left-0 border-r-8 border-r-muted border-t-8 border-t-transparent'
                }`}
              />
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-muted text-muted-foreground rounded-2xl rounded-bl-md px-3 sm:px-4 py-2 relative max-w-[85%] sm:max-w-[70%] break-words overflow-wrap-anywhere">
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">{currentCharacter?.name || 'Dr. Vita'} está digitando...</span>
              </div>
              <div className="absolute top-0 left-0 w-0 h-0 border-r-8 border-r-muted border-t-8 border-t-transparent" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input estilo WhatsApp */}
      <div className="p-4 bg-background border-t flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full flex items-center px-4 py-2">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Digite uma mensagem"
              disabled={isLoading}
              className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          {inputMessage.trim() ? (
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
              className="rounded-full bg-primary hover:bg-primary/90 h-12 w-12"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-12 w-12 text-muted-foreground"
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Uploader Premium de exames */}
      <PremiumExamUploader 
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
      />
    </div>
  );
};

export default WhatsAppChatPage;