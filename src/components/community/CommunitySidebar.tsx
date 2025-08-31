import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Crown, Medal, Star } from "lucide-react";
import { useRanking } from "@/hooks/useRanking";
import { getUserAvatar } from "@/lib/avatar-utils";

export function CommunitySidebar() {
  const { ranking, loading } = useRanking();

  const getRankIcon = (position: number) => {
    if (position === 1) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (position === 2) return <Medal className="h-4 w-4 text-gray-400" />;
    if (position === 3) return <Medal className="h-4 w-4 text-amber-600" />;
    return <Star className="h-3 w-3 text-muted-foreground" />;
  };

  const topUsers = ranking.slice(0, 10);

  return (
    <div className="w-full md:w-80 space-y-4 px-2 md:px-0">
      {/* Ranking Card */}
      <Card className="health-card">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trophy className="h-5 w-5 text-primary" />
            Top 10 Ranking
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 p-3 md:p-6">
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2 animate-pulse">
                  <div className="w-6 h-6 md:w-8 md:h-8 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-2 md:h-3 bg-muted rounded mb-1" />
                    <div className="h-1 md:h-2 bg-muted rounded w-12 md:w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            topUsers.map((user) => (
              <div key={user.user_id} className="flex items-center gap-2 md:gap-3 p-1 md:p-2 rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-1 md:gap-2 min-w-[1.5rem] md:min-w-[2rem]">
                  <span className="text-xs md:text-sm font-medium text-muted-foreground">#{user.position}</span>
                  {getRankIcon(user.position)}
                </div>
                <div className="h-6 w-6 md:h-8 md:w-8 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                  {user.avatar_url ? (
                    <img 
                      src={user.avatar_url} 
                      alt={user.user_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-sm font-semibold text-primary">
                      {user.user_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs md:text-sm font-medium truncate">{user.user_name}</p>
                  <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {user.total_points} pts
                    </Badge>
                    {user.streak_days > 0 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        🔥 {user.streak_days}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Conquistas Recentes */}
      <Card className="health-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">🏆 Conquistas Recentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <span className="text-lg">🎯</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Primeira Missão</p>
                <p className="text-xs text-muted-foreground">Concluída por 15 pessoas hoje</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <span className="text-lg">🔥</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Sequência de 7 dias</p>
                <p className="text-xs text-muted-foreground">Alcançada por 8 pessoas</p>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
              <span className="text-lg">⭐</span>
              <div className="flex-1">
                <p className="text-sm font-medium">100 Pontos</p>
                <p className="text-xs text-muted-foreground">Conquistado por 12 pessoas</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas da Comunidade */}
      <Card className="health-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">📊 Comunidade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 md:gap-4">
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-primary">{ranking.length}</div>
              <p className="text-xs text-muted-foreground">Membros Ativos</p>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-primary">
                {ranking.reduce((sum, user) => sum + user.missions_completed, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Missões Concluídas</p>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-primary">
                {ranking.reduce((sum, user) => sum + user.total_points, 0).toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Pontos Totais</p>
            </div>
            <div className="text-center">
              <div className="text-lg md:text-2xl font-bold text-primary">
                {Math.round(ranking.reduce((sum, user) => sum + user.streak_days, 0) / ranking.length) || 0}
              </div>
              <p className="text-xs text-muted-foreground">Média Sequência</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}