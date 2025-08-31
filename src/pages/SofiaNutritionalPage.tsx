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
  Apple, 
  BarChart3,
  ChefHat,
  Lightbulb,
  Zap,
  UtensilsCrossed,
  History,
  Plus,
  Brain,
  AlertTriangle,
  Award,
  Sparkles,
  Activity,
  Heart,
  Flame
} from 'lucide-react';

import { MealPlanGeneratorModal } from '@/components/nutrition-tracking/MealPlanGeneratorModal';
import { MealPlanHistoryModal } from '@/components/meal-plan/MealPlanHistoryModal';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';
import { findSuperfoods, findFoodsByDiet } from '@/data/open-nutri-tracker-database';
import { calculateBMR, calculateTDEE, NutritionObjective } from '@/utils/macro-calculator';

import { SofiaNutritionInsights } from '@/components/sofia/SofiaNutritionInsights';
import { NutritionAIAnalytics } from '@/components/nutrition/NutritionAIAnalytics';

export const SofiaNutritionalPage: React.FC = () => {
  const { 
    meals, 
    goals, 
    loading, 
    error, 
    objective,
    physicalData,
    getDailyNutrition, 
    getNutritionStats, 
    updateObjective,
    loadGoals
  } = useNutritionTracking();
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [activeTab, setActiveTab] = useState('nutricao');
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  
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
    setGeneratorModalOpen(true);
  };

  // Calcular distribuição de calorias baseada nas refeições selecionadas
  const getCalorieDistribution = () => {
    const selectedMealTypes = Object.keys(selectedMeals).filter(meal => selectedMeals[meal as keyof typeof selectedMeals]);
    const totalMeals = selectedMealTypes.length;
    
    if (totalMeals === 0) return {};
    
    // Distribuição padrão para 5 refeições
    const defaultDistribution = {
      'café da manhã': 0.25,
      'almoço': 0.35,
      'lanche': 0.15,
      'jantar': 0.20,
      'ceia': 0.05
    };
    
    // Recalcular distribuição baseada nas refeições selecionadas
    const distribution: { [key: string]: number } = {};
    let totalPercentage = 0;
    
    selectedMealTypes.forEach(mealType => {
      totalPercentage += defaultDistribution[mealType as keyof typeof defaultDistribution] || 0;
    });
    
    // Normalizar para 100%
    selectedMealTypes.forEach(mealType => {
      const originalPercentage = defaultDistribution[mealType as keyof typeof defaultDistribution] || 0;
      distribution[mealType] = originalPercentage / totalPercentage;
    });
    
    return distribution;
  };

  const stats = getNutritionStats(7);
  const dailyNutrition = getDailyNutrition(selectedDate);
  const superfoods = findSuperfoods();
  const ketoFoods = findFoodsByDiet('keto');

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-purple-50 p-3 sm:p-4">
      {/* Top Banner simplificado (sem perfil/host) */}
      <div className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 text-white text-center">
        <h1 className="text-xl sm:text-2xl font-bold">Ψ Sofia Nutricional</h1>
        <p className="text-emerald-100 mt-1 text-sm sm:text-base">Planejamento inteligente com garantia de metas</p>
      </div>

      {/* Nutritional Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Calorias</h3>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 truncate">{dailyNutrition.totalCalories}</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1 truncate">Meta: {goals.calories} kcal</div>
            <Progress value={Math.min(dailyNutrition.progress.calories, 100)} className="mt-2 h-2 sm:h-3 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Proteínas</h3>
              <Apple className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 truncate">{dailyNutrition.totalProtein}g</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1 truncate">Meta: {goals.protein}g</div>
            <Progress value={Math.min(dailyNutrition.progress.protein, 100)} className="mt-2 h-2 sm:h-3 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Carboidratos</h3>
              <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 truncate">{dailyNutrition.totalCarbs}g</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1 truncate">Meta: {goals.carbs}g</div>
            <Progress value={Math.min(dailyNutrition.progress.carbs, 100)} className="mt-2 h-2 sm:h-3 bg-gray-100" />
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border-0">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs sm:text-sm font-medium text-gray-600">Gorduras</h3>
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
            </div>
            <div className="text-lg sm:text-xl font-bold text-gray-900 truncate">{dailyNutrition.totalFat}g</div>
            <div className="text-xs sm:text-sm text-gray-500 mt-1 truncate">Meta: {goals.fat}g</div>
            <Progress value={Math.min(dailyNutrition.progress.fat, 100)} className="mt-2 h-2 sm:h-3 bg-gray-100" />
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-4 sm:mb-6">
          <TabsTrigger value="nutricao" className="text-xs px-1 sm:px-2">Nutrição</TabsTrigger>
          <TabsTrigger value="metas" className="text-xs px-1 sm:px-2">Metas</TabsTrigger>
          <TabsTrigger value="cardapio" className="text-xs px-1 sm:px-2">Cardápio</TabsTrigger>
          <TabsTrigger value="estatisticas" className="text-xs px-1 sm:px-2">Stats</TabsTrigger>
          <TabsTrigger value="insights" className="text-xs px-1 sm:px-2">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="nutricao" className="space-y-4 sm:space-y-6">
          {/* IA Nutricional Analytics */}
          <div className="space-y-6">
            {/* Score Principal */}
            <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 text-white border-0 overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                      <Brain className="w-8 h-8" />
                      IA Nutricional Sofia
                    </h2>
                    <p className="text-white/90 mb-4">Análise personalizada em tempo real</p>
                    <Badge className="bg-white/20 text-white border-white/30">
                      📈 Melhorando esta semana
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="text-5xl font-bold">87</div>
                    <div className="text-white/80">Score Geral</div>
                  </div>
                </div>
                <Progress value={87} className="mt-4 bg-white/20" />
              </CardContent>
            </Card>

            {/* Métricas Rápidas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-2 border-green-200 bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-green-800">Proteínas</span>
                    <TrendingUp className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-green-900">95%</div>
                  <div className="text-sm text-green-600">Meta atingida!</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-yellow-200 bg-yellow-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-yellow-800">Hidratação</span>
                    <Activity className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">60%</div>
                  <div className="text-sm text-yellow-600">Precisa melhorar</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-blue-800">Variedade</span>
                    <Target className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-900">78%</div>
                  <div className="text-sm text-blue-600">Bom progresso</div>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 bg-purple-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-800">Qualidade</span>
                    <Award className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-purple-900">85%</div>
                  <div className="text-sm text-purple-600">Excelente!</div>
                </CardContent>
              </Card>
            </div>

            {/* Insights da IA */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Insights Personalizados
                  </div>
                  <Button variant="outline" size="sm">
                    <Brain className="w-4 h-4 mr-2" />
                    Nova Análise
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg border border-green-200 bg-green-50">
                  <div className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-green-800 mb-1">Parabéns! Meta de proteína atingida 💪</h4>
                      <p className="text-sm text-green-700">Você está consumindo a quantidade ideal de proteínas. Isso ajuda na recuperação muscular e controle da saciedade.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-1">Atenção: Hidratação baixa</h4>
                      <p className="text-sm text-yellow-700">Você precisa beber mais água. Tente adicionar 2-3 copos extras hoje para melhorar sua performance.</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-1">Dica personalizada</h4>
                      <p className="text-sm text-blue-700">Baseado no seu perfil, adicione abacate no lanche da tarde para melhorar a absorção de vitaminas lipossolúveis.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ações Recomendadas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-500" />
                  Ações Para Hoje
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <Flame className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <h5 className="font-medium text-green-800">Beber 500ml de água agora</h5>
                    <p className="text-sm text-green-600">Para atingir sua meta de hidratação</p>
                  </div>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    Feito!
                  </Button>
                </div>

                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Heart className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <h5 className="font-medium text-blue-800">Incluir vegetais no jantar</h5>
                    <p className="text-sm text-blue-600">Para aumentar variedade nutricional</p>
                  </div>
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">
                    Planejar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cardapio" className="space-y-4 sm:space-y-6">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
                <UtensilsCrossed className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                Cardápio Semanal
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Gera 7 dias respeitando suas metas
              </p>
            </CardHeader>
            <CardContent className="mobile-padding space-y-6">
              {/* Checkboxes das refeições */}
              <div className="space-y-3">
                <h3 className="font-medium text-foreground">Refeições incluídas:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div 
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedMeals['café da manhã'] 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => toggleMealSelection('café da manhã')}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      selectedMeals['café da manhã'] 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-300'
                    }`}>
                      {selectedMeals['café da manhã'] && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-sm">Café da manhã</span>
                  </div>
                  
                  <div 
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedMeals['almoço'] 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => toggleMealSelection('almoço')}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      selectedMeals['almoço'] 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-300'
                    }`}>
                      {selectedMeals['almoço'] && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-sm">Almoço</span>
                  </div>
                  
                  <div 
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedMeals['lanche'] 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => toggleMealSelection('lanche')}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      selectedMeals['lanche'] 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-300'
                    }`}>
                      {selectedMeals['lanche'] && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-sm">Lanche</span>
                  </div>
                  
                  <div 
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedMeals['jantar'] 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => toggleMealSelection('jantar')}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      selectedMeals['jantar'] 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-300'
                    }`}>
                      {selectedMeals['jantar'] && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-sm">Jantar</span>
                  </div>
                  
                  <div 
                    className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors ${
                      selectedMeals['ceia'] 
                        ? 'bg-emerald-50 border border-emerald-200' 
                        : 'bg-gray-50 border border-gray-200'
                    }`}
                    onClick={() => toggleMealSelection('ceia')}
                  >
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                      selectedMeals['ceia'] 
                        ? 'bg-emerald-500' 
                        : 'bg-gray-300'
                    }`}>
                      {selectedMeals['ceia'] && (
                        <div className="w-2 h-2 rounded-full bg-white"></div>
                      )}
                    </div>
                    <span className="text-sm">Ceia</span>
                  </div>
                </div>
                
                {/* Informação sobre distribuição de calorias */}
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-xs text-blue-700">
                    <strong>Distribuição de calorias:</strong> {Object.keys(selectedMeals).filter(meal => selectedMeals[meal as keyof typeof selectedMeals]).length} refeições selecionadas
                  </p>
                  {Object.keys(selectedMeals).filter(meal => selectedMeals[meal as keyof typeof selectedMeals]).length > 0 && (
                    <div className="mt-2 text-xs text-blue-600">
                      {Object.entries(getCalorieDistribution()).map(([meal, percentage]) => (
                        <div key={meal} className="flex justify-between">
                          <span>{meal}:</span>
                          <span>{Math.round(percentage * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button 
                  onClick={handleGenerateMealPlan}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white"
                >
                  Gerar Cardápio
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setHistoryModalOpen(true)}
                  className="flex-1"
                >
                  Abrir Cardápio
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                >
                  Abrir Cardápio (Clínico)
                </Button>
              </div>

              {/* Status */}
              <div className="text-center py-8 text-muted-foreground">
                Nenhum cardápio gerado ainda.
              </div>

              {/* Histórico de cardápios */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-foreground">Histórico de cardápios salvos</h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setHistoryModalOpen(true)}
                  >
                    <History className="w-4 h-4 mr-2" />
                    Ver Histórico
                  </Button>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>20/08/2025</span>
                    <span>2000 kcal</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>20/08/2025</span>
                    <span>2000 kcal</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>19/08/2025</span>
                    <span>2000 kcal</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b">
                    <span>19/08/2025</span>
                    <span>2000 kcal</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span>19/08/2025</span>
                    <span>2000 kcal</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estatisticas" className="space-y-4 sm:space-y-6">
          <Card className="bg-white shadow-sm border-0">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
                <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                Estatísticas Nutricionais
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-center py-8 text-muted-foreground">
                Estatísticas em desenvolvimento...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4 sm:space-y-6">
          <SofiaNutritionInsights />
        </TabsContent>

        <TabsContent value="metas" className="space-y-4 sm:space-y-6">
          {/* Calculadora Metabólica */}
          <Card className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                Calculadora Metabólica Sofia
              </CardTitle>
              <p className="text-white/90">Metas baseadas no seu metabolismo e objetivos</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Dados Físicos */}
              {(physicalData as any).peso_kg && (
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">📊 Seus Dados Físicos</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-white/70">Peso:</span>
                      <div className="font-semibold">{(physicalData as any).peso_kg} kg</div>
                    </div>
                    {physicalData.altura_cm && (
                      <div>
                        <span className="text-white/70">Altura:</span>
                        <div className="font-semibold">{physicalData.altura_cm} cm</div>
                      </div>
                    )}
                    {physicalData.idade && (
                      <div>
                        <span className="text-white/70">Idade:</span>
                        <div className="font-semibold">{physicalData.idade} anos</div>
                      </div>
                    )}
                    {physicalData.sexo && (
                      <div>
                        <span className="text-white/70">Sexo:</span>
                        <div className="font-semibold">{physicalData.sexo}</div>
                      </div>
                    )}
                    {physicalData.nivel_atividade && (
                      <div>
                        <span className="text-white/70">Atividade:</span>
                        <div className="font-semibold">{physicalData.nivel_atividade}</div>
                      </div>
                    )}
                   </div>
                </div>
              )}
              {(physicalData as any).peso_kg && (physicalData as any).altura_cm && (physicalData as any).idade && (physicalData as any).sexo && (
                <div className="bg-white/10 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">🧮 Cálculos Metabólicos</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="text-white/70 block">TMB (Metabolismo Basal):</span>
                      <div className="font-semibold text-lg text-yellow-200">
                        {calculateBMR(
                          (physicalData as any).peso_kg,
                          (physicalData as any).altura_cm,
                          (physicalData as any).idade,
                          (physicalData as any).sexo
                        )} kcal/dia
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        Fórmula Mifflin-St Jeor
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-lg p-3">
                      <span className="text-white/70 block">TDEE (Gasto Total):</span>
                      <div className="font-semibold text-lg text-green-200">
                        {calculateTDEE({
                          peso_kg: (physicalData as any).peso_kg,
                          altura_cm: physicalData.altura_cm,
                          idade: physicalData.idade,
                          sexo: physicalData.sexo,
                          nivel_atividade: physicalData.nivel_atividade
                        })} kcal/dia
                      </div>
                      <div className="text-xs text-white/60 mt-1">
                        TMB × Fator de Atividade
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Seletor de Objetivo */}
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-semibold mb-3">🎯 Seu Objetivo Nutricional</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.values(NutritionObjective).map((obj) => (
                    <button
                      key={obj}
                      onClick={() => updateObjective(obj)}
                      className={`p-3 rounded-lg text-left transition-colors ${
                        objective === obj
                          ? 'bg-white text-purple-600 font-semibold'
                          : 'bg-white/20 hover:bg-white/30'
                      }`}
                    >
                      <div className="text-sm">
                        {obj === NutritionObjective.LOSE && '🔥 Perder Peso (-20% TDEE)'}
                        {obj === NutritionObjective.MAINTAIN && '⚖️ Manter Peso (100% TDEE)'}
                        {obj === NutritionObjective.GAIN && '📈 Ganhar Peso (+10% TDEE)'}
                        {obj === NutritionObjective.LEAN_MASS && '💪 Massa Muscular (+15% TDEE)'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Metas Calculadas com Detalhes */}
              <div className="bg-white/10 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">📋 Suas Metas Calculadas</h3>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="text-white hover:bg-white/20"
                    onClick={() => loadGoals()}
                  >
                    🔄 Recalcular
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-300">{goals.calories}</div>
                    <div className="text-xs text-white/70">Calorias/dia</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-300">{goals.protein}g</div>
                    <div className="text-xs text-white/70">Proteínas</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-orange-300">{goals.carbs}g</div>
                    <div className="text-xs text-white/70">Carboidratos</div>
                  </div>
                  <div className="text-center bg-white/10 rounded-lg p-3">
                    <div className="text-2xl font-bold text-red-300">{goals.fat}g</div>
                    <div className="text-xs text-white/70">Gorduras</div>
                  </div>
                </div>

                {(physicalData as any).peso_kg && (
                  <div className="text-xs text-white/60 space-y-1">
                    <div>• Proteína: {(goals.protein / (physicalData as any).peso_kg).toFixed(1)}g por kg de peso corporal</div>
                    <div>• Gordura: {(goals.fat / (physicalData as any).peso_kg).toFixed(1)}g por kg de peso corporal</div>
                    <div>• Carboidratos: calculados para completar as calorias restantes</div>
                  </div>
                )}
              </div>

              {!(physicalData as any).peso_kg && (
                <div className="bg-yellow-500/20 border border-yellow-400/30 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-yellow-300 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-yellow-200">Complete seus dados físicos para cálculos precisos</h4>
                      <p className="text-sm text-yellow-300/90 mt-1">
                        Para cálculos baseados no seu metabolismo real, complete seu perfil com peso, altura, idade, sexo e nível de atividade.
                      </p>
                      <p className="text-xs text-yellow-400/80 mt-2">
                        ⚠️ Sem estes dados, as metas usam valores padrão genéricos que podem estar incorretos para você.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 bg-white/20 border-white/30 text-white hover:bg-white/30"
                        onClick={() => window.location.href = '/profile'}
                      >
                        Completar Perfil Agora
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <MealPlanGeneratorModal
        open={generatorModalOpen}
        onOpenChange={setGeneratorModalOpen}
        selectedMeals={selectedMeals}
      />
      
      {historyModalOpen && <MealPlanHistoryModal />}
    </div>
  );
};
