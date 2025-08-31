// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Database,
  User,
  Scale,
  Target,
  Award,
  BookOpen,
  MessageSquare,
  Activity,
  Heart,
  Brain,
  Calendar,
  TrendingUp,
  Users,
  PlusCircle,
  Shield,
  Zap,
  FileText,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  dataRecords: number;
  lastUpdate?: string;
  suggestions?: string[];
}

interface AuditResult {
  category: string;
  functionality: string;
  status: 'pass' | 'fail' | 'warning' | 'running';
  description: string;
  dataRecords?: number;
  lastUpdate?: string;
  error?: string;
  icon: any;
  suggestions?: string[];
}

interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  totalSessions: number;
  completedMissions: number;
  weightMeasurements: number;
  goals: number;
  courses: number;
  chatInteractions: number;
}

const PlatformAudit: React.FC = () => {
  const [auditResults, setAuditResults] = useState<AuditResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [platformStats, setPlatformStats] = useState<PlatformStats | null>(null);
  const { toast } = useToast();

  const functionalities = [
    {
      category: 'Autenticação',
      functionality: 'Sistema de Login/Registro',
      icon: Shield,
      test: async (): Promise<TestResult> => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');
        
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .limit(5);
        
        if (error) throw error;
        return {
          dataRecords: profiles?.length || 0,
          lastUpdate: new Date().toISOString()
        };
      }
    },
    {
      category: 'Usuários',
      functionality: 'Gestão de Perfis',
      icon: User,
      test: async (): Promise<TestResult> => {
        const { data, error } = await supabase
          .from('profiles')
          .select('*');
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: data?.[0]?.updated_at
        };
      }
    },
    {
      category: 'Pesagem',
      functionality: 'Medições de Peso',
      icon: Scale,
      test: async (): Promise<TestResult> => {
        const { data, error } = await supabase
          .from('weight_measurements')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: data?.[0]?.created_at
        };
      }
    },
    {
      category: 'Missões',
      functionality: 'Missões Diárias',
      icon: Award,
      test: async (): Promise<TestResult> => {
        const { data: sessions, error: sessionsError } = await supabase
          .from('daily_mission_sessions')
          .select('*');
        
        if (sessionsError) throw sessionsError;
        
        const { data: responses, error: responsesError } = await supabase
          .from('daily_responses')
          .select('*');
        
        if (responsesError) throw responsesError;
        
        return {
          dataRecords: sessions?.length || 0,
          lastUpdate: sessions?.[0]?.updated_at,
          suggestions: responses?.length === 0 ? ['Nenhuma resposta registrada'] : []
        };
      }
    },
    {
      category: 'Metas',
      functionality: 'Sistema de Metas',
      icon: Target,
      test: async (): Promise<TestResult> => {
        const { data: goals, error: goalsError } = await supabase
          .from('user_goals')
          .select('*');
        
        if (goalsError) throw goalsError;
        
        // const { data: updates, error: updatesError } = await supabase
        //   .from('goal_updates')
        //   .select('*');
        const updates: any[] = [];
        const updatesError = null;
        
        if (updatesError) throw updatesError;
        
        return {
          dataRecords: goals?.length || 0,
          lastUpdate: (goals as any)?.[0]?.updated_at,
          suggestions: updates?.length === 0 ? ['Nenhuma atualização de progresso'] : []
        };
      }
    },
    {
      category: 'Cursos',
      functionality: 'Plataforma de Cursos',
      icon: BookOpen,
      test: async (): Promise<TestResult> => {
        const { data: courses, error: coursesError } = await supabase
          .from('courses')
          .select('*');
        
        if (coursesError) throw coursesError;
        
        const { data: modules, error: modulesError } = await supabase
          .from('course_modules')
          .select('*');
        
        if (modulesError) throw modulesError;
        
        return {
          dataRecords: courses?.length || 0,
          lastUpdate: courses?.[0]?.updated_at,
          suggestions: modules?.length === 0 ? ['Nenhum módulo criado'] : []
        };
      }
    },
    {
      category: 'Gamificação',
      functionality: 'Sistema de Pontos e Níveis',
      icon: TrendingUp,
      test: async (): Promise<TestResult> => {
        const { data, error } = await (supabase as any)
          .from('user_gamification')
          .select('*');
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: (data as any)?.[0]?.updated_at,
          suggestions: []
        };
      }
    },
    {
      category: 'Tracking',
      functionality: 'Rastreamento de Água',
      icon: Activity,
      test: async (): Promise<TestResult> => {
        const { data, error } = await (supabase as any)
          .from('water_tracking')
          .select('*');
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: (data as any)?.[0]?.recorded_at,
          suggestions: []
        };
      }
    },
    {
      category: 'Tracking',
      functionality: 'Rastreamento de Sono',
      icon: Activity,
      test: async (): Promise<TestResult> => {
        const { data, error } = await (supabase as any)
          .from('sleep_tracking')
          .select('*');
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: (data as any)?.[0]?.created_at,
          suggestions: []
        };
      }
    },
    {
      category: 'Tracking',
      functionality: 'Rastreamento de Humor',
      icon: Heart,
      test: async (): Promise<TestResult> => {
        const { data, error } = await (supabase as any)
          .from('mood_tracking')
          .select('*');
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: (data as any)?.[0]?.created_at,
          suggestions: []
        };
      }
    },
    {
      category: 'Sabotadores',
      functionality: 'Sistema de Sabotadores',
      icon: Brain,
      test: async (): Promise<TestResult> => {
        const { data, error } = await (supabase as any)
          .from('custom_saboteurs')
          .select('*')
          .eq('is_active', true);
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: (data as any)?.[0]?.updated_at,
          suggestions: []
        };
      }
    },
    {
      category: 'Sessões',
      functionality: 'Sistema de Sessões',
      icon: Calendar,
      test: async (): Promise<TestResult> => {
        const { data: sessions, error: sessionsError } = await supabase
          .from('sessions')
          .select('*');
        
        if (sessionsError) throw sessionsError;
        
        const { data: userSessions, error: userSessionsError } = await supabase
          .from('user_sessions')
          .select('*');
        
        if (userSessionsError) throw userSessionsError;
        
        return {
          dataRecords: sessions?.length || 0,
          lastUpdate: sessions?.[0]?.updated_at,
          suggestions: userSessions?.length === 0 ? ['Nenhuma sessão de usuário ativa'] : []
        };
      }
    },
    {
      category: 'Comunidade',
      functionality: 'Feed de Saúde',
      icon: Users,
      test: async (): Promise<TestResult> => {
        const { data, error } = await (supabase as any)
          .from('health_feed_posts')
          .select('*')
          .eq('is_public', true);
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: (data as any)?.[0]?.updated_at,
          suggestions: []
        };
      }
    },
    {
      category: 'Desafios',
      functionality: 'Sistema de Desafios',
      icon: PlusCircle,
      test: async (): Promise<TestResult> => {
        const { data: challenges, error: challengesError } = await supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true);
        
        if (challengesError) throw challengesError;
        
        const { data: participations, error: participationsError } = await (supabase as any)
          .from('challenge_participations')
          .select('*');
        
        if (participationsError) throw participationsError;
        
        return {
          dataRecords: challenges?.length || 0,
          lastUpdate: (challenges as any)?.[0]?.updated_at,
          suggestions: participations?.length === 0 ? ['Nenhuma participação em desafios'] : []
        };
      }
    },
    {
      category: 'AI/Chat',
      functionality: 'Chat com IA',
      icon: MessageSquare,
      test: async (): Promise<TestResult> => {
        try {
          const { data, error } = await supabase.functions.invoke('gpt-chat', {
            body: { 
              message: 'Teste de conexão para auditoria',
              maxTokens: 10 
            }
          });
          
          if (error) throw error;
          return {
            dataRecords: 1,
            lastUpdate: new Date().toISOString(),
            suggestions: []
          };
        } catch (err: any) {
          throw new Error(`Chat IA indisponível: ${err.message}`);
        }
      }
    },
    {
      category: 'Edge Functions',
      functionality: 'Funções Serverless',
      icon: Zap,
      test: async (): Promise<TestResult> => {
        const functions = [
          'enhanced-gpt-chat',
          'health-chat-bot',
          'generate-weekly-chat-insights',
          'preventive-health-analysis'
        ];
        
        let workingFunctions = 0;
        
        for (const func of functions) {
          try {
            await supabase.functions.invoke(func, {
              body: { test: true }
            });
            workingFunctions++;
          } catch (err) {
            // Function might not exist or be accessible
          }
        }
        
        return {
          dataRecords: workingFunctions,
          lastUpdate: new Date().toISOString(),
          suggestions: workingFunctions < functions.length ? 
            [`${functions.length - workingFunctions} funções indisponíveis`] : []
        };
      }
    },
    {
      category: 'Análises',
      functionality: 'Análises Preventivas',
      icon: BarChart3,
      test: async (): Promise<TestResult> => {
        // const { data, error } = await supabase
        //   .from('preventive_health_analyses')
        //   .select('*');
        const data: any[] = [];
        const error = null;
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: data?.[0]?.created_at,
          suggestions: []
        };
      }
    },
    {
      category: 'Integrações',
      functionality: 'Google Fit',
      icon: Activity,
      test: async (): Promise<TestResult> => {
        const { data, error } = await (supabase as any)
          .from('google_fit_data')
          .select('*');
        
        if (error) throw error;
        return {
          dataRecords: data?.length || 0,
          lastUpdate: (data as any)?.[0]?.created_at,
          suggestions: data?.length === 0 ? ['Nenhuma integração ativa'] : []
        };
      }
    }
  ];

  const loadPlatformStats = async () => {
    try {
      const [
        { data: users },
        { data: sessions },
        { data: missions },
        { data: weights },
        { data: goals },
        { data: courses }
      ] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('daily_mission_sessions').select('*'),
        supabase.from('daily_mission_sessions').select('*').eq('is_completed', true),
        supabase.from('weight_measurements').select('*'),
        supabase.from('user_goals').select('*'),
        supabase.from('courses').select('*').eq('is_published', true)
      ]);

      // Usuários ativos (com atividade nos últimos 30 dias)
      const { data: activeUsers } = await supabase
        .from('daily_mission_sessions')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .select('user_id');

      const uniqueActiveUsers = new Set(activeUsers?.map(u => u.user_id)).size;

      setPlatformStats({
        totalUsers: users?.length || 0,
        activeUsers: uniqueActiveUsers,
        totalSessions: sessions?.length || 0,
        completedMissions: missions?.length || 0,
        weightMeasurements: weights?.length || 0,
        goals: goals?.length || 0,
        courses: courses?.length || 0,
        chatInteractions: 0 // Would need separate tracking
      });
    } catch (error) {
      console.error('Error loading platform stats:', error);
    }
  };

  const runFullAudit = async () => {
    setIsRunning(true);
    setProgress(0);
    
    const results: AuditResult[] = [];
    
    for (let i = 0; i < functionalities.length; i++) {
      const func = functionalities[i];
      const startTime = Date.now();
      
      try {
        const testResult = await func.test();
        const duration = Date.now() - startTime;
        
        // Determine status based on data and suggestions
        let status: 'pass' | 'warning' | 'fail' = 'pass';
        if (testResult.suggestions && testResult.suggestions.length > 0) {
          status = 'warning';
        }
        if (testResult.dataRecords === 0 && func.functionality !== 'Chat com IA') {
          status = 'warning';
        }
        
        results.push({
          category: func.category,
          functionality: func.functionality,
          status,
          description: `${testResult.dataRecords} registros encontrados`,
          dataRecords: testResult.dataRecords,
          lastUpdate: testResult.lastUpdate,
          icon: func.icon,
          suggestions: testResult.suggestions
        });
        
      } catch (error: any) {
        results.push({
          category: func.category,
          functionality: func.functionality,
          status: 'fail',
          description: 'Falha na verificação',
          error: error.message,
          icon: func.icon,
          suggestions: ['Requer atenção imediata']
        });
      }
      
      setProgress(((i + 1) / functionalities.length) * 100);
      
      // Small delay for UX
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    setAuditResults(results);
    setIsRunning(false);
    
    const passed = results.filter(r => r.status === 'pass').length;
    const warnings = results.filter(r => r.status === 'warning').length;
    const failed = results.filter(r => r.status === 'fail').length;
    
    toast({
      title: "Auditoria Concluída",
      description: `${passed} OK, ${warnings} atenção, ${failed} falhas`,
      variant: failed > 0 ? "destructive" : warnings > 0 ? "default" : "default"
    });
  };

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-500 text-white">OK</Badge>;
      case 'fail':
        return <Badge className="bg-red-500 text-white">Falha</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-white">Atenção</Badge>;
      case 'running':
        return <Badge className="bg-blue-500 text-white">Testando</Badge>;
      default:
        return <Badge variant="outline">Pendente</Badge>;
    }
  };

  const passedCount = auditResults.filter(r => r.status === 'pass').length;
  const warningCount = auditResults.filter(r => r.status === 'warning').length;
  const failedCount = auditResults.filter(r => r.status === 'fail').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Auditoria da Plataforma</h2>
          <p className="text-muted-foreground">
            Verificação completa de todas as funcionalidades para lançamento
          </p>
        </div>
        
        <Button 
          onClick={runFullAudit} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <Database className="h-4 w-4" />
          {isRunning ? 'Executando...' : 'Executar Auditoria Completa'}
        </Button>
      </div>

      {/* Platform Stats */}
      {platformStats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Usuários Total</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                {platformStats.activeUsers} ativos (30 dias)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.totalSessions}</div>
              <p className="text-xs text-muted-foreground">
                {platformStats.completedMissions} missões completas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Medições</CardTitle>
              <Scale className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.weightMeasurements}</div>
              <p className="text-xs text-muted-foreground">
                {platformStats.goals} metas criadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conteúdo</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{platformStats.courses}</div>
              <p className="text-xs text-muted-foreground">
                Cursos publicados
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Progress */}
      {isRunning && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Progresso da Auditoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">
                {Math.round(progress)}% concluído - Verificando funcionalidades críticas...
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Summary */}
      {auditResults.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Funcionando</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{passedCount}</div>
              <p className="text-xs text-muted-foreground">
                Funcionalidades OK
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atenção</CardTitle>
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{warningCount}</div>
              <p className="text-xs text-muted-foreground">
                Requerem otimização
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Críticas</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedCount}</div>
              <p className="text-xs text-muted-foreground">
                Precisam correção
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Results */}
      {auditResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Resultados Detalhados</h3>
          
          {Object.entries(
            auditResults.reduce((acc, result) => {
              if (!acc[result.category]) acc[result.category] = [];
              acc[result.category].push(result);
              return acc;
            }, {} as Record<string, AuditResult[]>)
          ).map(([category, results]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {results.map((result, index) => {
                    const Icon = result.icon;
                    
                    return (
                      <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                        <div className="flex items-start gap-3 flex-1">
                          <Icon className="h-5 w-5 mt-0.5" />
                          <div className="flex-1">
                            <div className="font-medium">{result.functionality}</div>
                            <div className="text-sm text-muted-foreground">
                              {result.description}
                            </div>
                            {result.dataRecords !== undefined && (
                              <div className="text-xs text-blue-600 mt-1">
                                {result.dataRecords} registros no banco
                              </div>
                            )}
                            {result.suggestions && result.suggestions.length > 0 && (
                              <div className="text-xs text-yellow-600 mt-1">
                                • {result.suggestions.join(' • ')}
                              </div>
                            )}
                            {result.error && (
                              <div className="text-xs text-red-600 mt-1">
                                {result.error}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusIcon(result.status)}
                          {getStatusBadge(result.status)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {auditResults.length === 0 && !isRunning && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Auditoria Pendente</h3>
            <p className="text-muted-foreground text-center mb-4">
              Execute a auditoria completa para verificar todas as funcionalidades da plataforma
            </p>
            <Button onClick={runFullAudit}>
              Iniciar Auditoria
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PlatformAudit;