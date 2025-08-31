import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Printer, Clock, Target, Leaf, ChefHat } from 'lucide-react';

interface Meal {
  title: string;
  description: string;
  preparo?: string; // Instruções detalhadas da Mealie
  modoPreparoElegante?: string; // Instruções completas (preferencial)
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

interface CompactMealPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dayPlan: DayPlan;
  title?: string;
}

const getMealTypeIcon = (type: string) => {
  const icons = {
    breakfast: '🌅',
    lunch: '🍽️',
    snack: '☕',
    dinner: '🌙',
    supper: '⭐'
  };
  return icons[type as keyof typeof icons] || '🍴';
};

const getMealTypeColor = (type: string) => {
  const colors = {
    breakfast: 'bg-gradient-to-r from-orange-400 to-red-500',
    lunch: 'bg-gradient-to-r from-green-400 to-teal-500',
    snack: 'bg-gradient-to-r from-yellow-400 to-orange-400',
    dinner: 'bg-gradient-to-r from-purple-400 to-indigo-500',
    supper: 'bg-gradient-to-r from-pink-400 to-purple-500'
  };
  return colors[type as keyof typeof colors] || 'bg-gradient-to-r from-gray-400 to-gray-500';
};

const getMealTypeTitle = (type: string) => {
  const titles = {
    breakfast: 'CAFÉ DA MANHÃ',
    lunch: 'ALMOÇO',
    snack: 'LANCHE',
    dinner: 'JANTAR',
    supper: 'CEIA'
  };
  return titles[type as keyof typeof titles] || type.toUpperCase();
};

