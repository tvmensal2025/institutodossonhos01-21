import React, { useState } from 'react';
import { DetailedInstructionsButton } from './DetailedInstructionsButton';
import { DetailedMealPlanForHTML } from '@/utils/exportMealPlanDetailedHTML';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Globe, ChefHat, Clock, Target, Sparkles } from 'lucide-react';
import { openDetailedMealPlanHTML, downloadDetailedMealPlanHTML } from '@/utils/exportMealPlanDetailedHTML';

interface DetailedMealPlanViewProps {
  mealPlan: DetailedMealPlanForHTML;
  onClose: () => void;
}

export const DetailedMealPlanView: React.FC<DetailedMealPlanViewProps> = ({
  mealPlan,
  onClose
}) => {
  const [detailedInstructions, setDetailedInstructions] = useState<{ [key: string]: string }>({});

  const handleInstructionsGenerated = (recipeKey: string, detailedInstructions: string) => {
    setDetailedInstructions(prev => ({
      ...prev,
      [recipeKey]: detailedInstructions
    }));
  };

  const getMealTypeColor = (mealType: string) => {
    const type = mealType.toLowerCase();
    if (type.includes('café') || type.includes('cafe')) return 'bg-gradient-to-r from-red-500 to-orange-500';
    if (type.includes('almoço') || type.includes('almoco')) return 'bg-gradient-to-r from-teal-500 to-green-500';
    if (type.includes('lanche')) return 'bg-gradient-to-r from-yellow-400 to-orange-400';
    if (type.includes('jantar')) return 'bg-gradient-to-r from-green-400 to-teal-400';
    if (type.includes('ceia')) return 'bg-gradient-to-r from-purple-500 to-indigo-500';
    return 'bg-gradient-to-r from-gray-500 to-gray-600';
  };

  const getMealTypeIcon = (mealType: string) => {
    const type = mealType.toLowerCase();
    if (type.includes('café') || type.includes('cafe')) return '🌅';
    if (type.includes('almoço') || type.includes('almoco')) return '🌞';
    if (type.includes('lanche')) return '☕';
    if (type.includes('jantar')) return '🌙';
    if (type.includes('ceia')) return '⭐';
    return '🍽️';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
                <ChefHat className="w-6 h-6" />
                {mealPlan.dateLabel}
              </h1>
              {mealPlan.targetCaloriesKcal && (
                <p className="text-purple-100 mt-1">
                  Meta: {mealPlan.targetCaloriesKcal} kcal/dia
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => openDetailedMealPlanHTML(mealPlan)}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Globe className="w-4 h-4 mr-2" />
                Abrir HTML
              </Button>
              <Button
                onClick={() => downloadDetailedMealPlanHTML(mealPlan)}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
              <Button
                onClick={onClose}
                variant="outline"
                size="sm"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                ✕
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {mealPlan.days.map((day, dayIndex) => (
            <Card key={dayIndex} className="border-2 border-gray-100 shadow-lg">
              <CardHeader className={`${getMealTypeColor('almoço')} text-white rounded-t-lg`}>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  {day.dayName} - Dia {day.day}
                </CardTitle>
                <div className="flex gap-4 text-sm">
                  <span>Total: {day.dailyTotals.calories} kcal</span>
                  <span>Proteína: {day.dailyTotals.protein}g</span>
                  <span>Carboidratos: {day.dailyTotals.carbs}g</span>
                  <span>Gorduras: {day.dailyTotals.fat}g</span>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6">
                  {day.meals.map((meal, mealIndex) => {
                    const recipeKey = `${day.day}-${mealIndex}`;
                    const currentInstructions = detailedInstructions[recipeKey] || meal.instructions;
                    
                    return (
                      <div key={mealIndex} className="border border-gray-200 rounded-xl overflow-hidden">
                        {/* Meal Header */}
                        <div className={`${getMealTypeColor(meal.meal_type)} text-white p-4`}>
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{getMealTypeIcon(meal.meal_type)}</span>
                              <div>
                                <h3 className="font-semibold text-lg">{meal.meal_type}</h3>
                                <p className="text-sm opacity-90">{meal.recipe_name}</p>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <div className="font-semibold">{meal.calories} kcal</div>
                              <div className="opacity-90">
                                {meal.protein}g P • {meal.carbs}g C • {meal.fat}g G
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Meal Content */}
                        <div className="p-6 bg-white">
                          {/* Recipe Info */}
                          <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                Prep: {meal.prep_time}
                              </span>
                              <span className="flex items-center gap-1">
                                <ChefHat className="w-4 h-4" />
                                Cozimento: {meal.cook_time}
                              </span>
                              {meal.total_time && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  Total: {meal.total_time}
                                </span>
                              )}
                              {meal.servings && (
                                <span className="flex items-center gap-1">
                                  👥 {meal.servings}
                                </span>
                              )}
                              {meal.difficulty && (
                                <span className="flex items-center gap-1">
                                  ⭐ {meal.difficulty}
                                </span>
                              )}
                            </div>
                            {meal.tags && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {meal.tags.split(', ').map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Ingredients */}
                          <div className="mb-6">
                            <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                              <span className="w-1 h-6 bg-green-500 rounded"></span>
                              Ingredientes
                            </h4>
                            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
                              <p className="text-gray-700">{meal.ingredients}</p>
                            </div>
                          </div>

                          {/* Instructions */}
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-lg flex items-center gap-2">
                                <span className="w-1 h-6 bg-orange-500 rounded"></span>
                                Modo de Preparo
                              </h4>
                              {/* Só mostrar botão de IA se as instruções forem muito básicas */}
                              {(meal.instructions.includes('Instruções não especificadas') || 
                                meal.instructions.length < 100 || 
                                meal.instructions.split('\n').length < 3) && (
                                <DetailedInstructionsButton
                                  recipeName={meal.recipe_name}
                                  ingredients={meal.ingredients}
                                  basicInstructions={meal.instructions}
                                  prepTime={meal.prep_time}
                                  cookTime={meal.cook_time}
                                  mealType={meal.meal_type}
                                  calories={meal.calories}
                                  protein={meal.protein}
                                  carbs={meal.carbs}
                                  fat={meal.fat}
                                  onInstructionsGenerated={(detailedInstructions) => 
                                    handleInstructionsGenerated(recipeKey, detailedInstructions)
                                  }
                                />
                              )}
                            </div>
                            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
                              <div className="text-gray-700 whitespace-pre-line">
                                {currentInstructions}
                              </div>
                            </div>
                          </div>

                          {/* Source Badge */}
                          <div className="flex justify-end">
                            <Badge variant="outline" className="text-xs">
                              Receita TACO
                            </Badge>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
