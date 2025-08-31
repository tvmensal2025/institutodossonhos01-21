import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AnamnesisNotificationProps {
  onNavigateToAnamnesis?: () => void;
}

const AnamnesisNotification: React.FC<AnamnesisNotificationProps> = ({ onNavigateToAnamnesis }) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (onNavigateToAnamnesis) {
      onNavigateToAnamnesis();
    } else {
      navigate('/anamnesis');
    }
  };

  return (
    <Card className="border-yellow-500 border-2 bg-yellow-500/10 animate-pulse">
      <CardContent className="p-4">
        <Alert className="border-0 bg-transparent">
          <div className="flex items-center gap-3">
            <div className="relative">
              <FileText className="h-5 w-5 text-yellow-500" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-500 rounded-full animate-ping"></div>
            </div>
            <AlertDescription className="text-yellow-200 flex-1">
              <div className="font-semibold mb-1">Anamnese Pendente</div>
              <div className="text-sm mb-3">
                Complete sua anamnese sistêmica para que Dr. Vital e Sofia possam 
                oferecer o melhor acompanhamento personalizado.
              </div>
              <Button 
                onClick={handleNavigate}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <FileText className="w-4 h-4 mr-2" />
                Preencher Anamnese
              </Button>
            </AlertDescription>
          </div>
        </Alert>
      </CardContent>
    </Card>
  );
};

// Componente para exibir na sidebar do usuário
export const UserProfileAnamnesisIndicator: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="relative cursor-pointer" onClick={() => navigate('/anamnesis')}>
      <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse">
        <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping"></div>
      </div>
      <span className="sr-only">Anamnese pendente</span>
    </div>
  );
};

export default AnamnesisNotification;