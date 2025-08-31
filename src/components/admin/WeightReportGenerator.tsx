import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FileText, Mail, Download, User, Calendar } from 'lucide-react';

interface WeightReportGeneratorProps {
  userId?: string;
  userName?: string;
}

export const WeightReportGenerator = ({ userId, userName }: WeightReportGeneratorProps) => {
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<'weekly' | 'monthly'>('monthly');
  const [reportHTML, setReportHTML] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const generateReport = async (sendEmail: boolean = false) => {
    if (!userId) {
      toast.error('Selecione um usuário primeiro');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-weight-report', {
        body: {
          userId,
          reportType,
          sendEmail
        }
      });

      if (error) {
        toast.error('Erro ao gerar relatório');
        console.error('Erro:', error);
        return;
      }

      setReportHTML(data.reportHTML);
      setReportData(data.data);
      
      if (sendEmail) {
        toast.success('Relatório enviado por email!');
      } else {
        toast.success('Relatório gerado com sucesso!');
      }
    } catch (error) {
      toast.error('Erro ao gerar relatório');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!reportHTML) return;

    const blob = new Blob([reportHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-pesagem-${userName || 'usuario'}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-400" />
          Relatório Detalhado de Pesagem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {userName && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <User className="h-4 w-4" />
            <span>Usuário: {userName}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Período do Relatório</label>
            <Select value={reportType} onValueChange={(value: 'weekly' | 'monthly') => setReportType(value)}>
              <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Últimos 7 dias
                  </div>
                </SelectItem>
                <SelectItem value="monthly">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Últimos 30 dias
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={() => generateReport(false)}
              disabled={loading || !userId}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Gerando...' : 'Gerar Relatório'}
            </Button>

            <Button
              onClick={() => generateReport(true)}
              disabled={loading || !userId}
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-600/10"
            >
              <Mail className="h-4 w-4 mr-2" />
              Gerar e Enviar
            </Button>

            <Button
              onClick={downloadReport}
              disabled={!reportHTML}
              variant="outline"
              className="border-purple-600 text-purple-400 hover:bg-purple-600/10"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {reportData && (
            <div className="grid grid-cols-3 gap-4 p-4 bg-gray-800 rounded-lg">
              <div className="text-center">
                <div className="text-blue-400 font-bold text-lg">{reportData.measurementCount}</div>
                <div className="text-xs text-gray-400">Medições</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 font-bold text-lg">{reportData.conversationCount}</div>
                <div className="text-xs text-gray-400">Conversas</div>
              </div>
              <div className="text-center">
                <div className="text-yellow-400 font-bold text-lg">
                  {reportData.lastMeasurement ? `${reportData.lastMeasurement.peso_kg}kg` : 'N/A'}
                </div>
                <div className="text-xs text-gray-400">Último Peso</div>
              </div>
            </div>
          )}

          {reportHTML && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full border-gray-600 text-gray-300">
                  📊 Visualizar Relatório Completo
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
                <DialogHeader>
                  <DialogTitle>Relatório de Pesagem - {userName}</DialogTitle>
                </DialogHeader>
                <div className="overflow-y-auto max-h-[80vh]">
                  <iframe
                    srcDoc={reportHTML}
                    style={{ width: '100%', height: '600px', border: 'none' }}
                    title="Relatório de Pesagem"
                  />
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="text-xs text-gray-400 space-y-1">
          <p>📊 <strong>Inclui:</strong> IMC, Gordura Corporal, Água, Gordura Visceral, Músculo, Metabolismo, Massa Óssea</p>
          <p>💕 <strong>Mensagens:</strong> Sof.ia (carinhosa) + Dr. Vita (análise médica)</p>
          <p>📈 <strong>Gráficos:</strong> Evolução temporal de todos os indicadores</p>
        </div>
      </CardContent>
    </Card>
  );
};