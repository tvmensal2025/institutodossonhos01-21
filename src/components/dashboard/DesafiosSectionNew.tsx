import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Trophy, Users, Calendar, Target, Dumbbell, 
  Droplets, Brain, Apple, Moon, Scale, Timer, ArrowLeft, 
  Star, Zap, CheckCircle, Plus, Flame, Crown, Medal
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { UpdateDesafioProgressModal } from '@/components/gamification/UpdateDesafioProgressModal';
import { User } from '@supabase/supabase-js';
import { VisualEffectsManager } from '@/components/gamification/VisualEffectsManager';
import { useCelebrationEffects } from '@/hooks/useCelebrationEffects';

interface Desafio {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration_days: number;
  points_reward: number;
  badge_icon: string;
  badge_name: string;
  instructions: string;
  tips: string[];
  is_active: boolean;
  is_featured: boolean;
  is_group_challenge: boolean;
  daily_log_target: number;
  daily_log_unit: string;
  user_participation?: {
    id: string;
    progress: number;
    is_completed: boolean;
    started_at: string;
  };
  participants_count?: number;
  total_participants?: number;
}

interface RankingUser {
  id: string;
  name: string;
  avatar?: string;
  progress: number;
  points: number;
  position: number;
  badge?: string;
  is_current_user?: boolean;
}

interface DesafiosSectionProps {
  user: User | null;
}

const difficultyColors = {
  facil: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 dark:from-emerald-900 dark:to-green-900 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700',
  medio: 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 dark:from-amber-900 dark:to-orange-900 dark:text-amber-300 border border-amber-200 dark:border-amber-700',
  dificil: 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 dark:from-red-900 dark:to-pink-900 dark:text-red-300 border border-red-200 dark:border-red-700'
};

const difficultyLabels = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil'
};

// Dados de exemplo para demonstração
const desafiosExemplo: Desafio[] = [
  {
    id: 'demo-1',
    title: 'Beber 2L de Água Diariamente',
    description: 'Mantenha-se hidratado bebendo pelo menos 2 litros de água por dia',
    category: 'Hidratação',
    difficulty: 'facil',
    duration_days: 30,
    points_reward: 50,
    badge_icon: '💧',
    badge_name: 'Hidratação Master',
    instructions: 'Beba água regularmente ao longo do dia. Use um aplicativo ou marque em uma garrafa para acompanhar.',
    tips: ['Tenha sempre uma garrafa de água por perto', 'Beba um copo ao acordar', 'Use apps para lembrar'],
    is_active: true,
    is_featured: true,
    is_group_challenge: false,
    daily_log_target: 2000,
    daily_log_unit: 'ml',
    user_participation: {
      id: 'part-1',
      progress: 1200,
      is_completed: false,
      started_at: new Date().toISOString()
    }
  },
  {
    id: 'demo-2',
    title: 'Caminhar 8000 Passos',
    description: 'Dê pelo menos 8000 passos todos os dias para manter-se ativo',
    category: 'Atividade Física',
    difficulty: 'medio',
    duration_days: 30,
    points_reward: 75,
    badge_icon: '🚶‍♂️',
    badge_name: 'Caminhador Dedicado',
    instructions: 'Use um contador de passos ou app no celular. Caminhe durante as ligações, use escadas.',
    tips: ['Estacione mais longe', 'Use escadas', 'Caminhe durante ligações'],
    is_active: true,
    is_featured: true,
    is_group_challenge: false,
    daily_log_target: 8000,
    daily_log_unit: 'passos',
    user_participation: {
      id: 'part-2',
      progress: 5500,
      is_completed: false,
      started_at: new Date().toISOString()
    }
  },
  {
    id: 'demo-3',
    title: 'Exercitar-se 30 Minutos',
    description: 'Faça pelo menos 30 minutos de exercício físico moderado',
    category: 'Atividade Física',
    difficulty: 'dificil',
    duration_days: 30,
    points_reward: 120,
    badge_icon: '💪',
    badge_name: 'Atleta Dedicado',
    instructions: 'Pode ser academia, corrida, natação, dança ou esportes. O importante é mover o corpo.',
    tips: ['Escolha atividade prazerosa', 'Comece gradualmente', 'Varie os exercícios'],
    is_active: true,
    is_featured: true,
    is_group_challenge: false,
    daily_log_target: 30,
    daily_log_unit: 'minutos',
    user_participation: {
      id: 'part-3',
      progress: 25,
      is_completed: false,
      started_at: new Date().toISOString()
    }
  },
  {
    id: 'demo-4',
    title: 'Meditar 10 Minutos',
    description: 'Pratique meditação ou mindfulness por 10 minutos diários',
    category: 'Bem-estar Mental',
    difficulty: 'facil',
    duration_days: 21,
    points_reward: 60,
    badge_icon: '🧘‍♀️',
    badge_name: 'Mente Zen',
    instructions: 'Use apps como Headspace, Calm ou pratique respiração profunda. Encontre um local tranquilo.',
    tips: ['Comece com 5 minutos', 'Use apps guiados', 'Pratique sempre no mesmo horário'],
    is_active: true,
    is_featured: false,
    is_group_challenge: false,
    daily_log_target: 10,
    daily_log_unit: 'minutos',
    user_participation: {
      id: 'part-4',
      progress: 10,
      is_completed: true,
      started_at: new Date().toISOString()
    }
  }
];

