import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Monitor, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

export const AuthChoiceModal: React.FC<AuthChoiceModalProps> = ({
  isOpen,
  onClose,
  userName
}) => {
  const navigate = useNavigate();

  const handleSofiaChoice = () => {
    navigate('/sofia');
    onClose();
  };

  const handlePlatformChoice = () => {
    navigate('/dashboard');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            🎉 Bem-vindo ao Instituto dos Sonhos!
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Mensagem de boas-vindas */}
          <div className="text-center">
            <p className="text-lg text-muted-foreground">
              Olá <strong className="text-primary">{userName || 'usuário'}</strong>! 
              Para onde você gostaria de ir hoje?
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Escolha sua experiência personalizada
            </p>
          </div>

          {/* Opções */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sofia - IA Personalizada */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 group"
              onClick={handleSofiaChoice}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Sofia - IA Personalizada
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Converse com nossa IA especializada em saúde e bem-estar. 
                    Receba orientações personalizadas, tire dúvidas e acompanhe seu progresso.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                  <span>Conversar com Sofia</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>

            {/* Plataforma - Dashboard Completo */}
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50 group"
              onClick={handlePlatformChoice}
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full group-hover:scale-110 transition-transform duration-300">
                    <Monitor className="h-8 w-8 text-white" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5 text-blue-500" />
                    Plataforma Completa
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Acesse todos os recursos: pesagem, anamnese, missões diárias, 
                    gráficos de evolução e muito mais.
                  </p>
                </div>

                <div className="flex items-center justify-center gap-2 text-primary font-medium">
                  <span>Explorar Plataforma</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Informações adicionais */}
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              💡 Dica: Você pode alternar entre as duas opções a qualquer momento através do menu
            </p>
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
