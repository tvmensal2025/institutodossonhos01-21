import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Zap, DollarSign, CheckCircle, TrendingUp, Users, Calendar, Send } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface User {
  id: string;
  full_name: string;
  email: string;
}

const IntelligentReports: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [reportType, setReportType] = useState<'semanal' | 'quinzenal' | 'mensal' | 'semestral' | 'anual'>('semanal');
  const [channel, setChannel] = useState<'email' | 'whatsapp' | 'both'>('email');
  const [lastReportGenerated, setLastReportGenerated] = useState<string | null>(null);

  // Carregar usuários
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .order('full_name');

      if (error) throw error;

      const formattedUsers = data.map(user => ({
        id: user.user_id,
        full_name: user.full_name || 'Usuário sem nome',
        email: user.email || 'Email não informado'
      }));

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
    }
  };

  const generateReport = async (aiLevel: 'minimo' | 'meio' | 'maximo') => {
    if (!selectedUser) {
      toast.error('Selecione um usuário primeiro');
      return;
    }

    try {
      setLoading(true);
      
      const selectedUserData = users.find(u => u.id === selectedUser);
      if (!selectedUserData) {
        toast.error('Usuário não encontrado');
        return;
      }

      const levelMessages = {
        'maximo': '🚀 MÁXIMO - Gemini 1.5 Pro com 8192 tokens - Análises mais profundas e insights avançados',
        'meio': '⚡ MEIO - ChatGPT 4.1 com 4096 tokens - Equilibrio entre qualidade e velocidade', 
        'minimo': '💰 MÍNIMO - ChatGPT 4.1 Mini com 2048 tokens - Mais rápido e econômico'
      };

      const reportLabels = {
        'semanal': 'Semanal (7 dias)',
        'quinzenal': 'Quinzenal (15 dias)',
        'mensal': 'Mensal (30 dias)',
        'semestral': 'Semestral (180 dias)',
        'anual': 'Anual (365 dias)'
      };

      const customMessage = `📊 RELATÓRIO ${reportType.toUpperCase()} - ${levelMessages[aiLevel]}`;

      console.log(`🧪 Gerando relatório ${reportType} para ${selectedUserData.full_name} no nível ${aiLevel} via ${channel}`);

      if (channel === 'email' || channel === 'both') {
        console.log('📧 Enviando por email...');
        const { data: emailData, error: emailError } = await supabase.functions.invoke('send-weekly-email-report', {
          body: {
            customMessage,
            testMode: false,
            testUser: {
              user_id: selectedUserData.id,
              full_name: selectedUserData.full_name,
              email: selectedUserData.email
            },
            reportType,
            aiLevel
          }
        });

        if (emailError) {
          console.error('Erro no email:', emailError);
          throw new Error(`Erro no email: ${emailError.message}`);
        }

        console.log('✅ Email enviado:', emailData);
      }

      if (channel === 'whatsapp' || channel === 'both') {
        console.log('📱 Preparando para WhatsApp...');
        const { data: whatsappData, error: whatsappError } = await supabase.functions.invoke('send-whatsapp-report', {
          body: {
            customMessage: customMessage + ' - VIA WHATSAPP',
            testMode: false,
            testUser: {
              user_id: selectedUserData.id,
              full_name: selectedUserData.full_name,
              email: selectedUserData.email
            },
            reportType,
            aiLevel,
            whatsappNumber: "+5511999999999" // Deve ser configurado conforme necessário
          }
        });

        if (whatsappError) {
          console.error('Erro no WhatsApp:', whatsappError);
          throw new Error(`Erro no WhatsApp: ${whatsappError.message}`);
        }

        console.log('✅ WhatsApp preparado:', whatsappData);
      }

      const channelText = channel === 'both' ? 'email e WhatsApp' : channel === 'email' ? 'email' : 'WhatsApp';
      setLastReportGenerated(`${reportLabels[reportType]} para ${selectedUserData.full_name} via ${channelText} (nível ${aiLevel})`);
      
      toast.success(`🎉 Relatório ${reportLabels[reportType]} enviado para ${selectedUserData.full_name} via ${channelText} com nível ${aiLevel.toUpperCase()}!`);

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error(`❌ Erro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const levelInfo = {
    'maximo': {
      icon: <Brain className="h-5 w-5" />,
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      description: 'Gemini 1.5 Pro - 8192 tokens',
      features: ['Análises mais profundas', 'Insights avançados', 'Correlações complexas', 'Previsões inteligentes']
    },
    'meio': {
      icon: <Zap className="h-5 w-5" />,
      color: 'bg-blue-500', 
      textColor: 'text-blue-600',
      description: 'ChatGPT 4.1 - 4096 tokens',
      features: ['Análises detalhadas', 'Equilibrio qualidade/velocidade', 'Recomendações precisas', 'Bom custo-benefício']
    },
    'minimo': {
      icon: <DollarSign className="h-5 w-5" />,
      color: 'bg-green-500',
      textColor: 'text-green-600', 
      description: 'ChatGPT 4.1 Mini - 2048 tokens',
      features: ['Análises básicas', 'Mais rápido', 'Econômico', 'Respostas diretas']
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Relatórios Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>Sistema de Relatórios Avançado:</strong> Gere relatórios personalizados para qualquer usuário 
              com diferentes níveis de IA e múltiplas periodicidades.
            </AlertDescription>
          </Alert>

          {lastReportGenerated && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Último relatório: {lastReportGenerated}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Configurar Relatório
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="user-select">Selecionar Usuário</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha um usuário..." />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="report-type">Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="semanal">📊 Semanal (7 dias)</SelectItem>
                  <SelectItem value="quinzenal">📈 Quinzenal (15 dias)</SelectItem>
                  <SelectItem value="mensal">📅 Mensal (30 dias)</SelectItem>
                  <SelectItem value="semestral">📆 Semestral (180 dias)</SelectItem>
                  <SelectItem value="anual">🗓️ Anual (365 dias)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="channel">Canal de Envio</Label>
            <Select value={channel} onValueChange={(value: any) => setChannel(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">📧 Email</SelectItem>
                <SelectItem value="whatsapp">📱 WhatsApp</SelectItem>
                <SelectItem value="both">🚀 Email + WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cartões detalhados removidos no modo enxuto; deixar apenas ações simples */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Nível Máximo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => generateReport('maximo' as any)} disabled={loading || !selectedUser}>
              <Send className="h-4 w-4 mr-2" /> Gerar Relatório Máximo
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Nível Meio</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => generateReport('meio' as any)} disabled={loading || !selectedUser}>
              <Send className="h-4 w-4 mr-2" /> Gerar Relatório Meio
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Nível Mínimo</CardTitle>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" onClick={() => generateReport('minimo' as any)} disabled={loading || !selectedUser}>
              <Send className="h-4 w-4 mr-2" /> Gerar Relatório Mínimo
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Alert>
            <Brain className="h-4 w-4" />
            <AlertDescription>
              <strong>💡 Estratégia de Fidelização:</strong> Use relatórios personalizados para criar valor percebido. 
              Relatórios mais detalhados e frequentes aumentam o engajamento e fidelização dos usuários!
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default IntelligentReports;