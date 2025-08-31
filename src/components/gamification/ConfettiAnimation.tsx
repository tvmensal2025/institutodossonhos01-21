import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotation: number;
  velocity: { x: number; y: number };
}

interface ConfettiAnimationProps {
  trigger: boolean;
  duration?: number;
  colors?: string[];
  particleCount?: number;
  onComplete?: () => void;
}

export const ConfettiAnimation: React.FC<ConfettiAnimationProps> = ({
  trigger,
  duration = 3000,
  colors = [
    'hsl(var(--primary))',
    'hsl(var(--secondary))',
    'hsl(var(--accent))',
    '#FFD700',
    '#FF6B6B',
    '#4ECDC4',
    '#45B7D1',
    '#96CEB4',
    '#FFEAA7',
    '#DDA0DD'
  ],
  particleCount = 50,
  onComplete
}) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      startConfetti();
    }
  }, [trigger]);

  const startConfetti = () => {
    setIsActive(true);
    const pieces: ConfettiPiece[] = [];
    
    for (let i = 0; i < particleCount; i++) {
      pieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 6 + 4,
        rotation: Math.random() * 360,
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2
        }
      });
    }
    
    setConfetti(pieces);

    // Clean up after duration
    setTimeout(() => {
      setIsActive(false);
      setConfetti([]);
      onComplete?.();
    }, duration);
  };

  if (!isActive) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      <AnimatePresence>
        {confetti.map((piece) => (
          <motion.div
            key={piece.id}
            initial={{
              x: piece.x,
              y: piece.y,
              rotate: piece.rotation,
              scale: 1,
              opacity: 1
            }}
            animate={{
              x: piece.x + piece.velocity.x * 100,
              y: window.innerHeight + 100,
              rotate: piece.rotation + 720,
              scale: [1, 1.2, 0.8],
              opacity: [1, 1, 0]
            }}
            exit={{
              opacity: 0,
              scale: 0
            }}
            transition={{
              duration: duration / 1000,
              ease: "easeOut"
            }}
            className="absolute"
            style={{
              backgroundColor: piece.color,
              width: piece.size,
              height: piece.size,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px'
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

// Hook para usar confetti facilmente
export const useConfetti = () => {
  const [trigger, setTrigger] = useState(false);

  const celebrate = () => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 100);
  };

  return { trigger, celebrate };
};