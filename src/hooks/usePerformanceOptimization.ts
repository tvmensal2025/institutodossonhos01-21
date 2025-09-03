import { useEffect, useCallback, useMemo } from 'react';
import { PERFORMANCE_CONFIG, preloadCriticalResources, optimizedCleanup, monitorCoreWebVitals } from '@/config/performance';

// Hook para otimizações automáticas de performance
export const usePerformanceOptimization = () => {
  // Inicializar otimizações na montagem
  useEffect(() => {
    // Preload de recursos críticos
    preloadCriticalResources();
    
    // Monitoring de Core Web Vitals
    monitorCoreWebVitals();
    
    // Cleanup inicial
    optimizedCleanup();
    
    // Cleanup periódico
    const cleanupInterval = setInterval(optimizedCleanup, 5 * 60 * 1000); // 5 minutos
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, []);
  
  // Otimizar callbacks com debounce automático
  const optimizeCallback = useCallback(<T extends (...args: any[]) => any>(
    callback: T,
    delay: number = PERFORMANCE_CONFIG.DEBOUNCE_DELAY
  ) => {
    let timeoutId: NodeJS.Timeout;
    
    return ((...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    }) as T;
  }, []);
  
  // Memoização inteligente com cache automático
  const smartMemo = useCallback(<T>(
    factory: () => T,
    deps: any[],
    cacheKey?: string
  ) => {
    return useMemo(() => {
      const result = factory();
      
      // Cache adicional se necessário
      if (cacheKey && typeof result === 'object') {
        sessionStorage.setItem(cacheKey, JSON.stringify(result));
      }
      
      return result;
    }, deps);
  }, []);
  
  // Lazy loading de imagens
  const setupLazyLoading = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target as HTMLImageElement;
            const src = img.dataset.src;
            
            if (src) {
              img.src = src;
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      },
      {
        threshold: PERFORMANCE_CONFIG.LAZY_LOAD_THRESHOLD,
        rootMargin: '50px'
      }
    );
    
    const images = containerRef.current.querySelectorAll('img[data-src]');
    images.forEach((img) => observer.observe(img));
    
    return () => observer.disconnect();
  }, []);
  
  return {
    optimizeCallback,
    smartMemo,
    setupLazyLoading
  };
};

// Hook para monitoramento de performance de componente
export const useComponentPerformance = (componentName: string) => {
  const renderStart = performance.now();
  
  useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;
    
    // Log apenas se o render for lento
    if (renderTime > 16.67) { // >60fps
      console.warn(`🐌 ${componentName} render lento:`, renderTime.toFixed(2), 'ms');
    }
  });
  
  // Marcar início de operações custosas
  const markStart = useCallback((operationName: string) => {
    performance.mark(`${componentName}-${operationName}-start`);
  }, [componentName]);
  
  // Marcar fim e medir
  const markEnd = useCallback((operationName: string) => {
    performance.mark(`${componentName}-${operationName}-end`);
    performance.measure(
      `${componentName}-${operationName}`,
      `${componentName}-${operationName}-start`,
      `${componentName}-${operationName}-end`
    );
  }, [componentName]);
  
  return { markStart, markEnd };
};