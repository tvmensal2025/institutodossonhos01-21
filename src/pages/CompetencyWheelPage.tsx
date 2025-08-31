import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CompetencyWheel } from '@/components/competency/CompetencyWheel';
import { BaseWheelStructure, WheelArea } from '@/components/wheel/BaseWheelStructure';

const competencyAreas: WheelArea[] = [
  {
    id: 'competencia_tecnica',
    name: 'Competência Técnica',
    description: 'Considere conhecimento específico e habilidades técnicas',
    icon: '🔧',
    color: 'text-blue-400'
  },
  {
    id: 'comunicacao',
    name: 'Comunicação', 
    description: 'Considere clareza, objetividade e capacidade de expressão',
    icon: '💬',
    color: 'text-green-400'
  },
  {
    id: 'trabalho_equipe',
    name: 'Trabalho em Equipe',
    description: 'Considere colaboração, cooperação e relacionamento',
    icon: '🤝',
    color: 'text-purple-400'
  },
  {
    id: 'resolucao_problemas',
    name: 'Resolução de Problemas',
    description: 'Considere análise, criatividade e implementação de soluções',
    icon: '🧩',
    color: 'text-yellow-400'
  },
  {
    id: 'adaptabilidade',
    name: 'Adaptabilidade',
    description: 'Considere flexibilidade, aprendizado e resiliência',
    icon: '🔄',
    color: 'text-cyan-400'
  },
  {
    id: 'lideranca',
    name: 'Liderança',
    description: 'Considere influência, direcionamento e desenvolvimento de outros',
    icon: '👑',
    color: 'text-indigo-400'
  },
  {
    id: 'inovacao',
    name: 'Inovação',
    description: 'Considere criatividade, melhoria de processos e novas ideias',
    icon: '💡',
    color: 'text-orange-400'
  },
  {
    id: 'gestao_tempo',
    name: 'Gestão de Tempo',
    description: 'Considere organização, priorização e cumprimento de prazos',
    icon: '⏰',
    color: 'text-pink-400'
  }
];

const scoreOptions = [
  { value: 1, emoji: '🔴', label: '1-2: Básico', description: 'Precisa desenvolver muito', color: 'bg-red-500' },
  { value: 3, emoji: '🟠', label: '3-4: Desenvolvimento', description: 'Precisa melhorar', color: 'bg-orange-500' },
  { value: 5, emoji: '🟡', label: '5-6: Adequado', description: 'Suficiente para o cargo', color: 'bg-yellow-500' },
  { value: 7, emoji: '🟢', label: '7-8: Bom', description: 'Bem desenvolvido', color: 'bg-green-500' },
  { value: 9, emoji: '🔵', label: '9-10: Excepcional', description: 'Especialista/Expert', color: 'bg-blue-500' }
];

export const CompetencyWheelPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleResponse = (areaId: string, score: number) => {
    setResponses(prev => ({ ...prev, [areaId]: score }));
  };

  const handleNext = () => {
    if (currentStep < competencyAreas.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setResponses({});
    setIsCompleted(false);
  };

  const currentArea = competencyAreas[currentStep];
  const progress = ((currentStep + 1) / competencyAreas.length) * 100;
  const currentResponse = responses[currentArea?.id];

  if (isCompleted) {
    return (
      <BaseWheelStructure
        title="Roda das Competências"
        subtitle="Avalie suas 8 competências profissionais fundamentais"
        emoji="🎯"
        areas={competencyAreas}
        responses={responses}
        onReset={handleReset}
        wheelComponent={
          <CompetencyWheel 
            responses={responses} 
            areas={competencyAreas} 
            size={400}
          />
        }
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            🎯 Roda das Competências
          </h1>
          <p className="text-slate-300 text-lg">
            Avalie suas 8 competências profissionais fundamentais
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">
              Competência {currentStep + 1} de {competencyAreas.length}
            </span>
            <span className="text-sm text-slate-400">
              {Math.round(progress)}% completo
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Card */}
        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 mb-8">
          <CardHeader className="text-center pb-6">
            <div className="text-6xl mb-4">{currentArea.icon}</div>
            <CardTitle className="text-2xl text-white mb-2">
              {currentArea.name}
            </CardTitle>
            <p className="text-slate-300 text-base leading-relaxed">
              {currentArea.description}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Visual Wheel Preview */}
            <div className="flex justify-center mb-8">
              <CompetencyWheel 
                responses={responses} 
                areas={competencyAreas} 
                highlightedArea={currentArea.id}
                size={200}
              />
            </div>

            {/* Score Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white text-center mb-6">
                Como você avalia esta competência?
              </h3>
              
              <div className="grid grid-cols-1 gap-3">
                {scoreOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={currentResponse === option.value ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleResponse(currentArea.id, option.value)}
                    className={`h-16 flex items-center justify-between p-6 border-2 transition-all text-left
                      ${currentResponse === option.value 
                        ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-102' 
                        : 'border-slate-600 hover:border-slate-400 bg-slate-800/50 text-white hover:bg-slate-700/50'
                      }`}
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{option.emoji}</span>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm opacity-80">{option.description}</div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center pt-6">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </Button>

              <div className="text-center">
                <p className="text-sm text-slate-400">
                  {Object.keys(responses).length} de {competencyAreas.length} competências avaliadas
                </p>
              </div>

              <Button
                onClick={handleNext}
                disabled={!currentResponse}
                className="flex items-center gap-2"
              >
                {currentStep === competencyAreas.length - 1 ? 'Finalizar' : 'Próxima'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-slate-400 text-sm">
          <p>⏱️ Tempo estimado: 10-15 minutos • 🎯 Foco no desenvolvimento profissional</p>
        </div>
      </div>
    </div>
  );
};