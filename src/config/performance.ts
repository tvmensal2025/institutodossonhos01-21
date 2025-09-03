// 🚀 Configurações de Performance Otimizadas
import { useCallback, useMemo } from 'react';

// Constantes de ambiente
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_TEST = process.env.NODE_ENV === 'test';

// Configurações de performance otimizadas
export const PERFORMANCE_CONFIG = {
  // Debounce para eventos de resize/scroll (reduzido para melhor responsividade)
  DEBOUNCE_DELAY: 100,
  
  // Throttle para eventos de mouse (otimizado)
  THROTTLE_DELAY: 50,
  
  // Delay para animações (reduzido para UX mais fluída)
  ANIMATION_DELAY: 200,
  
  // Timeout para operações assíncronas (reduzido para melhor performance)
  ASYNC_TIMEOUT: 3000,
  
  // Intervalo para verificações de performance (aumentado para menos overhead)
  PERFORMANCE_CHECK_INTERVAL: 15000,
  
  // Limite de logs por segundo (apenas em desenvolvimento)
  MAX_LOGS_PER_SECOND: IS_DEVELOPMENT ? 30 : 0,
  
  // Cache de elementos DOM (reduzido para economia de memória)
  DOM_CACHE_TTL: 3000,
  
  // Lazy loading de imagens (threshold otimizado)
  LAZY_LOAD_THRESHOLD: 0.15,
  
  // Cache de queries React Query (novo)
  QUERY_CACHE_TIME: 300000, // 5 minutos
  QUERY_STALE_TIME: 60000,  // 1 minuto
  
  // Otimização de re-renderizações (melhorado)
  RENDER_OPTIMIZATION: {
    MEMOIZE_CALLBACKS: true,
    USE_TRANSITION: true,
    BATCH_UPDATES: true,
    DEBOUNCE_STATE_UPDATES: true,
    USE_VIRTUAL_SCROLLING: true, // Para listas grandes
    PRELOAD_COMPONENTS: true // Preload de componentes críticos
  },
  
  // Configurações de bundle splitting (novo)
  BUNDLE_OPTIMIZATION: {
    CHUNK_SIZE_LIMIT: 250000, // 250KB
    PRELOAD_CRITICAL_CHUNKS: true,
    DEFER_NON_CRITICAL: true
  }
};

// React Performance Hooks (NOVO)
export const useOptimizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T => {
  return useCallback(
    debounce(callback, PERFORMANCE_CONFIG.DEBOUNCE_DELAY),
    deps
  ) as T;
};

export const useOptimizedMemo = <T>(
  factory: () => T,
  deps: any[]
): T => {
  return useMemo(factory, deps);
};

// Intersection Observer para lazy loading otimizado
export const createLazyLoadObserver = (threshold = PERFORMANCE_CONFIG.LAZY_LOAD_THRESHOLD) => {
  if (typeof IntersectionObserver === 'undefined') return null;
  
  return new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
        }
      });
    },
    { threshold, rootMargin: '50px' }
  );
};

// Cache otimizado com WeakMap para garbage collection automático
const componentCache = new WeakMap();
export const getCachedComponent = (component: any, key: string) => {
  if (!componentCache.has(component)) {
    componentCache.set(component, new Map());
  }
  return componentCache.get(component).get(key);
};

export const setCachedComponent = (component: any, key: string, value: any) => {
  if (!componentCache.has(component)) {
    componentCache.set(component, new Map());
  }
  componentCache.get(component).set(key, value);
  
  // Auto cleanup após TTL
  setTimeout(() => {
    if (componentCache.has(component)) {
      componentCache.get(component).delete(key);
    }
  }, PERFORMANCE_CONFIG.DOM_CACHE_TTL);
};
export const shouldLog = (category: string): boolean => {
  if (!IS_DEVELOPMENT) return false;
  
  // Implementar rate limiting para logs
  const now = Date.now();
  const key = `log_${category}`;
  const lastLog = parseInt(localStorage.getItem(key) || '0');
  
  if (now - lastLog < 1000) return false; // Máximo 1 log por segundo por categoria
  
  localStorage.setItem(key, now.toString());
  return true;
};

// Função para debounce
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Função para throttle
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};

// Função para memoização simples
export const memoize = <T extends (...args: any[]) => any>(
  func: T,
  getKey?: (...args: Parameters<T>) => string
): T => {
  const cache = new Map<string, ReturnType<T>>();
  
  return ((...args: Parameters<T>) => {
    const key = getKey ? getKey(...args) : JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = func(...args);
    cache.set(key, result);
    
    // Limpar cache após TTL
    setTimeout(() => cache.delete(key), PERFORMANCE_CONFIG.DOM_CACHE_TTL);
    
    return result;
  }) as T;
};

