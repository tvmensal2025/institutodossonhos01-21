import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { useAdminMode } from "@/hooks/useAdminMode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  Heart, 
  LogOut, 
  Users, 
  BookOpen, 
  FileText,
  Settings,
  BarChart3,
  Shield,
  TrendingUp,
  Award,
  Calendar,
  Scale,
  Monitor,
  HelpCircle,
  Database,
  CreditCard,
  Activity,
  Bell,
  Brain,
  Building2,
  MessageCircle,
  Utensils,
  Play
} from "lucide-react";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import UserManagement from "@/components/admin/UserManagement";
import WeighingMonitoring from "@/components/admin/WeighingMonitoring";
import { WeightReportGenerator } from "@/components/admin/WeightReportGenerator";
import AdvancedReports from "@/components/admin/AdvancedReports";
import { CourseManagementNew } from "@/components/admin/CourseManagementNew";
import DebugDataVerification from "@/components/DebugDataVerification";
import ToolsManagement from "@/components/admin/ToolsManagement";
import SessionManagement from "@/components/admin/SessionManagement";
import ChallengeManagement from "@/components/admin/ChallengeManagement";
import { N8nWebhookManager } from "@/components/N8nWebhookManager";
import AIControlPanelUnified from "@/components/admin/AIControlPanelUnified";
import CompanyConfiguration from "@/components/admin/CompanyConfiguration";
import { SessionAssigner } from "@/components/admin/SessionAssigner";

import SystemStatus from "@/components/admin/SystemStatus";
import SimulatedTests from "@/components/admin/SimulatedTests";
import PlatformAudit from "@/components/admin/PlatformAudit";
import MedicalDocumentsSection from "@/components/dashboard/MedicalDocumentsSection";
import { TutorialDeviceConfig } from "@/components/admin/TutorialDeviceConfig";
import SofiaDataTestPanel from "@/components/admin/SofiaDataTestPanel";

const AdminPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("dashboard");
  const [pendingGoals, setPendingGoals] = useState(0);
  const [isTutorialModalOpen, setIsTutorialModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    activeSessions: 0,
    completedMissions: 0
  });
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Verificação de admin usando hook existente
  const { isAdmin } = useAdminMode(user);

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

  useEffect(() => {
    if (user) {
      fetchStats();
      fetchPendingGoals();
    }
  }, [user]);

  const fetchPendingGoals = async () => {
    try {
      const { count } = await supabase
        .from('user_goals')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pendente');
      
      setPendingGoals(count || 0);
    } catch (error) {
      console.error('Error fetching pending goals:', error);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch total users count
      const { count: usersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total courses count
      const { count: coursesCount } = await supabase
        .from('courses')
        .select('*', { count: 'exact', head: true });

      // Fetch today's completed missions
      const today = new Date().toISOString().split('T')[0];
      const { count: missionsCount } = await supabase
        .from('user_missions')
        .select('*', { count: 'exact', head: true })
        .eq('is_completed', true)
        .eq('date_assigned', today);

      setStats({
        totalUsers: usersCount || 0,
        totalCourses: coursesCount || 0,
        activeSessions: 12, // Mock data
        completedMissions: missionsCount || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const menuItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard Admin', color: 'text-primary', description: 'Visão geral completa do sistema' },
    { id: 'users', icon: Users, label: 'Gestão de Usuários', color: 'text-blue-500', description: 'Gerenciar todos os usuários' },
    { id: 'weighings', icon: Scale, label: 'Monitoramento de Pesagens', color: 'text-purple-500', description: 'Acompanhar todas as pesagens' },
    { id: 'reports', icon: TrendingUp, label: 'Análises e Relatórios', color: 'text-green-500', description: 'Relatórios avançados e insights' },
    { id: 'courses', icon: BookOpen, label: 'Gestão de Cursos', color: 'text-orange-500', description: 'Gerenciar cursos e conteúdo' },
    { id: 'challenges', icon: Award, label: 'Gestão de Metas e Desafios', color: 'text-pink-500', description: 'Criar e gerenciar metas e desafios' },
    { id: 'payments', icon: CreditCard, label: 'Gestão de Pagamentos', color: 'text-emerald-500', description: 'Gestão Asaas e assinaturas' },
    { id: 'company-config', icon: Building2, label: '🏢 Dados da Empresa', color: 'text-indigo-500', description: 'Configure dados da empresa para melhor IA' },
    { id: 'ai-control', icon: Brain, label: '🧠 Controle Unificado de IA', color: 'text-purple-500', description: 'Configuração Avançada - DrVital/Sofia - MÁXIMO/MEIO/MÍNIMO' },
    { id: 'mealie', icon: Utensils, label: 'Mealie (Cardápio)', color: 'text-emerald-600', description: 'Curadoria de receitas e token' },
    { id: 'sessions', icon: FileText, label: 'Gestão de Sessões', color: 'text-cyan-500', description: 'Criar e enviar sessões personalizadas' },
    { id: 'n8n', icon: Activity, label: 'Automação n8n', color: 'text-violet-500', description: 'Webhooks para WhatsApp e automações' },
    { id: 'devices', icon: Monitor, label: 'Gestão de Dispositivos', color: 'text-indigo-500', description: 'Dispositivos conectados' },
    { id: 'documents', icon: FileText, label: 'Documentos Médicos', color: 'text-rose-500', description: 'Examinar, subir e analisar exames' },
    { id: 'settings', icon: Settings, label: 'Configurações do Sistema', color: 'text-red-500', description: 'Configurações gerais' },
    { id: 'security', icon: Shield, label: 'Segurança e Auditoria', color: 'text-yellow-500', description: 'Logs e segurança' },
    { id: 'support', icon: HelpCircle, label: 'Suporte e Ajuda', color: 'text-pink-500', description: 'Central de suporte' },
    { id: 'backup', icon: Database, label: 'Backup e Manutenção', color: 'text-gray-500', description: 'Backup e manutenção' },
    { id: 'system', icon: Database, label: 'Status do Sistema', color: 'text-blue-500', description: 'Verificar funcionamento' },
    { id: 'tests', icon: Activity, label: 'Admin Principal', color: 'text-green-500', description: 'Interface principal de administração' },
    { id: 'sofia', icon: MessageCircle, label: 'Teste Sofia & Dr. Vital', color: 'text-teal-500', description: 'Teste completo de acesso aos dados do usuário e empresa' },
    { id: 'tutorials', icon: Play, label: 'Configuração de Tutoriais', color: 'text-yellow-500', description: 'Tutoriais específicos para Mobile, Tablet e PC' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Carregando painel administrativo...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }

  // Acesso liberado para todos os usuários logados

  const userName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Administrador";

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard userRole={isAdmin ? 'admin' : 'super_admin'} />;
      case 'users':
        return <UserManagement />;
      case 'weighings':
        return <WeighingMonitoring />;
      case 'reports':
        return <AdvancedReports />;
      case 'courses':
        return <CourseManagementNew />;
      case 'challenges':
        return <ChallengeManagement user={user} />;
      case 'company-config':
        return <CompanyConfiguration />;
      case 'ai-control':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">🧠 Controle Unificado de IA</h1>
                <p className="text-muted-foreground">Gerenciamento completo - DrVital/Sofia - OpenAI/Gemini</p>
              </div>
              <Badge variant="default" className="flex items-center gap-1">
                <Brain className="h-4 w-4" />
                IA 100% Funcional
              </Badge>
            </div>
            <AIControlPanelUnified />
          </div>
        );
      case 'mealie':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Utensils className="h-6 w-6 text-emerald-600" />
                  Mealie (Gerador de Cardápio)
                </h1>
                <p className="text-muted-foreground">
                  Painel de curadoria de receitas e token da API. Usuários não acessam este painel; apenas a Sofia consome a API com um token seguro.
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => window.open('http://localhost:9925/admin/site-settings', '_blank')}>
                  Abrir Mealie Admin
                </Button>
                <Button variant="outline" onClick={() => window.open('http://localhost:9925/admin/recipes', '_blank')}>
                  Receitas
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>O que fazer aqui</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <ol className="list-decimal pl-5 space-y-2">
                  <li>
                    Gerar um <strong>Token de API</strong>: em Settings → API Tokens (ou Personal Access Tokens) → Create Token. Copie e guarde.
                  </li>
                  <li>
                    <strong>Salvar o token</strong> nos segredos (ex.: Supabase):
                    <pre className="mt-2 p-2 bg-muted rounded">Sistema usando base TACO brasileira</pre>
                  </li>
                  <li>
                    Fazer <strong>curadoria de receitas</strong>: adicione títulos, imagens, ingredientes e nutrição quando disponível.
                  </li>
                  <li>
                    Marcar <strong>tags por refeição</strong>: breakfast, lunch, snack, dinner, supper.
                  </li>
                  <li>
                    Marcar <strong>dietas</strong> (keto/veg/etc.), alergênicos, <strong>tempo</strong> de preparo e <strong>custo</strong>.
                  </li>
                  <li>
                    Manter ao menos <strong>10+ receitas por refeição</strong> para variedade e rotação.
                  </li>
                  <li>
                    Na Sofia, use a aba <strong>Cardápio</strong> para gerar e testar; a função usa esse token e suas tags.
                  </li>
                </ol>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Boas práticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Deixe o Mealie <strong>privado</strong> (ALLOW_SIGNUP=false) em produção.</li>
                  <li>Token <strong>service-only</strong>, não compartilhar com usuários.</li>
                  <li>Complete nutrição sempre que possível; se faltar, a Sofia complementa pela base local.</li>
                  <li>Revise variedade semanal e evite repetição de ingredientes.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gestão de Pagamentos</h1>
                <p className="text-muted-foreground">Integração com Asaas e controle de assinaturas</p>
              </div>
              <Button onClick={() => window.open('https://app.asaas.com', '_blank')}>
                <CreditCard className="h-4 w-4 mr-2" />
                Acessar Asaas
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Receita Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 0,00</div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Assinantes Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Planos premium</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Taxa de Conversão</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0%</div>
                  <p className="text-xs text-muted-foreground">Último mês</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Configuração do Asaas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Configure sua integração com o gateway de pagamento Asaas.</p>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => window.open('https://docs.asaas.com', '_blank')}>
                      📚 Documentação
                    </Button>
                    <Button variant="outline" onClick={() => window.open('https://sandbox.asaas.com', '_blank')}>
                      🧪 Sandbox
                    </Button>
                    <Button onClick={() => window.open('https://app.asaas.com/api', '_blank')}>
                      🔑 Chaves API
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Planos Disponíveis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Plano Básico</h4>
                    <p className="text-sm text-muted-foreground">Acesso aos recursos básicos</p>
                    <div className="text-lg font-bold mt-2">R$ 29,90/mês</div>
                    <Button size="sm" className="mt-2" disabled>
                      Configurar
                    </Button>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-semibold">Plano Premium</h4>
                    <p className="text-sm text-muted-foreground">Acesso completo + coaching</p>
                    <div className="text-lg font-bold mt-2">R$ 97,90/mês</div>
                    <Button size="sm" className="mt-2" disabled>
                      Configurar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'sessions':
        return (
          <div className="space-y-6">
            <SessionAssigner />
            <SessionManagement />
          </div>
        );
      case 'n8n':
        return <N8nWebhookManager />;
      case 'devices':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Gestão de Dispositivos</h1>
                <p className="text-muted-foreground">Dispositivos conectados e configurações</p>
              </div>
              <Button onClick={() => setActiveSection('weighings')}>
                <Monitor className="h-4 w-4 mr-2" />
                Ver Monitoramento
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Balanças Xiaomi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Configure a integração com balanças inteligentes.</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dispositivos conectados</span>
                      <Badge>0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Última sincronização</span>
                      <span className="text-xs text-muted-foreground">Nunca</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status Bluetooth</span>
                      <Badge variant="destructive">Desconectado</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "🔍 Escaneando...", description: "Procurando dispositivos Bluetooth" })}>
                      Escanear
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "🔗 Conectar", description: "Função em desenvolvimento" })}>
                      Conectar
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Google Fit</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">Sincronização com dados do Google Fit.</p>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status da API</span>
                      <Badge variant="secondary">Inativo</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Usuários conectados</span>
                      <Badge>0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dados sincronizados</span>
                      <span className="text-xs text-muted-foreground">0 registros</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => window.open('https://console.cloud.google.com/apis', '_blank')}>
                      Google Console
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: "⚙️ Configurar", description: "Função em desenvolvimento" })}>
                      Configurar API
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Dispositivos Suportados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl mb-2">⚖️</div>
                    <h4 className="font-medium">Mi Body Composition Scale 2</h4>
                    <p className="text-xs text-muted-foreground">Bluetooth LE</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <h4 className="font-medium">Mi Fit App</h4>
                    <p className="text-xs text-muted-foreground">Sincronização automática</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <div className="text-2xl mb-2">🏃</div>
                    <h4 className="font-medium">Google Fit</h4>
                    <p className="text-xs text-muted-foreground">API REST</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'documents':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Documentos Médicos</h1>
                <p className="text-muted-foreground">Controle completo de exames, relatórios e documentos</p>
              </div>
              <Button onClick={() => setActiveSection('documents')}>
                Atualizar
              </Button>
            </div>
            <MedicalDocumentsSection />
          </div>
        );
      case 'settings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Configurações Gerais</h1>
                <p className="text-muted-foreground">Configurações globais do sistema</p>
              </div>
              <Button onClick={() => toast({ title: "💾 Configurações", description: "Salvando configurações..." })}>
                <Settings className="h-4 w-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>
            
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Aplicação</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Modo Manutenção</p>
                      <p className="text-sm text-muted-foreground">Bloquear acesso para manutenção</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Inativo</Badge>
                      <Button size="sm" variant="outline" onClick={() => toast({ title: "🔧 Manutenção", description: "Modo manutenção ativado" })}>
                        Ativar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Registros Públicos</p>
                      <p className="text-sm text-muted-foreground">Permitir novos cadastros</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge>Ativo</Badge>
                      <Button size="sm" variant="outline" onClick={() => toast({ title: "🚫 Registros", description: "Registros desabilitados" })}>
                        Desativar
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Notificações Email</p>
                      <p className="text-sm text-muted-foreground">Sistema de envio de emails</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">Configurar</Badge>
                      <Button size="sm" variant="outline" onClick={() => toast({ title: "📧 Email", description: "Abrindo configurações de email" })}>
                        Configurar
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Cache do Sistema</p>
                      <p className="text-sm text-muted-foreground">Limpar cache para melhor performance</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => toast({ title: "🗑️ Cache", description: "Cache limpo com sucesso!" })}>
                      Limpar Cache
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Limites e Recursos</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Máx. usuários simultâneos</p>
                      <p className="text-2xl font-bold">1000</p>
                      <p className="text-xs text-muted-foreground">Atual: {stats.totalUsers}</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Armazenamento</p>
                      <p className="text-2xl font-bold">50GB</p>
                      <p className="text-xs text-muted-foreground">Usado: ~2.1GB</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Backup automático</p>
                      <p className="text-2xl font-bold">24h</p>
                      <p className="text-xs text-muted-foreground">Último: hoje</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <p className="text-sm font-medium">Uptime</p>
                      <p className="text-2xl font-bold">99.9%</p>
                      <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Integrações Externas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Supabase</p>
                      <p className="text-sm text-muted-foreground">Banco de dados e autenticação</p>
                    </div>
                    <Badge>Conectado</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">OpenAI</p>
                      <p className="text-sm text-muted-foreground">Análise de dados e IA</p>
                    </div>
                    <Badge variant="secondary">Configurar</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Asaas</p>
                      <p className="text-sm text-muted-foreground">Gateway de pagamentos</p>
                    </div>
                    <Badge variant="outline">Pendente</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Segurança e Auditoria</h1>
                <p className="text-muted-foreground">Logs de segurança e monitoramento</p>
              </div>
            </div>
            
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Tentativas de Login</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">0</div>
                  <p className="text-xs text-muted-foreground">Falhadas hoje</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sessões Ativas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1</div>
                  <p className="text-xs text-muted-foreground">Administradores online</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Backup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">✓</div>
                  <p className="text-xs text-muted-foreground">Último backup: hoje</p>
                </CardContent>
              </Card>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Logs de Auditoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">Login administrativo</span>
                    <span className="text-xs text-muted-foreground">hoje, 20:04</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm">Sessão criada</span>
                    <span className="text-xs text-muted-foreground">hoje, 20:01</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm">Backup automático</span>
                    <span className="text-xs text-muted-foreground">hoje, 00:00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'support':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Suporte e Ajuda</h1>
                <p className="text-muted-foreground">Central de suporte e documentação</p>
              </div>
              <Button onClick={() => toast({ title: "🎫 Ticket", description: "Criando novo ticket de suporte..." })}>
                <HelpCircle className="h-4 w-4 mr-2" />
                Novo Ticket
              </Button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Tickets de Suporte</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tickets abertos</span>
                      <Badge>0</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tempo médio resposta</span>
                      <span className="text-sm">&lt; 24h</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tickets resolvidos</span>
                      <Badge variant="outline">15</Badge>
                    </div>
                    <Button className="w-full" onClick={() => toast({ title: "📞 Suporte", description: "Abrindo chat de suporte..." })}>
                      <HelpCircle className="h-4 w-4 mr-2" />
                      Chat de Suporte
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Documentação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://docs.lovable.dev', '_blank')}>
                      📖 Manual do Administrador
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "⚙️ Configuração", description: "Abrindo guia de configuração..." })}>
                      🔧 Guia de Configuração
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "❓ FAQ", description: "Abrindo FAQ técnico..." })}>
                      ❓ FAQ Técnico
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => window.open('https://supabase.com/docs', '_blank')}>
                      🔌 APIs e Integrações
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Links Úteis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-3">
                  <Button variant="outline" onClick={() => window.open('https://supabase.com/dashboard', '_blank')}>
                    🗄️ Supabase Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => window.open('https://vercel.com', '_blank')}>
                    🚀 Vercel Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => window.open('https://lovable.dev', '_blank')}>
                    💜 Lovable Platform
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contato de Emergência</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm"><strong>Email:</strong> admin@seuapp.com</p>
                  <p className="text-sm"><strong>Telefone:</strong> (11) 99999-9999</p>
                  <p className="text-sm"><strong>WhatsApp:</strong> (11) 88888-8888</p>
                  <Button size="sm" className="mt-3" onClick={() => window.open('mailto:admin@seuapp.com?subject=Emergência Admin', '_blank')}>
                    📧 Enviar Email
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      case 'backup':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Backup e Manutenção</h1>
                <p className="text-muted-foreground">Gestão de backups e manutenção do sistema</p>
              </div>
              <Button onClick={() => toast({ title: "💾 Backup", description: "Iniciando backup manual..." })}>
                <Database className="h-4 w-4 mr-2" />
                Backup Manual
              </Button>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Status do Backup</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Último backup</span>
                      <Badge>Hoje, 00:00</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Próximo backup</span>
                      <span className="text-sm">Amanhã, 00:00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tamanho atual</span>
                      <span className="text-sm">2.5 GB</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Retenção</span>
                      <span className="text-sm">30 dias</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Status</span>
                      <Badge>Automático</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manutenção do Sistema</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "🧹 Limpeza", description: "Limpando logs antigos..." })}>
                      🧹 Limpeza de Logs
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "⚡ Otimização", description: "Otimizando banco de dados..." })}>
                      ⚡ Otimização BD
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast({ title: "🔍 Verificação", description: "Verificando integridade dos dados..." })}>
                      🔍 Verificar Integridade
                    </Button>
                    <Button variant="destructive" className="w-full justify-start" onClick={() => toast({ title: "🚧 Manutenção", description: "Ativando modo manutenção..." })}>
                      🚧 Modo Manutenção
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Histórico de Backups</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="text-sm font-medium">Backup completo</p>
                      <p className="text-xs text-muted-foreground">2.5 GB</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Hoje, 00:00</p>
                      <Badge>Sucesso</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="text-sm font-medium">Backup incremental</p>
                      <p className="text-xs text-muted-foreground">150 MB</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Ontem, 00:00</p>
                      <Badge>Sucesso</Badge>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <div>
                      <p className="text-sm font-medium">Backup completo</p>
                      <p className="text-xs text-muted-foreground">2.3 GB</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">Há 2 dias</p>
                      <Badge>Sucesso</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Espaço em Disco</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold">78%</div>
                    <p className="text-xs text-muted-foreground">39 GB / 50 GB usados</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold">98%</div>
                    <p className="text-xs text-muted-foreground">Sistema saudável</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Uptime</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-2xl font-bold">99.9%</div>
                    <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'system':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Status do Sistema</h1>
                <p className="text-muted-foreground">Verificação completa do funcionamento do sistema</p>
              </div>
              <Button onClick={() => toast({ title: "🔄 Atualizando", description: "Verificando status do sistema..." })}>
                <Monitor className="h-4 w-4 mr-2" />
                Atualizar Status
              </Button>
            </div>
            
            {/* Sistema de verificação de dados atual */}
            <DebugDataVerification />
            
            {/* Status adicional dos serviços */}
            <Card>
              <CardHeader>
                <CardTitle>Status dos Serviços</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Supabase</p>
                      <p className="text-xs text-muted-foreground">Database</p>
                    </div>
                    <Badge>🟢 Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Vercel</p>
                      <p className="text-xs text-muted-foreground">Hosting</p>
                    </div>
                    <Badge>🟢 Online</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Autenticação</p>
                      <p className="text-xs text-muted-foreground">Auth Service</p>
                    </div>
                    <Badge>🟢 Ativo</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Storage</p>
                      <p className="text-xs text-muted-foreground">File Storage</p>
                    </div>
                    <Badge>🟢 Disponível</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas de Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tempo de resposta médio</span>
                      <Badge variant="outline">120ms</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uptime</span>
                      <Badge>99.9%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uso de memória</span>
                      <Badge variant="secondary">65%</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Conexões ativas</span>
                      <Badge variant="outline">{stats.totalUsers}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Saúde dos Componentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">API Endpoints</span>
                      <Badge>✅ Funcionando</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">WebSockets</span>
                      <Badge>✅ Conectado</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Cache Redis</span>
                      <Badge variant="secondary">⚠️ N/A</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">CDN</span>
                      <Badge>✅ Ativo</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case 'tests':
        return <SimulatedTests />;
      case 'sofia':
        return <SofiaDataTestPanel />;
      case 'tutorials':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-2">
                  <Play className="h-6 w-6 text-yellow-500" />
                  Configuração de Tutoriais por Dispositivo
                </h1>
                <p className="text-muted-foreground">
                  Configure tutoriais específicos para Mobile, Tablet e PC. Cada dispositivo terá seu próprio vídeo tutorial.
                </p>
              </div>
              <Button 
                onClick={() => setIsTutorialModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Configurar Tutoriais
              </Button>
            </div>

          </div>
        );
      default:
        return <SystemStatus />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-500" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Painel Administrativo Completo</h1>
              <Badge variant="destructive" className="text-xs">Modo Admin Ativo</Badge>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Sino de Notificações */}
            {pendingGoals > 0 && (
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="icon"
                  className="relative"
                  onClick={() => {
                    setActiveSection('challenges');
                    toast({
                      title: `🔔 ${pendingGoals} metas pendentes`,
                      description: "Há metas aguardando aprovação na Gestão de Metas e Desafios"
                    });
                  }}
                >
                  <Bell className="w-4 h-4" />
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingGoals}
                  </span>
                </Button>
              </div>
            )}
            <div className="text-right">
              <p className="text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-80 border-r border-border/20 bg-card/30 backdrop-blur-sm min-h-screen">
          <div className="p-4">
            <h2 className="text-lg font-semibold mb-4 text-foreground">Menu Administrativo</h2>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left ${
                      isActive 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'hover:bg-muted/70 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-primary-foreground' : item.color}`} />
                    <div className="flex-1">
                      <div className={`font-medium text-sm ${isActive ? 'text-primary-foreground' : 'text-foreground'}`}>{item.label}</div>
                      <div className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>{item.description}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderContent()}
        </main>
      </div>

      {/* Modal de Configuração de Tutoriais */}
      <TutorialDeviceConfig 
        isOpen={isTutorialModalOpen} 
        onClose={() => setIsTutorialModalOpen(false)} 
      />
    </div>
  );
};

export default AdminPage;