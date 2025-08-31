import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { AbundanceWheel } from '@/components/abundance/AbundanceWheel';
import { BaseWheelStructure, WheelArea } from '@/components/wheel/BaseWheelStructure';

const abundanceAreas: WheelArea[] = [
  {
    id: 'renda_ativa',
    name: 'Renda Ativa',
    description: 'Considere sua remuneração atual, crescimento salarial e valor agregado',
    icon: '💼',
    color: 'text-blue-400'
  },
  {
    id: 'renda_passiva',
    name: 'Renda Passiva', 
    description: 'Considere seus investimentos, rendimentos automáticos e fontes de renda não ativa',
    icon: '💰',
    color: 'text-green-400'
  },
  {
    id: 'investimentos',
    name: 'Investimentos',
    description: 'Considere sua carteira de investimentos, diversificação e retornos',
    icon: '📈',
    color: 'text-purple-400'
  },
  {
    id: 'educacao_financeira',
    name: 'Educação Financeira',
    description: 'Considere seu conhecimento sobre finanças, planejamento e gestão de dinheiro',
    icon: '📚',
    color: 'text-yellow-400'
  },
  {
    id: 'planejamento_financeiro',
    name: 'Planejamento Financeiro',
    description: 'Considere seu orçamento, metas financeiras e controle de gastos',
    icon: '📊',
    color: 'text-cyan-400'
  },
  {
    id: 'protecao_financeira',
    name: 'Proteção Financeira',
    description: 'Considere seus seguros, reserva de emergência e proteção patrimonial',
    icon: '🛡️',
    color: 'text-indigo-400'
  },
  {
    id: 'legado_financeiro',
    name: 'Legado Financeiro',
    description: 'Considere sua herança, doações e impacto financeiro para futuras gerações',
    icon: '🏛️',
    color: 'text-orange-400'
  },
  {
    id: 'mentalidade_abundancia',
    name: 'Mentalidade de Abundância',
    description: 'Considere suas crenças sobre dinheiro, gratidão e atração de prosperidade',
    icon: '✨',
    color: 'text-pink-400'
  }
];

const scoreOptions = [
  { value: 1, emoji: '😰', label: 'Muito baixa', color: 'bg-red-500' },
  { value: 2, emoji: '💰', label: 'Baixa', color: 'bg-orange-500' },
  { value: 3, emoji: '💎', label: 'Média', color: 'bg-yellow-500' },
  { value: 4, emoji: '🚀', label: 'Boa', color: 'bg-blue-500' },
  { value: 5, emoji: '✨', label: 'Excelente', color: 'bg-green-500' }
];

export const AbundanceWheelPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleResponse = (areaId: string, score: number) => {
    setResponses(prev => ({ ...prev, [areaId]: score }));
  };

  const handleNext = () => {
    if (currentStep < abundanceAreas.length - 1) {
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

  const currentArea = abundanceAreas[currentStep];
  const progress = ((currentStep + 1) / abundanceAreas.length) * 100;
  const currentResponse = responses[currentArea?.id];

  if (isCompleted) {
    return (
      <BaseWheelStructure
        title="Roda da Abundância"
        subtitle="Avalie os 8 pilares da sua prosperidade financeira"
        emoji="🌟"
        areas={abundanceAreas}
        responses={responses}
        onReset={handleReset}
        wheelComponent={
          <AbundanceWheel 
            responses={responses} 
            areas={abundanceAreas} 
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
            🌟 Roda da Abundância
          </h1>
          <p className="text-slate-300 text-lg">
            Avalie os 8 pilares da sua prosperidade financeira
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">
              Área {currentStep + 1} de {abundanceAreas.length}
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
              <AbundanceWheel 
                responses={responses} 
                areas={abundanceAreas} 
                highlightedArea={currentArea.id}
                size={200}
              />
            </div>

            {/* Score Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white text-center mb-6">
                Como você avalia esta área?
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {scoreOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={currentResponse === option.value ? "default" : "outline"}
                    size="lg"
                    onClick={() => handleResponse(currentArea.id, option.value)}
                    className={`h-20 flex flex-col items-center justify-center gap-2 border-2 transition-all
                      ${currentResponse === option.value 
                        ? 'border-primary bg-primary text-primary-foreground shadow-lg scale-105' 
                        : 'border-slate-600 hover:border-slate-400 bg-slate-800/50 text-white hover:bg-slate-700/50'
                      }`}
                  >
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="text-xs font-medium">{option.label}</span>
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
                  {Object.keys(responses).length} de {abundanceAreas.length} áreas avaliadas
                </p>
              </div>

              <Button
                onClick={handleNext}
                disabled={!currentResponse}
                className="flex items-center gap-2"
              >
                {currentStep === abundanceAreas.length - 1 ? 'Finalizar' : 'Próxima'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-slate-400 text-sm">
          <p>⏱️ Tempo estimado: 10-15 minutos • 💎 Foco na abundância positiva</p>
        </div>
      </div>
    </div>
  );
};