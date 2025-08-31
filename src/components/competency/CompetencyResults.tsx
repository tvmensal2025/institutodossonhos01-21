import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RotateCcw, Download, Share } from 'lucide-react';
import { CompetencyWheel } from './CompetencyWheel';
import { CompetencyCharts } from './CompetencyCharts';
import { DrVitalFeedback } from '@/components/shared/DrVitalFeedback';

interface CompetencyArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface CompetencyResultsProps {
  responses: Record<string, number>;
  areas: CompetencyArea[];
  onReset: () => void;
}

export const CompetencyResults: React.FC<CompetencyResultsProps> = ({
  responses,
  areas,
  onReset
}) => {
  const [showDrVitalFeedback, setShowDrVitalFeedback] = useState(true);

  const handleResetToDefault = () => {
    // Aqui você pode implementar a lógica para resetar os gráficos para o estado padrão
    console.log('Resetando gráficos para estado padrão...');
  };

  const handleNewAssessment = () => {
    setShowDrVitalFeedback(false);
    onReset();
  };

  if (showDrVitalFeedback) {
    return (
      <DrVitalFeedback
        assessmentType="competency"
        scores={responses}
        areas={areas}
        onResetToDefault={handleResetToDefault}
        onNewAssessment={handleNewAssessment}
        onShowResults={() => {}}
      />
    );
  }
  // Calcular estatísticas
  const scores = Object.values(responses);
  const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const totalScore = Math.round(averageScore * 10); // Converter para percentual de 0-100

  // Categorizar competências (baseado na escala 1-10)
  const exceptionalAreas = areas.filter(area => responses[area.id] >= 9); // 9-10
  const goodAreas = areas.filter(area => responses[area.id] >= 7 && responses[area.id] <= 8); // 7-8
  const adequateAreas = areas.filter(area => responses[area.id] >= 5 && responses[area.id] <= 6); // 5-6
  const developmentAreas = areas.filter(area => responses[area.id] >= 3 && responses[area.id] <= 4); // 3-4
  const basicAreas = areas.filter(area => responses[area.id] >= 1 && responses[area.id] <= 2); // 1-2

  const getScoreLevel = (score: number) => {
    if (score < 30) return { level: 'Iniciante', color: 'text-red-400', description: 'Precisa de desenvolvimento intensivo' };
    if (score < 50) return { level: 'Em Desenvolvimento', color: 'text-orange-400', description: 'Há muitas oportunidades de crescimento' };
    if (score < 70) return { level: 'Competente', color: 'text-yellow-400', description: 'Adequado para o nível atual' };
    if (score < 90) return { level: 'Proficiente', color: 'text-green-400', description: 'Muito bem desenvolvido' };
    return { level: 'Expert', color: 'text-blue-400', description: 'Excepcional! Referência na área' };
  };

  const scoreLevel = getScoreLevel(totalScore);

  // Identificar perfil profissional baseado nas competências mais fortes
  const getProfileType = () => {
    const topCompetencies = areas
      .map(area => ({ area, score: responses[area.id] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const topIds = topCompetencies.map(c => c.area.id);
    
    if (topIds.includes('lideranca') && topIds.includes('comunicacao')) {
      return { type: 'Líder Natural', icon: '👑', description: 'Perfil de liderança e influência' };
    }
    if (topIds.includes('competencia_tecnica') && topIds.includes('resolucao_problemas')) {
      return { type: 'Especialista Técnico', icon: '🔧', description: 'Foco em competências técnicas' };
    }
    if (topIds.includes('inovacao') && topIds.includes('adaptabilidade')) {
      return { type: 'Inovador', icon: '💡', description: 'Perfil criativo e adaptável' };
    }
    if (topIds.includes('trabalho_equipe') && topIds.includes('comunicacao')) {
      return { type: 'Colaborador', icon: '🤝', description: 'Especialista em trabalho em equipe' };
    }
    return { type: 'Generalista', icon: '🎯', description: 'Competências equilibradas' };
  };

  const profileType = getProfileType();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎯 Resultado da Roda das Competências
          </h1>
          <p className="text-slate-300 text-lg">
            Sua análise completa de competências profissionais
          </p>
        </div>

        {/* Score Principal */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-white mb-4">
              Perfil de Competências Profissionais
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row items-center gap-8">
              
              {/* Roda Principal */}
              <div className="flex-1">
                <CompetencyWheel responses={responses} areas={areas} size={350} />
              </div>

              {/* Estatísticas */}
              <div className="flex-1 space-y-6">
                {/* Perfil Identificado */}
                <div className="text-center p-6 bg-gradient-to-br from-blue-900/20 to-slate-800 border border-blue-700/50 rounded-lg">
                  <div className="text-4xl mb-2">{profileType.icon}</div>
                  <div className="text-xl font-semibold text-blue-400 mb-1">
                    {profileType.type}
                  </div>
                  <p className="text-sm text-slate-300">
                    {profileType.description}
                  </p>
                </div>

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
                    <div className="text-2xl font-bold text-blue-400">
                      {exceptionalAreas.length}
                    </div>
                    <div className="text-sm text-slate-300">Excepcionais</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">
                      {goodAreas.length}
                    </div>
                    <div className="text-sm text-slate-300">Boas</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">
                      {developmentAreas.length}
                    </div>
                    <div className="text-sm text-slate-300">Desenvolver</div>
                  </div>
                  <div className="text-center p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">
                      {basicAreas.length}
                    </div>
                    <div className="text-sm text-slate-300">Básicas</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gráficos Adicionais */}
        <CompetencyCharts responses={responses} areas={areas} />

        {/* Análise Detalhada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Competências Fortes */}
          {(exceptionalAreas.length > 0 || goodAreas.length > 0) && (
            <Card className="bg-gradient-to-br from-green-900/20 to-slate-800 border-green-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-green-400 flex items-center gap-2">
                  💪 Competências Fortes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...exceptionalAreas, ...goodAreas].map(area => (
                  <div key={area.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{area.icon}</span>
                      <span className="text-white font-medium">{area.name}</span>
                    </div>
                    <span className="text-green-400 font-bold">
                      {responses[area.id]}/10
                    </span>
                  </div>
                ))}
                <p className="text-sm text-slate-300 mt-4">
                  ✨ Use essas competências como seus diferenciais competitivos.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Áreas de Desenvolvimento */}
          {(developmentAreas.length > 0 || basicAreas.length > 0) && (
            <Card className="bg-gradient-to-br from-orange-900/20 to-slate-800 border-orange-700/50">
              <CardHeader>
                <CardTitle className="text-xl text-orange-400 flex items-center gap-2">
                  🚀 Áreas de Desenvolvimento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[...basicAreas, ...developmentAreas].map(area => (
                  <div key={area.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{area.icon}</span>
                      <span className="text-white font-medium">{area.name}</span>
                    </div>
                    <span className="text-orange-400 font-bold">
                      {responses[area.id]}/10
                    </span>
                  </div>
                ))}
                <p className="text-sm text-slate-300 mt-4">
                  📈 Foque no desenvolvimento dessas competências para acelerar sua carreira.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Plano de Desenvolvimento */}
          <Card className="bg-gradient-to-br from-blue-900/20 to-slate-800 border-blue-700/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-xl text-blue-400 flex items-center gap-2">
                📋 Plano de Desenvolvimento Profissional
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">🎯 Próximos 30 dias</h4>
                  <p className="text-sm text-slate-300">
                    Identifique 1 competência crítica e busque treinamento específico
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">📈 Próximos 60 dias</h4>
                  <p className="text-sm text-slate-300">
                    Implemente práticas diárias e busque feedback regular
                  </p>
                </div>
                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-semibold text-white mb-2">🚀 Próximos 90 dias</h4>
                  <p className="text-sm text-slate-300">
                    Aplique as competências em projetos desafiadores
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ações */}
        <div className="flex flex-wrap justify-center gap-4">
          <Button onClick={onReset} variant="outline" className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Refazer Avaliação
          </Button>
          <Button className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Baixar Relatório
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Share className="w-4 h-4" />
            Compartilhar
          </Button>
        </div>
      </div>
    </div>
  );
};