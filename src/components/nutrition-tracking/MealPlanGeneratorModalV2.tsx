import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { X, Plus, ChefHat, Target, AlertTriangle, Heart, Lock, Unlock, Info, Calendar, Clock, Utensils, Loader2, ChefHat as ChefHatIcon, Target as TargetIcon, Heart as HeartIcon, AlertTriangle as AlertTriangleIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { useMealPlanGeneratorV2 } from '@/hooks/useMealPlanGeneratorV2';

interface MealPlanGeneratorParams {
  calorias: number;
  dias: number;
  restricoes: string[];
  preferencias: string[];
  peso_kg?: number;
  refeicoes_selecionadas?: string[];
}
import { useUserFoodPreferences } from '@/hooks/useUserFoodPreferences';
import { WeeklyMealPlanModal } from '@/components/meal-plan/WeeklyMealPlanModal';
import { 
  NutritionObjective, 
  calculateNutritionalGoals, 
  shouldLockProtein 
} from '@/utils/macro-calculator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface MealPlanGeneratorModalV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMeals?: {
    'café da manhã': boolean;
    'almoço': boolean;
    'lanche': boolean;
    'jantar': boolean;
    'ceia': boolean;
  };
}

// Objetivos com calorias automáticas
const OBJECTIVES = {
  [NutritionObjective.LOSE]: { label: 'Emagrecimento', calories: 1800 },
  [NutritionObjective.MAINTAIN]: { label: 'Manter Peso', calories: 2200 },
  [NutritionObjective.GAIN]: { label: 'Ganho de Massa', calories: 2500 },
  [NutritionObjective.LEAN_MASS]: { label: 'Hipertrofia', calories: 2800 }
};

// Equipamentos disponíveis (apenas os 3 principais)
const EQUIPMENTS = [
  { id: 'air_fryer', label: 'Air Fryer', icon: '🍳' },
  { id: 'stove', label: 'Fogão', icon: '🔥' },
  { id: 'microwave', label: 'Microondas', icon: '⚡' }
];

// Removendo COMMON_RESTRICTIONS - agora as restrições virão da anamnese e do usuário

