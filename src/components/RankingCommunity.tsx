import React, { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { useRanking } from '@/hooks/useRanking';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, Crown, Award, Target, Calendar, TrendingUp, Users, Flame, 
  Star, Medal, Search, Filter, ChevronUp, ChevronDown, Activity, Zap
} from 'lucide-react';
import { CommunityIntegration } from '@/components/ranking/CommunityIntegration';

interface RankingCommunityProps {
  user: User | null;
}

const PERIODS = [
  { value: 'all', label: 'Todos os tempos' },
  { value: 'month', label: 'Este mês' },
  { value: 'week', label: 'Esta semana' },
  { value: 'today', label: 'Hoje' }
];

const CATEGORIES = [
  { value: 'points', label: 'Pontos', icon: Trophy },
  { value: 'streak', label: 'Sequência', icon: Flame },
  { value: 'missions', label: 'Missões', icon: Target },
  { value: 'activity', label: 'Atividade', icon: Activity }
];

export default function RankingCommunity({ user }: RankingCommunityProps) {
  const { ranking, loading, error, refetch } = useRanking();
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('points');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTop, setShowTop] = useState(10);

  useEffect(() => {
    refetch();
  }, [selectedPeriod, selectedCategory]);

  const currentUserRank = ranking.find(r => r.user_id === user?.id);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">#{position}</span>;
    }
  };

  const getPositionColor = (position: number, isCurrentUser: boolean = false) => {
    if (isCurrentUser) {
      return 'bg-primary/10 border-primary/30 ring-2 ring-primary/20';
    }
    switch (position) {
      case 1: return 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200';
      default: return 'bg-card border-border hover:bg-muted/50 transition-colors';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Mestre': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Especialista': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Avançado': return 'bg-green-100 text-green-800 border-green-200';
      case 'Dedicado': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Intermediário': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredRanking = ranking
    .filter(user => 
      searchQuery === '' || 
      user.user_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .slice(0, showTop);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Carregando Ranking</h3>
            <p className="text-muted-foreground">Calculando posições dos usuários...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center space-y-4">
          <Trophy className="w-16 h-16 mx-auto text-muted-foreground" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Erro ao carregar ranking</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={refetch} variant="outline">
              Tentar novamente
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="w-10 h-10 text-yellow-500" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
            Ranking de Usuários
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Veja quem está liderando a comunidade de saúde e bem-estar
        </p>
      </div>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <div className="text-2xl font-bold text-blue-800">{ranking.length}</div>
            <div className="text-sm text-blue-600">Usuários Ativos</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <div className="text-2xl font-bold text-green-800">
              {ranking.reduce((sum, user) => sum + user.missions_completed, 0)}
            </div>
            <div className="text-sm text-green-600">Missões Completadas</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4 text-center">
            <Star className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
            <div className="text-2xl font-bold text-yellow-800">
              {ranking.reduce((sum, user) => sum + user.total_points, 0).toLocaleString()}
            </div>
            <div className="text-sm text-yellow-600">Pontos Totais</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
            <div className="text-2xl font-bold text-orange-800">
              {Math.max(...ranking.map(user => user.streak_days), 0)}
            </div>
            <div className="text-sm text-orange-600">Maior Sequência</div>
          </CardContent>
        </Card>
      </div>

      {/* Sua Posição */}
      {currentUserRank && (
        <Card className={getPositionColor(currentUserRank.position, true)}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Sua Posição no Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                {getPositionIcon(currentUserRank.position)}
                <span className="text-3xl font-bold">#{currentUserRank.position}</span>
              </div>
              <div className="flex-1 space-y-1">
                <div className="text-xl font-semibold">{currentUserRank.user_name}</div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    {currentUserRank.total_points.toLocaleString()} pontos
                  </span>
                  <span className="flex items-center gap-1">
                    <Target className="w-4 h-4" />
                    {currentUserRank.missions_completed} missões
                  </span>
                  <span className="flex items-center gap-1">
                    <Flame className="w-4 h-4" />
                    {currentUserRank.streak_days} dias seguidos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar usuário..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTop(showTop === 10 ? 50 : 10)}
              >
                {showTop === 10 ? (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Ver mais
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Ver menos
                  </>
                )}
              </Button>
              
              <Button variant="outline" size="sm" onClick={refetch}>
                <Activity className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integração com Comunidade */}
      <CommunityIntegration 
        totalUsers={ranking.length}
        totalPoints={ranking.reduce((sum, user) => sum + user.total_points, 0)}
        totalMissions={ranking.reduce((sum, user) => sum + user.missions_completed, 0)}
      />

      {/* Ranking Principal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Top {showTop} - Ranking Geral
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRanking.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Nenhum usuário encontrado</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 'Tente uma busca diferente.' : 'Complete missões para aparecer no ranking!'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRanking.map((rankUser, index) => {
                const isCurrentUser = rankUser.user_id === user?.id;
                
                return (
                  <div key={rankUser.user_id}>
                    <div 
                      className={`flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 ${getPositionColor(rankUser.position, isCurrentUser)}`}
                    >
                      {/* Posição e Avatar */}
                      <div className="flex items-center gap-3">
                        {getPositionIcon(rankUser.position)}
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={rankUser.avatar_url} alt={rankUser.user_name} />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {rankUser.user_name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      {/* Informações do Usuário */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-lg truncate">
                            {rankUser.user_name}
                          </span>
                          {isCurrentUser && (
                            <Badge variant="secondary" className="text-xs">Você</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {rankUser.total_points.toLocaleString()} pts
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            {rankUser.missions_completed} missões
                          </span>
                          <span className="flex items-center gap-1">
                            <Flame className="w-3 h-3" />
                            {rankUser.streak_days} dias
                          </span>
                          {rankUser.last_activity && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(rankUser.last_activity).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Indicadores de Performance */}
                      <div className="flex flex-col items-end gap-1">
                        <div className="text-right">
                          <div className="text-xl font-bold text-primary">
                            #{rankUser.position}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            posição
                          </div>
                        </div>
                        
                        {rankUser.streak_days > 7 && (
                          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
                            <Flame className="w-3 h-3 mr-1" />
                            Em chamas!
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {index < filteredRanking.length - 1 && <Separator className="my-2" />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conquistas em Destaque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Conquistas em Destaque
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-5 h-5 text-yellow-600" />
                <span className="font-semibold text-yellow-800">Líder Atual</span>
              </div>
              <div className="text-lg font-bold text-yellow-900">
                {ranking[0]?.user_name || 'Nenhum líder'}
              </div>
              <div className="text-sm text-yellow-700">
                {ranking[0]?.total_points.toLocaleString() || 0} pontos
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-orange-800">Maior Sequência</span>
              </div>
              <div className="text-lg font-bold text-orange-900">
                {ranking.reduce((max, user) => 
                  user.streak_days > max.streak_days ? user : max, 
                  { user_name: 'Nenhum', streak_days: 0 }
                ).user_name}
              </div>
              <div className="text-sm text-orange-700">
                {Math.max(...ranking.map(user => user.streak_days), 0)} dias seguidos
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-800">Mais Ativo</span>
              </div>
              <div className="text-lg font-bold text-green-900">
                {ranking.reduce((max, user) => 
                  user.missions_completed > max.missions_completed ? user : max, 
                  { user_name: 'Nenhum', missions_completed: 0 }
                ).user_name}
              </div>
              <div className="text-sm text-green-700">
                {Math.max(...ranking.map(user => user.missions_completed), 0)} missões
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}