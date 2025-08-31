import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Mail, 
  Send, 
  Calendar, 
  User,
  FileText,
  Loader2,
  CheckCircle,
  AlertCircle,
  Download,
  MessageCircle
} from 'lucide-react';

const MonthlyReportManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('30days');
  const [targetEmail, setTargetEmail] = useState('tvmensal2025@gmail.com');
  const [testMode, setTestMode] = useState(true);
  const [lastReport, setLastReport] = useState<any>(null);

  const generateAndSendReport = async () => {
    setLoading(true);
    
    try {
      // Buscar usuários para demonstração (ou usuário específico se fornecido)
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name')
        .limit(1);

      if (!users || users.length === 0) {
        throw new Error('Nenhum usuário encontrado para gerar relatório');
      }

      // Usar primeiro usuário como exemplo para teste
      const testUser = {
        ...users[0],
        email: targetEmail, // Substituir email pelo email de teste
        full_name: users[0]?.full_name || 'Usuário'
      };

      console.log('Gerando relatório de 30 dias para:', testUser);

      // Chamar função que gera relatório de 30 dias
      const { data, error } = await supabase.functions.invoke('generate-weight-report', {
        body: {
          userId: testUser.id,
          reportType: '30days',
          sendEmail: true
        }
      });

      if (error) {
        console.error('Erro na edge function:', error);
        throw new Error(`Erro ao gerar relatório: ${error.message}`);
      }

      setLastReport({
        success: true,
        email: targetEmail,
        reportType: '30 dias',
        timestamp: new Date().toLocaleString('pt-BR'),
        data: data.data
      });

      toast({
        title: "✅ Relatório Enviado!",
        description: `Relatório de 30 dias enviado para ${targetEmail}`
      });

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      
      setLastReport({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      });

      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendWeeklyReportForUser = async () => {
    setLoading(true);
    
    try {
      // Buscar usuário para teste
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name')
        .limit(1);

      if (!users || users.length === 0) {
        throw new Error('Nenhum usuário encontrado');
      }

      const testUser = {
        ...users[0],
        email: targetEmail
      };

      // Enviar relatório semanal personalizado
      const { data, error } = await supabase.functions.invoke('send-weekly-email-report', {
        body: {
          testMode: true,
          testUser: testUser,
          customMessage: "🔍 TESTE DAS MELHORIAS: Este relatório deve incluir feedback do Dr. Vita, gráfico de evolução do peso e energia (não humor)."
        }
      });

      if (error) {
        throw new Error(`Erro: ${error.message}`);
      }

      setLastReport({
        success: true,
        email: targetEmail,
        reportType: 'Semanal Expandido (30 dias de dados)',
        timestamp: new Date().toLocaleString('pt-BR'),
        data: data
      });

      toast({
        title: "✅ Relatório Enviado!",
        description: `Relatório com dados de 30 dias enviado para ${targetEmail}`
      });

    } catch (error: any) {
      setLastReport({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      });

      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendWhatsAppReport = async () => {
    setLoading(true);
    
    try {
      const { data: users } = await supabase
        .from('profiles')
        .select('id, full_name')
        .limit(1);

      if (!users || users.length === 0) {
        throw new Error('Nenhum usuário encontrado');
      }

      const testUser = {
        ...users[0],
        email: targetEmail
      };

      // Gerar relatório para WhatsApp
      const { data, error } = await supabase.functions.invoke('send-whatsapp-report', {
        body: {
          testMode: true,
          testUser: testUser,
          whatsappNumber: '+5511999999999',
          customMessage: "🔍 RELATÓRIO VIA WHATSAPP: Dr. Vita + Sof.ia + Gráficos de evolução!"
        }
      });

      if (error) {
        throw new Error(`Erro: ${error.message}`);
      }

      setLastReport({
        success: true,
        email: targetEmail,
        reportType: 'WhatsApp HTML Report',
        timestamp: new Date().toLocaleString('pt-BR'),
        data: data,
        whatsappReady: true
      });

      // Abrir o HTML em nova aba para visualização
      if (data?.results?.[0]?.html_content) {
        const newWindow = window.open();
        if (newWindow) {
          newWindow.document.write(data.results[0].html_content);
          newWindow.document.close();
        }
      }

      toast({
        title: "✅ Relatório WhatsApp Gerado!",
        description: `HTML pronto para envio via WhatsApp. Verifique a nova aba.`
      });

    } catch (error: any) {
      setLastReport({
        success: false,
        error: error.message,
        timestamp: new Date().toLocaleString('pt-BR')
      });

      toast({
        title: "❌ Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Relatórios Mensais de 30 Dias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Configurações */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email de Destino</Label>
              <Input
                id="email"
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                placeholder="tvmensal2025@gmail.com"
              />
            </div>
            
            <div>
              <Label>Tipo de Relatório</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30days">Completo 30 Dias</SelectItem>
                  <SelectItem value="weekly_extended">Semanal com 30 dias de dados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Status dos Relatórios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Relatório Detalhado</span>
              <Badge variant="outline" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Ativo
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Mail className="h-4 w-4" />
              <span className="text-sm">Sistema Email</span>
              <Badge variant="outline" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Resend
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 p-3 border rounded-lg">
              <Calendar className="h-4 w-4" />
              <span className="text-sm">Dados 30 Dias</span>
              <Badge variant="outline" className="ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Disponível
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Botões de Ação */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button 
              onClick={generateAndSendReport}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Relatório Email 30 Dias
            </Button>
            
            <Button 
              variant="outline" 
              onClick={sendWeeklyReportForUser}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Email Semanal + 30 Dias
            </Button>

            <Button 
              variant="secondary" 
              onClick={sendWhatsAppReport}
              disabled={loading}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
              WhatsApp HTML Report
            </Button>
          </div>

          {/* Resultado do Último Relatório */}
          {lastReport && (
            <Card className={`mt-4 ${lastReport.success ? 'border-green-200' : 'border-red-200'}`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {lastReport.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600" />
                  )}
                  {lastReport.success ? 'Relatório Enviado!' : 'Erro no Envio'}
                  <Badge variant="outline" className="ml-auto">
                    {lastReport.timestamp}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {lastReport.success ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Email:</Label>
                        <p className="text-lg font-bold text-green-600">{lastReport.email}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm font-medium">Tipo:</Label>
                        <p className="text-sm">{lastReport.reportType}</p>
                      </div>
                    </div>
                    
                    {lastReport.data && (
                      <div>
                        <Label className="text-sm font-medium">Dados Incluídos:</Label>
                        <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <p className="text-sm">
                            📊 {lastReport.data.measurementCount || 0} medições de peso
                          </p>
                          <p className="text-sm">
                            💬 {lastReport.data.conversationCount || 0} conversas registradas
                          </p>
                          {lastReport.data.lastMeasurement && (
                            <p className="text-sm">
                              ⚖️ Último peso: {lastReport.data.lastMeasurement.peso_kg}kg
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <Label className="text-sm font-medium">Erro:</Label>
                    <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{lastReport.error}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informações sobre o Relatório */}
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-800">📊 Conteúdo do Relatório de 30 Dias</p>
              <ul className="text-blue-700 mt-1 list-disc list-inside space-y-1">
                <li>Gráficos de evolução de peso, IMC e composição corporal</li>
                <li>Análise de tendências e variações</li>
                <li>Mensagens personalizadas da Sof.ia e Dr. Vita</li>
                <li>Dados de bioimpedância e metabolismo</li>
                <li>Estatísticas de hábitos (água, sono, exercício)</li>
                <li>Resumo de missões diárias e conquistas</li>
              </ul>
            </div>
          </div>

          {/* Informações WhatsApp e Domínio */}
          <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <MessageCircle className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-green-800">📱 Integração WhatsApp + Domínio Personalizado</p>
              <ul className="text-green-700 mt-1 list-disc list-inside space-y-1">
                <li>Relatórios HTML otimizados para WhatsApp</li>
                <li>Design responsivo para mobile</li>
                <li>Pronto para seu domínio Registro.br + Hostgator + Cloudflare</li>
                <li>Feedback Dr. Vita + Mensagens Sof.ia + Gráficos de evolução</li>
                <li>Pode ser integrado com N8N para automação</li>
                <li>HTML pode ser enviado diretamente via API WhatsApp Business</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MonthlyReportManager;