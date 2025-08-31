import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trophy, Star, CheckCircle } from 'lucide-react';

interface MissionCompletePageProps {
  answers: Record<string, string | number>;
  totalPoints: number;
  questions: Array<{
    id: string;
    question: string;
  }>;
  onContinue?: () => void;
}

export const MissionCompletePage: React.FC<MissionCompletePageProps> = ({
  answers,
  totalPoints,
  questions,
  onContinue
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header com gradiente */}
        <div className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 rounded-t-2xl p-6 text-center text-white relative overflow-hidden">
          {/* Efeito de brilho */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Trophy className="h-8 w-8 text-yellow-300" />
              <h1 className="text-2xl font-bold">Missão Completa!</h1>
              <Trophy className="h-8 w-8 text-yellow-300" />
            </div>
            
            <p className="text-emerald-100 text-sm">
              Parabéns! Você completou todas as reflexões de hoje.
            </p>
          </div>
        </div>

        {/* Conteúdo principal */}
        <Card className="bg-white shadow-lg border-0 rounded-b-2xl">
          <CardContent className="p-6">
            {/* Título do resumo */}
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              Resumo das Respostas:
            </h3>

            {/* Lista de respostas */}
            <div className="space-y-3 mb-6">
              {questions.map((question) => (
                <div key={question.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm text-gray-700 font-medium leading-tight">
                      {question.question}
                    </span>
                    <Badge 
                      variant="secondary" 
                      className="bg-gray-200 text-gray-700 text-xs px-2 py-1 w-fit self-start border-0"
                    >
                      {answers[question.id] || 'Não respondido'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Pontos ganhos */}
            <div className="flex items-center justify-center gap-2 text-lg font-bold text-yellow-600 mb-6">
              <Star className="h-5 w-5" />
              <span>{totalPoints} pontos ganhos!</span>
              <Star className="h-5 w-5" />
            </div>

            {/* Botão de continuar */}
            <Button 
              onClick={onContinue}
              className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Continuar
            </Button>
          </CardContent>
        </Card>

        {/* Efeito de confete (opcional) */}
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-bounce"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            >
              <div className={`w-2 h-2 rounded-full ${
                ['bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-purple-400', 'bg-pink-400'][
                  Math.floor(Math.random() * 5)
                ]
              }`}></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
