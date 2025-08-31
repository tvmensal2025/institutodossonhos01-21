import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Database,
  Server,
  Users,
  Brain,
  Scale,
  Target,
  Award,
  BookOpen,
  Calendar,
  MessageSquare,
  Activity,
  Shield
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SystemStatusItem {
  name: string;
  status: 'active' | 'warning' | 'error' | 'checking';
  description: string;
  icon: any;
  count?: number;
  lastCheck?: string;
}

const SystemStatus: React.FC = () => {
  const [status, setStatus] = useState<SystemStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkSystemStatus = async () => {
    setLoading(true);
    
    try {
      const statusChecks: SystemStatusItem[] = [
        {
          name: 'Banco de Dados',
          status: 'checking',
          description: 'Conexão com Supabase',
          icon: Database
        },
        {
          name: 'Autenticação',
          status: 'checking',
          description: 'Sistema de login/registro',
          icon: Shield
        },
        {
          name: 'Usuários',
          status: 'checking',
          description: 'Perfis e dados dos usuários',
          icon: Users
        },
        {
          name: 'Sistema de Pesagem',
          status: 'checking',
          description: 'Medições e histórico',
          icon: Scale
        },
        {
          name: 'Metas e Objetivos',
          status: 'checking',
          description: 'Sistema de goals',
          icon: Target
        },
        {
          name: 'Missões Diárias',
          status: 'checking',
          description: 'Sistema de daily missions',
          icon: Award
        },
        {
          name: 'Sabotadores',
          status: 'checking',
          description: 'Sistema de padrões comportamentais',
          icon: Brain
        },
        {
          name: 'Cursos',
          status: 'checking',
          description: 'Plataforma de educação',
          icon: BookOpen
        },
        {
          name: 'Sessões',
          status: 'checking',
          description: 'Agendamento e acompanhamento',
          icon: Calendar
        },
        {
          name: 'Chat/IA',
          status: 'checking',
          description: 'Assistente virtual',
          icon: MessageSquare
        },
        {
          name: 'Tracking Hábitos',
          status: 'checking',
          description: 'Água, sono, humor',
          icon: Activity
        },
        {
          name: 'Edge Functions',
          status: 'checking',
          description: 'Funções serverless',
          icon: Server
        }
      ];

      setStatus(statusChecks);

      // Verificar conexão com banco
      const { error: dbError } = await supabase.from('profiles').select('count').limit(1);
      
      // Verificar tabelas principais
      const tables = [
        'profiles',
        'weight_measurements', 
        'user_goals',
        'daily_mission_sessions',
        'daily_responses',
        'custom_saboteurs',
        'courses',
        'sessions',
        'water_tracking',
        'sleep_tracking',
        'mood_tracking'
      ];

      const updatedStatus = [...statusChecks];

      // Database check
      updatedStatus[0].status = dbError ? 'error' : 'active';
      updatedStatus[0].lastCheck = new Date().toLocaleTimeString();

      // Auth check
      try {
        const { data: { user } } = await supabase.auth.getUser();
        updatedStatus[1].status = 'active';
        updatedStatus[1].lastCheck = new Date().toLocaleTimeString();
      } catch {
        updatedStatus[1].status = 'error';
      }

      // Check each table/functionality
      for (let i = 2; i < updatedStatus.length; i++) {
        try {
          let count = 0;
          
          switch (i) {
            case 2: // Users
              const { data: profiles, error: profilesError } = await supabase
                .from('profiles')
                .select('id', { count: 'exact' });
              count = profiles?.length || 0;
              updatedStatus[i].status = profilesError ? 'warning' : 'active';
              break;
              
            case 3: // Weighing system
              const { data: measurements, error: measurementsError } = await supabase
                .from('weight_measurements')
                .select('id', { count: 'exact' });
              count = measurements?.length || 0;
              updatedStatus[i].status = measurementsError ? 'warning' : 'active';
              break;
              
            case 4: // Goals
              const { data: goals, error: goalsError } = await supabase
                .from('user_goals')
                .select('id', { count: 'exact' });
              count = goals?.length || 0;
              updatedStatus[i].status = goalsError ? 'warning' : 'active';
              break;
              
            case 5: // Daily missions
              const { data: missions, error: missionsError } = await supabase
                .from('daily_mission_sessions')
                .select('id', { count: 'exact' });
              count = missions?.length || 0;
              updatedStatus[i].status = missionsError ? 'warning' : 'active';
              break;
              
            case 6: // Saboteurs
              // Mock data since custom_saboteurs table doesn't exist yet
              count = 0;
              updatedStatus[i].status = 'warning';
              break;
              
            case 7: // Courses
              const { data: courses, error: coursesError } = await supabase
                .from('courses')
                .select('id', { count: 'exact' });
              count = courses?.length || 0;
              updatedStatus[i].status = coursesError ? 'warning' : 'active';
              break;
              
            case 8: // Sessions
              const { data: sessions, error: sessionsError } = await supabase
                .from('sessions')
                .select('id', { count: 'exact' });
              count = sessions?.length || 0;
              updatedStatus[i].status = sessionsError ? 'warning' : 'active';
              break;
              
            case 9: // Chat/AI
              // Test edge function call
              try {
                const { error: chatError } = await supabase.functions.invoke('gpt-chat', {
                  body: { message: 'test', maxTokens: 10 }
                });
                updatedStatus[i].status = chatError ? 'warning' : 'active';
              } catch {
                updatedStatus[i].status = 'warning';
              }
              break;
              
            case 10: // Habit tracking
              // Using health_diary table instead of water_tracking
              const { data: water, error: waterError } = await supabase
                .from('health_diary')
                .select('id')
                .not('water_intake', 'is', null);
              count = water?.length || 0;
              updatedStatus[i].status = waterError ? 'warning' : 'active';
              break;
              
            case 11: // Edge Functions
              try {
                const { error: funcError } = await supabase.functions.invoke('health-chat-bot', {
                  body: { message: 'ping' }
                });
                updatedStatus[i].status = funcError ? 'warning' : 'active';
              } catch {
                updatedStatus[i].status = 'warning';
              }
              break;
          }
          
          updatedStatus[i].count = count;
          updatedStatus[i].lastCheck = new Date().toLocaleTimeString();
          
        } catch (error) {
          updatedStatus[i].status = 'error';
          updatedStatus[i].lastCheck = new Date().toLocaleTimeString();
        }
      }

      setStatus(updatedStatus);
      
      toast({
        title: "Status do Sistema Atualizado",
        description: "Verificação completa realizada com sucesso."
      });
      
    } catch (error) {
      console.error('Error checking system status:', error);
      toast({
        title: "Erro na Verificação",
        description: "Erro ao verificar status do sistema.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Ativo</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-white">Atenção</Badge>;
      case 'error':
        return <Badge className="bg-red-500 text-white">Erro</Badge>;
      case 'checking':
        return <Badge className="bg-blue-500 text-white">Verificando...</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'checking':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const activeCount = status.filter(s => s.status === 'active').length;
  const warningCount = status.filter(s => s.status === 'warning').length;
  const errorCount = status.filter(s => s.status === 'error').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Status do Sistema</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real das funcionalidades
          </p>
        </div>
        <Button 
          onClick={checkSystemStatus} 
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Status
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sistemas Ativos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeCount / status.length) * 100)}% operacional
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atenções</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
            <p className="text-xs text-muted-foreground">
              Sistemas com alertas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Erros</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errorCount}</div>
            <p className="text-xs text-muted-foreground">
              Sistemas com problemas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {status.map((item, index) => {
          const Icon = item.icon;
          
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  <CardTitle className="text-sm font-medium">{item.name}</CardTitle>
                </div>
                {getStatusIcon(item.status)}
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    {getStatusBadge(item.status)}
                    {item.count !== undefined && (
                      <span className="text-sm font-medium">
                        {item.count} registros
                      </span>
                    )}
                  </div>
                  
                  {item.lastCheck && (
                    <p className="text-xs text-muted-foreground">
                      Última verificação: {item.lastCheck}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SystemStatus;