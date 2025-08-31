import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Download, Share, Mail, MessageCircle, Printer } from 'lucide-react';
import { AbundanceWheel } from './AbundanceWheel';
import { AbundanceCharts } from './AbundanceCharts';
import { DrVitalFeedback } from '@/components/shared/DrVitalFeedback';
import { useToast } from '@/hooks/use-toast';
import { useAssessmentData } from '@/hooks/useAssessmentData';

interface AbundanceArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface AbundanceResultsProps {
  responses: Record<string, number>;
  areas: AbundanceArea[];
  onReset: () => void;
}

export const AbundanceResults: React.FC<AbundanceResultsProps> = ({
  responses,
  areas,
  onReset
}) => {
  const [showDrVitalFeedback, setShowDrVitalFeedback] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const { toast } = useToast();
  const { saveAssessment } = useAssessmentData();

  const handleShowResults = () => {
    setShowDrVitalFeedback(false);
    setShowResults(true);
  };

  const handleNewAssessment = () => {
    toast({
      title: "Nova avaliação solicitada",
      description: "Entre em contato com Dr. Vital ou Sofia para solicitar uma nova avaliação.",
    });
  };

  // Salvar avaliação automaticamente quando os resultados são mostrados
  useEffect(() => {
    if (showResults) {
      const scores = Object.values(responses);
      const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
      const totalScore = Math.round(averageScore * 20);

      saveAssessment({
        // assessment_type: 'abundance', // Removido por enquanto
        // scores: responses, // Removido por enquanto
        // total_score: totalScore, // Removido por enquanto
        // areas: areas // Removido por enquanto
      }).then((result) => {
        if (result.success) {
          console.log('Avaliação salva automaticamente');
        } else {
          console.error('Erro ao salvar avaliação:', result.error);
        }
      });
    }
  }, [showResults, responses, areas, saveAssessment]);

  if (showDrVitalFeedback) {
    return (
      <DrVitalFeedback
        assessmentType="abundance"
        scores={responses}
        areas={areas}
        onResetToDefault={() => {}}
        onNewAssessment={handleNewAssessment}
        onShowResults={handleShowResults}
      />
    );
  }

  if (!showResults) {
    return null;
  }

  // Calcular estatísticas
  const scores = Object.values(responses);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const totalScore = Math.round(averageScore * 20); // Converter para percentual

  // Categorizar áreas
  const excellentAreas = areas.filter(area => responses[area.id] >= 4);
  const goodAreas = areas.filter(area => responses[area.id] === 3);
  const attentionAreas = areas.filter(area => responses[area.id] === 2);
  const criticalAreas = areas.filter(area => responses[area.id] === 1);

  const getScoreLevel = (score: number) => {
    if (score < 40) return { level: 'Crítico', color: 'text-red-400', description: 'Necessita atenção urgente' };
    if (score < 60) return { level: 'Atenção', color: 'text-orange-400', description: 'Há oportunidades de melhoria' };
    if (score < 80) return { level: 'Bom', color: 'text-yellow-400', description: 'Caminho certo, continue evoluindo' };
    return { level: 'Excelente', color: 'text-green-400', description: 'Parabéns! Muito bem desenvolvido' };
  };

  const scoreLevel = getScoreLevel(totalScore);

  const handleShare = (method: 'email' | 'whatsapp' | 'print') => {
    const assessmentName = 'Roda da Abundância';
    const score = totalScore;
    
    switch (method) {
      case 'email':
        const emailSubject = encodeURIComponent(`Minha Avaliação - ${assessmentName}`);
        const emailBody = encodeURIComponent(
          `Olá! Acabei de fazer minha avaliação de ${assessmentName} e obtive um score de ${score}%.\n\n` +
          `Áreas fortes: ${excellentAreas.map(a => a.name).join(', ')}\n` +
          `Áreas para melhorar: ${criticalAreas.map(a => a.name).join(', ')}\n\n` +
          `Quer fazer sua avaliação também? Acesse: ${window.location.origin}`
        );
        window.open(`mailto:?subject=${emailSubject}&body=${emailBody}`);
        break;
        
      case 'whatsapp':
        const whatsappText = encodeURIComponent(
          `🌟 Acabei de fazer minha avaliação de ${assessmentName}!\n\n` +
          `📊 Score: ${score}%\n` +
          `💪 Áreas fortes: ${excellentAreas.map(a => a.name).join(', ')}\n` +
          `🎯 Para melhorar: ${criticalAreas.map(a => a.name).join(', ')}\n\n` +
          `Quer fazer sua avaliação também? Acesse: ${window.location.origin}`
        );
        window.open(`https://wa.me/?text=${whatsappText}`);
        break;
        
      case 'print':
        window.print();
        break;
    }

    toast({
      title: "Compartilhado com sucesso!",
      description: `Sua avaliação foi ${method === 'print' ? 'enviada para impressão' : 'compartilhada'}.`,
    });
  };

  const handleDownload = () => {
    const assessmentName = 'Roda da Abundância';
    const score = totalScore;
    
    const reportContent = `
AVALIAÇÃO - ${assessmentName.toUpperCase()}
Data: ${new Date().toLocaleDateString('pt-BR')}
Score Geral: ${score}%

ÁREAS FORTES:
${excellentAreas.map(area => `- ${area.name}: ${responses[area.id] * 20}%`).join('\n')}

ÁREAS PARA MELHORAR:
${criticalAreas.map(area => `- ${area.name}: ${responses[area.id] * 20}%`).join('\n')}

TODAS AS ÁREAS:
${areas.map(area => `- ${area.name}: ${responses[area.id] * 20}%`).join('\n')}

---
Instituto dos Sonhos - Avaliação Personalizada
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avaliacao-abundancia-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Relatório baixado!",
      description: "Sua avaliação foi salva no seu dispositivo.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎯 Resultado da Roda da Abundância
          </h1>
          <p className="text-slate-300 text-lg">
            Sua análise completa dos pilares da prosperidade financeira
          </p>
        </div>

        {/* Score Principal */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white mb-4">
              Score Geral de Abundância
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              
              {/* Roda Principal */}
              <div className="flex-1">
                <AbundanceWheel responses={responses} areas={areas} size={350} />
              </div>

              {/* Estatísticas */}
              <div className="flex-1 space-y-6">
                <div className="text-center">
                  <div className="text-6xl font-bold text-white mb-2">
                    {totalScore}%
                  </div>
                  <div className={`text-xl font-semibold mb-2 ${scoreLevel.color}`}>
                    {scoreLevel.level}
                  </div>
                  <p className="text-slate-300">
                    {scoreLevel.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {excellentAreas.length}
                    </div>
                    <div className="text-sm text-slate-300">Áreas Excelentes</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">
                      {criticalAreas.length}
                    </div>
                    <div className="text-sm text-slate-300">Áreas Críticas</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">
                      {goodAreas.length}
                    </div>
                    <div className="text-sm text-slate-300">Áreas Boas</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">
                      {attentionAreas.length}
                    </div>
                    <div className="text-sm text-slate-300">Áreas Atenção</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos Adicionais */}
        <AbundanceCharts responses={responses} areas={areas} />

        {/* Análise Detalhada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Áreas de Excelência */}
          {excellentAreas.length > 0 && (
            <Card className="bg-gradient-to-br from-green-900/20 to-slate-800 border-green-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-green-400 flex items-center gap-2">
                  💎 Áreas de Excelência
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {excellentAreas.map(area => (
                  <div key={area.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{area.icon}</span>
                      <span className="text-white font-medium">{area.name}</span>
                    </div>
                    <span className="text-green-400 font-bold">
                      {responses[area.id] * 20}%
                    </span>
                  </div>
                ))}
                <p className="text-sm text-slate-300 mt-4">
                  ✨ Continue expandindo essas áreas e use-as como base para melhorar outras.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Áreas Críticas */}
          {criticalAreas.length > 0 && (
            <Card className="bg-gradient-to-br from-red-900/20 to-slate-800 border-red-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-red-400 flex items-center gap-2">
                  🚨 Áreas Críticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {criticalAreas.map(area => (
                  <div key={area.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{area.icon}</span>
                      <span className="text-white font-medium">{area.name}</span>
                    </div>
                    <span className="text-red-400 font-bold">
                      {responses[area.id] * 20}%
                    </span>
                  </div>
                ))}
                <p className="text-sm text-slate-300 mt-4">
                  ⚡ Priorize essas áreas para impulsionar sua prosperidade financeira.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Próximos Passos */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-slate-800 border-blue-700/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                🎯 Plano de Ação Personalizado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">📅 Próximos 30 dias</h4>
                  <p className="text-sm text-slate-300">
                    Foque nas 2 áreas críticas com maior impacto no seu orçamento
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">📈 Próximos 90 dias</h4>
                  <p className="text-sm text-slate-300">
                    Implemente educação financeira e planejamento estruturado
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">🚀 Próximos 6 meses</h4>
                  <p className="text-sm text-slate-300">
                    Desenvolva fontes de renda passiva e proteção financeira
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={handleDownload} className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Baixar Relatório
          </Button>
          <Button onClick={() => handleShare('email')} variant="outline" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email
          </Button>
          <Button onClick={() => handleShare('whatsapp')} variant="outline" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            WhatsApp
          </Button>
          <Button onClick={() => handleShare('print')} variant="outline" className="flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
};