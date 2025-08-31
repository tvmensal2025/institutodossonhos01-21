import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Trash2, Utensils, TrendingUp } from 'lucide-react';
import { useNutritionHistory } from '@/hooks/useNutritionHistory';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const NutritionHistory: React.FC = () => {
  const { analyses, loading, error, getDailyTotals, deleteAnalysis } = useNutritionHistory();
  const [selectedDate, setSelectedDate] = useState<string>('');

  const handleDeleteAnalysis = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta análise?')) {
      await deleteAnalysis(id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return dateString;
    }
  };

  const formatTime = (timeString: string) => {
    return timeString.slice(0, 5); // HH:MM
  };

  const getMealTypeLabel = (mealType: string) => {
    const labels: Record<string, string> = {
      breakfast: 'Café da Manhã',
      lunch: 'Almoço',
      dinner: 'Jantar',
      snack: 'Lanche',
      refeicao: 'Refeição'
    };
    return labels[mealType] || mealType;
  };

  // Agrupar análises por data
  const analysesByDate = analyses.reduce((acc, analysis) => {
    const date = analysis.analysis_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(analysis);
    return acc;
  }, {} as Record<string, typeof analyses>);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Histórico Nutricional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando histórico...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <Utensils className="h-5 w-5" />
            Erro ao carregar histórico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Utensils className="h-5 w-5" />
            Histórico Nutricional
          </CardTitle>
        </CardHeader>
      </Card>

      {Object.entries(analysesByDate).length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Nenhuma análise nutricional encontrada. 
              Envie uma foto de comida para a Sofia para começar!
            </p>
          </CardContent>
        </Card>
      ) : (
        Object.entries(analysesByDate)
          .sort(([a], [b]) => b.localeCompare(a)) // Ordenar por data decrescente
          .map(([date, dayAnalyses]) => {
            const dailyTotals = getDailyTotals(date);
            
            return (
              <Card key={date}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(date)}
                    </CardTitle>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {Math.round(dailyTotals.calories)} kcal
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Resumo do dia */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-muted rounded-lg">
                    <div className="text-center">
                      <p className="text-sm font-medium">Calorias</p>
                      <p className="text-lg font-bold">{Math.round(dailyTotals.calories)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Proteínas</p>
                      <p className="text-lg font-bold">{Math.round(dailyTotals.protein)}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Carboidratos</p>
                      <p className="text-lg font-bold">{Math.round(dailyTotals.carbs)}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium">Gorduras</p>
                      <p className="text-lg font-bold">{Math.round(dailyTotals.fat)}g</p>
                    </div>
                  </div>

                  {/* Lista de análises do dia */}
                  <div className="space-y-3">
                    {dayAnalyses
                      .sort((a, b) => b.analysis_time.localeCompare(a.analysis_time))
                      .map((analysis) => (
                        <div key={analysis.id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">{formatTime(analysis.analysis_time)}</span>
                              <Badge variant="secondary">
                                {getMealTypeLabel(analysis.meal_type)}
                              </Badge>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteAnalysis(analysis.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Alimentos */}
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Alimentos:</p>
                            <div className="flex flex-wrap gap-1">
                              {analysis.food_items.map((food, idx) => (
                                <Badge key={idx} variant="outline" className="text-xs">
                                  {food.name} ({food.quantity}{food.unit})
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Nutrientes */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">Calorias:</span>
                              <span className="ml-1 font-medium">{Math.round(analysis.total_calories)}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Proteínas:</span>
                              <span className="ml-1 font-medium">{Math.round(analysis.total_protein)}g</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Carboidratos:</span>
                              <span className="ml-1 font-medium">{Math.round(analysis.total_carbs)}g</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gorduras:</span>
                              <span className="ml-1 font-medium">{Math.round(analysis.total_fat)}g</span>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
      )}
    </div>
  );
};