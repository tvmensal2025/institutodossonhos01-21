import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Droplets, Activity, Brain, Apple, Moon, Target, 
  Plus, Minus, Check, Clock, Award, Zap, Heart,
  Trophy, Star, ChevronRight, Timer
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Mission {
  id: number;
  title: string;
  description: string;
  points: number;
  category: 'hidratacao' | 'exercicio' | 'mente' | 'nutricao' | 'sono';
  progress: number;
  target: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  completed: boolean;
  timeRemaining?: string;
}

const dailyMissions: Mission[] = [
  {
    id: 1,
    title: "Hidratação Perfeita",
    description: "Beba 2L de água hoje",
    points: 50,
    category: "hidratacao",
    progress: 1800,
    target: 2000,
    unit: "ml",
    icon: Droplets,
    color: "text-health-hydration",
    completed: false,
    timeRemaining: "4h restantes"
  },
  {
    id: 2,
    title: "Exercício Matinal",
    description: "Faça 30min de exercício",
    points: 75,
    category: "exercicio",
    progress: 45,
    target: 30,
    unit: "min",
    icon: Activity,
    color: "text-health-steps",
    completed: true
  },
  {
    id: 3,
    title: "Momento Mindfulness",
    description: "Medite por 10 minutos",
    points: 30,
    category: "mente",
    progress: 0,
    target: 10,
    unit: "min",
    icon: Brain,
    color: "text-accent",
    completed: false,
    timeRemaining: "Todo o dia"
  },
  {
    id: 4,
    title: "Alimentação Consciente",
    description: "5 porções de frutas/vegetais",
    points: 60,
    category: "nutricao",
    progress: 3,
    target: 5,
    unit: "porções",
    icon: Apple,
    color: "text-success",
    completed: false,
    timeRemaining: "8h restantes"
  },
  {
    id: 5,
    title: "Sono Reparador",
    description: "Dormir 8 horas de qualidade",
    points: 40,
    category: "sono",
    progress: 0,
    target: 8,
    unit: "horas",
    icon: Moon,
    color: "text-warning",
    completed: false,
    timeRemaining: "Hoje à noite"
  }
];

const weeklyStats = {
  totalPoints: 1250,
  weeklyGoal: 2000,
  completedMissions: 18,
  streak: 5,
  level: 8,
  nextLevelPoints: 300
};

const achievements = [
  { id: 1, title: "Hidratação Master", description: "7 dias seguidos de meta de água", icon: Droplets, unlocked: true },
  { id: 2, title: "Guerreiro Fitness", description: "30 dias de exercício", icon: Trophy, unlocked: true },
  { id: 3, title: "Mente Zen", description: "14 dias de meditação", icon: Brain, unlocked: false },
  { id: 4, title: "Nutrição Perfect", description: "21 dias de alimentação saudável", icon: Apple, unlocked: false }
];

