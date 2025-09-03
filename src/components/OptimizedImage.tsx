import { useState, useCallback, memo, ImgHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'loading'> {
  src: string;
  alt: string;
  fallback?: string;
  lazy?: boolean;
  quality?: number;
  className?: string;
}

export const OptimizedImage = memo<OptimizedImageProps>(({
  src,
  alt,
  fallback = '/placeholder.svg',
  lazy = true,
  quality = 75,
  className,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(hasError ? fallback : src);

  const handleLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true);
    onLoad?.(e);
  }, [onLoad]);

  const handleError = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallback);
    }
    onError?.(e);
  }, [hasError, fallback, onError]);

  // Otimizar URL da imagem se for de uma CDN
  const optimizedSrc = currentSrc.includes('http') && !hasError 
    ? `${currentSrc}?auto=format&fit=crop&q=${quality}` 
    : currentSrc;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <img
        {...props}
        src={optimizedSrc}
        alt={alt}
        loading={lazy ? "lazy" : "eager"}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        style={{
          ...props.style,
          contentVisibility: lazy ? 'auto' : 'visible'
        }}
      />
      
      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded" />
      )}
    </div>
  );
});

OptimizedImage.displayName = 'OptimizedImage';

export default OptimizedImage;