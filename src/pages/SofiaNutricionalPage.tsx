import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  BarChart3,
  ChefHat,
  Lightbulb,
  Zap,
  Sparkles,
  Clock,
  History
} from 'lucide-react';

import { MealPlanGeneratorModalV2 } from '@/components/nutrition-tracking/MealPlanGeneratorModalV2';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';
import { SofiaNutritionInsights } from '@/components/sofia/SofiaNutritionInsights';
import { MealPlanHistoryModal } from '@/components/meal-plan/MealPlanHistoryModal';
import { MealPlanSuccessEffect } from '@/components/meal-plan/MealPlanSuccessEffect';
import { UnifiedAnalysisHistory } from '@/components/analysis/UnifiedAnalysisHistory';
import { useMealPlanGeneratorV2 } from '@/hooks/useMealPlanGeneratorV2';

export const SofiaNutricionalPage: React.FC = () => {
  const { meals, goals, loading, error, getDailyNutrition, getNutritionStats, updateGoals } = useNutritionTracking();
  const { showSuccessEffect, setShowSuccessEffect, generatedPlan } = useMealPlanGeneratorV2();
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('tracker');
  const [showMealPlanGenerator, setShowMealPlanGenerator] = useState(false);
  
  // Estado para controlar quais refeições incluir no cardápio
  const [selectedMeals, setSelectedMeals] = useState({
    'café da manhã': true,
    'almoço': true,
    'lanche': true,
    'jantar': true,
    'ceia': false
  });

  // Função para alternar seleção de refeição
  const toggleMealSelection = (mealType: string) => {
    setSelectedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType as keyof typeof prev]
    }));
  };

  // Função para gerar cardápio com refeições selecionadas
  const handleGenerateMealPlan = () => {
    // Verificar se pelo menos uma refeição está selecionada
    const hasSelectedMeals = Object.values(selectedMeals).some(selected => selected);
    
    if (!hasSelectedMeals) {
      // Mostrar erro se nenhuma refeição estiver selecionada
      alert('Selecione pelo menos uma refeição para gerar o cardápio.');
      return;
    }

    // Abrir modal de geração com as refeições selecionadas
    setShowMealPlanGenerator(true);
  };

  const currentNutrition = getDailyNutrition(selectedDate);
  const stats = getNutritionStats();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados nutricionais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
            Sofia Nutricional
          </h1>
          <p className="text-muted-foreground">Sua assistente inteligente para nutrição e bem-estar</p>
        </div>
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
          <Sparkles className="w-4 h-4 mr-1" />
          IA Ativa
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-4">
          <TabsTrigger value="tracker">Nutrição</TabsTrigger>
          <TabsTrigger value="generator">Cardápios</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="tracker" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {/* Resumo diário */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-emerald-600" />
                  Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Calorias</span>
                    <span className="font-semibold">
                      {currentNutrition.totalCalories.toFixed(0)}/{goals.calories}
                    </span>
                  </div>
                  <Progress 
                    value={(currentNutrition.totalCalories / goals.calories) * 100} 
                    className="h-2" 
                  />
                  
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-orange-600">{currentNutrition.totalProtein.toFixed(0)}g</div>
                      <div className="text-xs text-muted-foreground">Proteína</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-blue-600">{currentNutrition.totalCarbs.toFixed(0)}g</div>
                      <div className="text-xs text-muted-foreground">Carbos</div>
                    </div>
                    <div className="text-center">
                      <div className="font-medium text-yellow-600">{currentNutrition.totalFat.toFixed(0)}g</div>
                      <div className="text-xs text-muted-foreground">Gordura</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas semanais */}
            <Card className="bg-white shadow-sm border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Semana
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Média de calorias</span>
                    <span className="font-semibold">{stats.averageCalories.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Dias registrados</span>
                    <span className="font-semibold">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Aderência à meta</span>
                    <span className="font-semibold text-emerald-600">
                      {((stats.averageCalories / goals.calories) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>


        </TabsContent>

        <TabsContent value="generator" className="space-y-6">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-emerald-600" />
                Gerador de Cardápios IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Crie cardápios personalizados baseados nas suas metas nutricionais e preferências alimentares.
                </p>
                
                {/* Seleção de Refeições */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-700">Refeições incluídas:</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div 
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                        selectedMeals['café da manhã'] 
                          ? 'bg-emerald-50 border border-emerald-200 shadow-sm' 
                          : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleMealSelection('café da manhã')}
                    >
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
                        selectedMeals['café da manhã'] 
                          ? 'bg-emerald-500' 
                          : 'bg-gray-300'
                      }`}>
                        {selectedMeals['café da manhã'] && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        selectedMeals['café da manhã'] 
                          ? 'text-emerald-700' 
                          : 'text-gray-600'
                      }`}>
                        Café da manhã
                      </span>
                    </div>

                    <div 
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                        selectedMeals['almoço'] 
                          ? 'bg-emerald-50 border border-emerald-200 shadow-sm' 
                          : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleMealSelection('almoço')}
                    >
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
                        selectedMeals['almoço'] 
                          ? 'bg-emerald-500' 
                          : 'bg-gray-300'
                      }`}>
                        {selectedMeals['almoço'] && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        selectedMeals['almoço'] 
                          ? 'text-emerald-700' 
                          : 'text-gray-600'
                      }`}>
                        Almoço
                      </span>
                    </div>

                    <div 
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                        selectedMeals['lanche'] 
                          ? 'bg-emerald-50 border border-emerald-200 shadow-sm' 
                          : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleMealSelection('lanche')}
                    >
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
                        selectedMeals['lanche'] 
                          ? 'bg-emerald-500' 
                          : 'bg-gray-300'
                      }`}>
                        {selectedMeals['lanche'] && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        selectedMeals['lanche'] 
                          ? 'text-emerald-700' 
                          : 'text-gray-600'
                      }`}>
                        Lanche
                      </span>
                    </div>

                    <div 
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                        selectedMeals['jantar'] 
                          ? 'bg-emerald-50 border border-emerald-200 shadow-sm' 
                          : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleMealSelection('jantar')}
                    >
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
                        selectedMeals['jantar'] 
                          ? 'bg-emerald-500' 
                          : 'bg-gray-300'
                      }`}>
                        {selectedMeals['jantar'] && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        selectedMeals['jantar'] 
                          ? 'text-emerald-700' 
                          : 'text-gray-600'
                      }`}>
                        Jantar
                      </span>
                    </div>

                    <div 
                      className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-all duration-200 ${
                        selectedMeals['ceia'] 
                          ? 'bg-emerald-50 border border-emerald-200 shadow-sm' 
                          : 'bg-gray-50 border border-gray-100 hover:bg-gray-100'
                      }`}
                      onClick={() => toggleMealSelection('ceia')}
                    >
                      <div className={`w-3 h-3 rounded-full flex items-center justify-center transition-colors ${
                        selectedMeals['ceia'] 
                          ? 'bg-emerald-500' 
                          : 'bg-gray-300'
                      }`}>
                        {selectedMeals['ceia'] && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                        )}
                      </div>
                      <span className={`text-xs font-medium ${
                        selectedMeals['ceia'] 
                          ? 'text-emerald-700' 
                          : 'text-gray-600'
                      }`}>
                        Ceia
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleGenerateMealPlan}
                    className="bg-emerald-600 hover:bg-emerald-700 text-sm py-2 px-4"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Gerar Cardápio
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Cardápios */}
          <Card className="bg-white shadow-sm border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" />
                Histórico de Cardápios Salvos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MealPlanHistoryModal />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <SofiaNutritionInsights />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <UnifiedAnalysisHistory />
        </TabsContent>
      </Tabs>

      {/* Modal do Gerador de Cardápio */}
      <MealPlanGeneratorModalV2 
        open={showMealPlanGenerator} 
        onOpenChange={setShowMealPlanGenerator}
        selectedMeals={selectedMeals}
      />

      {/* Success Effect */}
      <MealPlanSuccessEffect
        isVisible={showSuccessEffect}
        onClose={() => {
          setShowSuccessEffect(false);
          setActiveTab('generator');
        }}
        mealPlanData={generatedPlan.length > 0 ? {
          type: generatedPlan.length > 1 ? 'weekly' : 'daily',
          title: `Cardápio ${generatedPlan.length > 1 ? 'Semanal' : 'Diário'} - ${new Date().toLocaleDateString('pt-BR')}`,
          summary: {
            calories: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.calories, 0) / generatedPlan.length),
            protein: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.protein, 0) / generatedPlan.length),
            carbs: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.carbs, 0) / generatedPlan.length),
            fat: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.fat, 0) / generatedPlan.length),
            fiber: Math.round(generatedPlan.reduce((acc, day) => acc + day.dailyTotals.fiber, 0) / generatedPlan.length)
          }
        } : undefined}
      />
    </div>
  );
};