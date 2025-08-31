import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Star, Flame, Users, Calendar } from 'lucide-react';
import { useEnhancedGamification } from '@/hooks/useEnhancedGamification';
import { useToast } from '@/hooks/use-toast';
import { useTrackingData } from '@/hooks/useTrackingData';
import { ProgressRing } from './ProgressRing';
import { StreakCounter } from './StreakCounter';
import { BadgeSystem } from './BadgeSystem';
import { LevelSystem } from './LevelSystem';
import { DailyChallenge } from './DailyChallenge';
import { CountdownTimer } from './CountdownTimer';
import { TrackingDashboard } from '@/components/tracking/TrackingDashboard';

export const GamifiedDashboard = () => {
  const { 
    gamificationData, 
    isLoading, 
    completeChallenge, 
    updateChallengeProgress,
    getTrackingProgress 
  } = useEnhancedGamification();
  
  const { trackingData } = useTrackingData();
  const { toast } = useToast();

  // Win-back simples: usuário inativo por 72h
  useEffect(() => {
    if (!gamificationData?.lastActivityDate) return;
    const INACTIVITY_MS = 72 * 60 * 60 * 1000;
    const last = new Date(gamificationData.lastActivityDate).getTime() || 0;
    const inactive72h = Date.now() - last > INACTIVITY_MS;

    const key = 'winbackShownAt';
    const lastShown = Number(localStorage.getItem(key) || 0);
    const shownToday = Date.now() - lastShown < 24 * 60 * 60 * 1000;

    if (inactive72h && !shownToday) {
      toast({
        title: 'Missão de Retorno',
        description: 'Conclua 1 micro‑hábito e ganhe 2x XP!',
      });
      localStorage.setItem(key, String(Date.now()));
    }
  }, [gamificationData?.lastActivityDate, toast]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!gamificationData) return null;

  const {
    currentLevel,
    currentXP,
    xpToNextLevel,
    totalXP,
    currentStreak,
    bestStreak,
    badges,
    dailyChallenges,
    achievements,
    rank
  } = gamificationData;

  return (
    <div className="space-y-6">
      {/* Header com Level System */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <LevelSystem
          currentLevel={currentLevel}
          currentXP={currentXP}
          xpToNextLevel={xpToNextLevel}
          totalXP={totalXP}
          achievements={achievements}
          rank={rank}
          animated={true}
        />
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-300" />
              <div className="text-2xl font-bold">{achievements}</div>
              <div className="text-sm text-blue-100">Conquistas</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6">
              <Target className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{Math.floor(Math.random() * 20) + 5}</div>
              <div className="text-sm text-green-100">Metas Ativas</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
            <CardContent className="p-6">
              <Flame className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">{currentStreak}</div>
              <div className="text-sm text-orange-100">Sequência</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mx-auto mb-2" />
              <div className="text-2xl font-bold">#{Math.floor(Math.random() * 100) + 1}</div>
              <div className="text-sm text-purple-100">Ranking</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Star className="w-4 h-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="challenges" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Desafios
          </TabsTrigger>
          <TabsTrigger value="badges" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Comunidade
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Progress Ring e Streak */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Progresso Hoje
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <ProgressRing
                    progress={gamificationData ? (gamificationData.currentXP / 1000) * 100 : 0}
                    size={150}
                    strokeWidth={8}
                    gradientColors={['hsl(var(--primary))', 'hsl(var(--accent))']}
                    animated={true}
                  >
                    <div className="text-center">
                      <div className="text-2xl font-bold">{gamificationData?.currentXP || 0}</div>
                      <div className="text-sm text-muted-foreground">XP no nível</div>
                    </div>
                  </ProgressRing>
                </CardContent>
              </Card>

              <StreakCounter
                currentStreak={currentStreak}
                bestStreak={bestStreak}
                isActive={true}
                type="daily"
                label="Sequência de progresso"
              />
            </div>

            {/* Desafios Diários */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Desafios de Hoje
              </h3>
              {dailyChallenges.map((challenge) => (
                <Card key={challenge.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium">{challenge.title}</h4>
                      <p className="text-sm text-muted-foreground">{challenge.description}</p>
                    </div>
                    <div className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                      +{challenge.xp_reward} XP
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{challenge.progress}/{challenge.target_value}</span>
                    </div>
                    <Progress 
                      value={(challenge.progress / challenge.target_value) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  {!challenge.is_completed && (
                    <Button
                      onClick={() => completeChallenge(challenge.id)}
                      className="w-full mt-3"
                      size="sm"
                    >
                      Concluir Desafio
                    </Button>
                  )}
                  
                  {challenge.is_completed && (
                    <div className="mt-3 text-center text-green-600 font-medium text-sm">
                      ✅ Completado!
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
          
          {/* Widget de Tracking */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Seu Tracking de Hoje</h3>
            <TrackingDashboard />
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <h2 className="text-2xl font-bold">Desafios Disponíveis</h2>
            
            {/* Countdown para próximo desafio */}
            <CountdownTimer
              targetDate={new Date(Date.now() + 6 * 60 * 60 * 1000)} // 6 horas
              title="Próximo Desafio Especial"
              description="Desafio da Comunidade: Meta Coletiva de 1000 pontos"
              urgentThreshold={8}
              criticalThreshold={2}
              onComplete={() => console.log('Novo desafio disponível!')}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {dailyChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                <DailyChallenge
                  challenge={{
                    id: challenge.id,
                    title: challenge.title,
                    category: challenge.category || 'geral',
                    type: (challenge.challenge_type === 'community' ? 'community' : 'individual') as 'individual' | 'community',
                    target_value: challenge.target_value || 1,
                    current: 0,
                    unit: 'pontos',
                    description: challenge.description || '',
                    difficulty: (challenge.difficulty === 'medium' || challenge.difficulty === 'hard') ? challenge.difficulty : 'easy' as 'easy' | 'medium' | 'hard',
                    xp_reward: challenge.xp_reward || 50,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
                    completed: false
                  }}
                  onComplete={completeChallenge}
                  showParticipants={true}
                  animated={true}
                />
                </motion.div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-6">Sistema de Conquistas</h2>
            <BadgeSystem
              badges={badges}
              showProgress={true}
              layout="grid"
              animated={true}
            />
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Ranking da Comunidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((position) => (
                    <div key={position} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          position === 1 ? 'bg-yellow-500' :
                          position === 2 ? 'bg-gray-400' :
                          position === 3 ? 'bg-amber-600' : 'bg-blue-500'
                        }`}>
                          {position}
                        </div>
                        <div>
                          <div className="font-medium">Usuário {position}</div>
                          <div className="text-sm text-muted-foreground">Nível {10 - position + currentLevel}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">{(50000 - position * 5000).toLocaleString()} XP</div>
                        <div className="text-sm text-muted-foreground">{20 - position} conquistas</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade da Comunidade</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">🏆 Ana completou o desafio "Hidratação Diária"</div>
                    <div className="text-sm text-muted-foreground">há 2 minutos</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">🔥 João mantém sequência de 15 dias!</div>
                    <div className="text-sm text-muted-foreground">há 5 minutos</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium">⭐ Maria subiu para o Nível 8</div>
                    <div className="text-sm text-muted-foreground">há 10 minutos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};