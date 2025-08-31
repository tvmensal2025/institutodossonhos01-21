import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Send, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface SessionAssignmentStatsProps {
  userSessions: any[];
  profiles: any[];
}

export const SessionAssignmentStats: React.FC<SessionAssignmentStatsProps> = ({
  userSessions,
  profiles
}) => {
  const stats = {
    totalUsers: profiles.length,
    usersWithSessions: new Set(userSessions.map(s => s.user_id)).size,
    totalAssignments: userSessions.length,
    pending: userSessions.filter(s => s.status === 'pending').length,
    inProgress: userSessions.filter(s => s.status === 'in_progress').length,
    completed: userSessions.filter(s => s.status === 'completed').length,
    orphaned: userSessions.filter(s => !s.profiles).length
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total de Usuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-2xl font-bold">{stats.totalUsers}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.usersWithSessions} com sessões
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Atribuições Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-green-600" />
            <span className="text-2xl font-bold">{stats.totalAssignments}</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Total de sessões enviadas
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Status das Sessões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-yellow-500" />
                Pendentes
              </span>
              <Badge variant="secondary" className="h-5">
                {stats.pending}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Completas
              </span>
              <Badge variant="secondary" className="h-5">
                {stats.completed}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Qualidade dos Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {stats.orphaned === 0 ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">Limpo</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-600">
                  {stats.orphaned} órfãs
                </span>
              </>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Estado da base de dados
          </p>
        </CardContent>
      </Card>
    </div>
  );
};