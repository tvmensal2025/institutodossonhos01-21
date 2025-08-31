import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flame, 
  Zap, 
  Crown, 
  Gift, 
  Star,
  Trophy,
  Award,
  Gem,
  Heart,
  Target
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StreakReward {
  day: number;
  title: string;
  description: string;
  xp: number;
  badge?: string;
  special?: boolean;
}

interface MotivationalMessageProps {
  show: boolean;
  type: 'streak' | 'achievement' | 'encouragement' | 'milestone';
  message: string;
  onClose: () => void;
}

const streakRewards: StreakReward[] = [
  { day: 3, title: 'Iniciante Dedicado', description: 'Você manteve 3 dias consecutivos!', xp: 100, badge: '🔥' },
  { day: 7, title: 'Uma Semana Forte', description: 'Uma semana inteira de dedicação!', xp: 250, badge: '⭐', special: true },
  { day: 14, title: 'Duas Semanas de Foco', description: 'Sua disciplina é inspiradora!', xp: 500, badge: '👑' },
  { day: 21, title: 'Hábito Formado', description: '21 dias! Você criou um hábito sólido!', xp: 750, badge: '💎', special: true },
  { day: 30, title: 'Mestre da Consistência', description: 'Um mês inteiro! Você é incrível!', xp: 1000, badge: '🏆', special: true },
  { day: 50, title: 'Guerreiro Imparável', description: '50 dias consecutivos! Lendário!', xp: 1500, badge: '⚡', special: true },
  { day: 100, title: 'Centurião da Saúde', description: '100 dias! Você é uma lenda viva!', xp: 3000, badge: '🌟', special: true }
];

const motivationalMessages = [
  "Você está mais próximo do seu objetivo! 💪",
  "Cada passo conta! Continue assim! 🚀",
  "Sua dedicação vai mudar sua vida! ✨",
  "Você está criando uma versão melhor de si! 🌱",
  "Pequenos progressos levam a grandes resultados! 🎯",
  "Sua consistência é sua maior força! 🔥",
  "Você está inspirando outras pessoas! 👥",
  "Cada dia é uma vitória! Celebre isso! 🎉"
];

const MotivationalMessage: React.FC<MotivationalMessageProps> = ({ show, type, message, onClose }) => {
  if (!show) return null;

  const getIcon = () => {
    switch (type) {
      case 'streak': return <Flame className="w-6 h-6 text-orange-500" />;
      case 'achievement': return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'milestone': return <Crown className="w-6 h-6 text-purple-500" />;
      default: return <Heart className="w-6 h-6 text-red-500" />;
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'streak': return 'from-orange-500 to-red-500';
      case 'achievement': return 'from-yellow-500 to-orange-500';
      case 'milestone': return 'from-purple-500 to-pink-500';
      default: return 'from-blue-500 to-green-500';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -50, scale: 0.9 }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
      >
        <Card className={`bg-gradient-to-r ${getGradient()} text-white border-0 shadow-2xl`}>
          <CardContent className="p-4 flex items-center gap-3">
            {getIcon()}
            <div className="flex-1">
              <p className="font-medium">{message}</p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              ✕
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

interface ProgressStreakDisplayProps {
  currentStreak: number;
  bestStreak: number;
  onStreakUpdate?: (newStreak: number) => void;
}

export const ProgressStreakDisplay: React.FC<ProgressStreakDisplayProps> = ({
  currentStreak,
  bestStreak,
  onStreakUpdate
}) => {
  const [showMessage, setShowMessage] = useState(false);
  const [messageType, setMessageType] = useState<'streak' | 'achievement' | 'encouragement' | 'milestone'>('encouragement');
  const [currentMessage, setCurrentMessage] = useState('');

  const nextReward = streakRewards.find(reward => reward.day > currentStreak);
  const currentReward = streakRewards.filter(reward => reward.day <= currentStreak).pop();
  
  const progressToNext = nextReward ? (currentStreak / nextReward.day) * 100 : 100;
  const daysToNext = nextReward ? nextReward.day - currentStreak : 0;

  const showMotivationalMessage = (type: typeof messageType, message: string) => {
    setMessageType(type);
    setCurrentMessage(message);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), 4000);
  };

  const handleStreakIncrease = () => {
    const newStreak = currentStreak + 1;
    onStreakUpdate?.(newStreak);

    const reward = streakRewards.find(r => r.day === newStreak);
    if (reward) {
      showMotivationalMessage('achievement', `🎉 ${reward.title}! +${reward.xp} XP`);
    } else if (newStreak % 5 === 0) {
      showMotivationalMessage('milestone', `🔥 ${newStreak} dias consecutivos! Você está arrasando!`);
    } else {
      const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
      showMotivationalMessage('encouragement', randomMessage);
    }
  };

  return (
    <>
      <MotivationalMessage 
        show={showMessage}
        type={messageType}
        message={currentMessage}
        onClose={() => setShowMessage(false)}
      />

      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-semibold text-orange-700">Sequência Atual</span>
            </div>
            <Badge className="bg-orange-500 text-white">
              {currentStreak} dias
            </Badge>
          </div>

          {/* Progress Bar */}
          {nextReward && (
            <div className="mb-3">
              <div className="flex justify-between text-sm text-orange-600 mb-1">
                <span>Próxima recompensa: {nextReward.title}</span>
                <span>{daysToNext} dias restantes</span>
              </div>
              <div className="w-full bg-orange-100 rounded-full h-2">
                <motion.div 
                  className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          )}

          {/* Current Reward */}
          {currentReward && (
            <div className="mb-3 p-2 bg-white rounded-lg border border-orange-200">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentReward.badge}</span>
                <div className="flex-1">
                  <p className="font-medium text-orange-800">{currentReward.title}</p>
                  <p className="text-xs text-orange-600">{currentReward.description}</p>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-300">
                  +{currentReward.xp} XP
                </Badge>
              </div>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="font-bold text-orange-600">{currentStreak}</div>
              <div className="text-xs text-orange-500">Atual</div>
            </div>
            <div className="text-center p-2 bg-white rounded-lg">
              <div className="font-bold text-orange-600">{bestStreak}</div>
              <div className="text-xs text-orange-500">Recorde</div>
            </div>
          </div>

          {/* Action Button */}
          <Button 
            onClick={handleStreakIncrease}
            className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            size="sm"
          >
            <Target className="w-4 h-4 mr-2" />
            Registrar Progresso Hoje
          </Button>

          {/* Upcoming Rewards Preview */}
          {nextReward && (
            <div className="mt-3 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="text-center">
                <p className="text-xs text-yellow-700 mb-1">Próxima Recompensa</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg">{nextReward.badge}</span>
                  <div>
                    <p className="font-medium text-yellow-800 text-sm">{nextReward.title}</p>
                    <p className="text-xs text-yellow-600">+{nextReward.xp} XP</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default ProgressStreakDisplay;