import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Constante para verificar ambiente
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

export interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string; // CSS selector para o elemento alvo
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'type' | 'scroll' | 'wait' | 'watch';
  actionText?: string;
  delay?: number;
  required?: boolean;
}

export interface TutorialState {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  isCompleted: boolean;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🌟 Parabéns! Bem-vindo(a) à Plataforma dos Sonhos!',
    description: 'Que alegria ter você aqui conosco! 🎉 Vou te guiar por todas as funcionalidades para que você aproveite ao máximo sua jornada de transformação.',
    target: 'body',
    position: 'center',
    action: 'wait',
    required: true
  },
  {
    id: 'video-tutorial',
    title: '🎥 Tutorial da Plataforma',
    description: 'Assista ao tutorial completo para aprender todas as funcionalidades da plataforma de forma prática e visual!',
    target: 'body',
    position: 'center',
    action: 'watch',
    required: true
  }
];

export const useInteractiveTutorial = () => {
  const [tutorialState, setTutorialState] = useState<TutorialState>({
    isActive: false,
    currentStep: 0,
    steps: TUTORIAL_STEPS,
    isCompleted: false
  });

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Detectar tipo de dispositivo - MEMOIZADO
  const detectDevice = useCallback((): 'mobile' | 'tablet' | 'pc' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'pc';
  }, []);

  // Verificar se deve mostrar o tutorial (após cadastro/login)
  useEffect(() => {
    if (IS_DEVELOPMENT) {
      console.log('🔍 useInteractiveTutorial: Verificando status...');
    }
    
    const checkUserAndShowTutorial = async () => {
      try {
        // Verificar se há usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          if (IS_DEVELOPMENT) {
            console.log('🔍 Nenhum usuário logado, não mostrar tutorial');
          }
          return; // Não mostrar tutorial se não há usuário logado
        }
        
        if (IS_DEVELOPMENT) {
          console.log('🔍 Usuário logado:', user.id);
        }
        
        // Verificar se já foi completado ou iniciado
        const isCompleted = localStorage.getItem('interactive-tutorial-completed') === 'true';
        const isStarted = localStorage.getItem('interactive-tutorial-started') === 'true';
        
        // Mostrar tutorial APENAS se:
        // 1. Nunca foi visto (novo usuário) E
        // 2. Nunca foi iniciado E  
        // 3. Nunca foi completado
        if (!isCompleted && !isStarted) {
          const timer = setTimeout(() => {
            if (IS_DEVELOPMENT) {
              console.log('🚀 Definindo showWelcomeModal como true para novo usuário');
            }
            setShowWelcomeModal(true);
          }, 1000);

          return () => clearTimeout(timer);
        } else {
          if (IS_DEVELOPMENT) {
            console.log('🔍 Tutorial já foi visto ou iniciado, não mostrar');
          }
        }
      } catch (error) {
        if (IS_DEVELOPMENT) {
          console.error('Erro ao verificar usuário:', error);
        }
      }
    };
    
    checkUserAndShowTutorial();
  }, []);

  // Iniciar tutorial - OTIMIZADO
  const startTutorial = useCallback(() => {
    if (IS_DEVELOPMENT) {
      console.log('🚀 Iniciando tutorial...');
    }
    
    // Primeiro fechar o modal de boas-vindas
    setShowWelcomeModal(false);
    
    // Aguardar o modal fechar e então mostrar o tutorial
    setTimeout(() => {
      setShowTutorial(true);
      
      // CORRIGIDO: Definir tutorial como ativo e ir direto para o segundo passo (vídeo)
      setTutorialState(prev => ({
        ...prev,
        isActive: true,
        currentStep: 1 // CORRIGIDO: ir direto para o segundo passo (vídeo)
      }));
      
      if (IS_DEVELOPMENT) {
        console.log('🎯 Tutorial mostrado e ativado - passo 1 (vídeo)');
      }
      
      // Marcar como iniciado no localStorage
      localStorage.setItem('interactive-tutorial-started', 'true');
    }, 300);
  }, []);

  // Próximo passo - OTIMIZADO
  const nextStep = useCallback(() => {
    if (IS_DEVELOPMENT) {
      console.log('➡️ Próximo passo...');
    }
    
    setTutorialState(prev => {
      const nextStepIndex = prev.currentStep + 1;
      
      if (nextStepIndex < prev.steps.length) {
        return {
          ...prev,
          currentStep: nextStepIndex,
          isActive: true // Manter ativo durante o tutorial
        };
      } else {
        // Tutorial completo
        if (IS_DEVELOPMENT) {
          console.log('✅ Tutorial completo!');
        }
        localStorage.setItem('interactive-tutorial-completed', 'true');
        return {
          ...prev,
          isActive: false,
          isCompleted: true
        };
      }
    });
  }, []);

  // Passo anterior - OTIMIZADO
  const previousStep = useCallback(() => {
    if (IS_DEVELOPMENT) {
      console.log('⬅️ Passo anterior...');
    }
    
    setTutorialState(prev => ({
      ...prev,
      currentStep: Math.max(0, prev.currentStep - 1)
    }));
  }, []);

  // Pular tutorial - OTIMIZADO
  const onSkip = useCallback(() => {
    if (IS_DEVELOPMENT) {
      console.log('⏭️ Tutorial pulado pelo usuário');
    }
    
    setTutorialState(prev => ({
      ...prev,
      isActive: false,
      currentStep: 0,
      isCompleted: true
    }));
    setShowWelcomeModal(false);
    setShowTutorial(false);
    
    // Marcar como completado no localStorage para não aparecer mais
    localStorage.setItem('interactive-tutorial-completed', 'true');
    localStorage.setItem('interactive-tutorial-started', 'true');
  }, []);

  // Reset tutorial - OTIMIZADO
  const resetTutorial = useCallback(() => {
    if (IS_DEVELOPMENT) {
      console.log('🔄 Resetando tutorial...');
    }
    
    localStorage.removeItem('interactive-tutorial-completed');
    localStorage.removeItem('interactive-tutorial-started');
    setTutorialState({
      isActive: false,
      currentStep: 0,
      steps: TUTORIAL_STEPS,
      isCompleted: false
    });
    setShowWelcomeModal(false);
    setShowTutorial(false);
    
    // Mostrar novamente após reset (apenas quando explicitamente chamado)
    setTimeout(() => {
      setShowWelcomeModal(true);
    }, 500);
  }, []);

  // Verificar se elemento alvo está visível - MEMOIZADO
  const isTargetVisible = useCallback((target: string) => {
    try {
      const element = document.querySelector(target);
      if (!element) return false;

      const rect = element.getBoundingClientRect();
      const isVisible = rect.width > 0 && rect.height > 0;
      const isInViewport = rect.top >= 0 && rect.left >= 0 && 
                          rect.bottom <= window.innerHeight && 
                          rect.right <= window.innerWidth;

      return isVisible && isInViewport;
    } catch (error) {
      return false;
    }
  }, []);

  // Scroll para elemento alvo se necessário - MEMOIZADO
  const scrollToTarget = useCallback((target: string) => {
    try {
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    } catch (error) {
      if (IS_DEVELOPMENT) {
        console.error('Erro ao fazer scroll para elemento:', error);
      }
    }
  }, []);

  return {
    tutorialState,
    showWelcomeModal,
    showTutorial,
    setShowWelcomeModal,
    startTutorial,
    nextStep,
    previousStep,
    onSkip,
    resetTutorial,
    isTargetVisible,
    scrollToTarget
  };
};