export const MealPlanGeneratorModalV2: React.FC<MealPlanGeneratorModalV2Props> = ({
  open,
  onOpenChange,
  selectedMeals
}) => {
  const { physicalData, measurements } = useWeightMeasurement();
  const {
    generateMealPlan,
    isGenerating,
    generatedPlan,
    setGeneratedPlan
  } = useMealPlanGeneratorV2();
  
  const { 
    restrictions,
    preferences,
    getRestrictionsArray, 
    getPreferencesArray,
    addPreference,
    removePreference,
    loading: loadingPreferences
  } = useUserFoodPreferences();

  // Estados do formulário com valores padrão seguros
  const [numberOfDays, setNumberOfDays] = useState('7');
  const [objective, setObjective] = useState<NutritionObjective>(NutritionObjective.MAINTAIN);
  
  // Metas nutricionais automáticas
  const [dailyGoals, setDailyGoals] = useState({
    calories: 2200,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 25
  });
  
  // Preferências e restrições com verificações de segurança
  const [preferredFoods, setPreferredFoods] = useState<string[]>([]);
  const [newPreferredFood, setNewPreferredFood] = useState('');
  const [restrictedFoods, setRestrictedFoods] = useState<string[]>([]);
  const [newRestrictedFood, setNewRestrictedFood] = useState('');
  
  // Seleção múltipla com verificação de segurança
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>([]);
  
  // Modal state
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [mealPlanForModal, setMealPlanForModal] = useState<any>(null);
  
  // Peso do usuário com verificação de segurança
  const weight = measurements && measurements.length > 0 && measurements[0]?.peso_kg 
    ? measurements[0].peso_kg 
    : 70;

  // Carregar restrições salvas quando o modal abrir
  useEffect(() => {
    if (open && !loadingPreferences && getRestrictionsArray && getPreferencesArray) {
      try {
        const savedRestrictions = getRestrictionsArray();
        const savedPreferences = getPreferencesArray();
        
        console.log('🔄 Carregando restrições salvas:', savedRestrictions);
        console.log('🔄 Carregando preferências salvas:', savedPreferences);
        
        if (savedRestrictions && Array.isArray(savedRestrictions) && savedRestrictions.length > 0) {
          setRestrictedFoods(savedRestrictions);
        }
        if (savedPreferences && Array.isArray(savedPreferences) && savedPreferences.length > 0) {
          setPreferredFoods(savedPreferences);
        }
      } catch (error) {
        console.error('Erro ao carregar preferências:', error);
        // Manter arrays vazios em caso de erro
        setRestrictedFoods([]);
        setPreferredFoods([]);
      }
    }
  }, [open, loadingPreferences, getRestrictionsArray, getPreferencesArray]);

  // Recalcular metas quando objetivo ou peso mudar
  useEffect(() => {
    if (weight && physicalData && calculateNutritionalGoals) {
      try {
        const newGoals = calculateNutritionalGoals(
          objective,
          { ...physicalData, peso_kg: weight }
        );
        
        if (newGoals && typeof newGoals === 'object') {
          setDailyGoals(newGoals);
        }
      } catch (error) {
        console.error('Erro ao calcular metas nutricionais:', error);
        // Manter metas padrão em caso de erro
      }
    }
  }, [objective, weight, physicalData, calculateNutritionalGoals]);

  // Adicionar alimento preferido
  const addPreferredFood = async () => {
    const food = newPreferredFood.trim().toLowerCase();
    if (food && !preferredFoods.includes(food) && addPreference) {
      try {
        const success = await addPreference(food, 'preference');
        
        if (success) {
          setPreferredFoods(prev => [...prev, food]);
          setNewPreferredFood('');
          console.log('✅ Preferência adicionada e salva!');
        } else {
          console.log('❌ Erro ao salvar preferência no banco de dados');
        }
      } catch (error) {
        console.error('Erro ao adicionar preferência:', error);
        // Adicionar apenas localmente em caso de erro
        setPreferredFoods(prev => [...prev, food]);
        setNewPreferredFood('');
      }
    }
  };

  // Remover alimento preferido
  const removePreferredFood = async (food: string) => {
    if (!food || !removePreference) return;
    
    try {
      const preference = preferences?.find(p => p.food_name === food);
      
      if (preference) {
        const success = await removePreference(preference.id);
        
        if (success) {
          setPreferredFoods(prev => prev.filter(f => f !== food));
          console.log('✅ Preferência removida e salva!');
        } else {
          console.log('❌ Erro ao remover preferência do banco de dados');
        }
      } else {
        setPreferredFoods(prev => prev.filter(f => f !== food));
        console.log('⚠️ Preferência removida apenas do estado local');
      }
    } catch (error) {
      console.error('Erro ao remover preferência:', error);
      // Remover apenas localmente em caso de erro
      setPreferredFoods(prev => prev.filter(f => f !== food));
    }
  };

  // Adicionar restrição
  const addRestrictedFood = async () => {
    const food = newRestrictedFood.trim().toLowerCase();
    console.log('🚫 Tentando adicionar restrição:', food);
    
    if (food && !restrictedFoods.includes(food) && addPreference) {
      try {
        const success = await addPreference(food, 'restriction');
        
        if (success) {
          setRestrictedFoods(prev => [...prev, food]);
          setNewRestrictedFood('');
          console.log('✅ Restrição adicionada e salva! Nova lista:', [...restrictedFoods, food]);
        } else {
          console.log('❌ Erro ao salvar restrição no banco de dados');
        }
      } catch (error) {
        console.error('Erro ao adicionar restrição:', error);
        // Adicionar apenas localmente em caso de erro
        setRestrictedFoods(prev => [...prev, food]);
        setNewRestrictedFood('');
      }
    } else {
      console.log('❌ Restrição não adicionada - food vazio ou já existe');
    }
  };

  // Remover restrição
  const removeRestrictedFood = async (food: string) => {
    if (!food || !removePreference) return;
    
    try {
      const preference = preferences?.find(p => p.food_name === food);
      
      if (preference) {
        const success = await removePreference(preference.id);
        
        if (success) {
          setRestrictedFoods(prev => prev.filter(f => f !== food));
          console.log('✅ Restrição removida e salva!');
        } else {
          console.log('❌ Erro ao remover restrição do banco de dados');
        }
      } else {
        setRestrictedFoods(prev => prev.filter(f => f !== food));
        console.log('⚠️ Restrição removida apenas do estado local');
      }
    } catch (error) {
      console.error('Erro ao remover restrição:', error);
      // Remover apenas localmente em caso de erro
      setRestrictedFoods(prev => prev.filter(f => f !== food));
    }
  };

  // Toggle equipamento
  const toggleEquipment = (equipmentId: string) => {
    if (!equipmentId) return;
    
    setSelectedEquipments(prev => {
      if (!Array.isArray(prev)) return [equipmentId];
      
      return prev.includes(equipmentId) 
        ? prev.filter(id => id !== equipmentId)
        : [...prev, equipmentId];
    });
  };



  // Gerar cardápio
  const handleGenerateMealPlan = async () => {
    if (!generateMealPlan || !numberOfDays || !objective) {
      console.error('❌ Dados insuficientes para gerar cardápio');
      toast.error('Dados insuficientes para gerar cardápio');
      return;
    }

    console.log('🎯 MODAL V2: Iniciando geração de cardápio');
    console.log('🚫 Restrições:', restrictedFoods);
    console.log('❤️ Preferências:', preferredFoods);
    console.log('🍳 Equipamentos selecionados:', selectedEquipments);

    try {
      // Usar refeições selecionadas da página principal
      const refeicoesSelecionadas = selectedMeals 
        ? Object.keys(selectedMeals).filter(meal => selectedMeals[meal as keyof typeof selectedMeals])
        : ['café da manhã', 'almoço', 'lanche', 'jantar', 'ceia'];

      // Usar apenas restrições customizadas (alimentos específicos)
      const allRestrictions = Array.isArray(restrictedFoods) ? [...restrictedFoods] : [];

      // Regra de busca inteligente para equipamentos
      let observacoesEquipamentos = '';
      if (Array.isArray(selectedEquipments) && selectedEquipments.length > 0) {
        const equipamentosLabels = selectedEquipments.map(id => {
          const equipment = EQUIPMENTS.find(e => e.id === id);
          return equipment ? equipment.label : id;
        });
        observacoesEquipamentos = `Equipamentos preferidos: ${equipamentosLabels.join(', ')}. Se não houver receitas específicas para esses equipamentos, buscar receitas que possam ser adaptadas ou usar receitas gerais.`;
      }

      const mealPlanParams: MealPlanGeneratorParams = {
        calorias: dailyGoals.calories || 2200,
        dias: parseInt(numberOfDays) || 7,
        restricoes: allRestrictions,
        preferencias: Array.isArray(preferredFoods) ? [...preferredFoods] : [],
        peso_kg: weight,
        refeicoes_selecionadas: refeicoesSelecionadas
      };

      console.log('🎯 Chamando generateMealPlan com:', mealPlanParams);
      
      const result = await generateMealPlan(mealPlanParams);
      
      if (result && Array.isArray(result) && result.length > 0) {
        console.log('✅ Cardápio gerado com sucesso, adaptando...');
        setGeneratedPlan(result);
        
        setMealPlanForModal({
          days: result,
          title: `Cardápio ${numberOfDays} dias - ${new Date().toLocaleDateString('pt-BR')}`
        });
        setIsWeeklyModalOpen(true);
        
      } else {
        console.error('❌ Falha na geração do cardápio');
        toast.error('Falha na geração do cardápio');
      }
      
    } catch (error) {
      console.error('❌ Erro ao gerar cardápio:', error);
      toast.error('Erro inesperado ao gerar cardápio');
    } finally {
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center gap-2">
              <ChefHat className="w-5 h-5" />
              Gerar Cardápio Personalizado
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Configuração Básica */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TargetIcon className="w-4 h-4" />
                  Configuração Básica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="objective">Objetivo</Label>
                    <Select value={objective} onValueChange={(v) => setObjective(v as NutritionObjective)}>
                      <SelectTrigger id="objective">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(OBJECTIVES).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label} ({value.calories} kcal)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="days">Dias</Label>
                    <Select value={numberOfDays} onValueChange={setNumberOfDays}>
                      <SelectTrigger id="days">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 3, 7, 14, 21, 30].map(d => (
                          <SelectItem key={d} value={d.toString()}>
                            {d} {d === 1 ? 'dia' : 'dias'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <strong>Calorias diárias:</strong> {dailyGoals.calories} kcal (calculado automaticamente)
                </div>
              </CardContent>
            </Card>

            {/* Filtros Rápidos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Utensils className="w-4 h-4" />
                  Filtros Rápidos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Equipamentos */}
                <div>
                  <Label className="text-sm font-medium">🍳 Equipamentos</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {EQUIPMENTS.map(equipment => (
                      <div key={equipment.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={equipment.id}
                          checked={Array.isArray(selectedEquipments) && selectedEquipments.includes(equipment.id)}
                          onCheckedChange={() => toggleEquipment(equipment.id)}
                        />
                        <Label htmlFor={equipment.id} className="text-sm cursor-pointer">
                          {equipment.icon} {equipment.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Alimentos Restritos */}
                <div>
                  <Label className="text-sm font-medium">🚫 Alimentos Restritos</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Ex: frango, ovo, camarão..."
                      value={newRestrictedFood}
                      onChange={(e) => setNewRestrictedFood(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addRestrictedFood()}
                    />
                    <Button onClick={addRestrictedFood} size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(restrictedFoods) && restrictedFoods.map(food => (
                      <Badge key={food} variant="destructive" className="gap-1">
                        {food}
                        <button onClick={() => removeRestrictedFood(food)}>
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Preferências */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HeartIcon className="w-4 h-4" />
                  Preferências
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Ex: frango, peixe, quinoa..."
                    value={newPreferredFood}
                    onChange={(e) => setNewPreferredFood(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addPreferredFood()}
                  />
                  <Button onClick={addPreferredFood} size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {Array.isArray(preferredFoods) && preferredFoods.map(food => (
                    <Badge key={food} variant="secondary" className="gap-1">
                      {food}
                      <button onClick={() => removePreferredFood(food)}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Botão de ação */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleGenerateMealPlan} 
                disabled={isGenerating || !numberOfDays || !objective}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Gerando Cardápio...
                  </>
                ) : (
                  <>
                    <ChefHat className="mr-2 h-4 w-4" />
                    Gerar Cardápio
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para exibir o cardápio gerado */}
      {mealPlanForModal && (
        <WeeklyMealPlanModal
          open={isWeeklyModalOpen}
          onOpenChange={setIsWeeklyModalOpen}
          mealPlan={mealPlanForModal.days}
          title={mealPlanForModal.title}
        />
      )}
    </>
  );
};