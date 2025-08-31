import React from 'react';

interface PersonIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  variant?: 'outline' | 'filled' | 'gradient';
  gender?: 'male' | 'female' | 'neutral';
}

export const PersonIcon: React.FC<PersonIconProps> = ({
  className = '',
  size = 'md',
  color = 'currentColor',
  variant = 'outline',
  gender = 'neutral'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const genderColors = {
    male: '#3B82F6', // Azul
    female: '#EC4899', // Rosa
    neutral: '#6B7280' // Cinza
  };

  const iconColor = color === 'currentColor' ? genderColors[gender] : color;

  const renderIcon = () => {
    switch (variant) {
      case 'filled':
        return (
          <svg
            viewBox="0 0 24 24"
            fill={iconColor}
            className={`${sizeClasses[size]} ${className}`}
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        );
      
      case 'gradient':
        return (
          <svg
            viewBox="0 0 24 24"
            className={`${sizeClasses[size]} ${className}`}
          >
            <defs>
              <linearGradient id="personGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={iconColor} stopOpacity="0.8" />
                <stop offset="100%" stopColor={iconColor} stopOpacity="0.4" />
              </linearGradient>
            </defs>
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              fill="url(#personGradient)"
            />
          </svg>
        );
      
      default: // outline
        return (
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke={iconColor}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`${sizeClasses[size]} ${className}`}
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        );
    }
  };

  return renderIcon();
};

// Componente específico para gráficos de composição corporal
export const BodyCompositionIcon: React.FC<{
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  type: 'fat' | 'muscle' | 'water' | 'bone';
}> = ({ className = '', size = 'md', type }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const typeColors = {
    fat: '#F59E0B', // Amarelo/Laranja
    muscle: '#10B981', // Verde
    water: '#3B82F6', // Azul
    bone: '#8B5CF6' // Roxo
  };

  const typeLabels = {
    fat: 'Gordura',
    muscle: 'Músculo',
    water: 'Água',
    bone: 'Osso'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={typeColors[type]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${sizeClasses[size]}`}
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      <span className="text-sm font-medium" style={{ color: typeColors[type] }}>
        {typeLabels[type]}
      </span>
    </div>
  );
};

// Componente para indicadores de saúde
export const HealthIndicatorIcon: React.FC<{
  className?: string;
  status: 'excellent' | 'good' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}> = ({ className = '', status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const statusColors = {
    excellent: '#10B981', // Verde
    good: '#3B82F6', // Azul
    warning: '#F59E0B', // Amarelo
    danger: '#EF4444' // Vermelho
  };

  const statusLabels = {
    excellent: 'Excelente',
    good: 'Bom',
    warning: 'Atenção',
    danger: 'Crítico'
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke={statusColors[status]}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`${sizeClasses[size]}`}
      >
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
      <span className="text-sm font-medium" style={{ color: statusColors[status] }}>
        {statusLabels[status]}
      </span>
    </div>
  );
};

export default PersonIcon; 