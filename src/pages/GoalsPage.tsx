import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, Trophy, Clock } from 'lucide-react';
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog';
import { GoalCard } from '@/components/goals/GoalCard';
import { EnhancedGoalCard } from '@/components/gamification/EnhancedGoalCard';
import { WeeklyProgressCard } from '@/components/goals/WeeklyProgressCard';
import { GamifiedDashboard } from '@/components/gamification/GamifiedDashboard';
import { DraggableDashboard } from '@/components/DraggableDashboard';
import { useToast } from '@/hooks/use-toast';
import { useWeeklyGoalProgress } from '@/hooks/useWeeklyGoalProgress';

export default function GoalsPage() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  const { data: weeklyProgress, isLoading: weeklyLoading } = useWeeklyGoalProgress();

  const { data: goals, isLoading, refetch } = useQuery({
    queryKey: ['user-goals'],
    queryFn: async () => {
      // Buscar apenas metas do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['goal-stats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data, error } = await supabase
        .from('user_goals')
        .select('status')
        .eq('user_id', user.id);

      if (error) throw error;

      const total = data.length;
      const completed = data.filter(g => g.status === 'concluida').length;
      const pending = data.filter(g => g.status === 'pendente').length;
      const inProgress = data.filter(g => g.status === 'em_progresso').length;

      return { total, completed, pending, inProgress };
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-500';
      case 'aprovada': return 'bg-blue-500';
      case 'em_progresso': return 'bg-blue-600';
      case 'concluida': return 'bg-green-500';
      case 'rejeitada': return 'bg-red-500';
      case 'cancelada': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Aguardando Aprovação';
      case 'aprovada': return 'Aprovada';
      case 'em_progresso': return 'Em Progresso';
      case 'concluida': return 'Concluída';
      case 'rejeitada': return 'Rejeitada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Minhas Metas</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe suas metas pessoais com aprovação administrativa
          </p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Nova Meta
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aguardando Aprovação</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progresso Geral */}
      {stats && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">📊 Progresso Geral</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card de Progresso Principal */}
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/20 to-transparent rounded-full transform translate-x-16 -translate-y-16" />
              <CardHeader className="relative z-10">
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-primary" />
                  Taxa de Conclusão
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary">
                      {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                    </div>
                    <p className="text-muted-foreground">das suas metas concluídas</p>
                  </div>
                  <Progress 
                    value={stats.total > 0 ? (stats.completed / stats.total) * 100 : 0} 
                    className="h-3"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{stats.completed} concluídas</span>
                    <span>{stats.total} total</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Distribuição */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Distribuição das Metas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-sm">Concluídas</span>
                    </div>
                    <span className="font-semibold">{stats.completed}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-sm">Em Progresso</span>
                    </div>
                    <span className="font-semibold">{stats.inProgress}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-sm">Pendentes</span>
                    </div>
                    <span className="font-semibold">{stats.pending}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Suas Metas</h2>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-2 bg-muted rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : goals && goals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => (
              <EnhancedGoalCard 
                key={goal.id} 
                goal={goal as any} 
                onUpdate={refetch} 
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma meta ainda</h3>
              <p className="text-muted-foreground text-center mb-4">
                Crie sua primeira meta e comece sua jornada de transformação!
              </p>
              <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      <CreateGoalDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          refetch();
          toast({
            title: "Meta criada!",
            description: "Sua meta foi submetida para aprovação administrativa.",
          });
        }}
      />
    </div>
  );
}