// Função para verificar performance
export const checkPerformance = (): void => {
  if (!IS_DEVELOPMENT) return;
  
  const start = performance.now();
  
  // Verificar métricas de performance
  if ('performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paint = performance.getEntriesByType('paint');
    
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
      const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;
      
      if (loadTime > 3000) {
        console.warn('⚠️ Tempo de carregamento alto:', loadTime, 'ms');
      }
      
      if (domContentLoaded > 1000) {
        console.warn('⚠️ DOM Content Loaded lento:', domContentLoaded, 'ms');
      }
    }
    
    if (paint.length > 0) {
      const firstPaint = paint.find(p => p.name === 'first-paint');
      const firstContentfulPaint = paint.find(p => p.name === 'first-contentful-paint');
      
      if (firstPaint && firstPaint.startTime > 1000) {
        console.warn('⚠️ First Paint lento:', firstPaint.startTime, 'ms');
      }
      
      if (firstContentfulPaint && firstContentfulPaint.startTime > 1500) {
        console.warn('⚠️ First Contentful Paint lento:', firstContentfulPaint.startTime, 'ms');
      }
    }
  }
  
  const end = performance.now();
  if (end - start > 100) {
    console.warn('⚠️ Verificação de performance lenta:', end - start, 'ms');
  }
};

// Função para otimizar imagens
export const optimizeImage = (src: string, width: number, height: number): string => {
  if (IS_PRODUCTION && src.includes('http')) {
    // Em produção, otimizar URLs de imagens externas
    return `${src}?w=${width}&h=${height}&fit=crop&auto=format`;
  }
  return src;
};

// Preload crítico de recursos (NOVO)
export const preloadCriticalResources = (): void => {
  if (!IS_PRODUCTION) return;
  
  // Preload fontes críticas
  const fontLinks = [
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
  ];
  
  fontLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'style';
    link.href = href;
    document.head.appendChild(link);
  });
  
  // Preload componentes críticos via modulepreload
  const criticalModules = [
    '/src/pages/CompleteDashboardPage.tsx',
    '/src/components/dashboard/DashboardOverview.tsx',
    '/src/components/ui/card.tsx'
  ];
  
  criticalModules.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = href;
    document.head.appendChild(link);
  });
};

// Memory cleanup otimizado (NOVO)
export const optimizedCleanup = (): void => {
  // Limpar caches antigos
  if ('caches' in window) {
    caches.keys().then(names => {
      names.forEach(name => {
        if (name.includes('old-') || name.includes('v1-')) {
          caches.delete(name);
        }
      });
    });
  }
  
  // Limpar localStorage antigo
  const oldKeys = Object.keys(localStorage).filter(key => 
    key.includes('log_') && 
    Date.now() - parseInt(localStorage.getItem(key) || '0') > 86400000 // 24h
  );
  
  oldKeys.forEach(key => localStorage.removeItem(key));
  
  // Forçar garbage collection se disponível
  if ('gc' in window && IS_DEVELOPMENT) {
    (window as any).gc();
  }
};

// Bundle preloading inteligente (NOVO)
export const preloadNextRoutes = (currentRoute: string): void => {
  const routePreloadMap: Record<string, string[]> = {
    '/auth': ['/dashboard'],
    '/dashboard': ['/app/goals', '/app/progress', '/sofia'],
    '/': ['/auth', '/dashboard']
  };
  
  const routesToPreload = routePreloadMap[currentRoute] || [];
  
  routesToPreload.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
};

// Performance monitoring otimizado
export const monitorCoreWebVitals = (): void => {
  if (!IS_PRODUCTION) return;
  
  // First Input Delay
  new PerformanceObserver((list) => {
    list.getEntries().forEach((entry: any) => {
      if (entry.processingStart && entry.processingStart > entry.startTime) {
        const fid = entry.processingStart - entry.startTime;
        if (fid > 100) {
          console.warn('🐌 First Input Delay alto:', fid, 'ms');
        }
      }
    });
  }).observe({ type: 'first-input', buffered: true });
  
  // Cumulative Layout Shift
  new PerformanceObserver((list) => {
    let cls = 0;
    list.getEntries().forEach((entry: any) => {
      if (!entry.hadRecentInput) {
        cls += entry.value;
      }
    });
    if (cls > 0.1) {
      console.warn('📏 Cumulative Layout Shift alto:', cls);
    }
  }).observe({ type: 'layout-shift', buffered: true });
};
export const cleanupUnusedResources = (): void => {
  if (!IS_DEVELOPMENT) return;
  
  // Limpar event listeners órfãos
  const elements = document.querySelectorAll('[data-tutorial-indicator]');
  elements.forEach(el => {
    if (!el.classList.contains('tutorial-highlight')) {
      el.removeAttribute('data-tutorial-indicator');
    }
  });
  
  // Limpar classes CSS não utilizadas
  const highlightedElements = document.querySelectorAll('.tutorial-highlight');
  highlightedElements.forEach(el => {
    if (!el.hasAttribute('data-tutorial-indicator')) {
      el.classList.remove('tutorial-highlight');
    }
  });
  
  // Forçar garbage collection se disponível
  if ('gc' in window) {
    (window as any).gc();
  }
};

// Exportar configurações padrão
export default PERFORMANCE_CONFIG;
