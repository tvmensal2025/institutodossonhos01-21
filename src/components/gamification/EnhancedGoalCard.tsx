import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  CheckCircle,
  AlertCircle,
  XCircle,
  Pause,
  Flame,
  Zap,
  Star,
  Edit,
  Play,
  MoreHorizontal
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { ProgressRing } from "./ProgressRing";
import { ConfettiAnimation, useConfetti } from "./ConfettiAnimation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UpdateProgressModal } from "@/components/goals/UpdateProgressModal";

interface Goal {
  id: string;
  title: string;
  description: string;
  target_value: number;
  current_value: number;
  unit: string;
  difficulty: string;
  status: string;
  target_date: string;
  estimated_points: number;
  final_points: number;
  created_at: string;
  challenge_id?: string;
  goal_categories: {
    name: string;
    icon: string;
    color: string;
  };
  challenges?: {
    title: string;
  };
}

interface EnhancedGoalCardProps {
  goal: Goal;
  onUpdate?: () => void;
  isDragging?: boolean;
  dragHandleProps?: any;
}

export const EnhancedGoalCard = ({ goal, onUpdate, isDragging, dragHandleProps }: EnhancedGoalCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { trigger, celebrate } = useConfetti();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pendente':
        return <Clock className="h-4 w-4" />;
      case 'aprovada':
      case 'em_progresso':
        return <TrendingUp className="h-4 w-4" />;
      case 'pendente_desafio':
        return <Target className="h-4 w-4" />;
      case 'concluida':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejeitada':
        return <XCircle className="h-4 w-4" />;
      case 'cancelada':
        return <Pause className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'aprovada':
      case 'em_progresso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pendente_desafio':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'concluida':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejeitada':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelada':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente';
      case 'aprovada': return 'Aprovada';
      case 'em_progresso': return 'Em Progresso';
      case 'pendente_desafio': return 'Pronto para Desafio';
      case 'concluida': return 'Concluída';
      case 'rejeitada': return 'Rejeitada';
      case 'cancelada': return 'Cancelada';
      default: return status;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'from-green-500 to-green-600';
      case 'medio': return 'from-yellow-500 to-orange-500';
      case 'dificil': return 'from-red-500 to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const calculateProgress = () => {
    if (!goal.target_value || goal.target_value === 0) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const progress = calculateProgress();
  const isNearComplete = progress >= 80;
  const isCompleted = goal.status === 'concluida';

  const handleGoToChallenge = async () => {
    if (!goal.challenge_id) {
      toast({
        title: "Erro",
        description: "Desafio não encontrado para esta meta.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_goals')
        .update({ status: 'em_progresso' })
        .eq('id', goal.id);

      if (error) throw error;

      navigate(`/challenges/${goal.challenge_id}`);
      onUpdate?.();
      
      toast({
        title: "Redirecionando para o desafio!",
        description: "Boa sorte na sua jornada! 🎯"
      });
    } catch (error) {
      console.error('Erro ao ir para desafio:', error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar o desafio.",
        variant: "destructive"
      });
    }
  };

  const handleQuickUpdate = async (increment: number) => {
    try {
      const newValue = Math.min(goal.current_value + increment, goal.target_value);
      
      const { error } = await supabase
        .from('user_goals')
        .update({ 
          current_value: newValue,
          status: newValue >= goal.target_value ? 'concluida' : 'em_progresso'
        })
        .eq('id', goal.id);

      if (error) throw error;

      // Celebrar se completou
      if (newValue >= goal.target_value) {
        celebrate();
        toast({
          title: "🎉 Meta Concluída!",
          description: `Parabéns! Você completou: ${goal.title}`,
        });
      } else {
        toast({
          title: "Progresso atualizado!",
          description: `+${increment} ${goal.unit}`,
        });
      }

      onUpdate?.();
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o progresso.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
      <ConfettiAnimation trigger={trigger} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          scale: isDragging ? 1.05 : 1,
          rotate: isDragging ? 2 : 0
        }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ 
          scale: 1.02,
          boxShadow: "0 10px 30px -10px rgba(0,0,0,0.3)"
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 25 
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative group"
        {...dragHandleProps}
      >
        <Card className={`h-full transition-all duration-300 border-2 relative overflow-hidden ${
          isDragging ? 'shadow-2xl border-primary' : 'hover:shadow-lg'
        } ${isCompleted ? 'border-green-500 bg-green-50/50' : ''}`}>
          
          {/* Animated Background */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${getDifficultyColor(goal.difficulty)} opacity-0`}
            animate={{
              opacity: isHovered ? 0.05 : 0
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Streak Indicator */}
          {isNearComplete && !isCompleted && (
            <motion.div
              className="absolute top-2 right-2 z-10"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <div className="flex items-center gap-1 bg-orange-500 text-white px-2 py-1 rounded-full text-xs">
                <Flame className="w-3 h-3" />
                Quase lá!
              </div>
            </motion.div>
          )}

          <CardHeader className="pb-3 relative z-10">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 flex-1">
                <motion.span 
                  className="text-xl"
                  animate={isHovered ? { scale: 1.2, rotate: 10 } : { scale: 1, rotate: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {goal.goal_categories?.icon}
                </motion.span>
                <div className="flex-1">
                  <CardTitle className="text-lg line-clamp-1">{goal.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {goal.goal_categories?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge className={`${getStatusColor(goal.status)} flex items-center gap-1`}>
                  {getStatusIcon(goal.status)}
                  {getStatusText(goal.status)}
                </Badge>

                {/* Quick Actions Menu */}
                <AnimatePresence>
                  {isHovered && (goal.status === 'aprovada' || goal.status === 'em_progresso') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowQuickActions(!showQuickActions)}
                        className="h-8 w-8 p-0"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 relative z-10">
            {/* Descrição */}
            {goal.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {goal.description}
              </p>
            )}

            {/* Desafio vinculado */}
            {goal.challenges && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary font-medium">
                  {goal.challenges.title}
                </span>
              </div>
            )}

            {/* Progress Ring */}
            {goal.target_value && goal.status !== 'pendente' && (
              <div className="flex items-center justify-center py-4">
                <ProgressRing
                  progress={progress}
                  size={100}
                  strokeWidth={6}
                  gradientColors={[
                    'hsl(var(--primary))',
                    isCompleted ? '#10B981' : 'hsl(var(--primary-glow))'
                  ]}
                  animated={true}
                >
                  <div className="text-center">
                    <div className="text-lg font-bold">
                      {Math.round(progress)}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {goal.current_value}/{goal.target_value}
                    </div>
                  </div>
                </ProgressRing>
              </div>
            )}

            {/* Quick Action Buttons */}
            <AnimatePresence>
              {showQuickActions && (goal.status === 'aprovada' || goal.status === 'em_progresso') && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="grid grid-cols-3 gap-2"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickUpdate(1)}
                    className="flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    +1
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickUpdate(5)}
                    className="flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" />
                    +5
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickUpdate(10)}
                    className="flex items-center gap-1"
                  >
                    <Award className="w-3 h-3" />
                    +10
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Informações adicionais */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`bg-gradient-to-r ${getDifficultyColor(goal.difficulty)} text-white border-0`}>
                {goal.difficulty === 'facil' ? 'Fácil' : goal.difficulty === 'medio' ? 'Médio' : 'Difícil'}
              </Badge>

              <Badge variant="outline" className="flex items-center gap-1">
                <Award className="h-3 w-3" />
                {goal.final_points || goal.estimated_points} pts
              </Badge>
            </div>

            {/* Data alvo */}
            {goal.target_date && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  Meta: {format(new Date(goal.target_date), "dd/MM/yyyy", { locale: ptBR })}
                </span>
              </div>
            )}

            {/* Ações principais */}
            <div className="flex gap-2 pt-2">
              {goal.status === 'aprovada' || goal.status === 'em_progresso' ? (
                <UpdateProgressModal goal={goal} onUpdate={onUpdate}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1"
                  >
                    <Button size="sm" className="w-full gap-2">
                      <Edit className="w-4 h-4" />
                      Atualizar Progresso
                    </Button>
                  </motion.div>
                </UpdateProgressModal>
              ) : goal.status === 'pendente_desafio' && goal.challenges ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1"
                >
                  <Button 
                    size="sm" 
                    className="w-full gap-2" 
                    onClick={handleGoToChallenge}
                  >
                    <Play className="w-4 h-4" />
                    Ir para Desafio
                  </Button>
                </motion.div>
              ) : goal.status === 'pendente' ? (
                <div className="w-full text-center">
                  <p className="text-sm text-muted-foreground">
                    Aguardando aprovação administrativa
                  </p>
                </div>
              ) : null}
            </div>
          </CardContent>

          {/* Completion Glow Effect */}
          {isCompleted && (
            <motion.div
              className="absolute inset-0 border-2 border-green-400 rounded-lg"
              animate={{
                opacity: [0.3, 0.8, 0.3],
                scale: [1, 1.01, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
        </Card>
      </motion.div>
    </>
  );
};