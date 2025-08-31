import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Star, TrendingUp, Trophy, Zap, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface LevelSystemProps {
  currentLevel: number;
  currentXP: number;
  xpToNextLevel: number;
  totalXP: number;
  achievements?: number;
  rank?: string;
  animated?: boolean;
}

const levelThresholds = [0, 100, 250, 500, 1000, 2000, 4000, 7500, 15000, 30000, 50000];
const levelTitles = [
  'Iniciante',
  'Determinado',
  'Focado',
  'Dedicado',
  'Persistente',
  'Disciplinado',
  'Experiente',
  'Veterano',
  'Mestre',
  'Lenda',
  'Transcendente'
];

export const LevelSystem: React.FC<LevelSystemProps> = ({
  currentLevel,
  currentXP,
  xpToNextLevel,
  totalXP,
  achievements = 0,
  rank = 'Bronze',
  animated = true
}) => {
  const progressPercentage = ((currentXP) / (currentXP + xpToNextLevel)) * 100;
  const levelTitle = levelTitles[Math.min(currentLevel, levelTitles.length - 1)];

  const getLevelColor = (level: number) => {
    if (level >= 10) return 'from-purple-500 to-pink-500';
    if (level >= 8) return 'from-yellow-500 to-orange-500';
    if (level >= 6) return 'from-blue-500 to-cyan-500';
    if (level >= 4) return 'from-green-500 to-emerald-500';
    if (level >= 2) return 'from-orange-500 to-red-500';
    return 'from-gray-500 to-gray-600';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 10) return Crown;
    if (level >= 8) return Trophy;
    if (level >= 6) return Award;
    if (level >= 4) return Star;
    if (level >= 2) return Zap;
    return TrendingUp;
  };

  const IconComponent = getLevelIcon(currentLevel);

  return (
    <Card className={`relative overflow-hidden bg-gradient-to-br ${getLevelColor(currentLevel)} text-white border-0`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_70%)]" />
      </div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={animated ? {
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              } : {}}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="p-3 bg-white/20 rounded-full backdrop-blur-sm"
            >
              <IconComponent className="w-6 h-6" />
            </motion.div>
            <div>
              <CardTitle className="text-white text-2xl font-bold">
                Nível {currentLevel}
              </CardTitle>
              <p className="text-white/80 text-sm">{levelTitle}</p>
            </div>
          </div>
          
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            {rank}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 relative z-10">
        {/* XP Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-white/80">Experiência</span>
            <span className="text-white font-medium">
              {currentXP.toLocaleString()} / {(currentXP + xpToNextLevel).toLocaleString()} XP
            </span>
          </div>
          
          <div className="relative">
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-white/20"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent h-3 rounded-full"
              animate={{
                x: ['-100%', '100%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </div>
          
          <div className="text-center text-white/80 text-xs">
            {xpToNextLevel.toLocaleString()} XP para o próximo nível
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xl font-bold text-white">
              {totalXP.toLocaleString()}
            </div>
            <div className="text-xs text-white/70">XP Total</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <div className="text-xl font-bold text-white">
              {achievements}
            </div>
            <div className="text-xs text-white/70">Conquistas</div>
          </div>
          
          <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
            <motion.div
              animate={animated ? {
                scale: [1, 1.1, 1]
              } : {}}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="text-xl font-bold text-white"
            >
              #{Math.floor(Math.random() * 100) + 1}
            </motion.div>
            <div className="text-xs text-white/70">Ranking</div>
          </div>
        </div>

        {/* Next Level Preview */}
        {currentLevel < levelTitles.length - 1 && (
          <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium text-white">Próximo Nível</span>
            </div>
            <div className="text-white/80 text-sm">
              <strong>{levelTitles[currentLevel + 1]}</strong> - Nível {currentLevel + 1}
            </div>
            <div className="text-white/60 text-xs mt-1">
              Desbloqueie novas conquistas e benefícios!
            </div>
          </div>
        )}

        {/* Level Up Animation Trigger Area */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)',
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              'radial-gradient(circle at 50% 50%, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 100%)'
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </CardContent>
    </Card>
  );
};