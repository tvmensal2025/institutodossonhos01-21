import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Play, SkipForward, Star, Menu } from 'lucide-react';
import { TutorialStep, TutorialState } from '@/hooks/useInteractiveTutorial';

// Constante para verificar ambiente
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';

interface InteractiveTutorialPopupProps {
  tutorialState: TutorialState;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const InteractiveTutorialPopup: React.FC<InteractiveTutorialPopupProps> = ({
  tutorialState,
  onNext,
  onPrevious,
  onSkip,
  onClose
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);

  const currentStep = tutorialState.steps[tutorialState.currentStep];

  // Calcular posição do popup baseado no elemento alvo - OTIMIZADO
  useEffect(() => {
    if (IS_DEVELOPMENT) {
      console.log('🎯 InteractiveTutorialPopup: Calculando posição para passo:', currentStep?.id);
      console.log('🎯 Target:', currentStep?.target);
      console.log('🎯 Tutorial ativo:', tutorialState.isActive);
    }
    
    const updatePosition = () => {
      if (!currentStep || currentStep.target === 'body') {
        if (IS_DEVELOPMENT) {
          console.log('🎯 Passo de boas-vindas, posicionando no topo...');
        }
        // Posicionar no topo da tela para o passo de boas-vindas
        setPosition({
          x: window.innerWidth / 2,
          y: 40 // 40px do topo
        });
        setIsVisible(true);
        return;
      }

      try {
        if (IS_DEVELOPMENT) {
          console.log('🎯 Procurando elemento:', currentStep.target);
        }
        const targetElement = document.querySelector(currentStep.target);
        
        if (targetElement) {
          const rect = targetElement.getBoundingClientRect();
          const popupWidth = popupRef.current?.offsetWidth || 350;
          const popupHeight = popupRef.current?.offsetHeight || 250;

          // Posicionar o popup PRÓXIMO ao elemento, não sobreposto
          let x, y;
          
          // Calcular posição baseado no tamanho do elemento e da tela
          const screenWidth = window.innerWidth;
          const screenHeight = window.innerHeight;
          
          // Estratégia de posicionamento inteligente
          if (rect.width > 150) {
            // Elemento grande (botões, cards), posicionar ao lado direito
            x = rect.right + 20;
            y = rect.top + rect.height / 2;
            
            // Se não couber à direita, posicionar à esquerda
            if (x + popupWidth > screenWidth - 20) {
              x = rect.left - popupWidth - 20;
            }
          } else {
            // Elemento pequeno (ícones, botões pequenos), posicionar acima ou abaixo
            if (rect.top > screenHeight / 2) {
              // Elemento na metade inferior, posicionar acima
              x = rect.left + rect.width / 2 - popupWidth / 2;
              y = rect.top - popupHeight - 20;
            } else {
              // Elemento na metade superior, posicionar abaixo
              x = rect.left + rect.width / 2 - popupWidth / 2;
              y = rect.bottom + 20;
            }
          }

          // Garantir que o popup não saia da tela
          x = Math.max(20, Math.min(x, screenWidth - popupWidth - 20));
          y = Math.max(20, Math.min(y, screenHeight - popupHeight - 20));
          
          // Para celulares pequenos, centralizar horizontalmente
          if (screenWidth < 768) {
            // Em celulares, centralizar horizontalmente
            x = Math.max(20, (screenWidth - popupWidth) / 2);
            if (y < 20) y = 20;
            if (y + popupHeight > screenHeight - 20) y = screenHeight - popupHeight - 20;
          }

          if (IS_DEVELOPMENT) {
            console.log('🎯 Posição final calculada:', { x, y });
          }
          setPosition({ x, y });
          setIsVisible(true);

          // Scroll para o elemento se necessário
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          if (IS_DEVELOPMENT) {
            console.log(`🎯 Popup posicionado em: x=${x}, y=${y} para elemento: ${currentStep.target}`);
          }
        } else {
          if (IS_DEVELOPMENT) {
            console.warn(`⚠️ Elemento não encontrado: ${currentStep.target}`);
          }
          // Se não encontrar o elemento, posicionar no topo
          setPosition({
            x: window.innerWidth / 2,
            y: 40
          });
          setIsVisible(true);
        }
      } catch (error) {
        if (IS_DEVELOPMENT) {
          console.error('Erro ao calcular posição do popup:', error);
        }
        // Em caso de erro, posicionar no topo
        setPosition({
          x: window.innerWidth / 2,
          y: 40
        });
        setIsVisible(true);
      }
    };

    // Aguardar um pouco para o DOM estar pronto
    const timer = setTimeout(updatePosition, 100);
    return () => clearTimeout(timer);
  }, [currentStep, tutorialState.isActive]);

  // Detectar clique no botão correto - OTIMIZADO
  useEffect(() => {
    if (!tutorialState.isActive || !currentStep || currentStep.target === 'body') return;

    if (IS_DEVELOPMENT) {
      console.log('🎯 SOLUÇÃO DEFINITIVA: Configurando event listener para:', currentStep.target);
    }

    const handleTargetClick = (event: Event) => {
      if (IS_DEVELOPMENT) {
        console.log('🎯 CLIQUE DETECTADO no elemento:', currentStep.target);
      }
      event.preventDefault();
      event.stopPropagation();
      
      // Forçar avanço do tutorial
      onNext();
    };

    // Função para adicionar listener com múltiplas estratégias
    const addClickListener = () => {
      // Estratégia 1: Listener direto no elemento
      const targetElement = document.querySelector(currentStep.target);
      
      if (targetElement) {
        // Remover listener anterior se existir
        targetElement.removeEventListener('click', handleTargetClick);
        
        // Adicionar novo listener com capture
        targetElement.addEventListener('click', handleTargetClick, true);
        
        if (IS_DEVELOPMENT) {
          console.log('🎯 Event listener direto adicionado com sucesso');
        }
        
        // Estratégia 2: Listener global como fallback
        const globalHandler = (event: Event) => {
          const clickedElement = event.target as Element;
          if (clickedElement && clickedElement.matches && clickedElement.matches(currentStep.target)) {
            if (IS_DEVELOPMENT) {
              console.log('🎯 CLIQUE GLOBAL DETECTADO no elemento:', currentStep.target);
            }
            event.preventDefault();
            event.stopPropagation();
            onNext();
          }
        };
        
        document.addEventListener('click', globalHandler, true);
        
        return () => {
          if (IS_DEVELOPMENT) {
            console.log('🎯 Removendo event listeners');
          }
          targetElement.removeEventListener('click', handleTargetClick, true);
          document.removeEventListener('click', globalHandler, true);
        };
      } else {
        if (IS_DEVELOPMENT) {
          console.warn('⚠️ Elemento não encontrado para event listener:', currentStep.target);
        }
        
        // Estratégia 3: Listener global como único recurso
        const globalHandler = (event: Event) => {
          const clickedElement = event.target as Element;
          if (clickedElement && clickedElement.matches && clickedElement.matches(currentStep.target)) {
            if (IS_DEVELOPMENT) {
              console.log('🎯 CLIQUE GLOBAL DETECTADO no elemento:', currentStep.target);
            }
            event.preventDefault();
            event.stopPropagation();
            onNext();
          }
        };
        
        document.addEventListener('click', globalHandler, true);
        
        return () => {
          document.removeEventListener('click', globalHandler, true);
        };
      }
    };

    const cleanup = addClickListener();
    return cleanup;
  }, [tutorialState.isActive, currentStep, onNext]);

  // Aplicar destaque ao elemento alvo - OTIMIZADO
  useEffect(() => {
    if (!currentStep || currentStep.target === 'body') return;

    const clearHighlights = () => {
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
        if (el instanceof HTMLElement) {
          el.style.outline = '';
          el.style.boxShadow = '';
        }
      });
      
      document.querySelectorAll('[data-tutorial-indicator]').forEach(el => {
        el.remove();
        el.removeAttribute('data-tutorial-indicator');
      });
    };

    const applyHighlight = () => {
      const targetElement = document.querySelector(currentStep.target);
      
      if (targetElement && targetElement instanceof HTMLElement) {
        // Aplicar destaque visual
        targetElement.classList.add('tutorial-highlight');
        targetElement.style.outline = '3px solid #3b82f6';
        targetElement.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.5)';
        
        // Adicionar indicador visual
        const indicator = document.createElement('div');
        indicator.innerHTML = '🎯';
        indicator.style.cssText = `
          position: absolute !important;
          top: -30px !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6) !important;
          color: white !important;
          padding: 8px 16px !important;
          border-radius: 20px !important;
          font-size: 14px !important;
          font-weight: bold !important;
          z-index: 10000 !important;
          animation: tutorial-bounce-premium 1s ease-in-out infinite !important;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.5) !important;
          pointer-events: none !important;
        `;
        
        targetElement.appendChild(indicator);
        targetElement.setAttribute('data-tutorial-indicator', 'true');
        
        if (IS_DEVELOPMENT) {
          console.log('🎯 Destaque aplicado com sucesso!');
        }
        return true;
      } else {
        if (IS_DEVELOPMENT) {
          console.warn('⚠️ Elemento não encontrado:', currentStep.target);
        }
        return false;
      }
    };

