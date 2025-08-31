import React, { ReactNode, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Share2, Download, Printer, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export interface WheelArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  score?: number;
}

export interface BaseWheelStructureProps {
  title: string;
  subtitle: string;
  emoji: string;
  areas: WheelArea[];
  responses: Record<string, number>;
  totalScore?: number;
  children?: ReactNode;
  userProfile?: any;
  sessionData?: any;
  onReset?: () => void;
  wheelComponent: ReactNode;
  showActions?: boolean;
  showPrintView?: boolean;
  onTogglePrintView?: () => void;
}

export const BaseWheelStructure: React.FC<BaseWheelStructureProps> = ({
  title,
  subtitle,
  emoji,
  areas,
  responses,
  totalScore,
  children,
  userProfile,
  sessionData,
  onReset,
  wheelComponent,
  showActions = true,
  showPrintView = false,
  onTogglePrintView
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Calcular score total se não fornecido
  const finalScore = totalScore || (Object.keys(responses).length > 0 
    ? Object.values(responses).reduce((sum, score) => sum + score, 0) / Object.values(responses).length
    : 0);

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
      pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${format(new Date(), 'dd-MM-yyyy')}.pdf`);

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
          title: `Meu ${title}`,
          text: `Confira meu resultado: ${finalScore.toFixed(1)}/10`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header com Ações */}
        {showActions && (
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {emoji} {title} - Resultados
              </h1>
              <p className="text-slate-300">
                Avaliação realizada em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div className="flex gap-2">
              {onTogglePrintView && (
                <Button
                  variant="outline"
                  onClick={onTogglePrintView}
                  className="flex items-center gap-2"
                >
                  {showPrintView ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {showPrintView ? 'Modo Normal' : 'Visualizar Impressão'}
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Compartilhar
              </Button>
              <Button
                variant="outline"
                onClick={handlePrint}
                className="flex items-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </Button>
              <Button
                onClick={handleDownloadPDF}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                {isExporting ? 'Gerando...' : 'Baixar PDF'}
              </Button>
            </div>
          </div>
        )}

        {/* Conteúdo Principal */}
        <div ref={resultsRef} className={showPrintView ? 'bg-white text-black p-8' : ''}>
          {/* Header para Impressão */}
          {showPrintView && (
            <div className="text-center mb-8 print:block hidden">
              <h1 className="text-2xl font-bold text-black mb-2">
                {title} - Relatório Completo
              </h1>
              <p className="text-gray-600 mb-4">
                Gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              {userProfile && (
                <p className="text-gray-700 font-medium">
                  Usuário: {userProfile.full_name || 'Usuário'}
                </p>
              )}
            </div>
          )}

          {/* Score Principal */}
          <Card className={`mb-8 ${showPrintView ? 'border-gray-300 shadow-none' : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700'}`}>
            <CardHeader className="text-center">
              <CardTitle className={`flex items-center justify-center gap-2 text-2xl ${showPrintView ? 'text-black' : 'text-white'}`}>
                <span className="text-3xl">{emoji}</span>
                Score Geral - {title}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${showPrintView ? 'bg-gray-100' : 'bg-slate-700'} mb-4`}>
                  <div className="text-center">
                    <div className={`text-3xl font-bold ${showPrintView ? 'text-black' : 'text-white'}`}>
                      {finalScore.toFixed(1)}
                    </div>
                    <div className={`text-sm ${showPrintView ? 'text-gray-600' : 'text-slate-400'}`}>
                      /10.0
                    </div>
                  </div>
                </div>
              </div>
              <Badge className={`${scoreInfo.color} ${scoreInfo.textColor} text-lg px-4 py-2`}>
                {scoreInfo.level}
              </Badge>
              <p className={`mt-4 ${showPrintView ? 'text-gray-700' : 'text-slate-300'}`}>
                {subtitle}
              </p>
            </CardContent>
          </Card>

          {/* Roda Visual */}
          <Card className={`mb-8 ${showPrintView ? 'border-gray-300 shadow-none' : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700'}`}>
            <CardContent className="p-8">
              <div className="flex justify-center">
                {wheelComponent}
              </div>
            </CardContent>
          </Card>

          {/* Análise Detalhada por Área */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {areas.map((area) => {
              const score = responses[area.id] || 0;
              const percentage = (score / 10) * 100;
              
              return (
                <Card key={area.id} className={`${showPrintView ? 'border-gray-300 shadow-none' : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700'}`}>
                  <CardHeader>
                    <CardTitle className={`flex items-center gap-2 text-lg ${showPrintView ? 'text-black' : 'text-white'}`}>
                      <span className="text-2xl">{area.icon}</span>
                      <div className="flex-1">
                        {area.name}
                        <div className={`text-lg font-bold ${area.color}`}>
                          {score.toFixed(1)}
                        </div>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className={`flex justify-between text-sm mb-1 ${showPrintView ? 'text-gray-600' : 'text-slate-400'}`}>
                          <span>Avaliação</span>
                          <span>{score >= 8 ? 'Excelente' : score >= 7 ? 'Bom' : score >= 6 ? 'Regular' : 'Atenção'}</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                      <p className={`text-sm ${showPrintView ? 'text-gray-700' : 'text-slate-300'}`}>
                        {area.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recomendações */}
          <Card className={`mb-8 ${showPrintView ? 'border-gray-300 shadow-none' : 'bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700'}`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${showPrintView ? 'text-black' : 'text-white'}`}>
                <span>💡</span>
                Recomendações Personalizadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 ${showPrintView ? 'text-green-700' : 'text-green-400'}`}>
                    <span>✓</span>
                    Pontos Fortes
                  </h4>
                  <div className="space-y-2">
                    {areas
                      .filter(area => (responses[area.id] || 0) >= 8)
                      .map((area) => (
                        <div key={area.id} className={`text-sm ${showPrintView ? 'text-gray-700' : 'text-slate-300'}`}>
                          ✓ {area.name} está em excelente estado
                        </div>
                      ))}
                  </div>
                </div>
                
                <div>
                  <h4 className={`font-semibold mb-3 flex items-center gap-2 ${showPrintView ? 'text-orange-700' : 'text-orange-400'}`}>
                    <span>⚠</span>
                    Áreas de Melhoria
                  </h4>
                  <div className="space-y-2">
                    {areas
                      .filter(area => (responses[area.id] || 0) < 7)
                      .map((area) => (
                        <div key={area.id} className={`text-sm ${showPrintView ? 'text-gray-700' : 'text-slate-300'}`}>
                          ⚠ Acompanhar {area.name} mais de perto
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Conteúdo Adicional */}
          {children}

          {/* Footer para Impressão */}
          {showPrintView && (
            <div className="text-center text-gray-500 text-sm mt-8 print:block hidden border-t pt-4">
              <p>Relatório gerado pela Plataforma de Bem-Estar - Este documento é confidencial</p>
              <p>Para mais informações, consulte seu profissional de saúde ou coach</p>
            </div>
          )}
        </div>

        {/* Ações de Navegação */}
        {showActions && onReset && (
          <div className="flex justify-center mt-8">
            <Button
              onClick={onReset}
              variant="outline"
              className="px-8 py-2"
            >
              ← Fazer Nova Avaliação
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BaseWheelStructure;