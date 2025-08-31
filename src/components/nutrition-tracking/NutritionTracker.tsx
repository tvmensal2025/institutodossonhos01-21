import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar, 
  Target, 
  TrendingUp, 
  Apple, 
  Activity,
  Plus,
  Search,
  Filter,
  ChefHat,
  Coffee,
  Utensils,
  Pizza,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';

import { 
  openNutriTrackerDatabase, 
  findFoodByName, 
  findFoodsByCategory,
  findSuperfoods,
  findFoodsByDiet,
  calculateNutritionalScore,
  getNutritionalBenefits,
  type OpenNutriTrackerFood 
} from '@/data/open-nutri-tracker-database';

interface MealEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: Array<{
    food: OpenNutriTrackerFood;
    quantity: number;
    unit: string;
  }>;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
}

interface NutritionGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export const NutritionTracker: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDiet, setSelectedDiet] = useState<string>('all');
  const [showAddFood, setShowAddFood] = useState(false);
  const [selectedFood, setSelectedFood] = useState<OpenNutriTrackerFood | null>(null);
  const [foodQuantity, setFoodQuantity] = useState(100);
  const [foodUnit, setFoodUnit] = useState('g');


  // Metas nutricionais padrão (pode ser personalizada por usuário)
  const defaultGoals: NutritionGoals = {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 65,
    fiber: 25
  };

  const [goals] = useState<NutritionGoals>(defaultGoals);

  // Filtrar alimentos baseado na busca e filtros
  const filteredFoods = openNutriTrackerDatabase.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         food.brazilianName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    const matchesDiet = selectedDiet === 'all' || 
                       (selectedDiet === 'keto' && food.keto) ||
                       (selectedDiet === 'vegan' && food.vegan) ||
                       (selectedDiet === 'paleo' && food.paleo);
    
    return matchesSearch && matchesCategory && matchesDiet;
  });

  // Calcular totais do dia
  const dailyTotals = meals.reduce((totals, meal) => {
    if (meal.date === selectedDate) {
      totals.calories += meal.totalCalories;
      totals.protein += meal.totalProtein;
      totals.carbs += meal.totalCarbs;
      totals.fat += meal.totalFat;
      totals.fiber += meal.totalFiber;
    }
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 });

  // Calcular progresso
  const progress = {
    calories: Math.min((dailyTotals.calories / goals.calories) * 100, 100),
    protein: Math.min((dailyTotals.protein / goals.protein) * 100, 100),
    carbs: Math.min((dailyTotals.carbs / goals.carbs) * 100, 100),
    fat: Math.min((dailyTotals.fat / goals.fat) * 100, 100),
    fiber: Math.min((dailyTotals.fiber / goals.fiber) * 100, 100)
  };

  const addFoodToMeal = (mealType: MealEntry['mealType']) => {
    if (!selectedFood) return;

    const factor = foodQuantity / 100; // Converter para porção
    const newMeal: MealEntry = {
      id: Date.now().toString(),
      date: selectedDate,
      mealType,
      foods: [{
        food: selectedFood,
        quantity: foodQuantity,
        unit: foodUnit
      }],
      totalCalories: Math.round(selectedFood.calories * factor),
      totalProtein: Math.round(selectedFood.protein * factor * 10) / 10,
      totalCarbs: Math.round(selectedFood.carbs * factor * 10) / 10,
      totalFat: Math.round(selectedFood.fat * factor * 10) / 10,
      totalFiber: Math.round(selectedFood.fiber * factor * 10) / 10
    };

    setMeals(prev => [...prev, newMeal]);
    setShowAddFood(false);
    setSelectedFood(null);
    setFoodQuantity(100);
  };

  const getMealsByType = (mealType: MealEntry['mealType']) => {
    return meals.filter(meal => meal.date === selectedDate && meal.mealType === mealType);
  };

  const getMealTypeLabel = (mealType: MealEntry['mealType']) => {
    switch (mealType) {
      case 'breakfast': return 'Café da Manhã';
      case 'lunch': return 'Almoço';
      case 'dinner': return 'Jantar';
      case 'snack': return 'Lanche';
      default: return mealType;
    }
  };

  const getMealIcon = (mealType: MealEntry['mealType']) => {
    switch (mealType) {
      case 'breakfast': return <Coffee className="w-5 h-5" />;
      case 'lunch': return <Utensils className="w-5 h-5" />;
      case 'dinner': return <ChefHat className="w-5 h-5" />;
      case 'snack': return <Pizza className="w-5 h-5" />;
      default: return <Apple className="w-5 h-5" />;
    }
  };

  const categories = Array.from(new Set(openNutriTrackerDatabase.map(food => food.category)));

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="text-center sm:text-left">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center justify-center sm:justify-start gap-2">
            <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-500" />
            Rastreador Nutricional
          </h2>
          <p className="text-sm sm:text-base text-gray-600">Monitore sua alimentação e atinja suas metas</p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => setShowAddFood(true)}
            className="bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Adicionar Alimento</span>
            <span className="sm:hidden">Adicionar</span>
          </Button>
        </div>
      </div>

      {/* Resumo do Dia */}
      <Card className="bg-gradient-to-r from-emerald-50 to-purple-50 border-0 shadow-sm">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center justify-center gap-2 text-gray-800 text-lg sm:text-xl">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
            Resumo do Dia - {new Date(selectedDate).toLocaleDateString('pt-BR')}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 truncate">Calorias</span>
                <span className="font-medium text-xs sm:text-sm min-w-0 flex-shrink-0">{dailyTotals.calories} / {goals.calories}</span>
              </div>
              <Progress value={progress.calories} className="h-2 bg-white" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 truncate">Proteínas</span>
                <span className="font-medium text-xs sm:text-sm min-w-0 flex-shrink-0">{dailyTotals.protein}g / {goals.protein}g</span>
              </div>
              <Progress value={progress.protein} className="h-2 bg-white" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 truncate">Carboidratos</span>
                <span className="font-medium text-xs sm:text-sm min-w-0 flex-shrink-0">{dailyTotals.carbs}g / {goals.carbs}g</span>
              </div>
              <Progress value={progress.carbs} className="h-2 bg-white" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 truncate">Gorduras</span>
                <span className="font-medium text-xs sm:text-sm min-w-0 flex-shrink-0">{dailyTotals.fat}g / {goals.fat}g</span>
              </div>
              <Progress value={progress.fat} className="h-2 bg-white" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span className="text-gray-600 truncate">Fibras</span>
                <span className="font-medium text-xs sm:text-sm min-w-0 flex-shrink-0">{dailyTotals.fiber}g / {goals.fiber}g</span>
              </div>
              <Progress value={progress.fiber} className="h-2 bg-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Refeições */}
      <Tabs defaultValue="breakfast" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm">
          <TabsTrigger value="breakfast" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3">
            <Coffee className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Café</span>
            <span className="sm:hidden">Café</span>
          </TabsTrigger>
          <TabsTrigger value="lunch" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3">
            <Utensils className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Almoço</span>
            <span className="sm:hidden">Almoço</span>
          </TabsTrigger>
          <TabsTrigger value="dinner" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3">
            <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Jantar</span>
            <span className="sm:hidden">Jantar</span>
          </TabsTrigger>
          <TabsTrigger value="snack" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-500 data-[state=active]:to-purple-600 data-[state=active]:text-white text-xs sm:text-sm px-2 sm:px-3">
            <Pizza className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Lanche</span>
            <span className="sm:hidden">Lanche</span>
          </TabsTrigger>
        </TabsList>

        {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(mealType => (
          <TabsContent key={mealType} value={mealType} className="space-y-4">
            <Card className="bg-white shadow-sm border-0">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <span className="flex items-center justify-center sm:justify-start gap-2">
                    {getMealIcon(mealType)}
                    <span className="text-lg sm:text-xl">{getMealTypeLabel(mealType)}</span>
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setShowAddFood(true)}
                    className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                {getMealsByType(mealType).length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-emerald-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      {getMealIcon(mealType)}
                    </div>
                    <p className="text-sm sm:text-base text-gray-500">
                      Nenhum alimento registrado para esta refeição
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {getMealsByType(mealType).map(meal => (
                      <div key={meal.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                          {meal.foods[0].food.imageUrl ? (
                            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-200">
                              <img 
                                src={meal.foods[0].food.imageUrl} 
                                alt={meal.foods[0].food.brazilianName || meal.foods[0].food.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback para ícone se a imagem falhar
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                }}
                              />
                              <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-full flex items-center justify-center hidden">
                                <Apple className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-purple-600 rounded-full flex items-center justify-center">
                              <Apple className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {meal.foods[0].food.brazilianName || meal.foods[0].food.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {meal.foods[0].quantity}{meal.foods[0].unit} • {meal.totalCalories} kcal
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                            P: {meal.totalProtein}g
                          </Badge>
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            C: {meal.totalCarbs}g
                          </Badge>
                          <Badge variant="secondary" className="bg-red-100 text-red-700">
                            G: {meal.totalFat}g
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Modal de Adicionar Alimento */}
      {showAddFood && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" />
                Adicionar Alimento
              </h2>
              <Button variant="ghost" onClick={() => setShowAddFood(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </Button>
            </div>

            {/* Busca e Filtros */}
            <div className="space-y-4 mb-4 sm:mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Label htmlFor="search" className="text-sm font-medium text-gray-700">Buscar alimento</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder="Digite o nome do alimento..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="category" className="text-sm font-medium text-gray-700">Categoria</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="mt-1 border-gray-200 focus:border-emerald-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="diet" className="text-sm font-medium text-gray-700">Dieta</Label>
                    <Select value={selectedDiet} onValueChange={setSelectedDiet}>
                      <SelectTrigger className="mt-1 border-gray-200 focus:border-emerald-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="vegan">Vegana</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Alimentos */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filteredFoods.map(food => (
                <div
                  key={food.id}
                  className={`p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedFood?.id === food.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedFood(food)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {food.imageUrl ? (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                          <img 
                            src={food.imageUrl} 
                            alt={food.brazilianName || food.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-purple-100 rounded-lg flex items-center justify-center hidden">
                            <Apple className="w-6 h-6 text-emerald-600" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-purple-100 rounded-lg flex items-center justify-center">
                          <Apple className="w-6 h-6 text-emerald-600" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-gray-800">
                            {food.brazilianName || food.name}
                          </p>
                          {food.superfood && (
                            <Badge variant="outline" className="text-xs bg-gradient-to-r from-emerald-100 to-purple-100 border-emerald-200">
                              <Star className="w-3 h-3 mr-1" />
                              Super
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {food.calories} kcal • P: {food.protein}g • C: {food.carbs}g • G: {food.fat}g
                        </p>
                        <div className="flex gap-1 mt-2">
                          {getNutritionalBenefits(food).slice(0, 3).map(benefit => (
                            <Badge key={benefit} variant="outline" className="text-xs bg-white">
                              {benefit}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="bg-gradient-to-r from-emerald-100 to-purple-100 text-emerald-700">
                        Score: {calculateNutritionalScore(food)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quantidade e Unidade */}
            {selectedFood && (
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">Quantidade</Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={foodQuantity}
                      onChange={(e) => setFoodQuantity(Number(e.target.value))}
                      min="1"
                      className="mt-1 border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="unit" className="text-sm font-medium text-gray-700">Unidade</Label>
                    <Select value={foodUnit} onValueChange={setFoodUnit}>
                      <SelectTrigger className="mt-1 border-gray-200 focus:border-emerald-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedFood.commonUnits.map(unit => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Botões de Adicionar */}
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => addFoodToMeal('breakfast')}
                    className="bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white text-sm"
                  >
                    <Coffee className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Café da Manhã</span>
                    <span className="sm:hidden">Café</span>
                  </Button>
                  <Button 
                    onClick={() => addFoodToMeal('lunch')}
                    className="bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white text-sm"
                  >
                    <Utensils className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Almoço</span>
                    <span className="sm:hidden">Almoço</span>
                  </Button>
                  <Button 
                    onClick={() => addFoodToMeal('dinner')}
                    className="bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white text-sm"
                  >
                    <ChefHat className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Jantar</span>
                    <span className="sm:hidden">Jantar</span>
                  </Button>
                  <Button 
                    onClick={() => addFoodToMeal('snack')}
                    className="bg-gradient-to-r from-emerald-500 to-purple-600 hover:from-emerald-600 hover:to-purple-700 text-white text-sm"
                  >
                    <Pizza className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Lanche</span>
                    <span className="sm:hidden">Lanche</span>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}


    </div>
  );
};
