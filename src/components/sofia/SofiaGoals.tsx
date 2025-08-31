import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

interface Goal {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  category: 'weight' | 'nutrition' | 'exercise' | 'habits';
  status: 'active' | 'completed' | 'paused';
}

const SofiaGoals: React.FC = () => {
  const [goals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Perder Peso',
      description: 'Meta de redução de peso corporal',
      target: 5,
      current: 2.3,
      unit: 'kg',
      deadline: '2024-03-15',
      category: 'weight',
      status: 'active'
    },
    {
      id: '2', 
      title: 'Beber Água',
      description: 'Consumir água diariamente',
      target: 2.5,
      current: 1.8,
      unit: 'L',
      deadline: '2024-02-01',
      category: 'habits',
      status: 'active'
    },
    {
      id: '3',
      title: 'Exercícios Semanais',
      description: 'Praticar atividade física',
      target: 5,
      current: 3,
      unit: 'dias',
      deadline: '2024-02-07',
      category: 'exercise',
      status: 'active'
    }
  ]);

  const getCategoryColor = (category: string) => {
    const colors = {
      weight: 'bg-blue-100 text-blue-800',
      nutrition: 'bg-green-100 text-green-800',
      exercise: 'bg-orange-100 text-orange-800',
      habits: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      weight: '⚖️',
      nutrition: '🥗',
      exercise: '💪',
      habits: '🎯'
    };
    return icons[category as keyof typeof icons] || '📋';
  };

  const handleAddGoal = () => {
    toast.info('✨ Formulário para criar nova meta em desenvolvimento!');
  };

  const handleUpdateProgress = (goalId: string) => {
    toast.info('📈 Atualização de progresso em desenvolvimento!');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">🎯 Suas Metas</h2>
          <p className="text-gray-600">Acompanhe seu progresso e conquiste seus objetivos</p>
        </div>
        <Button onClick={handleAddGoal} className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
          <Plus className="h-4 w-4" />
          Nova Meta
        </Button>
      </div>

      <div className="grid gap-4">
        {goals.map((goal) => {
          const progress = (goal.current / goal.target) * 100;
          const isCompleted = progress >= 100;
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

          return (
            <Card key={goal.id} className={`border-l-4 ${isCompleted ? 'border-l-green-500 bg-green-50' : 'border-l-purple-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getCategoryIcon(goal.category)}</span>
                    <div>
                      <CardTitle className="text-lg">{goal.title}</CardTitle>
                      <p className="text-sm text-gray-600">{goal.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(goal.category)}>
                      {goal.category}
                    </Badge>
                    {isCompleted && <CheckCircle className="h-5 w-5 text-green-600" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso: {goal.current} / {goal.target} {goal.unit}</span>
                    <span className={`font-medium ${isCompleted ? 'text-green-600' : 'text-purple-600'}`}>
                      {Math.round(progress)}%
                    </span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Prazo vencido'}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      {progress > 50 ? 'No caminho certo!' : 'Precisa de foco'}
                    </div>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleUpdateProgress(goal.id)}
                    disabled={isCompleted}
                  >
                    {isCompleted ? 'Concluída!' : 'Atualizar'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhuma meta criada</h3>
            <p className="text-gray-600 mb-4">
              Defina seus objetivos e acompanhe seu progresso com a Sofia!
            </p>
            <Button onClick={handleAddGoal} className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Primeira Meta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SofiaGoals;