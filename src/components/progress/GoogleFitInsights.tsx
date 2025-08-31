import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Target, Award, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';

interface GoogleFitInsightsProps {
  data: any[];
  period: 'day' | 'week' | 'month';
  userGoals: {
    stepsGoal: number;
    sleepGoal: number;
    activeMinutesGoal: number;
    caloriesGoal: number;
    heartRateGoal: number;
    weightGoal: number;
  };
}

export const GoogleFitInsights: React.FC<GoogleFitInsightsProps> = ({ 
  data, 
  period,
  userGoals 
}) => {
  const cardVariants = { 
    hidden: { opacity: 0, y: 20 }, 
    visible: { opacity: 1, y: 0 } 
  };

  // Calcular insights
  const calculateInsights = () => {
    if (!data || data.length === 0) return [];

    const insights = [];

    // Calcular médias
    const avgSteps = data.reduce((sum, d) => sum + (d.steps || 0), 0) / data.length;
    const avgCalories = data.reduce((sum, d) => sum + (d.calories || 0), 0) / data.length;
    const avgActiveMinutes = data.reduce((sum, d) => sum + (d.active_minutes || 0), 0) / data.length;
    const avgSleepHours = data.reduce((sum, d) => sum + (d.sleep_hours || 0), 0) / data.length;

    // Insight de passos
    if (avgSteps > 0) {
      const stepsPercentage = (avgSteps / userGoals.stepsGoal) * 100;
      if (stepsPercentage >= 100) {
        insights.push({
          type: 'success',
          icon: <Award className="w-5 h-5 text-green-600" />,
          title: 'Meta de Passos Atingida!',
          description: `Você está caminhando ${Math.round(avgSteps)} passos em média, superando sua meta de ${userGoals.stepsGoal}!`,
          color: 'text-green-600'
        });
      } else if (stepsPercentage >= 70) {
        insights.push({
          type: 'warning',
          icon: <Target className="w-5 h-5 text-yellow-600" />,
          title: 'Quase Lá!',
          description: `Você está a ${Math.round(100 - stepsPercentage)}% da sua meta de passos. Continue assim!`,
          color: 'text-yellow-600'
        });
      } else {
        insights.push({
          type: 'info',
          icon: <TrendingUp className="w-5 h-5 text-blue-600" />,
          title: 'Aumente sua Atividade',
          description: `Tente aumentar seus passos diários para atingir a meta de ${userGoals.stepsGoal}.`,
          color: 'text-blue-600'
        });
      }
    }

    // Insight de calorias
    if (avgCalories > 0) {
      const caloriesPercentage = (avgCalories / userGoals.caloriesGoal) * 100;
      if (caloriesPercentage >= 100) {
        insights.push({
          type: 'success',
          icon: <Zap className="w-5 h-5 text-orange-600" />,
          title: 'Calorias Queimadas!',
          description: `Você está queimando ${Math.round(avgCalories)} calorias em média, excelente trabalho!`,
          color: 'text-orange-600'
        });
      }
    }

    // Insight de minutos ativos
    if (avgActiveMinutes > 0) {
      const activePercentage = (avgActiveMinutes / userGoals.activeMinutesGoal) * 100;
      if (activePercentage >= 100) {
        insights.push({
          type: 'success',
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          title: 'Atividade Física Suficiente',
          description: `Você está fazendo ${Math.round(avgActiveMinutes)} minutos de atividade física em média!`,
          color: 'text-green-600'
        });
      } else {
        insights.push({
          type: 'warning',
          icon: <Clock className="w-5 h-5 text-yellow-600" />,
          title: 'Mais Atividade Física',
          description: `Tente aumentar para ${userGoals.activeMinutesGoal} minutos de atividade física por dia.`,
          color: 'text-yellow-600'
        });
      }
    }

    // Insight de sono
    if (avgSleepHours > 0) {
      if (avgSleepHours >= userGoals.sleepGoal) {
        insights.push({
          type: 'success',
          icon: <CheckCircle className="w-5 h-5 text-indigo-600" />,
          title: 'Sono Adequado',
          description: `Você está dormindo ${avgSleepHours.toFixed(1)} horas em média, ótimo para sua saúde!`,
          color: 'text-indigo-600'
        });
      } else {
        insights.push({
          type: 'warning',
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          title: 'Sono Insuficiente',
          description: `Tente dormir pelo menos ${userGoals.sleepGoal} horas por noite para melhor recuperação.`,
          color: 'text-red-600'
        });
      }
    }

    // Insight de consistência
    const daysWithData = data.filter(d => d.steps > 0).length;
    const consistencyPercentage = (daysWithData / data.length) * 100;
    
    if (consistencyPercentage >= 80) {
      insights.push({
        type: 'success',
        icon: <Award className="w-5 h-5 text-purple-600" />,
        title: 'Excelente Consistência!',
        description: `Você está rastreando sua atividade em ${Math.round(consistencyPercentage)}% dos dias!`,
        color: 'text-purple-600'
      });
    }

    // Insight de progresso (comparar com período anterior)
    if (data.length >= 7) {
      const recentWeek = data.slice(0, 7);
      const previousWeek = data.slice(7, 14);
      
      if (previousWeek.length >= 7) {
        const recentAvg = recentWeek.reduce((sum, d) => sum + (d.steps || 0), 0) / 7;
        const previousAvg = previousWeek.reduce((sum, d) => sum + (d.steps || 0), 0) / 7;
        
        if (recentAvg > previousAvg * 1.1) {
          insights.push({
            type: 'success',
            icon: <TrendingUp className="w-5 h-5 text-green-600" />,
            title: 'Progresso Positivo!',
            description: `Sua atividade aumentou ${Math.round(((recentAvg - previousAvg) / previousAvg) * 100)}% em relação à semana anterior!`,
            color: 'text-green-600'
          });
        } else if (recentAvg < previousAvg * 0.9) {
          insights.push({
            type: 'warning',
            icon: <TrendingDown className="w-5 h-5 text-red-600" />,
            title: 'Atividade Diminuiu',
            description: `Sua atividade diminuiu ${Math.round(((previousAvg - recentAvg) / previousAvg) * 100)}% em relação à semana anterior.`,
            color: 'text-red-600'
          });
        }
      }
    }

    return insights;
  };

  const insights = calculateInsights();

  return (
    <motion.div variants={cardVariants}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Insights Inteligentes - {period === 'day' ? 'Hoje' : period === 'week' ? 'Esta Semana' : 'Este Mês'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {insights.length > 0 ? (
            <div className="space-y-4">
              {insights.map((insight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-shrink-0 mt-1">
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className={`font-semibold ${insight.color}`}>
                      {insight.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      {insight.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Continue rastreando sua atividade para receber insights personalizados!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