// Desafios Públicos/Comunitários
const desafiosPublicosExemplo: Desafio[] = [
  {
    id: 'publico-1',
    title: '💧 Hidratação em Grupo - Janeiro 2025',
    description: 'Desafio comunitário: Vamos todos beber 2.5L de água por dia durante todo janeiro!',
    category: 'Hidratação',
    difficulty: 'facil',
    duration_days: 31,
    points_reward: 150,
    badge_icon: '💧',
    badge_name: 'Hidratação Comunitária',
    instructions: 'Junte-se à comunidade e mantenha-se hidratado. Registre seu progresso diário!',
    tips: ['Beba um copo ao acordar', 'Use uma garrafa marcada', 'Apoie outros participantes'],
    is_active: true,
    is_featured: true,
    is_group_challenge: true,
    daily_log_target: 2500,
    daily_log_unit: 'ml',
    participants_count: 847,
    total_participants: 1000,
    user_participation: {
      id: 'pub-part-1',
      progress: 2100,
      is_completed: false,
      started_at: new Date().toISOString()
    }
  },
  {
    id: 'publico-2',
    title: '🚶‍♀️ Caminhada Matinal Coletiva',
    description: 'Desafio: 30 minutos de caminhada toda manhã. Vamos começar o dia com energia!',
    category: 'Atividade Física',
    difficulty: 'facil',
    duration_days: 21,
    points_reward: 200,
    badge_icon: '🚶‍♀️',
    badge_name: 'Caminhador Matinal',
    instructions: 'Caminhe 30 minutos todas as manhãs e compartilhe sua energia com a comunidade!',
    tips: ['Acorde 30min mais cedo', 'Convide um amigo', 'Ouça música ou podcast'],
    is_active: true,
    is_featured: true,
    is_group_challenge: true,
    daily_log_target: 30,
    daily_log_unit: 'minutos',
    participants_count: 623,
    total_participants: 800,
    user_participation: {
      id: 'pub-part-2',
      progress: 25,
      is_completed: false,
      started_at: new Date().toISOString()
    }
  },
  {
    id: 'publico-3',
    title: '💪 Guerreiros do Treino',
    description: 'Desafio hardcore: 1 hora de exercício intenso por dia. Apenas para guerreiros!',
    category: 'Atividade Física',
    difficulty: 'dificil',
    duration_days: 30,
    points_reward: 300,
    badge_icon: '💪',
    badge_name: 'Guerreiro Fitness',
    instructions: 'Treino intenso de 1 hora. Compartilhe seus resultados e motive outros guerreiros!',
    tips: ['Varie os exercícios', 'Respeite o descanso', 'Hidrate-se bem'],
    is_active: true,
    is_featured: true,
    is_group_challenge: true,
    daily_log_target: 60,
    daily_log_unit: 'minutos',
    participants_count: 234,
    total_participants: 500,
    user_participation: {
      id: 'pub-part-3',
      progress: 45,
      is_completed: false,
      started_at: new Date().toISOString()
    }
  }
];

// Dados do Ranking
const rankingExemplo: RankingUser[] = [
  {
    id: 'user-1',
    name: 'Ana Silva',
    avatar: '👩‍💼',
    progress: 95,
    points: 2847,
    position: 1,
    badge: '👑',
    is_current_user: false
  },
  {
    id: 'user-2',
    name: 'Carlos Santos',
    avatar: '👨‍💻',
    progress: 92,
    points: 2756,
    position: 2,
    badge: '🥈',
    is_current_user: false
  },
  {
    id: 'user-3',
    name: 'Maria Oliveira',
    avatar: '👩‍🔬',
    progress: 89,
    points: 2654,
    position: 3,
    badge: '🥉',
    is_current_user: false
  },
  {
    id: 'user-4',
    name: 'Você',
    avatar: '😊',
    progress: 86,
    points: 2543,
    position: 4,
    badge: '⭐',
    is_current_user: true
  },
  {
    id: 'user-5',
    name: 'João Pereira',
    avatar: '👨‍🎓',
    progress: 83,
    points: 2432,
    position: 5,
    badge: '🎯',
    is_current_user: false
  }
];

