import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorCount: 0 };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorCount: 0 };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro com mais detalhes
    console.error('ErrorBoundary capturou um erro:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorInfo
    });

    // Callback personalizado se fornecido
    if (this.props.onError) {
      try {
        this.props.onError(error, errorInfo);
      } catch (callbackError) {
        console.error('Erro no callback do ErrorBoundary:', callbackError);
      }
    }

    // Incrementar contador de erros para evitar loops infinitos
    this.setState(prevState => ({
      errorCount: prevState.errorCount + 1
    }));
  }

  // Resetar erro quando as props mudarem
  componentDidUpdate(prevProps: Props) {
    if (prevProps.children !== this.props.children && this.state.hasError) {
      this.setState({ hasError: false, error: undefined });
    }
  }

  // Resetar erro manualmente
  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Se houver muitos erros, mostrar fallback mais simples
      if (this.state.errorCount > 3) {
        return (
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Componente temporariamente indisponível
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200 transition-colors"
              >
                Recarregar página
              </button>
            </div>
          </div>
        );
      }

      // Fallback padrão
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <h3 className="text-sm font-medium text-red-800">
              Algo deu errado
            </h3>
          </div>
          <p className="text-sm text-red-700 mb-3">
            Ocorreu um erro inesperado. Tente recarregar a página.
          </p>
          <div className="flex space-x-2">
            <button
              onClick={this.resetError}
              className="px-3 py-1 text-xs bg-red-100 text-red-700 rounded border border-red-200 hover:bg-red-200 transition-colors"
            >
              Tentar novamente
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200 transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
