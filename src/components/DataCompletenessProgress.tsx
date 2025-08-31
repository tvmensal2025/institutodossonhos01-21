import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useSofiaDataRequirements } from '@/hooks/useUserDataCompleteness';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Circle, AlertCircle, Sparkles } from 'lucide-react';

interface DataCompletenessProgressProps {
  compact?: boolean;
  showActions?: boolean;
}

const DataCompletenessProgress: React.FC<DataCompletenessProgressProps> = ({ 
  compact = false, 
  showActions = true 
}) => {
  const {
    completenessData,
    isLoading,
    canReceiveAnalysis,
    completionPercentage,
    getDataRequirementMessage,
    getMissingDataActions,
    getProgressMessage,
    isComplete
  } = useSofiaDataRequirements();

  const navigate = useNavigate();

  if (isLoading || !completenessData) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-2 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const requirementMessage = getDataRequirementMessage();
  const progressMessage = getProgressMessage();
  const missingActions = getMissingDataActions();

  const getProgressColor = () => {
    if (canReceiveAnalysis) return 'text-green-600';
    if (completionPercentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBgColor = () => {
    if (canReceiveAnalysis) return 'bg-green-100 border-green-200';
    if (completionPercentage >= 60) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  if (compact) {
    return (
      <Card className={`${getProgressBgColor()} border`}>
        <CardContent className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {canReceiveAnalysis ? (
                <Sparkles className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className={`w-4 h-4 ${getProgressColor()}`} />
              )}
              <span className={`text-sm font-medium ${getProgressColor()}`}>
                {completionPercentage}% completo
              </span>
            </div>
            <Badge variant={canReceiveAnalysis ? "default" : "secondary"}>
              {canReceiveAnalysis ? "Análise disponível" : "Dados parciais"}
            </Badge>
          </div>
          <Progress value={completionPercentage} className="mt-2 h-2" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`${getProgressBgColor()} border`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {canReceiveAnalysis ? (
              <Sparkles className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className={`w-5 h-5 ${getProgressColor()}`} />
            )}
            Perfil de Dados
            <Badge variant={canReceiveAnalysis ? "default" : "secondary"} className="ml-2">
              {completionPercentage}%
            </Badge>
          </CardTitle>
        </div>
        
        {requirementMessage && (
          <p className={`text-sm ${getProgressColor()}`}>
            {requirementMessage.message}
          </p>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progresso geral</span>
            <span className={`font-medium ${getProgressColor()}`}>
              {completionPercentage}%
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          <p className="text-xs text-gray-600">
            {progressMessage}
          </p>
        </div>

        {/* Status Items */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {Object.entries(completenessData.completionStatus).map(([key, completed]) => {
            const labels = {
              anamnesis: 'Anamnese',
              dailyMission: 'Missão Diária',
              physicalData: 'Dados Físicos',
              goals: 'Metas',
              profile: 'Perfil'
            };

            return (
              <div key={key} className="flex items-center gap-2">
                {completed ? (
                  <CheckCircle className="w-3 h-3 text-green-600" />
                ) : (
                  <Circle className="w-3 h-3 text-gray-400" />
                )}
                <span className={completed ? 'text-green-700' : 'text-gray-600'}>
                  {labels[key as keyof typeof labels]}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        {showActions && missingActions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Próximos passos:</h4>
            <div className="space-y-1">
              {missingActions.slice(0, 3).map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start text-xs h-8"
                  onClick={() => navigate(action.route)}
                >
                  <span className="mr-2">{action.icon}</span>
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Sofia Status */}
        <div className={`p-3 rounded-lg border ${canReceiveAnalysis ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs">
              👩‍⚕️
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium">
                {canReceiveAnalysis ? 'Sofia - Análise Completa' : 'Sofia - Análise Básica'}
              </p>
              <p className="text-xs text-gray-600">
                {canReceiveAnalysis 
                  ? 'Recomendações totalmente personalizadas'
                  : 'Complete mais dados para análises personalizadas'
                }
              </p>
            </div>
            {canReceiveAnalysis && (
              <Sparkles className="w-4 h-4 text-green-600" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DataCompletenessProgress;