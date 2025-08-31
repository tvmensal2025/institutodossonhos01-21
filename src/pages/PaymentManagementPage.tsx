import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Users, 
  TrendingUp, 
  Settings, 
  BookOpen, 
  TestTube, 
  Key,
  DollarSign,
  UserPlus,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PaymentStats {
  monthlyRevenue: number;
  activeSubscribers: number;
  conversionRate: number;
}

export default function PaymentManagementPage() {
  const [stats, setStats] = useState<PaymentStats>({
    monthlyRevenue: 0,
    activeSubscribers: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentStats();
  }, []);

  const loadPaymentStats = async () => {
    try {
      // Buscar assinaturas ativas
      const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('status', 'active');

      if (error) throw error;

      const activeCount = subscriptions?.length || 0;
      
      // Calcular receita mensal estimada
      const monthlyRevenue = activeCount > 0 
        ? (activeCount * 29.90) // Assumindo plano básico como média
        : 0;

      // Calcular taxa de conversão (exemplo simplificado)
      const conversionRate = activeCount > 0 ? ((activeCount / 100) * 100) : 0;

      setStats({
        monthlyRevenue,
        activeSubscribers: activeCount,
        conversionRate: Math.min(conversionRate, 100)
      });

    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAsaasDocumentation = () => {
    window.open('https://docs.asaas.com/', '_blank');
  };

  const openAsaasSandbox = () => {
    window.open('https://sandbox.asaas.com/login', '_blank');
  };

  const openAsaasKeys = () => {
    window.open('https://www.asaas.com/api/keys', '_blank');
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Pagamentos</h1>
            <p className="text-muted-foreground mt-2">
              Integração com Asaas e controle de assinaturas
            </p>
          </div>
          <Button 
            onClick={() => window.open('https://www.asaas.com/', '_blank')}
            className="bg-primary hover:bg-primary/90"
          >
            <Key className="w-4 h-4 mr-2" />
            Acessar Asaas
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Receita Mensal</p>
                  <p className="text-2xl font-bold">
                    {loading ? '...' : `R$ ${stats.monthlyRevenue.toFixed(2).replace('.', ',')}`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Este mês</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Assinantes Ativos</p>
                  <p className="text-2xl font-bold">
                    {loading ? '...' : stats.activeSubscribers}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Planos premium</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taxa de Conversão</p>
                  <p className="text-2xl font-bold">
                    {loading ? '...' : `${stats.conversionRate.toFixed(1)}%`}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Último mês</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Configuração do Asaas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Configuração do Asaas</CardTitle>
            <p className="text-muted-foreground">
              Configure sua integração com o gateway de pagamento Asaas.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button 
                variant="outline" 
                onClick={openAsaasDocumentation}
                className="flex items-center gap-2"
              >
                <BookOpen className="w-4 h-4" />
                📚 Documentação
              </Button>
              
              <Button 
                variant="outline" 
                onClick={openAsaasSandbox}
                className="flex items-center gap-2"
              >
                <TestTube className="w-4 h-4" />
                🔧 Sandbox
              </Button>
              
              <Button 
                onClick={openAsaasKeys}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90"
              >
                <Key className="w-4 h-4" />
                🔑 Chaves API
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Planos Disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Planos Disponíveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Plano Básico */}
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Plano Básico</h3>
                    <p className="text-sm text-muted-foreground">
                      Acesso aos recursos básicos
                    </p>
                  </div>
                  <Badge variant="secondary">Básico</Badge>
                </div>
                
                <div className="text-2xl font-bold">R$ 29,90/mês</div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    ✓ <span>Sofia: Análises básicas de refeições</span>
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ <span>Dr. Vital: Consultas limitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ <span>Relatórios mensais</span>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </div>

              {/* Plano Premium */}
              <div className="border rounded-lg p-6 space-y-4 bg-primary/5 border-primary/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-semibold">Plano Premium</h3>
                    <p className="text-sm text-muted-foreground">
                      Acesso completo + coaching
                    </p>
                  </div>
                  <Badge className="bg-primary">Popular</Badge>
                </div>
                
                <div className="text-2xl font-bold">R$ 97,90/mês</div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    ✓ <span>Sofia: Análises ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ <span>Dr. Vital: Consultas ilimitadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ <span>Relatórios semanais</span>
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ <span>Coaching personalizado</span>
                  </div>
                  <div className="flex items-center gap-2">
                    ✓ <span>Suporte prioritário</span>
                  </div>
                </div>
                
                <Button className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Análise de Pagamentos Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <UserPlus className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Novo assinante Premium</p>
                    <p className="text-sm text-muted-foreground">Plano Premium ativado</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-green-600">+R$ 97,90</p>
                  <p className="text-sm text-muted-foreground">há 2 horas</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Pagamento processado</p>
                    <p className="text-sm text-muted-foreground">PIX - Plano Básico</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-blue-600">+R$ 29,90</p>
                  <p className="text-sm text-muted-foreground">há 1 dia</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Renovação automática</p>
                    <p className="text-sm text-muted-foreground">Plano Premium renovado</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-purple-600">+R$ 97,90</p>
                  <p className="text-sm text-muted-foreground">há 3 dias</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}