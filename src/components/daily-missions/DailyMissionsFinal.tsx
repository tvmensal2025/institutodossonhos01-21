import React, { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Trophy, Star, Droplets, Moon } from 'lucide-react';
import { useDailyMissionsFinal } from '@/hooks/useDailyMissionsFinal';
import { getSectionTitleFinal } from '@/data/daily-questions-final';
import { DailyQuestion } from '@/types/daily-missions';
import { MissionCompletePage } from './MissionCompletePage';

interface DailyMissionsFinalProps {
  user: User | null;
}

export const DailyMissionsFinal: React.FC<DailyMissionsFinalProps> = ({ user }) => {
  const [textInput, setTextInput] = useState('');
  const {
    currentQuestion,
    currentQuestionIndex,
    progress,
    answers,
    isLoading,
    isCompleted,
    session,
    handleScaleAnswer,
    handleMultipleChoice,
    handleYesNo,
    handleTextInput,
    handleStarRating,
    allQuestions
  } = useDailyMissionsFinal({ user });

  const renderQuestion = (question: DailyQuestion) => {
    // Verificação de segurança para evitar erros
    if (!question || !question.type) {
      console.error('Pergunta inválida:', question);
      return <div className="p-4 text-red-500">Erro: pergunta não encontrada</div>;
    }

    switch (question.type) {
      case 'scale':
        return (
          <div className="space-y-4">
            <div className="space-y-3">
              {question.scale?.labels?.map((label, index) => (
                <div key={index} className="flex items-center gap-3">
                  <Button
                    variant={answers[question.id] === index + 1 ? "default" : "outline"}
                    className={`w-14 h-14 sm:w-16 sm:h-16 p-0 question-button ${
                      answers[question.id] === index + 1 ? 'question-button-purple' : 'question-button-outline'
                    }`}
                    onClick={() => handleScaleAnswer(index + 1)}
                    disabled={isLoading}
                  >
                    {question.scale?.emojis ? (
                      <span className="text-xl sm:text-2xl">{question.scale.emojis[index]}</span>
                    ) : (
                      <span className="text-lg sm:text-xl font-bold">{index + 1}</span>
                    )}
                  </Button>
                  <span className="text-base sm:text-lg flex-1">{label}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'star_scale':
        return (
          <div className="space-y-4">
            <div className="flex justify-center gap-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant={answers[question.id] === star ? "default" : "outline"}
                  className={`w-14 h-14 sm:w-16 sm:h-16 p-0 question-button ${
                    answers[question.id] === star ? 'question-button-purple' : 'question-button-outline'
                  }`}
                  onClick={() => {
                    console.log(`Estrela ${star} clicada`);
                    handleStarRating(star);
                  }}
                  disabled={isLoading}
                >
                  <Star className={`h-6 w-6 sm:h-8 sm:w-8 ${answers[question.id] === star ? 'fill-current' : ''}`} />
                </Button>
              ))}
            </div>
            <p className="text-center text-base sm:text-lg text-muted-foreground">
              {question.scale?.labels && answers[question.id] 
                ? question.scale.labels[(answers[question.id] as number) - 1] 
                : 'Selecione uma avaliação'}
            </p>
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <Button
                key={index}
                variant={answers[question.id] === option ? "default" : "outline"}
                className={`w-full justify-start text-left question-button h-12 sm:h-14 ${
                  answers[question.id] === option ? 'question-button-purple' : 'question-button-outline'
                }`}
                onClick={() => handleMultipleChoice(option)}
                disabled={isLoading}
              >
                {answers[question.id] === option && <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
                <span className="text-base sm:text-lg">{option}</span>
              </Button>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-3">
            <Button
              variant={answers[question.id] === 'Sim' ? "default" : "outline"}
              className={`flex-1 question-button h-12 sm:h-14 ${
                answers[question.id] === 'Sim' ? 'question-button-purple' : 'question-button-outline'
              }`}
              onClick={() => handleYesNo(true)}
              disabled={isLoading}
            >
              {answers[question.id] === 'Sim' && <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
              <span className="text-base sm:text-lg">Sim</span>
            </Button>
            <Button
              variant={answers[question.id] === 'Não' ? "default" : "outline"}
              className={`flex-1 question-button h-12 sm:h-14 ${
                answers[question.id] === 'Não' ? 'question-button-purple' : 'question-button-outline'
              }`}
              onClick={() => handleYesNo(false)}
              disabled={isLoading}
            >
              {answers[question.id] === 'Não' && <CheckCircle className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />}
              <span className="text-base sm:text-lg">Não</span>
            </Button>
          </div>
        );

      case 'text':
        return (
          <div className="space-y-4">
            <Textarea
              placeholder={question.placeholder || "Digite sua resposta..."}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              className="min-h-[120px]"
              disabled={isLoading}
            />
            <Button
              onClick={() => {
                if (textInput.trim()) {
                  handleTextInput(textInput);
                  setTextInput('');
                }
              }}
              disabled={!textInput.trim() || isLoading}
              className="w-full question-button question-button-purple h-12 sm:h-14"
            >
              <span className="text-base sm:text-lg">Continuar</span>
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  // Se já completou hoje
  if (isCompleted && session) {
    const totalPoints = session.total_points;

    return (
      <MissionCompletePage
        answers={answers}
        totalPoints={totalPoints}
        questions={allQuestions}
        onContinue={() => window.location.href = '/sofia-nutricional'}
      />
    );
  }

  if (!currentQuestion) {
    return (
      <div className="p-6 text-center">
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-800">Missão do Dia</h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-4">
          Pergunta {currentQuestionIndex + 1} de {allQuestions.length}
        </p>
        
        <div className="mt-4">
          <Progress value={progress} className="h-3" />
        </div>
      </div>

      {/* Question Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs sm:text-sm">
              {getSectionTitleFinal(currentQuestion.section)}
            </Badge>
            <span className="flex items-center gap-1 text-yellow-600">
              <Trophy className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base font-semibold">{currentQuestion.points} pts</span>
            </span>
            {currentQuestion.tracking && (
              <Badge variant="secondary" className="text-xs sm:text-sm">
                📊 Tracking
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-lg sm:text-xl font-semibold mb-6">{currentQuestion.question}</h2>
          {renderQuestion(currentQuestion)}
          
          {isLoading && (
            <div className="mt-6 text-center text-sm sm:text-base text-muted-foreground">
              Salvando resposta...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          disabled={currentQuestionIndex === 0}
          className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
        >
          Anterior
        </Button>
        
        <div className="text-sm sm:text-base text-muted-foreground font-medium">
          {currentQuestionIndex + 1} / {allQuestions.length}
        </div>
      </div>
    </div>
  );
}; 