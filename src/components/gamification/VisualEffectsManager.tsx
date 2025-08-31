import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface VisualEffectsManagerProps {
  trigger: boolean;
  effectType?: 'celebration' | 'fireworks' | 'confetti' | 'success';
  duration?: number;
}

export const VisualEffectsManager: React.FC<VisualEffectsManagerProps> = ({
  trigger,
  effectType = 'celebration',
  duration = 3000
}) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger) {
      setIsActive(true);
      setTimeout(() => setIsActive(false), duration);
    }
  }, [trigger, duration]);

  if (!isActive) return null;

  return (
    <AnimatePresence>
      {isActive && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {/* Fogos de Artifício */}
          {effectType === 'fireworks' && (
            <>
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: window.innerHeight,
                    scale: 0
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight * 0.5,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </>
          )}

          {/* Confete */}
          {effectType === 'confetti' && (
            <>
              {[...Array(50)].map((_, i) => (
                <motion.div
                  key={i}
                  className={`absolute w-3 h-3 rounded-full ${
                    ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500'][i % 5]
                  }`}
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: -10,
                    rotate: 0
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: window.innerHeight + 10,
                    rotate: 360
                  }}
                  transition={{
                    duration: 3,
                    delay: i * 0.05,
                    ease: "easeIn"
                  }}
                />
              ))}
            </>
          )}

          {/* Efeito de Celebração Geral */}
          {effectType === 'celebration' && (
            <>
              {/* Partículas brilhantes */}
              {[...Array(30)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}

              {/* Estrelas */}
              {[...Array(10)].map((_, i) => (
                <motion.div
                  key={`star-${i}`}
                  className="absolute text-yellow-400 text-2xl"
                  initial={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 180, 360]
                  }}
                  transition={{
                    duration: 2.5,
                    delay: i * 0.2,
                    ease: "easeOut"
                  }}
                >
                  ⭐
                </motion.div>
              ))}
            </>
          )}

          {/* Efeito de Sucesso */}
          {effectType === 'success' && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="text-6xl text-green-500"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                ✅
              </motion.div>
            </motion.div>
          )}

          {/* Overlay de brilho */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export const useAlternatingEffects = () => {
  const [trigger, setTrigger] = useState(false);
  const [currentEffect, setCurrentEffect] = useState<'celebration' | 'fireworks' | 'confetti' | 'success'>('celebration');

  const triggerEffect = (effect: 'celebration' | 'fireworks' | 'confetti' | 'success' = 'celebration') => {
    setCurrentEffect(effect);
    setTrigger(true);
    setTimeout(() => setTrigger(false), 100);
  };

  const celebrateWithEffects = () => {
    const effects: Array<'celebration' | 'fireworks' | 'confetti' | 'success'> = ['celebration', 'fireworks', 'confetti'];
    const randomEffect = effects[Math.floor(Math.random() * effects.length)];
    triggerEffect(randomEffect);
  };

  return {
    trigger,
    currentEffect,
    triggerEffect,
    celebrateWithEffects
  };
};