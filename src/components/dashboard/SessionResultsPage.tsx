import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Share2, 
  Printer,
  BarChart3,
  Target,
  TrendingUp,
  Lightbulb,
  Shield,
  Heart,
  Brain,
  Activity,
  Clock,
  Calendar,
  User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { 
  RadarChart, 
  Radar, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

interface SessionResultsData {
  score: number;
  systems: Array<{
    name: string;
    score: number;
    color: string;
    icon: string;
    insights: string[];
  }>;
  timeline: Array<{
    date: string;
    score: number;
  }>;
  userProfile?: {
    full_name?: string;
    email?: string;
    phone?: string;
  };
}

interface SessionResultsPageProps {
  resultsData: SessionResultsData;
  onBack?: () => void;
}

const SessionResultsPage: React.FC<SessionResultsPageProps> = ({ 
  resultsData, 
  onBack 
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
      const html2canvas = (await import('html2canvas')).default;
      const jsPDF = (await import('jspdf')).default;
      
      if (!resultsRef.current) return;

      const canvas = await html2canvas(resultsRef.current, {
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
          text: `Confira meu score de saúde: ${resultsData.score.toFixed(1)}/10`,
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

  const scoreInfo = getScoreLevel(resultsData.score);

  // Preparar dados para gráficos
  const radarData = resultsData.systems.map(system => ({
    system: system.name.replace('Sistema ', ''),
    score: system.score,
    fullMark: 10
  }));

  const strongPoints = resultsData.systems.filter(s => s.score >= 8);
  const improvementAreas = resultsData.systems.filter(s => s.score < 7);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header com ações - não imprime */}
      <div className="bg-white dark:bg-gray-800 border-b print:hidden">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Resultados da Sessão
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Análise completa gerada em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
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
        </div>
      </div>

      {/* Conteúdo principal */}
      <div ref={resultsRef} className="max-w-7xl mx-auto p-6 print:p-8 print:max-w-none">
        {/* Header para impressão */}
        <div className="hidden print:block mb-8 border-b-2 border-gray-200 pb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Relatório de Saúde Completo
            </h1>
            <div className="text-gray-600 space-y-1">
              <p>Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>
              {resultsData.userProfile && (
                <>
                  <p><strong>Paciente:</strong> {resultsData.userProfile.full_name || 'Usuário'}</p>
                  {resultsData.userProfile.email && (
                    <p><strong>E-mail:</strong> {resultsData.userProfile.email}</p>
                  )}
                  {resultsData.userProfile.phone && (
                    <p><strong>Telefone:</strong> {resultsData.userProfile.phone}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Score Principal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="mb-8 border-2 shadow-lg print:shadow-none print:border">
            <CardHeader className="text-center pb-4">
              <CardTitle className="flex items-center justify-center gap-3 text-2xl">
                <Heart className="w-8 h-8 text-red-500" />
                Score Geral de Saúde
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className={`w-32 h-32 ${scoreInfo.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg print:shadow-none`}>
                <div className="text-center">
                  <div className={`text-3xl font-bold ${scoreInfo.textColor}`}>
                    {resultsData.score.toFixed(1)}
                  </div>
                  <div className={`text-sm ${scoreInfo.textColor} opacity-90`}>
                    /10.0
                  </div>
                </div>
              </div>
              <Badge className={`${scoreInfo.color} ${scoreInfo.textColor} text-lg px-4 py-2 print:text-black print:bg-gray-200`}>
                {scoreInfo.level}
              </Badge>
              <p className="text-gray-600 dark:text-gray-400 mt-3 max-w-md mx-auto">
                Sua avaliação geral de saúde baseada em múltiplos sistemas corporais.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Gráfico Radar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="print:shadow-none print:border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Análise por Sistemas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="system" />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Evolução Temporal */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="print:shadow-none print:border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Evolução Temporal
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultsData.timeline.length > 1 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={resultsData.timeline}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-64 text-gray-500">
                    <div className="text-center">
                      <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Complete mais sessões para ver sua evolução</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Análise Detalhada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Pontos Fortes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="h-full print:shadow-none print:border border-green-200 dark:border-green-800">
              <CardHeader className="bg-green-50 dark:bg-green-900/20 print:bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
                  <Shield className="w-5 h-5" />
                  🟩 Pontos Fortes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {strongPoints.length > 0 ? (
                  <div className="space-y-4">
                    {strongPoints.map((system, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4">
                        <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">
                          {system.icon} {system.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Score: {system.score.toFixed(1)}/10.0
                        </p>
                        <ul className="text-sm space-y-1">
                          {system.insights.map((insight, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300">
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Continue trabalhando para desenvolver pontos fortes em seus sistemas de saúde.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Áreas de Melhoria */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <Card className="h-full print:shadow-none print:border border-orange-200 dark:border-orange-800">
              <CardHeader className="bg-orange-50 dark:bg-orange-900/20 print:bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                  <Target className="w-5 h-5" />
                  🟦 Sugestões de Melhoria
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {improvementAreas.length > 0 ? (
                  <div className="space-y-4">
                    {improvementAreas.map((system, index) => (
                      <div key={index} className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">
                          {system.icon} {system.name}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          Score: {system.score.toFixed(1)}/10.0
                        </p>
                        <ul className="text-sm space-y-1">
                          {system.insights.map((insight, idx) => (
                            <li key={idx} className="text-gray-700 dark:text-gray-300">
                              • {insight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">
                    Excelente! Todos os seus sistemas estão em bom estado.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Footer para impressão */}
        <div className="hidden print:block mt-12 pt-6 border-t-2 border-gray-200 text-center text-sm text-gray-500">
          <p className="mb-2">
            <strong>Relatório gerado pela Plataforma de Saúde</strong>
          </p>
          <p className="mb-1">Este documento é confidencial e destinado exclusivamente ao paciente.</p>
          <p>Para orientações médicas específicas, consulte sempre um profissional de saúde qualificado.</p>
        </div>
      </div>
    </div>
  );
};

export default SessionResultsPage;