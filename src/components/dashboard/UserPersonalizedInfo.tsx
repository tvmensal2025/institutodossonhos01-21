// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Target, 
  Trophy, 
  Calendar, 
  Heart, 
  TrendingUp, 
  TrendingDown,
  CheckCircle,
  Clock,
  Award
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserPersonalizedInfoProps {
  userId: string;
}

interface UserData {
  name: string;
  email: string;
  city: string;
  currentWeight: number | null;
  weightTrend: number;
  activeChallenges: Array<{
    title: string;
    description: string;
    progress: number;
    isCompleted: boolean;
  }>;
  currentGoals: Array<{
    title: string;
    description: string;
    target_value: number;
    current_value: number;
    deadline: string;
  }>;
  recentMissions: number;
  totalMissions: number;
  lastConversation: string;
}

export const UserPersonalizedInfo: React.FC<UserPersonalizedInfoProps> = ({ userId }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      setLoading(true);

      // Perfil do usuário
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Dados de saúde recentes
      const { data: healthData } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: false })
        .limit(5);

      // Desafios ativos
      const { data: activeChallenges } = await supabase
        .from('challenges')
        .select(`
          *,
          challenge_participations!inner(user_id, progress, is_completed)
        `)
        .eq('challenge_participations.user_id', userId)
        .eq('is_active', true);

      // Metas do usuário
      const { data: userGoals } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(3);

      // Missões diárias
      const { data: dailyMissions } = await supabase
        .from('daily_missions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      // Histórico de conversas recentes
      const { data: recentConversations } = await supabase
        .from('sofia_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      const data: UserData = {
        name: userProfile?.full_name || 'Usuário',
        email: userProfile?.email || '',
        city: userProfile?.city || '',
        currentWeight: healthData?.[0]?.peso_kg || null,
        weightTrend: healthData?.length >= 2 ? 
          (healthData[0].peso_kg - healthData[1].peso_kg) : 0,
        activeChallenges: activeChallenges?.map(c => ({
          title: c.title,
          description: c.description,
          progress: c.challenge_participations?.[0]?.progress || 0,
          isCompleted: c.challenge_participations?.[0]?.is_completed || false
        })) || [],
        currentGoals: userGoals?.map(g => ({
          title: g.title || 'Meta sem título',
          description: g.description || 'Sem descrição',
          target_value: g.target_value || 0,
          current_value: g.current_value || 0,
          deadline: g.target_date || 'Sem prazo'
        })) || [],
        recentMissions: dailyMissions?.filter(m => m.is_completed).length || 0,
        totalMissions: dailyMissions?.length || 0,
        lastConversation: recentConversations?.[0]?.sofia_response ? 
          recentConversations[0].sofia_response.slice(0, 100) : ''
      };

      setUserData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Carregando informações...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userData) {
    return null;
  }

  const getWeightTrendIcon = () => {
    if (userData.weightTrend > 0) {
      return <TrendingUp className="h-4 w-4 text-red-500" />;
    } else if (userData.weightTrend < 0) {
      return <TrendingDown className="h-4 w-4 text-green-500" />;
    }
    return <Heart className="h-4 w-4 text-blue-500" />;
  };

  const getWeightTrendText = () => {
    if (userData.weightTrend > 0) {
      return `+${userData.weightTrend.toFixed(1)}kg`;
    } else if (userData.weightTrend < 0) {
      return `${userData.weightTrend.toFixed(1)}kg`;
    }
    return 'Estável';
  };

  const getWeightTrendColor = () => {
    if (userData.weightTrend > 0) return 'text-red-600';
    if (userData.weightTrend < 0) return 'text-green-600';
    return 'text-blue-600';
  };

  return (
    <div className="space-y-4">
      {/* Informações Pessoais */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Olá, {userData.name}! 👋
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Cidade:</span>
            <span className="text-sm font-medium">{userData.city || 'Não informada'}</span>
          </div>
          
          {userData.currentWeight && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Peso atual:</span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{userData.currentWeight}kg</span>
                {getWeightTrendIcon()}
                <span className={`text-xs ${getWeightTrendColor()}`}>
                  {getWeightTrendText()}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Desafios Ativos */}
      {userData.activeChallenges.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Desafios Ativos ({userData.activeChallenges.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userData.activeChallenges.map((challenge, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{challenge.title}</span>
                  <Badge variant={challenge.isCompleted ? "default" : "secondary"}>
                    {challenge.isCompleted ? "Concluído" : `${challenge.progress}%`}
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${challenge.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Metas Atuais */}
      {userData.currentGoals.length > 0 && (
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Metas Atuais ({userData.currentGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {userData.currentGoals.map((goal, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{goal.title}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">
                      {goal.current_value}/{goal.target_value}
                    </span>
                    <Award className="h-3 w-3 text-green-500" />
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(goal.current_value / goal.target_value) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Missões Diárias */}
      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Missões Esta Semana
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">
                {userData.recentMissions} de {userData.totalMissions} completadas
              </span>
            </div>
            <Badge variant="outline" className="bg-green-100 text-green-700">
              {userData.totalMissions > 0 ? 
                Math.round((userData.recentMissions / userData.totalMissions) * 100) : 0}%
            </Badge>
          </div>
          
          {userData.totalMissions > 0 && (
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(userData.recentMissions / userData.totalMissions) * 100}%` }}
              ></div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Última Conversa */}
      {userData.lastConversation && (
        <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Última Conversa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 italic">
              "{userData.lastConversation.length > 50 ? 
                userData.lastConversation.substring(0, 50) + '...' : 
                userData.lastConversation}"
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}; 