import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Share, X, Smartphone, Chrome } from 'lucide-react';

export const IOSInstallPrompt: React.FC = () => {
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
        iconComponent: <Smartphone className="w-5 h-5 text-blue-600" />
      };
    } else {
      return {
        title: 'Adicionar à Tela Inicial',
        description: 'Para instalar este app no seu Android: toque em',
        icon: <Share className="w-3 h-3" />,
        instruction: 'e depois "Adicionar à tela inicial".',
        iconComponent: <Chrome className="w-5 h-5 text-green-600" />
      };
    }
  };

  const content = getPlatformContent();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className={`shadow-lg border-${platform === 'ios' ? 'blue' : 'green'}-200 bg-${platform === 'ios' ? 'blue' : 'green'}-50`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 bg-${platform === 'ios' ? 'blue' : 'green'}-100 rounded-lg flex items-center justify-center`}>
                {content.iconComponent}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold text-sm mb-1 text-${platform === 'ios' ? 'blue' : 'green'}-900`}>
                {content.title}
              </h3>
              <p className={`text-xs text-${platform === 'ios' ? 'blue' : 'green'}-700 mb-3`}>
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
                  className={`text-xs h-8 bg-${platform === 'ios' ? 'blue' : 'green'}-600 hover:bg-${platform === 'ios' ? 'blue' : 'green'}-700`}
                >
                  Entendi
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className={`text-xs h-8 text-${platform === 'ios' ? 'blue' : 'green'}-600 hover:bg-${platform === 'ios' ? 'blue' : 'green'}-100`}
                >
                  Depois
                </Button>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className={`p-1 h-auto w-auto flex-shrink-0 text-${platform === 'ios' ? 'blue' : 'green'}-600 hover:bg-${platform === 'ios' ? 'blue' : 'green'}-100`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};