import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  LogOut, 
  Trophy, 
  Target, 
  Calendar, 
  Activity, 
  Droplets,
  Moon,
  Smile,
  TrendingUp,
  Gamepad2,
  BarChart3
} from "lucide-react";
import { NotificationBell } from "@/components/NotificationBell";
import { GamifiedDashboard } from "@/components/gamification/GamifiedDashboard";
import { TrackingDashboard } from "@/components/tracking/TrackingDashboard";
import { WaterTrackingWidget } from "@/components/tracking/WaterTrackingWidget";
import { useEnhancedGamification } from "@/hooks/useEnhancedGamification";
import { useTrackingData } from "@/hooks/useTrackingData";

const EnhancedDashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { gamificationData } = useEnhancedGamification();
  const { trackingData } = useTrackingData();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate("/auth");
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        if (!session) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      {/* Header Melhorado */}
      <header className="border-b border-border/20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Heart className="h-8 w-8 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Instituto dos Sonhos</h1>
              <p className="text-xs text-muted-foreground">Dashboard Melhorado</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">Olá, {userName}!</p>
              <p className="text-xs text-muted-foreground">
                Nível {gamificationData?.currentLevel || 1} • {gamificationData?.totalXP || 0} XP
              </p>
            </div>
            <NotificationBell />
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            <TrendingUp className="w-4 h-4" />
            Sistema Melhorado com Tracking Real
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Sua Jornada de Transformação
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Agora com sistema de gamificação real, tracking automático e desafios personalizados
          </p>

          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <Trophy className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{gamificationData?.currentLevel || 1}</div>
                <div className="text-xs opacity-90">Nível Atual</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <Target className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{gamificationData?.achievements || 0}</div>
                <div className="text-xs opacity-90">Conquistas</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <Droplets className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{trackingData?.water.todayTotal || 0}</div>
                <div className="text-xs opacity-90">Copos de Água</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
              <CardContent className="p-4 text-center">
                <Activity className="w-6 h-6 mx-auto mb-2" />
                <div className="text-2xl font-bold">{gamificationData?.currentStreak || 0}</div>
                <div className="text-xs opacity-90">Dias de Sequência</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <Tabs defaultValue="gamification" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="gamification" className="flex items-center gap-2 text-xs sm:text-sm">
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Gamificação</span>
              <span className="sm:hidden">Game</span>
            </TabsTrigger>
            <TabsTrigger value="tracking" className="flex items-center gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Tracking</span>
              <span className="sm:hidden">Track</span>
            </TabsTrigger>
            <TabsTrigger value="quick" className="flex items-center gap-2 text-xs sm:text-sm">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Rápido</span>
              <span className="sm:hidden">Quick</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="gamification" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">🎮 Sistema de Gamificação</h2>
              <p className="text-muted-foreground">
                Complete desafios, ganhe XP, desbloqueie conquistas e suba de nível!
              </p>
            </div>
            <GamifiedDashboard />
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">📊 Tracking Automático</h2>
              <p className="text-muted-foreground">
                Acompanhe sua hidratação, sono e humor com dados salvos automaticamente
              </p>
            </div>
            <TrackingDashboard />
          </TabsContent>

          <TabsContent value="quick" className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold mb-2">⚡ Ações Rápidas</h2>
              <p className="text-muted-foreground">
                Registre rapidamente seus dados do dia
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Widget de Água Standalone */}
              <WaterTrackingWidget />
              
              {/* Card de Sono Rápido */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                    <Moon className="w-5 h-5" />
                    Sono Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {trackingData?.sleep.lastNight?.hours || 0}h
                    </div>
                    <p className="text-sm text-muted-foreground">última noite</p>
                  </div>
                  
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <Moon className="w-4 h-4 mr-2" />
                    Registrar Sono
                  </Button>
                </CardContent>
              </Card>

              {/* Card de Humor Rápido */}
              <Card className="relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                    <Smile className="w-5 h-5" />
                    Humor Rápido
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {trackingData?.mood.today?.day_rating || 0}/10
                    </div>
                    <p className="text-sm text-muted-foreground">avaliação hoje</p>
                  </div>
                  
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <Smile className="w-4 h-4 mr-2" />
                    Registrar Humor
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Navegação para outras páginas */}
            <Card>
              <CardHeader>
                <CardTitle>Explore Mais Funcionalidades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => navigate('/dashboard')}
                  >
                    <Heart className="h-6 w-6" />
                    <span className="text-xs">Dashboard Original</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => navigate('/goals')}
                  >
                    <Target className="h-6 w-6" />
                    <span className="text-xs">Metas</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => navigate('/progress')}
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span className="text-xs">Progresso</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-20 flex flex-col gap-2"
                    onClick={() => navigate('/app/courses')}
                  >
                    <Calendar className="h-6 w-6" />
                    <span className="text-xs">Cursos</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EnhancedDashboardPage;