import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Alert, AlertDescription } from './alert';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  title?: string;
  showDetails?: boolean;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetError, 
  title = "Ops! Algo deu errado",
  showDetails = false
}) => {
  const handleReload = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Bug className="h-4 w-4" />
            <AlertDescription>
              Encontramos um problema técnico. Nossa equipe foi notificada automaticamente.
            </AlertDescription>
          </Alert>
          
          {showDetails && (
            <details className="text-sm">
              <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                {error.message}
              </pre>
            </details>
          )}
          
          <div className="flex flex-col gap-2">
            <Button onClick={resetError} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button variant="outline" onClick={handleReload} className="w-full">
              Recarregar Página
            </Button>
            <Button variant="ghost" onClick={handleGoHome} className="w-full">
              <Home className="h-4 w-4 mr-2" />
              Ir para Início
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-center">
            Se o problema persistir, entre em contato conosco em{' '}
            <a href="mailto:suporte@institutodossonhos.com.br" className="text-primary hover:underline">
              suporte@institutodossonhos.com.br
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ComponentType<ErrorFallbackProps> },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ComponentType<ErrorFallbackProps> }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Em produção, enviar erro para serviço de monitoramento
    if (import.meta.env.PROD) {
      // Exemplo: Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={() => this.setState({ hasError: false, error: null })}
        />
      );
    }

    return this.props.children;
  }
}

// Hook para tratamento de erros em componentes funcionais
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const handleError = React.useCallback((error: Error | string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    setError(errorObj);
    console.error('Error handled:', errorObj);
  }, []);

  return { error, resetError, handleError };
};

// Componente para exibir erros de API/fetch
export const ApiError: React.FC<{ 
  error: string | Error; 
  onRetry?: () => void;
  className?: string;
}> = ({ error, onRetry, className }) => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <Alert className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>{errorMessage}</span>
        {onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry}>
            <RefreshCw className="h-3 w-3 mr-1" />
            Tentar Novamente
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
};