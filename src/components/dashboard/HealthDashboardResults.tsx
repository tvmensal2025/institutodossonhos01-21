import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Target, 
  TrendingUp, 
  Heart, 
  Download, 
  Share2, 
  Printer,
  BarChart3,
  PieChart,
  Zap,
  Shield,
  Calendar,
  Clock,
  Award,
  Sparkles
} from 'lucide-react';
import SessionManager from './SessionManager';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
// Imports dinâmicos para HTML2Canvas e jsPDF
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';

interface HealthSystemData {
  systemName: string;
  score: number;
  color: string;
  icon: string;
  symptomsCount: number;
  symptoms: string[];
}

interface EvolutionData {
  month: string;
  totalScore: number;
  [key: string]: number | string;
}

interface HealthDashboardResultsProps {
  data?: HealthSystemData[];
  totalScore?: number;
  evolutionData?: EvolutionData[];
  userProfile?: any;
  sessionData?: any;
  showSessionManager?: boolean;
}

const HealthDashboardResults: React.FC<HealthDashboardResultsProps> = ({
  data = [],
  totalScore = 0,
  evolutionData = [],
  userProfile,
  sessionData,
  showSessionManager = false
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Dados de exemplo se não fornecidos
  const mockHealthData: HealthSystemData[] = data.length > 0 ? data : [
    {
      systemName: "Sistema Cardiovascular",
      score: 8.5,
      color: "#ef4444",
      icon: "❤️",
      symptomsCount: 2,
      symptoms: ["Palpitações leves", "Pressão arterial normal"]
    },
    {
      systemName: "Sistema Respiratório", 
      score: 7.2,
      color: "#3b82f6",
      icon: "🫁",
      symptomsCount: 1,
      symptoms: ["Respiração normal"]
    },
    {
      systemName: "Sistema Nervoso",
      score: 6.8,
      color: "#8b5cf6",
      icon: "🧠",
      symptomsCount: 3,
      symptoms: ["Estresse moderado", "Sono irregular", "Concentração boa"]
    },
    {
      systemName: "Sistema Digestivo",
      score: 7.8,
      color: "#f59e0b",
      icon: "🫂",
      symptomsCount: 1,
      symptoms: ["Digestão normal"]
    },
    {
      systemName: "Sistema Imunológico",
      score: 8.1,
      color: "#10b981",
      icon: "🛡️",
      symptomsCount: 0,
      symptoms: ["Resistência boa"]
    }
  ];

  const finalScore = totalScore || mockHealthData.reduce((sum, item) => sum + item.score, 0) / mockHealthData.length;

  const getScoreLevel = (score: number) => {
    if (score >= 8) return { level: 'EXCELENTE', color: 'bg-green-500', textColor: 'text-green-50' };
    if (score >= 7) return { level: 'BOM', color: 'bg-blue-500', textColor: 'text-blue-50' };
    if (score >= 6) return { level: 'REGULAR', color: 'bg-yellow-500', textColor: 'text-yellow-50' };
    if (score >= 4) return { level: 'ATENÇÃO', color: 'bg-orange-500', textColor: 'text-orange-50' };
    return { level: 'CRÍTICO', color: 'bg-red-500', textColor: 'text-red-50' };
  };

  const handlePrint = async () => {
    setIsExporting(true);
    try {
      window.print();
      toast({
        title: "Impressão iniciada",
        description: "Seus resultados estão sendo preparados para impressão.",
      });
    } catch (error) {
      toast({
        title: "Erro na impressão",
        description: "Não foi possível imprimir o relatório.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    try {
      // Import dinâmico para reduzir bundle size
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      if (!dashboardRef.current) return;

      const canvas = await html2canvas(dashboardRef.current, {
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
      pdf.save(`relatorio-saude-${format(new Date(), 'dd-MM-yyyy')}.pdf`);

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
    } finally {
      setIsExporting(false);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Meu Relatório de Saúde',
          text: `Confira meu score de saúde: ${finalScore.toFixed(1)}/10`,
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

  const scoreInfo = getScoreLevel(finalScore);

  // Se deve mostrar o gerenciador de sessão, renderizar em tela cheia
  if (showSessionManager && sessionData) {
    return (
      <SessionManager
        sessionData={{
          responses: sessionData.responses || {},
          score: finalScore,
          insights: [
            "Análise completa dos sistemas de saúde realizada",
            "Dados coletados com precisão e segurança",
            "Recomendações personalizadas geradas",
            "Acompanhamento contínuo ativo"
          ]
        }}
        userProfile={userProfile}
        onClose={() => {/* implementar fechamento se necessário */}}
      />
    );
  }

  return (
    <div className="space-y-6 print:space-y-4">
      {/* Header com Ações */}
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Resultados da Avaliação</h1>
          <p className="text-muted-foreground">
            Avaliação realizada em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleShare}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Gerando...' : 'Baixar PDF'}
          </Button>
        </div>
      </div>

      {/* Dashboard Principal */}
      <div ref={dashboardRef} className="bg-white">
        {/* Header para Impressão */}
        <div className="hidden print:block mb-6 border-b pb-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Relatório de Saúde Completo</h1>
            <p className="text-gray-600">
              Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            {userProfile && (
              <p className="text-gray-600">Paciente: {userProfile.full_name || 'Usuário'}</p>
            )}
          </div>
        </div>

        {/* Score Principal */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-3 text-2xl">
              <Award className="w-8 h-8 text-yellow-500" />
              Score Geral de Saúde
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="relative inline-block">
              <div className={`w-32 h-32 ${scoreInfo.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${scoreInfo.textColor}`}>
                    {finalScore.toFixed(1)}
                  </div>
                  <div className={`text-sm ${scoreInfo.textColor} opacity-90`}>
                    /10.0
                  </div>
                </div>
              </div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />
            </div>
            <Badge className={`${scoreInfo.color} ${scoreInfo.textColor} text-lg px-4 py-2`}>
              {scoreInfo.level}
            </Badge>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto">
              Sua avaliação geral de saúde baseada em múltiplos sistemas corporais e sintomas reportados.
            </p>
          </CardContent>
        </Card>

        {/* Dashboard Detalhado - Gráficos Simples */}
        <div className="mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Barras por Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                Análise dos Sistemas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHealthData.map((system, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="text-lg">{system.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{system.systemName.replace('Sistema ', '')}</span>
                        <span className="text-sm font-bold">{system.score.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="h-2 rounded-full transition-all duration-500"
                          style={{ 
                            width: `${(system.score / 10) * 100}%`,
                            backgroundColor: system.color 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Evolução do Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Evolução do Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evolutionData.length > 0 ? (
                <div className="space-y-3">
                  {evolutionData.slice(-5).map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{item.month}</span>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-20 bg-gray-200 rounded-full h-2"
                        >
                          <div 
                            className="h-2 rounded-full bg-green-500 transition-all duration-500"
                            style={{ width: `${(item.totalScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold w-12">{item.totalScore.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>Complete mais sessões para ver sua evolução</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Análise Detalhada por Sistema */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {mockHealthData.map((system, index) => (
            <Card key={index} className="border hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{system.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{system.systemName}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: system.color }}
                      />
                      <span className="text-lg font-bold">{system.score.toFixed(1)}</span>
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span>Avaliação</span>
                    <span>{system.score >= 8 ? 'Excelente' : system.score >= 7 ? 'Bom' : system.score >= 6 ? 'Regular' : 'Atenção'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-500"
                      style={{ 
                        width: `${(system.score / 10) * 100}%`,
                        backgroundColor: system.color 
                      }}
                    />
                  </div>
                </div>
                
                {system.symptoms.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      Sintomas ({system.symptomsCount})
                    </div>
                    <div className="space-y-1">
                      {system.symptoms.map((symptom, idx) => (
                        <div key={idx} className="text-xs text-muted-foreground bg-gray-50 rounded px-2 py-1">
                          • {symptom}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Recomendações */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              Recomendações Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-green-700 flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Pontos Fortes
                </h4>
                <ul className="space-y-2 text-sm">
                  {mockHealthData
                    .filter(s => s.score >= 8)
                    .map((system, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <span>{system.systemName} está em excelente estado</span>
                      </li>
                    ))}
                </ul>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-orange-700 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  Áreas de Melhoria
                </h4>
                <ul className="space-y-2 text-sm">
                  {mockHealthData
                    .filter(s => s.score < 7)
                    .map((system, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange-500 mt-0.5">⚠</span>
                        <span>Acompanhar {system.systemName} mais de perto</span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer para Impressão */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-sm text-gray-500">
          <p>Relatório gerado pela Plataforma de Saúde - Este documento é confidencial</p>
          <p>Para mais informações, consulte seu médico ou profissional de saúde</p>
        </div>
      </div>
    </div>
  );
};

export default HealthDashboardResults;