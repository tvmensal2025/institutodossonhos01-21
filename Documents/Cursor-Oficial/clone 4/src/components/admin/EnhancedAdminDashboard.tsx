import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AdminProtectedRoute } from '@/components/admin/AdminProtectedRoute';
import { UsersList } from '@/components/admin/UsersList';
import { CompleteTrendTrackWeightSystem } from '@/components/admin/CompleteTrendTrackWeightSystem';
import { ClientRegistrationForm } from '@/components/admin/ClientRegistrationForm';
import { SessionHistory } from '@/components/admin/SessionHistory';
import { ClientReports } from '@/components/admin/ClientReports';
import { UserManagement } from '@/components/admin/UserManagement';
import { DataVisualization } from '@/components/admin/DataVisualization';
import { SystemSettings } from '@/components/admin/SystemSettings';
import { CourseManagement } from '@/components/admin/CourseManagement';
import { UserSelector } from '@/components/admin/UserSelector';
import { UserSessionManagement } from '@/components/admin/UserSessionManagement';
import { IndividualClientDashboard } from '@/components/admin/IndividualClientDashboard';
import { 
  Users, Video, BarChart3, Settings, Bell, Crown, UserPlus, Calendar, 
  Target, TrendingUp, Shield, Eye, Database, GraduationCap, UserSearch,
  Activity, CheckCircle, AlertCircle, ChevronRight, Sparkles, Home,
  Clock, UserX, Heart, Coffee, Zap, Filter, Download, RefreshCw,
  ChevronDown, LogOut, BookOpen, FileText
} from 'lucide-react';
import { ButtonLoading } from '@/components/ui/loading';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { supabase } from '@/integrations/supabase/client';

