import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Users, Calendar, Target, Star, Zap, Crown } from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  category: 'weight_loss' | 'nutrition' | 'exercise' | 'habits';
  duration: number; // em dias
  participants: number;
  myProgress: number;
  target: number;
  unit: string;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard';
  startDate: Date;
  endDate: Date;
  isJoined: boolean;
  isCompleted: boolean;
  ranking?: number;
}

const SofiaChallenges: React.FC = () => {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Desafio 21 Dias - Vida Saudável',
      description: 'Transforme seus hábitos em 21 dias com alimentação balanceada, exercícios e mindfulness',
      category: 'habits',
      duration: 21,
      participants: 1247,
      myProgress: 15,
      target: 21,
      unit: 'dias',
      reward: 'Certificado + 500 pontos',
      difficulty: 'medium',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-21'),
      isJoined: true,
      isCompleted: false,
      ranking: 23
    },
    {
      id: '2',
      title: 'Meta 5kg em 30 Dias',
      description: 'Programa intensivo de perda de peso com acompanhamento diário da Sofia',
      category: 'weight_loss',
      duration: 30,
      participants: 892,
      myProgress: 2.3,
      target: 5,
      unit: 'kg',
      reward: 'Consultoria premium + 1000 pontos',
      difficulty: 'hard',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-30'),
      isJoined: true,
      isCompleted: false,
      ranking: 67
    },
    {
      id: '3',
      title: 'Hidratação Total',
      description: 'Beba 2.5L de água por dia durante 7 dias consecutivos',
      category: 'habits',
      duration: 7,
      participants: 2156,
      myProgress: 5,
      target: 7,
      unit: 'dias',
      reward: 'Badge especial + 200 pontos',
      difficulty: 'easy',
      startDate: new Date('2024-01-05'),
      endDate: new Date('2024-01-11'),
      isJoined: true,
      isCompleted: false,
      ranking: 12
    },
    {
      id: '4',
      title: 'Exercícios 15min/dia',
      description: 'Pratique pelo menos 15 minutos de exercício todos os dias por 14 dias',
      category: 'exercise',
      duration: 14,
      participants: 1674,
      myProgress: 0,
      target: 14,
      unit: 'dias',
      reward: 'Plano de treino personalizado',
      difficulty: 'medium',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-23'),
      isJoined: false,
      isCompleted: false
    },
    {
      id: '5',
      title: 'Detox Semanal',
      description: 'Uma semana sem açúcar refinado, refrigerantes e processados',
      category: 'nutrition',
      duration: 7,
      participants: 743,
      myProgress: 0,
      target: 7,
      unit: 'dias',
      reward: 'Receitas detox exclusivas',
      difficulty: 'hard',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-21'),
      isJoined: false,
      isCompleted: false
    }
  ]);

  const getCategoryIcon = (category: string) => {
    const icons = {
      weight_loss: '⚖️',
      nutrition: '🥗',
      exercise: '💪',
      habits: '🎯'
    };
    return icons[category as keyof typeof icons] || '🏆';
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      weight_loss: 'bg-blue-100 text-blue-800',
      nutrition: 'bg-green-100 text-green-800',
      exercise: 'bg-orange-100 text-orange-800',
      habits: 'bg-purple-100 text-purple-800'
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

  const handleJoinChallenge = (challengeId: string) => {
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === challengeId 
          ? { ...challenge, isJoined: true, participants: challenge.participants + 1 }
          : challenge
      )
    );
    toast.success('🎉 Você entrou no desafio! Boa sorte!');
  };

  const handleUpdateProgress = (challengeId: string) => {
    setChallenges(prev => 
      prev.map(challenge => {
        if (challenge.id === challengeId && challenge.isJoined) {
          const newProgress = Math.min(challenge.myProgress + 0.5, challenge.target);
          const isCompleted = newProgress >= challenge.target;
          
          if (isCompleted && !challenge.isCompleted) {
            toast.success(`🏆 Desafio "${challenge.title}" concluído! Parabéns!`);
          }
          
          return {
            ...challenge,
            myProgress: newProgress,
            isCompleted: isCompleted
          };
        }
        return challenge;
      })
    );
  };

  const getDaysRemaining = (endDate: Date) => {
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const myActiveChallenges = challenges.filter(c => c.isJoined && !c.isCompleted);
  const availableChallenges = challenges.filter(c => !c.isJoined);
  const completedChallenges = challenges.filter(c => c.isCompleted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🏆 Desafios</h2>
          <p className="text-gray-600">Participe de desafios e conquiste seus objetivos junto com a comunidade</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{myActiveChallenges.length}</div>
            <div className="text-sm text-gray-600">Ativos</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedChallenges.length}</div>
            <div className="text-sm text-gray-600">Concluídos</div>
          </div>
        </div>
      </div>

      {/* Meus Desafios Ativos */}
      {myActiveChallenges.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-600" />
            Meus Desafios Ativos
          </h3>
          <div className="grid gap-4">
            {myActiveChallenges.map((challenge) => {
              const progress = (challenge.myProgress / challenge.target) * 100;
              const daysRemaining = getDaysRemaining(challenge.endDate);
              
              return (
                <Card key={challenge.id} className="border-l-4 border-l-purple-500 bg-purple-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                        <div>
                          <CardTitle className="text-lg">{challenge.title}</CardTitle>
                          <p className="text-sm text-gray-600">{challenge.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {challenge.ranking && challenge.ranking <= 10 && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Crown className="h-3 w-3 mr-1" />
                            #{challenge.ranking}
                          </Badge>
                        )}
                        <Badge className={getCategoryColor(challenge.category)}>
                          {challenge.category}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progresso: {challenge.myProgress} / {challenge.target} {challenge.unit}</span>
                        <span className="font-medium text-purple-600">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {daysRemaining} dias restantes
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {challenge.participants} participantes
                        </div>
                        {challenge.ranking && (
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4" />
                            Posição #{challenge.ranking}
                          </div>
                        )}
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateProgress(challenge.id)}
                        className="gap-1"
                      >
                        <Zap className="h-4 w-4" />
                        Atualizar
                      </Button>
                    </div>

                    <div className="bg-white rounded-lg p-3 border">
                      <div className="flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">Recompensa:</span>
                        <span>{challenge.reward}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Desafios Disponíveis */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-600" />
          Desafios Disponíveis
        </h3>
        <div className="grid gap-4">
          {availableChallenges.map((challenge) => {
            const daysRemaining = getDaysRemaining(challenge.endDate);
            
            return (
              <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getCategoryIcon(challenge.category)}</span>
                      <div>
                        <CardTitle className="text-lg">{challenge.title}</CardTitle>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(challenge.category)}>
                        {challenge.category}
                      </Badge>
                      <Badge className={getDifficultyColor(challenge.difficulty)}>
                        {challenge.difficulty}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {challenge.duration} dias
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {challenge.participants} participantes
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4" />
                        {daysRemaining} dias para entrar
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleJoinChallenge(challenge.id)}
                      className="gap-1 bg-gradient-to-r from-green-600 to-emerald-600"
                    >
                      <Trophy className="h-4 w-4" />
                      Participar
                    </Button>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border">
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">Recompensa:</span>
                      <span>{challenge.reward}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Estado vazio */}
      {challenges.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum desafio disponível</h3>
            <p className="text-gray-600">
              Novos desafios serão criados em breve! Continue acompanhando.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SofiaChallenges;