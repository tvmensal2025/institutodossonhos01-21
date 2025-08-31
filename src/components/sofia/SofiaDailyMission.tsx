import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Star, Target, Trophy, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: 'nutrition' | 'exercise' | 'habits' | 'wellness';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  progress: number;
  target: number;
  completed: boolean;
  streak: number;
}

const SofiaDailyMission: React.FC = () => {
  const [missions, setMissions] = useState<DailyMission[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [completedMissions, setCompletedMissions] = useState(0);

  useEffect(() => {
    // Gerar missões diárias baseadas na data atual
    const generateDailyMissions = () => {
      const today = new Date();
      const dayOfWeek = today.getDay();
      
      const allMissions = [
        {
          id: '1',
          title: 'Hidratação Consciente',
          description: 'Beba 8 copos de água ao longo do dia',
          category: 'habits' as const,
          difficulty: 'easy' as const,
          points: 50,
          progress: 5,
          target: 8,
          completed: false,
          streak: 3
        },
        {
          id: '2',
          title: 'Refeição Balanceada',
          description: 'Inclua proteína, carboidrato e vegetais no almoço',
          category: 'nutrition' as const,
          difficulty: 'medium' as const,
          points: 75,
          progress: 0,
          target: 1,
          completed: false,
          streak: 1
        },
        {
          id: '3',
          title: 'Movimento Diário',
          description: 'Realize 30 minutos de atividade física',
          category: 'exercise' as const,
          difficulty: 'medium' as const,
          points: 100,
          progress: 15,
          target: 30,
          completed: false,
          streak: 0
        },
        {
          id: '4',
          title: 'Mindfulness',
          description: 'Pratique 10 minutos de meditação ou respiração',
          category: 'wellness' as const,
          difficulty: 'easy' as const,
          points: 60,
          progress: 0,
          target: 10,
          completed: false,
          streak: 2
        }
      ];

      // Selecionar 3 missões baseadas no dia da semana
      const selectedMissions = allMissions.slice(0, 3);
      setMissions(selectedMissions);
      
      const completed = selectedMissions.filter(m => m.completed).length;
      setCompletedMissions(completed);
      
      const points = selectedMissions.reduce((acc, m) => acc + (m.completed ? m.points : 0), 0);
      setTotalPoints(points);
    };

    generateDailyMissions();
  }, []);

  const getCategoryIcon = (category: string) => {
    const icons = {
      nutrition: '🥗',
      exercise: '💪',
      habits: '💧',
      wellness: '🧘‍♀️'
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      nutrition: 'bg-green-100 text-green-800',
      exercise: 'bg-orange-100 text-orange-800',
      habits: 'bg-blue-100 text-blue-800',
      wellness: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleUpdateProgress = (missionId: string) => {
    setMissions(prev => prev.map(mission => {
      if (mission.id === missionId && !mission.completed) {
        const newProgress = Math.min(mission.progress + 1, mission.target);
        const isCompleted = newProgress >= mission.target;
        
        if (isCompleted && !mission.completed) {
          toast.success(`🎉 Missão "${mission.title}" concluída! +${mission.points} pontos!`);
          setTotalPoints(prev => prev + mission.points);
          setCompletedMissions(prev => prev + 1);
        }
        
        return {
          ...mission,
          progress: newProgress,
          completed: isCompleted
        };
      }
      return mission;
    }));
  };

  const handleCompleteAll = () => {
    setMissions(prev => prev.map(mission => ({
      ...mission,
      progress: mission.target,
      completed: true
    })));
    
    const remainingPoints = missions
      .filter(m => !m.completed)
      .reduce((acc, m) => acc + m.points, 0);
    
    setTotalPoints(prev => prev + remainingPoints);
    setCompletedMissions(missions.length);
    toast.success('🚀 Todas as missões concluídas! Você é incrível!');
  };

  const overallProgress = missions.length > 0 ? (completedMissions / missions.length) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎯 Missão do Dia</h2>
          <p className="text-gray-600">Complete suas missões diárias e ganhe pontos!</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalPoints}</div>
            <div className="text-sm text-gray-600">Pontos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedMissions}/{missions.length}</div>
            <div className="text-sm text-gray-600">Concluídas</div>
          </div>
        </div>
      </div>

      {/* Progresso Geral */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-6 w-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Progresso Diário</h3>
                <p className="text-sm text-gray-600">
                  {completedMissions === missions.length ? 
                    '🎉 Todas as missões concluídas!' : 
                    `${missions.length - completedMissions} missões restantes`
                  }
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600">{Math.round(overallProgress)}%</div>
              <div className="text-sm text-gray-600">Completo</div>
            </div>
          </div>
          <Progress value={overallProgress} className="h-3" />
          {overallProgress === 100 && (
            <div className="mt-4 text-center">
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                Missão Diária Completa!
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lista de Missões */}
      <div className="grid gap-4">
        {missions.map((mission) => {
          const progress = (mission.progress / mission.target) * 100;
          
          return (
            <Card 
              key={mission.id} 
              className={`transition-all hover:shadow-md ${
                mission.completed ? 'border-green-300 bg-green-50' : 'border-gray-200'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(mission.category)}</span>
                    <div>
                      <CardTitle className={`text-lg ${mission.completed ? 'line-through text-gray-500' : ''}`}>
                        {mission.title}
                      </CardTitle>
                      <p className="text-sm text-gray-600">{mission.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(mission.category)}>
                      {mission.category}
                    </Badge>
                    <Badge className={getDifficultyColor(mission.difficulty)}>
                      {mission.difficulty}
                    </Badge>
                    {mission.completed && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>
                      Progresso: {mission.progress} / {mission.target} 
                      {mission.category === 'habits' ? ' copos' : 
                       mission.category === 'exercise' ? ' min' : 
                       mission.category === 'nutrition' ? ' refeição' : ' min'}
                    </span>
                    <span className={`font-medium ${mission.completed ? 'text-green-600' : 'text-purple-600'}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Zap className="h-4 w-4" />
                      {mission.points} pontos
                    </div>
                    {mission.streak > 0 && (
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4" />
                        {mission.streak} dias seguidos
                      </div>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    variant={mission.completed ? "outline" : "default"}
                    onClick={() => handleUpdateProgress(mission.id)}
                    disabled={mission.completed}
                    className="gap-1"
                  >
                    {mission.completed ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Concluída!
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4" />
                        Atualizar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Ações Rápidas */}
      <div className="flex justify-center">
        <Button 
          onClick={handleCompleteAll}
          disabled={completedMissions === missions.length}
          className="gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
        >
          <Star className="h-4 w-4" />
          {completedMissions === missions.length ? 'Tudo Concluído!' : 'Concluir Todas'}
        </Button>
      </div>

      {missions.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Carregando missões diárias...</h3>
            <p className="text-gray-600">
              A Sofia está preparando suas missões personalizadas!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SofiaDailyMission;