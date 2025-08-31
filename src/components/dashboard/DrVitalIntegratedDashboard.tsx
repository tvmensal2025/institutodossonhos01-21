import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Stethoscope, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Activity,
  Heart,
  Brain,
  MessageCircle,
  BarChart3,
  Target,
  Zap,
  Droplets,
  Moon,
  Smile,
  FileText,
  Clock,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import SofiaConversationTracker from './SofiaConversationTracker';
import MedicalDocumentsSection from './MedicalDocumentsSection';
import DrVitalChat from './DrVitalChat';
import { useTrackingData } from '@/hooks/useTrackingData';

interface SofiaConversation {
  id: string;
  message: string;
  is_user: boolean;
  created_at: string;
  analysis_type?: string;
}

interface TrackingSummary {
  water_intake: number;
  sleep_hours: number;
  sleep_quality: number;
  energy_level: number;
  stress_level: number;
  day_rating: number;
  exercise_days: number;
  weight_trend: string;
}

const DrVitalIntegratedDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dr-vital-chat');
  const [sofiaConversations, setSofiaConversations] = useState<SofiaConversation[]>([]);
  const [trackingSummary, setTrackingSummary] = useState<TrackingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const { trackingData } = useTrackingData();

  useEffect(() => {
    loadIntegratedData();
  }, []);

  const loadIntegratedData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar dados básicos do usuário
      const { data: conversations } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .limit(20);

      if (conversations) {
        // Mapear para o formato esperado temporariamente
        setSofiaConversations([]);
      }

      // Calcular resumo do tracking
      const summary = calculateTrackingSummary();
      setTrackingSummary(summary);

    } catch (error) {
      console.error('Erro ao carregar dados integrados:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrackingSummary = (): TrackingSummary => {
    const last7Days = (trackingData as any)?.daily_advanced_tracking?.slice(0, 7) || [];
    const waterData = (trackingData as any)?.water_tracking?.slice(0, 7) || [];
    const sleepData = (trackingData as any)?.sleep_tracking?.slice(0, 7) || [];
    const moodData = (trackingData as any)?.mood_tracking?.slice(0, 7) || [];

    const avgWater = waterData.length > 0 
      ? waterData.reduce((sum, day) => sum + (day.amount_ml || 0), 0) / waterData.length 
      : 0;

    const avgSleep = sleepData.length > 0
      ? sleepData.reduce((sum, day) => sum + (day.hours || 0), 0) / sleepData.length
      : 0;

    const avgSleepQuality = sleepData.length > 0
      ? sleepData.reduce((sum, day) => sum + (day.quality || 0), 0) / sleepData.length
      : 0;

    const avgEnergy = moodData.length > 0
      ? moodData.reduce((sum, day) => sum + (day.energy_level || 0), 0) / moodData.length
      : 0;

    const avgStress = moodData.length > 0
      ? moodData.reduce((sum, day) => sum + (day.stress_level || 0), 0) / moodData.length
      : 0;

    const avgDayRating = moodData.length > 0
      ? moodData.reduce((sum, day) => sum + (day.day_rating || 0), 0) / moodData.length
      : 0;

    const exerciseDays = last7Days.filter(day => day.physical_activity).length;

    // Calcular tendência de peso
    const weightData = (trackingData as any)?.weight_measurements?.slice(0, 7) || [];
    let weightTrend = 'estável';
    if (weightData.length >= 2) {
      const firstWeight = weightData[weightData.length - 1]?.weight_kg || 0;
      const lastWeight = weightData[0]?.weight_kg || 0;
      const difference = lastWeight - firstWeight;
      if (difference > 0.5) weightTrend = 'aumentando';
      else if (difference < -0.5) weightTrend = 'diminuindo';
    }

    return {
      water_intake: avgWater,
      sleep_hours: avgSleep,
      sleep_quality: avgSleepQuality,
      energy_level: avgEnergy,
      stress_level: avgStress,
      day_rating: avgDayRating,
      exercise_days: exerciseDays,
      weight_trend: weightTrend
    };
  };

  const getHealthScore = () => {
    if (!trackingSummary) return 0;
    
    let score = 0;
    const { water_intake, sleep_hours, sleep_quality, energy_level, stress_level, day_rating, exercise_days } = trackingSummary;
    
    // Água (0-20 pontos)
    if (water_intake >= 2000) score += 20;
    else if (water_intake >= 1500) score += 15;
    else if (water_intake >= 1000) score += 10;
    else score += 5;
    
    // Sono (0-20 pontos)
    if (sleep_hours >= 7 && sleep_hours <= 9) score += 20;
    else if (sleep_hours >= 6 && sleep_hours <= 10) score += 15;
    else score += 10;
    
    // Qualidade do sono (0-15 pontos)
    score += (sleep_quality / 5) * 15;
    
    // Energia (0-15 pontos)
    score += (energy_level / 5) * 15;
    
    // Estresse (0-10 pontos) - inverso
    score += ((6 - stress_level) / 5) * 10;
    
    // Avaliação do dia (0-10 pontos)
    score += (day_rating / 5) * 10;
    
    // Exercício (0-10 pontos)
    score += (exercise_days / 7) * 10;
    
    return Math.round(score);
  };

  const getHealthLevel = (score: number) => {
    if (score >= 80) return { level: 'EXCELENTE', color: 'bg-green-100 text-green-800 border-green-200' };
    if (score >= 60) return { level: 'BOM', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (score >= 40) return { level: 'REGULAR', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { level: 'PRECISA MELHORAR', color: 'bg-red-100 text-red-800 border-red-200' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  const healthScore = getHealthScore();
  const healthLevel = getHealthLevel(healthScore);

  return (
    <div className="space-y-4 xs:space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 xs:gap-4">
        <div className="flex items-center space-x-3 xs:space-x-4">
          <div className="w-10 h-10 xs:w-12 xs:h-12 bg-blue-500/20 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="http://45.67.221.216:8086/Dr.Vital.png"
              alt="Dr. Vital"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <h1 className="text-xl xs:text-2xl sm:text-3xl font-bold">Dr. Vital - Dashboard Integrado</h1>
            <p className="text-base xs:text-lg text-muted-foreground">Análise preventiva e conversas com Sofia & Dr. Vital</p>
          </div>
        </div>
        <Badge className={`${healthLevel.color} text-sm xs:text-base px-3 xs:px-4 py-2`}>
          <Heart className="w-4 h-4 xs:w-5 xs:h-5 mr-1 xs:mr-2" />
          Score: {healthScore}/100
        </Badge>
      </div>

      {/* Score de Saúde */}
      <Card className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500 shadow-lg">
        <CardHeader className="p-4 xs:p-5 sm:p-6">
          <CardTitle className="flex items-center space-x-2 text-lg xs:text-xl">
            <Activity className="w-6 h-6 xs:w-7 xs:h-7 text-white" />
            <span>Score de Saúde Geral</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 xs:p-5 sm:p-6">
          <div className="flex flex-col xs:flex-row items-center justify-between gap-4 xs:gap-6">
            <div className="text-center xs:text-left">
              <div className="text-xl xs:text-2xl sm:text-3xl font-bold text-white">{healthScore}/100</div>
              <div className="text-sm xs:text-base text-blue-100 mt-1 xs:mt-2">{healthLevel.level}</div>
            </div>
            <div className="w-20 h-20 xs:w-24 xs:h-24 relative">
              <svg className="w-20 h-20 xs:w-24 xs:h-24 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-blue-300"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(healthScore / 100) * 251.2} 251.2`}
                  className="text-white transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-base xs:text-lg font-bold text-white">{healthScore}%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4 xs:space-y-5">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dr-vital-chat" className="flex items-center space-x-2 text-sm xs:text-base">
            <Stethoscope className="w-4 h-4 xs:w-5 xs:h-5" />
            <span>Dr. Vital</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center space-x-2 text-sm xs:text-base">
            <FileText className="w-4 h-4 xs:w-5 xs:h-5" />
            <span>Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center space-x-2 text-sm xs:text-base">
            <Brain className="w-4 h-4 xs:w-5 xs:h-5" />
            <span>Insights</span>
          </TabsTrigger>
        </TabsList>

        {/* Chat do Dr. Vital */}
        <TabsContent value="dr-vital-chat" className="space-y-4 xs:space-y-5">
          <DrVitalChat />
        </TabsContent>

        {/* Documentos Médicos */}
        <TabsContent value="documents" className="space-y-4 xs:space-y-5">
          <MedicalDocumentsSection />
        </TabsContent>

        {/* Insights do Dr. Vital */}
        <TabsContent value="insights" className="space-y-4 xs:space-y-5">
          <div className="grid grid-cols-1 gap-4 xs:gap-5">
            {/* Insights Baseados no Tracking */}
            <Card>
              <CardHeader className="p-4 xs:p-5 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-lg xs:text-xl">
                  <Brain className="w-6 h-6 xs:w-7 xs:h-7 text-blue-600" />
                  <span>Insights do Tracking</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 xs:space-y-4 p-4 xs:p-5 sm:p-6">
                {trackingSummary && (
                  <>
                    {trackingSummary.water_intake < 2000 && (
                      <div className="flex items-center space-x-2 p-3 xs:p-4 bg-blue-50 rounded">
                        <Droplets className="w-5 h-5 xs:w-6 xs:h-6 text-blue-600" />
                        <span className="text-base xs:text-lg text-blue-700">
                          Consumo de água abaixo do recomendado. Tente beber mais água!
                        </span>
                      </div>
                    )}
                    
                    {trackingSummary.sleep_hours < 7 && (
                      <div className="flex items-center space-x-2 p-3 xs:p-4 bg-purple-50 rounded">
                        <Moon className="w-5 h-5 xs:w-6 xs:h-6 text-purple-600" />
                        <span className="text-base xs:text-lg text-purple-700">
                          Horas de sono insuficientes. Priorize 7-9 horas de sono.
                        </span>
                      </div>
                    )}
                    
                    {trackingSummary.energy_level < 3 && (
                      <div className="flex items-center space-x-2 p-3 xs:p-4 bg-yellow-50 rounded">
                        <Zap className="w-5 h-5 xs:w-6 xs:h-6 text-yellow-600" />
                        <span className="text-base xs:text-lg text-yellow-700">
                          Nível de energia baixo. Considere melhorar alimentação e exercícios.
                        </span>
                      </div>
                    )}
                    
                    {trackingSummary.exercise_days < 3 && (
                      <div className="flex items-center space-x-2 p-3 xs:p-4 bg-green-50 rounded">
                        <Target className="w-5 h-5 xs:w-6 xs:h-6 text-green-600" />
                        <span className="text-base xs:text-lg text-green-700">
                          Poucos dias de exercício. Tente se exercitar mais vezes na semana.
                        </span>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recomendações Personalizadas */}
            <Card>
              <CardHeader className="p-4 xs:p-5 sm:p-6">
                <CardTitle className="flex items-center space-x-2 text-lg xs:text-xl">
                  <CheckCircle className="w-6 h-6 xs:w-7 xs:h-7 text-green-600" />
                  <span>Recomendações</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 xs:space-y-4 p-4 xs:p-5 sm:p-6">
                <div className="space-y-2 xs:space-y-3">
                  <div className="flex items-center space-x-2 xs:space-x-3">
                    <Clock className="w-5 h-5 xs:w-6 xs:h-6 text-blue-600" />
                    <span className="text-base xs:text-lg font-medium">Lembretes Diários</span>
                  </div>
                  <ul className="text-sm xs:text-base text-muted-foreground space-y-1 xs:space-y-2 ml-6 xs:ml-8">
                    <li>• Beber água a cada 2 horas</li>
                    <li>• Fazer alongamentos pela manhã</li>
                    <li>• Registrar peso semanalmente</li>
                    <li>• Conversar com Sofia diariamente</li>
                  </ul>
                </div>
                
                <div className="space-y-2 xs:space-y-3">
                  <div className="flex items-center space-x-2 xs:space-x-3">
                    <Target className="w-5 h-5 xs:w-6 xs:h-6 text-green-600" />
                    <span className="text-base xs:text-lg font-medium">Metas Semanais</span>
                  </div>
                  <ul className="text-sm xs:text-base text-muted-foreground space-y-1 xs:space-y-2 ml-6 xs:ml-8">
                    <li>• Exercitar-se 3-4 vezes</li>
                    <li>• Dormir 7-8 horas por noite</li>
                    <li>• Beber 2L de água por dia</li>
                    <li>• Manter conversas com Sofia</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DrVitalIntegratedDashboard; 