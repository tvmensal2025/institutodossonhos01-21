// 🚀 Configurações de Performance para o Sistema de Tutorial

// Constantes de ambiente
export const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
export const IS_PRODUCTION = process.env.NODE_ENV === 'production';
export const IS_TEST = process.env.NODE_ENV === 'test';

// Configurações de performance
export const PERFORMANCE_CONFIG = {
  // Debounce para eventos de resize/scroll
  DEBOUNCE_DELAY: 150,
  
  // Throttle para eventos de mouse
  THROTTLE_DELAY: 100,
  
  // Delay para animações
  ANIMATION_DELAY: 300,
  
  // Timeout para operações assíncronas
  ASYNC_TIMEOUT: 5000,
  
  // Intervalo para verificações de performance
  PERFORMANCE_CHECK_INTERVAL: 10000,
  
  // Limite de logs por segundo (apenas em desenvolvimento)
  MAX_LOGS_PER_SECOND: IS_DEVELOPMENT ? 50 : 0,
  
  // Cache de elementos DOM
  DOM_CACHE_TTL: 5000,
  
  // Lazy loading de imagens
  LAZY_LOAD_THRESHOLD: 0.1,
  
  // Otimização de re-renderizações
  RENDER_OPTIMIZATION: {
    MEMOIZE_CALLBACKS: true,
    USE_TRANSITION: true,
    BATCH_UPDATES: true,
    DEBOUNCE_STATE_UPDATES: true
  }
};

// Função para verificar se deve mostrar logs
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

// Função para limpar recursos não utilizados
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
