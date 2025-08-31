import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Brain, 
  Heart, 
  Activity, 
  Clock,
  Target,
  Sparkles
} from 'lucide-react';

interface SessionButtonProps {
  onStartSession: () => void;
  disabled?: boolean;
}

const SessionButton: React.FC<SessionButtonProps> = ({ 
  onStartSession, 
  disabled = false 
}) => {
  return (
    <Card className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition-all duration-300 hover:shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
          <Brain className="w-8 h-8 text-white" />
        </div>
        <CardTitle className="text-xl mb-2">
          Iniciar Nova Sessão com Dr. Vital
        </CardTitle>
        <div className="flex justify-center gap-2 mb-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            10-15 min
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Target className="w-3 h-3" />
            Análise Completa
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="text-center">
        <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
          <div className="flex flex-col items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            <span className="text-gray-600">Saúde Física</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Brain className="w-6 h-6 text-purple-500" />
            <span className="text-gray-600">Bem-estar Mental</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Activity className="w-6 h-6 text-green-500" />
            <span className="text-gray-600">Estilo de Vida</span>
          </div>
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          O Dr. Vital irá conduzir uma análise personalizada dos seus hábitos de saúde 
          e gerar um relatório completo com gráficos e recomendações.
        </p>

        <Button 
          onClick={onStartSession}
          disabled={disabled}
          className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white py-3 text-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
        >
          <Play className="w-5 h-5" />
          Iniciar Sessão
          <Sparkles className="w-4 h-4 ml-1" />
        </Button>

        <p className="text-xs text-gray-500 mt-3">
          Seus dados são processados com total segurança e privacidade
        </p>
      </CardContent>
    </Card>
  );
};

export default SessionButton;