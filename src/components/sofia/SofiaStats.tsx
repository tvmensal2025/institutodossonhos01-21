import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MessageSquare, Camera, Target, Trophy, Star, Calendar, Zap } from 'lucide-react';

interface Stats {
  totalMessages: number;
  imagesShared: number;
  goalsAchieved: number;
  challengesCompleted: number;
  currentStreak: number;
  totalPoints: number;
  weeklyProgress: number;
  nutritionScore: number;
}

const SofiaStats: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalMessages: 47,
    imagesShared: 12,
    goalsAchieved: 3,
    challengesCompleted: 1,
    currentStreak: 7,
    totalPoints: 1250,
    weeklyProgress: 75,
    nutritionScore: 85
  });

  const [weeklyData] = useState([
    { day: 'Seg', messages: 8, nutrition: 90 },
    { day: 'Ter', messages: 6, nutrition: 85 },
    { day: 'Qua', messages: 12, nutrition: 88 },
    { day: 'Qui', messages: 4, nutrition: 75 },
    { day: 'Sex', messages: 9, nutrition: 92 },
    { day: 'Sáb', messages: 5, nutrition: 80 },
    { day: 'Dom', messages: 3, nutrition: 78 }
  ]);

  useEffect(() => {
    // Simular atualização dos dados
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalMessages: prev.totalMessages + Math.floor(Math.random() * 2),
        weeklyProgress: Math.min(100, prev.weeklyProgress + Math.floor(Math.random() * 2))
      }));
    }, 30000); // Atualizar a cada 30 segundos

    return () => clearInterval(interval);
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 75) return 'bg-yellow-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">📊 Estatísticas</h2>
        <p className="text-gray-600">Acompanhe seu progresso e evolução com a Sofia</p>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-2">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.totalMessages}</div>
              <div className="text-sm text-gray-600">Mensagens</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-2">
              <Camera className="h-8 w-8 text-green-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.imagesShared}</div>
              <div className="text-sm text-gray-600">Fotos Enviadas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-2">
              <Target className="h-8 w-8 text-purple-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.goalsAchieved}</div>
              <div className="text-sm text-gray-600">Metas Atingidas</div>
            </div>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-2">
              <Trophy className="h-8 w-8 text-orange-600" />
              <div className="text-2xl font-bold text-gray-900">{stats.challengesCompleted}</div>
              <div className="text-sm text-gray-600">Desafios</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progresso Semanal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Progresso desta Semana
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Meta semanal</span>
            <span className="text-sm font-medium">{stats.weeklyProgress}%</span>
          </div>
          <Progress value={stats.weeklyProgress} className="h-2" />
          
          <div className="grid grid-cols-7 gap-2 mt-4">
            {weeklyData.map((day, index) => (
              <div key={day.day} className="text-center">
                <div className="text-xs text-gray-500 mb-1">{day.day}</div>
                <div className="space-y-1">
                  <div 
                    className="w-full bg-blue-100 rounded"
                    style={{ height: `${Math.max(day.messages * 3, 8)}px` }}
                    title={`${day.messages} mensagens`}
                  />
                  <div className="text-xs text-gray-400">{day.messages}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scores e Conquistas */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Score Nutricional
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(stats.nutritionScore)}`}>
                {stats.nutritionScore}
              </div>
              <div className="text-sm text-gray-600">Pontuação atual</div>
            </div>
            
            <div className={`p-4 rounded-lg ${getScoreBg(stats.nutritionScore)}`}>
              <div className="text-sm font-medium text-gray-900">
                {stats.nutritionScore >= 90 ? '🎉 Excelente!' :
                 stats.nutritionScore >= 75 ? '👍 Muito bom!' :
                 stats.nutritionScore >= 60 ? '🔥 Pode melhorar!' : '💪 Vamos lá!'}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                {stats.nutritionScore >= 90 ? 'Você está mantendo hábitos alimentares exemplares!' :
                 stats.nutritionScore >= 75 ? 'Ótimo progresso, continue assim!' :
                 stats.nutritionScore >= 60 ? 'Você está no caminho certo, foque nas dicas da Sofia!' : 
                 'A Sofia está aqui para te ajudar a melhorar!'}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-purple-600" />
              Conquistas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <Trophy className="h-6 w-6 text-green-600" />
              <div>
                <div className="text-sm font-medium text-green-900">Sequência de 7 dias!</div>
                <div className="text-xs text-green-700">Conversou com a Sofia por uma semana inteira</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Camera className="h-6 w-6 text-blue-600" />
              <div>
                <div className="text-sm font-medium text-blue-900">Fotógrafo Nutricional</div>
                <div className="text-xs text-blue-700">Compartilhou mais de 10 fotos de refeições</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Target className="h-6 w-6 text-purple-600" />
              <div>
                <div className="text-sm font-medium text-purple-900">Meta Atingida</div>
                <div className="text-xs text-purple-700">Completou sua primeira meta de peso</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Resumo de Pontos */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full">
                <Star className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{stats.totalPoints} Pontos</h3>
                <p className="text-gray-600">Total acumulado</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
                <Calendar className="h-4 w-4 mr-2" />
                {stats.currentStreak} dias seguidos
              </Badge>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-purple-600">+150</div>
              <div className="text-xs text-gray-600">Esta semana</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-pink-600">+75</div>
              <div className="text-xs text-gray-600">Hoje</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-indigo-600">Nível 8</div>
              <div className="text-xs text-gray-600">Atual</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SofiaStats;