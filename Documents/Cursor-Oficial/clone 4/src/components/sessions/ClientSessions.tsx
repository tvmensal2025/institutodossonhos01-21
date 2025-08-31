import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  PlayCircle, 
  FileText, 
  Image, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Loader, 
  Video, 
  Calendar, 
  Star, 
  Heart, 
  Play, 
  Send, 
  Lightbulb,
  ArrowLeft,
  ArrowRight,
  Music,
  File,
  Loader2,
  X
} from 'lucide-react';
import { SessionTools } from './SessionTools';

interface SessionMaterial {
  id: string;
  type: 'video' | 'image' | 'audio' | 'pdf' | 'text';
  title: string;
  content?: string;
  url?: string;
  order_index: number;
}

interface SessionResponse {
  id?: string;
  session_id: string;
  response: string;
  private_comments: string;
  completed: boolean;
  favorite: boolean;
  rating?: number;
  feedback?: string;
  completed_at?: string;
  started_at?: string;
}

interface ClientSession {
  id: string;
  title: string;
  description: string;
  video_url?: string;
  instructions: string;
  category: string;
  created_at: string;
  materials: SessionMaterial[];
  response?: SessionResponse;
}

export const ClientSessions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<ClientSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ClientSession | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentResponse, setCurrentResponse] = useState('');
  const [currentComments, setCurrentComments] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [feedback, setFeedback] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserSessions();
    }
  }, [user]);

  const loadUserSessions = async () => {
    try {
      setIsLoading(true);
      // Buscar sessões enviadas para o usuário
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*, session_materials(*)')
        .eq('assigned_to', user?.id)
        .order('created_at', { ascending: false });
      if (sessionsError) throw sessionsError;

      // Buscar respostas do usuário
      const { data: responsesData, error: responsesError } = await supabase
        .from('session_responses')
        .select('*')
        .eq('user_id', user?.id);
      if (responsesError) throw responsesError;

      // Combinar sessões com respostas
      const sessionsWithResponses = (sessionsData || []).map((session: any) => {
        const response = (responsesData || []).find((r: any) => r.session_id === session.id);
        return {
          ...session,
          materials: session.session_materials || [],
          response
        };
      });
      setSessions(sessionsWithResponses);
    } catch (error) {
      console.error('Erro ao carregar sessões:', error);
      toast({
        title: 'Erro ao carregar sessões',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = async (session: ClientSession) => {
    setSelectedSession(session);
    setCurrentStep(0);
    setCurrentResponse(session.response?.response || '');
    setCurrentComments(session.response?.private_comments || '');
    setRating(session.response?.rating || 0);
    setFeedback(session.response?.feedback || '');
    if (!session.response?.started_at) {
      await saveSessionProgress(session.id, 0, false);
    }
  };

  const saveSessionProgress = async (
    sessionId: string, 
    progress: number, 
    completed: boolean = false
  ) => {
    try {
      setIsSaving(true);
      const responseData = {
        session_id: sessionId,
        user_id: user?.id,
          response: currentResponse,
        private_comments: currentComments,
        completed,
        started_at: completed ? undefined : new Date().toISOString(),
        completed_at: completed ? new Date().toISOString() : undefined,
        rating: completed ? rating : undefined,
        feedback: completed ? feedback : undefined
      };
      await supabase
        .from('session_responses')
        .upsert(responseData, { onConflict: 'session_id,user_id' });
      // Atualizar estado local
      setSessions(prev => prev.map(s => 
        s.id === sessionId 
          ? { 
              ...s, 
              response: { 
                ...s.response, 
                ...responseData,
                completed_at: responseData.completed_at,
                started_at: responseData.started_at
              } 
            }
          : s
      ));
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
      toast({
        title: 'Erro ao salvar progresso',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNextStep = async () => {
    if (!selectedSession) return;
    if (currentStep < getTotalSteps() - 1) {
      setCurrentStep(prev => prev + 1);
      await saveSessionProgress(selectedSession.id, (currentStep + 1) / getTotalSteps() * 100);
    } else {
      await handleCompleteSession();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleCompleteSession = async () => {
    if (!selectedSession) return;
    try {
      setIsSaving(true);
      await saveSessionProgress(selectedSession.id, 100, true);
      toast({
        title: 'Sessão concluída!',
        description: 'Parabéns por completar esta sessão.',
      });
      setSelectedSession(null);
      setCurrentStep(0);
    } catch (error) {
      console.error('Erro ao completar sessão:', error);
      toast({
        title: 'Erro ao completar sessão',
        description: 'Tente novamente',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getTotalSteps = () => {
    if (!selectedSession) return 0;
    let steps = 1; // Introdução
    if (selectedSession.video_url) steps++;
    if (selectedSession.materials?.length) steps += selectedSession.materials.length;
    steps += 1; // Instruções
    steps += 1; // Resposta
    steps += 1; // Avaliação
    return steps;
  };

  const renderCurrentStep = () => {
    if (!selectedSession) return null;

    const steps = [
      { name: 'Introdução', component: 'intro' },
      ...(selectedSession.video_url ? [{ name: 'Vídeo', component: 'video' }] : []),
      ...(selectedSession.materials?.map((material, index) => ({
        name: material.title,
        component: 'material',
        materialIndex: index
      })) || []),
      { name: 'Instruções', component: 'instructions' },
      { name: 'Sua Resposta', component: 'response' },
      { name: 'Avaliação', component: 'rating' }
    ];

    const currentStepData = steps[currentStep];
    if (!currentStepData) return null;

    switch (currentStepData.component) {
      case 'intro':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-netflix-text mb-4">
                {selectedSession.title}
              </h3>
              <p className="text-netflix-text-muted text-lg">
                {selectedSession.description}
              </p>
            </div>
            
            <Card className="bg-netflix-gray/20 border-netflix-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-instituto-purple" />
                  <h4 className="text-lg font-semibold text-netflix-text">Sobre esta sessão</h4>
                </div>
                <div className="space-y-3 text-sm text-netflix-text-muted">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{selectedSession.category}</Badge>
                    <span>•</span>
                    <span>Duração estimada: 30 min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>•</span>
                    <span>Materiais: {selectedSession.materials?.length || 0} itens</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'video':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-netflix-text mb-4">
                Vídeo da Sessão
              </h3>
            </div>
            
            <Card className="bg-netflix-gray/20 border-netflix-border">
              <CardContent className="p-6">
                <div className="aspect-video bg-netflix-dark rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-12 w-12 text-instituto-orange mx-auto mb-4" />
                    <p className="text-netflix-text-muted mb-4">
                      Clique no link abaixo para assistir ao vídeo:
                    </p>
                    <Button 
                      variant="outline" 
                      asChild
                      className="border-instituto-orange text-instituto-orange hover:bg-instituto-orange hover:text-white"
                    >
                      <a href={selectedSession.video_url} target="_blank" rel="noopener noreferrer">
                        <Play className="h-4 w-4 mr-2" />
                        Assistir Vídeo
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'material':
        const material = selectedSession.materials[(currentStepData as any).materialIndex];
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-netflix-text mb-4">
                {material.title}
              </h3>
            </div>
            
            <Card className="bg-netflix-gray/20 border-netflix-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {material.type === 'video' && <Video className="h-5 w-5 text-instituto-orange" />}
                  {material.type === 'image' && <Image className="h-5 w-5 text-instituto-purple" />}
                  {material.type === 'audio' && <Music className="h-5 w-5 text-instituto-green" />}
                  {material.type === 'pdf' && <FileText className="h-5 w-5 text-instituto-blue" />}
                  {material.type === 'text' && <File className="h-5 w-5 text-netflix-text-muted" />}
                  <span className="font-medium text-netflix-text">{material.title}</span>
                </div>
                
                {material.type === 'text' && material.content && (
                  <div className="prose prose-invert max-w-none">
                    <p className="text-netflix-text-muted whitespace-pre-wrap">
                      {material.content}
                    </p>
                  </div>
                )}
                
                {material.url && (
                  <Button 
                    variant="outline" 
                    asChild
                    className="mt-4"
                  >
                    <a href={material.url} target="_blank" rel="noopener noreferrer">
                      Abrir {material.type}
                    </a>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 'instructions':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-netflix-text mb-4">
                Instruções
              </h3>
            </div>
            
            <Card className="bg-netflix-gray/20 border-netflix-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileText className="h-6 w-6 text-instituto-purple" />
                  <h4 className="text-lg font-semibold text-netflix-text">Como realizar esta sessão</h4>
                </div>
                <p className="text-netflix-text-muted whitespace-pre-wrap text-lg">
                  {selectedSession.instructions}
                </p>
              </CardContent>
            </Card>
          </div>
        );

      case 'response':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-netflix-text mb-4">
                Suas Reflexões
              </h3>
              <p className="text-netflix-text-muted">
                Compartilhe suas reflexões e insights sobre esta sessão
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-netflix-text mb-2 block">
                  Suas Respostas e Reflexões
                </label>
                <Textarea
                  value={currentResponse}
                  onChange={(e) => setCurrentResponse(e.target.value)}
                  placeholder="Escreva aqui suas reflexões, respostas e insights sobre esta sessão..."
                  className="bg-netflix-gray border-netflix-border text-netflix-text min-h-[200px]"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-netflix-text mb-2 block">
                  Comentários Privados (opcional)
                </label>
                <Textarea
                  value={currentComments}
                  onChange={(e) => setCurrentComments(e.target.value)}
                  placeholder="Comentários que só você verá..."
                  className="bg-netflix-gray border-netflix-border text-netflix-text min-h-[100px]"
                />
              </div>
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold text-netflix-text mb-4">
                Avalie sua experiência
              </h3>
              <p className="text-netflix-text-muted">
                Sua opinião é muito importante para nós
              </p>
            </div>
            
            <Card className="bg-netflix-gray/20 border-netflix-border">
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-netflix-text mb-4 block">
                      Como você avalia esta sessão? (1-10)
                    </label>
                    <div className="flex gap-2 justify-center">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`p-2 rounded-full transition-all ${
                            star <= rating
                              ? 'text-yellow-400 bg-yellow-400/20'
                              : 'text-netflix-text-muted hover:text-yellow-400'
                          }`}
                        >
                          <Star className="h-6 w-6" fill={star <= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                    <p className="text-center text-sm text-netflix-text-muted mt-2">
                      {rating > 0 ? `${rating}/10` : 'Selecione uma nota'}
                    </p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-netflix-text mb-2 block">
                      Comentário sobre a experiência (opcional)
                    </label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Compartilhe sua experiência com esta sessão..."
                      className="bg-netflix-gray border-netflix-border text-netflix-text min-h-[100px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const getStatusBadge = (session: ClientSession) => {
    if (session.response?.completed) {
      return <Badge className="bg-instituto-green text-white">Concluída</Badge>;
    } else if (session.response?.response) {
      return <Badge className="bg-instituto-orange text-white">Em Andamento</Badge>;
    } else {
      return <Badge variant="outline" className="border-netflix-border text-netflix-text-muted">Não Iniciada</Badge>;
    }
  };

  const getCompletedCount = () => {
    return sessions.filter(s => s.response?.completed).length;
  };

  const newSessionsCount = sessions.filter(s => !s.response?.started_at).length;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-instituto-orange" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com introdução */}
      <Card className="bg-gradient-to-r from-instituto-orange/20 to-instituto-purple/20 border-instituto-orange/30">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-instituto-orange/20 rounded-full">
              <Lightbulb className="h-8 w-8 text-instituto-orange" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-netflix-text mb-2">
                Suas Sessões Personalizadas ✨
              </h2>
              <p className="text-netflix-text-muted mb-4">
                Estas são as sessões enviadas especialmente para você pelo seu terapeuta. 
                Clique para iniciar sua jornada de autoconhecimento e transformação.
              </p>
              <div className="flex gap-4 text-sm">
                <span className="text-instituto-green font-medium">
                  {getCompletedCount()} Concluídas
                </span>
                <span className="text-instituto-orange font-medium">
                  {sessions.length - getCompletedCount()} Pendentes
                </span>
                {newSessionsCount > 0 && (
                  <Badge className="bg-instituto-purple text-white animate-pulse">
                    {newSessionsCount} Nova(s)
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Sessões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sessions.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <p className="text-netflix-text-muted">Nenhuma sessão encontrada</p>
          </div>
        ) : (
          sessions.map((session) => {
            const isNew = !session.response?.started_at;
          
          return (
            <Card 
              key={session.id} 
              className={`bg-netflix-card border-netflix-border hover:border-instituto-orange/50 transition-all duration-300 cursor-pointer group ${
                isNew ? 'ring-2 ring-instituto-purple/30 shimmer-effect' : ''
              }`}
              onClick={() => handleStartSession(session)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg text-netflix-text group-hover:text-instituto-orange transition-colors">
                        {session.title}
                      </CardTitle>
                      {isNew && (
                        <Badge className="bg-instituto-purple text-white text-xs animate-pulse">
                          NOVA
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-netflix-text-muted">{session.description}</p>
                  </div>
                    <div className="flex items-center gap-2">
                      {session.response?.favorite && (
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      )}
                      {getStatusBadge(session)}
                    </div>
                </div>
              </CardHeader>
              
                <CardContent>
                  <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-netflix-text-muted">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(session.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center">
                        <Badge variant="outline" className="text-xs">
                          {session.category}
                        </Badge>
                      </div>
                    </div>

                    {session.response?.response && (
                      <div className="bg-netflix-gray/20 rounded-lg p-3">
                        <p className="text-sm text-netflix-text-muted mb-1">Sua resposta:</p>
                        <p className="text-sm text-netflix-text line-clamp-2">
                          {session.response.response}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                  <Button 
                        variant="ghost" 
                    size="sm" 
                        className="text-instituto-orange hover:text-instituto-orange/80"
                  >
                    <Play className="h-4 w-4 mr-2" />
                        {session.response?.completed ? 'Revisar' : 'Continuar'}
                  </Button>
                  
                      {session.response?.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span className="text-sm text-netflix-text-muted">
                            {session.response.rating}/10
                          </span>
                        </div>
                      )}
                    </div>
                </div>
              </CardContent>
            </Card>
          );
          })
        )}
      </div>

      {/* Modal de Sessão */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-netflix-text">
                  {selectedSession.title}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Barra de Progresso */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-netflix-text-muted">
                    <span>Progresso</span>
                    <span>{Math.round((currentStep / getTotalSteps()) * 100)}%</span>
                      </div>
                  <Progress value={(currentStep / getTotalSteps()) * 100} className="w-full" />
                </div>

                {/* Conteúdo da Etapa */}
                {renderCurrentStep()}

                {/* Navegação */}
                <div className="flex justify-between pt-6">
                  <Button 
                    variant="outline"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                  
                  <Button 
                    onClick={handleNextStep}
                    disabled={isSaving}
                    className="instituto-button"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Salvando...
                      </>
                    ) : currentStep === getTotalSteps() - 1 ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Concluir Sessão
                      </>
                    ) : (
                      <>
                        Próximo
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};