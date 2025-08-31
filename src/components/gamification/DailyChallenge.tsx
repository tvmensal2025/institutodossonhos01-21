import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Target, 
  Clock, 
  Trophy, 
  Star, 
  CheckCircle, 
  Zap,
  Gift,
  Users,
  Award,
  Calendar,
  TrendingUp,
  Eye,
  MessageCircle,
  Heart,
  Share2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { UpdateChallengeProgressModal } from './UpdateChallengeProgressModal';
import { useChallengeParticipation } from '@/hooks/useChallengeParticipation';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'community';
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  target_value: number;
  current: number;
  unit: string;
  xp_reward: number;
  specialReward?: string;
  expiresAt: Date;
  completed: boolean;
  participants?: number;
  completedBy?: number;
  likes?: number;
  comments?: number;
}

interface DailyChallengeProps {
  challenge: DailyChallenge;
  onComplete?: (challengeId: string) => void;
  onStart?: (challengeId: string) => void;
  showParticipants?: boolean;
  animated?: boolean;
}

const getDifficultyColor = (difficulty: 'easy' | 'medium' | 'hard') => {
  switch (difficulty) {
    case 'easy': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'hard': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getDifficultyText = (difficulty: 'easy' | 'medium' | 'hard') => {
  switch (difficulty) {
    case 'easy': return 'Fácil';
    case 'medium': return 'Médio';
    case 'hard': return 'Difícil';
    default: return difficulty;
  }
};

const getStatusColor = (completed: boolean, progress: number) => {
  if (completed) return 'bg-green-100 text-green-800 border-green-200';
  if (progress >= 80) return 'bg-blue-100 text-blue-800 border-blue-200';
  if (progress > 0) return 'bg-purple-100 text-purple-800 border-purple-200';
  return 'bg-yellow-100 text-yellow-800 border-yellow-200';
};

const getStatusIcon = (completed: boolean, progress: number) => {
  if (completed) return CheckCircle;
  if (progress >= 80) return TrendingUp;
  if (progress > 0) return Target;
  return Clock;
};

const getStatusText = (completed: boolean, progress: number) => {
  if (completed) return 'Concluído';
  if (progress >= 80) return 'Quase Completo';
  if (progress > 0) return 'Em Progresso';
  return 'Disponível';
};

export const DailyChallenge: React.FC<DailyChallengeProps> = ({
  challenge,
  onComplete,
  onStart,
  showParticipants = true,
  animated = true
}) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [isExpired, setIsExpired] = useState(false);
  const [liked, setLiked] = useState(false);
  const navigate = useNavigate();
  const { participate, isParticipating: isParticipatingFn, getProgress, updateProgress } = useChallengeParticipation();

  const progress = challenge.target_value > 0 ? (challenge.current / challenge.target_value) * 100 : 0;
  const StatusIcon = getStatusIcon(challenge.completed, progress);
  const isNearComplete = progress >= 80;
  const isUrgent = new Date(challenge.expiresAt).getTime() - new Date().getTime() < 2 * 60 * 60 * 1000; // 2 hours
  const isUserParticipating = isParticipatingFn(challenge.id);
  const userProgress = getProgress(challenge.id);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const expiry = new Date(challenge.expiresAt).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft('Expirado');
        setIsExpired(true);
      }
    }, 60000);

    return () => clearInterval(timer);
  }, [challenge.expiresAt]);

  const handleComplete = () => {
    onComplete?.(challenge.id);
  };

  const handleStart = () => {
    participate(challenge.id);
  };

  const handleViewDetails = () => {
    navigate(`/challenges/${challenge.id}`);
  };

  const handleLike = () => {
    setLiked(!liked);
  };

  const handleShare = () => {
    navigator.share?.({
      title: challenge.title,
      text: challenge.description,
      url: window.location.origin + `/challenges/${challenge.id}`
    });
  };

  if (challenge.completed) {
    return (
      <Card className="border-green-500 bg-green-50 dark:bg-green-950/20 relative overflow-hidden">
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-full">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-green-700 dark:text-green-300">
                  {challenge.title}
                </CardTitle>
                <p className="text-sm text-green-600 dark:text-green-400">
                  Desafio Concluído!
                </p>
              </div>
            </div>
            <Badge className="bg-green-500 text-white">
              +{challenge.xp_reward} XP
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm text-green-600 dark:text-green-400">
              {challenge.current}/{challenge.target_value} {challenge.unit}
            </span>
            <span className="text-xs text-green-500 font-medium">
              100% COMPLETO
            </span>
          </div>
          <Progress value={100} className="mt-2 h-2" />
          
          {challenge.specialReward && (
            <div className="mt-3 p-2 bg-yellow-100 dark:bg-yellow-950/20 rounded-lg">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-yellow-600" />
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  Recompensa especial: {challenge.specialReward}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="h-full hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer group"
      onClick={handleViewDetails}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {challenge.difficulty === 'easy' ? '⭐' : 
               challenge.difficulty === 'medium' ? '🎯' : '🏆'}
            </span>
            <div>
              <CardTitle className="text-lg line-clamp-1">{challenge.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {challenge.category}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(challenge.completed, progress)} flex items-center gap-1`}>
            <StatusIcon className="h-4 w-4" />
            {getStatusText(challenge.completed, progress)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Descrição */}
        {challenge.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {challenge.description}
          </p>
        )}

        {/* Progresso */}
        {challenge.target_value && !challenge.completed && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-medium">
                {challenge.current} / {challenge.target_value} {challenge.unit}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">
              {Math.round(progress)}% completo
            </p>
          </div>
        )}

        {/* Informações adicionais */}
        <div className="flex flex-wrap gap-2">
          {/* Dificuldade */}
          <Badge variant="outline" className={getDifficultyColor(challenge.difficulty)}>
            {getDifficultyText(challenge.difficulty)}
          </Badge>

          {/* Pontos */}
          <Badge variant="outline" className="flex items-center gap-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            {challenge.xp_reward} XP
          </Badge>

          {/* Comunidade */}
          {challenge.type === 'community' && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              Comunidade
            </Badge>
          )}
        </div>

        {/* Tempo limite */}
        {!isExpired && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              Tempo restante: {timeLeft}
            </span>
          </div>
        )}

        {/* Recompensa especial */}
        {challenge.specialReward && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Gift className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium">Recompensa especial:</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {challenge.specialReward}
            </p>
          </div>
        )}

        {/* Community Stats */}
        {challenge.type === 'community' && showParticipants && challenge.participants && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Participantes</span>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span>{challenge.participants.toLocaleString()}</span>
              {challenge.completedBy && (
                <Badge variant="secondary" className="ml-2">
                  {challenge.completedBy} completaram
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Engajamento Social */}
        <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-3">
          <div className="flex items-center gap-4">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleLike();
              }}
              className={`flex items-center gap-1 hover:text-red-500 transition-colors ${
                liked ? 'text-red-500' : ''
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
              <span>{(challenge.likes || 0) + (liked ? 1 : 0)}</span>
            </button>
            
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{challenge.comments || 0}</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{challenge.participants || 0}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleShare();
              }}
              className="hover:text-blue-500 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {isExpired ? (
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground">
                Desafio expirado
              </p>
            </div>
          ) : challenge.completed ? (
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              onClick={(e) => {
                e.stopPropagation();
                handleComplete();
              }}
            >
              <Award className="h-4 w-4 mr-2" />
              Recompensa Coletada
            </Button>
          ) : progress >= 100 ? (
            <Button 
              size="sm" 
              className="flex-1 bg-green-600 hover:bg-green-700" 
              onClick={(e) => {
                e.stopPropagation();
                handleComplete();
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Reivindicar Recompensa
            </Button>
          ) : progress > 0 ? (
            <div className="flex gap-2 w-full">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
              <UpdateChallengeProgressModal 
                challenge={{
                  id: challenge.id,
                  title: challenge.title,
                  target_value: challenge.target_value,
                  current: challenge.current,
                  unit: challenge.unit,
                  difficulty: challenge.difficulty,
                  xp_reward: challenge.xp_reward,
                  type: challenge.type
                }}
                onUpdate={() => {}}
              >
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Atualizar
                </Button>
              </UpdateChallengeProgressModal>
            </div>
          ) : (
            <div className="flex gap-2 w-full">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={handleViewDetails}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Detalhes
              </Button>
              <Button 
                size="sm" 
                className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleStart();
                }}
              >
                <Target className="h-4 w-4 mr-2" />
                Participar
              </Button>
            </div>
          )}
        </div>

        {/* Aviso de urgência */}
        {isUrgent && !isExpired && !challenge.completed && (
          <div className="p-2 bg-orange-100 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-700 dark:text-orange-300 font-medium">
                ⚠️ Tempo limitado! Apenas {timeLeft} restantes
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};