import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Star,
  Eye,
  Download,
  MessageSquare,
  Loader2,
  Filter,
  Search
} from 'lucide-react';

interface SessionResponse {
  id: string;
  session_id: string;
  user_id: string;
  response: string;
  private_comments: string;
  completed: boolean;
  favorite: boolean;
  rating?: number;
  feedback?: string;
  started_at?: Date;
  completed_at?: Date;
  user_name: string;
  user_email: string;
  session_title: string;
}

interface SessionResponsesProps {
  sessionId?: string;
}

export const SessionResponses: React.FC<SessionResponsesProps> = ({ sessionId }) => {
  const { toast } = useToast();
  const [responses, setResponses] = useState<SessionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<SessionResponse | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Dados mockados temporários
  const mockResponses: SessionResponse[] = [
    {
      id: '1',
      session_id: '1',
      user_id: 'user1',
      response: 'Comecei a refletir sobre meus objetivos de vida e percebi que preciso de mais clareza sobre o que realmente quero. Esta sessão me ajudou a identificar que tenho muitos sonhos, mas preciso priorizar melhor.',
      private_comments: 'Esta sessão está sendo muito reveladora. Preciso dedicar mais tempo para essas reflexões.',
      completed: false,
      favorite: true,
      rating: undefined,
      feedback: undefined,
      started_at: new Date('2024-01-16'),
      user_name: 'Ana Silva',
      user_email: 'ana@email.com',
      session_title: 'Reflexão sobre Objetivos de Vida'
    },
    {
      id: '2',
      session_id: '2',
      user_id: 'user2',
      response: 'As técnicas de respiração realmente funcionam! Consegui aplicar durante um momento de ansiedade no trabalho e senti uma diferença imediata. A técnica 4-7-8 é especialmente eficaz.',
      private_comments: 'Muito útil para o dia a dia. Vou praticar mais regularmente.',
      completed: true,
      favorite: false,
      rating: 9,
      feedback: 'Excelente sessão, muito prática e fácil de aplicar no dia a dia!',
      completed_at: new Date('2024-01-12'),
      started_at: new Date('2024-01-11'),
      user_name: 'Carlos Santos',
      user_email: 'carlos@email.com',
      session_title: 'Técnicas de Respiração para Ansiedade'
    },
    {
      id: '3',
      session_id: '1',
      user_id: 'user3',
      response: 'Ainda estou processando as reflexões desta sessão. É muito profundo e preciso de mais tempo para assimilar tudo.',
      private_comments: 'Preciso de mais tempo para refletir sobre isso.',
      completed: false,
      favorite: false,
      rating: undefined,
      feedback: undefined,
      started_at: new Date('2024-01-17'),
      user_name: 'Maria Costa',
      user_email: 'maria@email.com',
      session_title: 'Reflexão sobre Objetivos de Vida'
    }
  ];

  useEffect(() => {
    loadResponses();
  }, [sessionId]);

  const loadResponses = async () => {
    try {
      setIsLoading(true);
      // Simular carregamento
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let filteredResponses = mockResponses;
      if (sessionId) {
        filteredResponses = mockResponses.filter(r => r.session_id === sessionId);
      }
      
      setResponses(filteredResponses);
    } catch (error) {
      console.error('Erro ao carregar respostas:', error);
      toast({
        title: 'Erro ao carregar respostas',
        description: 'Tente novamente mais tarde',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredResponses = () => {
    let filtered = responses;

    // Filtrar por status
    if (filterStatus === 'completed') {
      filtered = filtered.filter(r => r.completed);
    } else if (filterStatus === 'in-progress') {
      filtered = filtered.filter(r => !r.completed && r.response);
    } else if (filterStatus === 'not-started') {
      filtered = filtered.filter(r => !r.completed && !r.response);
    }

    // Filtrar por busca
    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.session_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.response.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (response: SessionResponse) => {
    if (response.completed) {
      return <Badge className="bg-instituto-green text-white">Concluída</Badge>;
    } else if (response.response) {
      return <Badge className="bg-instituto-orange text-white">Em Andamento</Badge>;
    } else {
      return <Badge variant="outline" className="border-netflix-border text-netflix-text-muted">Não Iniciada</Badge>;
    }
  };

  const exportResponses = () => {
    const csvContent = [
      ['Usuário', 'Email', 'Sessão', 'Status', 'Avaliação', 'Resposta', 'Comentários Privados', 'Feedback', 'Data Início', 'Data Conclusão'],
      ...getFilteredResponses().map(r => [
        r.user_name,
        r.user_email,
        r.session_title,
        r.completed ? 'Concluída' : r.response ? 'Em Andamento' : 'Não Iniciada',
        r.rating ? `${r.rating}/10` : '-',
        r.response || '-',
        r.private_comments || '-',
        r.feedback || '-',
        r.started_at?.toLocaleDateString() || '-',
        r.completed_at?.toLocaleDateString() || '-'
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `respostas-sessao-${sessionId || 'todas'}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: 'Exportação concluída',
      description: 'Arquivo CSV baixado com sucesso',
    });
  };

  const filteredResponses = getFilteredResponses();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-netflix-text">Respostas dos Clientes</h2>
          <p className="text-netflix-text-muted">
            {sessionId ? 'Respostas para esta sessão específica' : 'Todas as respostas dos clientes'}
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={exportResponses}
            disabled={filteredResponses.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card className="bg-netflix-gray/20 border-netflix-border">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-netflix-text-muted" />
                <input
                  type="text"
                  placeholder="Buscar por usuário, email ou sessão..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-netflix-gray border border-netflix-border rounded-md text-netflix-text placeholder-netflix-text-muted"
                />
              </div>
            </div>
            
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="completed">Concluídas</SelectItem>
                <SelectItem value="in-progress">Em Andamento</SelectItem>
                <SelectItem value="not-started">Não Iniciadas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-netflix-card border-netflix-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-instituto-orange" />
              <div>
                <p className="text-2xl font-bold text-netflix-text">{responses.length}</p>
                <p className="text-sm text-netflix-text-muted">Total de Respostas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-netflix-card border-netflix-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-instituto-green" />
              <div>
                <p className="text-2xl font-bold text-netflix-text">
                  {responses.filter(r => r.completed).length}
                </p>
                <p className="text-sm text-netflix-text-muted">Concluídas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-netflix-card border-netflix-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-instituto-orange" />
              <div>
                <p className="text-2xl font-bold text-netflix-text">
                  {responses.filter(r => !r.completed && r.response).length}
                </p>
                <p className="text-sm text-netflix-text-muted">Em Andamento</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-netflix-card border-netflix-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Star className="h-8 w-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-netflix-text">
                  {responses.filter(r => r.rating).length > 0 
                    ? (responses.filter(r => r.rating).reduce((acc, r) => acc + (r.rating || 0), 0) / responses.filter(r => r.rating).length).toFixed(1)
                    : '0'
                  }
                </p>
                <p className="text-sm text-netflix-text-muted">Avaliação Média</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Respostas */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-instituto-orange" />
        </div>
      ) : filteredResponses.length === 0 ? (
        <Card className="bg-netflix-card border-netflix-border">
          <CardContent className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-netflix-text-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-netflix-text mb-2">Nenhuma resposta encontrada</h3>
            <p className="text-netflix-text-muted">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tente ajustar os filtros de busca'
                : 'Aguarde os clientes começarem a responder às sessões'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredResponses.map((response) => (
            <Card key={response.id} className="bg-netflix-card border-netflix-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-netflix-text">
                        {response.user_name}
                      </h3>
                      {getStatusBadge(response)}
                    </div>
                    <p className="text-sm text-netflix-text-muted">
                      {response.user_email} • {response.session_title}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {response.rating && (
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm text-netflix-text-muted">
                          {response.rating}/10
                        </span>
                      </div>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedResponse(response)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm text-netflix-text-muted">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {response.started_at?.toLocaleDateString()}
                    </div>
                    {response.completed_at && (
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Concluída em {response.completed_at.toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {response.response && (
                    <div className="bg-netflix-gray/20 rounded-lg p-3">
                      <p className="text-sm text-netflix-text-muted mb-1">Resposta:</p>
                      <p className="text-sm text-netflix-text line-clamp-3">
                        {response.response}
                      </p>
                    </div>
                  )}

                  {response.feedback && (
                    <div className="bg-instituto-green/10 rounded-lg p-3">
                      <p className="text-sm text-instituto-green font-medium mb-1">Feedback:</p>
                      <p className="text-sm text-netflix-text">
                        {response.feedback}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Detalhes */}
      <Dialog open={!!selectedResponse} onOpenChange={() => setSelectedResponse(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedResponse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-netflix-text">
                  Resposta de {selectedResponse.user_name}
                </DialogTitle>
                <p className="text-netflix-text-muted">
                  {selectedResponse.session_title}
                </p>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-netflix-text-muted">Usuário:</p>
                    <p className="font-medium">{selectedResponse.user_name}</p>
                  </div>
                  <div>
                    <p className="text-netflix-text-muted">Email:</p>
                    <p className="font-medium">{selectedResponse.user_email}</p>
                  </div>
                  <div>
                    <p className="text-netflix-text-muted">Status:</p>
                    <div className="mt-1">{getStatusBadge(selectedResponse)}</div>
                  </div>
                  <div>
                    <p className="text-netflix-text-muted">Avaliação:</p>
                    <div className="flex items-center gap-1 mt-1">
                      {selectedResponse.rating ? (
                        <>
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                          <span>{selectedResponse.rating}/10</span>
                        </>
                      ) : (
                        <span className="text-netflix-text-muted">Não avaliado</span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedResponse.response && (
                  <div>
                    <h4 className="font-medium text-netflix-text mb-2">Resposta:</h4>
                    <div className="bg-netflix-gray/20 rounded-lg p-4">
                      <p className="text-netflix-text whitespace-pre-wrap">
                        {selectedResponse.response}
                      </p>
                    </div>
                  </div>
                )}

                {selectedResponse.private_comments && (
                  <div>
                    <h4 className="font-medium text-netflix-text mb-2">Comentários Privados:</h4>
                    <div className="bg-netflix-gray/20 rounded-lg p-4">
                      <p className="text-netflix-text-muted whitespace-pre-wrap">
                        {selectedResponse.private_comments}
                      </p>
                    </div>
                  </div>
                )}

                {selectedResponse.feedback && (
                  <div>
                    <h4 className="font-medium text-netflix-text mb-2">Feedback:</h4>
                    <div className="bg-instituto-green/10 rounded-lg p-4">
                      <p className="text-netflix-text whitespace-pre-wrap">
                        {selectedResponse.feedback}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-netflix-text-muted">Iniciado em:</p>
                    <p className="font-medium">
                      {selectedResponse.started_at?.toLocaleString() || 'Não iniciado'}
                    </p>
                  </div>
                  <div>
                    <p className="text-netflix-text-muted">Concluído em:</p>
                    <p className="font-medium">
                      {selectedResponse.completed_at?.toLocaleString() || 'Não concluído'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 