export const EnhancedAdminDashboard: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState<string>('');

  // Atualizar relógio
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Função de logout melhorada
  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      
      // Feedback visual imediato
      toast({
        title: "🔐 Encerrando sessão...",
        description: "Saindo do painel administrativo com segurança"
      });

      // Esperar um pouco para UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Fazer logout
      await signOut();
      
      // Limpar dados locais
      localStorage.removeItem('adminAuth');
      localStorage.removeItem('userType');
      localStorage.removeItem('admin_session');
      
      toast({
        title: "✅ Logout realizado",
        description: "Sessão administrativa encerrada com sucesso"
      });
      
      // Redirecionar para login
      navigate('/auth');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast({
        title: "❌ Erro no logout",
        description: "Houve um problema ao encerrar a sessão. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  // Função para navegar
  const navigateToPublic = () => {
    try {
      toast({
        title: "🌐 Redirecionando...",
        description: "Indo para a área pública"
      });
      navigate('/');
    } catch (error) {
      console.error('Erro na navegação:', error);
      toast({
        title: "❌ Erro na navegação",
        description: "Não foi possível navegar. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  // Menu do usuário
  const UserMenu = () => (
    <DropdownMenu open={showUserMenu} onOpenChange={setShowUserMenu}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-white text-xs">
                {user?.user_metadata?.full_name?.split(' ').map(n => n[0]).join('') || 'AD'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">
              {user?.user_metadata?.full_name || 'Admin'}
            </span>
            <ChevronDown className="h-4 w-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-white/95 backdrop-blur-sm border-white/20">
        <DropdownMenuItem 
          onClick={navigateToPublic}
          className="cursor-pointer hover:bg-primary/5"
        >
          <Home className="mr-2 h-4 w-4 text-primary" />
          <span className="text-primary">Ir para Área Pública</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => {
            toast({
              title: "🔧 Em desenvolvimento",
              description: "Configurações estarão disponíveis em breve"
            });
          }}
          className="cursor-pointer hover:bg-primary/5"
        >
          <Settings className="mr-2 h-4 w-4 text-primary" />
          <span className="text-primary">Configurações</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="cursor-pointer hover:bg-red-50 focus:bg-red-50"
        >
          <div className="flex items-center">
            {isSigningOut ? (
              <ButtonLoading size="sm" className="mr-2" />
            ) : (
              <LogOut className="mr-2 h-4 w-4 text-red-600" />
            )}
            <span className="text-red-600">
              {isSigningOut ? 'Saindo...' : 'Sair do Sistema'}
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/80 to-health-purple">
      {/* Header aprimorado */}
      <div className="bg-black/30 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo e título */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-health-purple rounded-lg flex items-center justify-center">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Instituto dos Sonhos
                </h1>
                <p className="text-sm text-white/60">
                  Painel Administrativo
                </p>
              </div>
            </div>

            {/* Relógio e informações */}
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-sm font-medium text-white">
                  {currentTime.toLocaleTimeString('pt-BR')}
                </div>
                <div className="text-xs text-white/60">
                  {currentTime.toLocaleDateString('pt-BR', { 
                    weekday: 'long', 
                    day: 'numeric', 
                    month: 'long' 
                  })}
                </div>
              </div>
              
              <div className="w-px h-8 bg-white/20" />
              
              <UserMenu />
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por tabs */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'users', label: 'Usuários', icon: Users },
              { id: 'courses', label: 'Cursos', icon: BookOpen },
              { id: 'sessions', label: 'Sessões', icon: Calendar },
              { id: 'reports', label: 'Relatórios', icon: FileText },
              { id: 'settings', label: 'Sistema', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 ${
                  selectedTab === id
                    ? 'border-primary text-white bg-white/10'
                    : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Dashboard content */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">47</p>
                      <p className="text-sm text-white/60">Clientes Ativos</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">124</p>
                      <p className="text-sm text-white/60">Sessões Hoje</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">89%</p>
                      <p className="text-sm text-white/60">Taxa de Conclusão</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                      <Activity className="h-6 w-6 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">94%</p>
                      <p className="text-sm text-white/60">Engajamento</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações rápidas */}
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    onClick={() => setSelectedTab('users')}
                    className="bg-primary hover:bg-primary/90 text-white h-12"
                  >
                    <UserPlus className="h-5 w-5 mr-2" />
                    Gerenciar Usuários
                  </Button>
                  
                  <Button 
                    onClick={() => setSelectedTab('sessions')}
                    className="bg-green-600 hover:bg-green-700 text-white h-12"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Criar Sessão
                  </Button>
                  
                  <Button 
                    onClick={() => setSelectedTab('reports')}
                    className="bg-purple-600 hover:bg-purple-700 text-white h-12"
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Ver Relatórios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {selectedTab === 'users' && <UserManagement />}
        {selectedTab === 'courses' && <CourseManagement />}
        {selectedTab === 'sessions' && (
          <div className="space-y-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Gerenciamento de Sessões</CardTitle>
                <p className="text-white/60">Selecione um usuário para gerenciar suas sessões personalizadas</p>
              </CardHeader>
              <CardContent>
                <UserSelector 
                  onUserSelect={async (userId) => {
                    setSelectedUserId(userId);
                    
                    // Buscar nome do usuário selecionado
                    try {
                      const { data: profile } = await supabase
                        .from('profiles')
                        .select('full_name')
                        .eq('id', userId)
                        .single();
                      
                      setSelectedUserName(profile?.full_name || 'Usuário Selecionado');
                    } catch (error) {
                      console.error('Erro ao buscar nome do usuário:', error);
                      setSelectedUserName('Usuário Selecionado');
                    }
                  }}
                  selectedUserId={selectedUserId}
                />
              </CardContent>
            </Card>
            
            {selectedUserId && (
              <UserSessionManagement 
                userId={selectedUserId}
                userName={selectedUserName}
              />
            )}
          </div>
        )}
        {selectedTab === 'reports' && <DataVisualization />}
        {selectedTab === 'settings' && <SystemSettings />}
      </div>
    </div>
  );
};