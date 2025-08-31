// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import { Target, CheckCircle2, XCircle, Edit, Trash2, ArrowRightLeft } from 'lucide-react';

export function GoalManagement() {
  const [selectedTab, setSelectedTab] = useState('pendente');
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [approvalData, setApprovalData] = useState({
    status: 'aprovada' as 'aprovada' | 'rejeitada',
    points_awarded: 0,
    comments: ''
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAdminPermissions();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['admin-goals', selectedTab],
    queryFn: async () => {
      let query = supabase
        .from('user_goals')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedTab !== 'todas') {
        query = query.eq('status', selectedTab);
      }

      const { data: goalsData, error } = await query;
      if (error) throw error;

      // Buscar informações dos usuários para cada meta
      const goalsWithUserInfo = await Promise.all(
        goalsData.map(async (goal) => {
          // Buscar perfil do usuário
          let userProfile = null;
          try {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name,email')
              .eq('user_id', goal.user_id)
              .single();

            if (profileData) {
              userProfile = profileData;
            }
          } catch (error) {
            console.warn('Erro ao buscar perfil do usuário:', error);
          }

          return {
            ...goal,
            user_info: userProfile || { full_name: 'Usuário sem perfil', email: null }
          };
        })
      );

      return goalsWithUserInfo;
    }
  });

  const approveGoalMutation = useMutation({
    mutationFn: async ({ goalId, approval }: { goalId: string, approval: any }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Admin não autenticado");

      console.log('🔍 Processando aprovação:', { goalId, approval, adminId: user.id });

      // Atualizar meta diretamente
      const updateData: any = {
        status: approval.status,
        approved_by: user.id,
        approved_at: new Date().toISOString(),
        admin_notes: approval.comments || `Pontos concedidos: ${approval.points_awarded}`,
        updated_at: new Date().toISOString()
      };

      if (approval.status === 'aprovada') {
        updateData.final_points = approval.points_awarded;
      } else if (approval.status === 'rejeitada') {
        updateData.rejection_reason = approval.comments || 'Meta rejeitada pelo admin';
      }

      const { data: updatedGoal, error } = await supabase
        .from('user_goals')
        .update(updateData)
        .eq('id', goalId)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao processar meta:', error);
        throw error;
      }

      console.log(`✅ Meta ${approval.status} com sucesso`);

      return updatedGoal;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
      setSelectedGoal(null);
      toast({ 
        title: "Meta processada!", 
        description: "A meta foi processada e o usuário foi notificado automaticamente." 
      });
    }
  });

  const transformToChallengeMutation = useMutation({
    mutationFn: async (goal: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      // Criar desafio baseado na meta
      const challengeData = {
        title: goal.title,
        description: goal.description || `Desafio criado a partir da meta: ${goal.title}`,
        category: 'meta_transformada',
        challenge_type: 'general', // Adding the required field
        difficulty: goal.difficulty || 'medio',
        duration_days: goal.data_fim ? Math.ceil((new Date(goal.data_fim).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 30,
        points_reward: goal.estimated_points || 100,
        badge_icon: '🎯',
        badge_name: `Meta ${goal.title}`,
        instructions: `Complete esta meta: ${goal.target_value} ${goal.unit || 'unidades'}`,
        tips: [`Meta transformada em desafio público`, `Criada por: ${goal.user_name || 'usuário'}`],
        daily_log_type: 'numeric',
        daily_log_target: goal.target_value,
        daily_log_unit: goal.unit || 'unidades',
        is_active: true, // Ativar imediatamente
        is_featured: false,
        is_group_challenge: true,
        start_date: new Date().toISOString().split('T')[0],
        end_date: goal.data_fim || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        created_by: user.id // Campo obrigatório adicionado
      };

      const { data: challenge, error: challengeError } = await supabase
        .from('challenges')
        .insert(challengeData)
        .select()
        .single();

      if (challengeError) throw challengeError;

      // Atualizar meta para indicar que foi transformada em desafio
      const { error: goalError } = await supabase
        .from('user_goals')
        .update({
          challenge_id: challenge.id,
          status: 'transformada'
        })
        .eq('id', goal.id);

      if (goalError) throw goalError;

      return challenge;
    },
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
      toast({ 
        title: "Meta transformada em desafio!", 
        description: `O desafio "${challenge.title}" foi criado e está aguardando ativação.` 
      });
    }
  });

  const handleApproval = (goal: any, status: 'aprovada' | 'rejeitada') => {
    setSelectedGoal(goal);
    setApprovalData({
      status,
      points_awarded: status === 'aprovada' ? goal.estimated_points || 10 : 0,
      comments: ''
    });
  };

  // Handlers de edição e exclusão para super admin
  const handleEditGoal = (goal: any) => {
    if (!isSuperAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas Super Admins podem editar metas",
        variant: "destructive"
      });
      return;
    }
    // Implementar edição
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: "Edição de metas será implementada em breve"
    });
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!isSuperAdmin) {
      toast({
        title: "Acesso Negado",
        description: "Apenas Super Admins podem excluir metas",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Meta Excluída ✅",
        description: "Meta foi permanentemente removida"
      });

      queryClient.invalidateQueries({ queryKey: ['admin-goals'] });
    } catch (error) {
      console.error('Erro ao excluir meta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a meta",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Gerenciamento de Metas</h2>
        <p className="text-muted-foreground">Aprove, rejeite e gerencie metas dos usuários</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="pendente">Pendentes</TabsTrigger>
          <TabsTrigger value="aprovada">Aprovadas</TabsTrigger>
          <TabsTrigger value="em_progresso">Em Progresso</TabsTrigger>
          <TabsTrigger value="concluida">Concluídas</TabsTrigger>
          <TabsTrigger value="transformada">Transformadas</TabsTrigger>
          <TabsTrigger value="todas">Todas</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab}>
          {isLoading ? (
            <div>Carregando...</div>
          ) : goals && goals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <Card key={goal.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{(goal as any).title || 'Meta de Saúde'}</CardTitle>
                     <p className="text-sm text-muted-foreground">
                       Usuário: {goal.user_info?.full_name || goal.user_id.substring(0, 8) + '...'}
                     </p>
                   </CardHeader>
                    <CardContent className="space-y-4">
                     <div className="text-sm space-y-1">
                       <p>🎯 Meta: {(goal as any).target_value || goal.peso_meta_kg} {(goal as any).unit || 'kg'}</p>
                       <p>⚡ Dificuldade: {(goal as any).difficulty || 'medio'}</p>
                        <p>💰 Pontos: {(goal as any).estimated_points || 100}</p>
                        {goal.status === 'transformada' && (goal as any).challenge_id && (
                          <p className="text-blue-600">🚀 Desafio: Criado (ID: {(goal as any).challenge_id.substring(0, 8)}...)</p>
                        )}
                        {goal.user_info?.full_name && (
                          <p>👤 Criado por: {goal.user_info.full_name}</p>
                        )}
                     </div>
                     
                     {goal.status === 'pendente' && (
                       <div className="flex gap-2 flex-wrap">
                         <Button size="sm" onClick={() => handleApproval(goal, 'aprovada')}>
                           <CheckCircle2 className="w-4 h-4 mr-1" />
                           Aprovar
                         </Button>
                         <Button size="sm" variant="destructive" onClick={() => handleApproval(goal, 'rejeitada')}>
                           <XCircle className="w-4 h-4 mr-1" />
                           Rejeitar
                         </Button>
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => transformToChallengeMutation.mutate(goal)}
                           disabled={transformToChallengeMutation.isPending}
                         >
                           <ArrowRightLeft className="w-4 h-4 mr-1" />
                           Virar Desafio
                         </Button>
                       </div>
                     )}

                     {(goal.status === 'aprovada' || goal.status === 'em_progresso') && (
                       <div className="flex gap-2">
                         <Button 
                           size="sm" 
                           variant="outline"
                           onClick={() => transformToChallengeMutation.mutate(goal)}
                           disabled={transformToChallengeMutation.isPending}
                         >
                           <ArrowRightLeft className="w-4 h-4 mr-1" />
                           Transformar em Desafio
                         </Button>
                        </div>
                      )}

                      {goal.status === 'transformada' && (
                        <Badge variant="secondary" className="w-fit">
                          ✅ Transformada em desafio público
                        </Badge>
                      )}

                      {/* Botões de edição/exclusão para super admin */}
                      {isSuperAdmin && (
                        <div className="flex gap-2 mt-3">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditGoal(goal)}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                            onClick={() => handleDeleteGoal(goal.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>Nenhuma meta encontrada.</p>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedGoal} onOpenChange={() => setSelectedGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalData.status === 'aprovada' ? 'Aprovar Meta' : 'Rejeitar Meta'}
            </DialogTitle>
            <DialogDescription>
              {approvalData.status === 'aprovada' 
                ? 'Defina os pontos finais e comentários para aprovar esta meta.'
                : 'Adicione comentários sobre o motivo da rejeição desta meta.'
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedGoal && (
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold">{selectedGoal.title}</h3>
                <p className="text-sm">{selectedGoal.description}</p>
              </div>

              {approvalData.status === 'aprovada' && (
                <div>
                  <label className="text-sm font-medium">Pontos Finais</label>
                  <Input
                    type="number"
                    value={approvalData.points_awarded}
                    onChange={(e) => setApprovalData({
                      ...approvalData, 
                      points_awarded: parseInt(e.target.value) || 0
                    })}
                  />
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Comentários</label>
                <Textarea
                  value={approvalData.comments}
                  onChange={(e) => setApprovalData({...approvalData, comments: e.target.value})}
                  placeholder="Comentários sobre a decisão..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setSelectedGoal(null)}>
                  Cancelar
                </Button>
                <Button 
                  onClick={() => approveGoalMutation.mutate({
                    goalId: selectedGoal.id,
                    approval: approvalData
                  })}
                  disabled={approveGoalMutation.isPending}
                >
                  {approveGoalMutation.isPending ? 'Processando...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}