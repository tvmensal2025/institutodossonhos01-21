import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share, X, Smartphone, Chrome } from 'lucide-react';

export const InstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState<'ios' | 'android' | null>(null);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /ipad|iphone|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isInStandaloneMode && (isIOS || isAndroid)) {
      setPlatform(isIOS ? 'ios' : 'android');
      
      // Show prompt after a delay
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || !platform) {
    return null;
  }

  const getPlatformContent = () => {
    if (platform === 'ios') {
      return {
        title: 'Adicionar à Tela Inicial',
        description: 'Para instalar este app no seu iPhone: toque em',
        icon: <Share className="w-3 h-3" />,
        instruction: 'e depois "Adicionar à Tela de Início".',
        iconComponent: <Smartphone className="w-5 h-5 text-blue-600" />,
        cardClass: "shadow-lg border-blue-200 bg-blue-50",
        iconBgClass: "w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center",
        titleClass: "font-semibold text-sm mb-1 text-blue-900",
        descriptionClass: "text-xs text-blue-700 mb-3",
        buttonClass: "text-xs h-8 bg-blue-600 hover:bg-blue-700",
        ghostButtonClass: "text-xs h-8 text-blue-600 hover:bg-blue-100",
        closeButtonClass: "p-1 h-auto w-auto flex-shrink-0 text-blue-600 hover:bg-blue-100"
      };
    } else {
      return {
        title: 'Adicionar à Tela Inicial',
        description: 'Para instalar este app no seu Android: toque em',
        icon: <Share className="w-3 h-3" />,
        instruction: 'e depois "Adicionar à tela inicial".',
        iconComponent: <Chrome className="w-5 h-5 text-green-600" />,
        cardClass: "shadow-lg border-green-200 bg-green-50",
        iconBgClass: "w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center",
        titleClass: "font-semibold text-sm mb-1 text-green-900",
        descriptionClass: "text-xs text-green-700 mb-3",
        buttonClass: "text-xs h-8 bg-green-600 hover:bg-green-700",
        ghostButtonClass: "text-xs h-8 text-green-600 hover:bg-green-100",
        closeButtonClass: "p-1 h-auto w-auto flex-shrink-0 text-green-600 hover:bg-green-100"
      };
    }
  };

  const content = getPlatformContent();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className={content.cardClass}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className={content.iconBgClass}>
                {content.iconComponent}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={content.titleClass}>
                {content.title}
              </h3>
              <p className={content.descriptionClass}>
                {content.description}{' '}
                <span className="inline-flex items-center mx-1">
                  {content.icon}
                </span>
                {content.instruction}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleDismiss}
                  className={content.buttonClass}
                >
                  Entendi
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className={content.ghostButtonClass}
                >
                  Depois
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className={content.closeButtonClass}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};