import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface SofiaTutorialDemoProps {
  isOpen: boolean;
  onStart: () => void;
  onSkip: () => void;
}

export const SofiaTutorialDemo: React.FC<SofiaTutorialDemoProps> = ({
  isOpen,
  onStart,
  onSkip
}) => {
  if (!isOpen) return null;

  return (
    <motion.div
      className="tutorial-welcome-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="tutorial-welcome-modal"
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        transition={{ 
          duration: 0.6, 
          ease: [0.16, 1, 0.3, 1],
          delay: 0.1
        }}
        style={{
          padding: '1.5rem', // REDUZIDO de 2rem para 1.5rem
          maxWidth: '420px', // REDUZIDO de ~480px para 420px
          minHeight: 'auto' // Removido altura mínima fixa
        }}
      >
        {/* Sofia Avatar Premium - REDUZIDO */}
        <motion.div
          className="sofia-welcome-avatar"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 0.8, 
            type: "spring", 
            stiffness: 200,
            delay: 0.3
          }}
          style={{
            width: '70px', // REDUZIDO de 80px para 70px
            height: '70px', // REDUZIDO de 80px para 70px
            marginBottom: '0.75rem' // REDUZIDO de 1rem para 0.75rem
          }}
        >
          <img
            src="http://45.67.221.216:8086/Sofia.png"
            alt="Sofia - Conselheira dos Sonhos"
            className="sofia-avatar-image"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.currentTarget.src = 'https://via.placeholder.com/70x70/3b82f6/ffffff?text=S';
            }}
          />
          <div className="sofia-avatar-glow" />
        </motion.div>

                            {/* Título Compacto - REDUZIDO */}
                    <motion.h1
                      className="welcome-title"
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      style={{
                        fontSize: '1.5rem', // REDUZIDO de ~2rem para 1.5rem
                        fontWeight: '600', // REDUZIDO de bold para 600
                        marginBottom: '0.75rem' // REDUZIDO de 1rem para 0.75rem
                      }}
                    >
                      Olá! Sou a Sofia ✨
                    </motion.h1>

                    {/* Mensagem Compacta */}
                    <motion.div
                      className="sofia-introduction"
                      initial={{ y: 15, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.3 }}
                    >
                      <p className="message-text">
                        Seja bem-vindo(a) à <strong className="sofia-name">Plataforma dos Sonhos</strong>! 
                      </p>
                      
                      <p className="message-text">
                        Preparei um tutorial rápido para você conhecer suas funcionalidades.
                      </p>

                      <p className="message-text sofia-support">
                        <strong>Vamos começar sua jornada?</strong> 🎯
                      </p>
                    </motion.div>

                            {/* Botões Simples - REDUZIDOS */}
                    <motion.div
                      className="welcome-buttons"
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ duration: 0.4, delay: 0.5 }}
                    >
                      <button
                        onClick={onStart}
                        className="welcome-button primary"
                        style={{
                          padding: '0.75rem 1.5rem', // REDUZIDO de 1rem 2rem para 0.75rem 1.5rem
                          fontSize: '0.95rem', // REDUZIDO de ~1.1rem para 0.95rem
                          borderRadius: '12px', // REDUZIDO de ~16px para 12px
                          minHeight: '44px' // REDUZIDO de ~48px para 44px
                        }}
                      >
                        Próximo Passo
                      </button>

                      <button
                        onClick={onSkip}
                        className="welcome-button secondary"
                        style={{
                          padding: '0.6rem 1.2rem', // REDUZIDO de 0.8rem 1.5rem para 0.6rem 1.2rem
                          fontSize: '0.85rem', // REDUZIDO de ~1rem para 0.85rem
                          borderRadius: '10px', // REDUZIDO de ~14px para 10px
                          minHeight: '38px' // REDUZIDO de ~42px para 38px
                        }}
                      >
                        ✖️ Pular Tutorial
                      </button>
                    </motion.div>
      </motion.div>
    </motion.div>
  );
};
