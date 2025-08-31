import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useSofiaIntegration } from '@/hooks/useSofiaIntegration';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Clock, Target, Trophy } from 'lucide-react';

interface Mission {
  id: string;
  title: string;
  description: string;
  section: string;
  question_id: string;
  points: number;
  completed: boolean;
  progress?: number;
  target?: number;
}

interface SofiaMissionIntegrationProps {
  missions: Mission[];
  onMissionUpdate?: (missionId: string, completed: boolean) => void;
}

export const SofiaMissionIntegration: React.FC<SofiaMissionIntegrationProps> = ({
  missions,
  onMissionUpdate
}) => {
  const { updateMissionViaSofia, isLoading } = useSofiaIntegration();
  const { toast } = useToast();
  const [completedMissions, setCompletedMissions] = useState<string[]>([]);

  const handleMissionComplete = async (mission: Mission) => {
    try {
      await updateMissionViaSofia(
        mission.section,
        mission.question_id,
        'completed',
        `Missão "${mission.title}" completada via Sofia`,
        mission.points
      );

      setCompletedMissions(prev => [...prev, mission.id]);
      onMissionUpdate?.(mission.id, true);

      toast({
        title: "Missão completada! 🎉",
        description: `Parabéns! Você ganhou ${mission.points} pontos!`,
        variant: "default"
      });
    } catch (error) {
      console.error('Erro ao completar missão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível completar a missão. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const getMissionIcon = (section: string) => {
    switch (section) {
      case 'morning':
        return <Clock className="h-4 w-4" />;
      case 'habits':
        return <Target className="h-4 w-4" />;
      case 'mindset':
        return <Trophy className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const getSectionColor = (section: string) => {
    switch (section) {
      case 'morning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'habits':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'mindset':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Missões do Dia - Integração Sofia
          </CardTitle>
          <CardDescription>
            Complete suas missões diárias e a Sofia registrará automaticamente!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {missions.map((mission) => {
              const isCompleted = completedMissions.includes(mission.id);
              const progress = mission.progress || 0;
              const target = mission.target || 100;

              return (
                <div
                  key={mission.id}
                  className={`p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? 'bg-green-50 border-green-200'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getMissionIcon(mission.section)}
                        <h3 className="font-medium text-sm">{mission.title}</h3>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${getSectionColor(mission.section)}`}
                        >
                          {mission.section}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {mission.description}
                      </p>

                      {mission.progress !== undefined && (
                        <div className="mb-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progresso</span>
                            <span>{progress}/{target}</span>
                          </div>
                          <Progress value={(progress / target) * 100} className="h-2" />
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {mission.points} pontos
                          </span>
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleMissionComplete(mission)}
                          disabled={isCompleted || isLoading}
                          className={isCompleted ? 'bg-green-500 hover:bg-green-600' : ''}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Completada
                            </>
                          ) : (
                            'Completar via Sofia'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {completedMissions.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {completedMissions.length} missão{completedMissions.length > 1 ? 'ões' : ''} completada{completedMissions.length > 1 ? 's' : ''} via Sofia!
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}; 