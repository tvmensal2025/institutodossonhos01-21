// @ts-nocheck
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Zap, 
  AlertTriangle, 
  Heart, 
  Droplets, 
  Moon, 
  Target,
  Calendar,
  Activity,
  Save,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DailyAdvancedData {
  // Horários
  wake_up_time?: string;
  sleep_time?: string;
  
  // Energia (1-10)
  energy_morning?: number;
  energy_afternoon?: number;
  energy_evening?: number;
  
  // Estresse e gatilhos
  stress_triggers?: string;
  stress_level_general?: number;
  
  // Gratidão e reflexão
  gratitude_notes?: string;
  daily_highlight?: string;
  improvement_area?: string;
  tomorrow_intention?: string;
  
  // Água
  water_goal_ml?: number;
  water_current_ml?: number;
  
  // Sono detalhado
  sleep_quality_notes?: string;
  dream_recall?: boolean;
  wake_up_naturally?: boolean;
  
  // Exercício
  workout_planned?: boolean;
  workout_completed?: boolean;
  workout_satisfaction?: number;
  steps_goal?: number;
  
  // Alimentação
  meal_planning_done?: boolean;
  mindful_eating?: boolean;
  emotional_eating?: boolean;
  nutrition_satisfaction?: number;
  
  // Produtividade
  priorities_defined?: boolean;
  goals_achieved?: number;
  focus_level?: number;
  
  // Score e conclusão
  daily_score?: number;
  completion_percentage?: number;
  personal_growth_moment?: string;
}

