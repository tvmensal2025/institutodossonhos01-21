import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Clock, User, FileText, Download, Globe, TestTube } from 'lucide-react';
import { exportPDF, exportPNG } from '@/lib/exporters';
import { openDetailedMealPlanHTML, convertMealieToDetailedFormat } from '@/utils/exportMealPlanDetailedHTML';
import { generateExampleMealPlan } from '@/utils/mealPlanExampleData';
import { CompactMealPlanModal } from './CompactMealPlanModal';
import sofiaImage from '@/assets/sofia.png';
import logoInstituto from '@/assets/logo-instituto.png';

interface Meal {
  title: string;
  description: string;
  preparo?: string; // Instruções detalhadas da Mealie
  ingredients: string[];
  practicalSuggestion?: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
  };
}

interface DayPlan {
  day: number;
  dailyTotals?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals: {
    breakfast?: Meal;
    lunch?: Meal;
    snack?: Meal;
    dinner?: Meal;
    supper?: Meal;
  };
}

interface DailyMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayPlan: DayPlan;
  title?: string;
}

const MealCard: React.FC<{ meal: Meal; mealType: string }> = ({ meal, mealType }) => {
  const getMealTypeColor = (type: string) => {
    const colors = {
      breakfast: 'from-emerald-500 to-green-600',
      lunch: 'from-blue-500 to-cyan-600', 
      snack: 'from-amber-500 to-orange-600',
      dinner: 'from-violet-500 to-purple-600',
      supper: 'from-indigo-500 to-blue-600'
    };
    return colors[type as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const getMealTypeTitle = (type: string) => {
    const titles = {
      breakfast: 'CAFÉ DA MANHÃ',
      lunch: 'ALMOÇO',
      snack: 'LANCHE DA TARDE', 
      dinner: 'JANTAR',
      supper: 'CEIA'
    };
    return titles[type as keyof typeof titles] || type.toUpperCase();
  };

  const getMealIcon = (type: string) => {
    const icons = {
      breakfast: '🌅',
      lunch: '🍽️',
      snack: '🥪',
      dinner: '🌙',
      supper: '🌙'
    };
    return icons[type as keyof typeof icons] || '🍴';
  };

  return (
    <Card className="overflow-hidden shadow-lg border-0 hover:shadow-xl transition-all duration-300">
      <CardHeader className={`bg-gradient-to-r ${getMealTypeColor(mealType)} text-white p-4`}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <span className="text-xl">{getMealIcon(mealType)}</span>
            {getMealTypeTitle(mealType)}
          </CardTitle>
          <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-sm font-bold">{meal.macros.calories} kcal</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {/* Título da Refeição */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-primary mb-2">{meal.title}</h3>
        </div>

        {/* Grid de Informações */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alimentos */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-emerald-200">
              <Leaf className="w-4 h-4 text-emerald-600" />
              ALIMENTOS
            </h4>
            <ul className="space-y-2">
              {meal.ingredients.map((ingredient, idx) => (
                <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></span>
                  {ingredient}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Sugestão Prática */}
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-emerald-200">
              <User className="w-4 h-4 text-emerald-600" />
              SUGESTÃO PRÁTICA
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {meal.practicalSuggestion || 'Não especificado'}
            </p>
          </div>
        </div>

        {/* Macronutrientes */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-4">
          <h4 className="font-semibold text-emerald-800 mb-3 text-center">Informação Nutricional</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700">{meal.macros.protein.toFixed(1)}g</div>
              <div className="text-xs text-emerald-600">Proteínas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700">{meal.macros.carbs.toFixed(1)}g</div>
              <div className="text-xs text-emerald-600">Carboidratos</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700">{meal.macros.fat.toFixed(1)}g</div>
              <div className="text-xs text-emerald-600">Gorduras</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-700">{meal.macros.fiber?.toFixed(1) || '0'}g</div>
              <div className="text-xs text-emerald-600">Fibras</div>
            </div>
          </div>
        </div>

        {/* Modo de Preparo */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground flex items-center gap-2 pb-2 border-b border-emerald-200">
            <FileText className="w-4 h-4 text-emerald-600" />
            MODO DE PREPARO
          </h4>
          <div className="text-sm text-muted-foreground leading-relaxed bg-gray-50 p-4 rounded-lg whitespace-pre-line">
            {meal.preparo || meal.description}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const DailyMealPlanModal: React.FC<DailyMealPlanModalProps> = ({
  open,
  onOpenChange,
  dayPlan,
  title
}) => {
  const [compactModalOpen, setCompactModalOpen] = useState(false);
  
  if (!dayPlan) return null;

  const dayTitle = title || `Plano Alimentar — Dia ${dayPlan.day}`;

  const handleDownloadPDF = async () => {
    const { exportMealPlanToPDF } = await import('@/utils/exportMealPlanPDF');
    
    // Preparar dados para o PDF estruturado
    const pdfData = {
      userName: 'Usuário',
      dateLabel: `Cardápio Diário - Dia ${dayPlan.day} - ${new Date().toLocaleDateString('pt-BR')}`,
      targetCaloriesKcal: dayPlan.dailyTotals?.calories || 2000,
      guaranteed: false,
      meals: {
        breakfast: dayPlan.meals.breakfast ? {
          name: dayPlan.meals.breakfast.title,
          calories_kcal: dayPlan.meals.breakfast.macros.calories,
          ingredients: dayPlan.meals.breakfast.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.breakfast.description,
          homemade_measure: dayPlan.meals.breakfast.practicalSuggestion || ''
        } : undefined,
        
        lunch: dayPlan.meals.lunch ? {
          name: dayPlan.meals.lunch.title,
          calories_kcal: dayPlan.meals.lunch.macros.calories,
          ingredients: dayPlan.meals.lunch.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.lunch.description,
          homemade_measure: dayPlan.meals.lunch.practicalSuggestion || ''
        } : undefined,
        
        afternoon_snack: dayPlan.meals.snack ? {
          name: dayPlan.meals.snack.title,
          calories_kcal: dayPlan.meals.snack.macros.calories,
          ingredients: dayPlan.meals.snack.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.snack.description,
          homemade_measure: dayPlan.meals.snack.practicalSuggestion || ''
        } : undefined,
        
        dinner: dayPlan.meals.dinner ? {
          name: dayPlan.meals.dinner.title,
          calories_kcal: dayPlan.meals.dinner.macros.calories,
          ingredients: dayPlan.meals.dinner.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.dinner.description,
          homemade_measure: dayPlan.meals.dinner.practicalSuggestion || ''
        } : undefined,
        supper: dayPlan.meals.supper ? {
          name: dayPlan.meals.supper.title,
          calories_kcal: dayPlan.meals.supper.macros.calories,
          ingredients: dayPlan.meals.supper.ingredients.map(ing => ({
            name: ing,
            quantity: 1,
            unit: 'porção'
          })),
          notes: dayPlan.meals.supper.description,
          homemade_measure: dayPlan.meals.supper.practicalSuggestion || ''
        } : undefined
      }
    };
    
    await exportMealPlanToPDF(pdfData);
  };

  const handleDownloadPNG = async () => {
    const element = document.getElementById('daily-meal-plan-content');
    if (element) {
      await exportPNG(element, `plano-alimentar-dia-${dayPlan.day}.png`);
    }
  };

  const handleOpenDetailed = async () => {
    try {
      // Converter dados para formato detalhado
      const detailedPlan = convertMealieToDetailedFormat([dayPlan]);
      openDetailedMealPlanHTML(detailedPlan);
    } catch (error) {
      console.error('Erro ao abrir HTML detalhado:', error);
    }
  };

  const handleTestDetailed = () => {
    try {
      // Usar dados de exemplo para teste
      const examplePlan = generateExampleMealPlan();
      openDetailedMealPlanHTML(examplePlan);
    } catch (error) {
      console.error('Erro ao testar HTML detalhado:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-center text-2xl font-bold text-primary flex items-center justify-center gap-2">
              <Leaf className="w-6 h-6 text-emerald-600" />
              {dayTitle}
            </DialogTitle>
            <div className="flex gap-2">
              <Button onClick={handleDownloadPDF} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
              <Button onClick={handleDownloadPNG} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                PNG
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenDetailed}
                className="print:hidden"
              >
                <Globe className="w-4 h-4 mr-2" />
                Abrir Detalhado
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCompactModalOpen(true)}
                className="print:hidden"
                title="Visualização compacta com abas"
              >
                <FileText className="w-4 h-4 mr-2" />
                Compacto
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTestDetailed}
                className="print:hidden"
                title="Testar com dados de exemplo"
              >
                <TestTube className="w-4 h-4 mr-2" />
                Teste
              </Button>
            </div>
          </div>
          <div className="text-center space-y-2">
            <div className="text-lg text-emerald-600 font-semibold">
              PLANO ALIMENTAR CLÍNICO
            </div>
            <div className="text-sm text-muted-foreground">
              Dieta com meta diária {dayPlan.dailyTotals?.calories || 2000} kcal
            </div>
          </div>
        </DialogHeader>

        <div id="daily-meal-plan-content" className="space-y-6 relative">
          {/* Logo transparente de fundo */}
          <div 
            className="fixed inset-0 pointer-events-none z-0 opacity-5 print:opacity-10"
            style={{
              backgroundImage: `url(${logoInstituto})`,
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '40%'
            }}
          />
          
          {/* Header para impressão */}
          <div className="hidden print:block text-center border-b pb-4 mb-6 relative z-10">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img src={sofiaImage} alt="Sofia Nutricional" className="w-16 h-16 rounded-full" />
              <div>
                <h1 className="text-2xl font-bold text-primary">{dayTitle}</h1>
                <p className="text-sm text-muted-foreground">
                  Sofia Nutricional — Instituto dos Sonhos
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
          {/* Totais do Dia - Card Principal */}
          {dayPlan.dailyTotals && (
            <Card className="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white shadow-lg border-0">
              <CardHeader className="text-center">
                <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
                  <Clock className="w-5 h-5" />
                  Totais do Dia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dayPlan.dailyTotals.calories}</div>
                    <div className="text-sm text-emerald-100">Calorias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dayPlan.dailyTotals.protein.toFixed(1)}</div>
                    <div className="text-sm text-emerald-100">Proteínas (g)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dayPlan.dailyTotals.carbs.toFixed(1)}</div>
                    <div className="text-sm text-emerald-100">Carboidratos (g)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dayPlan.dailyTotals.fat.toFixed(1)}</div>
                    <div className="text-sm text-emerald-100">Gorduras (g)</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{dayPlan.dailyTotals.fiber.toFixed(1)}</div>
                    <div className="text-sm text-emerald-100">Fibras (g)</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Refeições */}
          <div className="space-y-6">
            {dayPlan.meals?.breakfast && (
              <MealCard meal={dayPlan.meals.breakfast} mealType="breakfast" />
            )}
            {dayPlan.meals?.lunch && (
              <MealCard meal={dayPlan.meals.lunch} mealType="lunch" />
            )}
            {dayPlan.meals?.snack && (
              <MealCard meal={dayPlan.meals.snack} mealType="snack" />
            )}
            {dayPlan.meals?.dinner && (
              <MealCard meal={dayPlan.meals.dinner} mealType="dinner" />
            )}
            {dayPlan.meals?.supper && (
              <MealCard meal={dayPlan.meals.supper} mealType="supper" />
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground border-t pt-6 mt-8 relative z-10">
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <img src={sofiaImage} alt="Sofia" className="w-6 h-6 rounded-full" />
              <span className="font-semibold">Sofia Nutricional — Instituto dos Sonhos</span>
            </div>
            <p className="mt-1">Documento educativo • Consulte sempre um nutricionista</p>
            <p className="text-xs mt-2">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        </div>
      </DialogContent>

      {/* Modal Compacto */}
      <CompactMealPlanModal
        open={compactModalOpen}
        onOpenChange={setCompactModalOpen}
        dayPlan={dayPlan}
        title={dayTitle}
      />
    </Dialog>
  );
};