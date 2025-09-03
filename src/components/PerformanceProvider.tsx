import { useEffect } from 'react';
import { 
  preloadCriticalResources, 
  optimizedCleanup, 
  monitorCoreWebVitals, 
  PERFORMANCE_CONFIG 
} from '@/config/performance';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

// Provider principal sem dependências do router
export const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {

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

  return <>{children}</>;
};

// Provider específico para funcionalidades que dependem do router
export const RouterPerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  // Este código será movido para dentro do BrowserRouter

  return <>{children}</>;
};