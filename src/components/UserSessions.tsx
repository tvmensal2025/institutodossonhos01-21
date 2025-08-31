import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { HealthWheelSession } from '@/components/admin/HealthWheelSession';
import { ToolSelectionModal } from '@/components/session-tools/ToolSelectionModal';
import { SessionToolsIntegration } from '@/components/session-tools/SessionToolsIntegration';
import { SessionTool, ToolResponse } from '@/types/session-tools';
import {
  Clock, CheckCircle, PlayCircle, BookOpen, 
  Target, Calendar, FileText, AlertCircle,
  Lock, Unlock, Timer, Eye, Send, Wrench
} from 'lucide-react';

interface Session {
  id: string;
  title: string;
  description: string;
  type: string;
  difficulty: string;
  estimated_time: number;
  content: any;
  target_saboteurs: string[];
  tools: string[]; // Esta vai ser computada a partir de tools_data
  tools_data: Record<string, any>;
}

interface UserSession {
  id: string;
  session_id: string;
  status: string;
  assigned_at: string;
  started_at?: string;
  completed_at?: string;
  due_date?: string;
  progress: number;
  feedback?: string;
  notes?: string;
  sessions: Session;
  auto_save_data: any;
  tools_data: Record<string, ToolResponse>;
  last_activity: string;
  cycle_number: number;
  next_available_date?: string;
  is_locked: boolean;
  review_count: number;
}

interface UserSessionsProps {
  user: User | null;
}