const DesafiosSectionNew: React.FC<DesafiosSectionProps> = ({ user }) => {
  const [selectedDesafio, setSelectedDesafio] = useState<Desafio | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [desafios, setDesafios] = useState<Desafio[]>([]);
  const [desafiosPublicos, setDesafiosPublicos] = useState<Desafio[]>([]);
  const [rankingData, setRankingData] = useState<RankingUser[]>([]);
  const [selectedTab, setSelectedTab] = useState('individuais');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { triggerCelebration } = useCelebrationEffects();

  useEffect(() => {
    carregarDados();
  }, [user]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Por enquanto, usar dados de exemplo
      // TODO: Implementar carregamento real do Supabase
      setDesafios(desafiosExemplo);
      setDesafiosPublicos(desafiosPublicosExemplo);
      setRankingData(rankingExemplo);
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os desafios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDesafioClick = (desafio: Desafio) => {
    setSelectedDesafio(desafio);
    setShowModal(true);
  };

  const handleProgressUpdate = (newProgress: number) => {
    if (selectedDesafio) {
      // Atualizar desafios individuais
      setDesafios(prev => prev.map(desafio => 
        desafio.id === selectedDesafio.id 
          ? {
              ...desafio,
              user_participation: {
                ...desafio.user_participation!,
                progress: newProgress,
                is_completed: newProgress >= desafio.daily_log_target
              }
            }
          : desafio
      ));

      // Atualizar desafios públicos
      setDesafiosPublicos(prev => prev.map(desafio => 
        desafio.id === selectedDesafio.id 
          ? {
              ...desafio,
              user_participation: desafio.user_participation ? {
                ...desafio.user_participation,
                progress: newProgress,
                is_completed: newProgress >= desafio.daily_log_target
              } : undefined
            }
          : desafio
      ));

      // Celebrar se completou
      if (newProgress >= selectedDesafio.daily_log_target) {
        triggerCelebration('🎉 Desafio Completo! 🎉');
      }
    }
    setShowModal(false);
  };

  const handleJoinPublicChallenge = (desafio: Desafio) => {
    setDesafiosPublicos(prev => prev.map(d => 
      d.id === desafio.id 
        ? {
            ...d,
            user_participation: {
              id: `new-part-${d.id}`,
              progress: 0,
              is_completed: false,
              started_at: new Date().toISOString()
            },
            participants_count: (d.participants_count || 0) + 1
          }
        : d
    ));

    toast({
      title: "Parabéns! 🎉",
      description: `Você entrou no desafio "${desafio.title}"!`,
    });
  };

  const renderDesafioCard = (desafio: Desafio, isPublic = false) => {
    const progress = desafio.user_participation 
      ? (desafio.user_participation.progress / desafio.daily_log_target) * 100 
      : 0;
    const isCompleted = desafio.user_participation?.is_completed || false;
    const isParticipating = !!desafio.user_participation;

    return (
      <motion.div
        key={desafio.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card 
          className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-2 ${
            isCompleted ? 'border-emerald-400 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950 dark:to-green-950 shadow-emerald-200 dark:shadow-emerald-900' : 
            isPublic ? 'border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-purple-950 dark:via-pink-950 dark:to-blue-950 shadow-purple-200 dark:shadow-purple-900' : 
            'border-blue-200 bg-gradient-to-br from-white to-blue-50 dark:from-slate-800 dark:to-slate-900 hover:border-blue-300 shadow-blue-100 dark:shadow-slate-800'
          }`}
          onClick={() => isParticipating ? handleDesafioClick(desafio) : undefined}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{desafio.badge_icon}</span>
                {isPublic && (
                  <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 dark:from-purple-900 dark:to-pink-900 dark:text-purple-300 border border-purple-200 dark:border-purple-700 shadow-sm">
                    <Users className="w-3 h-3 mr-1" />
                    {desafio.participants_count || 0}
                  </Badge>
                )}
              </div>
              <Badge className={difficultyColors[desafio.difficulty as keyof typeof difficultyColors]}>
                {difficultyLabels[desafio.difficulty as keyof typeof difficultyLabels]}
              </Badge>
            </div>
            <CardTitle className="text-lg leading-tight">{desafio.title}</CardTitle>
            <CardDescription className="text-sm">
              {desafio.description}
            </CardDescription>
            {isPublic && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                <Users className="w-3 h-3" />
                <span>{desafio.participants_count}/{desafio.total_participants} participantes</span>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>🎯 {desafio.daily_log_target} {desafio.daily_log_unit}/dia</span>
              <span>⏱️ {desafio.duration_days} dias</span>
            </div>

            {isParticipating && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progresso</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-muted-foreground text-center">
                  {desafio.user_participation!.progress} / {desafio.daily_log_target} {desafio.daily_log_unit}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Trophy className="h-4 w-4" />
                <span>{desafio.points_reward} pontos</span>
              </div>
              
              {!isParticipating ? (
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPublic) {
                      handleJoinPublicChallenge(desafio);
                    } else {
                      handleDesafioClick(desafio);
                    }
                  }}
                  className={`touch-manipulation transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg ${
                    isPublic 
                      ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white'
                      : 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 hover:from-blue-600 hover:via-indigo-600 hover:to-purple-600 text-white'
                  }`}
                >
                  {isPublic ? '✨ Participar' : '🚀 Iniciar'}
                </Button>
              ) : isCompleted ? (
                <Badge className="bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-md border border-emerald-400">
                  ✅ Completo
                </Badge>
              ) : (
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDesafioClick(desafio);
                  }}
                  className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600 text-white touch-manipulation transform hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  📊 Atualizar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  if (loading) {
    return (
      <Card className="h-64 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mb-2"></div>
          <p>Carregando desafios...</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 dark:from-violet-400 dark:via-purple-400 dark:to-pink-400">
          🎯 Seus Desafios de Saúde
        </h2>
        <p className="text-muted-foreground">
          ✨ Participe de desafios individuais ou comunitários e compete no ranking! 🏆
        </p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-violet-100 to-purple-100 dark:from-violet-900 dark:to-purple-900 p-1 rounded-xl border-2 border-violet-200 dark:border-violet-800">
          <TabsTrigger value="individuais" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Desafios</span>
            <span className="sm:hidden">Meus</span>
          </TabsTrigger>
          <TabsTrigger value="publicos" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Públicos</span>
            <span className="sm:hidden">Grupo</span>
          </TabsTrigger>
          <TabsTrigger value="ranking" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            <span>Ranking</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individuais" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {desafios.map((desafio) => renderDesafioCard(desafio, false))}
          </div>
        </TabsContent>

        <TabsContent value="publicos" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {desafiosPublicos.map((desafio) => renderDesafioCard(desafio, true))}
          </div>
        </TabsContent>

        <TabsContent value="ranking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                🏆 Ranking dos Desafios
              </CardTitle>
              <CardDescription>
                Competição saudável entre todos os participantes!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {rankingData.map((user, index) => (
                <div 
                  key={user.id}
                  className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 ${
                    user.is_current_user 
                      ? 'bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 border-2 border-indigo-300 shadow-lg transform scale-105' 
                      : user.position <= 3
                      ? 'bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-900 dark:via-amber-900 dark:to-orange-900 border border-yellow-200 dark:border-yellow-700 shadow-md hover:shadow-lg'
                      : 'bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-800 dark:to-gray-800 border border-slate-200 dark:border-slate-700 hover:shadow-md hover:bg-gradient-to-r hover:from-slate-100 hover:to-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-sm">
                      {user.position}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="text-lg">
                        {user.avatar}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${user.is_current_user ? 'text-blue-700 dark:text-blue-300' : ''}`}>
                          {user.name}
                        </span>
                        {user.position <= 3 && (
                          <span className="text-lg">
                            {user.position === 1 ? '👑' : user.position === 2 ? '🥈' : '🥉'}
                          </span>
                        )}
                        <span className="text-sm">{user.badge}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {user.progress}% concluído • {user.points.toLocaleString()} pontos
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Progress value={user.progress} className="w-20 h-2 mb-1" />
                    <Badge 
                      className={
                        user.position === 1 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg border border-yellow-300' :
                        user.position === 2 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white shadow-lg border border-gray-200' :
                        user.position === 3 ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg border border-amber-400' :
                        user.is_current_user ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md border border-indigo-400' :
                        'bg-gradient-to-r from-slate-400 to-slate-600 text-white shadow-sm'
                      }
                    >
                      #{user.position}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Progresso */}
      {selectedDesafio && (
        <UpdateDesafioProgressModal
          desafio={selectedDesafio}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onProgressUpdate={handleProgressUpdate}
        />
      )}

      {/* Efeitos visuais */}
      <VisualEffectsManager trigger={desafios.some(d => d.user_participation?.is_completed)} />
    </div>
  );
};

export default DesafiosSectionNew;