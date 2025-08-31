import React from 'react';
import { User } from '@supabase/supabase-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Trophy, 
  CheckCircle2,
  Clock,
  Zap,
  Sparkles,
  Calendar,
  TrendingUp,
  Award,
  Star,
  Heart,
  Activity
} from 'lucide-react';
import { SectionCard } from './SectionCard';
import { useDailyMissions } from '@/hooks/useDailyMissions';
import { getQuestionsBySection } from '@/data/daily-questions';
import { SectionType } from '@/types/daily-missions';

interface DailyMissionsNewProps {
  user: User | null;
}

export const DailyMissionsNew: React.FC<DailyMissionsNewProps> = ({ user }) => {
  const {
    loading,
    session,
    answers,
    textResponses,
    expandedSections,
    isSubmitting,
    stats,
    saveAnswer,
    toggleSection,
    completeDailyMission
  } = useDailyMissions({ user });

  const sections: SectionType[] = ['morning', 'habits', 'mindset'];

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-muted rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getMotivationalMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia! Que tal começar o dia com uma reflexão?";
    if (hour < 18) return "Boa tarde! Como está sendo seu dia até agora?";
    return "Boa noite! Vamos refletir sobre o dia que passou?";
  };

  const getCompletionMessage = () => {
    if (stats.progressPercentage === 100) {
      return "🎉 Parabéns! Você completou todas as reflexões de hoje!";
    }
    if (stats.progressPercentage > 50) {
      return "💪 Você está quase lá! Continue com as reflexões restantes.";
    }
    return "🌟 Comece sua jornada de autoconhecimento hoje!";
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header Motivacional */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Target className="h-12 w-12 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Missão do Dia
          </h1>
          <Sparkles className="h-8 w-8 text-yellow-500" />
        </div>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {getMotivationalMessage()}
        </p>
        
        <p className="text-lg font-medium text-primary">
          {getCompletionMessage()}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="stat-card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Progresso Hoje</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {stats.answeredQuestions}/{stats.totalQuestions}
            </div>
            <Progress value={stats.progressPercentage} className="mt-2 bg-blue-200" />
            <p className="text-xs text-blue-700 mt-1">
              {stats.progressPercentage.toFixed(0)}% concluído
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Pontos Ganhos</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-900">{stats.totalPoints}</div>
            <p className="text-xs text-yellow-700">
              pontos hoje
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Seções Completas</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{stats.completedSections}/3</div>
            <p className="text-xs text-green-700">
              seções finalizadas
            </p>
          </CardContent>
        </Card>

        <Card className="stat-card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Streak</CardTitle>
            <Zap className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {session?.streak_days || 0} dias
            </div>
            <p className="text-xs text-purple-700">
              Continue assim!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Seções da Missão */}
      <div className="space-y-6">
        {sections.map((section) => {
          const questions = getQuestionsBySection(section);
          const sectionAnswers = questions.filter(q => 
            answers[q.id] !== undefined || textResponses[q.id] !== undefined
          );
          const isCompleted = sectionAnswers.length === questions.length;
          const isExpanded = expandedSections.includes(section);

          return (
            <SectionCard
              key={section}
              section={section}
              questions={questions}
              answers={answers}
              textResponses={textResponses}
              onAnswer={saveAnswer}
              isExpanded={isExpanded}
              onToggleExpanded={() => toggleSection(section)}
              isCompleted={isCompleted}
            />
          );
        })}
      </div>

      {/* Botão de Finalizar */}
      {stats.progressPercentage === 100 && !session?.is_completed && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Star className="h-8 w-8 text-yellow-500" />
                <h3 className="text-2xl font-bold text-green-800">
                  Missão Completa!
                </h3>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
              
              <p className="text-green-700">
                Parabéns! Você completou todas as reflexões de hoje e ganhou{' '}
                <span className="font-bold">{stats.totalPoints} pontos</span>!
              </p>
              
              <Button
                onClick={completeDailyMission}
                disabled={isSubmitting}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3"
              >
                {isSubmitting ? (
                  <>
                    <Activity className="mr-2 h-5 w-5 animate-spin" />
                    Finalizando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Finalizar Missão do Dia
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missão já completada */}
      {session?.is_completed && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-8 w-8 text-yellow-500" />
                <h3 className="text-2xl font-bold text-blue-800">
                  Missão do Dia Concluída!
                </h3>
                <Trophy className="h-8 w-8 text-yellow-500" />
              </div>
              
              <p className="text-blue-700">
                Você completou todas as reflexões e ganhou{' '}
                <span className="font-bold">{session.total_points} pontos</span> hoje!
              </p>
              
              <div className="flex items-center justify-center gap-4 text-sm text-blue-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Volte amanhã para novas reflexões</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso Semanal */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progresso da Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => {
              const isToday = index === new Date().getDay();
              const isPast = index < new Date().getDay();
              const isCompleted = isPast || (isToday && session?.is_completed);
              
              return (
                <div key={day} className="text-center">
                  <p className="text-xs text-muted-foreground mb-2">{day}</p>
                  <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-medium ${
                    isCompleted 
                      ? 'bg-green-500 text-white' 
                      : isToday 
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}>
                    {isToday ? (session?.is_completed ? '✓' : 'Hoje') : isCompleted ? '✓' : '·'}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 