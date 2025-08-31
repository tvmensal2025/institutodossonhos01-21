import React, { useEffect, useState } from 'react';
import { useInteractiveTutorial } from '@/hooks/useInteractiveTutorial';
import { SofiaTutorialDemo } from './SofiaTutorialDemo';
import { InteractiveTutorialPopup } from './InteractiveTutorialPopup';

// Constante para verificar ambiente
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export const InteractiveTutorial: React.FC = () => {
  const {
    tutorialState,
    showWelcomeModal,
    showTutorial,
    setShowWelcomeModal,
    startTutorial,
    nextStep,
    previousStep,
    onSkip,
    resetTutorial
  } = useInteractiveTutorial();

  // Debug logs - apenas em desenvolvimento
  useEffect(() => {
    if (IS_DEVELOPMENT) {
      console.log('🔍 InteractiveTutorial renderizado');
      console.log('📊 Estado atual:', tutorialState);
      console.log('👁️ showTutorial:', showTutorial);
    }
  }, [tutorialState, showTutorial]);

  // Se não há nada para mostrar, não renderizar nada
  if (!showWelcomeModal && !showTutorial && !tutorialState.isActive) {
    return null;
  }

  return (
    <>
      {/* Tutorial de Boas-vindas */}
      <SofiaTutorialDemo
        isOpen={showWelcomeModal}
        onStart={startTutorial}
        onSkip={() => {
          setShowWelcomeModal(false);
          localStorage.setItem('interactive-tutorial-completed', 'true');
        }}
      />

      {/* Tutorial Interativo */}
      <InteractiveTutorialPopup
        tutorialState={tutorialState}
        onNext={nextStep}
        onPrevious={previousStep}
        onSkip={onSkip}
        onClose={() => {
          setShowWelcomeModal(false);
          localStorage.setItem('interactive-tutorial-completed', 'true');
        }}
      />
    </>
  );
};



