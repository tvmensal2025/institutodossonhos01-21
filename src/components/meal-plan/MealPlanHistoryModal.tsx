import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  History, 
  Calendar, 
  CalendarDays, 
  Trash2, 
  Clock,
  Utensils
} from 'lucide-react';
import { useMealPlanHistory } from '@/hooks/useMealPlanHistory';
import { ViewMealPlanButton } from './ViewMealPlanButton';

interface MealPlanHistoryProps {
  className?: string;
}

export const MealPlanHistoryModal: React.FC<MealPlanHistoryProps> = ({
  className = ""
}) => {
  const { history, loading, deleteMealPlan } = useMealPlanHistory();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanTypeInfo = (type: 'weekly' | 'daily') => {
    return type === 'weekly' 
      ? { icon: CalendarDays, label: 'Semanal', color: 'bg-blue-100 text-blue-800' }
      : { icon: Calendar, label: 'Diário', color: 'bg-green-100 text-green-800' };
  };

  const getTotalCalories = (plan: any) => {
    if (!plan.meal_plan_data) return 0;
    
    if (plan.plan_type === 'daily' && plan.meal_plan_data.dailyTotals) {
      return plan.meal_plan_data.dailyTotals.calories;
    }
    
    if (plan.plan_type === 'weekly' && Array.isArray(plan.meal_plan_data)) {
      return plan.meal_plan_data.reduce((total: number, day: any) => {
        if (day.dailyTotals) {
          return total + day.dailyTotals.calories;
        }
        return total;
      }, 0);
    }
    
    return 0;
  };

  return (
    <div className={`space-y-4 ${className}`}>


      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-8">
          <Utensils className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Nenhum cardápio salvo ainda.</p>
          <p className="text-sm text-muted-foreground mt-2">
            Gere um cardápio para começar seu histórico!
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {history.map((plan) => {
            const typeInfo = getPlanTypeInfo(plan.plan_type);
            const TypeIcon = typeInfo.icon;
            const totalCalories = getTotalCalories(plan);
            
            return (
              <div key={plan.id} className="bg-card border rounded-lg p-3 hover:shadow-sm transition-shadow">
                {/* Layout responsivo para mobile */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  {/* Informações principais */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm font-medium text-foreground truncate">
                        {formatDate(plan.created_at)}
                      </span>
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        <TypeIcon className="w-3 h-3 mr-1" />
                        {typeInfo.label}
                      </Badge>
                    </div>
                    
                    {/* Calorias em destaque */}
                    <div className="text-lg font-bold text-primary">
                      {totalCalories.toLocaleString('pt-BR')} kcal
                    </div>
                  </div>
                  
                  {/* Botões de ação */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <ViewMealPlanButton plan={plan} />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMealPlan(plan.id)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};