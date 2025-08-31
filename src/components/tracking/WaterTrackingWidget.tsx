import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Droplets, Plus, Target, TrendingUp } from 'lucide-react';
import { useTrackingData } from '@/hooks/useTrackingData';

export const WaterTrackingWidget = () => {
  const { trackingData, addWater, isAddingWater } = useTrackingData();

  if (!trackingData) return null;

  const { water } = trackingData;
  const progressPercentage = (water.todayTotal / water.goal) * 100;
  const isGoalReached = water.todayTotal >= water.goal;

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20" />
      
      <CardHeader className="relative pb-3">
        <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
          <Droplets className="w-5 h-5" />
          Hidratação
        </CardTitle>
      </CardHeader>

      <CardContent className="relative space-y-4">
        {/* Progresso Principal */}
        <div className="text-center space-y-3">
          <div className="relative">
            <motion.div
              className="text-2xl sm:text-3xl font-bold text-blue-600 dark:text-blue-400"
              animate={{ scale: isGoalReached ? [1, 1.1, 1] : 1 }}
              transition={{ duration: 0.5 }}
            >
              {water.todayTotal}
              <span className="text-base sm:text-lg text-muted-foreground">/{water.goal}</span>
            </motion.div>
            <p className="text-sm text-muted-foreground">copos de água</p>
          </div>

          <Progress 
            value={Math.min(progressPercentage, 100)} 
            className="h-3"
          />
          
          <div className="text-xs text-muted-foreground">
            {progressPercentage >= 100 ? (
              <span className="text-green-600 font-medium">🎉 Meta atingida!</span>
            ) : (
              `${Math.round(progressPercentage)}% da meta diária`
            )}
          </div>
        </div>

        {/* Botão de Adicionar */}
        <div className="space-y-2">
          <Button
            onClick={() => addWater(1)}
            disabled={isAddingWater}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isAddingWater ? 'Registrando...' : 'Beber 1 copo'}
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => addWater(2)}
              disabled={isAddingWater}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200"
            >
              +2 copos
            </Button>
            <Button
              onClick={() => addWater(3)}
              disabled={isAddingWater}
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200"
            >
              +3 copos
            </Button>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-blue-200 dark:border-blue-800">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="w-3 h-3 text-blue-500" />
              <span className="text-xs text-muted-foreground">Meta</span>
            </div>
            <p className="text-sm font-medium">{water.goal} copos</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              <span className="text-xs text-muted-foreground">Média</span>
            </div>
            <p className="text-sm font-medium">{water.weeklyAverage} copos</p>
          </div>
        </div>

        {/* Histórico Hoje */}
        {water.today.length > 0 && (
          <div className="pt-3 border-t border-blue-200 dark:border-blue-800">
            <p className="text-xs text-muted-foreground mb-2">Registros de hoje:</p>
            <div className="space-y-1 max-h-20 overflow-y-auto">
              {water.today.slice(0, 3).map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {new Date(entry.recorded_at).toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </span>
                  <span className="font-medium">
                    {Math.floor(entry.amount_ml / 250)} copo{Math.floor(entry.amount_ml / 250) > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
              {water.today.length > 3 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{water.today.length - 3} mais registros
                </p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};