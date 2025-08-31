import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send,
  Camera,
  Image as ImageIcon,
  Mic,
  MicOff,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
  Volume2,
  VolumeX,
  FileText,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnamnesisStatus } from '@/hooks/useAnamnesisStatus';
import { useSofiaPersonalizationContext } from '@/hooks/useAnamnesisContext';
import { toast } from 'react-toastify';
import { useConversation } from '@/hooks/useConversation';
import SofiaConfirmationModal from './sofia/SofiaConfirmationModal';
import { useNavigate } from 'react-router-dom';
import sofiaAvatar from '@/assets/sofia-avatar.png';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  hasImage?: boolean;
  imageUrl?: string;
  isVoice?: boolean;
}

interface HealthChatBotProps {
  user?: any;
}

const HealthChatBot: React.FC<HealthChatBotProps> = ({ user: propUser }) => {
  const { user } = useAuth();
  const currentUser = propUser || user;
  const navigate = useNavigate();
  const { hasCompletedAnamnesis, isLoading: anamnesisLoading } = useAnamnesisStatus();
  const { 
    hasAnamnesis, 
    canReceiveAnalysis,
    generatePersonalizedGreeting, 
    generatePersonalizedTips,
    getPersonalizedAlerts,
    getCompletionSuggestions,
    isLoading: personalizationLoading 
  } = useSofiaPersonalizationContext();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false); // Inicia muda
  const [autoSpeak, setAutoSpeak] = useState(false); // Inicia desativado
  
  // Mensagem inicial baseada no status da anamnese e personalização
  const getInitialMessage = () => {
    if (!currentUser) {
      return {
        id: '1',
        type: 'sofia' as const,
        content: 'Oi! Sou a Sofia, sua nutricionista virtual do Instituto dos Sonhos!\n\nEstou aqui para te ajudar com:\n📸 Análise de refeições (envie fotos!)\n📊 Dicas nutricionais personalizadas\n🍎 Orientações sobre alimentação saudável\n🎯 Apoio na sua jornada de transformação\n\nO que você gostaria de conversar hoje? Pode me enviar uma foto da sua refeição ou fazer qualquer pergunta sobre nutrição!',
        timestamp: new Date()
      };
    }
    
    if (anamnesisLoading || personalizationLoading) {
      return {
        id: '1',
        type: 'sofia' as const,
        content: 'Carregando suas informações personalizadas...',
        timestamp: new Date()
      };
    }
    
    if (!hasCompletedAnamnesis || !hasAnamnesis) {
      return {
        id: '1',
        type: 'sofia' as const,
        content: `Oi! Sou a Sofia, sua nutricionista virtual do Instituto dos Sonhos! 👋

Antes de começarmos nossa conversa, preciso conhecer você melhor para oferecer o melhor acompanhamento possível! 

📋 **Vamos fazer sua anamnese completa?**
É um questionário rápido que me ajudará a:
• Entender seu histórico de saúde
• Conhecer seus objetivos
• Personalizar minhas recomendações
• Oferecer suporte mais preciso

Depois disso, poderei te ajudar com:
📸 Análise de refeições (envie fotos!)
📊 Dicas nutricionais personalizadas
🍎 Orientações sobre alimentação saudável
🎯 Apoio na sua jornada de transformação

Clique no botão abaixo para começar! ⬇️`,
        timestamp: new Date()
      };
    }
    
    // Usar mensagem personalizada baseada na anamnese se tiver dados suficientes
    const personalizedGreeting = generatePersonalizedGreeting();
    let content = personalizedGreeting;
    
    // Se pode receber análise completa, incluir dicas e alertas personalizados
    if (canReceiveAnalysis) {
      const personalizedTips = generatePersonalizedTips();
      const alerts = getPersonalizedAlerts();
      
      // Adicionar dicas personalizadas
      if (personalizedTips.length > 0) {
        content += `\n\n**💡 Dicas personalizadas para você:**\n${personalizedTips.slice(0, 2).join('\n\n')}`;
      }
      
      // Adicionar alertas importantes (se houver)
      if (alerts.length > 0) {
        content += `\n\n**⚠️ Pontos importantes:**\n${alerts.slice(0, 1).join('\n')}`;
      }
      
      content += `\n\n**Como posso te ajudar hoje?**\n📸 Análise de refeições (envie fotos!)\n📊 Dicas personalizadas\n🎯 Acompanhamento dos seus objetivos\n💬 Conversa sobre nutrição`;
    } else {
      // Se não tem dados suficientes, mostrar sugestões para completar
      const suggestions = getCompletionSuggestions();
      if (suggestions.length > 0) {
        content += `\n\n**📝 Para uma experiência mais personalizada, complete:**`;
        suggestions.forEach(suggestion => {
          content += `\n${suggestion.icon} ${suggestion.label} - ${suggestion.description}`;
        });
      }
      
      content += `\n\n**Mesmo assim, posso te ajudar com:**\n📸 Análise básica de refeições\n💬 Dicas gerais sobre nutrição\n❓ Responder suas dúvidas`;
    }
    
    return {
      id: '1',
      type: 'sofia' as const,
      content,
      timestamp: new Date()
    };
  };

  const [messages, setMessages] = useState<Message[]>([getInitialMessage()]);

  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Atualizar mensagem inicial quando o status da anamnese mudar
  useEffect(() => {
    if (!anamnesisLoading) {
      setMessages([getInitialMessage()]);
    }
  }, [hasCompletedAnamnesis, anamnesisLoading]);

  // Verificar status da anamnese quando o chat for aberto
  useEffect(() => {
    if (isOpen && currentUser) {
      // Forçar uma nova verificação do status da anamnese
      const checkAnamnesis = async () => {
        try {
          const { data: anamnesis } = await supabase
            .from('user_anamnesis')
            .select('id, created_at')
            .eq('user_id', currentUser.id)
            .maybeSingle();
          
          // Se o status mudou, atualizar a mensagem
          const hasAnamnesis = !!anamnesis;
          
          // Se a anamnese foi preenchida recentemente (nos últimos 5 minutos)
          const isRecentlyCompleted = anamnesis?.created_at && 
            (new Date().getTime() - new Date(anamnesis.created_at).getTime() < 5 * 60 * 1000);
          
          if (hasAnamnesis !== hasCompletedAnamnesis || isRecentlyCompleted) {
            // Limpar mensagens antigas e adicionar nova mensagem de boas-vindas
            setMessages([getInitialMessage()]);
            
            // Se acabou de preencher a anamnese, mostrar mensagem de parabéns
            if (isRecentlyCompleted) {
              setTimeout(() => {
                const congratsMessage = {
                  id: Date.now().toString(),
                  type: 'sofia' as const,
                  content: `Parabéns por completar sua anamnese! 🎉\n\nAgora posso te oferecer recomendações muito mais personalizadas.\n\nComo posso te ajudar hoje?`,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, congratsMessage]);
              }, 1000);
            }
          }
        } catch (error) {
          console.error('Erro ao verificar anamnese:', error);
        }
      };
      
      checkAnamnesis();
    }
  }, [isOpen, currentUser]);

  // Cleanup apenas na desmontagem (evita cancelar voz a cada re-render)
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, []);

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

  // Função para navegar para a anamnese
  const handleGoToAnamnesis = () => {
    setIsOpen(false); // Fechar o chat
    navigate('/anamnesis'); // Navegar para a página da anamnese
    toast.info('📋 Redirecionando para a anamnese...');
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    let messageContent = inputMessage.trim();
    
    // Se estiver ouvindo e há transcrição, usar a transcrição
    if (transcript && isListening) {
      messageContent = transcript;
    }
    
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageContent,
      timestamp: new Date(),
      isVoice: isListening && !!transcript
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Chamar edge function da Sofia atualizada
      const { data, error } = await supabase.functions.invoke('sofia-enhanced-memory', {
        body: {
          message: messageContent,
          userId: currentUser?.id || 'guest',
          context: {
            userName: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'usuário'
          }
        }
      });

      if (error) throw error;

      const sofiaResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: data.message || data.response || 'Oi querido(a)! Como posso te ajudar hoje? 💚',
        timestamp: new Date()
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
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: 'Ops! Tive um probleminha técnico. Pode tentar novamente? 🤖💭',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Erro ao enviar mensagem');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || isLoading) return;

    setIsLoading(true);

    try {
      // Upload da imagem
      const fileName = `${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      const imageUrl = urlData.publicUrl;

      // Adicionar mensagem do usuário
      const userMessage: Message = {
        id: Date.now().toString(),
        type: 'user',
        content: 'Enviou uma foto da refeição 📸',
        timestamp: new Date(),
        hasImage: true,
        imageUrl
      };

      setMessages(prev => [...prev, userMessage]);

      // Chamar análise da Sofia
      const { data, error } = await supabase.functions.invoke('sofia-image-analysis', {
        body: {
          imageUrl,
          userId: currentUser?.id || 'guest',
          userContext: {
            currentMeal: 'refeicao',
            userName: currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'usuário'
          }
        }
      });

      if (error) throw error;

      let sofiaContent = '';
      if (data.success && data.requires_confirmation) {
        // Modo confirmação obrigatória: NÃO enviar mensagem de resultado antes da confirmação
        const userName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'usuário';

        // Configurar dados para o modal de confirmação (única fonte de verdade)
        const foodsForModal = (data.food_detection?.foods_detected && data.food_detection.foods_detected.length > 0)
          ? data.food_detection.foods_detected
          : (data.sofia_analysis?.foods_detected && data.sofia_analysis.foods_detected.length > 0)
            ? data.sofia_analysis.foods_detected
            : (data.alimentos_identificados || []);

        setPendingAnalysis({
          analysisId: data.analysis_id,
          detectedFoods: foodsForModal,
          userName: userName
        });

        setShowConfirmationModal(true);
        toast.success('📸 Análise concluída! Confirme os alimentos no modal.');

      } else if (data.success) {
        // Resposta sem confirmação (fallback raro)
        const foodList = data.alimentos_identificados?.join(', ') || 'vários alimentos';
        sofiaContent = `📸 Analisei sua refeição!\n\n✨ Identifiquei: ${foodList}`;
        const sofiaResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'sofia',
          content: sofiaContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, sofiaResponse]);
        toast.success('Foto analisada pela Sofia!');
      } else {
        // Erro na análise
        sofiaContent = data.message || 'Não consegui analisar a imagem. Pode me contar o que você está comendo?';
        const sofiaResponse: Message = {
          id: (Date.now() + 1).toString(),
          type: 'sofia',
          content: sofiaContent,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, sofiaResponse]);
      }

    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'sofia',
        content: 'Ops! Tive problemas para analisar sua foto. Pode tentar novamente ou me contar o que você está comendo?',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
      toast.error('Erro ao processar imagem');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implementar gravação de áudio
    toast.info('Funcionalidade de áudio em desenvolvimento');
  };

  const handleConfirmation = (response: string, calories?: number) => {
    const sofiaResponse: Message = {
      id: Date.now().toString(),
      type: 'sofia',
      content: response,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, sofiaResponse]);
    setPendingAnalysis(null);
    setShowConfirmationModal(false);
    
    if (calories) {
      toast.success(`✅ Análise confirmada! ${calories} kcal estimadas.`);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg"
      >
        <MessageCircle className="w-6 h-6" />
      </Button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className={`fixed z-50 ${
        isMinimized 
          ? 'bottom-4 right-4 w-80 h-16' 
          : 'bottom-4 right-4 w-96 h-[600px]'
      }`}
    >
      <Card className="h-full flex flex-col bg-white shadow-xl border border-purple-200">
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={sofiaAvatar} 
                  alt="Sofia"
                  className="w-8 h-8 rounded-full object-cover"
                />
                {voiceEnabled && (
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  />
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-sm">Sofia - Instituto dos Sonhos</CardTitle>
                <p className="text-xs opacity-90">
                  {voiceEnabled ? 'Voz ativa - Online!' : 'Online e pronta para ajudar!'}
                </p>
              </div>
              <div className="flex items-center">
                <img 
                  src="/images/instituto-logo.png" 
                  alt="Instituto dos Sonhos" 
                  className="h-6 w-6 object-contain opacity-80"
                />
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* Controle de voz */}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={handleVoiceToggle}
                title={voiceEnabled ? 'Desativar voz' : 'Ativar voz'}
              >
                {voiceEnabled ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
                onClick={() => setIsOpen(false)}
              >
                <X className="w-3 h-3" />
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
                className="mt-2 space-y-1"
              >
                {isListening && (
                  <Badge variant="destructive" className="text-xs animate-pulse">
                    🎤 Gravando...
                  </Badge>
                )}
                
                {isSpeaking && (
                  <Badge variant="default" className="text-xs animate-pulse bg-white/20">
                    🗣️ Sofia falando...
                  </Badge>
                )}
                
                {transcript && (
                  <div className="p-2 bg-white/20 rounded text-xs">
                    <strong>Você disse:</strong> {transcript}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>

        {!isMinimized && (
          <>
            {/* Mensagens */}
            <CardContent className="flex-1 overflow-y-auto p-3 space-y-3 bg-gradient-to-b from-purple-50/50 to-pink-50/50">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl break-words ${
                        message.type === 'user'
                          ? 'bg-purple-500 text-white rounded-br-sm'
                          : 'bg-white border border-purple-200 text-gray-800 rounded-bl-sm shadow-sm'
                      }`}
                    >
                      {message.type === 'sofia' && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                            👩‍⚕️
                          </div>
                          <span className="text-xs font-medium text-purple-600">Sofia:</span>
                        </div>
                      )}
                      
                      {message.hasImage && message.imageUrl && (
                        <img 
                          src={message.imageUrl} 
                          alt="Imagem enviada" 
                          className="w-full h-32 object-cover rounded-lg mb-2"
                        />
                      )}
                      
                      <p className="whitespace-pre-line text-xs leading-relaxed">
                        {message.content}
                      </p>
                      
                      {/* Botão da anamnese para a primeira mensagem quando não completou */}
                      {message.id === '1' && currentUser && !hasCompletedAnamnesis && !anamnesisLoading && (
                        <div className="mt-3">
                          <Button
                            onClick={handleGoToAnamnesis}
                            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-xs font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
                          >
                            <FileText className="w-3 h-3 mr-2" />
                            Preencher Anamnese Completa
                            <ArrowRight className="w-3 h-3 ml-2" />
                          </Button>
                        </div>
                      )}
                      
                      {message.isVoice && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          <Mic className="w-2 h-2 mr-1" />
                          Voz
                        </Badge>
                      )}
                      <div className={`text-xs mt-1 ${
                        message.type === 'user' ? 'text-purple-200' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-purple-200 rounded-2xl rounded-bl-sm p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs">
                        👩‍⚕️
                      </div>
                      <span className="text-xs font-medium text-purple-600">Sofia está digitando...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </CardContent>

            {/* Input de Mensagem */}
            <div className="p-3 border-t border-border/50 bg-white">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={transcript || inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={voiceEnabled ? "Digite ou fale sua mensagem..." : "Digite sua mensagem..."}
                    className="pr-24 h-9 text-xs border-purple-200 focus:border-purple-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    disabled={isLoading || isListening}
                  />
                  <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
                    {voiceEnabled && hasSpeechRecognition && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-6 w-6 p-0 hover:bg-purple-100 ${isListening ? 'bg-red-100' : ''}`}
                        onClick={handleMicToggle}
                        disabled={isLoading}
                        title={isListening ? 'Parar gravação' : 'Começar gravação'}
                      >
                        {isListening ? (
                          <MicOff className="w-3 h-3 text-red-500 animate-pulse" />
                        ) : (
                          <Mic className="w-3 h-3 text-gray-500" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-purple-100"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <Camera className="w-3 h-3 text-gray-500" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  className="bg-purple-500 hover:bg-purple-600 text-white h-9 px-3"
                  disabled={(!inputMessage.trim() && !transcript) || isLoading}
                  size="sm"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          </>
        )}
      </Card>

      {/* Modal de confirmação obrigatório */}
      {showConfirmationModal && pendingAnalysis && (
        <SofiaConfirmationModal
          isOpen={showConfirmationModal}
          onClose={() => {
            setShowConfirmationModal(false);
            setPendingAnalysis(null);
          }}
          analysisId={pendingAnalysis.analysisId}
          detectedFoods={pendingAnalysis.detectedFoods}
          userName={pendingAnalysis.userName}
          userId={currentUser?.id || 'guest'}
          onConfirmation={handleConfirmation}
        />
      )}
    </motion.div>
  );
};

export default HealthChatBot;