import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown, 
  Users,
  Activity,
  Calendar,
  Target,
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
  FileText,
  PieChart,
  Clock,
  Award,
  Scale
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReportData {
  totalUsers: number;
  totalMeasurements: number;
  averageWeight: number;
  weightTrend: 'up' | 'down' | 'stable';
  activeUsers: number;
  dataQuality: number;
  recentActivity: number;
  retentionRate: number;
  averageSessionsPerUser: number;
  completionRate: number;
  weightLossSuccess: number;
  topUsers: Array<{
    user_id: string;
    measurements: number;
    averageWeight: number;
    lastActivity: string;
    name?: string;
  }>;
  deviceUsage: Array<{
    device: string;
    count: number;
    percentage: number;
  }>;
  weeklyStats: Array<{
    week: string;
    newUsers: number;
    totalMeasurements: number;
    activeUsers: number;
  }>;
}

const AdvancedReports: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData>({
    totalUsers: 0,
    totalMeasurements: 0,
    averageWeight: 0,
    weightTrend: 'stable',
    activeUsers: 0,
    dataQuality: 0,
    recentActivity: 0,
    retentionRate: 0,
    averageSessionsPerUser: 0,
    completionRate: 0,
    weightLossSuccess: 0,
    topUsers: [],
    deviceUsage: [],
    weeklyStats: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');

  const fetchReportData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Buscar medições
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('user_id, measurement_date, peso_kg, gordura_corporal_percent, device_type')
        .order('measurement_date', { ascending: false });

      if (measurementsError) {
        console.error('Error fetching measurements:', measurementsError);
        return;
      }

      // Buscar perfis para nomes
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');

      const { data: userProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, created_at');

      // Buscar missões completadas
      const { data: missions } = await supabase
        .from('daily_mission_sessions')
        .select('user_id, date, is_completed, total_points');

      // Buscar sessões de usuário (usando tabela existente)
      const { data: userSessions } = await supabase
        .from('sessions')
        .select('id, created_by');

      // Calcular estatísticas básicas
      const uniqueUsers = new Set(measurements?.map(m => m.user_id) || []);
      const totalUsers = uniqueUsers.size;
      const totalMeasurements = measurements?.length || 0;

      // Peso médio
      const validWeights = measurements?.filter(m => m.peso_kg).map(m => m.peso_kg) || [];
      const averageWeight = validWeights.length > 0 
        ? validWeights.reduce((a, b) => a + b, 0) / validWeights.length 
        : 0;

      // Tendência de peso
      const sortedMeasurements = measurements?.sort((a, b) => 
        new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime()
      ) || [];
      
      let weightTrend: 'up' | 'down' | 'stable' = 'stable';
      if (sortedMeasurements.length >= 2) {
        const firstWeight = sortedMeasurements[0]?.peso_kg || 0;
        const lastWeight = sortedMeasurements[sortedMeasurements.length - 1]?.peso_kg || 0;
        weightTrend = lastWeight > firstWeight ? 'up' : lastWeight < firstWeight ? 'down' : 'stable';
      }

      // Usuários ativos
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(selectedPeriod));
      const activeUsers = new Set(
        measurements?.filter(m => new Date(m.measurement_date) >= daysAgo)
          .map(m => m.user_id) || []
      ).size;

      // Qualidade dos dados
      const completeMeasurements = measurements?.filter(m => 
        m.peso_kg && m.gordura_corporal_percent
      ).length || 0;
      const dataQuality = totalMeasurements > 0 ? (completeMeasurements / totalMeasurements) * 100 : 0;

      // Atividade recente (últimos 7 dias)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentActivity = measurements?.filter(m => 
        new Date(m.measurement_date) >= sevenDaysAgo
      ).length || 0;

      // Taxa de retenção (usuários que retornaram nos últimos 30 dias)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const activeUsersCount = new Set(
        measurements?.filter(m => new Date(m.measurement_date) >= thirtyDaysAgo)
          .map(m => m.user_id) || []
      ).size;
      const retentionRate = totalUsers > 0 ? (activeUsersCount / totalUsers) * 100 : 0;

      // Média de sessões por usuário
      const totalSessions = userSessions?.length || 0;
      const averageSessionsPerUser = totalUsers > 0 ? totalSessions / totalUsers : 0;

      // Taxa de conclusão de missões
      const totalMissions = missions?.length || 0;
      const completedMissions = missions?.filter(m => m.is_completed).length || 0;
      const completionRate = totalMissions > 0 ? (completedMissions / totalMissions) * 100 : 0;

      // Preparar userStats para análise de perda de peso
      const userStatsForWeight = new Map<string, {
        measurements: number;
        weights: number[];
        lastActivity: string;
      }>();

      measurements?.forEach(measurement => {
        const userId = measurement.user_id;
        const existing = userStatsForWeight.get(userId) || {
          measurements: 0,
          weights: [],
          lastActivity: ''
        };

        existing.measurements++;
        if (measurement.peso_kg) {
          existing.weights.push(measurement.peso_kg);
        }
        if (!existing.lastActivity || measurement.measurement_date > existing.lastActivity) {
          existing.lastActivity = measurement.measurement_date;
        }

        userStatsForWeight.set(userId, existing);
      });

      // Sucesso em perda de peso (usuários que perderam peso)
      const weightLossUsers = Array.from(userStatsForWeight.entries()).filter(([_, stats]) => {
        const weights = stats.weights;
        return weights.length >= 2 && weights[0] > weights[weights.length - 1];
      }).length;
      const weightLossSuccess = totalUsers > 0 ? (weightLossUsers / totalUsers) * 100 : 0;

      // Uso de dispositivos
      const deviceCount = new Map<string, number>();
      measurements?.forEach(m => {
        if (m.device_type) {
          deviceCount.set(m.device_type, (deviceCount.get(m.device_type) || 0) + 1);
        }
      });

      const deviceUsage = Array.from(deviceCount.entries())
        .map(([device, count]) => ({
          device,
          count,
          percentage: totalMeasurements > 0 ? (count / totalMeasurements) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Estatísticas semanais (últimas 8 semanas)
      const weeklyStats = [];
      for (let i = 7; i >= 0; i--) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (i * 7));
        weekStart.setHours(0, 0, 0, 0);
        
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        weekEnd.setHours(23, 59, 59, 999);

        const weekMeasurements = measurements?.filter(m => {
          const date = new Date(m.measurement_date);
          return date >= weekStart && date <= weekEnd;
        }) || [];

        const weekActiveUsers = new Set(weekMeasurements.map(m => m.user_id)).size;

        // Novos usuários da semana (baseado em perfis)
        const newUsers = [...(profiles || []), ...(userProfiles || [])]
          .filter(p => {
            const date = new Date(p.created_at);
            return date >= weekStart && date <= weekEnd;
          }).length;

        weeklyStats.push({
          week: `${weekStart.getDate().toString().padStart(2, '0')}/${(weekStart.getMonth() + 1).toString().padStart(2, '0')}`,
          newUsers,
          totalMeasurements: weekMeasurements.length,
          activeUsers: weekActiveUsers
        });
      }

      // Top usuários com nomes
      const userStats = new Map<string, {
        measurements: number;
        weights: number[];
        lastActivity: string;
      }>();

      measurements?.forEach(measurement => {
        const userId = measurement.user_id;
        const existing = userStats.get(userId) || {
          measurements: 0,
          weights: [],
          lastActivity: ''
        };

        existing.measurements++;
        if (measurement.peso_kg) {
          existing.weights.push(measurement.peso_kg);
        }
        if (!existing.lastActivity || measurement.measurement_date > existing.lastActivity) {
          existing.lastActivity = measurement.measurement_date;
        }

        userStats.set(userId, existing);
      });

      const topUsers = Array.from(userStats.entries())
        .map(([userId, stats]) => {
          const userProfile = profiles?.find(p => p.id === userId) || 
                            userProfiles?.find(p => p.id === userId);
          
          return {
            user_id: userId,
            measurements: stats.measurements,
            averageWeight: stats.weights.length > 0 
              ? stats.weights.reduce((a, b) => a + b, 0) / stats.weights.length 
              : 0,
            lastActivity: stats.lastActivity,
            name: userProfile?.full_name
          };
        })
        .sort((a, b) => b.measurements - a.measurements)
        .slice(0, 5);

      setReportData({
        totalUsers,
        totalMeasurements,
        averageWeight: Math.round(averageWeight * 10) / 10,
        weightTrend,
        activeUsers,
        dataQuality: Math.round(dataQuality),
        recentActivity,
        retentionRate: Math.round(retentionRate),
        averageSessionsPerUser: Math.round(averageSessionsPerUser * 10) / 10,
        completionRate: Math.round(completionRate),
        weightLossSuccess: Math.round(weightLossSuccess),
        topUsers,
        deviceUsage,
        weeklyStats
      });

    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const getTrendIcon = () => {
    switch (reportData.weightTrend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <BarChart3 className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTrendText = () => {
    switch (reportData.weightTrend) {
      case 'up': return 'Aumentando';
      case 'down': return 'Diminuindo';
      default: return 'Estável';
    }
  };

  const exportReport = () => {
    const csvContent = [
      // Cabeçalho do relatório
      ['RELATÓRIO AVANÇADO - INSTITUTO DOS SONHOS'],
      [`Gerado em: ${new Date().toLocaleString('pt-BR')}`],
      [`Período: Últimos ${selectedPeriod} dias`],
      [''],
      
      // Estatísticas gerais
      ['ESTATÍSTICAS GERAIS'],
      ['Métrica', 'Valor'],
      ['Total de Usuários', reportData.totalUsers],
      ['Usuários Ativos', reportData.activeUsers],
      ['Total de Medições', reportData.totalMeasurements],
      ['Peso Médio (kg)', reportData.averageWeight],
      ['Taxa de Retenção (%)', reportData.retentionRate],
      ['Taxa de Conclusão (%)', reportData.completionRate],
      ['Sucesso em Perda de Peso (%)', reportData.weightLossSuccess],
      ['Qualidade dos Dados (%)', reportData.dataQuality],
      [''],
      
      // Top usuários
      ['TOP USUÁRIOS'],
      ['Posição', 'Nome/ID', 'Medições', 'Peso Médio (kg)'],
      ...reportData.topUsers.map((user, index) => [
        index + 1,
        user.name || `Usuário ${user.user_id.slice(0, 8)}`,
        user.measurements,
        Math.round(user.averageWeight * 10) / 10
      ]),
      [''],
      
      // Uso de dispositivos
      ['USO DE DISPOSITIVOS'],
      ['Dispositivo', 'Contagem', 'Porcentagem (%)'],
      ...reportData.deviceUsage.map(device => [
        device.device,
        device.count,
        Math.round(device.percentage)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_avancado_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
          </CardContent>
        </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios Avançados</h1>
          <p className="text-muted-foreground">Análise detalhada do sistema</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={fetchReportData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            variant={selectedPeriod === '7' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('7')}
          >
            7 dias
          </Button>
          <Button 
            variant={selectedPeriod === '30' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('30')}
          >
            30 dias
          </Button>
          <Button 
            variant={selectedPeriod === '90' ? 'default' : 'outline'}
            onClick={() => setSelectedPeriod('90')}
          >
            90 dias
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Retenção</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.retentionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Usuários que retornaram
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sucesso em Perda de Peso</CardTitle>
            <Scale className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reportData.weightLossSuccess}%</div>
            <p className="text-xs text-muted-foreground">
              Usuários que perderam peso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conclusão</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Missões completadas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Segunda linha de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Medições</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalMeasurements}</div>
            <p className="text-xs text-muted-foreground">
              Pesagens registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Peso Médio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{reportData.averageWeight}kg</div>
              {getTrendIcon()}
            </div>
            <p className="text-xs text-muted-foreground">
              Tendência: {getTrendText()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões por Usuário</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.averageSessionsPerUser}</div>
            <p className="text-xs text-muted-foreground">
              Média de sessões
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Qualidade dos Dados</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.dataQuality}%</div>
            <p className="text-xs text-muted-foreground">
              Dados completos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analysis */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Uso de Dispositivos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.deviceUsage.length > 0 ? reportData.deviceUsage.map((device, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{device.device || 'Não especificado'}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{device.count}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(device.percentage)}%
                    </span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-muted-foreground">Nenhum dado de dispositivo disponível</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas de Engajamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Retenção</span>
                <Badge variant={reportData.retentionRate >= 70 ? "default" : reportData.retentionRate >= 50 ? "secondary" : "destructive"}>
                  {reportData.retentionRate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Conclusão</span>
                <Badge variant={reportData.completionRate >= 80 ? "default" : "secondary"}>
                  {reportData.completionRate}%
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Sucesso em Perda de Peso</span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  {reportData.weightLossSuccess}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas e Recomendações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportData.retentionRate < 50 && (
                <div className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-sm">Taxa de retenção baixa</span>
                </div>
              )}
              {reportData.completionRate < 60 && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">Baixa conclusão de missões</span>
                </div>
              )}
              {reportData.dataQuality < 80 && (
                <div className="flex items-center gap-2 text-orange-600">
                  <BarChart3 className="h-4 w-4" />
                  <span className="text-sm">Melhorar qualidade dos dados</span>
                </div>
              )}
              {reportData.recentActivity < 10 && (
                <div className="flex items-center gap-2 text-purple-600">
                  <Activity className="h-4 w-4" />
                  <span className="text-sm">Baixa atividade recente</span>
                </div>
              )}
              {reportData.retentionRate >= 70 && reportData.completionRate >= 80 && reportData.dataQuality >= 80 && (
                <div className="flex items-center gap-2 text-green-600">
                  <Users className="h-4 w-4" />
                  <span className="text-sm">Sistema funcionando bem!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Users e Estatísticas Semanais */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Usuários por Medições</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topUsers.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">
                        {user.name || `Usuário ${user.user_id.slice(0, 8)}...`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.measurements} medições
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{Math.round(user.averageWeight * 10) / 10}kg</p>
                    <p className="text-xs text-muted-foreground">
                      Peso médio
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Semanais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.weeklyStats.slice(-4).map((week, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Semana {week.week}</p>
                    <p className="text-xs text-muted-foreground">
                      {week.newUsers} novos usuários
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{week.totalMeasurements} medições</p>
                    <p className="text-xs text-muted-foreground">
                      {week.activeUsers} usuários ativos
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedReports;