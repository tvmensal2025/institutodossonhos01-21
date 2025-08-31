import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import DrVitalIntegratedDashboard from '@/components/dashboard/DrVitalIntegratedDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Settings, 
  Download, 
  Share2, 
  Calendar,
  Clock,
  Activity,
  Heart,
  Brain,
  MessageCircle,
  Target,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const DrVitalPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

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

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleExportData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Gerar relatório completo
      const { data, error } = await supabase.functions.invoke('generate-dr-vital-report', {
        body: {
          userId: user.id,
          reportType: 'complete'
        }
      });

      if (error) throw error;

      // Criar arquivo para download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `dr-vital-report-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "Relatório exportado",
        description: "Seus dados foram exportados com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast({
        title: "Erro ao exportar",
        description: "Não foi possível exportar os dados. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleShareReport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Gerar link compartilhável
      const { data, error } = await supabase.functions.invoke('create-shareable-report', {
        body: {
          userId: user.id,
          reportType: 'dr-vital'
        }
      });

      if (error) throw error;

      // Copiar link para clipboard
      await navigator.clipboard.writeText(data.shareUrl);
      
      toast({
        title: "Link copiado",
        description: "Link do relatório copiado para a área de transferência!",
      });
    } catch (error) {
      console.error('Erro ao compartilhar relatório:', error);
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível gerar o link compartilhável.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-2 xs:px-3 sm:px-4 py-4 xs:py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-6 xs:mb-8 gap-4 xs:gap-6">
          <div className="flex items-center space-x-3 xs:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToDashboard}
              className="flex items-center space-x-2 h-10 xs:h-12 px-3 xs:px-4 text-base xs:text-lg"
            >
              <ArrowLeft className="w-5 h-5 xs:w-6 xs:h-6" />
              <span>Voltar ao Dashboard</span>
            </Button>
          </div>
          
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportData}
              className="flex items-center justify-center space-x-2 h-10 xs:h-12 px-3 xs:px-4 text-base xs:text-lg"
            >
              <Download className="w-5 h-5 xs:w-6 xs:h-6" />
              <span>Exportar</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareReport}
              className="flex items-center justify-center space-x-2 h-10 xs:h-12 px-3 xs:px-4 text-base xs:text-lg"
            >
              <Share2 className="w-5 h-5 xs:w-6 xs:h-6" />
              <span>Compartilhar</span>
            </Button>
          </div>
        </div>

        {/* Informações do Usuário */}
        <div className="mb-6 xs:mb-8">
          <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-4 xs:gap-6">
            <div>
              <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900">
                Olá, {user.user_metadata?.full_name || user.email?.split('@')[0] || 'Usuário'}!
              </h1>
              <p className="text-base xs:text-lg text-muted-foreground mt-2 xs:mt-3">
                Bem-vindo ao seu dashboard personalizado do Dr. Vital
              </p>
            </div>
            
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 xs:gap-4">
              <Badge variant="outline" className="flex items-center justify-center space-x-2 px-3 xs:px-4 py-2 text-base xs:text-lg">
                <Calendar className="w-5 h-5 xs:w-6 xs:h-6" />
                <span>{new Date().toLocaleDateString('pt-BR')}</span>
              </Badge>
              
              <Badge variant="outline" className="flex items-center justify-center space-x-2 px-3 xs:px-4 py-2 text-base xs:text-lg">
                <Clock className="w-5 h-5 xs:w-6 xs:h-6" />
                <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Cards de Resumo Rápido */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 mb-6 xs:mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2 xs:pb-3 p-3 xs:p-4">
              <CardTitle className="text-base xs:text-lg flex items-center space-x-2">
                <Activity className="w-5 h-5 xs:w-6 xs:h-6" />
                <span>Score de Saúde</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 xs:p-4">
              <div className="text-xl xs:text-2xl sm:text-3xl font-bold">85/100</div>
              <p className="text-sm xs:text-base opacity-90">Excelente!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2 xs:pb-3 p-3 xs:p-4">
              <CardTitle className="text-base xs:text-lg flex items-center space-x-2">
                <Heart className="w-5 h-5 xs:w-6 xs:h-6" />
                <span>Dias Ativo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 xs:p-4">
              <div className="text-xl xs:text-2xl sm:text-3xl font-bold">23</div>
              <p className="text-sm xs:text-base opacity-90">Streak atual</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2 xs:pb-3 p-3 xs:p-4">
              <CardTitle className="text-base xs:text-lg flex items-center space-x-2">
                <Brain className="w-5 h-5 xs:w-6 xs:h-6" />
                <span>Análises</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 xs:p-4">
              <div className="text-xl xs:text-2xl sm:text-3xl font-bold">12</div>
              <p className="text-sm xs:text-base opacity-90">Este mês</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2 xs:pb-3 p-3 xs:p-4">
              <CardTitle className="text-base xs:text-lg flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 xs:w-6 xs:h-6" />
                <span>Conversas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 xs:p-4">
              <div className="text-xl xs:text-2xl sm:text-3xl font-bold">47</div>
              <p className="text-sm xs:text-base opacity-90">Com Sofia</p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Integrado */}
        <DrVitalIntegratedDashboard />

        {/* Seção de Ações Rápidas */}
        <div className="mt-6 xs:mt-8">
          <Card>
            <CardHeader className="p-4 xs:p-5 sm:p-6">
              <CardTitle className="flex items-center space-x-2 text-lg xs:text-xl">
                <Settings className="w-6 h-6 xs:w-7 xs:h-7" />
                <span>Ações Rápidas</span>
              </CardTitle>
              <CardDescription className="text-base xs:text-lg">
                Acesse rapidamente as funcionalidades mais importantes
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 xs:p-5 sm:p-6">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 xs:gap-4">
                <Button
                  variant="outline"
                  className="h-16 xs:h-20 flex flex-col items-center justify-center space-y-2 text-base xs:text-lg"
                  onClick={() => navigate('/chat')}
                >
                  <MessageCircle className="w-6 h-6 xs:w-7 xs:h-7" />
                  <span>Conversar com Sofia</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 xs:h-20 flex flex-col items-center justify-center space-y-2 text-base xs:text-lg"
                  onClick={() => navigate('/weight')}
                >
                  <Activity className="w-6 h-6 xs:w-7 xs:h-7" />
                  <span>Registrar Peso</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 xs:h-20 flex flex-col items-center justify-center space-y-2 text-base xs:text-lg"
                  onClick={() => navigate('/missions')}
                >
                  <Target className="w-6 h-6 xs:w-7 xs:h-7" />
                  <span>Missões Diárias</span>
                </Button>

                <Button
                  variant="outline"
                  className="h-16 xs:h-20 flex flex-col items-center justify-center space-y-2 text-base xs:text-lg"
                  onClick={() => navigate('/progress')}
                >
                  <TrendingUp className="w-6 h-6 xs:w-7 xs:h-7" />
                  <span>Meu Progresso</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DrVitalPage; 