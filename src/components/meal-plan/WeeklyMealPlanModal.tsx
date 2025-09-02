import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Printer, Clock, CalendarDays, FileText } from 'lucide-react';
import { CompactMealPlanModal } from './CompactMealPlanModal';
import { supabase } from '@/integrations/supabase/client';

interface Meal {
  title: string;
  description: string;
  preparo?: string;
  modoPreparoElegante?: string;
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

interface WeeklyMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mealPlan: DayPlan[];
  title?: string;
}

export const WeeklyMealPlanModal: React.FC<WeeklyMealPlanModalProps> = ({
  open,
  onOpenChange,
  mealPlan,
  title = "Cardápio Semanal"
}) => {
  const [compactModalOpen, setCompactModalOpen] = useState(false);
  const [selectedDayForCompact, setSelectedDayForCompact] = useState<DayPlan | null>(null);
  const [userFullName, setUserFullName] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const u = data.user;
        const name = (u?.user_metadata as any)?.full_name || (u?.user_metadata as any)?.name || u?.email || '';
        setUserFullName(name);
      } catch (e) {
        // silencioso
      }
    })();
  }, []);


  const getDayName = (day: number): string => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    return days[day - 1] || `Dia ${day}`;
  };

  const calculateAverageMacros = () => {
    if (mealPlan.length === 0) return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

    // Inicializar totais
    const totals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
    let daysWithData = 0;

    // Percorrer cada dia do plano
    mealPlan.forEach(day => {
      // Verificar se há totais diários
      if (day.dailyTotals) {
        // Adicionar aos totais
        totals.calories += Number(day.dailyTotals.calories || 0);
        totals.protein += Number(day.dailyTotals.protein || 0);
        totals.carbs += Number(day.dailyTotals.carbs || 0);
        totals.fat += Number(day.dailyTotals.fat || 0);
        totals.fiber += Number(day.dailyTotals.fiber || 0);
        daysWithData++;
      } else if (day.meals && Array.isArray(day.meals)) {
        // Se não há totais diários, mas há refeições, calcular a partir das refeições
        let dayTotals = { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };

        // Verificar se meals é um array ou um objeto com propriedades de refeição
        const mealsList = Array.isArray(day.meals) 
          ? day.meals 
          : Object.values(day.meals).filter(Boolean);

        mealsList.forEach((meal: any) => {
          if (meal) {
            dayTotals.calories += parseFloat(meal.calories || meal.nutrition?.calories || 0);
            dayTotals.protein += parseFloat(meal.protein || meal.nutrition?.protein || 0);
            dayTotals.carbs += parseFloat(meal.carbohydrates || meal.carbs || meal.nutrition?.carbohydrates || meal.nutrition?.carbs || 0);
            dayTotals.fat += parseFloat(meal.fat || meal.nutrition?.fat || 0);
            dayTotals.fiber += parseFloat(meal.fiber || meal.nutrition?.fiber || 0);
          }
        });

        // Adicionar aos totais
        totals.calories += dayTotals.calories;
        totals.protein += dayTotals.protein;
        totals.carbs += dayTotals.carbs;
        totals.fat += dayTotals.fat;
        totals.fiber += dayTotals.fiber;
        daysWithData++;
      }
    });

    // Evitar divisão por zero
    const divisor = Math.max(1, daysWithData);

    // Retornar médias arredondadas
    return {
      calories: Math.round(totals.calories / divisor),
      protein: Math.round(totals.protein / divisor),
      carbs: Math.round(totals.carbs / divisor),
      fat: Math.round(totals.fat / divisor),
      fiber: Math.round(totals.fiber / divisor)
    };
  };

  const avgDailyMacros = calculateAverageMacros();

  const handlePrint = () => {
    // Fechar o modal antes de imprimir para melhor resultado
    onOpenChange(false);
    
    // Aguardar um momento para o modal fechar
    setTimeout(() => {
      // Criar uma nova janela para impressão
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        // Criar o conteúdo HTML para impressão
        const printContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title}</title>
            <style>
              @page {
                size: A4;
                margin: 15mm;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 20px;
                background: white;
                color: black;
              }

              /* Marca d'água */
              .watermark {
                position: fixed;
                top: 35%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 900px;
                opacity: 0.05; /* 95% transparente */
                z-index: 2; /* acima do conteúdo, mas quase invisível */
                pointer-events: none;
              }
              .content { position: relative; z-index: 1; }
              
              .header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 12px;
                margin-bottom: 20px;
                border-bottom: 2px solid #059669;
                padding-bottom: 12px;
              }
              .brand { display: flex; align-items: center; gap: 10px; }
              .brand img { width: 40px; height: 40px; object-fit: contain; }
              .title { color: #059669; }
              
              .title {
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 10px;
              }
              
              .summary {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 20px;
                margin-bottom: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
              }
              
              .summary-item {
                text-align: center;
              }
              
              .summary-value {
                font-size: 20px;
                font-weight: bold;
                color: #059669;
              }
              
              .summary-label {
                font-size: 12px;
                color: #666;
                margin-top: 5px;
              }
              
              .days-grid {
                display: grid;
                grid-template-columns: repeat(1, 1fr);
                gap: 20px;
              }
              
              .day-card {
                border: 1px solid #ddd;
                border-left: 4px solid #059669;
                padding: 15px;
                margin-bottom: 20px;
                break-inside: auto;
                page-break-inside: auto;
              }
              
              .day-title {
                font-size: 18px;
                font-weight: bold;
                color: #059669;
                margin-bottom: 10px;
              }
              
              .day-totals {
                font-size: 12px;
                color: #666;
                margin-bottom: 15px;
              }
              
              .meal {
                margin-bottom: 15px;
                padding-left: 10px;
                border-left: 2px solid;
              }
              
              .meal-breakfast { border-left-color: #22c55e; }
              .meal-lunch { border-left-color: #3b82f6; }
              .meal-snack { border-left-color: #f97316; }
              .meal-dinner { border-left-color: #8b5cf6; }
              .meal-supper { border-left-color: #6366f1; }
              
              .meal-title {
                font-size: 14px;
                font-weight: bold;
                margin-bottom: 5px;
              }
              
              .meal-breakfast .meal-title { color: #22c55e; }
              .meal-lunch .meal-title { color: #3b82f6; }
              .meal-snack .meal-title { color: #f97316; }
              .meal-dinner .meal-title { color: #8b5cf6; }
              .meal-supper .meal-title { color: #6366f1; }
              
              .meal-name {
                font-size: 12px;
                font-weight: 500;
                margin-bottom: 3px;
              }
              
              .meal-description {
                font-size: 11px;
                color: #666;
                margin-bottom: 3px;
              }
              
              .meal-calories {
                font-size: 11px;
                font-weight: bold;
              }
              
              .meal-breakfast .meal-calories { color: #22c55e; }
              .meal-lunch .meal-calories { color: #3b82f6; }
              .meal-snack .meal-calories { color: #f97316; }
              .meal-dinner .meal-calories { color: #8b5cf6; }
              .meal-supper .meal-calories { color: #6366f1; }
              
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 11px;
                color: #666;
              }
              
              @media print {
                body { margin: 0; }
                .day-card { break-inside: auto; page-break-inside: auto; }
              }
            </style>
          </head>
          <body>
            <img class="watermark" src="http://45.67.221.216:8086/logoids.png" alt="Instituto dos Sonhos" />
            <div class="content">
              <div class="header">
                <div class="brand">
                  <img src="http://45.67.221.216:8086/logoids.png" alt="Instituto dos Sonhos" />
                  <div>
                    <div class="title">${title}</div>
                    <div>Gerado em ${new Date().toLocaleDateString('pt-BR')}</div>
                  </div>
                </div>
              </div>
            
            <div class="summary">
              <div class="summary-item">
                <div class="summary-value">${avgDailyMacros.calories}</div>
                <div class="summary-label">Kcal/dia (média)</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${avgDailyMacros.protein}</div>
                <div class="summary-label">Proteínas/dia</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${avgDailyMacros.carbs}</div>
                <div class="summary-label">Carboidratos/dia</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${avgDailyMacros.fat}</div>
                <div class="summary-label">Gorduras/dia</div>
              </div>
              <div class="summary-item">
                <div class="summary-value">${avgDailyMacros.fiber}</div>
                <div class="summary-label">Fibras/dia</div>
              </div>
            </div>
            
            <div class="days-grid">
              ${mealPlan.map((dayPlan) => `
                <div class="day-card">
                  <div class="day-title">${getDayName(dayPlan.day)} - Dia ${dayPlan.day}</div>
                  ${dayPlan.dailyTotals ? `
                    <div class="day-totals">
                      ${dayPlan.dailyTotals.calories} kcal | 
                      P: ${Math.round(dayPlan.dailyTotals.protein)}g | 
                      C: ${Math.round(dayPlan.dailyTotals.carbs)}g | 
                      G: ${Math.round(dayPlan.dailyTotals.fat)}g
                    </div>
                  ` : ''}
                  
                  ${dayPlan.meals.breakfast ? `
                    <div class="meal meal-breakfast">
                      <div class="meal-title">CAFÉ DA MANHÃ</div>
                      <div class="meal-name">${dayPlan.meals.breakfast.title}</div>
                      <div class="meal-description">${dayPlan.meals.breakfast.practicalSuggestion || dayPlan.meals.breakfast.ingredients.slice(0, 3).join(', ')}</div>
                      <div class="meal-description" style="white-space: pre-line; margin-top:6px;">${dayPlan.meals.breakfast.modoPreparoElegante || dayPlan.meals.breakfast.preparo || dayPlan.meals.breakfast.description || ''}</div>
                      <div class="meal-calories">${dayPlan.meals.breakfast.macros.calories} kcal</div>
                    </div>
                  ` : ''}
                  
                  ${dayPlan.meals.lunch ? `
                    <div class="meal meal-lunch">
                      <div class="meal-title">ALMOÇO</div>
                      <div class="meal-name">${dayPlan.meals.lunch.title}</div>
                      <div class="meal-description">${dayPlan.meals.lunch.practicalSuggestion || dayPlan.meals.lunch.ingredients.slice(0, 3).join(', ')}</div>
                      <div class="meal-description" style="white-space: pre-line; margin-top:6px;">${dayPlan.meals.lunch.modoPreparoElegante || dayPlan.meals.lunch.preparo || dayPlan.meals.lunch.description || ''}</div>
                      <div class="meal-calories">${dayPlan.meals.lunch.macros.calories} kcal</div>
                    </div>
                  ` : ''}
                  
                  ${dayPlan.meals.snack ? `
                    <div class="meal meal-snack">
                      <div class="meal-title">LANCHE</div>
                      <div class="meal-name">${dayPlan.meals.snack.title}</div>
                      <div class="meal-description">${dayPlan.meals.snack.practicalSuggestion || dayPlan.meals.snack.ingredients.slice(0, 3).join(', ')}</div>
                      <div class="meal-description" style="white-space: pre-line; margin-top:6px;">${dayPlan.meals.snack.modoPreparoElegante || dayPlan.meals.snack.preparo || dayPlan.meals.snack.description || ''}</div>
                      <div class="meal-calories">${dayPlan.meals.snack.macros.calories} kcal</div>
                    </div>
                  ` : ''}
                  
                  ${dayPlan.meals.dinner ? `
                    <div class="meal meal-dinner">
                      <div class="meal-title">JANTAR</div>
                      <div class="meal-name">${dayPlan.meals.dinner.title}</div>
                      <div class="meal-description">${dayPlan.meals.dinner.practicalSuggestion || dayPlan.meals.dinner.ingredients.slice(0, 3).join(', ')}</div>
                      <div class="meal-description" style="white-space: pre-line; margin-top:6px;">${dayPlan.meals.dinner.modoPreparoElegante || dayPlan.meals.dinner.preparo || dayPlan.meals.dinner.description || ''}</div>
                      <div class="meal-calories">${dayPlan.meals.dinner.macros.calories} kcal</div>
                    </div>
                  ` : ''}
                  
                  ${dayPlan.meals.supper ? `
                    <div class="meal meal-supper">
                      <div class="meal-title">CEIA</div>
                      <div class="meal-name">${dayPlan.meals.supper.title}</div>
                      <div class="meal-description">${dayPlan.meals.supper.practicalSuggestion || dayPlan.meals.supper.ingredients.slice(0, 3).join(', ')}</div>
                      <div class="meal-description" style="white-space: pre-line; margin-top:6px;">${dayPlan.meals.supper.modoPreparoElegante || dayPlan.meals.supper.preparo || dayPlan.meals.supper.description || ''}</div>
                      <div class="meal-calories">${dayPlan.meals.supper.macros.calories} kcal</div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>
            
            <div class="footer">
              <p><strong>Sofia Nutricional — Instituto dos Sonhos</strong></p>
              <p>Documento educativo • Consulte sempre um nutricionista</p>
              <p>${userFullName ? `${userFullName} • ` : ''}Gerado em ${new Date().toLocaleDateString('pt-BR')}</p>
            </div>
            </div>
          </body>
          </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        
        // Aguardar o conteúdo carregar e imprimir
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      } else {
        // Fallback para impressão direta se não conseguir abrir nova janela
        window.print();
      }
    }, 100);
  };



  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader className="pb-3">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center justify-center gap-2">
              <CalendarDays className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-base sm:text-lg">{title}</span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="print:hidden h-8 sm:h-9 px-2 sm:px-3"
              >
                <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Imprimir</span>
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6">
          {/* Resumo Semanal - visível na tela */}
          <Card className="print:hidden bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-center gap-2 text-primary text-base sm:text-lg">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                Resumo Semanal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary truncate">{avgDailyMacros.calories}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Kcal/dia</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary truncate">{avgDailyMacros.protein}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Proteínas</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary truncate">{avgDailyMacros.carbs}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Carboidratos</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary truncate">{avgDailyMacros.fat}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Gorduras</div>
                </div>
                <div className="text-center">
                  <div className="text-lg sm:text-2xl font-bold text-primary truncate">{avgDailyMacros.fiber}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Fibras</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Grid de Dias */}
          <div className="grid grid-cols-1 gap-3 sm:gap-4 print:grid-cols-1 print:gap-2">
            {mealPlan.map((dayPlan) => (
              <Card key={dayPlan.day} className="border-l-4 border-l-primary print:break-inside-avoid">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base sm:text-lg font-bold text-primary text-center">
                    {getDayName(dayPlan.day)} - Dia {dayPlan.day}
                  </CardTitle>
                  {dayPlan.dailyTotals && (
                    <div className="text-xs sm:text-sm text-muted-foreground">
                      {dayPlan.dailyTotals.calories} kcal | 
                      P: {Math.round(dayPlan.dailyTotals.protein)}g | 
                      C: {Math.round(dayPlan.dailyTotals.carbs)}g | 
                      G: {Math.round(dayPlan.dailyTotals.fat)}g
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-2 sm:space-y-3">
                  {/* Café da Manhã */}
                  {dayPlan.meals.breakfast && (
                    <div className="border-l-2 border-l-green-500 pl-3">
                      <h4 className="font-semibold text-sm text-green-700">CAFÉ DA MANHÃ</h4>
                      <p className="text-xs font-medium">{dayPlan.meals.breakfast.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayPlan.meals.breakfast.practicalSuggestion || 
                         dayPlan.meals.breakfast.ingredients.slice(0, 3).join(', ')}
                      </p>
                      <p className="text-xs font-bold text-green-600">
                        {dayPlan.meals.breakfast.macros.calories} kcal
                      </p>
                    </div>
                  )}

                  {/* Almoço */}
                  {dayPlan.meals.lunch && (
                    <div className="border-l-2 border-l-blue-500 pl-3">
                      <h4 className="font-semibold text-sm text-blue-700">ALMOÇO</h4>
                      <p className="text-xs font-medium">{dayPlan.meals.lunch.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayPlan.meals.lunch.practicalSuggestion || 
                         dayPlan.meals.lunch.ingredients.slice(0, 3).join(', ')}
                      </p>
                      <p className="text-xs font-bold text-blue-600">
                        {dayPlan.meals.lunch.macros.calories} kcal
                      </p>
                    </div>
                  )}

                  {/* Lanche */}
                  {dayPlan.meals.snack && (
                    <div className="border-l-2 border-l-orange-500 pl-3">
                      <h4 className="font-semibold text-sm text-orange-700">LANCHE</h4>
                      <p className="text-xs font-medium">{dayPlan.meals.snack.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayPlan.meals.snack.practicalSuggestion || 
                         dayPlan.meals.snack.ingredients.slice(0, 3).join(', ')}
                      </p>
                      <p className="text-xs font-bold text-orange-600">
                        {dayPlan.meals.snack.macros.calories} kcal
                      </p>
                    </div>
                  )}

                  {/* Jantar */}
                  {dayPlan.meals.dinner && (
                    <div className="border-l-2 border-l-purple-500 pl-3">
                      <h4 className="font-semibold text-sm text-purple-700">JANTAR</h4>
                      <p className="text-xs font-medium">{dayPlan.meals.dinner.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayPlan.meals.dinner.practicalSuggestion || 
                         dayPlan.meals.dinner.ingredients.slice(0, 3).join(', ')}
                      </p>
                      <p className="text-xs font-bold text-purple-600">
                        {dayPlan.meals.dinner.macros.calories} kcal
                      </p>
                    </div>
                  )}

                  {/* Ceia */}
                  {dayPlan.meals.supper && (
                    <div className="border-l-2 border-l-indigo-500 pl-3">
                      <h4 className="font-semibold text-sm text-indigo-700">CEIA</h4>
                      <p className="text-xs font-medium">{dayPlan.meals.supper.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {dayPlan.meals.supper.practicalSuggestion || 
                         dayPlan.meals.supper.ingredients.slice(0, 3).join(', ')}
                      </p>
                      <p className="text-xs font-bold text-indigo-600">
                        {dayPlan.meals.supper.macros.calories} kcal
                      </p>
                    </div>
                  )}

                  {/* Botão Compacto para cada dia */}
                  <div className="flex gap-2 pt-2 sm:pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDayForCompact(dayPlan);
                        setCompactModalOpen(true);
                      }}
                      className="flex-1 text-xs h-8 sm:h-9"
                    >
                      <FileText className="w-3 h-3 mr-1" />
                      Detalhado
                    </Button>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer para impressão */}
          <div className="hidden print:block text-center border-t pt-4 mt-8 text-xs text-muted-foreground">
            <p>Sofia Nutricional — documento educativo</p>
            <p className="mt-1">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
      </DialogContent>

      {/* Modal Compacto */}
      {selectedDayForCompact && (
        <CompactMealPlanModal
          open={compactModalOpen}
          onOpenChange={setCompactModalOpen}
          dayPlan={selectedDayForCompact}
          title={`${getDayName(selectedDayForCompact.day)} - Dia ${selectedDayForCompact.day}`}
        />
      )}
    </Dialog>
  );
};