import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Crown, 
  Star, 
  Award,
  Zap,
  Target,
  Users,
  TrendingUp,
  Gift,
  Medal,
  Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface LeaderboardEntry {
  id: string;
  name: string;
  avatar: string;
  points: number;
  streak: number;
  level: number;
  completedChallenges: number;
  rank: number;
  isCurrentUser?: boolean;
}

interface Challenge {
  id: string;
  title: string;
  category: string;
  participants: number;
  trending: boolean;
  newChallenges?: boolean;
}

interface SocialFeedProps {
  currentUser: {
    name: string;
    points: number;
    level: number;
    streak: number;
    rank: number;
  };
}

// Mock data
const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', name: 'Em breve', avatar: '🌟', points: 2840, streak: 15, level: 8, completedChallenges: 47, rank: 1 },
  { id: '2', name: 'Em breve', avatar: '🚀', points: 2650, streak: 12, level: 7, completedChallenges: 41, rank: 2 },
  { id: '3', name: 'Em breve', avatar: '💪', points: 2480, streak: 18, level: 7, completedChallenges: 39, rank: 3 },
  { id: '4', name: 'Em breve', avatar: '🎯', points: 2240, streak: 8, level: 6, completedChallenges: 35, rank: 4 },
  { id: '5', name: 'Você', avatar: 'V', points: 1950, streak: 5, level: 5, completedChallenges: 28, rank: 5, isCurrentUser: true }
];

const trendingChallenges: Challenge[] = [
  { id: '1', title: 'Hidratação Diária', category: 'Saúde', participants: 1247, trending: true },
  { id: '2', title: 'Caminhada Matinal', category: 'Exercício', participants: 892, trending: true },
  { id: '3', title: 'Gratidão Diária', category: 'Mental', participants: 654, trending: false, newChallenges: true },
  { id: '4', title: 'Leitura 20min', category: 'Desenvolvimento', participants: 523, trending: false, newChallenges: true }
];

export const SocialFeed: React.FC<SocialFeedProps> = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'trending' | 'friends'>('leaderboard');
  const [showEncouragement, setShowEncouragement] = useState(false);

  useEffect(() => {
    // Mostrar encorajamento baseado na posição
    if (currentUser.rank > 3) {
      const timer = setTimeout(() => {
        setShowEncouragement(true);
        setTimeout(() => setShowEncouragement(false), 5000);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [currentUser.rank]);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-amber-400 to-amber-600';
      default: return 'from-blue-400 to-blue-600';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-600" />;
      case 2: return <Medal className="w-5 h-5 text-gray-600" />;
      case 3: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <Star className="w-5 h-5 text-blue-600" />;
    }
  };

  const calculatePointsToNext = (currentRank: number) => {
    const currentEntry = mockLeaderboard.find(entry => entry.rank === currentRank);
    const nextEntry = mockLeaderboard.find(entry => entry.rank === currentRank - 1);
    
    if (!currentEntry || !nextEntry) return { needed: 0, current: 0, total: 0 };
    
    const needed = nextEntry.points - currentEntry.points;
    const total = needed;
    return { needed, current: 0, total };
  };

  return (
    <div className="space-y-4">
      {/* Mensagem de Encorajamento */}
      <AnimatePresence>
        {showEncouragement && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-gradient-to-r from-green-100 to-blue-100 rounded-lg border border-green-200"
          >
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">💪 Você pode subir no ranking!</p>
                <p className="text-sm text-green-700">
                  Complete mais desafios para ganhar {calculatePointsToNext(currentUser.rank).needed} pontos e subir para #{currentUser.rank - 1}!
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabs */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'leaderboard' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('leaderboard')}
              className="flex-1"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Ranking
            </Button>
            <Button
              variant={activeTab === 'trending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('trending')}
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Em Alta
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {activeTab === 'leaderboard' && (
            <div className="space-y-3">
              {mockLeaderboard.slice(0, 5).map((entry, index) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border ${
                    entry.isCurrentUser 
                      ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-200' 
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-br ${getRankColor(entry.rank)} rounded-full`}>
                      {getRankIcon(entry.rank)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{entry.name}</span>
                        {entry.isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">Você</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {entry.points.toLocaleString()} pts
                        </span>
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {entry.streak} dias
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          {entry.completedChallenges}
                        </span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-bold text-lg">#{entry.rank}</div>
                      <div className="text-xs text-muted-foreground">Nível {entry.level}</div>
                    </div>
                  </div>
                  
                  {entry.isCurrentUser && currentUser.rank > 1 && (
                    <div className="mt-3 pt-3 border-t border-blue-200">
                      <div className="flex justify-between text-sm text-blue-700 mb-1">
                        <span>Para #{currentUser.rank - 1}</span>
                        <span>{calculatePointsToNext(currentUser.rank).needed} pts necessários</span>
                      </div>
                      <Progress 
                        value={20} 
                        className="h-2 bg-blue-100"
                      />
                    </div>
                  )}
                </motion.div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full mt-3">
                Ver Ranking Completo
              </Button>
            </div>
          )}

          {activeTab === 'trending' && (
            <div className="space-y-3">
              {trendingChallenges.map((challenge, index) => (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-3 rounded-lg border bg-white hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{challenge.title}</h4>
                        {challenge.trending && (
                          <Badge className="bg-red-100 text-red-700 text-xs">
                            🔥 Em Alta
                          </Badge>
                        )}
                        {challenge.newChallenges && (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            ✨ Novo
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {challenge.participants.toLocaleString()} participantes
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {challenge.category}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline">
                      Participar
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Suas Conquistas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{currentUser.points}</div>
              <div className="text-sm text-purple-500">Pontos Totais</div>
            </div>
            <div className="text-center p-3 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{currentUser.streak}</div>
              <div className="text-sm text-orange-500">Dias Consecutivos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};