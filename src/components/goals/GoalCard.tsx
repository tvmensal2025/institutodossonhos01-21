import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Clock, 
  Award,
  CheckCircle,
  AlertCircle,
  XCircle,
  Pause
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UpdateProgressModal } from "./UpdateProgressModal";

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

interface GoalCardProps {
  goal: Goal;
  onUpdate?: () => void;
}

export const GoalCard = ({ goal, onUpdate }: GoalCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
      case 'facil': return 'bg-green-100 text-green-800';
      case 'medio': return 'bg-yellow-100 text-yellow-800';
      case 'dificil': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'facil': return 'Fácil';
      case 'medio': return 'Médio';
      case 'dificil': return 'Difícil';
      default: return difficulty;
    }
  };

  const calculateProgress = () => {
    if (!goal.target_value || goal.target_value === 0) return 0;
    return Math.min((goal.current_value / goal.target_value) * 100, 100);
  };

  const progress = calculateProgress();

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
      // Atualizar status da meta para em_progresso
      const { error } = await supabase
        .from('user_goals')
        .update({ status: 'em_progresso' })
        .eq('id', goal.id);

      if (error) throw error;

      // Navegar para a página do desafio
      navigate(`/challenges/${goal.challenge_id}`);
      
      // Atualizar a lista de metas
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

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{goal.goal_categories?.icon}</span>
            <div>
              <CardTitle className="text-lg line-clamp-1">{goal.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {goal.goal_categories?.name}
              </p>
            </div>
          </div>
          <Badge className={`${getStatusColor(goal.status)} flex items-center gap-1`}>
            {getStatusIcon(goal.status)}
            {getStatusText(goal.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
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

        {/* Progresso */}
        {goal.target_value && goal.status !== 'pendente' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span className="font-medium">
                {goal.current_value} / {goal.target_value} {goal.unit}
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
          <Badge variant="outline" className={getDifficultyColor(goal.difficulty)}>
            {getDifficultyText(goal.difficulty)}
          </Badge>

          {/* Pontos */}
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

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          {goal.status === 'aprovada' || goal.status === 'em_progresso' ? (
            <UpdateProgressModal goal={goal} onUpdate={onUpdate}>
              <Button size="sm" className="flex-1">
                Atualizar Progresso
              </Button>
            </UpdateProgressModal>
          ) : goal.status === 'pendente_desafio' && goal.challenges ? (
            <Button size="sm" className="flex-1" variant="default" onClick={handleGoToChallenge}>
              Ir para Desafio
            </Button>
          ) : goal.status === 'pendente' ? (
            <div className="w-full text-center">
              <p className="text-sm text-muted-foreground">
                Aguardando aprovação administrativa
              </p>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
};