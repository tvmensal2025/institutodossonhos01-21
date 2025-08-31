import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Droplets, 
  Moon, 
  Heart, 
  Activity, 
  Apple, 
  Scale, 
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Zap,
  Brain,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { TrackingDashboard } from './TrackingDashboard';
import { NutritionTracker } from '../nutrition-tracking/NutritionTracker';
import { useTrackingData } from '@/hooks/useTrackingData';
import { useNutritionTracking } from '@/hooks/useNutritionTracking';

interface TrackingOverviewProps {
  className?: string;
}

export const ComprehensiveTrackingDashboard: React.FC<TrackingOverviewProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { trackingData, isLoading } = useTrackingData();
  const { getDailyNutrition, goals } = useNutritionTracking();

  // Calcular score geral do dia
  const calculateDailyScore = () => {
    if (!trackingData) return 0;
    
    const waterScore = Math.min((trackingData.water.todayTotal / trackingData.water.goal) * 100, 100);
    const sleepScore = trackingData.sleep.lastNight ? (trackingData.sleep.lastNight.hours >= 7 ? 100 : (trackingData.sleep.lastNight.hours / 7) * 100) : 0;
    const moodScore = trackingData.mood.today ? (trackingData.mood.today.day_rating / 10) * 100 : 0;
    const exerciseScore = trackingData.exercise.todayMinutes >= 30 ? 100 : (trackingData.exercise.todayMinutes / 30) * 100;
    
    const dailyNutrition = getDailyNutrition(new Date().toISOString().split('T')[0]);
    const nutritionScore = (dailyNutrition.totalCalories / goals.calories) * 100;
    
    return Math.round((waterScore + sleepScore + moodScore + exerciseScore + nutritionScore) / 5);
  };

  const dailyScore = calculateDailyScore();

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🎉';
    if (score >= 60) return '👍';
    return '💪';
  };

  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Score Geral do Dia */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10" />
        
        <CardHeader className="relative">
          <CardTitle className="text-center">
            <motion.div 
              className="flex items-center justify-center gap-3 mb-2"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center ${getScoreColor(dailyScore)}`}>
                <span className="text-2xl font-bold">{dailyScore}</span>
              </div>
              <div className="text-left">
                <h2 className="text-xl font-bold">Score do Dia</h2>
                <p className="text-sm text-muted-foreground">
                  {getScoreEmoji(dailyScore)} {dailyScore >= 80 ? 'Excelente!' : dailyScore >= 60 ? 'Bom trabalho!' : 'Continue assim!'}
                </p>
              </div>
            </motion.div>
          </CardTitle>
        </CardHeader>

        <CardContent className="relative">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {/* Mini cards dos principais indicadores */}
            <div className="text-center space-y-1">
              <Droplets className="w-6 h-6 mx-auto text-blue-500" />
              <p className="text-xs text-muted-foreground">Água</p>
              <p className="font-semibold text-sm">
                {trackingData?.water.todayTotal || 0}/{trackingData?.water.goal || 8}
              </p>
            </div>
            
            <div className="text-center space-y-1">
              <Moon className="w-6 h-6 mx-auto text-purple-500" />
              <p className="text-xs text-muted-foreground">Sono</p>
              <p className="font-semibold text-sm">
                {trackingData?.sleep.lastNight?.hours || 0}h
              </p>
            </div>
            
            <div className="text-center space-y-1">
              <Heart className="w-6 h-6 mx-auto text-red-500" />
              <p className="text-xs text-muted-foreground">Humor</p>
              <p className="font-semibold text-sm">
                {trackingData?.mood.today?.day_rating || 0}/10
              </p>
            </div>
            
            <div className="text-center space-y-1">
              <Activity className="w-6 h-6 mx-auto text-green-500" />
              <p className="text-xs text-muted-foreground">Exercício</p>
              <p className="font-semibold text-sm">
                {trackingData?.exercise.todayMinutes || 0}min
              </p>
            </div>
            
            <div className="text-center space-y-1">
              <Apple className="w-6 h-6 mx-auto text-orange-500" />
              <p className="text-xs text-muted-foreground">Nutrição</p>
              <p className="font-semibold text-sm">
                {Math.round(getDailyNutrition(new Date().toISOString().split('T')[0]).totalCalories)}kcal
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Tracking Detalhado */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger 
            value="overview" 
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Visão Geral</span>
            <span className="sm:hidden">Geral</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="daily" 
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Hábitos Diários</span>
            <span className="sm:hidden">Hábitos</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="nutrition" 
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <Apple className="w-4 h-4" />
            <span className="hidden sm:inline">Nutrição</span>
            <span className="sm:hidden">Nutrição</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="body" 
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <Scale className="w-4 h-4" />
            <span className="hidden sm:inline">Corpo</span>
            <span className="sm:hidden">Peso</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="mind" 
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Mente</span>
            <span className="sm:hidden">Mente</span>
          </TabsTrigger>
          
          <TabsTrigger 
            value="insights" 
            className="flex items-center gap-2 text-xs sm:text-sm"
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Insights IA</span>
            <span className="sm:hidden">IA</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Progresso Semanal
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Meta de Água</span>
                        <Badge variant={trackingData?.water.todayTotal >= trackingData?.water.goal ? 'default' : 'secondary'}>
                          {Math.round(((trackingData?.water.todayTotal || 0) / (trackingData?.water.goal || 1)) * 100)}%
                        </Badge>
                      </div>
                      <Progress value={Math.min(((trackingData?.water.todayTotal || 0) / (trackingData?.water.goal || 1)) * 100, 100)} />
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Meta de Exercício</span>
                        <Badge variant={trackingData?.exercise.todayMinutes >= 30 ? 'default' : 'secondary'}>
                          {Math.round(((trackingData?.exercise.todayMinutes || 0) / 30) * 100)}%
                        </Badge>
                      </div>
                      <Progress value={Math.min(((trackingData?.exercise.todayMinutes || 0) / 30) * 100, 100)} />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Metas de Hoje
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm">💧 Beber 8 copos de água</span>
                        <Badge variant={trackingData?.water.todayTotal >= 8 ? 'default' : 'outline'}>
                          {trackingData?.water.todayTotal >= 8 ? '✅' : '⏳'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm">🏃 Exercitar por 30min</span>
                        <Badge variant={trackingData?.exercise.todayMinutes >= 30 ? 'default' : 'outline'}>
                          {trackingData?.exercise.todayMinutes >= 30 ? '✅' : '⏳'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm">😊 Registrar humor</span>
                        <Badge variant={trackingData?.mood.today ? 'default' : 'outline'}>
                          {trackingData?.mood.today ? '✅' : '⏳'}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="daily" className="space-y-4">
              <TrackingDashboard />
            </TabsContent>

            <TabsContent value="nutrition" className="space-y-4">
              <NutritionTracker />
            </TabsContent>

            <TabsContent value="body" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="w-5 h-5" />
                    Medições Corporais
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Scale className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Seção de medições corporais em desenvolvimento
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Peso, bioimpedância, circunferências e mais
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mind" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    Saúde Mental
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Análise de humor e bem-estar mental em desenvolvimento
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Meditation tracking, stress analysis, gratitude journal
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Insights da Sofia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Análises inteligentes dos seus dados em desenvolvimento
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Padrões, anomalias, recomendações personalizadas
                    </p>
                    <Button variant="outline" className="mt-4">
                      <Zap className="w-4 h-4 mr-2" />
                      Solicitar Análise
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};