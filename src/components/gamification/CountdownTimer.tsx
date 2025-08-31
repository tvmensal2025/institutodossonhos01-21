import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  description?: string;
  urgentThreshold?: number; // horas
  criticalThreshold?: number; // horas
  onComplete?: () => void;
  showMilliseconds?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  milliseconds: number;
  total: number;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  title = "Tempo Restante",
  description,
  urgentThreshold = 24,
  criticalThreshold = 6,
  onComplete,
  showMilliseconds = false
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
    total: 0
  });

  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        const milliseconds = Math.floor((difference % 1000) / 10);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          milliseconds,
          total: difference
        });
      } else {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
          total: 0
        });
        
        if (!isComplete) {
          setIsComplete(true);
          onComplete?.();
        }
      }
    }, showMilliseconds ? 10 : 1000);

    return () => clearInterval(timer);
  }, [targetDate, onComplete, isComplete, showMilliseconds]);

  const getUrgencyLevel = () => {
    const hoursLeft = timeLeft.total / (1000 * 60 * 60);
    
    if (hoursLeft <= criticalThreshold) return 'critical';
    if (hoursLeft <= urgentThreshold) return 'urgent';
    return 'normal';
  };

  const urgencyLevel = getUrgencyLevel();

  const getUrgencyColor = () => {
    switch (urgencyLevel) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-950/20';
      case 'urgent': return 'border-orange-500 bg-orange-50 dark:bg-orange-950/20';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  const getUrgencyIcon = () => {
    if (isComplete) return <CheckCircle className="w-5 h-5 text-green-500" />;
    
    switch (urgencyLevel) {
      case 'critical': 
      case 'urgent': 
        return (
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <AlertTriangle className={`w-5 h-5 ${urgencyLevel === 'critical' ? 'text-red-500' : 'text-orange-500'}`} />
          </motion.div>
        );
      default: 
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatNumber = (num: number) => num.toString().padStart(2, '0');

  if (isComplete) {
    return (
      <Card className="border-green-500 bg-green-50 dark:bg-green-950/20">
        <CardContent className="p-6 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">
              Tempo Esgotado!
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              {title} chegou ao fim
            </p>
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${getUrgencyColor()} transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getUrgencyIcon()}
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          
          {urgencyLevel !== 'normal' && (
            <Badge variant={urgencyLevel === 'critical' ? 'destructive' : 'default'}>
              {urgencyLevel === 'critical' ? 'CRÍTICO' : 'URGENTE'}
            </Badge>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
        )}

        <div className="grid grid-cols-4 gap-4">
          {/* Days */}
          <div className="text-center">
            <motion.div
              key={timeLeft.days}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              {formatNumber(timeLeft.days)}
            </motion.div>
            <div className="text-xs text-muted-foreground">DIAS</div>
          </div>

          {/* Hours */}
          <div className="text-center">
            <motion.div
              key={timeLeft.hours}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className={`text-2xl sm:text-3xl font-bold ${
                urgencyLevel === 'critical' ? 'text-red-500' : 
                urgencyLevel === 'urgent' ? 'text-orange-500' : 'text-foreground'
              }`}
            >
              {formatNumber(timeLeft.hours)}
            </motion.div>
            <div className="text-xs text-muted-foreground">HORAS</div>
          </div>

          {/* Minutes */}
          <div className="text-center">
            <motion.div
              key={timeLeft.minutes}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              {formatNumber(timeLeft.minutes)}
            </motion.div>
            <div className="text-xs text-muted-foreground">MIN</div>
          </div>

          {/* Seconds */}
          <div className="text-center">
            <motion.div
              key={timeLeft.seconds}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-2xl sm:text-3xl font-bold text-foreground"
            >
              {formatNumber(timeLeft.seconds)}
            </motion.div>
            <div className="text-xs text-muted-foreground">SEG</div>
          </div>
        </div>

        {showMilliseconds && (
          <div className="text-center mt-4">
            <motion.div
              key={timeLeft.milliseconds}
              className="text-lg font-mono text-muted-foreground"
            >
              .{formatNumber(timeLeft.milliseconds)}
            </motion.div>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full transition-all duration-300 ${
                urgencyLevel === 'critical' ? 'bg-red-500' :
                urgencyLevel === 'urgent' ? 'bg-orange-500' : 'bg-blue-500'
              }`}
              style={{ 
                width: `${Math.max(0, Math.min(100, (timeLeft.total / (1000 * 60 * 60 * 24)) * 4))}%` 
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};