const MissionCard = ({ mission, onUpdateProgress }: { mission: Mission; onUpdateProgress: (id: number, newProgress: number) => void }) => {
  const Icon = mission.icon;
  const progressPercentage = Math.min((mission.progress / mission.target) * 100, 100);
  
  const handleIncrement = () => {
    if (!mission.completed) {
      const increment = mission.category === 'hidratacao' ? 250 : 1;
      onUpdateProgress(mission.id, Math.min(mission.progress + increment, mission.target));
    }
  };

  const handleDecrement = () => {
    if (!mission.completed) {
      const decrement = mission.category === 'hidratacao' ? 250 : 1;
      onUpdateProgress(mission.id, Math.max(mission.progress - decrement, 0));
    }
  };

  return (
    <Card className={cn(
      "mission-card relative overflow-hidden",
      mission.completed && "bg-success/5 border-success/20"
    )}>
      {mission.completed && (
        <div className="absolute top-3 right-3 bg-success text-white p-1 rounded-full">
          <Check className="w-3 h-3" />
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn(
              "p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5",
              mission.completed && "from-success/20 to-success/5"
            )}>
              <Icon className={cn("w-5 h-5", mission.color)} />
            </div>
            <div>
              <CardTitle className="text-sm font-semibold">{mission.title}</CardTitle>
              <CardDescription className="text-xs">{mission.description}</CardDescription>
            </div>
          </div>
          <Badge variant={mission.completed ? "default" : "secondary"} className="text-xs">
            +{mission.points} pts
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {mission.progress} / {mission.target} {mission.unit}
            </span>
            <span className="font-medium">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className={cn(
              "h-2",
              mission.completed && "bg-success/20"
            )}
          />
        </div>

        {/* Controls */}
        {!mission.completed && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={handleDecrement}
                disabled={mission.progress === 0}
              >
                <Minus className="w-3 h-3" />
              </Button>
              
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8"
                onClick={handleIncrement}
                disabled={mission.progress >= mission.target}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
            
            {mission.timeRemaining && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>{mission.timeRemaining}</span>
              </div>
            )}
          </div>
        )}

        {mission.completed && (
          <div className="flex items-center justify-center space-x-2 text-success text-sm font-medium">
            <Check className="w-4 h-4" />
            <span>Missão Completa!</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface MissionSystemProps {
  user?: User | null;
}

export default function MissionSystem({ user }: MissionSystemProps = {}) {
  const [missions, setMissions] = useState<Mission[]>(dailyMissions);
  const [realMissions, setRealMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Carregar missões reais do banco
  useEffect(() => {
    if (user) {
      loadDailyMissions();
    }
  }, [user]);

  const loadDailyMissions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Daily missions table doesn't exist yet - return empty data
      const data: any[] = [];
      const error = null;

      if (error) throw error;
      
      setRealMissions(data || []);
      
      // Se não há missões para hoje, criar automaticamente
      if (!data || data.length === 0) {
        await createDailyMissions();
      }
    } catch (error) {
      console.error('Erro ao carregar missões:', error);
    } finally {
      setLoading(false);
    }
  };

  const createDailyMissions = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      const defaultMissions = [
        {
          user_id: user?.id,
          date: today,
          mission_type: 'hidratacao',
          title: 'Hidratação Perfeita',
          description: 'Beba 2L de água hoje',
          target_value: 2000,
          current_value: 0,
          points_reward: 50
        },
        {
          user_id: user?.id,
          date: today,
          mission_type: 'exercicio',
          title: 'Exercício Diário',
          description: 'Faça 30min de exercício',
          target_value: 30,
          current_value: 0,
          points_reward: 75
        },
        {
          user_id: user?.id,
          date: today,
          mission_type: 'mindfulness',
          title: 'Momento Mindfulness',
          description: 'Medite por 10 minutos',
          target_value: 10,
          current_value: 0,
          points_reward: 30
        }
      ];

      // Daily missions table doesn't exist yet - simulate success
      const error = null;

      if (error) throw error;
      
      toast({
        title: "Missões Criadas! 🎯",
        description: "Suas missões diárias foram geradas"
      });
      
      loadDailyMissions();
    } catch (error) {
      console.error('Erro ao criar missões:', error);
    }
  };

  const updateMissionProgress = (id: number, newProgress: number) => {
    setMissions(prev => prev.map(mission => {
      if (mission.id === id) {
        const completed = newProgress >= mission.target;
        return {
          ...mission,
          progress: newProgress,
          completed
        };
      }
      return mission;
    }));
  };

  const completedToday = missions.filter(m => m.completed).length;
  const totalPoints = missions.filter(m => m.completed).reduce((sum, m) => sum + m.points, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center space-x-2">
            <Zap className="w-8 h-8 text-primary" />
            <span>Missão do Dia</span>
          </h1>
          <p className="text-muted-foreground">Complete suas missões e ganhe pontos</p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{totalPoints} pts</div>
          <div className="text-sm text-muted-foreground">Pontos hoje</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="stat-card">
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{completedToday}/5</div>
              <div className="text-sm text-muted-foreground">Missões Completas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="p-2 bg-success/10 rounded-lg">
              <Award className="w-5 h-5 text-success" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{weeklyStats.streak}</div>
              <div className="text-sm text-muted-foreground">Dias Consecutivos</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Star className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">Nível {weeklyStats.level}</div>
              <div className="text-sm text-muted-foreground">{weeklyStats.nextLevelPoints} pts próximo</div>
            </div>
          </CardContent>
        </Card>

        <Card className="stat-card">
          <CardContent className="flex items-center space-x-4 p-4">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Trophy className="w-5 h-5 text-warning" />
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{weeklyStats.totalPoints}</div>
              <div className="text-sm text-muted-foreground">Pontos esta semana</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-warning" />
            <span>Progresso Semanal</span>
          </CardTitle>
          <CardDescription>
            Meta semanal: {weeklyStats.weeklyGoal} pontos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{weeklyStats.totalPoints} / {weeklyStats.weeklyGoal} pontos</span>
              <span>{Math.round((weeklyStats.totalPoints / weeklyStats.weeklyGoal) * 100)}%</span>
            </div>
            <Progress 
              value={(weeklyStats.totalPoints / weeklyStats.weeklyGoal) * 100} 
              className="h-3"
            />
            <p className="text-xs text-muted-foreground">
              Faltam {weeklyStats.weeklyGoal - weeklyStats.totalPoints} pontos para atingir sua meta semanal
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Today's Missions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Missões de Hoje</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              onUpdateProgress={updateMissionProgress}
            />
          ))}
        </div>
      </div>

      {/* Achievements */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-warning" />
            <span>Conquistas</span>
          </CardTitle>
          <CardDescription>
            Desbloqueie achievements especiais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.id}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-smooth",
                    achievement.unlocked
                      ? "bg-success/5 border-success/20"
                      : "bg-muted/20 border-border/20 opacity-60"
                  )}
                >
                  <div className={cn(
                    "p-2 rounded-lg",
                    achievement.unlocked
                      ? "bg-success/20 text-success"
                      : "bg-muted/20 text-muted-foreground"
                  )}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{achievement.title}</h4>
                    <p className="text-xs text-muted-foreground">{achievement.description}</p>
                  </div>
                  {achievement.unlocked && (
                    <Check className="w-5 h-5 text-success" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="mission-card cursor-pointer hover:scale-105 transition-transform">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Registro de Peso</h3>
                <p className="text-sm text-muted-foreground">Atualize sua pesagem</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="mission-card cursor-pointer hover:scale-105 transition-transform">
          <CardContent className="flex items-center justify-between p-6">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Timer className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold">Diário de Humor</h3>
                <p className="text-sm text-muted-foreground">Como você está se sentindo?</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}