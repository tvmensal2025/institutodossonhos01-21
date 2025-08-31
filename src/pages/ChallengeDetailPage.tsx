import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Calendar, 
  Trophy, 
  Users, 
  Star,
  Target,
  Lightbulb,
  BookOpen,
  TrendingUp,
  Award,
  Clock,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UpdateChallengeProgressModal } from '@/components/gamification/UpdateChallengeProgressModal';
import { DailyChallenge } from '@/components/gamification/DailyChallenge';
import { useEnhancedGamification } from '@/hooks/useEnhancedGamification';

// Mock data for challenge details
const mockChallengeDetail = {
  id: '1',
  title: 'Hidratação Diária',
  description: 'Beba 2L de água todos os dias',
  duration: 7,
  reward: 50,
  difficulty: 'easy' as const,
  category: 'Saúde',
  instructions: [
    'Beba pelo menos 2 litros de água',
    'Distribua o consumo ao longo do dia',
    'Use um app para lembrar'
  ],
  tips: [
    'Use um aplicativo para lembrar',
    'Tenha sempre uma garrafa por perto',
    'Adicione limão para dar sabor'
  ],
  target: 14, // 2L x 7 dias
  current: 3,
  unit: 'litros',
  type: 'individual' as const,
  participants: 684,
  completionRate: 63,
  startedToday: 17,
  completedToday: 0,
  topParticipants: [
    { name: 'Em breve', completion: '95%', streak: '7 dias', avatar: '🌟' },
    { name: 'Em breve', completion: '88%', streak: '5 dias', avatar: '🚀' },
    { name: 'Em breve', completion: '82%', streak: '4 dias', avatar: '💪' },
    { name: 'Em breve', completion: '78%', streak: '3 dias', avatar: '🎯' },
    { name: 'Em breve', completion: '75%', streak: '6 dias', avatar: '⭐' }
  ],
  activeGroups: [
    { name: 'Guerreiros da Saúde', members: 24 }
  ]
};

const mockPopularChallenges: DailyChallenge[] = [
  {
    id: '2',
    title: 'Exercício Matinal',
    description: '30 minutos de exercício toda manhã',
    type: 'individual',
    difficulty: 'medium',
    category: 'Fitness',
    target_value: 7,
    current: 2,
    unit: 'dias',
    xp_reward: 100,
    expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
    completed: false,
    participants: 523
  },
  {
    id: '3',
    title: 'Meditação Diária',
    description: '10 minutos de meditação por dia',
    type: 'community',
    difficulty: 'easy',
    category: 'Mental',
    target_value: 10,
    current: 0,
    unit: 'sessões',
    xp_reward: 75,
    expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    completed: false,
    participants: 892,
    completedBy: 234
  }
];

export default function ChallengeDetailPage() {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { gamificationData } = useEnhancedGamification();
  const [isParticipating, setIsParticipating] = useState(false);
  
  const challenge = mockChallengeDetail;
  const progress = (challenge.current / challenge.target) * 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'from-green-500 to-green-600';
      case 'medium': return 'from-yellow-500 to-orange-500';
      case 'hard': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const handleParticipate = () => {
    setIsParticipating(true);
  };

  return (
    <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-14 items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className="text-lg font-semibold">Detalhes do Desafio</h1>
          </div>
        </div>

        <div className="container mx-auto p-4 sm:p-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Challenge Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 bg-gradient-to-br ${getDifficultyColor(challenge.difficulty)} rounded-full`}>
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold">{challenge.title}</h1>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        Fácil
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">{challenge.category}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
                  <div className="space-y-1">
                    <Calendar className="w-5 h-5 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Duração</p>
                    <p className="font-semibold">{challenge.duration} dias</p>
                  </div>
                  <div className="space-y-1">
                    <Trophy className="w-5 h-5 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Recompensa</p>
                    <p className="font-semibold">{challenge.reward} pontos</p>
                  </div>
                  <div className="space-y-1">
                    <Users className="w-5 h-5 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Participantes</p>
                    <p className="font-semibold">{challenge.participants}</p>
                  </div>
                  <div className="space-y-1">
                    <TrendingUp className="w-5 h-5 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Taxa de Conclusão</p>
                    <p className="font-semibold">{challenge.completionRate}%</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Descrição do Desafio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg mb-4">{challenge.description}</p>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Instruções:</h4>
                    <ul className="space-y-1">
                      {challenge.instructions.map((instruction, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Dicas:
                    </h4>
                    <ul className="space-y-1">
                      {challenge.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-yellow-500">💡</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-6">
                  {isParticipating ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progresso Atual</span>
                        <span className="text-sm text-muted-foreground">
                          {challenge.current}/{challenge.target} {challenge.unit}
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                      <p className="text-sm text-muted-foreground">
                        {Math.round(progress)}% completo
                      </p>
                      
                      <div className="flex gap-2">
                        <UpdateChallengeProgressModal 
                          challengeId={challenge.id}
                          challengeTitle={challenge.title}
                          currentProgress={progress}
                          onProgressUpdate={(newProgress) => {
                            console.log('Progresso atualizado:', newProgress);
                          }}
                        >
                          <Button className="flex-1">
                            <Target className="w-4 h-4 mr-2" />
                            Atualizar Progresso
                          </Button>
                        </UpdateChallengeProgressModal>
                      </div>
                    </div>
                  ) : (
                    <Button 
                      size="lg" 
                      className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                      onClick={handleParticipate}
                    >
                      Participar do Desafio
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Popular Challenges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Outros Desafios Populares
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {mockPopularChallenges.map((challenge) => (
                    <DailyChallenge 
                      key={challenge.id} 
                      challenge={challenge}
                      showParticipants={false}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{challenge.participants}</div>
                    <div className="text-sm text-blue-600">Participantes</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{challenge.completionRate}%</div>
                    <div className="text-sm text-green-600">Taxa de Conclusão</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Iniciados hoje</span>
                    <span className="font-medium">{challenge.startedToday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Concluídos hoje</span>
                    <span className="font-medium">{challenge.completedToday}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Recompensa</span>
                    <span className="font-medium text-orange-600">{challenge.reward} XP</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Participants */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Participantes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenge.topParticipants.map((participant, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium w-4">#{index + 1}</span>
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {participant.avatar}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{participant.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {participant.completion} concluído • {participant.streak}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button variant="outline" size="sm" className="w-full mt-4">
                  Ver Ranking Completo
                </Button>
              </CardContent>
            </Card>

            {/* Active Groups */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Grupos Ativos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {challenge.activeGroups.map((group, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{group.name}</p>
                        <p className="text-sm text-muted-foreground">{group.members} membros</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Atividade alta
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}