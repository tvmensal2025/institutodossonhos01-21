import { useState, useEffect, useCallback } from 'react';
import { foodDatabase } from '@/data/food-database';

interface FoodItem {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  vitamins: string[];
  minerals: string[];
  healthScore: number;
  glycemicIndex?: number;
  allergens: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  quantity: number;
  unit: string;
  timestamp: Date;
}

interface NutritionAnalysis {
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  mealBalance: {
    protein: number;
    carbs: number;
    fat: number;
  };
  healthScore: number;
  recommendations: string[];
  warnings: string[];
  insights: string[];
}

interface SofiaFoodAnalysis {
  personality: string;
  analysis: string;
  recommendations: string[];
  mood: string;
  energy: string;
  nextMeal: string;
  emotionalInsights: string[];
  habitAnalysis: string[];
  motivationalMessage: string;
}

interface FoodAnalysis {
  id: string;
  user_id: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_items: FoodItem[];
  nutrition_analysis: NutritionAnalysis;
  sofia_analysis: SofiaFoodAnalysis;
  created_at: string;
  updated_at: string;
}

interface FoodPattern {
  id: string;
  user_id: string;
  pattern_type: string;
  pattern_description: string;
  confidence_score: number;
  context_data: any;
  detected_at: string;
  is_active: boolean;
}

interface FavoriteFood {
  id: string;
  user_id: string;
  food_name: string;
  food_category: string;
  nutrition_data: any;
  usage_count: number;
  last_used: string;
  created_at: string;
}

export const useFoodAnalysis = () => {
  const [analyses, setAnalyses] = useState<FoodAnalysis[]>([]);
  const [patterns, setPatterns] = useState<FoodPattern[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<FavoriteFood[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar comida na base de dados
  const searchFood = useCallback((query: string) => {
    if (!query || query.length < 2) return [];
    
    const lowerQuery = query.toLowerCase();
    const results = Object.values(foodDatabase)
      .filter(food => 
        food.name.toLowerCase().includes(lowerQuery) ||
        food.category.toLowerCase().includes(lowerQuery) ||
        food.subcategory.toLowerCase().includes(lowerQuery) ||
        food.brazilianName?.toLowerCase().includes(lowerQuery)
      )
      .slice(0, 10); // Limitar a 10 resultados
    
    return results;
  }, []);

  // Calcular análise nutricional
  const calculateNutrition = useCallback((foodItems: FoodItem[]): NutritionAnalysis => {
    const totals = foodItems.reduce((acc, item) => {
      const multiplier = item.quantity || 1;
      return {
        calories: acc.calories + (item.calories * multiplier),
        protein: acc.protein + (item.protein * multiplier),
        carbs: acc.carbs + (item.carbs * multiplier),
        fat: acc.fat + (item.fat * multiplier),
        fiber: acc.fiber + (item.fiber * multiplier),
        sugar: acc.sugar + (item.sugar * multiplier),
        sodium: acc.sodium + (item.sodium * multiplier),
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
    });

    const totalCalories = totals.calories;
    const mealBalance = {
      protein: Math.round((totals.protein * 4 / totalCalories) * 100) || 0,
      carbs: Math.round((totals.carbs * 4 / totalCalories) * 100) || 0,
      fat: Math.round((totals.fat * 9 / totalCalories) * 100) || 0,
    };

    const avgHealthScore = foodItems.length > 0 
      ? Math.round(foodItems.reduce((sum, item) => sum + item.healthScore, 0) / foodItems.length)
      : 0;

    const recommendations = [];
    const warnings = [];
    const insights = [];

    // Análise automática
    if (mealBalance.protein < 15) {
      recommendations.push('Adicione mais proteínas à sua refeição');
    }
    if (mealBalance.fat > 35) {
      warnings.push('Refeição rica em gorduras');
    }
    if (totals.sodium > 2000) {
      warnings.push('Alto teor de sódio');
    }
    if (totals.fiber < 5) {
      recommendations.push('Inclua mais fibras');
    }

    return {
      totalCalories: Math.round(totals.calories),
      totalProtein: Math.round(totals.protein),
      totalCarbs: Math.round(totals.carbs),
      totalFat: Math.round(totals.fat),
      totalFiber: Math.round(totals.fiber),
      totalSugar: Math.round(totals.sugar),
      totalSodium: Math.round(totals.sodium),
      mealBalance,
      healthScore: avgHealthScore,
      recommendations,
      warnings,
      insights
    };
  }, []);

  // Obter comida por ID
  const getFoodById = useCallback((id: string) => {
    return foodDatabase[id] || null;
  }, []);

  // Obter comidas por categoria
  const getFoodsByCategory = useCallback((category: string) => {
    return Object.values(foodDatabase)
      .filter(food => food.category === category)
      .slice(0, 20);
  }, []);

  // Buscar análises do usuário (simulado por enquanto)
  const fetchAnalyses = useCallback(async (limit = 20) => {
    try {
      setLoading(true);
      console.log('📊 Simulando busca de análises...');
      // Dados simulados por enquanto
      setAnalyses([]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Buscar padrões alimentares (simulado por enquanto)
  const fetchPatterns = useCallback(async () => {
    try {
      console.log('🔍 Simulando busca de padrões...');
      setPatterns([]);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Buscar alimentos favoritos (simulado por enquanto)
  const fetchFavoriteFoods = useCallback(async () => {
    try {
      console.log('❤️ Simulando busca de favoritos...');
      setFavoriteFoods([]);
    } catch (err: any) {
      setError(err.message);
    }
  }, []);

  // Estatísticas das análises
  const getStats = useCallback(() => {
    return {
      totalAnalyses: analyses.length,
      avgHealthScore: 0,
      avgCalories: 0,
      mealDistribution: {},
      recentAnalyses: 0,
      patterns: patterns.length,
      favoriteFoods: favoriteFoods.length,
      databaseFoods: Object.keys(foodDatabase).length
    };
  }, [analyses, patterns, favoriteFoods]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchAnalyses();
    fetchPatterns();
    fetchFavoriteFoods();
  }, [fetchAnalyses, fetchPatterns, fetchFavoriteFoods]);

  return {
    // Estado
    analyses,
    patterns,
    favoriteFoods,
    loading,
    error,
    stats: getStats(),
    
    // Métodos de busca
    searchFood,
    getFoodById,
    getFoodsByCategory,
    
    // Análise nutricional
    calculateNutrition,
    
    // Métodos de dados
    fetchAnalyses,
    fetchPatterns,
    fetchFavoriteFoods,
    
    // Base de dados
    foodDatabase
  };
};