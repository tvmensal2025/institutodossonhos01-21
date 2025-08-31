import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { HealthWheel } from '@/components/ui/health-wheel';
import { BaseWheelStructure, WheelArea } from '@/components/wheel/BaseWheelStructure';

const healthAreas: WheelArea[] = [
  {
    id: 'cardiovascular',
    name: 'Sistema Cardiovascular',
    description: 'Avalie seu coração, circulação sanguínea e pressão arterial',
    icon: '❤️',
    color: 'text-red-400'
  },
  {
    id: 'respiratorio',
    name: 'Sistema Respiratório', 
    description: 'Considere sua respiração, capacidade pulmonar e oxigenação',
    icon: '🫁',
    color: 'text-blue-400'
  },
  {
    id: 'nervoso',
    name: 'Sistema Nervoso',
    description: 'Avalie seu estresse, ansiedade, sono e concentração mental',
    icon: '🧠',
    color: 'text-purple-400'
  },
  {
    id: 'digestivo',
    name: 'Sistema Digestivo',
    description: 'Considere sua digestão, apetite e funcionamento intestinal',
    icon: '🫂',
    color: 'text-yellow-400'
  },
  {
    id: 'imunologico',
    name: 'Sistema Imunológico',
    description: 'Avalie sua resistência a doenças e capacidade de recuperação',
    icon: '🛡️',
    color: 'text-green-400'
  },
  {
    id: 'musculoesqueletico',
    name: 'Sistema Muscular',
    description: 'Considere força muscular, flexibilidade e dores articulares',
    icon: '💪',
    color: 'text-orange-400'
  },
  {
    id: 'endocrino',
    name: 'Sistema Endócrino',
    description: 'Avalie hormônios, metabolismo e regulação corporal',
    icon: '⚡',
    color: 'text-cyan-400'
  },
  {
    id: 'reproductivo',
    name: 'Sistema Reprodutivo',
    description: 'Considere saúde sexual e funcionamento reprodutivo',
    icon: '🌸',
    color: 'text-pink-400'
  }
];

const scoreOptions = [
  { value: 1, emoji: '😰', label: 'Muito baixa', description: 'Problemas sérios nesta área', color: 'bg-red-500' },
  { value: 3, emoji: '😟', label: 'Baixa', description: 'Algumas preocupações significativas', color: 'bg-orange-500' },
  { value: 5, emoji: '😐', label: 'Média', description: 'Funcionamento básico normal', color: 'bg-yellow-500' },
  { value: 7, emoji: '😊', label: 'Boa', description: 'Funcionando bem na maioria das vezes', color: 'bg-blue-500' },
  { value: 9, emoji: '😄', label: 'Excelente', description: 'Funcionamento ótimo e energia alta', color: 'bg-green-500' }
];

export const HealthWheelPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState<Record<string, number>>({});
  const [isCompleted, setIsCompleted] = useState(false);

  const handleResponse = (areaId: string, score: number) => {
    setResponses(prev => ({ ...prev, [areaId]: score }));
  };

  const handleNext = () => {
    if (currentStep < healthAreas.length - 1) {
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

  const currentArea = healthAreas[currentStep];
  const progress = ((currentStep + 1) / healthAreas.length) * 100;
  const currentResponse = responses[currentArea?.id];

  if (isCompleted) {
    // Converter responses para o formato esperado pelo HealthWheel
    const healthWheelData = healthAreas.map(area => ({
      systemName: area.name,
      score: responses[area.id] || 0,
      color: area.color.replace('text-', '#'),
      icon: area.icon,
      symptomsCount: responses[area.id] >= 7 ? 0 : responses[area.id] >= 5 ? 1 : 2,
      symptoms: responses[area.id] >= 7 
        ? ['Funcionamento excelente'] 
        : responses[area.id] >= 5 
          ? ['Funcionamento normal'] 
          : ['Necessita atenção', 'Acompanhamento recomendado']
    }));

    return (
      <BaseWheelStructure
        title="Roda da Saúde"
        subtitle="Avalie os 8 sistemas fundamentais do seu corpo"
        emoji="🏥"
        areas={healthAreas}
        responses={responses}
        onReset={handleReset}
        wheelComponent={
          <HealthWheel 
            data={healthWheelData}
            totalScore={Object.values(responses).reduce((sum, score) => sum + score, 0) / Object.values(responses).length}
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
            🏥 Roda da Saúde
          </h1>
          <p className="text-slate-300 text-lg">
            Avalie os 8 sistemas fundamentais do seu corpo
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">
              Sistema {currentStep + 1} de {healthAreas.length}
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
            {/* Score Options */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white text-center mb-6">
                Como você avalia este sistema de saúde?
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
                  {Object.keys(responses).length} de {healthAreas.length} sistemas avaliados
                </p>
              </div>

              <Button
                onClick={handleNext}
                disabled={!currentResponse}
                className="flex items-center gap-2"
              >
                {currentStep === healthAreas.length - 1 ? 'Finalizar' : 'Próximo'}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center text-slate-400 text-sm">
          <p>⏱️ Tempo estimado: 10-15 minutos • 🏥 Foco na saúde integral</p>
        </div>
      </div>
    </div>
  );
};