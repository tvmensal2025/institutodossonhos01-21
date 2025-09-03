import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  preloadCriticalResources, 
  optimizedCleanup, 
  monitorCoreWebVitals, 
  preloadNextRoutes,
  PERFORMANCE_CONFIG 
} from '@/config/performance';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    // Inicialização única das otimizações
    const initializePerformance = () => {
      // Preload de recursos críticos
      preloadCriticalResources();
      
      // Monitoramento de Core Web Vitals
      monitorCoreWebVitals();
      
      // Cleanup inicial
      optimizedCleanup();
      
      // Setup de intervalos de limpeza
      const cleanupInterval = setInterval(optimizedCleanup, 5 * 60 * 1000); // 5 minutos
      
      return () => {
        clearInterval(cleanupInterval);
      };
    };

    const cleanup = initializePerformance();
    
    return cleanup;
  }, []);

  // Preload inteligente baseado na rota atual
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadNextRoutes(location.pathname);
    }, 1000); // Aguarda 1 segundo para não impactar a navegação

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Otimizações específicas para desenvolvimento
  useEffect(() => {
    if (PERFORMANCE_CONFIG.RENDER_OPTIMIZATION.USE_TRANSITION && window.requestIdleCallback) {
      // Usar idle time para operações não-críticas
      window.requestIdleCallback(() => {
        // Operações de background aqui
        console.log('🚀 Performance optimizations initialized');
      });
    }
  }, []);

  return <>{children}</>;
};

export default PerformanceProvider;