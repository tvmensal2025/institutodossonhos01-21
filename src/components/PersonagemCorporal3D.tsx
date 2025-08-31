import React, { useState, useEffect, useRef, useMemo } from 'react';

interface Personagem3DProps {
  genero: 'masculino' | 'feminino';
  altura?: number;
  peso?: number;
  className?: string;
  style?: React.CSSProperties;
}

const PersonagemCorporal3D: React.FC<Personagem3DProps> = ({ 
  genero, 
  altura, 
  peso, 
  className = "",
  style = {}
}) => {
  const [isInteracting, setIsInteracting] = useState(false);
  const [touchCount, setTouchCount] = useState(0);
  const [lastTouchTime, setLastTouchTime] = useState(0);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Limpeza segura do iframe - CORRIGIDO para evitar erro de removeChild
  useEffect(() => {
    return () => {
      // Limpeza mais segura sem tentar remover o DOM
      if (iframeRef.current) {
        try {
          // Apenas limpar o src de forma segura
          iframeRef.current.src = 'about:blank';
        } catch (error) {
          // Ignorar erros de limpeza
          console.log('Limpeza do iframe concluída');
        }
      }
    };
  }, []);

  // Resetar estados quando o gênero mudar
  useEffect(() => {
    setIframeLoaded(false);
    setIframeError(false);
    setRetryCount(0);
  }, [genero]);

  // Função para detectar gestos de toque
  const handleTouchStart = (e: React.TouchEvent) => {
    const touches = e.touches.length;
    setTouchCount(touches);
    setLastTouchTime(Date.now());

    if (touches === 1) {
      // 1 dedo = scroll da página (desabilitar interação 3D)
      setIsInteracting(false);
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'none';
        iframeRef.current.style.touchAction = 'none';
      }
    } else if (touches === 2) {
      // 2 dedos = interação com 3D (habilitar interação)
      setIsInteracting(true);
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'auto';
        iframeRef.current.style.touchAction = 'manipulation';
      }
      // Prevenir scroll da página durante interação 3D
      e.preventDefault();
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touches = e.changedTouches.length;
    const remainingTouches = e.touches.length;
    
    setTouchCount(remainingTouches);
    
    if (remainingTouches === 0) {
      // Sem toques = voltar ao estado normal
      setIsInteracting(false);
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'none';
        iframeRef.current.style.touchAction = 'none';
      }
    } else if (remainingTouches === 1) {
      // Voltou para 1 dedo = desabilitar interação 3D
      setIsInteracting(false);
      if (iframeRef.current) {
        iframeRef.current.style.pointerEvents = 'none';
        iframeRef.current.style.touchAction = 'none';
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchCount === 2) {
      // 2 dedos = interação 3D (prevenir scroll da página)
      e.preventDefault();
    }
  };

  // Verificações de segurança
  if (!genero) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-xl ${className}`} style={style}>
        <p className="text-gray-500">Gênero não especificado</p>
      </div>
    );
  }

  // URLs dos modelos 3D do Sketchfab
  const embedUrl = useMemo(() => {
    if (genero === 'masculino') {
      return 'https://sketchfab.com/models/ebae6cc235c144cea4d46b3105f868a6/embed?autostart=1&autoplay=1';
    } else {
      return 'https://sketchfab.com/models/fe2c95ec93714e729becd46b2c37d3bb/embed?autostart=1&autoplay=1';
    }
  }, [genero]);

  // Função para tentar novamente
  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setIframeError(false);
      setIframeLoaded(false);
    } else {
      // Após 3 tentativas, mostrar fallback permanente
      setIframeError(true);
    }
  };

  // Se muitas tentativas falharam, mostrar fallback
  if (retryCount >= 3 && iframeError) {
    return (
      <div className={`relative ${className}`} style={style}>
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl">
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">👤</span>
            </div>
            <p className="text-white font-medium mb-2">Personagem 3D Indisponível</p>
            <button 
              onClick={() => {
                setRetryCount(0);
                setIframeError(false);
                setIframeLoaded(false);
              }}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200 transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`relative ${className}`} 
      style={{
        ...style,
        height: '700px',
        width: '100%',
        overflow: 'visible',
        borderRadius: '12px',
        paddingTop: '20px', // Espaço para a porcentagem de altura
        paddingBottom: '20px' // Espaço para a porcentagem de peso
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {/* Container principal do personagem 3D - OTIMIZADO para responsividade */}
      <div 
        ref={containerRef}
        className={`relative w-full h-full min-h-[400px] xs:min-h-[450px] sm:min-h-[500px] md:min-h-[550px] lg:min-h-[600px] xl:min-h-[650px] 2xl:min-h-[700px] bg-black rounded-xl overflow-hidden`}
        style={{
          isolation: 'isolate', // Criar novo contexto de empilhamento
          touchAction: isInteracting ? 'manipulation' : 'pan-y', // Permitir apenas scroll vertical
          overscrollBehavior: isInteracting ? 'none' : 'contain', // Prevenir overscroll
          paddingTop: '10px', // Espaço adicional para não cortar o topo
          paddingBottom: '10px' // Espaço adicional para não cortar a base
        }}
      >
        {/* Wrapper para prevenir interferência com scroll */}
        <div 
          className={`w-full h-full modelo-3d-wrapper modelo-3d-container ${isInteracting ? 'interacting' : ''}`}
          style={{
            position: 'relative',
            isolation: 'isolate', // Criar novo contexto de empilhamento
            touchAction: isInteracting ? 'manipulation' : 'pan-y', // Permitir apenas scroll vertical
            overscrollBehavior: isInteracting ? 'none' : 'contain', // Prevenir overscroll
            paddingTop: '10px', // Espaço adicional para não cortar o topo
            paddingBottom: '10px' // Espaço adicional para não cortar a base
          }}
        >
          {/* Medidas corporais */}
          {altura && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-white px-2 py-1 rounded-md border border-white/20 z-10 shadow-lg">
              {altura} cm
            </div>
          )}
          
          {peso && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-sm font-semibold text-white px-2 py-1 rounded-md border border-white/20 z-10 shadow-lg">
              {peso.toFixed(1)} kg
            </div>
          )}

          {/* iframe do modelo 3D - OTIMIZADO para carregamento rápido e INTERAÇÃO INTELIGENTE */}
          {!iframeError ? (
            <iframe
              ref={iframeRef}
              key={`${embedUrl}-${retryCount}`} // Key única para cada tentativa
              title={genero === 'masculino' ? 'Personagem Masculino 3D' : 'Personagem Feminino 3D'}
              src={embedUrl}
              frameBorder="0"
              allowFullScreen={false} // Desabilitar fullscreen para evitar travamentos
              allow="autoplay; fullscreen; xr-spatial-tracking" // Permissões necessárias para Sketchfab
              className="w-full h-full rounded-xl"
              style={{ 
                height: '700px',
                background: 'transparent',
                opacity: iframeLoaded ? 1 : 0.3,
                transition: 'opacity 0.2s ease',
                filter: iframeLoaded ? 'none' : 'blur(1px)',
                pointerEvents: 'none', // Inicialmente desabilitado
                userSelect: 'none', // Prevenir seleção de texto
                WebkitUserSelect: 'none', // Safari
                MozUserSelect: 'none', // Firefox
                msUserSelect: 'none', // IE/Edge
                position: 'relative',
                zIndex: 100, // Z-index alto para ficar sempre por cima
                border: 'none' // Remover bordas para segurança
              }}
              onLoad={() => {
                setIframeLoaded(true);
                console.log(`✅ Modelo 3D ${genero} carregado com sucesso (tentativa ${retryCount + 1})`);
              }}
              onError={() => {
                setIframeError(true);
                console.error(`❌ Erro ao carregar modelo 3D ${genero} (tentativa ${retryCount + 1})`);
              }}
              loading="eager"
              scrolling="no" // Desabilitar scroll interno
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals" // Permissões necessárias para Sketchfab
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-100 rounded-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <p className="text-gray-500 mb-2">Erro ao carregar modelo 3D</p>
                <p className="text-gray-400 text-sm mb-3">Tentativa {retryCount + 1} de 3</p>
                <button 
                  onClick={handleRetry}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded border border-blue-200 hover:bg-blue-200 transition-colors"
                >
                  Tentar novamente
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading indicator - MAIS RÁPIDO E VISÍVEL */}
        {!iframeLoaded && !iframeError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-white font-medium">Carregando modelo 3D...</p>
              {retryCount > 0 && (
                <p className="text-blue-200 text-xs mt-2">Tentativa {retryCount + 1}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonagemCorporal3D;