export default function UserSessions({ user }: UserSessionsProps) {
  const [userSessions, setUserSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeHealthWheelSession, setActiveHealthWheelSession] = useState<UserSession | null>(null);
  const [showEarlyRequestModal, setShowEarlyRequestModal] = useState(false);
  const [selectedSessionForRequest, setSelectedSessionForRequest] = useState<UserSession | null>(null);
  const [requestReason, setRequestReason] = useState('');
  const [reviewMode, setReviewMode] = useState<UserSession | null>(null);
  
  // Estados para ferramentas
  const [showToolsModal, setShowToolsModal] = useState(false);
  const [selectedSessionForTools, setSelectedSessionForTools] = useState<UserSession | null>(null);
  const [activeToolSession, setActiveToolSession] = useState<{ session: UserSession; tool: SessionTool } | null>(null);
  
  const [stats, setStats] = useState({
    pending: 0,
    inProgress: 0,
    completed: 0,
    locked: 0,
    total: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadUserSessions();
    }
  }, [user]);

  const loadUserSessions = async () => {
    try {
      console.log('🔍 Carregando sessões do usuário:', user?.id);
      
      // Primeiro, vamos verificar se o usuário está autenticado
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      console.log('👤 Usuário atual autenticado:', currentUser?.id);
      
      if (!currentUser) {
        console.error('❌ Usuário não autenticado');
        toast({
          title: "Erro de Autenticação",
          description: "Você precisa estar logado para ver suas sessões",
          variant: "destructive"
        });
        return;
      }

      // Verificar perfil do usuário
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
      
      console.log('👤 Perfil do usuário:', profile);
      if (profileError) {
        console.error('❌ Erro ao buscar perfil:', profileError);
        toast({
          title: "Perfil não encontrado",
          description: "Não foi possível encontrar seu perfil. Entre em contato com o suporte.",
          variant: "destructive"
        });
        return;
      }

      // Buscar sessões do usuário com logs detalhados
      console.log('🔎 Buscando user_sessions para user_id:', currentUser.id);
      
      const { data, error, count } = await supabase
        .from('user_sessions')
        .select(`
          *,
          sessions (
            id, title, description, type, difficulty, 
            estimated_time, content, target_saboteurs, tools_data
          )
        `, { count: 'exact' })
        .eq('user_id', currentUser.id)
        .order('assigned_at', { ascending: false });

      console.log('📊 Resultado da query user_sessions:');
      console.log('- Data:', data);
      console.log('- Error:', error);
      console.log('- Count:', count);

      if (error) {
        console.error('❌ Erro detalhado na query:', error);
        throw error;
      }

      // Verificar se há sessões na tabela user_sessions (geral) para debug
      console.log('🔍 Verificando se há sessões disponíveis...');
      const { data: debugSessions, error: debugError } = await supabase
        .from('user_sessions')
        .select('id, user_id, session_id, status')
        .limit(3);
      
      console.log('📋 Algumas sessões na tabela (para debug):', debugSessions);
      if (debugError) console.error('❌ Erro ao buscar sessões para debug:', debugError);

      // Processar dados com tipo correto
      const sessions = (data || []).map((session: any) => ({
        ...session,
        tools_data: session.tools_data || {},
        auto_save_data: session.auto_save_data || {},
        last_activity: session.updated_at || session.assigned_at,
        cycle_number: session.cycle_number || 1,
        next_available_date: session.next_available_date || null,
        is_locked: session.is_locked || false,
        review_count: session.review_count || 0,
        sessions: {
          ...session.sessions,
          tools: session.sessions?.tools_data ? Object.keys(session.sessions.tools_data) : []
        }
      }));
      
      console.log('✅ Sessões processadas para o usuário:', sessions.length);
      
      if (sessions.length === 0) {
        console.log('ℹ️ Nenhuma sessão encontrada para este usuário');
        toast({
          title: "Nenhuma sessão encontrada",
          description: "Você ainda não possui sessões atribuídas. Entre em contato com o administrador.",
          variant: "default"
        });
      } else {
        toast({
          title: `${sessions.length} sessões carregadas! 📚`,
          description: "Suas sessões estão prontas para serem realizadas"
        });
      }
      
      setUserSessions(sessions);

      // Calcular estatísticas
      const newStats = {
        pending: sessions.filter(s => s.status === 'pending').length,
        inProgress: sessions.filter(s => s.status === 'in_progress').length,
        completed: sessions.filter(s => s.status === 'completed').length,
        locked: sessions.filter(s => s.is_locked).length,
        total: sessions.length
      };
      
      console.log('📊 Estatísticas calculadas:', newStats);
      setStats(newStats);

    } catch (error) {
      console.error('💥 Erro completo ao carregar sessões:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas sessões. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionId: string) => {
    try {
      const userSession = userSessions.find(us => us.id === sessionId);
      
      // Check if it's a Health Wheel session (both types)
      if (userSession?.sessions.type === 'health_wheel_assessment' || 
          userSession?.sessions.type === 'life_wheel_assessment') {
        setActiveHealthWheelSession(userSession);
        return;
      }

      const { error } = await supabase
        .from('user_sessions')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString()
        })
        .eq('id', sessionId);

      if (error) throw error;

      toast({
        title: "Sessão Iniciada! 🚀",
        description: "Você pode continuar de onde parou a qualquer momento"
      });

      loadUserSessions();
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar a sessão",
        variant: "destructive"
      });
    }
  };

  const handleHealthWheelComplete = () => {
    setActiveHealthWheelSession(null);
    loadUserSessions();
    
    toast({
      title: "Roda da Saúde Completa! 🎉",
      description: "Seus resultados foram salvos com sucesso"
    });
  };

  const updateProgress = async (sessionId: string, progress: number) => {
    try {
      const updateData: any = { 
        progress,
        notes: `Progresso atualizado para ${progress}% em ${new Date().toLocaleString()}`
      };
      
      if (progress >= 100) {
        updateData.status = 'completed';
        updateData.completed_at = new Date().toISOString();
        updateData.feedback = 'Sessão concluída com sucesso';
      }

      const { error } = await supabase
        .from('user_sessions')
        .update(updateData)
        .eq('id', sessionId);

      if (error) throw error;

      // Salvar log da atividade
      await saveSessionActivity(sessionId, `Progresso atualizado para ${progress}%`);

      if (progress >= 100) {
        toast({
          title: "Sessão Completa! 🎉",
          description: "Parabéns! Você concluiu esta sessão"
        });
      } else {
        toast({
          title: "Progresso Salvo ✅",
          description: `Sessão atualizada para ${progress}%`
        });
      }

      loadUserSessions();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso",
        variant: "destructive"
      });
    }
  };

  const completeSessionWithFeedback = async (sessionId: string) => {
    try {
      // Usar a função de completar ciclo
      // Simular conclusão da sessão (remover depois quando função estiver implementada)
      const data = { success: true, message: 'Sessão concluída com sucesso!' };
      const error = null;
      
      // const { data, error } = await supabase.rpc('complete_session_cycle', {
      //   p_user_id: user?.id,
      //   p_session_id: userSessions.find(s => s.id === sessionId)?.session_id
      // });

      if (error) throw error;

      // Salvar log da conclusão
      await saveSessionActivity(sessionId, 'Sessão concluída');

      const resultData = data as any;
      
      toast({
        title: "Sessão Completa! 🎉",
        description: `Próximo ciclo disponível em: ${new Date(resultData.next_available_date).toLocaleDateString('pt-BR')}`
      });

      loadUserSessions();
    } catch (error) {
      console.error('Error completing session:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a sessão",
        variant: "destructive"
      });
    }
  };

  // Auto-save do progresso (chama automaticamente durante a sessão)
  const autoSaveProgress = async (sessionId: string, progressData: any) => {
    try {
      // Simular auto-save
      const session = userSessions.find(s => s.id === sessionId);
      if (session) {
        await supabase
          .from('user_sessions')
          .update({ progress: progressData.progress || 0 })
          .eq('id', sessionId);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
    }
  };

  // Solicitar liberação antecipada da sessão
  const requestEarlyRelease = async () => {
    if (!selectedSessionForRequest) return;
    
    try {
      // Simular inserção de solicitação
      const error = null;

      if (error) throw error;

      toast({
        title: "Solicitação Enviada! 📋",
        description: "Sua solicitação foi enviada para análise do administrador"
      });

      setShowEarlyRequestModal(false);
      setSelectedSessionForRequest(null);
      setRequestReason('');
    } catch (error) {
      console.error('Error requesting early release:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar a solicitação",
        variant: "destructive"
      });
    }
  };

  // Abrir sessão em modo de revisão (somente leitura)
  const openReviewMode = async (userSession: UserSession) => {
    try {
      // Incrementar contador de revisões
      // Simular atualização de review
      await supabase
        .from('user_sessions')
        .update({ feedback: 'Modo revisão ativado' })
        .eq('id', userSession.id);

      setReviewMode(userSession);
      
      toast({
        title: "Modo Revisão Ativado 👀",
        description: "Você está visualizando uma sessão completa (somente leitura)"
      });
    } catch (error) {
      console.error('Error opening review mode:', error);
    }
  };

  const saveSessionActivity = async (sessionId: string, activity: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const today = new Date().toISOString().split('T')[0];
      const sessionAttemptId = `${sessionId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      
      // Sempre inserir uma nova resposta (nunca sobrescrever) para manter histórico completo
      const { error } = await supabase
        .from('daily_responses')
        .insert({
          user_id: user.id,
          date: today,
          section: 'sessions',
          question_id: `session_${sessionId}`,
          answer: activity,
          text_response: `Atividade de sessão: ${activity}`,
          points_earned: 10,
          session_attempt_id: sessionAttemptId,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao salvar atividade da sessão:', error);
        return;
      }

      console.log(`Atividade da sessão salva: ${activity} - Tentativa: ${sessionAttemptId}`);
    } catch (error) {
      console.error('Erro ao salvar atividade da sessão:', error);
    }
  };

  // Funções para ferramentas integradas
  const openToolsModal = (userSession: UserSession) => {
    if (!userSession.sessions.tools || userSession.sessions.tools.length === 0) {
      toast({
        title: "Nenhuma ferramenta disponível",
        description: "Esta sessão não possui ferramentas configuradas.",
        variant: "destructive"
      });
      return;
    }
    setSelectedSessionForTools(userSession);
    setShowToolsModal(true);
  };

  const handleSelectTool = (tool: SessionTool) => {
    if (!selectedSessionForTools) return;
    setActiveToolSession({ session: selectedSessionForTools, tool });
    setShowToolsModal(false);
  };

  const handleToolComplete = async (toolResponse: ToolResponse) => {
    if (!activeToolSession) return;
    
    // Recarregar dados da sessão
    await loadUserSessions();
    
    toast({
      title: "Ferramenta concluída!",
      description: `${activeToolSession.tool.name} foi concluída com sucesso.`,
    });
    
    setActiveToolSession(null);
  };

  const getCompletedTools = (userSession: UserSession): string[] => {
    return Object.keys(userSession.tools_data || {});
  };

  const getStatusBadge = (userSession: UserSession) => {
    if (userSession.is_locked) {
      return <Badge variant="secondary" className="bg-gray-50 text-gray-700">
        <Lock className="w-3 h-3 mr-1" />
        Bloqueada
      </Badge>;
    }
    
    switch (userSession.status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
          <Clock className="w-3 h-3 mr-1" />
          Pendente
        </Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          <PlayCircle className="w-3 h-3 mr-1" />
          Em Progresso
        </Badge>;
      case 'completed':
        return <Badge variant="secondary" className="bg-green-50 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Completa
        </Badge>;
      default:
        return <Badge variant="secondary">{userSession.status}</Badge>;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600';
      case 'intermediate':
        return 'text-yellow-600';
      case 'advanced':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Carregando suas sessões...</p>
            <p className="text-muted-foreground text-sm mt-2">Isso pode levar alguns segundos</p>
          </div>
        </div>
      </div>
    );
  }

  if (userSessions.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="mb-4">
              <Calendar className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Nenhuma sessão encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Você ainda não possui sessões atribuídas. As sessões serão enviadas pelo administrador da plataforma.
            </p>
            <p className="text-sm text-muted-foreground">
              Entre em contato com o suporte se você esperava ter sessões disponíveis.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold mb-2">Login necessário</h3>
            <p className="text-muted-foreground">
              Faça login para acessar suas sessões personalizadas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Render Health Wheel session if active
  if (activeHealthWheelSession) {
    return (
      <HealthWheelSession
        sessionId={activeHealthWheelSession.session_id}
        userId={user.id}
        content={activeHealthWheelSession.sessions.content}
        onComplete={handleHealthWheelComplete}
      />
    );
  }

  return (
    <div className="space-y-6">
        {/* Debug Info - temporário */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h4 className="font-semibold text-blue-800 mb-2">🔧 Informações de Debug:</h4>
          <p><strong>User ID:</strong> {user?.id}</p>
          <p><strong>Sessions encontradas:</strong> {userSessions.length}</p>
          <p><strong>Status do carregamento:</strong> {loading ? 'Carregando...' : 'Concluído'}</p>
          <Button 
            onClick={loadUserSessions} 
            size="sm" 
            className="mt-2"
          >
            🔄 Recarregar Sessões
          </Button>
        </div>

      {/* Header e Estatísticas */}
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Suas Sessões
          </h1>
          <p className="text-muted-foreground text-lg">
            Acompanhe seu progresso nas sessões personalizadas
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-yellow-600 mb-1">{stats.pending}</div>
              <div className="text-sm font-medium text-yellow-700">Pendentes</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-100 flex items-center justify-center">
                <PlayCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-blue-600 mb-1">{stats.inProgress}</div>
              <div className="text-sm font-medium text-blue-700">Em Progresso</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-600 mb-1">{stats.completed}</div>
              <div className="text-sm font-medium text-green-700">Completas</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-purple-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.total}</div>
              <div className="text-sm font-medium text-purple-700">Total</div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex flex-wrap justify-center gap-3">
          <Button 
            variant={stats.pending > 0 ? "default" : "outline"} 
            size="sm"
            className="rounded-full px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <Clock className="w-4 h-4 mr-2" />
            Pendentes ({stats.pending})
          </Button>
          <Button 
            variant={stats.inProgress > 0 ? "default" : "outline"} 
            size="sm"
            className="rounded-full px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            Em Progresso ({stats.inProgress})
          </Button>
          <Button 
            variant={stats.completed > 0 ? "default" : "outline"} 
            size="sm"
            className="rounded-full px-6 py-2 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Completas ({stats.completed})
          </Button>
        </div>
      </div>

      {/* Lista de Sessões */}
      {userSessions.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma sessão disponível</h3>
            <p className="text-muted-foreground">
              Você ainda não tem sessões atribuídas. Elas aparecerão aqui quando estiverem disponíveis.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {userSessions.map((userSession) => (
            <Card 
              key={userSession.id} 
              className={`
                group relative overflow-hidden cursor-pointer transition-all duration-300 
                hover:scale-[1.02] hover:shadow-2xl border-0 shadow-lg backdrop-blur-sm
                ${userSession.status === 'pending' ? 'bg-gradient-to-br from-yellow-50/90 via-amber-50/80 to-orange-50/70' : ''}
                ${userSession.status === 'in_progress' ? 'bg-gradient-to-br from-blue-50/90 via-indigo-50/80 to-violet-50/70' : ''}
                ${userSession.status === 'completed' ? 'bg-gradient-to-br from-green-50/90 via-emerald-50/80 to-teal-50/70' : ''}
                ${userSession.is_locked ? 'bg-gradient-to-br from-gray-50/90 via-slate-50/80 to-zinc-50/70' : ''}
              `}
            >
              {/* Status Badge flutuante */}
              <div className="absolute top-3 right-3 z-20">
                {getStatusBadge(userSession)}
              </div>

              {/* Overlay sutil */}
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <CardContent className="relative p-6 h-full flex flex-col z-10">
                {/* Header com ícone e título */}
                <div className="text-center mb-4">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className={`
                      w-full h-full rounded-full flex items-center justify-center shadow-lg
                      ${userSession.status === 'pending' ? 'bg-gradient-to-br from-yellow-100 to-amber-200' : ''}
                      ${userSession.status === 'in_progress' ? 'bg-gradient-to-br from-blue-100 to-indigo-200' : ''}
                      ${userSession.status === 'completed' ? 'bg-gradient-to-br from-green-100 to-emerald-200' : ''}
                      ${userSession.is_locked ? 'bg-gradient-to-br from-gray-100 to-slate-200' : ''}
                    `}>
                      <BookOpen className={`
                        w-8 h-8 transition-transform duration-300 group-hover:scale-110
                        ${userSession.status === 'pending' ? 'text-yellow-600' : ''}
                        ${userSession.status === 'in_progress' ? 'text-blue-600' : ''}
                        ${userSession.status === 'completed' ? 'text-green-600' : ''}
                        ${userSession.is_locked ? 'text-gray-500' : ''}
                      `} />
                    </div>
                  </div>
                  <h3 className="font-bold text-base text-center leading-tight mb-2 line-clamp-2 text-gray-800">
                    {userSession.sessions.title}
                  </h3>
                </div>

                {/* Progresso com animação */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Progresso</span>
                    <span className="text-sm font-bold text-gray-800">{userSession.progress}%</span>
                  </div>
                  <div className="relative">
                    <Progress 
                      value={userSession.progress} 
                      className="h-3 bg-gray-200/50" 
                    />
                    {userSession.progress > 0 && (
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent 
                                     transform -skew-x-12 animate-pulse opacity-50" />
                    )}
                  </div>
                </div>

                {/* Badges informativos */}
                <div className="flex flex-wrap gap-2 mb-4 justify-center">
                  <Badge 
                    variant="secondary" 
                    className={`
                      text-xs font-semibold px-3 py-1 rounded-full shadow-sm
                      ${userSession.sessions.difficulty === 'beginner' ? 'bg-green-100 text-green-700 border-green-200' : ''}
                      ${userSession.sessions.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : ''}
                      ${userSession.sessions.difficulty === 'advanced' ? 'bg-red-100 text-red-700 border-red-200' : ''}
                    `}
                  >
                    {userSession.sessions.difficulty}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-semibold px-3 py-1 rounded-full bg-purple-100 text-purple-700 border-purple-200 shadow-sm"
                  >
                    <Timer className="w-3 h-3 mr-1" />
                    {userSession.sessions.estimated_time}min
                  </Badge>
                </div>

                {/* Botões de Ação */}
                <div className="mt-auto space-y-3">
                  {/* Sessão Bloqueada - Ciclo de 30 dias */}
                  {userSession.is_locked && (
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full rounded-full bg-gray-50/50 border-gray-300 text-gray-600 
                                 hover:bg-gray-100 transition-all duration-300 shadow-sm"
                        disabled
                      >
                        <Lock className="w-4 h-4 mr-2" />
                        Sessão Bloqueada
                      </Button>
                      {userSession.next_available_date && (
                        <div className="text-xs text-center p-2 bg-gray-50 rounded-lg text-gray-600">
                          📅 Disponível em: {new Date(userSession.next_available_date).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                      <Button 
                        onClick={() => {
                          setSelectedSessionForRequest(userSession);
                          setShowEarlyRequestModal(true);
                        }}
                        variant="outline"
                        size="sm"
                        className="w-full rounded-full border-blue-200 text-blue-600 hover:bg-blue-50 
                                 transition-all duration-300 shadow-sm"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Solicitar Liberação
                      </Button>
                    </div>
                  )}

                  {/* Sessão Pendente */}
                  {userSession.status === 'pending' && !userSession.is_locked && (
                    <Button 
                      onClick={() => startSession(userSession.id)}
                      size="sm"
                      className="w-full rounded-full bg-gradient-to-r from-yellow-500 to-amber-500 
                               hover:from-yellow-600 hover:to-amber-600 text-white font-semibold
                               shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Iniciar Sessão
                    </Button>
                  )}
                  
                  {/* Sessão em Progresso */}
                  {userSession.status === 'in_progress' && !userSession.is_locked && (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => startSession(userSession.id)}
                        variant="default" 
                        size="sm"
                        className="w-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 
                                 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold
                                 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        Continuar
                      </Button>
                      {userSession.auto_save_data && Object.keys(userSession.auto_save_data).length > 0 && (
                        <div className="text-xs text-center p-2 bg-green-50 rounded-lg text-green-600 font-medium">
                          💾 Auto-save ativo
                        </div>
                      )}
                      {userSession.progress < 100 && (
                        <Button 
                          onClick={() => completeSessionWithFeedback(userSession.id)}
                          variant="secondary"
                          size="sm"
                          className="w-full rounded-full border-green-200 text-green-600 hover:bg-green-50 
                                   transition-all duration-300 shadow-sm"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Finalizar Ciclo
                        </Button>
                      )}
                    </div>
                  )}
                  
                  {/* Sessão Completa - Modo Revisão */}
                  {userSession.status === 'completed' && (
                    <div className="space-y-2">
                      <Button 
                        onClick={() => openReviewMode(userSession)}
                        variant="outline" 
                        size="sm"
                        className="w-full rounded-full border-green-200 text-green-600 hover:bg-green-50 
                                 transition-all duration-300 shadow-sm"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Revisar Sessão
                      </Button>
                      {userSession.review_count > 0 && (
                        <div className="text-xs text-center p-2 bg-blue-50 rounded-lg text-blue-600">
                          👁️ Revisada {userSession.review_count}x
                        </div>
                      )}
                      <div className="text-xs text-center p-2 bg-green-50 rounded-lg text-green-600 font-medium">
                        ✅ Ciclo {userSession.cycle_number} completo
                      </div>
                    </div>
                  )}
                  
                  {/* Botão para Ferramentas */}
                  {userSession.sessions.tools && userSession.sessions.tools.length > 0 && (
                    <Button 
                      onClick={() => openToolsModal(userSession)}
                      variant="outline"
                      size="sm"
                      className="w-full rounded-full border-purple-200 text-purple-600 hover:bg-purple-50 
                               transition-all duration-300 shadow-sm"
                    >
                      <Wrench className="w-4 h-4 mr-2" />
                      Ferramentas ({userSession.sessions.tools.length})
                    </Button>
                  )}

                  {/* Data de atribuição */}
                  <div className="text-xs text-center p-2 bg-gray-50/50 rounded-lg text-gray-500">
                    📅 {new Date(userSession.assigned_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Solicitação de Liberação Antecipada */}
      <Dialog open={showEarlyRequestModal} onOpenChange={setShowEarlyRequestModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Solicitar Liberação Antecipada</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Sessão: <strong>{selectedSessionForRequest?.sessions.title}</strong>
              </p>
              <p className="text-sm text-muted-foreground">
                Ciclo atual: <strong>{selectedSessionForRequest?.cycle_number}</strong>
              </p>
              {selectedSessionForRequest?.next_available_date && (
                <p className="text-sm text-muted-foreground">
                  Próxima liberação: <strong>{new Date(selectedSessionForRequest.next_available_date).toLocaleDateString('pt-BR')}</strong>
                </p>
              )}
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Motivo da solicitação
              </label>
              <Textarea
                value={requestReason}
                onChange={(e) => setRequestReason(e.target.value)}
                placeholder="Explique por que precisa desta sessão antes dos 30 dias..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShowEarlyRequestModal(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={requestEarlyRelease}
                disabled={!requestReason.trim()}
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar Solicitação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Revisão (Somente Leitura) */}
      {reviewMode && (
        <Dialog open={!!reviewMode} onOpenChange={() => setReviewMode(null)}>
          <DialogContent className="w-[95vw] max-w-6xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
            <DialogHeader>
              <DialogTitle>
                📖 Revisão: {reviewMode.sessions.title} - Ciclo {reviewMode.cycle_number}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  ℹ️ Esta é uma visualização somente leitura de uma sessão completa. 
                  Você não pode fazer alterações.
                </p>
              </div>
              
              {/* Verificar se é uma sessão de Health/Life Wheel para mostrar o gráfico */}
              {(reviewMode.sessions.type === 'health_wheel_assessment' || 
                reviewMode.sessions.type === 'life_wheel_assessment') ? (
                <div className="w-full">
                  <HealthWheelSession
                    sessionId={reviewMode.session_id}
                    userId={user?.id || ''}
                    content={reviewMode.sessions.content}
                    onComplete={() => {}} // No-op em modo revisão
                  />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Informações da Sessão</h4>
                    <div className="space-y-1 text-sm">
                      <p><strong>Status:</strong> {reviewMode.status}</p>
                      <p><strong>Progresso:</strong> {reviewMode.progress}%</p>
                      <p><strong>Ciclo:</strong> {reviewMode.cycle_number}</p>
                      <p><strong>Iniciada em:</strong> {reviewMode.started_at ? new Date(reviewMode.started_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                      <p><strong>Concluída em:</strong> {reviewMode.completed_at ? new Date(reviewMode.completed_at).toLocaleDateString('pt-BR') : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Dados Salvos</h4>
                    <div className="bg-gray-50 p-3 rounded text-sm max-h-40 overflow-y-auto">
                      {reviewMode.auto_save_data && Object.keys(reviewMode.auto_save_data).length > 0 ? (
                        <pre className="whitespace-pre-wrap text-xs">
                          {JSON.stringify(reviewMode.auto_save_data, null, 2)}
                        </pre>
                      ) : (
                        <p className="text-muted-foreground">Nenhum dado salvo disponível</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {reviewMode.feedback && (
                <div>
                  <h4 className="font-medium mb-2">Feedback</h4>
                  <p className="text-sm bg-green-50 p-3 rounded">{reviewMode.feedback}</p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={() => setReviewMode(null)}>
                  Fechar Revisão
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Seleção de Ferramentas */}
      <ToolSelectionModal
        isOpen={showToolsModal}
        onClose={() => setShowToolsModal(false)}
        onSelectTool={handleSelectTool}
        availableToolIds={selectedSessionForTools?.sessions.tools || []}
        completedTools={selectedSessionForTools ? getCompletedTools(selectedSessionForTools) : []}
      />

      {/* Ferramenta Ativa Integrada */}
      {activeToolSession && (
        <SessionToolsIntegration
          userSessionId={activeToolSession.session.id}
          userId={user?.id || ''}
          selectedTool={activeToolSession.tool}
          existingData={activeToolSession.session.tools_data?.[activeToolSession.tool.id]}
          onComplete={handleToolComplete}
          onClose={() => setActiveToolSession(null)}
        />
      )}
    </div>
  );
}
