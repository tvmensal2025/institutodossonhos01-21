import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Camera, 
  Upload, 
  Utensils, 
  Apple, 
  Carrot, 
  Beef, 
  Fish, 
  Milk, 
  Croissant,
  Coffee,
  Search,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Info,
  Zap,
  Target,
  TrendingUp,
  Heart,
  Brain,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getCharacterImageUrl } from '@/lib/character-images';
import { useFoodAnalysis } from '@/hooks/useFoodAnalysis';
import { foodDatabase, searchFood, getFoodsByCategory, getCategories } from '@/data/food-database';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

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

interface SofiaAnalysis {
  personality: string;
  analysis: string;
  recommendations: string[];
  mood: string;
  energy: string;
  nextMeal: string;
  emotionalInsights?: string[];
  habitAnalysis?: string[];
  motivationalMessage?: string;
  nutritionalDetails?: {
    proteins: string[];
    carbs: string[];
    fats: string[];
    vitamins: string[];
    minerals: string[];
  };
  followUpQuestion?: string;
  dailyContext?: {
    shouldAskAboutPreviousMeals: boolean;
    estimatedDailyProgress: string;
  };
}

export const FoodAnalysisSystem: React.FC = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [currentMeal, setCurrentMeal] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<NutritionAnalysis | null>(null);
  const [sofiaAnalysis, setSofiaAnalysis] = useState<SofiaAnalysis | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Hook para análise de comida
  const {
    analyses,
    patterns,
    favoriteFoods,
    loading: hookLoading,
    error: hookError,
    stats,
    // analyzeFood, // Removido temporariamente
    // addToFavorites, // Removido temporariamente
    // detectPatterns // Removido temporariamente
  } = useFoodAnalysis();

  const { user } = useAuth();

  // Categorias de alimentos dinâmicas
  const categories = getCategories();
  const foodCategories = categories.map(category => {
    const iconMap: Record<string, any> = {
      'Frutas': Apple,
      'Verduras': Carrot,
      'Proteínas': Beef,
      'Laticínios': Milk,
      'Carboidratos': Croissant,
      'Oleaginosas': Coffee,
      'Bebidas': Coffee,
      'Doces': Coffee,
      'Condimentos': Coffee
    };
    
    return {
      name: category,
      icon: iconMap[category] || Coffee,
      color: 'text-purple-600'
    };
  });

  // Usar a base de dados expandida
  const foodDatabaseExpanded = foodDatabase;

  const addFoodItem = (foodName: string, quantity: number = 1, unit: string = 'unidade') => {
    // Buscar na base de dados expandida
    const searchResults = searchFood(foodName);
    if (searchResults.length === 0) return;

    const foodData = searchResults[0]; // Pegar o primeiro resultado

    const newFoodItem: FoodItem = {
      id: Date.now().toString(),
      name: foodData.name,
      category: foodData.category,
      calories: foodData.calories,
      protein: foodData.protein,
      carbs: foodData.carbs,
      fat: foodData.fat,
      fiber: foodData.fiber,
      sugar: foodData.sugar,
      sodium: foodData.sodium,
      vitamins: foodData.vitamins,
      minerals: foodData.minerals,
      healthScore: foodData.healthScore,
      glycemicIndex: foodData.glycemicIndex,
      allergens: foodData.allergens,
      mealType: currentMeal,
      quantity,
      unit,
      timestamp: new Date()
    };

    setFoodItems(prev => [...prev, newFoodItem]);
  };

  const removeFoodItem = (id: string) => {
    setFoodItems(prev => prev.filter(item => item.id !== id));
  };

  const calculateNutrition = (): NutritionAnalysis => {
    if (foodItems.length === 0) {
      return {
        totalCalories: 0,
        totalProtein: 0,
        totalCarbs: 0,
        totalFat: 0,
        totalFiber: 0,
        totalSugar: 0,
        totalSodium: 0,
        mealBalance: { protein: 0, carbs: 0, fat: 0 },
        healthScore: 0,
        recommendations: [],
        warnings: [],
        insights: []
      };
    }

    const totals = foodItems.reduce((acc, item) => ({
      calories: acc.calories + (item.calories * item.quantity),
      protein: acc.protein + (item.protein * item.quantity),
      carbs: acc.carbs + (item.carbs * item.quantity),
      fat: acc.fat + (item.fat * item.quantity),
      fiber: acc.fiber + (item.fiber * item.quantity),
      sugar: acc.sugar + (item.sugar * item.quantity),
      sodium: acc.sodium + (item.sodium * item.quantity)
    }), {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0
    });

    const totalCalories = totals.calories;
    const mealBalance = {
      protein: totalCalories > 0 ? (totals.protein * 4 / totalCalories) * 100 : 0,
      carbs: totalCalories > 0 ? (totals.carbs * 4 / totalCalories) * 100 : 0,
      fat: totalCalories > 0 ? (totals.fat * 9 / totalCalories) * 100 : 0
    };

    const avgHealthScore = foodItems.reduce((sum, item) => sum + item.healthScore, 0) / foodItems.length;

    const recommendations = [];
    const warnings = [];
    const insights = [];

    // Análise de proteína
    if (mealBalance.protein < 15) {
      recommendations.push('Considere adicionar mais proteínas para melhor saciedade');
    } else if (mealBalance.protein > 35) {
      warnings.push('Alto teor de proteína - mantenha hidratação adequada');
    }

    // Análise de carboidratos
    if (mealBalance.carbs > 65) {
      recommendations.push('Considere reduzir carboidratos e adicionar mais proteínas');
    }

    // Análise de fibras
    if (totals.fiber < 5) {
      recommendations.push('Adicione mais fibras para melhor digestão');
    }

    // Análise de açúcar
    if (totals.sugar > 25) {
      warnings.push('Alto teor de açúcar - considere opções mais naturais');
    }

    // Análise de sódio
    if (totals.sodium > 500) {
      warnings.push('Alto teor de sódio - evite sal adicional');
    }

    // Insights positivos
    if (avgHealthScore > 80) {
      insights.push('Excelente escolha de alimentos nutritivos!');
    }
    if (totals.fiber > 8) {
      insights.push('Ótima quantidade de fibras para saúde digestiva');
    }

    return {
      totalCalories: totals.calories,
      totalProtein: totals.protein,
      totalCarbs: totals.carbs,
      totalFat: totals.fat,
      totalFiber: totals.fiber,
      totalSugar: totals.sugar,
      totalSodium: totals.sodium,
      mealBalance,
      healthScore: avgHealthScore,
      recommendations,
      warnings,
      insights
    };
  };

  const analyzeWithSofia = async () => {
    setIsAnalyzing(true);
    
    try {
      const nutrition = calculateNutrition();
      setAnalysis(nutrition);

      // Usar o hook para análise com IA
      // Análise simples por enquanto
      // Simular análise da Sofia
      setSofiaAnalysis({
        personality: 'amigável',
        analysis: 'Sua refeição está bem balanceada! Vejo uma boa combinação de nutrientes.',
        recommendations: ['Continue com essas escolhas saudáveis', 'Considere beber mais água'],
        mood: 'positivo',
        energy: 'alto',
        nextMeal: 'aguardar_proxima_refeicao'
      });

    } catch (error) {
      console.error('Erro na análise:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    
    try {
      // 1. Upload da imagem para o Supabase Storage
      const fileName = `food-analysis/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error('Erro ao fazer upload da imagem');
      }

      // 2. Obter URL pública da imagem
      const { data: { publicUrl } } = supabase.storage
        .from('chat-images')
        .getPublicUrl(fileName);

      console.log('📸 Imagem enviada:', publicUrl);

      // 3. Chamar função de análise da SOFIA
      console.log('🔍 Chamando sofia-image-analysis...');
      const { data: analysisData, error: analysisError } = await supabase.functions.invoke('sofia-image-analysis', {
        body: {
          imageUrl: publicUrl,
          userId: user?.id || 'anonymous',
          userContext: {
            currentMeal,
            message: `Análise de ${currentMeal}`,
            foodItems: foodItems.length
          }
        }
      });
      
      console.log('📥 Resposta da SOFIA:', analysisData);

      if (analysisError) {
        console.error('Erro na análise:', analysisError);
        throw new Error('Erro na análise da imagem');
      }

      console.log('✅ Análise da SOFIA:', analysisData);

      // 4. Processar resultados
      if (analysisData && analysisData.success) {
        const { food_detection, sofia_analysis } = analysisData;
        
        console.log('🍽️ Alimentos detectados:', food_detection?.foods_detected);
        console.log('🤖 Análise da SOFIA:', sofia_analysis);
        
        // Adicionar alimentos detectados
        if (food_detection?.foods_detected?.length > 0) {
          food_detection.foods_detected.forEach((food: string) => {
            addFoodItem(food, 1, 'porção');
          });
        }

        // Definir análise da SOFIA com validação
        if (sofia_analysis) {
          setSofiaAnalysis({
            personality: sofia_analysis.personality || 'amigável',
            analysis: sofia_analysis.analysis || 'Analisei sua refeição!',
            recommendations: sofia_analysis.recommendations || [],
            mood: sofia_analysis.mood || 'positivo',
            energy: sofia_analysis.energy || 'moderado',
            nextMeal: sofia_analysis.nextMeal || 'aguardar_proxima_refeicao',
            motivationalMessage: sofia_analysis.motivational_message,
            followUpQuestion: sofia_analysis.follow_up_question,
            nutritionalDetails: sofia_analysis.nutritional_details
          });
        }

        // Calcular análise nutricional
        setTimeout(() => {
          const nutritionAnalysis = calculateNutrition();
          setAnalysis(nutritionAnalysis);
        }, 500);

        // Mostrar mensagem de sucesso
        toast.success('🍽️ Análise da SOFIA concluída!');
      } else {
        console.warn('⚠️ Resposta da SOFIA sem sucesso:', analysisData);
        toast.warning(analysisData?.message || 'Nenhum alimento detectado na imagem');
      }

    } catch (error) {
      console.error('Erro na análise de imagem:', error);
      toast.error('Erro ao analisar imagem');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSofiaImage = () => getCharacterImageUrl('sofia');

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <img 
          src={getSofiaImage()} 
          alt="Sofia" 
          className="w-16 h-16 rounded-full"
        />
        <div>
          <h1 className="text-3xl font-bold text-purple-600">Análise de Comida</h1>
          <p className="text-gray-600">Sofia analisa suas refeições com inteligência nutricional</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo - Adicionar Alimentos */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Utensils className="w-5 h-5" />
                <span>Adicionar Alimentos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Seletor de Refeição */}
              <div>
                <label className="text-sm font-medium">Tipo de Refeição</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map(meal => (
                    <Button
                      key={meal}
                      variant={currentMeal === meal ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentMeal(meal)}
                      className="text-xs"
                    >
                      {meal === 'breakfast' && '🌅 Café'}
                      {meal === 'lunch' && '🍽️ Almoço'}
                      {meal === 'dinner' && '🌙 Jantar'}
                      {meal === 'snack' && '🍎 Lanche'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Busca de Alimentos */}
              <div>
                <label className="text-sm font-medium">Buscar Alimento</label>
                <div className="relative">
                  <div className="flex space-x-2 mt-2">
                    <Input
                      placeholder="Digite o nome do alimento..."
                      value={searchQuery}
                      onChange={(e) => {
                        const query = e.target.value;
                        setSearchQuery(query);
                        if (query.length > 2) {
                          const results = searchFood(query);
                          setSearchResults(results.slice(0, 5));
                          setShowSearchResults(true);
                        } else {
                          setShowSearchResults(false);
                        }
                      }}
                      onFocus={() => {
                        if (searchQuery.length > 2) {
                          setShowSearchResults(true);
                        }
                      }}
                    />
                    <Button size="sm" onClick={() => addFoodItem(searchQuery)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Resultados da busca */}
                  {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {searchResults.map((food) => (
                        <div
                          key={food.id}
                          className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          onClick={() => {
                            addFoodItem(food.name);
                            setSearchQuery('');
                            setShowSearchResults(false);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-sm">{food.name}</div>
                              <div className="text-xs text-gray-500">{food.category} • {food.calories} cal</div>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {food.healthScore}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Categorias Rápidas */}
              <div>
                <label className="text-sm font-medium">Categorias</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {foodCategories.map(category => (
                    <Button
                      key={category.name}
                      variant="outline"
                      size="sm"
                      onClick={() => addFoodItem(category.name.toLowerCase())}
                      className="text-xs"
                    >
                      <category.icon className="w-4 h-4 mr-1" />
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Upload de Imagem */}
              <div>
                <label className="text-sm font-medium">Análise por Imagem</label>
                <div className="flex space-x-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="w-4 h-4 mr-1" />
                    Tirar Foto
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    Upload
                  </Button>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            </CardContent>
          </Card>

          {/* Lista de Alimentos Adicionados */}
          <Card>
            <CardHeader>
              <CardTitle>Alimentos Adicionados</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {foodItems.map(item => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{item.category}</Badge>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-sm text-gray-500">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFoodItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {foodItems.length === 0 && (
                    <p className="text-gray-500 text-center py-8">
                      Adicione alimentos para começar a análise
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Painel Central - Análise Nutricional */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Análise Nutricional</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <div className="space-y-4">
                  {/* Resumo Calórico */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.totalCalories}
                      </div>
                      <div className="text-sm text-gray-600">Calorias</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-2xl font-bold text-green-600">
                        {analysis.healthScore.toFixed(0)}
                      </div>
                      <div className="text-sm text-gray-600">Score Saúde</div>
                    </div>
                  </div>

                  {/* Macronutrientes */}
                  <div>
                    <h4 className="font-medium mb-2">Macronutrientes</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Proteínas</span>
                        <span className="font-medium">{analysis.totalProtein}g ({analysis.mealBalance.protein.toFixed(1)}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Carboidratos</span>
                        <span className="font-medium">{analysis.totalCarbs}g ({analysis.mealBalance.carbs.toFixed(1)}%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Gorduras</span>
                        <span className="font-medium">{analysis.totalFat}g ({analysis.mealBalance.fat.toFixed(1)}%)</span>
                      </div>
                    </div>
                  </div>

                  {/* Micronutrientes */}
                  <div>
                    <h4 className="font-medium mb-2">Micronutrientes</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Fibras: {analysis.totalFiber}g</div>
                      <div>Açúcar: {analysis.totalSugar}g</div>
                      <div>Sódio: {analysis.totalSodium}mg</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Clique em "Analisar" para ver os resultados
                </div>
              )}
            </CardContent>
          </Card>

          {/* Botão de Análise */}
          <Button
            onClick={analyzeWithSofia}
            disabled={foodItems.length === 0 || isAnalyzing}
            className="w-full"
            size="lg"
          >
            {isAnalyzing ? (
              <>
                <Zap className="w-4 h-4 mr-2 animate-spin" />
                Analisando...
              </>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Analisar com Sofia
              </>
            )}
          </Button>
        </div>

        {/* Painel Direito - Análise da Sofia */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <img 
                  src={getSofiaImage()} 
                  alt="Sofia" 
                  className="w-6 h-6 rounded-full"
                />
                <span>Análise da Sofia</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sofiaAnalysis ? (
                <div className="space-y-4">
                  {/* Análise Principal - Conversacional */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={getSofiaImage()} 
                        alt="Sofia" 
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                          {sofiaAnalysis.analysis}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Progresso do Dia */}
                  {sofiaAnalysis.dailyContext?.estimatedDailyProgress && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2 flex items-center text-blue-900">
                        <Activity className="w-4 h-4 mr-2" />
                        Seu Dia Até Agora
                      </h4>
                      <p className="text-sm text-blue-800">
                        {sofiaAnalysis.dailyContext.estimatedDailyProgress}
                      </p>
                    </div>
                  )}

                  {/* Detalhes Nutricionais Visuais */}
                  {sofiaAnalysis.nutritionalDetails && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      {sofiaAnalysis.nutritionalDetails.proteins.length > 0 && (
                        <div className="p-2 bg-red-50 rounded">
                          <p className="text-xs font-medium text-red-900">Proteínas</p>
                          <p className="text-xs text-red-700 mt-1">
                            {sofiaAnalysis.nutritionalDetails.proteins.join(', ')}
                          </p>
                        </div>
                      )}
                      {sofiaAnalysis.nutritionalDetails.carbs.length > 0 && (
                        <div className="p-2 bg-yellow-50 rounded">
                          <p className="text-xs font-medium text-yellow-900">Carboidratos</p>
                          <p className="text-xs text-yellow-700 mt-1">
                            {sofiaAnalysis.nutritionalDetails.carbs.join(', ')}
                          </p>
                        </div>
                      )}
                      {sofiaAnalysis.nutritionalDetails.fats.length > 0 && (
                        <div className="p-2 bg-green-50 rounded">
                          <p className="text-xs font-medium text-green-900">Gorduras</p>
                          <p className="text-xs text-green-700 mt-1">
                            {sofiaAnalysis.nutritionalDetails.fats.join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recomendações */}
                  {sofiaAnalysis.recommendations.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-2 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1 text-green-600" />
                        Dicas da Sofia
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {sofiaAnalysis.recommendations.map((rec, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-green-600 mr-2">✨</span>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Mensagem Motivacional */}
                  {sofiaAnalysis.motivationalMessage && (
                    <div className="p-3 bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg text-center">
                      <p className="text-sm font-medium text-purple-800">
                        💪 {sofiaAnalysis.motivationalMessage}
                      </p>
                    </div>
                  )}

                  {/* Pergunta de Follow-up */}
                  {sofiaAnalysis.followUpQuestion && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">
                        🤔 {sofiaAnalysis.followUpQuestion}
                      </p>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => {/* TODO: Implementar resposta */}}
                      >
                        Responder
                      </Button>
                    </div>
                  )}

                  {/* Próxima Refeição */}
                  <div className="p-3 bg-blue-50 rounded">
                    <h4 className="font-medium mb-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1 text-blue-600" />
                      Próximos Passos
                    </h4>
                    <p className="text-sm text-blue-800">
                      {sofiaAnalysis.nextMeal === 'recomenda_lanche' 
                        ? '🍎 Considere um lanche nutritivo em 2-3 horas'
                        : '⏰ Aguarde a próxima refeição principal'}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <img 
                    src={getSofiaImage()} 
                    alt="Sofia" 
                    className="w-16 h-16 mx-auto mb-4 rounded-full"
                  />
                  <p>Adicione alimentos e clique em "Analisar" para receber insights da Sofia!</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estatísticas */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Suas Estatísticas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-2 bg-green-50 rounded">
                    <div className="text-lg font-bold text-green-600">{stats.avgHealthScore}</div>
                    <div className="text-xs text-gray-600">Score Médio</div>
                  </div>
                  <div className="text-center p-2 bg-blue-50 rounded">
                    <div className="text-lg font-bold text-blue-600">{stats.totalAnalyses}</div>
                    <div className="text-xs text-gray-600">Análises</div>
                  </div>
                  <div className="text-center p-2 bg-purple-50 rounded">
                    <div className="text-lg font-bold text-purple-600">{stats.patterns}</div>
                    <div className="text-xs text-gray-600">Padrões</div>
                  </div>
                  <div className="text-center p-2 bg-orange-50 rounded">
                    <div className="text-lg font-bold text-orange-600">{stats.favoriteFoods}</div>
                    <div className="text-xs text-gray-600">Favoritos</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Padrões Detectados */}
          {patterns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>Padrões Detectados</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patterns.slice(0, 3).map((pattern) => (
                    <div key={pattern.id} className="p-2 bg-yellow-50 rounded text-sm">
                      <div className="font-medium text-yellow-800">{pattern.pattern_description}</div>
                      <div className="text-xs text-yellow-600">
                        Confiança: {(pattern.confidence_score * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}; 