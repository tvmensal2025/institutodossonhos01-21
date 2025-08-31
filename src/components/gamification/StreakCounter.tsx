import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Calendar, Trophy, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface StreakCounterProps {
  currentStreak: number;
  bestStreak: number;
  isActive?: boolean;
  type?: 'daily' | 'weekly' | 'custom';
  label?: string;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  currentStreak,
  bestStreak,
  isActive = true,
  type = 'daily',
  label = 'Sequência'
}) => {
  const getStreakColor = (streak: number) => {
    if (streak >= 30) return 'text-orange-500';
    if (streak >= 14) return 'text-red-500';
    if (streak >= 7) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getStreakIcon = (streak: number) => {
    if (streak >= 30) return <Trophy className="w-6 h-6" />;
    if (streak >= 14) return <Flame className="w-6 h-6" />;
    if (streak >= 7) return <Zap className="w-6 h-6" />;
    return <Calendar className="w-6 h-6" />;
  };

  const getStreakMessage = (streak: number) => {
    if (streak >= 30) return 'Lendário! 🏆';
    if (streak >= 14) return 'Em chamas! 🔥';
    if (streak >= 7) return 'Incrível! ⚡';
    if (streak >= 3) return 'Aquecendo! 🌟';
    return 'Continue! 💪';
  };

  const isHotStreak = currentStreak >= 7;

  return (
    <Card className={`relative overflow-hidden ${isHotStreak ? 'border-orange-400 shadow-lg shadow-orange-200/50' : ''}`}>
      {isHotStreak && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-red-500/10"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      <CardContent className="p-6 text-center relative z-10">
        <div className="flex items-center justify-center mb-4">
          <motion.div
            className={`${getStreakColor(currentStreak)} ${isHotStreak ? 'drop-shadow-lg' : ''}`}
            animate={isHotStreak ? {
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            {getStreakIcon(currentStreak)}
          </motion.div>
        </div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="space-y-2"
        >
          <div className="text-3xl font-bold text-foreground">
            {currentStreak}
          </div>
          <div className="text-sm text-muted-foreground">
            {label} {type === 'daily' ? 'diária' : type === 'weekly' ? 'semanal' : ''}
          </div>
        </motion.div>

        <div className="mt-4 space-y-2">
          <Badge variant="outline" className={`${getStreakColor(currentStreak)} border-current`}>
            {getStreakMessage(currentStreak)}
          </Badge>
          
          <div className="text-xs text-muted-foreground">
            Melhor: {bestStreak} {type === 'daily' ? 'dias' : type === 'weekly' ? 'semanas' : ''}
          </div>
        </div>

        {isActive && currentStreak > 0 && (
          <motion.div
            className="mt-4 text-xs text-green-600 font-medium"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Ativo hoje! ✨
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};