export const CompactMealPlanModal: React.FC<CompactMealPlanModalProps> = ({
  open,
  onOpenChange,
  dayPlan,
  title
}) => {
  const [activeTab, setActiveTab] = useState<string>('breakfast');

  const handlePrint = () => {
    // Criar uma nova janela para impressão
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printContent = document.getElementById('compact-meal-plan-print');
      if (printContent) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <title>${title || `Plano Alimentar - Dia ${dayPlan.day}`}</title>
            <style>
              @page {
                size: A4;
                margin: 8mm;
              }
              
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                margin: 0;
                padding: 12px;
                background: white;
                color: black;
                line-height: 1.3;
                font-size: 11px;
              }

              /* Marca d'água */
              .watermark {
                position: fixed;
                top: 35%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 80%;
                max-width: 800px;
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
                margin-bottom: 15px;
                border-bottom: 2px solid #059669;
                padding-bottom: 12px;
              }

              .brand {
                display: flex;
                align-items: center;
                gap: 10px;
              }
              .brand img {
                width: 36px;
                height: 36px;
                object-fit: contain;
              }
              
              .title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 6px;
                color: #059669;
              }
              
              .date {
                font-size: 10px;
                color: #666;
              }
              
              .summary {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                margin-bottom: 15px;
                padding: 12px;
                background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
                border-radius: 8px;
                border: 1px solid #e0f2fe;
              }
              
              .summary-item {
                text-align: center;
                padding: 4px;
              }
              
              .summary-value {
                font-size: 14px;
                font-weight: bold;
                color: #059669;
                margin-bottom: 2px;
              }
              
              .summary-label {
                font-size: 9px;
                color: #666;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              
              .meal-card {
                border: 1px solid #e5e7eb;
                border-left: 4px solid #059669;
                padding: 12px;
                margin-bottom: 12px;
                page-break-inside: avoid;
                border-radius: 6px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              }
              
              .meal-header {
                background: linear-gradient(135deg, #059669 0%, #047857 100%);
                color: white;
                padding: 8px 12px;
                margin: -12px -12px 12px -12px;
                border-radius: 6px 6px 0 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
              }
              
              .meal-title {
                font-size: 13px;
                font-weight: bold;
              }
              
              .meal-calories {
                font-size: 11px;
                opacity: 0.9;
                background: rgba(255,255,255,0.2);
                padding: 2px 6px;
                border-radius: 4px;
              }
              
              .macros-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 6px;
                margin-bottom: 12px;
              }
              
              .macro-item {
                text-align: center;
                padding: 6px 4px;
                background: #f8fafc;
                border-radius: 4px;
                border: 1px solid #e2e8f0;
              }
              
              .macro-value {
                font-size: 11px;
                font-weight: bold;
                color: #059669;
                margin-bottom: 1px;
              }
              
              .macro-label {
                font-size: 7px;
                color: #64748b;
                text-transform: uppercase;
                letter-spacing: 0.3px;
              }
              
              .section {
                margin-bottom: 12px;
              }
              
              .section-title {
                font-size: 11px;
                font-weight: bold;
                margin-bottom: 6px;
                color: #374151;
                display: flex;
                align-items: center;
                gap: 4px;
              }
              
              .section-title::before {
                content: "•";
                color: #059669;
                font-weight: bold;
              }
              
              .ingredients {
                background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                padding: 8px 10px;
                border-left: 3px solid #22c55e;
                border-radius: 0 4px 4px 0;
                font-size: 9px;
                line-height: 1.4;
              }
              
              .instructions {
                background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
                padding: 10px 12px;
                border-left: 4px solid #f59e0b;
                border-radius: 0 6px 6px 0;
                white-space: pre-line;
                font-size: 10px;
                line-height: 1.5;
                margin-bottom: 8px;
                min-height: 50px;
              }
              
              .footer {
                text-align: center;
                margin-top: 15px;
                padding-top: 12px;
                border-top: 1px solid #e5e7eb;
                font-size: 9px;
                color: #6b7280;
                line-height: 1.3;
              }
              
              @media print {
                body { 
                  margin: 0; 
                  padding: 8px;
                  font-size: 10px;
                }
                .meal-card { 
                  page-break-inside: avoid; 
                  margin-bottom: 8px;
                  box-shadow: none;
                }
                .instructions {
                  font-size: 11px !important;
                  line-height: 1.6 !important;
                  padding: 12px 14px !important;
                  min-height: 60px !important;
                  background: #fffbeb !important;
                  border-left: 4px solid #f59e0b !important;
                }
                .summary {
                  margin-bottom: 12px;
                  padding: 8px;
                }
                .header {
                  margin-bottom: 12px;
                  padding-bottom: 8px;
                }
                .section {
                  margin-bottom: 10px;
                }
                .macros-grid {
                  gap: 4px;
                  margin-bottom: 8px;
                }
                .macro-item {
                  padding: 4px 2px;
                }
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
                    <div class="title">${title || `Plano Alimentar - Dia ${dayPlan.day}`}</div>
                    <div class="date">Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}</div>
                  </div>
                </div>
              </div>
            
            ${dayPlan.dailyTotals ? `
              <div class="summary">
                <div class="summary-item">
                  <div class="summary-value">${dayPlan.dailyTotals.calories}</div>
                  <div class="summary-label">Calorias</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${dayPlan.dailyTotals.protein.toFixed(0)}</div>
                  <div class="summary-label">Proteínas</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${dayPlan.dailyTotals.carbs.toFixed(0)}</div>
                  <div class="summary-label">Carboidratos</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${dayPlan.dailyTotals.fat.toFixed(0)}</div>
                  <div class="summary-label">Gorduras</div>
                </div>
                <div class="summary-item">
                  <div class="summary-value">${dayPlan.dailyTotals.fiber.toFixed(0)}</div>
                  <div class="summary-label">Fibras</div>
                </div>
              </div>
            ` : ''}
            
            ${Object.entries(dayPlan.meals).map(([key, meal]) => {
              if (!meal) return '';
              return `
                <div class="meal-card">
                  <div class="meal-header">
                    <div class="meal-title">${getMealTypeTitle(key)}</div>
                    <div class="meal-calories">${meal.macros.calories} kcal</div>
                  </div>
                  
                  <div class="macros-grid">
                    <div class="macro-item">
                      <div class="macro-value">${meal.macros.protein}g</div>
                      <div class="macro-label">Proteínas</div>
                    </div>
                    <div class="macro-item">
                      <div class="macro-value">${meal.macros.carbs}g</div>
                      <div class="macro-label">Carboidratos</div>
                    </div>
                    <div class="macro-item">
                      <div class="macro-value">${meal.macros.fat}g</div>
                      <div class="macro-label">Gorduras</div>
                    </div>
                    <div class="macro-item">
                      <div class="macro-value">${meal.macros.fiber || 0}g</div>
                      <div class="macro-label">Fibras</div>
                    </div>
                    <div class="macro-item">
                      <div class="macro-value">15min</div>
                      <div class="macro-label">Tempo</div>
                    </div>
                  </div>
                  
                  <div class="section">
                    <div class="section-title">Ingredientes</div>
                    <div class="ingredients">
                      ${meal.ingredients.map(ingredient => `• ${ingredient}`).join('<br>')}
                    </div>
                  </div>
                  
                  <div class="section">
                    <div class="section-title">Modo de Preparo</div>
                    <div class="instructions">${meal.modoPreparoElegante || meal.preparo || meal.description || 'Instruções não disponíveis'}</div>
                  </div>
                </div>
              `;
            }).join('')}
            
              <div class="footer">
                <p><strong>Sofia Nutricional — Instituto dos Sonhos</strong></p>
                <p>Documento educativo • Consulte sempre um nutricionista</p>
                <p>Versão: ${new Date().toISOString().split('T')[0]}</p>
              </div>
            </div>
          </body>
          </html>
        `;
        
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        
        printWindow.onload = () => {
          printWindow.print();
          printWindow.close();
        };
      }
    }
  };

  const mealTypes = [
    { key: 'breakfast', meal: dayPlan.meals.breakfast },
    { key: 'lunch', meal: dayPlan.meals.lunch },
    { key: 'snack', meal: dayPlan.meals.snack },
    { key: 'dinner', meal: dayPlan.meals.dinner },
    { key: 'supper', meal: dayPlan.meals.supper }
  ].filter(item => item.meal);

  const dayTitle = title || `Plano Alimentar — Dia ${dayPlan.day}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
              <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-primary flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              {dayTitle}
            </DialogTitle>
            <Button onClick={handlePrint} variant="outline" size="sm" className="print:hidden">
              <Printer className="w-4 h-4 mr-2" />
              Imprimir
            </Button>
          </div>
          
          {/* Resumo Nutricional */}
          {dayPlan.dailyTotals && (
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-3 sm:p-4 mt-4">
              <div className="text-center text-xs sm:text-sm font-semibold text-primary mb-2">
                RESUMO NUTRICIONAL DIÁRIO
              </div>
              <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center">
                <div>
                  <div className="text-sm sm:text-lg font-bold text-primary truncate">{dayPlan.dailyTotals.calories}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">kcal</div>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-bold text-primary truncate">{dayPlan.dailyTotals.protein.toFixed(0)}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Proteínas</div>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-bold text-primary truncate">{dayPlan.dailyTotals.carbs.toFixed(0)}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Carboidratos</div>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-bold text-primary truncate">{dayPlan.dailyTotals.fat.toFixed(0)}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Gorduras</div>
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-bold text-primary truncate">{dayPlan.dailyTotals.fiber.toFixed(0)}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground truncate">Fibras</div>
                </div>
              </div>
            </div>
          )}
        </DialogHeader>

        <div id="compact-meal-plan-print" className="space-y-3 sm:space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              {mealTypes.map(({ key, meal }) => (
                <TabsTrigger key={key} value={key} className="flex flex-col items-center gap-1 text-xs p-2">
                  <span className="text-lg">{getMealTypeIcon(key)}</span>
                  <span className="text-[10px] leading-tight">{getMealTypeTitle(key).split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {mealTypes.map(({ key, meal }) => (
              <TabsContent key={key} value={key} className="mt-3 sm:mt-4">
                <Card className="border-0 shadow-lg">
                  <div className={`${getMealTypeColor(key)} text-white p-3 sm:p-4 rounded-t-lg`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="text-lg sm:text-xl">{getMealTypeIcon(key)}</span>
                        <div>
                          <h3 className="font-semibold text-sm sm:text-lg">{getMealTypeTitle(key)}</h3>
                          <p className="text-xs sm:text-sm opacity-90">{meal?.title}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm sm:text-lg">{meal?.macros.calories} kcal</div>
                        <div className="text-xs sm:text-sm opacity-90">
                          {meal?.macros.protein}g P • {meal?.macros.carbs}g C • {meal?.macros.fat}g G
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-4 sm:p-6">
                    {/* Macros e Tempo */}
                    <div className="grid grid-cols-5 gap-2 mb-4">
                      <div className="text-center p-2 bg-blue-50 rounded-lg">
                        <div className="text-sm font-bold text-blue-600 truncate">{meal?.macros.protein}g</div>
                        <div className="text-[10px] text-blue-500 truncate">PROTE</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded-lg">
                        <div className="text-sm font-bold text-green-600 truncate">{meal?.macros.carbs}g</div>
                        <div className="text-[10px] text-green-500 truncate">CARBO</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded-lg">
                        <div className="text-sm font-bold text-orange-600 truncate">{meal?.macros.fat}g</div>
                        <div className="text-[10px] text-orange-500 truncate">GORD</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 rounded-lg">
                        <div className="text-sm font-bold text-purple-600 truncate">{meal?.macros.fiber || 0}g</div>
                        <div className="text-[10px] text-purple-500 truncate">FIBRAS</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded-lg">
                        <div className="text-sm font-bold text-gray-600 truncate">15min</div>
                        <div className="text-[10px] text-gray-500 truncate">TEMPO</div>
                      </div>
                    </div>

                    {/* Ingredientes */}
                    <div className="mb-4">
                      <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-600" />
                        Ingredientes
                      </h4>
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
                        <div className="text-xs sm:text-sm text-gray-700">
                          {meal?.ingredients.map((ingredient, idx) => (
                            <div key={idx} className="flex items-start gap-2 mb-1">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                              <span>{ingredient}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Modo de Preparo */}
                    <div>
                      <h4 className="font-semibold text-base mb-2 flex items-center gap-2">
                        <ChefHat className="w-4 h-4 text-orange-600" />
                        Modo de Preparo
                      </h4>
                      <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded-r-lg">
                        <div className="text-xs sm:text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {meal?.modoPreparoElegante || meal?.preparo || meal?.description || 'Instruções de preparo não disponíveis'}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground border-t pt-4 mt-6">
          <div className="flex items-center justify-center gap-2 text-primary">
            <span className="font-semibold">Sofia Nutricional — Instituto dos Sonhos</span>
          </div>
          <p className="mt-1">Documento educativo • Consulte sempre um nutricionista</p>
          <p className="text-xs mt-2">Gerado em {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
