import React, { useState, useRef, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  CheckCheck, 
  Volume2, 
  VolumeX,
  MessageCircle,
  Target,
  Flame,
  Trophy,
  BarChart3,
  Activity,
  Sparkles,
  Apple,
  ChefHat,
  Zap,
  Menu,
  Home,
  MessageSquare,
  Camera as CameraIcon,
  Settings,
  Heart,
  Calendar,
  BookOpen,
  Trophy as TrophyIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';
import { DailyMissionsFinal } from '@/components/daily-missions/DailyMissionsFinal';
import { NutritionTracker } from '@/components/nutrition-tracking/NutritionTracker';
import SofiaConfirmationModal from './SofiaConfirmationModal';
import sofiaAvatar from '@/assets/sofia-avatar.png';

interface Message {
  id: string;
  type: 'user' | 'sofia';
  content: string;
  timestamp: Date;
  imageUrl?: string;
}

type SofiaSection = 'chat' | 'metas' | 'missao' | 'desafios' | 'historico' | 'estatisticas' | 'analysis' | 'challenges' | 'image-analysis' | 'nutrition' | 'tracking' | 'goals' | 'progress' | 'education' | 'achievements' | 'settings' | 'profile';

interface SofiaChatProps {
  user: SupabaseUser | null;
}

const SofiaChat: React.FC<SofiaChatProps> = ({ user }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<SofiaSection>('chat');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [pendingAnalysis, setPendingAnalysis] = useState<any>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Hooks
  const { meals, goals, getDailyNutrition } = useNutritionTracking();

  // Criar mensagem inicial quando o usuário estiver disponível
  useEffect(() => {
    if (user && messages.length === 0) {
      const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'querido(a)';
      setMessages([{
        id: '1',
        type: 'sofia',
        content: `Oi ${userName}! 👋 Sou a Sofia, sua nutricionista virtual do Instituto dos Sonhos!

Estou aqui para te ajudar com:
🍽️ Análise de refeições (envie fotos!)
📊 Dicas nutricionais personalizadas
💪 Orientações sobre alimentação saudável
🎯 Apoio na sua jornada de transformação

O que você gostaria de conversar hoje? Pode me enviar uma foto da sua refeição ou fazer qualquer pergunta sobre nutrição! ✨`,
        timestamp: new Date()
      }]);
    }
  }, [user, messages.length]);

  // Buscar convites pendentes (metas em grupo) para este usuário
  async function loadPendingInvites() {
    try {
      if (!user) return;
        const { data, error } = await (supabase as any)
          .from('user_goal_invitations')
          .select('id, goal_id, invitee_name, invitee_email, status, created_at')
          .eq('invitee_user_id', user.id)
          .eq('status', 'pending')
          .order('created_at', { ascending: false });
      if (!error) setPendingInvites(data || []);
    } catch (e) {
      console.error('Erro ao carregar convites:', e);
    }
  }

  useEffect(() => { loadPendingInvites(); }, [user]);
  useEffect(() => {
    const i = setInterval(() => loadPendingInvites(), 30000);
    return () => clearInterval(i);
  }, [user]);

  async function acceptInvite(inviteId: string, goalId: string) {
    try {
      if (!user) return;
      // inserir participação
      await (supabase as any).from('user_goal_participants').insert({ goal_id: goalId, user_id: user.id, can_view_progress: true });
      // atualizar convite
      await (supabase as any).from('user_goal_invitations').update({ status: 'approved' }).eq('id', inviteId);
      await loadPendingInvites();
      toast({
        title: "Meta sincronizada!",
        description: "Vocês poderão ver o progresso um do outro.",
      });
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        type: 'sofia',
        content: 'Parabéns! 🎉 Sua nova meta compartilhada foi aprovada e sincronizada. Estou aqui para te ajudar nessa jornada!',
        timestamp: new Date()
      }]);
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar o convite.",
        variant: "destructive",
      });
    }
  }

  async function rejectInvite(inviteId: string) {
    try {
      if (!user) return;
      await (supabase as any).from('user_goal_invitations').update({ status: 'rejected' }).eq('id', inviteId);
      await loadPendingInvites();
      toast({
        title: "Convite recusado",
        description: "O convite foi recusado com sucesso.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Erro",
        description: "Não foi possível recusar o convite.",
        variant: "destructive",
      });
    }
  }

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
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho (5MB)
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

    // Upload da imagem se houver
    if (selectedImage) {
      toast({
        title: "📸 Fazendo upload da imagem...",
        description: "Aguarde um momento",
      });
      imageUrl = await handleImageUpload(selectedImage);
      if (!imageUrl) return; // Para se falhou o upload
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
      // Preparar histórico de conversa para contexto
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

        if (analysisResult.data?.success && Array.isArray(analysisResult.data.detectedFoods) && analysisResult.data.detectedFoods.length > 0) {
          setPendingAnalysis({
            analysisId: analysisResult.data.analysisId,
            detectedFoods: analysisResult.data.detectedFoods,
            userName: user.user_metadata?.full_name || user.email?.split('@')[0] || 'usuário'
          });
          setShowConfirmationModal(true);
          toast({
            title: "📸 Análise concluída!",
            description: "Confirme os alimentos no modal.",
          });
          setIsLoading(false);
          return;
        }

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

      if (data && (data.response || data.message)) {
        const sofiaResponse: Message = {
          id: (Date.now() + 2).toString(),
          type: 'sofia',
          content: data.response || data.message || 'Oi querido(a)! Como posso te ajudar hoje? 💚',
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
      // Implementar gravação de áudio
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

  const menuItems = [
    { id: 'goals', label: 'Metas', icon: Target, color: 'text-yellow-500' },
    { id: 'achievements', label: 'Conquistas', icon: TrophyIcon, color: 'text-amber-500' },
    { id: 'challenges', label: 'Desafios', icon: Flame, color: 'text-orange-500' },
    { id: 'profile', label: 'Perfil', icon: UserIcon, color: 'text-cyan-500' },
  ];

  const handleDashboardClick = () => {
    navigate('/dashboard');
  };

  const handleSectionChange = (section: typeof currentSection) => {
    setCurrentSection(section);
    setIsMobileSidebarOpen(false); // Fecha o sidebar no mobile
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'chat':
        return (
          <div className="flex-1 flex flex-col h-full bg-[#0D1117] min-h-0">
            {/* Header tipo WhatsApp - fixo no topo */}
            <div className="flex items-center gap-2 xs:gap-3 p-2 xs:p-3 sm:p-4 md:p-6 bg-[#2D333B] border-b border-[#373E47] z-10 flex-shrink-0">
              {/* Botão Menu Mobile */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10 h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 flex-shrink-0"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6" />
              </Button>
              
              <img 
                src={sofiaAvatar} 
                alt="Sofia"
                className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover border-2 border-white/20 flex-shrink-0"
              />
              <div className="leading-tight flex-1 min-w-0">
                <div className="font-medium text-white text-sm xs:text-base sm:text-lg md:text-xl truncate">Sofia</div>
                <div className="text-xs xs:text-sm sm:text-base text-emerald-400 truncate">• online</div>
              </div>
            </div>

            {/* Mensagens com wallpaper - área expansível */}
            <div className="flex-1 relative bg-[#0D1117] overflow-hidden min-h-0">
              <div className="absolute inset-0 opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMSIgZmlsbD0iIzMzMzMzMyIgZmlsbC1vcGFjaXR5PSIwLjMiLz4KPC9zdmc+')] [background-size:20px_20px]" />
              <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
                <div className="p-2 xs:p-3 sm:p-4 md:p-6 space-y-2 xs:space-y-3 sm:space-y-4 md:space-y-6 relative z-10">
                  {messages.map(message => {
                    const time = message.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                    const isUser = message.type === 'user';
                    return (
                      <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] xs:max-w-[85%] sm:max-w-[80%] md:max-w-[75%] lg:max-w-[70%] rounded-2xl ${
                          isUser 
                            ? 'bg-emerald-600 text-white rounded-br-md shadow-lg' 
                            : 'bg-[#21262D] border border-[#373E47] text-gray-100 rounded-bl-md shadow-md'
                        } px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-3 sm:py-4 md:py-4`}>
                          {message.imageUrl && (
                            <img src={message.imageUrl} alt="Imagem enviada" className="max-w-[140px] xs:max-w-[160px] sm:max-w-[200px] md:max-w-[240px] lg:max-w-[280px] h-auto rounded-xl mb-2 xs:mb-3 border border-gray-600 object-cover" />
                          )}
                          <div className="whitespace-pre-wrap text-xs xs:text-sm sm:text-base md:text-lg leading-relaxed break-words">{message.content}</div>
                          <div className={`mt-2 text-xs xs:text-sm text-right ${isUser ? 'text-emerald-100' : 'text-gray-400'}`}>
                            {time}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-[#21262D] border border-[#373E47] rounded-2xl rounded-bl-md px-2 xs:px-3 sm:px-4 md:px-6 py-2 xs:py-3 sm:py-4 md:py-4 shadow-md text-xs xs:text-sm sm:text-base md:text-lg flex items-center gap-2 xs:gap-3 text-gray-100">
                        <Loader2 className="w-3 h-3 xs:w-4 xs:h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 animate-spin text-emerald-400 flex-shrink-0" />
                        <span className="truncate">Sofia está digitando...</span>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>

            {/* Barra de entrada - estilo WhatsApp */}
            <Card className="border border-border/20 rounded-xl flex-shrink-0">
              <CardContent className="p-2 xs:p-3 sm:p-4 md:p-6">
                <div className="flex items-center gap-1 xs:gap-2 sm:gap-3">
                  {/* Botão de Voz */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-full flex-shrink-0 ${
                      voiceEnabled 
                        ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    } transition-all duration-200`}
                    onClick={toggleVoice}
                    title={voiceEnabled ? "Desativar voz" : "Ativar voz"}
                  >
                    {voiceEnabled ? <Volume2 className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" /> : <VolumeX className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />}
                  </Button>

                  <div className="relative flex-1 min-w-0">
                    <Input
                      placeholder={voiceEnabled ? "Digite ou use o microfone..." : "Digite sua mensagem..."}
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={isLoading}
                      className="pr-20 xs:pr-24 sm:pr-28 md:pr-32 rounded-full text-xs xs:text-sm sm:text-base md:text-lg h-8 xs:h-10 sm:h-12 md:h-14"
                    />
                    <div className="absolute right-1 xs:right-2 top-1/2 -translate-y-1/2 flex gap-1 xs:gap-2">
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex-shrink-0" onClick={handleCameraClick} disabled={isLoading} title="Câmera">
                        <Camera className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                      </Button>
                      <Button type="button" variant="ghost" size="icon" className="h-6 w-6 xs:h-8 xs:w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 flex-shrink-0" onClick={handleGalleryClick} disabled={isLoading} title="Galeria">
                        <Image className="h-3 w-3 xs:h-4 xs:w-4 sm:h-5 sm:w-5" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    onClick={inputMessage.trim() || selectedImage ? handleSendMessage : handleMicClick}
                    disabled={isLoading}
                    size="icon"
                    className={`rounded-full h-8 w-8 xs:h-10 xs:w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 flex-shrink-0 ${
                      isListening ? 'bg-red-500 text-white animate-pulse' : 
                      voiceEnabled ? 'bg-green-500 text-white' : 'bg-primary text-white'
                    }`}
                    title={
                      isLoading ? 'Processando...' :
                      inputMessage.trim() || selectedImage ? 'Enviar' : 
                      voiceEnabled ? 'Gravar áudio' : 'Ativar voz primeiro'
                    }
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 animate-spin" />
                    ) : inputMessage.trim() || selectedImage ? (
                      <Send className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    ) : isListening ? (
                      <Mic className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    ) : voiceEnabled ? (
                      <Mic className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    ) : (
                      <Mic className="h-4 w-4 xs:h-5 xs:w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'metas':
        return (
          <div className="space-y-4 p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Metas Nutricionais</h2>
            
            {/* Resumo Nutricional Diário */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground">Calorias</h3>
                    <Apple className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                    {getDailyNutrition(new Date().toISOString().split('T')[0]).totalCalories}
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">Meta: {goals.calories} kcal</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground">Proteínas</h3>
                    <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                    {getDailyNutrition(new Date().toISOString().split('T')[0]).totalProtein}g
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">Meta: {goals.protein}g</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground">Carboidratos</h3>
                    <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                    {getDailyNutrition(new Date().toISOString().split('T')[0]).totalCarbs}g
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">Meta: {goals.carbs}g</div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base sm:text-lg font-medium text-muted-foreground">Gorduras</h3>
                    <Target className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                    {getDailyNutrition(new Date().toISOString().split('T')[0]).totalFat}g
                  </div>
                  <div className="text-sm sm:text-base text-muted-foreground">Meta: {goals.fat}g</div>
                </CardContent>
              </Card>
            </div>

            {/* Rastreador de Nutrição Integrado */}
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30 shadow-lg">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-primary" />
                  Rastreador Nutricional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4">
                <NutritionTracker />
              </CardContent>
            </Card>
          </div>
        );

      case 'missao':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Missão do Dia</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30 shadow-lg">
              <CardHeader className="p-3 sm:p-4">
                <CardTitle className="text-sm sm:text-lg flex items-center gap-2">
                  <Flame className="w-5 h-5 text-primary" />
                  Missão do Dia
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <DailyMissionsFinal user={user} />
              </CardContent>
            </Card>
          </div>
        );

      case 'desafios':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Desafios e Conquistas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-purple-700 mb-2">Desafios Ativos</h3>
                  <p className="text-purple-600">Participe de desafios e ganhe pontos!</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <CardContent className="p-6 text-center">
                  <Zap className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-yellow-700 mb-2">Conquistas</h3>
                  <p className="text-yellow-600">Desbloqueie badges e conquistas!</p>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'historico':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Histórico de Conversas</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Histórico de conversas em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'analysis':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Análise Interativa</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Análise interativa em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'challenges':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Desafios</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Desafios em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'image-analysis':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Análise de Imagens</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <CameraIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Análise de imagens em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'nutrition':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Nutrição</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Seção de nutrição em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'tracking':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Acompanhamento</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Acompanhamento em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'goals':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Metas</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Metas em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'progress':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Progresso</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Progresso em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'education':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Educação</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Educação em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'achievements':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Conquistas</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <TrophyIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Conquistas em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'settings':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Configurações</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <Settings className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Configurações em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'profile':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Perfil</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Perfil em desenvolvimento...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Página não encontrada</h2>
            <Card className="bg-white/90 backdrop-blur-sm border border-border/30">
              <CardContent className="p-6">
                <div className="text-center text-gray-500">
                  <p>Esta seção ainda não está disponível.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-[#0D1117] min-h-0 overflow-hidden">
      {/* Sidebar Desktop */}
      <div className="hidden lg:flex w-64 bg-[#161B22] border-r border-[#30363D] flex-col flex-shrink-0">
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-[#30363D]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-base">Sofia</h2>
              <p className="text-xs text-gray-400">Assistente de Saúde</p>
            </div>
          </div>
        </div>

        {/* Navegação da Sidebar */}
        <nav className="flex-1 p-4 space-y-2">
          {/* Botão Dashboard */}
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 hover:bg-[#21262D] text-gray-300 hover:text-white h-12 text-base"
            onClick={handleDashboardClick}
          >
            <Home className="w-5 h-5 text-blue-500" />
            Dashboard
          </Button>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 h-12 text-base ${
                  isActive 
                    ? 'bg-[#21262D] text-white border border-[#30363D]' 
                    : 'hover:bg-[#21262D] text-gray-300 hover:text-white'
                }`}
                onClick={() => handleSectionChange(item.id as typeof currentSection)}
              >
                <Icon className={`w-5 h-5 ${item.color}`} />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Mobile Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar Mobile */}
      <div className={`fixed top-0 left-0 h-full w-72 xs:w-80 bg-[#161B22] border-r border-[#30363D] z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Header da Sidebar Mobile */}
        <div className="p-3 xs:p-4 border-b border-[#30363D] flex items-center justify-between">
          <div className="flex items-center gap-2 xs:gap-3">
            <div className="w-8 h-8 xs:w-10 xs:h-10 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4 xs:w-5 xs:h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white text-sm xs:text-base">Sofia</h2>
              <p className="text-xs text-gray-400">Assistente de Saúde</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-[#21262D] h-8 w-8 xs:h-10 xs:w-10"
            onClick={() => setIsMobileSidebarOpen(false)}
          >
            <X className="w-4 h-4 xs:w-5 xs:h-5" />
          </Button>
        </div>

        {/* Navegação da Sidebar Mobile */}
        <ScrollArea className="flex-1 p-3 xs:p-4">
          <nav className="space-y-2">
            {/* Botão Dashboard */}
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 xs:gap-3 hover:bg-[#21262D] text-gray-300 hover:text-white h-10 xs:h-12 text-sm xs:text-base"
              onClick={handleDashboardClick}
            >
              <Home className="w-4 h-4 xs:w-5 xs:h-5 text-blue-500" />
              Dashboard
            </Button>
            
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-2 xs:gap-3 h-10 xs:h-12 text-sm xs:text-base ${
                    isActive 
                      ? 'bg-[#21262D] text-white border border-[#30363D]' 
                      : 'hover:bg-[#21262D] text-gray-300 hover:text-white'
                  }`}
                  onClick={() => handleSectionChange(item.id as typeof currentSection)}
                >
                  <Icon className={`w-4 h-4 xs:w-5 xs:h-5 ${item.color}`} />
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </ScrollArea>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col bg-[#0D1117] min-w-0 min-h-0">
        {renderContent()}
      </div>

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

      {/* Modal de confirmação obrigatório */}
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

export default SofiaChat;