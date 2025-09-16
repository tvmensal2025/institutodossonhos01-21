import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Target, Zap, Info, Calculator } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  NutritionObjective, 
  calculateNutritionalGoals,
  calculateTDEE,
  PhysicalData 
} from '@/utils/macro-calculator';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { usePhysicalData } from '@/hooks/usePhysicalData';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface CalorieGoalSectionProps {
  className?: string;
}

const OBJECTIVE_CONFIG = {
  [NutritionObjective.LOSE]: { 
    label: 'Emagrecimento', 
    emoji: '🔥',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Déficit calórico de 20% para perda de peso sustentável'
  },
  [NutritionObjective.MAINTAIN]: { 
    label: 'Manter Peso', 
    emoji: '⚖️',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: '100% do TDEE para manutenção do peso atual'
  },
  [NutritionObjective.GAIN]: { 
    label: 'Ganho de Massa', 
    emoji: '📈',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Superávit calórico de 10% para ganho de peso'
  },
  [NutritionObjective.LEAN_MASS]: { 
    label: 'Hipertrofia', 
    emoji: '💪',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Superávit calórico de 15% focado em massa muscular'
  }
};

export const CalorieGoalSection: React.FC<CalorieGoalSectionProps> = ({ className }) => {
  const [user, setUser] = useState<User | null>(null);
  const [objective, setObjective] = useState<NutritionObjective>(NutritionObjective.MAINTAIN);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  
  const { measurements, stats, physicalData: weightPhysicalData } = useWeightMeasurement();
  const { physicalData } = usePhysicalData(user);

  // Carregar usuário atual
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getCurrentUser();
  }, []);

  // Carregar objetivo salvo (usando localStorage por enquanto)
  useEffect(() => {
    if (user) {
      const savedObjective = localStorage.getItem(`nutrition_objective_${user.id}`);
      if (savedObjective && Object.values(NutritionObjective).includes(savedObjective as NutritionObjective)) {
        setObjective(savedObjective as NutritionObjective);
      }
    }
  }, [user]);

  // Preparar dados físicos combinados
  const combinedPhysicalData = useMemo(() => {
    const currentWeight = stats?.currentWeight || measurements?.[0]?.peso_kg;
    
    if (!currentWeight) return null;

    // Usar dados físicos do hook de pesagem ou do hook de dados físicos
    const physicalInfo = weightPhysicalData || physicalData;
    
    if (!physicalInfo?.altura_cm || !physicalInfo?.idade || !physicalInfo?.sexo) {
      return null;
    }

    return {
      peso_kg: currentWeight,
      altura_cm: physicalInfo.altura_cm,
      idade: physicalInfo.idade,
      sexo: physicalInfo.sexo,
      nivel_atividade: physicalInfo.nivel_atividade || 'Moderado'
    } as PhysicalData;
  }, [stats, measurements, weightPhysicalData, physicalData]);

  // Calcular metas nutricionais
  const nutritionalGoals = useMemo(() => {
    if (!combinedPhysicalData) return null;
    
    try {
      return calculateNutritionalGoals(objective, combinedPhysicalData);
    } catch (error) {
      console.error('Erro ao calcular metas nutricionais:', error);
      return null;
    }
  }, [objective, combinedPhysicalData]);

  // Calcular TDEE para mostrar informações adicionais
  const tdeeInfo = useMemo(() => {
    if (!combinedPhysicalData) return null;
    
    try {
      const tdee = calculateTDEE(combinedPhysicalData);
      return {
        tdee,
        bmr: Math.round(tdee / 1.5) // Estimativa aproximada do BMR
      };
    } catch (error) {
      console.error('Erro ao calcular TDEE:', error);
      return null;
    }
  }, [combinedPhysicalData]);

  // Salvar objetivo
  const handleObjectiveChange = async (newObjective: NutritionObjective) => {
    if (!user || saving) return;
    
    try {
      setSaving(true);
      setObjective(newObjective);
      
      // Salvar no localStorage por enquanto
      localStorage.setItem(`nutrition_objective_${user.id}`, newObjective);
      
      toast({
        title: "Objetivo atualizado!",
        description: `Meta calórica ajustada para ${OBJECTIVE_CONFIG[newObjective].label}`,
      });
    } catch (error) {
      console.error('Erro ao salvar objetivo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o objetivo.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Se não tem dados físicos suficientes
  if (!combinedPhysicalData || !nutritionalGoals) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Meta Calórica
          </CardTitle>
          <CardDescription>
            Defina seu objetivo para calcular suas calorias diárias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Complete seus dados físicos (altura, idade, sexo) e registre uma pesagem para calcular suas metas calóricas personalizadas.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const config = OBJECTIVE_CONFIG[objective];

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Meta Calórica
        </CardTitle>
        <CardDescription>
          Baseado no seu peso atual de {combinedPhysicalData.peso_kg}kg
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletor de Objetivo */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Objetivo</Label>
          <Select 
            value={objective} 
            onValueChange={handleObjectiveChange}
            disabled={saving}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(OBJECTIVE_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{config.emoji}</span>
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            {config.description}
          </p>
        </div>

        {/* Meta Calórica Principal */}
        <div className={`rounded-lg p-4 ${config.bgColor}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.emoji}</span>
              <span className={`font-medium ${config.color}`}>
                {config.label}
              </span>
            </div>
            <Badge variant="secondary" className="text-xs">
              Personalizado
            </Badge>
          </div>
          
          <div className="text-3xl font-bold text-foreground mb-1">
            {nutritionalGoals.calories.toLocaleString()}
            <span className="text-base font-normal text-muted-foreground ml-2">
              kcal/dia
            </span>
          </div>
          
          {/* Macronutrientes */}
          <div className="grid grid-cols-3 gap-3 mt-3 text-sm">
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {nutritionalGoals.protein}g
              </div>
              <div className="text-muted-foreground">Proteína</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {nutritionalGoals.carbs}g
              </div>
              <div className="text-muted-foreground">Carboidratos</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-foreground">
                {nutritionalGoals.fat}g
              </div>
              <div className="text-muted-foreground">Gordura</div>
            </div>
          </div>
        </div>

        {/* Informações do TDEE */}
        {tdeeInfo && (
          <div className="border rounded-lg p-3 bg-muted/20">
            <div className="flex items-center gap-2 mb-2">
              <Calculator className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Cálculo Baseado em:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>TDEE: {tdeeInfo.tdee.toLocaleString()} kcal</div>
              <div>BMR: ~{tdeeInfo.bmr.toLocaleString()} kcal</div>
              <div>Peso: {combinedPhysicalData.peso_kg}kg</div>
              <div>Atividade: {combinedPhysicalData.nivel_atividade}</div>
            </div>
          </div>
        )}
        
        {saving && (
          <div className="text-xs text-muted-foreground text-center">
            Salvando objetivo...
          </div>
        )}
      </CardContent>
    </Card>
  );
};