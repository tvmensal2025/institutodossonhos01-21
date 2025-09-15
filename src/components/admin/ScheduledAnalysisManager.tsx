import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useScheduledAnalysis } from '@/hooks/useScheduledAnalysis';
import { 
  Clock, 
  Play, 
  Users, 
  CheckCircle, 
  XCircle, 
  Calendar,
  BarChart3,
  Loader2,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ScheduledAnalysisManager: React.FC = () => {
  const { 
    isRunning, 
    lastResult, 
    runScheduledAnalysis, 
    getAnalysisLogs, 
    getUsersNeedingAnalysis 
  } = useScheduledAnalysis();

  const [logs, setLogs] = useState<any[]>([]);
  const [usersNeedingAnalysis, setUsersNeedingAnalysis] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadAnalysisLogs();
    loadUsersNeedingAnalysis();
  }, []);

  const loadAnalysisLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await getAnalysisLogs(10);
      setLogs(data);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadUsersNeedingAnalysis = async () => {
    setLoadingUsers(true);
    try {
      const data = await getUsersNeedingAnalysis();
      setUsersNeedingAnalysis(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRunAnalysis = async () => {
    await runScheduledAnalysis();
    // Recarregar dados após análise
    loadAnalysisLogs();
    loadUsersNeedingAnalysis();
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
  };

  const getStatusBadge = (successCount: number, errorCount: number) => {
    if (errorCount === 0) {
      return <Badge className="bg-green-100 text-green-800">✅ Sucesso Total</Badge>;
    } else if (successCount > errorCount) {
      return <Badge className="bg-yellow-100 text-yellow-800">⚠️ Parcial</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">❌ Falhas</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            📊 Análises Automáticas Quinzenais
          </h2>
          <p className="text-gray-600 mt-1">
            Gerenciamento das análises Sofia executadas automaticamente a cada 15 dias
          </p>
        </div>
        <Button 
          onClick={handleRunAnalysis}
          disabled={isRunning}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Executar Agora
            </>
          )}
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Pendentes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {loadingUsers ? '...' : usersNeedingAnalysis.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Precisam de análise (15+ dias)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Execução</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {logs.length > 0 ? format(new Date(logs[0].execution_date), 'dd/MM', { locale: ptBR }) : 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {logs.length > 0 ? `${logs[0].success_count}/${logs[0].users_processed} sucessos` : 'Nenhuma execução'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Sucesso</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {logs.length > 0 && logs[0].users_processed > 0 
                ? `${Math.round((logs[0].success_count / logs[0].users_processed) * 100)}%`
                : 'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Última execução
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Resultado da Última Execução */}
      {lastResult && (
        <Card className={lastResult.success ? 'border-green-200' : 'border-red-200'}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {lastResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              Resultado da Última Execução
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">{lastResult.message}</p>
            {lastResult.summary && (
              <div className="flex gap-4 text-sm">
                <span>👥 Processados: <strong>{lastResult.summary.users_processed}</strong></span>
                <span>✅ Sucessos: <strong>{lastResult.summary.success_count}</strong></span>
                <span>❌ Erros: <strong>{lastResult.summary.error_count}</strong></span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Lista de Usuários Pendentes */}
      {usersNeedingAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              Usuários Pendentes de Análise
            </CardTitle>
            <CardDescription>
              Usuários que não têm análise há mais de 15 dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {usersNeedingAnalysis.slice(0, 10).map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <span className="font-medium">{user.full_name || user.email}</span>
                    <p className="text-xs text-gray-500">
                      {user.last_analysis_date 
                        ? `Última análise: ${formatDate(user.last_analysis_date)}`
                        : 'Nunca analisado'
                      }
                    </p>
                  </div>
                  <Badge variant="outline" className="text-orange-600 border-orange-200">
                    Pendente
                  </Badge>
                </div>
              ))}
              {usersNeedingAnalysis.length > 10 && (
                <p className="text-xs text-gray-500 text-center pt-2">
                  E mais {usersNeedingAnalysis.length - 10} usuários...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico de Execuções */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Histórico de Execuções
          </CardTitle>
          <CardDescription>
            Últimas 10 execuções das análises automáticas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">Carregando histórico...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhuma execução registrada ainda</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, index) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">
                        {formatDate(log.execution_date)}
                      </span>
                      {getStatusBadge(log.success_count, log.error_count)}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      👥 {log.users_processed} usuários • 
                      ✅ {log.success_count} sucessos • 
                      ❌ {log.error_count} erros
                      {log.execution_time_ms && (
                        <> • ⏱️ {Math.round(log.execution_time_ms / 1000)}s</>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduledAnalysisManager;
