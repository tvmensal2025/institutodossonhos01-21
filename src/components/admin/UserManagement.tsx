import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Filter, 
  MoreHorizontal,
  Mail,
  Calendar,
  Activity,
  Target,
  Award,
  UserPlus,
  Edit,
  Eye,
  Stethoscope
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import UserDetailModal from './UserDetailModal';
import CreateUserModal from './CreateUserModal';
import ExamAccessModal from './ExamAccessModal';

interface UserData {
  user_id: string;
  measurements: number;
  lastActivity: string;
  averageWeight: number;
  status: 'active' | 'inactive';
  profile?: {
    full_name?: string;
    email?: string;
    created_at: string;
  };
  completedMissions: number;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExamAccessModalOpen, setIsExamAccessModalOpen] = useState(false);
  const [selectedUserForExam, setSelectedUserForExam] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      // Buscar usuários da tabela profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email, created_at');
      
      // A tabela user_profiles foi unificada com profiles

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      }

      // Buscar medições para estatísticas
      const { data: measurements, error: measurementsError } = await supabase
        .from('weight_measurements')
        .select('user_id, measurement_date, peso_kg')
        .order('measurement_date', { ascending: false });

      if (measurementsError) {
        console.error('Error fetching measurements:', measurementsError);
      }

      // Buscar missões completadas para atividade
      const { data: missions, error: missionsError } = await supabase
        .from('daily_mission_sessions')
        .select('user_id, date, is_completed')
        .eq('is_completed', true)
        .order('date', { ascending: false });

      if (missionsError) {
        console.error('Error fetching missions:', missionsError);
      }

      // Agrupar dados por usuário
      const userStats = new Map<string, {
        measurements: number;
        weights: number[];
        lastActivity: string;
        profile?: any;
        completedMissions: number;
      }>();

      // Processar perfis da tabela profiles
      profiles?.forEach(profile => {
        userStats.set(profile.id, {
          measurements: 0,
          weights: [],
          lastActivity: profile.created_at,
          profile,
          completedMissions: 0
        });
      });

      // A tabela user_profiles foi unificada com profiles

      // Processar medições
      measurements?.forEach(measurement => {
        const userId = measurement.user_id;
        const existing = userStats.get(userId) || {
          measurements: 0,
          weights: [],
          lastActivity: measurement.measurement_date,
          completedMissions: 0
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

      // Processar missões
      missions?.forEach(mission => {
        const userId = mission.user_id;
        const existing = userStats.get(userId);
        if (existing) {
          existing.completedMissions++;
          if (!existing.lastActivity || mission.date > existing.lastActivity) {
            existing.lastActivity = mission.date;
          }
        }
      });

      // Converter para array e determinar status
      const usersData: UserData[] = Array.from(userStats.entries()).map(([userId, stats]) => {
        const averageWeight = stats.weights.length > 0 
          ? stats.weights.reduce((a, b) => a + b, 0) / stats.weights.length 
          : 0;

        // Determinar status baseado na atividade recente (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const isActive = new Date(stats.lastActivity) >= thirtyDaysAgo;

        return {
          user_id: userId,
          measurements: stats.measurements,
          lastActivity: stats.lastActivity,
          averageWeight: Math.round(averageWeight * 10) / 10,
          status: isActive ? 'active' : 'inactive',
          profile: stats.profile,
          completedMissions: stats.completedMissions
        };
      });

      setUsers(usersData);

    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      (user.user_id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.profile?.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (user.profile?.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge variant="default" className="bg-green-100 text-green-800">
        Ativo
      </Badge>
    ) : (
      <Badge variant="secondary">
        Inativo
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const exportUsersList = () => {
    try {
      const csvContent = [
        // Cabeçalho
        ['Nome', 'Email', 'ID', 'Status', 'Medições', 'Peso Médio', 'Missões', 'Última Atividade'].join(','),
        // Dados
        ...filteredUsers.map(user => [
          user.profile?.full_name || `Usuário ${user.user_id.slice(0, 8)}`,
          user.profile?.email || '',
          user.user_id,
          user.status === 'active' ? 'Ativo' : 'Inativo',
          user.measurements,
          user.averageWeight > 0 ? `${user.averageWeight}kg` : '',
          user.completedMissions,
          formatDate(user.lastActivity)
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error exporting users:', error);
    }
  };

  const handleUserEdit = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailModalOpen(true);
  };

  const handleUserUpdated = () => {
    fetchUsers(); // Recarregar lista
  };

  const handleUserCreated = () => {
    fetchUsers(); // Recarregar lista
  };

  const handleExamAccess = (userId: string, userName: string) => {
    setSelectedUserForExam({ id: userId, name: userName });
    setIsExamAccessModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
              </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
            </div>
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
          <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            {users.length} usuários registrados no sistema
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Cadastrar Novo Usuário
          </Button>
          <Button variant="outline" onClick={exportUsersList}>
            <Users className="h-4 w-4 mr-2" />
            Exportar Lista
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'active' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('active')}
              >
                Ativos
              </Button>
              <Button
                variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('inactive')}
              >
                Inativos
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.user_id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {user.profile?.full_name || `Usuário ${user.user_id.slice(0, 8)}...`}
                    </h3>
                    {user.profile?.email && (
                      <p className="text-sm text-muted-foreground mb-1">{user.profile.email}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {user.measurements} medições
                      </div>
                      {user.averageWeight > 0 && (
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          {user.averageWeight}kg
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        {user.completedMissions} missões
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDate(user.lastActivity)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusBadge(user.status)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUserEdit(user.user_id)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleExamAccess(
                      user.user_id, 
                      user.profile?.full_name || `Usuário ${user.user_id.slice(0, 8)}...`
                    )}
                  >
                    <Stethoscope className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              Usuários registrados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Últimos 30 dias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Medições</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0 
                ? Math.round(users.reduce((sum, u) => sum + u.measurements, 0) / users.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">
              Por usuário
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Acesso aos Exames</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.length > 0 
                ? users.filter(u => {
                  const currentMonth = new Date().toISOString().slice(0, 7);
                  const lastAccessKey = `exam_access_${u.user_id}_${currentMonth}`;
                  return localStorage.getItem(lastAccessKey) === 'true';
                }).length
                : 0
              }/{users.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Usuários com acesso este mês
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Modais */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onUserUpdated={handleUserUpdated}
      />

      <CreateUserModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={handleUserCreated}
      />

      <ExamAccessModal
        isOpen={isExamAccessModalOpen}
        onClose={() => {
          setIsExamAccessModalOpen(false);
          setSelectedUserForExam(null);
        }}
        userId={selectedUserForExam?.id || null}
        userName={selectedUserForExam?.name}
      />
    </div>
  );
};

export default UserManagement;