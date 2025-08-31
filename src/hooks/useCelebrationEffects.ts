import { useState } from 'react';

export const useCelebrationEffects = () => {
  const [activeCelebration, setActiveCelebration] = useState(false);

  const celebrateDesafioCompletion = () => {
    setActiveCelebration(true);
    
    // Reset após 3 segundos
    setTimeout(() => {
      setActiveCelebration(false);
    }, 3000);
  };

  const celebrateProgressUpdate = () => {
    setActiveCelebration(true);
    
    // Reset após 2 segundos
    setTimeout(() => {
      setActiveCelebration(false);
    }, 2000);
  };

  const celebrateParticipation = () => {
    setActiveCelebration(true);
    
    // Reset após 1.5 segundos
    setTimeout(() => {
      setActiveCelebration(false);
    }, 1500);
  };

  const celebrateGoalCompletion = () => {
    setActiveCelebration(true);
    
    // Reset após 3 segundos
    setTimeout(() => {
      setActiveCelebration(false);
    }, 3000);
  };

  const triggerCelebration = (message?: string) => {
    setActiveCelebration(true);
    
    // Reset após 2 segundos
    setTimeout(() => {
      setActiveCelebration(false);
    }, 2000);
  };

  return {
    activeCelebration,
    celebrateDesafioCompletion,
    celebrateProgressUpdate,
    celebrateParticipation,
    celebrateGoalCompletion,
    triggerCelebration
  };
};