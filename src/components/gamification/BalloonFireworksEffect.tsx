import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BalloonFireworksEffectProps {
  trigger: boolean;
  duration?: number;
}

export const BalloonFireworksEffect: React.FC<BalloonFireworksEffectProps> = ({
  trigger,
  duration = 4000
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
        <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
          {/* Balões Coloridos */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`balloon-${i}`}
              className={`absolute w-8 h-10 rounded-full ${
                ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 
                 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500'][i % 8]
              }`}
              style={{
                left: `${20 + (i * 10)}%`,
                bottom: '-40px'
              }}
              initial={{
                y: 0,
                scale: 0,
                opacity: 0
              }}
              animate={{
                y: -window.innerHeight - 100,
                scale: [0, 1.2, 1, 1.1],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: 4,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            >
              {/* Corda do balão */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-px h-6 bg-gray-400" />
            </motion.div>
          ))}

          {/* Fogos de Artifício */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={`firework-${i}`}
              className="absolute"
              style={{
                left: `${10 + (i * 5)}%`,
                top: `${20 + (i * 4)}%`
              }}
              initial={{
                scale: 0,
                opacity: 0
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                ease: "easeOut"
              }}
            >
              {/* Explosão de fogos */}
              {[...Array(12)].map((_, j) => (
                <motion.div
                  key={`spark-${i}-${j}`}
                  className={`absolute w-2 h-2 rounded-full ${
                    ['bg-yellow-400', 'bg-red-400', 'bg-blue-400', 'bg-green-400'][j % 4]
                  }`}
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: 'translate(-50%, -50%)'
                  }}
                  initial={{
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 0
                  }}
                  animate={{
                    x: Math.cos((j * 30) * Math.PI / 180) * 60,
                    y: Math.sin((j * 30) * Math.PI / 180) * 60,
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.2 + j * 0.1,
                    ease: "easeOut"
                  }}
                />
              ))}
            </motion.div>
          ))}

          {/* Partículas Douradas */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 bg-yellow-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`
              }}
              initial={{
                scale: 0,
                opacity: 0,
                rotate: 0
              }}
              animate={{
                scale: [0, 1.5, 0],
                opacity: [0, 1, 0],
                rotate: 360
              }}
              transition={{
                duration: 3,
                delay: i * 0.1,
                ease: "easeOut"
              }}
            />
          ))}

          {/* Estrelas Brilhantes */}
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute text-yellow-300 text-2xl"
              style={{
                left: `${15 + (i * 7)}%`,
                top: `${10 + (i * 8)}%`
              }}
              initial={{
                scale: 0,
                opacity: 0,
                rotate: 0
              }}
              animate={{
                scale: [0, 1.5, 1, 1.2, 0],
                opacity: [0, 1, 1, 1, 0],
                rotate: 720
              }}
              transition={{
                duration: 3,
                delay: i * 0.3,
                ease: "easeOut"
              }}
            >
              ⭐
            </motion.div>
          ))}

          {/* Mensagem de Celebração */}
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            initial={{
              scale: 0,
              opacity: 0
            }}
            animate={{
              scale: [0, 1.2, 1],
              opacity: [0, 1, 1]
            }}
            transition={{
              duration: 1,
              delay: 0.5
            }}
          >
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full shadow-lg text-lg font-bold">
              🎉 Meta Atualizada! 🎉
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Hook para usar o efeito facilmente
export const useBalloonFireworks = () => {
  const [trigger, setTrigger] = useState(false);

  const celebrate = () => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 100);
  };

  return { trigger, celebrate };
}; 