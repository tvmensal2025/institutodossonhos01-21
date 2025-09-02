import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { WeeklyMealPlanModal } from './WeeklyMealPlanModal';
import { DailyMealPlanModal } from './DailyMealPlanModal';
import { adaptHistoryData } from '@/utils/meal-plan-adapter';

interface ViewMealPlanButtonProps {
  plan: any;
}

export const ViewMealPlanButton: React.FC<ViewMealPlanButtonProps> = ({ plan }) => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<'weekly' | 'daily' | null>(null);

  const handleViewPlan = () => {
    console.log('👁️ Visualizando plano:', plan);
    
    // Adaptar dados usando o adaptador
    const adaptedData = adaptHistoryData(plan);
    console.log('🔄 Dados adaptados para visualização:', adaptedData);
    
    setSelectedPlan(adaptedData);
    setSelectedPlanType(plan.plan_type);
  };

  const handleClosePlanView = () => {
    setSelectedPlan(null);
    setSelectedPlanType(null);
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="h-8 px-2 sm:px-3"
        onClick={handleViewPlan}
      >
        <Eye className="w-4 h-4 sm:mr-1" />
        <span className="hidden sm:inline">Abrir</span>
      </Button>

      {/* Modais para visualizar planos */}
      {selectedPlanType === 'weekly' && selectedPlan && (
        <WeeklyMealPlanModal
          open={!!selectedPlan}
          onOpenChange={handleClosePlanView}
          mealPlan={selectedPlan}
          title="Cardápio Semanal – Educacional"
        />
      )}

      {selectedPlanType === 'daily' && selectedPlan && (
        <DailyMealPlanModal
          open={!!selectedPlan}
          onOpenChange={handleClosePlanView}
          dayPlan={selectedPlan}
          title="Cardápio Diário - Histórico"
        />
      )}
    </>
  );
};