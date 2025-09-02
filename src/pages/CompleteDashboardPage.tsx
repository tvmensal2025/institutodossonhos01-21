import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserProfile } from '@/hooks/useUserProfile';
import { 
  Home, Activity, GraduationCap, FileText, Users, Target, 
  Award, Settings, TrendingUp, Stethoscope, CreditCard, Utensils,
  Menu, LogOut, ChevronLeft, ChevronRight, User as UserIcon, Scale,
  MessageCircle, Lock, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSofiaAnalysis } from '@/hooks/useSofiaAnalysis';

// Importações dos componentes
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import { DailyMissionsFinal as DailyMissions } from '@/components/daily-missions/DailyMissionsFinal';
import CoursePlatformNetflix from '@/components/dashboard/CoursePlatformNetflix';
import SessionsPage from '@/components/SessionsPage';
import GoalsPage from '@/pages/GoalsPage';
import DesafiosSection from '@/components/dashboard/DesafiosSection';

import HealthFeedPage from '@/pages/HealthFeedPage';
import PaymentPlans from '@/components/PaymentPlans';
import UserDrVitalPage from '@/pages/UserDrVitalPage';
// Import correto da página Sofia (export: SofiaNutricionalPage)
import { SofiaNutricionalPage } from '@/pages/SofiaNutricionalPage';
import UserProfile from '@/components/UserProfile';
import DebugDataVerification from '@/components/DebugDataVerification';
import MyProgress from '@/components/MyProgress';
import SaboteurTest from '@/components/SaboteurTest';

// Removido avatar roxo com upload; vamos usar o mesmo estilo do avatar do menu
import { UserProfileSidebar } from "@/components/ui/user-profile-sidebar";
import LockedMenuItem from '@/components/LockedMenuItem';
import LockedSection from '@/components/LockedSection';
import BluetoothWeighingSystem from '@/components/weighing/BluetoothWeighingSystem';

type DashboardSection = 
  | 'dashboard' 
  | 'missions' 
  | 'courses' 
  | 'sessions' 
  | 'comunidade' 
  | 'goals'
  | 'challenges'

  | 'saboteur-test'
  | 'progress'
  | 'subscriptions'
  | 'sofia-nutricional'
  | 'dr-vital'
  | 'apps'
  | 'help'
  | 'profile'
  | 'debug';

const CompleteDashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<DashboardSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profileData, loading: profileLoading, loadProfile, uploadAvatar } = useUserProfile(user);
  const { performAnalysis } = useSofiaAnalysis();
  const hasAutoAnalyzedRef = useRef(false);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // garante que não fique preso no loader em mudanças de auth
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Auto-análise no mount do dashboard
  useEffect(() => {
    if (hasAutoAnalyzedRef.current) return;
    hasAutoAnalyzedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!cancelled && user) {
          await performAnalysis(user.id, 'automatic');
        }
      } catch (error) {
        console.error('Erro na auto-análise do dashboard:', error);
      }
    })();

    return () => { cancelled = true; };
  }, [performAnalysis]);

  // Fallback adicional: se por algum motivo o estado "loading" persistir, force a saída após 3s
  useEffect(() => {
    if (!loading) return;
    const id = window.setTimeout(() => setLoading(false), 3000);
    return () => window.clearTimeout(id);
  }, [loading]);

  const handleLogout = async () => {
    try {
      // não travar se o signOut demorar
      await Promise.race([
        supabase.auth.signOut(),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);
    } catch (e) {
      console.warn('signOut falhou, navegando mesmo assim', e);
    } finally {
      setLoading(false);
      navigate('/auth', { replace: true });
    }
  };

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Dashboard', color: 'text-primary' },
    { id: 'missions', icon: Activity, label: 'Missão do Dia', color: 'text-secondary' },
    { id: 'progress', icon: TrendingUp, label: 'Meu Progresso', color: 'text-cyan-500' },
    { id: 'goals', icon: Target, label: 'Minhas Metas', color: 'text-green-500' },
    { id: 'courses', icon: GraduationCap, label: 'Plataforma dos Sonhos', color: 'text-accent' },
    { id: 'sessions', icon: FileText, label: 'Sessões', color: 'text-muted-foreground' },
    { id: 'comunidade', icon: Users, label: 'Comunidade', color: 'text-blue-500' },
    { id: 'challenges', icon: Award, label: 'Desafios Individuais', color: 'text-orange-500' },
    { id: 'saboteur-test', icon: Settings, label: 'Teste de Sabotadores', color: 'text-gray-500' },
    { id: 'sofia-nutricional', icon: Utensils, label: 'Sofia Nutricional', color: 'text-emerald-600' },
    { id: 'dr-vital', icon: Stethoscope, label: 'Dr.Vital', color: 'text-blue-600' },
    { id: 'subscriptions', icon: CreditCard, label: 'Assinaturas', color: 'text-purple-600' },
  ];

  const renderContent = () => {
    // Verificar se a seção é bloqueada
    const lockedSections = ['challenges', 'comunidade', 'sessions', 'courses', 'subscriptions'];
    
    if (lockedSections.includes(activeSection)) {
      const sectionNames = {
        challenges: 'Desafios Individuais',
        comunidade: 'Comunidade', 
        sessions: 'Sessões',
        courses: 'Plataforma dos Sonhos',
        subscriptions: 'Assinaturas'
      };
      
      return (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                🔒 Conteúdo Premium
              </h2>
              <p className="text-muted-foreground mb-6">
                {sectionNames[activeSection as keyof typeof sectionNames]} está disponível apenas para usuários premium.
              </p>
              <Button 
                onClick={() => setActiveSection('subscriptions')}
                className="bg-primary hover:bg-primary/90"
              >
                Ver Planos Premium
              </Button>
            </div>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'missions':
        return <DailyMissions user={user} />;
      case 'progress':
        return <MyProgress />;
      case 'saboteur-test':
        return <SaboteurTest />;
      case 'goals':
        return <GoalsPage />;
      case 'subscriptions':
        return <PaymentPlans />;
      case 'sofia-nutricional':
        return <SofiaNutricionalPage />;
      case 'dr-vital':
        return <UserDrVitalPage />;
      case 'profile':
        return (
          <div className="p-6">
            <UserProfile />
          </div>
        );
      case 'debug':
        return (
          <div className="p-6">
            <DebugDataVerification />
          </div>
        );

      default:
        return (
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-4 capitalize">{activeSection.replace('-', ' ')}</h1>
            <p className="text-muted-foreground">Esta funcionalidade está em desenvolvimento...</p>
          </div>
        );
    }
  };

  const SidebarContent = ({ isMobile = false }) => {
    // No mobile, sempre expandido
    const isExpanded = isMobile ? true : sidebarExpanded;
    
    return (
      <div className="flex flex-col h-full bg-card">
        {/* Header com Menu - só mostra botão de expansão no desktop */}
        {!isMobile && (
          <div className="p-4 border-b border-border/10">
            <div className="flex items-center justify-between gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                data-tutorial="menu-mobile"
                onClick={() => setSidebarExpanded(!sidebarExpanded)}
                className="hover:bg-accent/50 transition-smooth"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center">
                {sidebarExpanded && (
                  <span className="text-sm font-medium text-foreground">Menu</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile header simples */}
        {isMobile && (
          <div className="p-4 border-b border-border/10">
            <span className="text-lg font-semibold text-foreground">Menu</span>
          </div>
        )}

        {/* Perfil do Usuário - usando o mesmo estilo do avatar do menu, porém grande */}
        {!profileLoading && (
          <div className="p-4 border-b border-border/10">
            <div
              className="w-full p-0 h-auto hover:bg-accent/30 transition-smooth cursor-pointer rounded-md"
              onClick={() => setActiveSection('profile')}
            >
              <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <Avatar className={`${isExpanded ? 'h-32 w-32' : 'h-20 w-20'} ring-2 ring-primary/30 transition-all duration-200`}>
                        <AvatarImage src={profileData.avatarUrl || undefined} alt={profileData.fullName || user?.email || 'User'} />
                        <AvatarFallback>{(profileData.fullName || user?.email || 'U').slice(0,1).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      {/* Botão de atalho para Perfil sobre a foto */}
                      <div
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setActiveSection('profile');
                        }}
                        className={`${isExpanded ? 'p-1.5' : 'p-1'} absolute top-1 right-1 rounded-full border border-border/40 bg-background/80 hover:bg-accent transition-colors shadow-sm cursor-pointer`}
                        aria-label="Abrir Perfil"
                        title="Perfil"
                      >
                        <UserIcon className={`${isExpanded ? 'h-4 w-4' : 'h-3.5 w-3.5'} text-foreground/80`} />
                      </div>
                      <div className={`absolute ${isExpanded ? '-bottom-1 -right-1 w-5 h-5' : '-bottom-0.5 -right-0.5 w-4 h-4'} bg-green-500 rounded-full border-2 border-background`}>
                        {isExpanded && <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-foreground truncate max-w-[150px] sm:max-w-[200px]">
                          {profileData.fullName || user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Usuário"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">
                          {profileData.email || user?.email}
                        </p>
                        <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400 border-green-500/30 mt-1">
                          Online
                        </Badge>
                      </div>
                    )}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              
              // Itens que devem ser bloqueados
              const lockedItems = ['challenges', 'comunidade', 'sessions', 'courses', 'subscriptions'];
              
              if (lockedItems.includes(item.id)) {
                // Mapear IDs do menu para features do LockedMenuItem
                const featureMap: Record<string, 'desafios' | 'comunidade' | 'sessoes' | 'courses' | 'assinatura'> = {
                  'challenges': 'desafios',
                  'comunidade': 'comunidade', 
                  'sessions': 'sessoes',
                  'courses': 'courses',
                  'subscriptions': 'assinatura'
                };
                
                return (
                  <LockedMenuItem
                    key={item.id}
                    feature={featureMap[item.id]}
                    onClick={() => {
                      setActiveSection(item.id as DashboardSection);
                      setSidebarOpen(false);
                    }}
                    className={`${isExpanded ? 'justify-start' : 'justify-center'} gap-3 h-12 transition-colors ${
                      activeSection === item.id
                        ? 'bg-primary/15 border border-primary/30 text-foreground font-medium'
                        : 'hover:bg-accent/40'
                    }`}
                  >
                    <Icon className={`h-7 w-7 ${activeSection === item.id ? 'text-primary' : item.color}`} />
                    {isExpanded && <span className="text-left text-base">{item.label}</span>}
                  </LockedMenuItem>
                );
              }
              
              // Itens normais (não bloqueados)
              return (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className={`w-full ${isExpanded ? 'justify-start' : 'justify-center'} gap-3 h-12 transition-colors ${
                    activeSection === item.id
                      ? 'bg-primary/15 border border-primary/30 text-foreground font-medium'
                      : 'hover:bg-accent/40'
                  }`}
                  onClick={() => {
                    setActiveSection(item.id as DashboardSection);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className={`h-7 w-7 ${activeSection === item.id ? 'text-primary' : item.color}`} />
                  {isExpanded && <span className="text-left text-base">{item.label}</span>}
                </Button>
              );
            })}
          </nav>
        </div>

        {/* Botão Sair na parte inferior */}
        <div className="p-3 border-t border-border/20">
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            size="sm"
            className={`${isExpanded ? 'w-full' : 'w-10'} h-8 bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-smooth text-xs`}
          >
            <LogOut className="h-3 w-3" />
            {isExpanded && <span className="ml-1">Sair</span>}
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 capitalize">Carregando...</h1>
          <p className="text-muted-foreground">Aguarde enquanto carregamos suas informações.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const userName = (user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário").split(" ")[0];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        {/* Mobile Menu Trigger - Fixed position */}
        <div className="lg:hidden fixed top-2 left-2 z-50">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                data-tutorial="menu-mobile"
                className="bg-card/90 backdrop-blur-sm shadow-elegant border border-border/20 hover:bg-accent/30 transition-smooth p-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent isMobile={true} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Desktop Sidebar */}
        <aside className={`hidden lg:block ${sidebarExpanded ? 'w-80' : 'w-20'} border-r border-border/20 bg-card/30 transition-all duration-300`}>
          <SidebarContent isMobile={false} />
        </aside>

        {/* Main Content - Mobile optimized */}
        <main className="flex-1 overflow-y-auto lg:ml-0 ml-0">
          <div className="lg:p-0 p-2 sm:p-4 pt-12 sm:pt-16 lg:pt-0 w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CompleteDashboardPage;