export const DailyAdvancedTracker: React.FC = () => {
  const [formData, setFormData] = useState<DailyAdvancedData>({
    energy_morning: 5,
    energy_afternoon: 5,
    energy_evening: 5,
    stress_level_general: 5,
    water_goal_ml: 2000,
    water_current_ml: 0,
    workout_satisfaction: 5,
    steps_goal: 8000,
    nutrition_satisfaction: 5,
    goals_achieved: 0,
    focus_level: 5,
    daily_score: 50,
    completion_percentage: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const today = new Date().toISOString().split('T')[0];
      
      const { error } = await supabase
        .from('daily_advanced_tracking')
        .upsert({
          user_id: user.id,
          date: today,
          ...formData
        });

      if (error) throw error;

      toast({
        title: "✅ Tracking Salvo!",
        description: "Seus dados diários foram registrados com sucesso",
      });

    } catch (error) {
      console.error('Erro ao salvar tracking:', error);
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar os dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateField = (field: keyof DailyAdvancedData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculateCompletionPercentage = () => {
    const totalFields = 25; // Número aproximado de campos importantes
    const completedFields = Object.values(formData).filter(value => 
      value !== undefined && value !== '' && value !== 0
    ).length;
    return Math.round((completedFields / totalFields) * 100);
  };

  const calculateDailyScore = () => {
    let score = 0;
    let factors = 0;

    // Energia média
    if (formData.energy_morning && formData.energy_afternoon && formData.energy_evening) {
      score += ((formData.energy_morning + formData.energy_afternoon + formData.energy_evening) / 3) * 10;
      factors++;
    }

    // Nível de estresse (inverso)
    if (formData.stress_level_general) {
      score += (11 - formData.stress_level_general) * 10;
      factors++;
    }

    // Hidratação
    if (formData.water_current_ml && formData.water_goal_ml) {
      score += Math.min((formData.water_current_ml / formData.water_goal_ml) * 100, 100);
      factors++;
    }

    // Treino e satisfação
    if (formData.workout_completed && formData.workout_satisfaction) {
      score += formData.workout_satisfaction * 20;
      factors++;
    }

    return factors > 0 ? Math.round(score / factors) : 0;
  };

  React.useEffect(() => {
    const completion = calculateCompletionPercentage();
    const score = calculateDailyScore();
    updateField('completion_percentage', completion);
    updateField('daily_score', score);
  }, [formData]);

  return (
    <div className="space-y-6">
      {/* Header com Score */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              <span>Tracking Avançado - {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {formData.completion_percentage}% Completo
              </Badge>
              <Badge variant="default" className="text-lg px-3 py-1">
                Score: {formData.daily_score}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seção: Horários e Sono */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Horários e Sono
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="wake_up_time">Horário que acordou</Label>
                <Input
                  id="wake_up_time"
                  type="time"
                  value={formData.wake_up_time || ''}
                  onChange={(e) => updateField('wake_up_time', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sleep_time">Horário que dormiu (hoje)</Label>
                <Input
                  id="sleep_time"
                  type="time"
                  value={formData.sleep_time || ''}
                  onChange={(e) => updateField('sleep_time', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sleep_quality_notes">Observações sobre o sono</Label>
              <Textarea
                id="sleep_quality_notes"
                placeholder="Como foi a qualidade do seu sono? Sonhos, interrupções..."
                value={formData.sleep_quality_notes || ''}
                onChange={(e) => updateField('sleep_quality_notes', e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="button"
                variant={formData.dream_recall ? "default" : "outline"}
                size="sm"
                onClick={() => updateField('dream_recall', !formData.dream_recall)}
              >
                <Moon className="w-4 h-4 mr-2" />
                Lembrou dos sonhos
              </Button>
              <Button
                type="button"
                variant={formData.wake_up_naturally ? "default" : "outline"}
                size="sm"
                onClick={() => updateField('wake_up_naturally', !formData.wake_up_naturally)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Acordou naturalmente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Energia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Níveis de Energia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <Label>Energia pela manhã (1-10)</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.energy_morning || 5]}
                    onValueChange={(value) => updateField('energy_morning', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center mt-1 font-semibold">
                    {formData.energy_morning}/10
                  </div>
                </div>
              </div>

              <div>
                <Label>Energia à tarde (1-10)</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.energy_afternoon || 5]}
                    onValueChange={(value) => updateField('energy_afternoon', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center mt-1 font-semibold">
                    {formData.energy_afternoon}/10
                  </div>
                </div>
              </div>

              <div>
                <Label>Energia à noite (1-10)</Label>
                <div className="mt-2">
                  <Slider
                    value={[formData.energy_evening || 5]}
                    onValueChange={(value) => updateField('energy_evening', value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="text-center mt-1 font-semibold">
                    {formData.energy_evening}/10
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Estresse e Gatilhos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Estresse e Bem-estar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nível geral de estresse (1-10)</Label>
              <div className="mt-2">
                <Slider
                  value={[formData.stress_level_general || 5]}
                  onValueChange={(value) => updateField('stress_level_general', value[0])}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="text-center mt-1 font-semibold">
                  {formData.stress_level_general}/10
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="stress_triggers">Gatilhos de estresse hoje</Label>
              <Textarea
                id="stress_triggers"
                placeholder="O que causou estresse hoje? Como lidou com isso?"
                value={formData.stress_triggers || ''}
                onChange={(e) => updateField('stress_triggers', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Seção: Hidratação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="w-5 h-5" />
              Hidratação
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="water_goal_ml">Meta de água (ml)</Label>
                <Input
                  id="water_goal_ml"
                  type="number"
                  value={formData.water_goal_ml || 2000}
                  onChange={(e) => updateField('water_goal_ml', parseInt(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="water_current_ml">Água consumida hoje (ml)</Label>
                <Input
                  id="water_current_ml"
                  type="number"
                  value={formData.water_current_ml || 0}
                  onChange={(e) => updateField('water_current_ml', parseInt(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção: Reflexão e Gratidão */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Reflexão e Gratidão
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="gratitude_notes">Gratidão do dia</Label>
              <Textarea
                id="gratitude_notes"
                placeholder="Pelo que você é grato hoje?"
                value={formData.gratitude_notes || ''}
                onChange={(e) => updateField('gratitude_notes', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="daily_highlight">Destaque do dia</Label>
              <Textarea
                id="daily_highlight"
                placeholder="Qual foi o momento ou conquista mais importante do dia?"
                value={formData.daily_highlight || ''}
                onChange={(e) => updateField('daily_highlight', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="improvement_area">Área de melhoria</Label>
              <Textarea
                id="improvement_area"
                placeholder="O que você pode melhorar amanhã?"
                value={formData.improvement_area || ''}
                onChange={(e) => updateField('improvement_area', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="tomorrow_intention">Intenção para amanhã</Label>
              <Textarea
                id="tomorrow_intention"
                placeholder="Como você quer se sentir e o que quer alcançar amanhã?"
                value={formData.tomorrow_intention || ''}
                onChange={(e) => updateField('tomorrow_intention', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Botão de Salvar */}
        <Card>
          <CardContent className="pt-6">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 text-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {isLoading ? 'Salvando...' : 'Salvar Tracking do Dia'}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};