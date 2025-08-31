import { useState, useEffect } from 'react';

interface TutorialPreferences {
  hasCompletedTutorial: boolean;
  hasSeenTutorial: boolean;
  lastSeenDate: string | null;
  tutorialVersion: string;
}

const TUTORIAL_VERSION = '1.0.0';
const TUTORIAL_STORAGE_KEY = 'sofia-tutorial-preferences';

export const useFirstAccessTutorial = () => {
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialPreferences, setTutorialPreferences] = useState<TutorialPreferences>({
    hasCompletedTutorial: false,
    hasSeenTutorial: false,
    lastSeenDate: null,
    tutorialVersion: TUTORIAL_VERSION
  });

  // Carregar preferências do localStorage
  useEffect(() => {
    const loadPreferences = () => {
      try {
        const stored = localStorage.getItem(TUTORIAL_STORAGE_KEY);
        if (stored) {
          const preferences = JSON.parse(stored);
          setTutorialPreferences(preferences);
        }
      } catch (error) {
        console.error('Erro ao carregar preferências do tutorial:', error);
      }
    };

    loadPreferences();
  }, []);

  // Salvar preferências no localStorage
  const savePreferences = (newPreferences: Partial<TutorialPreferences>) => {
    try {
      const updatedPreferences = { ...tutorialPreferences, ...newPreferences };
      localStorage.setItem(TUTORIAL_STORAGE_KEY, JSON.stringify(updatedPreferences));
      setTutorialPreferences(updatedPreferences);
    } catch (error) {
      console.error('Erro ao salvar preferências do tutorial:', error);
    }
  };

  // Verificar se deve mostrar o tutorial automaticamente
  useEffect(() => {
    const shouldShowTutorial = () => {
      // Se nunca viu o tutorial, mostrar automaticamente
      if (!tutorialPreferences.hasSeenTutorial) {
        return true;
      }

      // Se mudou a versão do tutorial, mostrar novamente
      if (tutorialPreferences.tutorialVersion !== TUTORIAL_VERSION) {
        return true;
      }

      // Se completou o tutorial, não mostrar automaticamente
      if (tutorialPreferences.hasCompletedTutorial) {
        return false;
      }

      // Se viu mas não completou, não mostrar automaticamente
      return false;
    };

    if (shouldShowTutorial()) {
      // Aguardar 3 segundos para o usuário se familiarizar com a plataforma
      const timer = setTimeout(() => {
        setShowTutorial(true);
        savePreferences({ 
          hasSeenTutorial: true, 
          lastSeenDate: new Date().toISOString() 
        });
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [tutorialPreferences.hasSeenTutorial, tutorialPreferences.hasCompletedTutorial, tutorialPreferences.tutorialVersion]);

  // Funções de controle do tutorial
  const openTutorial = () => {
    setShowTutorial(true);
    savePreferences({ 
      hasSeenTutorial: true, 
      lastSeenDate: new Date().toISOString() 
    });
  };

  const closeTutorial = () => {
    setShowTutorial(false);
  };

  const completeTutorial = () => {
    setShowTutorial(false);
    savePreferences({ 
      hasCompletedTutorial: true, 
      lastSeenDate: new Date().toISOString() 
    });
  };

  const resetTutorial = () => {
    localStorage.removeItem(TUTORIAL_STORAGE_KEY);
    setTutorialPreferences({
      hasCompletedTutorial: false,
      hasSeenTutorial: false,
      lastSeenDate: null,
      tutorialVersion: TUTORIAL_VERSION
    });
    setShowTutorial(false);
  };

  const getTutorialStatus = () => {
    if (tutorialPreferences.hasCompletedTutorial) {
      return 'completed';
    } else if (tutorialPreferences.hasSeenTutorial) {
      return 'seen';
    } else {
      return 'never';
    }
  };

  return {
    showTutorial,
    tutorialPreferences,
    openTutorial,
    closeTutorial,
    completeTutorial,
    resetTutorial,
    getTutorialStatus,
    hasCompletedTutorial: tutorialPreferences.hasCompletedTutorial,
    hasSeenTutorial: tutorialPreferences.hasSeenTutorial
  };
};
