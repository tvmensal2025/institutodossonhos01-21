import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Video, 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Edit,
  Eye,
  Send,
  FileText,
  Image,
  Music,
  File,
  Loader2,
  X,
  MessageSquare
} from 'lucide-react';
import { SessionResponses } from './SessionResponses';

interface Session {
  id: string;
  title: string;
  description: string;
  videoUrl?: string;
  instructions: string;
  createdAt: Date;
  sentTo: string[];
  category: string;
  materials: SessionMaterial[];
  responses: { [clientId: string]: { completed: boolean; response: string; completedAt?: Date } };
}

interface Client {
  id: string;
  name: string;
  email: string;
}

interface SessionMaterial {
  type: 'video' | 'image' | 'audio' | 'pdf' | 'text';
  url?: string;
  content?: string;
  title: string;
}

export const AdminSessions: React.FC = () => {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [showResponsesSessionId, setShowResponsesSessionId] = useState<string | null>(null);

  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    videoUrl: '',
    instructions: '',
    category: '',
    selectedClients: [] as string[],
    materials: [] as SessionMaterial[]
  });

  // Carregar sessões do Supabase
  useEffect(() => {
    loadSessions();
    loadClients();
  }, []);

  const loadSessions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * 10, currentPage * 10 - 1);

      if (error) throw error;

      setSessions(data || []);
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

  const loadClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'client');

      if (error) throw error;

      setClients(data.map(client => ({
        id: client.id,
        name: client.full_name,
        email: client.email
      })));
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const handleCreateSession = async () => {
    try {
      setIsLoading(true);

      const newSessionData = {
      title: newSession.title,
      description: newSession.description,
        video_url: newSession.videoUrl,
      instructions: newSession.instructions,
        category: newSession.category,
        materials: newSession.materials,
        created_at: new Date().toISOString(),
        sent_to: newSession.selectedClients
      };

      const { data, error } = await supabase
        .from('sessions')
        .insert([newSessionData])
        .select()
        .single();

      if (error) throw error;

      // Notificar clientes selecionados
      for (const clientId of newSession.selectedClients) {
        await supabase.from('notifications').insert([{
          user_id: clientId,
          type: 'new_session',
          title: 'Nova Sessão Disponível',
          message: `Uma nova sessão "${newSession.title}" foi atribuída a você.`,
          session_id: data.id
        }]);
      }

      setSessions([data, ...sessions]);
    setNewSession({
      title: '',
      description: '',
      videoUrl: '',
      instructions: '',
        category: '',
        selectedClients: [],
        materials: []
    });
    setIsCreateDialogOpen(false);

      toast({
        title: 'Sessão criada com sucesso!',
        description: 'A sessão foi enviada para os clientes selecionados.',
      });
    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      toast({
        title: 'Erro ao criar sessão',
        description: 'Verifique os dados e tente novamente',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMaterial = () => {
    setNewSession(prev => ({
      ...prev,
      materials: [...prev.materials, {
        type: 'text',
        title: '',
        content: ''
      }]
    }));
  };

  const handleRemoveMaterial = (index: number) => {
    setNewSession(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleMaterialChange = (index: number, field: keyof SessionMaterial, value: string) => {
    setNewSession(prev => ({
      ...prev,
      materials: prev.materials.map((material, i) => 
        i === index ? { ...material, [field]: value } : material
      )
    }));
  };

  const renderMaterialIcon = (type: SessionMaterial['type']) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4" />;
      case 'image': return <Image className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      case 'pdf': return <FileText className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-netflix-text">Gerenciar Sessões</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="instituto-button animate-glow hover:scale-105 transition-all duration-300">
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Criar Nova Sessão</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div>
                <label className="text-sm font-medium text-netflix-text mb-2 block">
                  Título da Sessão
                </label>
                <Input
                  value={newSession.title}
                  onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                  placeholder="Digite o título da sessão"
                  className="bg-netflix-gray border-netflix-border text-netflix-text"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-netflix-text mb-2 block">
                  Categoria
                </label>
                <Select
                  value={newSession.category}
                  onValueChange={(value) => setNewSession({...newSession, category: value})}
                >
                  <SelectTrigger className="bg-netflix-gray border-netflix-border text-netflix-text">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="autoconhecimento">Autoconhecimento</SelectItem>
                    <SelectItem value="saude_mental">Saúde Mental</SelectItem>
                    <SelectItem value="bem_estar">Bem-estar</SelectItem>
                    <SelectItem value="desenvolvimento">Desenvolvimento Pessoal</SelectItem>
                    <SelectItem value="meditacao">Meditação</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-netflix-text mb-2 block">
                  Descrição
                </label>
                <Textarea
                  value={newSession.description}
                  onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                  placeholder="Descreva o objetivo e conteúdo da sessão"
                  className="bg-netflix-gray border-netflix-border text-netflix-text min-h-[100px]"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-netflix-text mb-2 block">
                  Vídeo Principal (YouTube)
                </label>
                <Input
                  value={newSession.videoUrl}
                  onChange={(e) => setNewSession({...newSession, videoUrl: e.target.value})}
                  placeholder="Cole o link do vídeo do YouTube"
                  className="bg-netflix-gray border-netflix-border text-netflix-text"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-netflix-text mb-2 block">
                  Instruções
                </label>
                <Textarea
                  value={newSession.instructions}
                  onChange={(e) => setNewSession({...newSession, instructions: e.target.value})}
                  placeholder="Instruções detalhadas para o cliente"
                  className="bg-netflix-gray border-netflix-border text-netflix-text min-h-[100px]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-sm font-medium text-netflix-text">
                    Materiais Adicionais
                  </label>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddMaterial}
                    className="text-instituto-orange border-instituto-orange hover:bg-instituto-orange/10"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Material
                  </Button>
                </div>

                <div className="space-y-4">
                  {newSession.materials.map((material, index) => (
                    <Card key={index} className="bg-netflix-gray/20 border-netflix-border">
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-center gap-4">
                          <Select
                            value={material.type}
                            onValueChange={(value: SessionMaterial['type']) => 
                              handleMaterialChange(index, 'type', value)
                            }
                          >
                            <SelectTrigger className="w-[150px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">
                                <div className="flex items-center gap-2">
                                  <Video className="h-4 w-4" />
                                  <span>Vídeo</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="image">
                                <div className="flex items-center gap-2">
                                  <Image className="h-4 w-4" />
                                  <span>Imagem</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="audio">
                                <div className="flex items-center gap-2">
                                  <Music className="h-4 w-4" />
                                  <span>Áudio</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="pdf">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-4 w-4" />
                                  <span>PDF</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="text">
                                <div className="flex items-center gap-2">
                                  <File className="h-4 w-4" />
                                  <span>Texto</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          <Input
                            placeholder="Título do material"
                            value={material.title}
                            onChange={(e) => handleMaterialChange(index, 'title', e.target.value)}
                            className="flex-1"
                          />

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMaterial(index)}
                            className="text-netflix-text-muted hover:text-red-500"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        {material.type === 'text' ? (
                          <Textarea
                            placeholder="Conteúdo do texto"
                            value={material.content}
                            onChange={(e) => handleMaterialChange(index, 'content', e.target.value)}
                            className="min-h-[100px]"
                          />
                        ) : (
                          <Input
                            placeholder={`URL do ${material.type}`}
                            value={material.url}
                            onChange={(e) => handleMaterialChange(index, 'url', e.target.value)}
                          />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-netflix-text mb-2 block">
                  Enviar para Clientes
                </label>
                <div className="space-y-2 max-h-[200px] overflow-y-auto">
                  {clients.map((client) => (
                    <div key={client.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={client.id}
                        checked={newSession.selectedClients.includes(client.id)}
                        onCheckedChange={(checked) => {
                          setNewSession(prev => ({
                            ...prev,
                            selectedClients: checked
                              ? [...prev.selectedClients, client.id]
                              : prev.selectedClients.filter(id => id !== client.id)
                          }));
                        }}
                      />
                      <label
                        htmlFor={client.id}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {client.name} ({client.email})
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateSession}
                  disabled={isLoading}
                  className="instituto-button"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Criar e Enviar
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de Sessões */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading && sessions.length === 0 ? (
          <div className="col-span-2 flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-instituto-orange" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <p className="text-netflix-text-muted">Nenhuma sessão encontrada</p>
          </div>
        ) : (
          sessions.map((session) => (
            <Card key={session.id} className="bg-netflix-card border-netflix-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <CardTitle className="text-lg text-netflix-text">
                      {session.title}
                    </CardTitle>
                    <p className="text-sm text-netflix-text-muted">{session.description}</p>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {session.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                <div className="flex items-center gap-4 text-sm text-netflix-text-muted">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(session.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {session.sentTo.length} clientes
                </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {session.materials?.map((material, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {renderMaterialIcon(material.type)}
                        {material.title || material.type}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-instituto-orange hover:text-instituto-orange/80"
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Reenviar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowResponsesSessionId(session.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Respostas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Respostas */}
      {showResponsesSessionId && (
        <Dialog open={!!showResponsesSessionId} onOpenChange={() => setShowResponsesSessionId(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <SessionResponses sessionId={showResponsesSessionId} />
          </DialogContent>
        </Dialog>
      )}

      {/* Carregar Mais */}
      {sessions.length > 0 && (
        <div className="flex justify-center pt-6">
            <Button 
            variant="outline"
            onClick={() => {
              setCurrentPage(prev => prev + 1);
              loadSessions();
            }}
            disabled={isLoadingMore}
            className="w-full max-w-xs"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Carregando...
              </>
            ) : (
              'Carregar Mais'
            )}
            </Button>
        </div>
      )}
    </div>
  );
};