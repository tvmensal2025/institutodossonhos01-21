import React, { useState } from 'react';
import { SimpleCharacter3D } from './simple-character-3d';

interface SimpleCharacterSelectorProps {
  width?: number;
  height?: number;
  defaultGender?: 'male' | 'female';
  showGenderSelector?: boolean;
  onGenderChange?: (gender: 'male' | 'female') => void;
  className?: string;
  style?: React.CSSProperties;
}

export const SimpleCharacterSelector: React.FC<SimpleCharacterSelectorProps> = ({
  width = 350,
  height = 450,
  defaultGender = 'male',
  showGenderSelector = true,
  onGenderChange,
  className = '',
  style = {}
}) => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(defaultGender);

  const handleGenderChange = (gender: 'male' | 'female') => {
    setSelectedGender(gender);
    onGenderChange?.(gender);
  };

  return (
    <div
      className={`relative ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style
      }}
    >
      {/* Personagem 3D */}
      <div className="h-full">
        <SimpleCharacter3D
          width={width}
          height={height}
          gender={selectedGender}
          autoRotate={true}
          onLoad={() => console.log('Personagem carregado!')}
        />
      </div>

      {/* Seletor de gênero */}
      {showGenderSelector && (
        <div className="absolute top-4 left-4 right-4">
          <div className="flex justify-center space-x-2">
            <button
              onClick={() => handleGenderChange('male')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedGender === 'male'
                  ? 'bg-blue-500 text-white shadow-lg scale-105'
                  : 'bg-white/80 text-blue-600 hover:bg-white hover:scale-105'
              }`}
            >
              👨 Masculino
            </button>
            <button
              onClick={() => handleGenderChange('female')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                selectedGender === 'female'
                  ? 'bg-pink-500 text-white shadow-lg scale-105'
                  : 'bg-white/80 text-pink-600 hover:bg-white hover:scale-105'
              }`}
            >
              👩 Feminino
            </button>
          </div>
        </div>
      )}

      {/* Informações do componente */}
      <div className="absolute bottom-4 left-4 right-4 text-center">
        <div className="bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2">
          <p className="text-white text-sm font-medium">
            {selectedGender === 'male' ? 'Personagem Masculino' : 'Personagem Feminino'}
          </p>
          <p className="text-white/70 text-xs">
            Clique nos botões para alternar
          </p>
        </div>
      </div>
    </div>
  );
};
