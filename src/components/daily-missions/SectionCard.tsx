import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, ChevronRight, ChevronDown } from 'lucide-react';
import { DailyQuestion } from '@/types/daily-missions';
import { QuestionCard } from './QuestionCard';
import { getSectionTitle, getSectionDescription } from '@/data/daily-questions';

interface SectionCardProps {
  section: 'morning' | 'habits' | 'mindset';
  questions: DailyQuestion[];
  answers: Record<string, string | number>;
  textResponses: Record<string, string>;
  onAnswer: (questionId: string, answer: string | number, textResponse?: string) => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  isCompleted: boolean;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  section,
  questions,
  answers,
  textResponses,
  onAnswer,
  isExpanded,
  onToggleExpanded,
  isCompleted
}) => {
  const completedQuestions = questions.filter(q => 
    answers[q.id] !== undefined || textResponses[q.id] !== undefined
  ).length;
  
  const totalPoints = questions.reduce((sum, q) => sum + q.points, 0);
  const earnedPoints = completedQuestions > 0 
    ? questions
        .filter(q => answers[q.id] !== undefined || textResponses[q.id] !== undefined)
        .reduce((sum, q) => sum + q.points, 0)
    : 0;

  const progressPercentage = (completedQuestions / questions.length) * 100;

  const getSectionIcon = () => {
    switch (section) {
      case 'morning':
        return '🌅';
      case 'habits':
        return '💪';
      case 'mindset':
        return '🧠';
      default:
        return '📝';
    }
  };

  const getSectionColor = () => {
    switch (section) {
      case 'morning':
        return 'bg-orange-50 border-orange-200';
      case 'habits':
        return 'bg-blue-50 border-blue-200';
      case 'mindset':
        return 'bg-purple-50 border-purple-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <Card className={`transition-all duration-300 ${getSectionColor()} ${
      isCompleted ? 'ring-2 ring-green-500' : ''
    }`}>
      <CardHeader 
        className="cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{getSectionIcon()}</div>
            <div className="flex-1">
              <CardTitle className="text-xl font-bold">
                {getSectionTitle(section)}
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-1">
                {getSectionDescription(section)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isCompleted && (
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                <CheckCircle className="mr-1 h-3 w-3" />
                Completo
              </Badge>
            )}
            
            <div className="text-right">
              <div className="text-sm font-medium">
                {completedQuestions}/{questions.length} perguntas
              </div>
              <div className="text-xs text-muted-foreground">
                {earnedPoints}/{totalPoints} pontos
              </div>
            </div>
            
            <Button variant="ghost" size="sm">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Progresso</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                onAnswer={onAnswer}
                currentAnswer={answers[question.id]}
                currentTextResponse={textResponses[question.id]}
                isCompleted={answers[question.id] !== undefined || textResponses[question.id] !== undefined}
              />
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
}; 