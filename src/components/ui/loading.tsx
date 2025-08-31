import React from 'react';
import { Loader2, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'dots' | 'heart';
  text?: string;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  variant = 'spinner', 
  text,
  className 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  const renderSpinner = () => (
    <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
  );

  const renderPulse = () => (
    <div className={cn('bg-primary rounded-full animate-pulse', sizeClasses[size])} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'bg-primary rounded-full animate-bounce',
            size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'
          )}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const renderHeart = () => (
    <Heart className={cn('animate-pulse text-primary fill-current', sizeClasses[size])} />
  );

  const renderContent = () => {
    switch (variant) {
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      case 'heart':
        return renderHeart();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      {renderContent()}
      {text && (
        <p className={cn(
          'text-muted-foreground mt-2',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'
        )}>
          {text}
        </p>
      )}
    </div>
  );
};

export const LoadingPage: React.FC<{ text?: string }> = ({ text = "Carregando..." }) => (
  <div className="flex items-center justify-center min-h-screen">
    <Loading size="lg" variant="heart" text={text} />
  </div>
);

export const LoadingCard: React.FC<{ text?: string; className?: string }> = ({ 
  text = "Carregando...", 
  className 
}) => (
  <div className={cn("flex items-center justify-center p-8", className)}>
    <Loading size="md" variant="spinner" text={text} />
  </div>
);

export const LoadingButton: React.FC<{ text?: string }> = ({ text = "Carregando..." }) => (
  <div className="flex items-center gap-2">
    <Loading size="sm" variant="spinner" />
    <span>{text}</span>
  </div>
);