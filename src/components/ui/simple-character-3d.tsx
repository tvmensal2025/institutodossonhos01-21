import React, { useState, useEffect } from 'react';

interface SimpleCharacter3DProps {
  width?: number;
  height?: number;
  gender: 'male' | 'female';
  autoRotate?: boolean;
  backgroundColor?: string;
  onLoad?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SimpleCharacter3D: React.FC<SimpleCharacter3DProps> = ({
  width = 300,
  height = 400,
  gender,
  autoRotate = true,
  backgroundColor = '#f8fafc',
  onLoad,
  className = '',
  style = {}
}) => {
  const [rotation, setRotation] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  // Rotação automática
  useEffect(() => {
    if (!autoRotate) return;

    const interval = setInterval(() => {
      setRotation(prev => (prev + 2) % 360);
    }, 50);

    return () => clearInterval(interval);
  }, [autoRotate]);

  // Simular carregamento
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      onLoad?.();
    }, 500);

    return () => clearTimeout(timer);
  }, [onLoad]);

  // Configurações baseadas no gênero
  const config = {
    male: {
      emoji: '👨',
      color: '#3b82f6',
      bgColor: '#dbeafe',
      borderColor: '#1d4ed8'
    },
    female: {
      emoji: '👩',
      color: '#ec4899',
      bgColor: '#fce7f3',
      borderColor: '#be185d'
    }
  };

  const currentConfig = config[gender];

  return (
    <div
      className={`relative overflow-hidden rounded-xl ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        backgroundColor: backgroundColor || currentConfig.bgColor,
        ...style
      }}
    >
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current" style={{ color: currentConfig.color }}></div>
        </div>
      )}

      {/* Personagem 3D */}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div
          className="relative"
          style={{
            transform: `rotateY(${rotation}deg)`,
            transition: autoRotate ? 'none' : 'transform 0.3s ease'
          }}
        >
          {/* Emoji 3D */}
          <div
            className="text-8xl sm:text-9xl lg:text-[10rem] xl:text-[12rem]"
            style={{
              textShadow: `
                0 0 20px ${currentConfig.color}40,
                0 0 40px ${currentConfig.color}20,
                0 0 60px ${currentConfig.color}10
              `,
              filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))'
            }}
          >
            {currentConfig.emoji}
          </div>

          {/* Efeito de brilho */}
          <div
            className="absolute inset-0 rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${currentConfig.color}40, transparent 70%)`,
              filter: 'blur(20px)'
            }}
          />
        </div>
      </div>

      {/* Informações do personagem */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div
          className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: currentConfig.color }}
        >
          {gender === 'male' ? 'Masculino' : 'Feminino'}
        </div>
      </div>

      {/* Indicador de rotação */}
      {autoRotate && (
        <div className="absolute top-4 right-4">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
        </div>
      )}
    </div>
  );
};
