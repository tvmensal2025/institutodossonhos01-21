import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Calendar,
  User,
  MessageSquare,
  Unlock
} from 'lucide-react';

interface EarlyReleaseRequest {
  id: string;
  user_id: string;
  session_id: string;
  cycle_number: number;
  status: string;
  request_date: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  sessions?: {
    title: string;
    description: string;
  };
  profiles?: {
    full_name: string;
  };
}

export const EarlyReleaseManagement: React.FC = () => {
  const [requests, setRequests] = useState<EarlyReleaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<EarlyReleaseRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    denied: 0,
    total: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      // Simulação de dados para early release requests
      const requestsData: EarlyReleaseRequest[] = [];
      setRequests(requestsData);

      // Calcular estatísticas
      const newStats = {
        pending: 0,
        approved: 0,
        denied: 0,
        total: 0
      };
      setStats(newStats);

    } catch (error) {
      console.error('Error loading requests:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as solicitações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const openReviewModal = (request: EarlyReleaseRequest) => {
    setSelectedRequest(request);
    setAdminNotes('');
    setShowReviewModal(true);
  };

  const handleRequestReview = async (requestId: string, action: 'approved' | 'denied') => {
    if (!selectedRequest) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Simulação de aprovação/negação de liberação antecipada
      if (action === 'approved') {
        console.log('Liberando sessão antecipadamente para:', selectedRequest.user_id);
      } else {
        console.log('Negando liberação antecipada para:', selectedRequest.user_id);
      }

      toast({
        title: action === 'approved' ? "Solicitação Aprovada! ✅" : "Solicitação Negada ❌",
        description: action === 'approved' 
          ? "A sessão foi liberada antecipadamente para o usuário"
          : "A solicitação foi negada e o usuário foi notificado"
      });

      setShowReviewModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      loadRequests();
    } catch (error) {
      console.error('Error reviewing request:', error);
      toast({
        title: "Erro",
        description: "Não foi possível processar a solicitação",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-50 text-yellow-700">
          <Clock className="w-3 h-3 mr-1" />
          Pendente
        </Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-50 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aprovada
        </Badge>;
      case 'denied':
        return <Badge variant="secondary" className="bg-red-50 text-red-700">
          <XCircle className="w-3 h-3 mr-1" />
          Negada
        </Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando solicitações...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header e Estatísticas */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Solicitações de Liberação Antecipada</h1>
          <p className="text-muted-foreground">
            Gerencie solicitações de usuários para liberar sessões antes dos 30 dias
          </p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-muted-foreground">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-sm text-muted-foreground">Aprovadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.denied}</div>
              <div className="text-sm text-muted-foreground">Negadas</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Lista de Solicitações */}
      {requests.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">Nenhuma solicitação encontrada</h3>
            <p className="text-muted-foreground">
              Não há solicitações de liberação antecipada no momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="relative">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">
                          {request.profiles?.full_name || 'Usuário'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {request.sessions?.title || request.session_id}
                        </p>
                      </div>
                      <div className="ml-auto">
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {/* Detalhes */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Ciclo:</span>
                        <p className="font-medium">{request.cycle_number}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Solicitado em:</span>
                        <p className="font-medium">
                          {new Date(request.request_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      {request.approved_at && (
                        <div>
                          <span className="text-muted-foreground">Revisado em:</span>
                          <p className="font-medium">
                            {new Date(request.approved_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      )}
                    </div>
                   
                    {/* Descrição da sessão */}
                    <div>
                      <span className="text-sm text-muted-foreground">Sessão:</span>
                      <p className="mt-1 p-3 bg-muted/50 rounded text-sm">
                        {request.sessions?.description || 'Sem descrição disponível'}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  {request.status === 'pending' && (
                    <div className="ml-6 space-y-2">
                      <Button
                        onClick={() => openReviewModal(request)}
                        size="sm"
                        className="w-full"
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        Revisar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Revisão */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar Solicitação de Liberação Antecipada</DialogTitle>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Informações da Solicitação */}
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p><strong>Usuário:</strong> {selectedRequest.profiles?.full_name || 'N/A'}</p>
                <p><strong>Sessão:</strong> {selectedRequest.sessions?.title || selectedRequest.session_id}</p>
                <p><strong>Ciclo:</strong> {selectedRequest.cycle_number}</p>
                <p><strong>Data da solicitação:</strong> {new Date(selectedRequest.request_date).toLocaleString('pt-BR')}</p>
              </div>

              {/* Sessão */}
              <div>
                <label className="text-sm font-medium block mb-2">Sobre a sessão:</label>
                <div className="p-3 bg-blue-50 rounded border">
                  {selectedRequest.sessions?.description || 'Sem descrição disponível'}
                </div>
              </div>

              {/* Notas do Admin */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  Notas do administrador (opcional):
                </label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione comentários sobre sua decisão..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Ações */}
              <div className="flex gap-3 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowReviewModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleRequestReview(selectedRequest.id, 'denied')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Negar
                </Button>
                <Button 
                  onClick={() => handleRequestReview(selectedRequest.id, 'approved')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Aprovar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};