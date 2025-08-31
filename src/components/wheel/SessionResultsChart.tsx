import React, { useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer, Share2, User, Calendar, Phone, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SessionResultsChartProps {
  userProfile?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
  sessionData: {
    score: number;
    systems: Array<{
      name: string;
      score: number;
      color: string;
      icon: string;
      insights: string[];
    }>;
    timeline?: Array<{
      date: string;
      score: number;
    }>;
  };
  onBack?: () => void;
}

export const SessionResultsChart: React.FC<SessionResultsChartProps> = ({
  userProfile,
  sessionData,
  onBack
}) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handlePrint = () => {
    window.print();
    toast({
      title: "Imprimindo relatório",
      description: "Seu relatório está sendo preparado para impressão.",
    });
  };

  const handleDownload = async () => {
    try {
      // Import dinâmico para reduzir bundle size
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      if (!chartRef.current) return;

      const canvas = await html2canvas(chartRef.current, {
        scale: 2,
        allowTaint: true,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`relatorio-sessao-${new Date().toISOString().split('T')[0]}.pdf`);

      toast({
        title: "Download concluído",
        description: "Seu relatório foi baixado com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o relatório.",
        variant: "destructive"
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Meu Relatório de Sessão',
          text: `Confira meu score: ${sessionData.score.toFixed(1)}/10`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link copiado",
          description: "Link do relatório copiado para a área de transferência.",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao compartilhar",
        description: "Não foi possível compartilhar o relatório.",
        variant: "destructive"
      });
    }
  };

  const getScoreLevel = (score: number) => {
    if (score >= 8) return { level: 'EXCELENTE', color: 'bg-green-500', textColor: 'text-green-50' };
    if (score >= 7) return { level: 'BOM', color: 'bg-blue-500', textColor: 'text-blue-50' };
    if (score >= 6) return { level: 'REGULAR', color: 'bg-yellow-500', textColor: 'text-yellow-50' };
    if (score >= 4) return { level: 'ATENÇÃO', color: 'bg-orange-500', textColor: 'text-orange-50' };
    return { level: 'CRÍTICO', color: 'bg-red-500', textColor: 'text-red-50' };
  };

  const scoreInfo = getScoreLevel(sessionData.score);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      {/* Header com Ações */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-white rounded-lg shadow-sm p-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resultados da Sessão</h1>
            <p className="text-gray-600">
              Sessão realizada em {new Date().toLocaleDateString('pt-BR')}
            </p>
          </div>
          <div className="flex gap-2">
            {onBack && (
              <Button onClick={onBack} variant="outline">
                ← Voltar
              </Button>
            )}
            <Button onClick={handleShare} variant="outline">
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Baixar PDF
            </Button>
          </div>
        </div>
      </div>

      {/* Dashboard Principal */}
      <div ref={chartRef} className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg">
        {/* Header para Impressão */}
        <div className="print:block hidden p-6 border-b">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Sessão Completo</h1>
            <p className="text-gray-600 mt-2">
              Gerado em {new Date().toLocaleString('pt-BR')}
            </p>
            {userProfile && (
              <p className="text-gray-700 mt-1">Paciente: {userProfile.full_name || 'Usuário'}</p>
            )}
          </div>
        </div>

        {/* Informações do Usuário */}
        {userProfile && (
          <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Dados do Paciente
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <strong>Nome:</strong> {userProfile.full_name || 'Não informado'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <strong>Email:</strong> {userProfile.email || 'Não informado'}
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <strong>Telefone:</strong> {userProfile.phone || 'Não informado'}
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Dados da Sessão
                </h2>
                <div className="space-y-2 text-sm">
                  <div><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</div>
                  <div><strong>Hora:</strong> {new Date().toLocaleTimeString('pt-BR')}</div>
                  <div><strong>Tipo:</strong> Avaliação Completa</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Score Principal */}
        <div className="p-6">
          <Card className="border-2 border-dashed border-gray-200">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl text-gray-900 flex items-center justify-center gap-2">
                <User className="w-6 h-6" />
                Score Geral da Sessão
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="relative inline-block">
                <div className="w-40 h-40 mx-auto mb-4 relative">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-gray-200"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke={scoreInfo.color.includes('green') ? '#10b981' : 
                             scoreInfo.color.includes('blue') ? '#3b82f6' :
                             scoreInfo.color.includes('yellow') ? '#f59e0b' :
                             scoreInfo.color.includes('orange') ? '#f97316' : '#ef4444'}
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${sessionData.score * 28.27} 282.7`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900">
                        {sessionData.score.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-500">
                        /10.0
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${scoreInfo.color} ${scoreInfo.textColor}`}>
                {scoreInfo.level}
              </div>
              <p className="text-gray-600 mt-4 max-w-md mx-auto">
                Sua avaliação geral da sessão baseada em múltiplos fatores e respostas fornecidas.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Análise Detalhada por Sistema */}
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Análise Detalhada</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessionData.systems.map((system, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{system.icon}</div>
                      <div>
                        <CardTitle className="text-sm font-medium text-gray-900">
                          {system.name}
                        </CardTitle>
                        <div className="text-lg font-bold" style={{ color: system.color }}>
                          {system.score.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Avaliação</span>
                      <span className={`font-medium ${
                        system.score >= 8 ? 'text-green-600' : 
                        system.score >= 7 ? 'text-blue-600' :
                        system.score >= 6 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {system.score >= 8 ? 'Excelente' : 
                         system.score >= 7 ? 'Bom' : 
                         system.score >= 6 ? 'Regular' : 'Atenção'}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{ 
                          width: `${(system.score / 10) * 100}%`,
                          backgroundColor: system.color 
                        }}
                      />
                    </div>
                  </div>
                  
                  {system.insights && system.insights.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-xs font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Insights
                      </h4>
                      <div className="space-y-1">
                        {system.insights.map((insight, idx) => (
                          <div key={idx} className="text-xs text-gray-600 leading-relaxed">
                            • {insight}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recomendações */}
        <div className="p-6 border-t bg-gray-50">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recomendações Personalizadas</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Card className="border-green-200 bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-green-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    Pontos Fortes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionData.systems
                    .filter(s => s.score >= 8)
                    .map((system, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-green-700 mb-2">
                        <span>✓</span>
                        <span>{system.name} está em excelente estado</span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-orange-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Áreas de Melhoria
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {sessionData.systems
                    .filter(s => s.score < 7)
                    .map((system, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-orange-700 mb-2">
                        <span>⚠</span>
                        <span>Acompanhar {system.name} mais de perto</span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Footer para Impressão */}
        <div className="print:block hidden p-6 border-t text-center text-xs text-gray-500">
          <p>Relatório gerado pela Plataforma - Este documento é confidencial</p>
          <p>Para mais informações, consulte seu profissional responsável</p>
        </div>
      </div>
    </div>
  );
};

export default SessionResultsChart;