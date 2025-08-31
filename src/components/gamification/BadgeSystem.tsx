import React from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Target, 
  Star, 
  Crown, 
  Zap, 
  Heart,
  Calendar,
  TrendingUp,
  Award,
  Medal,
  Gem
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export interface GameBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  requirement: string;
  earned: boolean;
  earnedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

interface BadgeSystemProps {
  badges: GameBadge[];
  showProgress?: boolean;
  layout?: 'grid' | 'list';
  animated?: boolean;
}

const iconMap = {
  trophy: Trophy,
  flame: Flame,
  target: Target,
  star: Star,
  crown: Crown,
  zap: Zap,
  heart: Heart,
  calendar: Calendar,
  trending: TrendingUp,
  award: Award,
  medal: Medal,
  gem: Gem
};

const tierColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-cyan-600',
  diamond: 'from-purple-400 to-purple-600'
};

const tierGlow = {
  bronze: 'shadow-amber-500/20',
  silver: 'shadow-gray-500/20',
  gold: 'shadow-yellow-500/30',
  platinum: 'shadow-cyan-500/30',
  diamond: 'shadow-purple-500/40'
};

export const BadgeSystem: React.FC<BadgeSystemProps> = ({
  badges,
  showProgress = true,
  layout = 'grid',
  animated = true
}) => {
  const earnedBadges = badges.filter(badge => badge.earned);
  const unEarnedBadges = badges.filter(badge => !badge.earned);

  const BadgeCard: React.FC<{ badge: GameBadge; index: number }> = ({ badge, index }) => {
    const IconComponent = iconMap[badge.icon as keyof typeof iconMap] || Trophy;
    const progress = badge.progress && badge.maxProgress ? (badge.progress / badge.maxProgress) * 100 : 0;

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={animated ? { scale: 0, rotate: -180 } : {}}
            animate={animated ? { scale: 1, rotate: 0 } : {}}
            transition={{ 
              type: "spring", 
              stiffness: 200, 
              delay: index * 0.1 
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card className={`relative overflow-hidden cursor-pointer transition-all duration-300 ${
              badge.earned 
                ? `border-2 ${tierGlow[badge.tier]} shadow-lg bg-gradient-to-br ${tierColors[badge.tier]}` 
                : 'border-dashed border-muted-foreground/30 bg-muted/50'
            }`}>
              <CardContent className="p-4 text-center">
                {/* Badge Icon */}
                <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${
                  badge.earned 
                    ? 'bg-white/20 backdrop-blur-sm' 
                    : 'bg-muted'
                }`}>
                  <IconComponent 
                    className={`w-6 h-6 ${
                      badge.earned 
                        ? 'text-white' 
                        : 'text-muted-foreground'
                    }`} 
                  />
                </div>

                {/* Badge Name */}
                <h3 className={`text-sm font-semibold mb-1 ${
                  badge.earned ? 'text-white' : 'text-muted-foreground'
                }`}>
                  {badge.name}
                </h3>

                {/* Tier Badge */}
                <Badge 
                  variant="outline" 
                  className={`mb-2 ${
                    badge.earned 
                      ? 'border-white/30 text-white bg-white/10' 
                      : 'border-muted-foreground/30'
                  }`}
                >
                  {badge.tier.toUpperCase()}
                </Badge>

                {/* Progress (for unearned badges) */}
                {!badge.earned && showProgress && badge.progress !== undefined && badge.maxProgress && (
                  <div className="w-full bg-muted rounded-full h-2 mb-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                )}

                {/* Earned Date */}
                {badge.earned && badge.earnedAt && (
                  <div className="text-xs text-white/70">
                    Conquistado em {badge.earnedAt.toLocaleDateString('pt-BR')}
                  </div>
                )}

                {/* Progress Text */}
                {!badge.earned && badge.progress !== undefined && badge.maxProgress && (
                  <div className="text-xs text-muted-foreground">
                    {badge.progress}/{badge.maxProgress}
                  </div>
                )}
              </CardContent>

              {/* Animated Border for Earned Badges */}
              {badge.earned && (
                <motion.div
                  className="absolute inset-0 border-2 border-white/50 rounded-lg"
                  animate={{
                    opacity: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              )}
            </Card>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{badge.name}</p>
            <p className="text-sm text-muted-foreground">{badge.description}</p>
            <p className="text-xs mt-1">Requisito: {badge.requirement}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div className="space-y-6">
      {/* Earned Badges */}
      {earnedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Conquistas Desbloqueadas ({earnedBadges.length})
          </h3>
          <div className={layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
            {earnedBadges.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={index} />
            ))}
          </div>
        </div>
      )}

      {/* Unearned Badges */}
      {unEarnedBadges.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-muted-foreground" />
            Próximas Conquistas ({unEarnedBadges.length})
          </h3>
          <div className={layout === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4' : 'space-y-2'}>
            {unEarnedBadges.map((badge, index) => (
              <BadgeCard key={badge.id} badge={badge} index={index + earnedBadges.length} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};