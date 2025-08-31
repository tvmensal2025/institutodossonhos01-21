import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Sparkles, Calendar, FileText } from 'lucide-react';
import sofiaImage from '@/assets/sofia.png';

interface MealPlanSuccessEffectProps {
  isVisible: boolean;
  onClose: () => void;
  mealPlanData?: {
    type: 'daily' | 'weekly';
    title: string;
    summary: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  };
}

export const MealPlanSuccessEffect: React.FC<MealPlanSuccessEffectProps> = ({
  isVisible,
  onClose,
  mealPlanData
}) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isVisible) {
      setShowConfetti(true);
      setAnimationStep(1);
      
      const timer1 = setTimeout(() => setAnimationStep(2), 500);
      const timer2 = setTimeout(() => setAnimationStep(3), 1000);
      const timer3 = setTimeout(() => setShowConfetti(false), 3000);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: '2s'
              }}
            >
              <Sparkles 
                className="w-6 h-6 text-yellow-400" 
                style={{
                  filter: 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.6))'
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Success Card */}
      <Card className={`
        max-w-md w-full bg-white shadow-2xl border-0 relative overflow-hidden
        transform transition-all duration-700 ease-out
        ${animationStep >= 1 ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        ${animationStep >= 2 ? 'animate-pulse' : ''}
      `}>
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-500/10 to-blue-500/20 animate-gradient-x" />
        
        <CardContent className="p-8 text-center relative z-10">
          {/* Success Icon */}
          <div className={`
            mx-auto mb-6 relative
            transform transition-all duration-500 ease-out delay-300
            ${animationStep >= 2 ? 'scale-100 rotate-0' : 'scale-0 rotate-180'}
          `}>
            <div className="relative">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto drop-shadow-lg" />
              <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
            </div>
          </div>

          {/* Sofia Avatar */}
          <div className={`
            mb-4 transform transition-all duration-500 ease-out delay-500
            ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            <img 
              src={sofiaImage} 
              alt="Sofia" 
              className="w-16 h-16 rounded-full mx-auto shadow-lg border-4 border-white"
            />
          </div>

          {/* Success Message */}
          <div className={`
            space-y-3 transform transition-all duration-500 ease-out delay-700
            ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            <h2 className="text-2xl font-bold text-gray-800">
              🎉 Parabéns!
            </h2>
            <p className="text-lg text-gray-600">
              Seu cardápio foi gerado com sucesso!
            </p>
            
            {mealPlanData && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4 mt-4">
                <h3 className="font-semibold text-emerald-800 mb-2">
                  {mealPlanData.title}
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-emerald-700">{mealPlanData.summary.calories}</div>
                    <div className="text-emerald-600 text-xs">Kcal</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-emerald-700">{mealPlanData.summary.protein}g</div>
                    <div className="text-emerald-600 text-xs">Proteínas</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-emerald-700">{mealPlanData.summary.carbs}g</div>
                    <div className="text-emerald-600 text-xs">Carboidratos</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-emerald-700">{mealPlanData.summary.fat}g</div>
                    <div className="text-emerald-600 text-xs">Gorduras</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Info Message */}
          <div className={`
            mt-6 transform transition-all duration-500 ease-out delay-1000
            ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-600 mb-4">
              <Calendar className="w-4 h-4" />
              <span>Disponível no histórico com opções de visualização</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mb-6">
              <FileText className="w-3 h-3" />
              <span>HTML interativo com botão de impressão</span>
            </div>
          </div>

          {/* Close Button */}
          <div className={`
            transform transition-all duration-500 ease-out delay-1200
            ${animationStep >= 3 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}
          `}>
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold px-8 py-2 rounded-full shadow-lg transform hover:scale-105 transition-all"
            >
              Visualizar no Histórico
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};