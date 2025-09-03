import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { preloadNextRoutes } from '@/config/performance';

interface RouterPerformanceProviderProps {
  children: React.ReactNode;
}

// Provider que usa funcionalidades do router - deve ficar DENTRO do BrowserRouter
export const RouterPerformanceProvider: React.FC<RouterPerformanceProviderProps> = ({ children }) => {
  const location = useLocation();

  // Preload inteligente baseado na rota atual
  useEffect(() => {
    const timer = setTimeout(() => {
      preloadNextRoutes(location.pathname);
    }, 1000); // Aguarda 1 segundo para não impactar a navegação

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return <>{children}</>;
};

export default RouterPerformanceProvider;