    // Tentar aplicar imediatamente
    let applied = applyHighlight();
    
    // Se não conseguiu, tentar novamente após um delay
    if (!applied) {
      const timer = setTimeout(() => {
        applyHighlight();
      }, 500);
      
      return () => {
        clearTimeout(timer);
        clearHighlights();
      };
    }

    // Verificar se o destaque foi aplicado após 100ms
    const verifyTimer = setTimeout(() => {
      const targetElement = document.querySelector(currentStep.target);
      if (targetElement && !targetElement.classList.contains('tutorial-highlight')) {
        if (IS_DEVELOPMENT) {
          console.log('⚠️ Destaque não foi aplicado, tentando novamente...');
        }
        applyHighlight();
      }
    }, 100);

    return () => {
      clearTimeout(verifyTimer);
      clearHighlights();
    };
  }, [currentStep]);

  // Função para determinar a direção da seta - MEMOIZADA
  const getArrowDirection = useCallback((rotation: string) => {
    if (rotation.includes('180deg')) return 'right';
    if (rotation.includes('90deg')) return 'up';
    if (rotation.includes('-90deg')) return 'down';
    return 'left';
  }, []);

  // Calcular posição do spotlight - MEMOIZADO
  const spotlightPosition = useMemo(() => {
    if (!currentStep || currentStep.target === 'body') return null;
    
    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) return null;
    
    const rect = targetElement.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const radius = Math.max(rect.width, rect.height) * 0.8;
    
    return {
      left: centerX - radius,
      top: centerY - radius,
      width: radius * 2,
      height: radius * 2
    };
  }, [currentStep]);

  // Calcular posição da seta - MEMOIZADO
  const arrowPosition = useMemo(() => {
    if (!currentStep || currentStep.target === 'body') return null;
    
    const targetElement = document.querySelector(currentStep.target);
    if (!targetElement) return null;
    
    const rect = targetElement.getBoundingClientRect();
    const popupRect = popupRef.current?.getBoundingClientRect();
    
    if (!popupRect) return null;
    
    // Calcular posição absoluta da seta na tela
    const elementCenterX = rect.left + rect.width / 2;
    const elementCenterY = rect.top + rect.height / 2;
    const popupCenterX = popupRect.left + popupRect.width / 2;
    const popupCenterY = popupRect.top + popupRect.height / 2;
    
    let arrowLeft, arrowTop, arrowRotation;
    
    // Determinar posição da seta baseado na posição relativa do popup
    if (Math.abs(popupCenterX - elementCenterX) > Math.abs(popupCenterY - elementCenterY)) {
      // Popup está mais à esquerda ou direita do elemento
      if (popupCenterX < elementCenterX) {
        // Popup à esquerda, seta aponta para direita
        arrowLeft = popupRect.right - 40;
        arrowTop = popupCenterY - 40;
        arrowRotation = 'rotate(0deg)';
      } else {
        // Popup à direita, seta aponta para esquerda
        arrowLeft = popupRect.left - 40;
        arrowTop = popupCenterY - 40;
        arrowRotation = 'rotate(180deg)';
      }
    } else {
      // Popup está mais acima ou abaixo do elemento
      if (popupCenterY < elementCenterY) {
        // Popup acima, seta aponta para baixo
        arrowLeft = popupCenterX - 40;
        arrowTop = popupRect.bottom - 40;
        arrowRotation = 'rotate(90deg)';
      } else {
        // Popup abaixo, seta aponta para cima
        arrowLeft = popupCenterX - 40;
        arrowTop = popupRect.top - 40;
        arrowRotation = 'rotate(-90deg)';
      }
    }
    
    // Garantir que a seta não saia da tela
    arrowLeft = Math.max(10, Math.min(arrowLeft, window.innerWidth - 90));
    arrowTop = Math.max(10, Math.min(arrowTop, window.innerHeight - 90));
    
    return { 
      left: arrowLeft, 
      top: arrowTop, 
      rotation: arrowRotation 
    };
  }, [currentStep, position]);

  if (!tutorialState.isActive || !currentStep) {
    if (IS_DEVELOPMENT) {
      console.log('🎯 Popup não renderizado:', { 
        isActive: tutorialState.isActive, 
        currentStep: currentStep?.id,
        tutorialState: tutorialState,
        showTutorial: tutorialState.isActive,
        currentStepIndex: tutorialState.currentStep
      });
    }
    return null;
  }

  if (IS_DEVELOPMENT) {
    console.log('🎯 Renderizando popup para passo:', currentStep.id);
    console.log('🎯 Popup visível:', isVisible);
    console.log('🎯 Posição do popup:', position);
    console.log('🎯 Estado completo do tutorial:', tutorialState);
    console.log('🎯 Passo atual:', tutorialState.currentStep);
    console.log('🎯 Total de passos:', tutorialState.steps.length);
  }

  return (
    <>
      {/* Overlay Spotlight Premium */}
      {spotlightPosition && (
        <div className="tutorial-overlay">
          <div 
            className="tutorial-spotlight"
            style={{
              left: spotlightPosition.left,
              top: spotlightPosition.top,
              width: spotlightPosition.width,
              height: spotlightPosition.height
            }}
          />
        </div>
      )}

      {/* Popup Premium */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={popupRef}
            className="interactive-tutorial-popup"
            style={{
              position: 'fixed',
              left: position.x,
              top: position.y,
              zIndex: 10000
            }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Sofia Avatar Premium */}
            <div className="popup-sofia-avatar">
              <motion.img
                src="http://45.67.221.8086/Sofia.png"
                alt="Sofia - Conselheira dos Sonhos"
                className="sofia-avatar-image"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/60x60/3b82f6/ffffff?text=S';
                }}
              />
            </div>

            {/* Balão de Conversa Premium */}
            <div className="popup-content">
              <motion.h3
                className="popup-title"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                🌟 {currentStep.title}
              </motion.h3>
              
              <motion.p
                className="popup-description"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {currentStep.description}
              </motion.p>

              {/* Instrução Premium */}
              {currentStep.id === 'video-tutorial' ? (
                <div className="popup-video-container">
                  {/* Header do Vídeo */}
                  <div className="video-header">
                    <svg className="video-header-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <h3 className="video-header-title">
                      Tutorial da Plataforma - {(() => {
                        const width = window.innerWidth;
                        if (width < 768) return 'Mobile';
                        if (width < 1024) return 'Tablet';
                        return 'PC';
                      })()}
                    </h3>
                  </div>
                  
                  {/* Container do Vídeo */}
                  <div className="video-wrapper">
                    <iframe
                      width="100%"
                      height="200"
                      src={(() => {
                        // Detectar dispositivo
                        const width = window.innerWidth;
                        let device: 'mobile' | 'tablet' | 'pc';
                        if (width < 768) device = 'mobile';
                        else if (width < 1024) device = 'tablet';
                        else device = 'pc';
                        
                        // Buscar tutorial específico do dispositivo
                        const savedTutorials = localStorage.getItem('device-tutorials');
                        if (savedTutorials) {
                          const tutorials = JSON.parse(savedTutorials);
                          const deviceTutorial = tutorials.find((t: any) => t.device === device);
                          if (deviceTutorial && deviceTutorial.videoId) {
                            return `https://www.youtube.com/embed/${deviceTutorial.videoId}?rel=0&autoplay=0&modestbranding=1&controls=1&showinfo=0&fs=1&iv_load_policy=3`;
                          }
                        }
                        
                        // Fallback para o vídeo padrão
                        return "https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0&autoplay=0&modestbranding=1&controls=1&showinfo=0&fs=1&iv_load_policy=3";
                      })()}
                      title="Tutorial da Plataforma"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                  
                  {/* Botão Concluir Tutorial */}
                  <div className="video-actions" style={{
                    marginTop: '12px',
                    textAlign: 'center'
                  }}>
                    <button
                      onClick={() => {
                        if (IS_DEVELOPMENT) {
                          console.log('🎯 Tutorial concluído!');
                        }
                        onNext();
                      }}
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        transition: 'all 0.3s ease',
                        width: '100%'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.02)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      ✅ Concluir Tutorial
                    </button>
                  </div>

                </div>
              ) : (
                <div className="popup-instruction">
                  <span className="instruction-text">
                    🎯 <strong>Clique em "Continuar" para prosseguir</strong>
                  </span>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Setas Animadas Premium */}
      {arrowPosition && (
        <div 
          className={`tutorial-arrow ${getArrowDirection(arrowPosition.rotation)}`}
          style={{
            position: 'fixed',
            left: arrowPosition.left,
            top: arrowPosition.top,
            transform: arrowPosition.rotation,
            zIndex: 10001
          }}
        >
          <svg className="arrow-svg" viewBox="0 0 80 80" fill="none">
            <defs>
              <linearGradient id="arrowGradientLeft" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
              <linearGradient id="arrowGradientRight" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              <linearGradient id="arrowGradientUp" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
              <linearGradient id="arrowGradientDown" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            <path
              d="M40 15L65 40L40 65L15 40L40 15Z"
              fill="url(#arrowGradientLeft)"
              stroke="white"
              strokeWidth="3"
            />
            {/* Seta adicional para mais visibilidade */}
            <circle cx="40" cy="40" r="35" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" strokeDasharray="5,5" />
          </svg>
        </div>
      )}
    </>
  );
};
