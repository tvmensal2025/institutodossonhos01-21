import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Clock, 
  CheckCircle, 
  Award,
  TrendingUp,
  Calendar
} from "lucide-react";

interface GoalStatsProps {
  stats: {
    total: number;
    pending: number;
    approved: number;
    completed: number;
    totalPoints: number;
  };
}

export const GoalStats = ({ stats }: GoalStatsProps) => {
  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const approvalRate = stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total de Metas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">
            Metas criadas no total
          </p>
        </CardContent>
      </Card>

      {/* Pendentes */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <p className="text-xs text-muted-foreground">
            Aguardando aprovação
          </p>
        </CardContent>
      </Card>

      {/* Concluídas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <p className="text-xs text-muted-foreground">
            {completionRate}% de taxa de sucesso
          </p>
        </CardContent>
      </Card>

      {/* Pontos Totais */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pontos Conquistados</CardTitle>
          <Award className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">{stats.totalPoints}</div>
          <p className="text-xs text-muted-foreground">
            Pontos de metas concluídas
          </p>
        </CardContent>
      </Card>
    </div>
  );
};