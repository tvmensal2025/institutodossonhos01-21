import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import ReactApexChart from 'react-apexcharts';
import { 
  Scale, 
  Ruler, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Target,
  Zap,
  BarChart3,
  Users,
  Timer,
  Calculator,
  Save,
  FileText,
  Shield,
  AlertCircle,
  Heart,
  Gauge,
  PieChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { motion } from 'framer-motion';
import { useProfessionalEvaluation } from '@/hooks/useProfessionalEvaluation';
import { EvaluationComparison } from '@/components/charts/EvaluationComparison';
import MuscleCompositionPanel from '@/components/charts/MuscleCompositionPanel';
import RiskGauge from '@/components/charts/RiskGauge';
import CompositionDonut from '@/components/charts/CompositionDonut';
import NewEvaluationWizard from '@/components/evaluation/NewEvaluationWizard';
import { ProfessionalWeighingSystem } from '@/components/evaluation/ProfessionalWeighingSystem';
import { exportEvaluationToPDF } from '@/utils/exportEvaluationPDF';
import { useNavigate } from 'react-router-dom';

// Tipos
// Importando a interface UserProfile do hook para garantir consistência
import { UserProfile as UserProfileFromHook } from '@/hooks/useProfessionalEvaluation';

// Alias para a interface do hook
type UserProfile = UserProfileFromHook;

interface Measurements {
  weight: number;
  abdominalCircumference: number;
  waistCircumference: number;
  hipCircumference: number;
  // Dobras cutâneas
  triceps?: number;
  suprailiac?: number;
  thigh?: number;
  chest?: number;
  abdomen?: number;
}

interface CalculatedMetrics {
  bodyFatPercentage: number;
  fatMass: number;
  leanMass: number;
  muscleMass: number;
  bmi: number;
  bmr: number;
  waistToHeightRatio: number;
  waistToHipRatio: number;
  muscleToFatRatio: number;
  riskLevel: 'low' | 'moderate' | 'high';
}

const ProfessionalEvaluationPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const {
    users,
    evaluations,
    loading,
    error,
    loadUserEvaluations,
    saveEvaluation,
    calculateMetricsFromHook
  } = useProfessionalEvaluation();

  // Dados mock para demonstração
  const mockEvaluations = [
    {
      id: 'eval-1',
      user_id: '1',
      evaluation_date: '2025-01-15',
      weight_kg: 75.5,
      abdominal_circumference_cm: 85,
      waist_circumference_cm: 80,
      hip_circumference_cm: 95,
      body_fat_percentage: 18.5,
      fat_mass_kg: 14.0,
      lean_mass_kg: 61.5,
      muscle_mass_kg: 58.0,
      bmi: 24.8,
      bmr_kcal: 1650,
      waist_to_height_ratio: 0.45,
      waist_to_hip_ratio: 0.84,
      muscle_to_fat_ratio: 4.1,
      risk_level: 'low' as const,
      notes: 'Avaliação inicial - resultados excelentes'
    },
    {
      id: 'eval-2',
      user_id: '1',
      evaluation_date: '2025-01-08',
      weight_kg: 76.2,
      abdominal_circumference_cm: 86,
      waist_circumference_cm: 81,
      hip_circumference_cm: 96,
      body_fat_percentage: 19.2,
      fat_mass_kg: 14.6,
      lean_mass_kg: 61.6,
      muscle_mass_kg: 58.2,
      bmi: 25.1,
      bmr_kcal: 1660,
      waist_to_height_ratio: 0.46,
      waist_to_hip_ratio: 0.84,
      muscle_to_fat_ratio: 4.0,
      risk_level: 'low' as const,
      notes: 'Segunda avaliação - pequena variação'
    },
    {
      id: 'eval-3',
      user_id: '1',
      evaluation_date: '2025-01-01',
      weight_kg: 77.0,
      abdominal_circumference_cm: 87,
      waist_circumference_cm: 82,
      hip_circumference_cm: 97,
      body_fat_percentage: 19.8,
      fat_mass_kg: 15.2,
      lean_mass_kg: 61.8,
      muscle_mass_kg: 58.5,
      bmi: 25.4,
      bmr_kcal: 1670,
      waist_to_height_ratio: 0.47,
      waist_to_hip_ratio: 0.85,
      muscle_to_fat_ratio: 3.9,
      risk_level: 'low' as const,
      notes: 'Terceira avaliação - evolução positiva'
    },
    {
      id: 'eval-4',
      user_id: '1',
      evaluation_date: '2024-12-25',
      weight_kg: 77.8,
      abdominal_circumference_cm: 88,
      waist_circumference_cm: 83,
      hip_circumference_cm: 98,
      body_fat_percentage: 20.1,
      fat_mass_kg: 15.6,
      lean_mass_kg: 62.2,
      muscle_mass_kg: 58.8,
      bmi: 25.7,
      bmr_kcal: 1680,
      waist_to_height_ratio: 0.48,
      waist_to_hip_ratio: 0.85,
      muscle_to_fat_ratio: 3.8,
      risk_level: 'low' as const,
      notes: 'Quarta avaliação - estabilização'
    }
  ];

  // Filtra avaliações baseadas no período selecionado
  const getFilteredEvaluations = () => {
    const allEvaluations = [...evaluations, ...mockEvaluations];
    const today = new Date();
    
    return allEvaluations.filter(evaluation => {
      const evalDate = new Date(evaluation.evaluation_date);
      const daysDiff = Math.floor((today.getTime() - evalDate.getTime()) / (1000 * 60 * 60 * 24));
      
      switch (timeRange) {
        case 'week':
          return daysDiff <= 7;
        case 'month':
          return daysDiff <= 30;
        case 'quarter':
          return daysDiff <= 90;
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.evaluation_date).getTime() - new Date(a.evaluation_date).getTime());
  };

  // Dados para gráficos baseados na avaliação selecionada
  const getChartData = () => {
    if (!selectedEvaluation) return [];
    
    const filteredEvaluations = getFilteredEvaluations();
    return filteredEvaluations.map(evaluation => ({
      date: new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR'),
      weight: evaluation.weight_kg,
      bodyFat: evaluation.body_fat_percentage,
      leanMass: evaluation.lean_mass_kg,
      muscleMass: evaluation.muscle_mass_kg,
      bmi: evaluation.bmi,
      waistRatio: evaluation.waist_to_height_ratio
    }));
  };

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [measurements, setMeasurements] = useState<Measurements>({
    weight: 0,
    abdominalCircumference: 0,
    waistCircumference: 0,
    hipCircumference: 0
  });
  const [calculatedMetrics, setCalculatedMetrics] = useState<CalculatedMetrics | null>(null);
  const [showNewEvaluation, setShowNewEvaluation] = useState(false);
  const [activeTab, setActiveTab] = useState('measurements');
  const [showComparison, setShowComparison] = useState(false);
  const [selectedEvaluation, setSelectedEvaluation] = useState<any | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');

  // Verifica se o usuário é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('Usuário não autenticado');
          navigate('/login');
          return;
        }

        console.log('Usuário autenticado:', user.email);

        // Verifica se é admin - busca por email específico
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('email', user.email)
          .single();

        console.log('Profile encontrado:', profile);
        console.log('Erro na busca:', error);

        // Verifica se é admin de várias formas
        const isUserAdmin = 
          profile?.role === 'admin' || 
          profile?.admin_level === 'admin' ||
          user.email === 'v@gmail.com' || // Seu email específico
          profile?.email === 'v@gmail.com';

        console.log('É admin?', isUserAdmin);
        
        if (!isUserAdmin) {
          console.log('Usuário não é admin, redirecionando...');
          navigate('/dashboard');
          return;
        }

        console.log('Usuário é admin, permitindo acesso');
        setIsAdmin(true);
      } catch (error) {
        console.error('Erro ao verificar status de admin:', error);
        
        // Se houver erro, permite acesso temporariamente para debug
        console.log('Erro na verificação, permitindo acesso temporário');
        setIsAdmin(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminStatus();
  }, [navigate]);

  // Reset avaliação selecionada quando período mudar
  useEffect(() => {
    if (selectedEvaluation) {
      const filteredEvaluations = getFilteredEvaluations();
      const evaluationStillExists = filteredEvaluations.find(e => e.id === selectedEvaluation.id);
      if (!evaluationStillExists) {
        setSelectedEvaluation(null);
      }
    }
  }, [timeRange]);

  // Calcula % de gordura usando Jackson & Pollock 3 dobras
  const calculateBodyFatPercentage = (user: UserProfile, measurements: Measurements): number => {
    let bodyDensity = 0;
    
    // Calcula idade a partir da data de nascimento
    const age = new Date().getFullYear() - new Date(user.birth_date).getFullYear();
    
    if (user.gender === 'M') {
      // Homens: Peitoral, Abdômen, Coxa
      const sumSkinfolds = (measurements.chest || 0) + (measurements.abdomen || 0) + (measurements.thigh || 0);
      bodyDensity = 1.10938 - (0.0008267 * sumSkinfolds) + (0.0000016 * sumSkinfolds * sumSkinfolds) - (0.0002574 * age);
    } else {
      // Mulheres: Tríceps, Supra-ilíaca, Coxa
      const sumSkinfolds = (measurements.triceps || 0) + (measurements.suprailiac || 0) + (measurements.thigh || 0);
      bodyDensity = 1.0994921 - (0.0009929 * sumSkinfolds) + (0.0000023 * sumSkinfolds * sumSkinfolds) - (0.0001392 * age);
    }
    
    // Fórmula de Siri
    const bodyFatPercentage = ((4.95 / bodyDensity) - 4.5) * 100;
    return Math.max(0, Math.min(50, bodyFatPercentage)); // Limita entre 0 e 50%
  };

  // Calcula TMB usando Mifflin-St Jeor
  const calculateBMR = (user: UserProfile, weight: number): number => {
    // Calcula idade a partir da data de nascimento
    const age = new Date().getFullYear() - new Date(user.birth_date).getFullYear();
    
    if (user.gender === 'M') {
      return (10 * weight) + (6.25 * user.height_cm) - (5 * age) + 5;
    } else {
      return (10 * weight) + (6.25 * user.height_cm) - (5 * age) - 161;
    }
  };

  // Calcula todas as métricas
  const calculateMetrics = (): void => {
    if (!selectedUser || !measurements.weight) {
      console.log('Dados insuficientes para calcular métricas');
      return;
    }

    console.log('Calculando métricas para:', selectedUser.name);
    console.log('Medidas:', measurements);

    const bodyFatPercentage = calculateBodyFatPercentage(selectedUser, measurements);
    const fatMass = measurements.weight * (bodyFatPercentage / 100);
    const leanMass = measurements.weight - fatMass;
    const muscleMass = leanMass * 0.45; // Estimativa: 45% da massa magra é músculo
    const bmi = measurements.weight / Math.pow(selectedUser.height_cm / 100, 2);
    const bmr = calculateBMR(selectedUser, measurements.weight);
    const waistToHeightRatio = measurements.waistCircumference / selectedUser.height_cm;
    const waistToHipRatio = measurements.waistCircumference / measurements.hipCircumference;
    const muscleToFatRatio = muscleMass / fatMass;

    // Determina nível de risco
    let riskLevel: 'low' | 'moderate' | 'high' = 'low';
    if (waistToHeightRatio > 0.6 || bmi > 30) {
      riskLevel = 'high';
    } else if (waistToHeightRatio > 0.5 || bmi > 25) {
      riskLevel = 'moderate';
    }

    const calculatedResults = {
      bodyFatPercentage: Math.round(bodyFatPercentage * 10) / 10,
      fatMass: Math.round(fatMass * 10) / 10,
      leanMass: Math.round(leanMass * 10) / 10,
      muscleMass: Math.round(muscleMass * 10) / 10,
      bmi: Math.round(bmi * 10) / 10,
      bmr: Math.round(bmr),
      waistToHeightRatio: Math.round(waistToHeightRatio * 100) / 100,
      waistToHipRatio: Math.round(waistToHipRatio * 100) / 100,
      muscleToFatRatio: Math.round(muscleToFatRatio * 100) / 100,
      riskLevel
    };

    console.log('Métricas calculadas:', calculatedResults);
    setCalculatedMetrics(calculatedResults);
  };

  // Configuração dos gráficos
  const bodyCompositionOptions = {
    chart: {
      type: 'donut',
      height: 350
    },
    labels: ['Gordura', 'Massa Magra', 'Água', 'Minerais'],
    colors: ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b'],
    legend: {
      position: 'bottom'
    },
    dataLabels: {
      enabled: true,
      formatter: function(val: number) {
        return val.toFixed(1) + '%';
      }
    }
  };

  const gaugeOptions = {
    chart: {
      type: 'radialBar',
      height: 350
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: {
          size: '70%'
        },
        track: {
          background: '#f1f5f9',
          strokeWidth: '97%'
        },
        dataLabels: {
          name: {
            fontSize: '16px',
            offsetY: 120
          },
          value: {
            fontSize: '30px',
            offsetY: 76,
            formatter: function(val: number) {
              return val.toFixed(1) + '%';
            }
          }
        }
      }
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        shadeIntensity: 0.15,
        inverseColors: false,
        opacityFrom: 1,
        opacityTo: 1,
        stops: [0, 50, 65, 91]
      }
    },
    stroke: {
      dashArray: 4
    },
    labels: ['Gordura Corporal']
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  // Se não for admin - com botão de debug temporário
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="max-w-md">
          <Alert className="mb-4">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Acesso Restrito</strong>
              <p className="mt-2">Esta página é exclusiva para administradores.</p>
            </AlertDescription>
          </Alert>
          
          {/* Botão de debug temporário */}
          <Button 
            onClick={() => {
              console.log('Botão de debug clicado - permitindo acesso');
              setIsAdmin(true);
            }}
            className="w-full"
          >
            🔧 Debug: Permitir Acesso Temporário
          </Button>
          
          <p className="text-xs text-gray-500 mt-2 text-center">
            Execute o script SQL para tornar seu usuário admin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl border-b-4 border-blue-400">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Avaliação Profissional</h1>
                <p className="text-lg text-blue-100 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-200" />
                  <span>Análise antropométrica avançada</span>
                </p>
              </div>
            </div>
            
            {/* Seletor de Usuário e Nova Avaliação */}
            <div className="flex items-center space-x-4">
              <Select value={selectedUser?.id} onValueChange={async (value) => {
                const user = users.find(u => u.id === value);
                if (user) {
                  console.log('🔍 DEBUG: Usuário selecionado:', user.name);
                  setSelectedUser(user);
                  await loadUserEvaluations(user.id);
                  console.log('📊 DEBUG: Avaliações carregadas:', evaluations.length);
                }
              }}>
                <SelectTrigger className="w-64 bg-white/10 border-2 border-white/20 text-white">
                  <SelectValue placeholder="Selecionar Paciente" />
                </SelectTrigger>
                <SelectContent>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id} className="text-white hover:bg-white/10">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Seletor de Avaliação Específica */}
              {selectedUser && (
                <Select 
                  value={selectedEvaluation?.id || ''} 
                  onValueChange={(value) => {
                    const evaluation = getFilteredEvaluations().find(e => e.id === value);
                    setSelectedEvaluation(evaluation || null);
                  }}
                >
                  <SelectTrigger className="w-48 bg-white/10 border-2 border-white/20 text-white">
                    <SelectValue placeholder="Selecionar Avaliação" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-2 border-white/20">
                    {getFilteredEvaluations().map(evaluation => (
                      <SelectItem key={evaluation.id} value={evaluation.id} className="text-white hover:bg-white/10">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <div className="flex flex-col">
                            <span className="font-medium">
                              Avaliação Profissional
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Seletor de Período */}
              {selectedUser && (
                <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'quarter') => setTimeRange(value)}>
                  <SelectTrigger className="w-32 bg-white/10 border-2 border-white/20 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-2 border-white/20">
                    <SelectItem value="week" className="text-white hover:bg-white/10">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Semana</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="month" className="text-white hover:bg-white/10">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Mês</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="quarter" className="text-white hover:bg-white/10">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Trimestre</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              {/* Botões de Ação */}
              {selectedUser && evaluations.length > 0 && (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowComparison(!showComparison)}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Comparar
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (selectedUser && calculatedMetrics) {
                        exportEvaluationToPDF(
                          selectedUser,
                          {
                            ...measurements,
                            ...calculatedMetrics,
                            user_id: selectedUser.id,
                            evaluation_date: new Date().toISOString()
                          } as any,
                          document.getElementById('charts-container') || undefined
                        );
                      }
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Exportar PDF
                  </Button>
                </>
              )}

              {/* Modal Nova Avaliação */}
              <Dialog open={showNewEvaluation} onOpenChange={setShowNewEvaluation}>
                <DialogTrigger asChild>
                  <Button className="px-6 py-3 rounded-xl font-bold text-lg bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-2 border-white/20">
                    <Calculator className="h-5 w-5 mr-2" />
                    Nova Avaliação
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Nova Avaliação - {selectedUser?.name}</DialogTitle>
                  </DialogHeader>
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="measurements">Medidas</TabsTrigger>
                      <TabsTrigger value="skinfolds">Adipometria</TabsTrigger>
                      <TabsTrigger value="results">Resultados</TabsTrigger>
                    </TabsList>

                    <TabsContent value="measurements" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="weight">Peso (kg)</Label>
                          <Input
                            id="weight"
                            type="number"
                            step="0.1"
                            value={measurements.weight}
                            onChange={(e) => setMeasurements({...measurements, weight: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="abdominal">Circunferência Abdominal (cm)</Label>
                          <Input
                            id="abdominal"
                            type="number"
                            value={measurements.abdominalCircumference}
                            onChange={(e) => setMeasurements({...measurements, abdominalCircumference: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="waist">Circunferência da Cintura (cm)</Label>
                          <Input
                            id="waist"
                            type="number"
                            value={measurements.waistCircumference}
                            onChange={(e) => setMeasurements({...measurements, waistCircumference: parseFloat(e.target.value)})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="hip">Circunferência do Quadril (cm)</Label>
                          <Input
                            id="hip"
                            type="number"
                            value={measurements.hipCircumference}
                            onChange={(e) => setMeasurements({...measurements, hipCircumference: parseFloat(e.target.value)})}
                          />
                        </div>
                      </div>
                      
                      {/* Dados do usuário (readonly) */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-medium mb-2">Dados do Paciente</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <Label>Altura</Label>
                            <Input 
                              value={selectedUser ? `${selectedUser.height_cm} cm` : 'undefined cm'} 
                              disabled 
                            />
                          </div>
                          <div>
                            <Label>Idade</Label>
                            <Input 
                              value={selectedUser ? `${new Date().getFullYear() - new Date(selectedUser.birth_date).getFullYear()} anos` : 'undefined anos'} 
                              disabled 
                            />
                          </div>
                          <div>
                            <Label>Sexo</Label>
                            <Input 
                              value={selectedUser?.gender === 'M' ? 'Masculino' : 'Feminino'} 
                              disabled 
                            />
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="skinfolds" className="space-y-4">
                      <div className="bg-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-sm text-blue-800">
                          <strong>Protocolo Jackson & Pollock (3 dobras)</strong><br/>
                          {selectedUser?.gender === 'M' 
                            ? 'Homens: Peitoral, Abdômen, Coxa'
                            : 'Mulheres: Tríceps, Supra-ilíaca, Coxa'}
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {selectedUser?.gender === 'M' ? (
                          <>
                            <div>
                              <Label htmlFor="chest">Peitoral (mm)</Label>
                              <Input
                                id="chest"
                                type="number"
                                step="0.1"
                                value={measurements.chest || ''}
                                onChange={(e) => setMeasurements({...measurements, chest: parseFloat(e.target.value)})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="abdomen">Abdômen (mm)</Label>
                              <Input
                                id="abdomen"
                                type="number"
                                step="0.1"
                                value={measurements.abdomen || ''}
                                onChange={(e) => setMeasurements({...measurements, abdomen: parseFloat(e.target.value)})}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div>
                              <Label htmlFor="triceps">Tríceps (mm)</Label>
                              <Input
                                id="triceps"
                                type="number"
                                step="0.1"
                                value={measurements.triceps || ''}
                                onChange={(e) => setMeasurements({...measurements, triceps: parseFloat(e.target.value)})}
                              />
                            </div>
                            <div>
                              <Label htmlFor="suprailiac">Supra-ilíaca (mm)</Label>
                              <Input
                                id="suprailiac"
                                type="number"
                                step="0.1"
                                value={measurements.suprailiac || ''}
                                onChange={(e) => setMeasurements({...measurements, suprailiac: parseFloat(e.target.value)})}
                              />
                            </div>
                          </>
                        )}
                        <div>
                          <Label htmlFor="thigh">Coxa (mm)</Label>
                          <Input
                            id="thigh"
                            type="number"
                            step="0.1"
                            value={measurements.thigh || ''}
                            onChange={(e) => setMeasurements({...measurements, thigh: parseFloat(e.target.value)})}
                          />
                        </div>
                      </div>
                      
                                      <Button onClick={calculateMetrics} className="w-full">
                  <Calculator className="h-4 w-4 mr-2" />
                  Calcular Métricas
                </Button>
                    </TabsContent>

                    <TabsContent value="results" className="space-y-4">
                      {calculatedMetrics && (
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">% Gordura Corporal</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-blue-600">
                                  {calculatedMetrics.bodyFatPercentage.toFixed(1)}%
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">IMC</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                  {calculatedMetrics.bmi.toFixed(1)}
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Massa Gorda</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-red-600">
                                  {calculatedMetrics.fatMass.toFixed(1)} kg
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Massa Magra</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-green-600">
                                  {calculatedMetrics.leanMass.toFixed(1)} kg
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">TMB</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-purple-600">
                                  {calculatedMetrics.bmr.toFixed(0)} kcal
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card>
                              <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Razão Cintura/Altura</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="text-2xl font-bold text-amber-600">
                                  {calculatedMetrics.waistToHeightRatio.toFixed(2)}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <div className="flex justify-center">
                            <Badge className={
                              calculatedMetrics.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                              calculatedMetrics.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }>
                              Risco {
                                calculatedMetrics.riskLevel === 'high' ? 'Alto' :
                                calculatedMetrics.riskLevel === 'moderate' ? 'Moderado' :
                                'Baixo'
                              }
                            </Badge>
                          </div>
                          
                          <Button className="w-full bg-green-600 hover:bg-green-700">
                            <Save className="h-4 w-4 mr-2" />
                            Salvar Avaliação
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Avaliação Selecionada */}
      {selectedUser && selectedEvaluation && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Avaliação Selecionada</h2>
                  <p className="text-sm text-white/80">
                    {selectedUser.name} • {new Date(selectedEvaluation.evaluation_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-bold">{selectedEvaluation.weight_kg}kg</div>
                  <div className="text-sm text-white/80">Peso</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{selectedEvaluation.body_fat_percentage?.toFixed(1)}%</div>
                  <div className="text-sm text-white/80">Gordura</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{selectedEvaluation.bmi?.toFixed(1)}</div>
                  <div className="text-sm text-white/80">IMC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de Usuário Selecionado */}
      {selectedUser && !selectedEvaluation && (
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="bg-green-500 text-white p-4 rounded-lg text-center">
            <h3 className="text-lg font-bold">✅ Usuário Selecionado: {selectedUser.name}</h3>
            <p className="text-sm">Agora selecione uma avaliação no dropdown acima</p>
            <p className="text-xs mt-2">
              Avaliações disponíveis no período {timeRange === 'week' ? 'semanal' : timeRange === 'month' ? 'mensal' : 'trimestral'}: {getFilteredEvaluations().length}
            </p>
          </div>
        </div>
      )}

      {/* Primeiro uso: wizard de avaliação basal quando não há avaliações */}
      {selectedUser && getFilteredEvaluations().length === 0 && (
        <div className="max-w-7xl mx-auto p-6">
          <div className="mb-4 rounded-lg bg-green-600/10 p-4 text-sm text-green-300">
            Nenhuma avaliação encontrada. Inicie a avaliação basal usando os dados do cadastro.
          </div>
          <NewEvaluationWizard
            user={selectedUser}
            calculateMetrics={(u, m) => calculateMetricsFromHook(u as any, m as any) as any}
            onPreview={() => {}}
            onSave={async (ev) => { await saveEvaluation(ev as any); await loadUserEvaluations(selectedUser.id); }}
          />
        </div>
      )}

      {/* Sistema de Pesagem Profissional com 3D */}
      {selectedUser && selectedEvaluation && (
        <div className="w-full bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 py-8">
          <div className="max-w-[95%] mx-auto">
            <ProfessionalWeighingSystem 
              user={selectedUser}
              evaluation={selectedEvaluation}
              onWeightChange={(weight) => {
                const updatedEvaluation = { ...selectedEvaluation, weight_kg: weight };
                saveEvaluation(updatedEvaluation as any);
              }}
              onSave={saveEvaluation}
            />
          </div>
        </div>
      )}

      {/* Painel escuro e gráficos chave quando houver pelo menos uma avaliação */}
      {selectedUser && getFilteredEvaluations().length > 0 && (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <MuscleCompositionPanel
            evaluations={getFilteredEvaluations()}
            currentEvaluation={selectedEvaluation || undefined}
          />
          {(selectedEvaluation || getFilteredEvaluations()[0]) && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {(() => { const ev = (selectedEvaluation || getFilteredEvaluations()[0])!; return (
                <RiskGauge
                  riskLevel={(ev.risk_level as any) || 'moderate'}
                  bodyFatPercentage={ev.body_fat_percentage || 0}
                  waistToHeightRatio={ev.waist_to_height_ratio}
                /> ); })()}
              {(() => { const ev = (selectedEvaluation || getFilteredEvaluations()[0])!; return (
                <CompositionDonut
                  weightKg={ev.weight_kg}
                  fatMassKg={ev.fat_mass_kg || 0}
                  leanMassKg={ev.lean_mass_kg || 0}
                /> ); })()}
            </div>
          )}
        </div>
      )}

      {/* Dashboard Principal */}
      <div className="max-w-7xl mx-auto p-6">
        {selectedUser && calculatedMetrics ? (
          <div className="space-y-6" id="charts-container">
            {/* Cards de Métricas Principais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-blue-800">% Gordura</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {calculatedMetrics.bodyFatPercentage.toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-green-800">Massa Magra</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {calculatedMetrics.leanMass.toFixed(1)}kg
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="bg-gradient-to-br from-red-50 to-red-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-red-800">Massa Gorda</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {calculatedMetrics.fatMass.toFixed(1)}kg
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-purple-800">IMC</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {calculatedMetrics.bmi.toFixed(1)}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* NOVOS GRÁFICOS AGRUPADOS POR TEMA */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* 1. RISCO CORPORAL ATUAL - Gauge único com múltiplos indicadores */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Risco Corporal Atual
                  </CardTitle>
                  <p className="text-sm text-gray-600">Análise integrada de gordura e circunferência</p>
                </CardHeader>
                <CardContent>
                  <ReactApexChart
                    options={{
                      chart: {
                        type: 'radialBar',
                        height: 350
                      },
                      plotOptions: {
                        radialBar: {
                          startAngle: -135,
                          endAngle: 135,
                          hollow: {
                            size: '65%',
                            background: '#fff',
                            dropShadow: {
                              enabled: true,
                              top: 3,
                              left: 0,
                              blur: 4,
                              opacity: 0.24
                            }
                          },
                          track: {
                            background: '#f3f4f6',
                            strokeWidth: '100%',
                            margin: 0
                          },
                          dataLabels: {
                            show: true,
                            name: {
                              offsetY: -20,
                              show: true,
                              color: '#888',
                              fontSize: '13px'
                            },
                            value: {
                              offsetY: -5,
                              color: calculatedMetrics.riskLevel === 'high' ? '#ef4444' :
                                     calculatedMetrics.riskLevel === 'moderate' ? '#f59e0b' : '#10b981',
                              fontSize: '25px',
                              show: true,
                              formatter: function(val) {
                                if (val < 33) return 'BAIXO RISCO';
                                if (val < 66) return 'RISCO MÉDIO';
                                return 'ALTO RISCO';
                              }
                            },
                            total: {
                              show: true,
                              label: 'Nível Geral',
                              fontSize: '14px',
                              color: '#374151',
                              formatter: function() {
                                return `${calculatedMetrics.bodyFatPercentage.toFixed(1)}% gordura`;
                              }
                            }
                          }
                        }
                      },
                      fill: {
                        type: 'gradient',
                        gradient: {
                          shade: 'dark',
                          shadeIntensity: 0.15,
                          inverseColors: false,
                          opacityFrom: 1,
                          opacityTo: 1,
                          stops: [0, 50, 65, 91],
                          colorStops: [
                            { offset: 0, color: '#10b981', opacity: 1 },
                            { offset: 50, color: '#f59e0b', opacity: 1 },
                            { offset: 100, color: '#ef4444', opacity: 1 }
                          ]
                        }
                      },
                      stroke: {
                        dashArray: 4
                      },
                      labels: ['Risco Atual']
                    }}
                    series={[
                      calculatedMetrics.riskLevel === 'high' ? 85 :
                      calculatedMetrics.riskLevel === 'moderate' ? 50 : 25
                    ]}
                    type="radialBar"
                    height={350}
                  />
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Gordura Corporal:</span>
                      <span className="font-bold">{calculatedMetrics.bodyFatPercentage.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Circunferência Abdominal:</span>
                      <span className="font-bold">{measurements.abdominalCircumference || 0} cm</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Classificação:</span>
                      <Badge className={
                        calculatedMetrics.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                        calculatedMetrics.riskLevel === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {calculatedMetrics.riskLevel === 'high' ? 'Alto Risco' :
                         calculatedMetrics.riskLevel === 'moderate' ? 'Risco Moderado' : 'Baixo Risco'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2. COMPOSIÇÃO CORPORAL TOTAL - Pizza com todos os componentes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-blue-500" />
                    Composição Corporal Total
                  </CardTitle>
                  <p className="text-sm text-gray-600">Distribuição completa do seu corpo</p>
                </CardHeader>
                <CardContent>
                  <ReactApexChart
                    options={{
                      chart: {
                        type: 'donut'
                      },
                      labels: ['Gordura', 'Massa Magra', 'Água', 'Outros'],
                      colors: ['#ef4444', '#10b981', '#3b82f6', '#a78bfa'],
                      legend: {
                        position: 'bottom',
                        fontSize: '14px'
                      },
                      dataLabels: {
                        enabled: true,
                        formatter: function(val: number, opts: any) {
                          const name = opts.w.globals.labels[opts.seriesIndex];
                          return name + ': ' + val.toFixed(1) + '%';
                        }
                      },
                      plotOptions: {
                        pie: {
                          donut: {
                            size: '65%',
                            labels: {
                              show: true,
                              name: {
                                show: true,
                                fontSize: '16px',
                                fontWeight: 600
                              },
                              value: {
                                show: true,
                                fontSize: '24px',
                                fontWeight: 700,
                                formatter: function(val) {
                                  return val + 'kg';
                                }
                              },
                              total: {
                                show: true,
                                label: 'Peso Total',
                                fontSize: '14px',
                                formatter: function() {
                                  return measurements.weight.toFixed(1) + ' kg';
                                }
                              }
                            }
                          }
                        }
                      },
                      responsive: [{
                        breakpoint: 480,
                        options: {
                          chart: {
                            width: 200
                          },
                          legend: {
                            position: 'bottom'
                          }
                        }
                      }]
                    }}
                    series={[
                      calculatedMetrics.fatMass,
                      calculatedMetrics.leanMass,
                      measurements.weight * 0.60, // Estimativa de água (60% do peso)
                      measurements.weight * 0.05  // Outros (minerais, etc)
                    ]}
                    type="donut"
                    height={350}
                  />
                </CardContent>
              </Card>

              {/* 3. PROPORÇÕES CORPORAIS - Radar com múltiplas razões */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-500" />
                    Proporções Corporais
                  </CardTitle>
                  <p className="text-sm text-gray-600">Análise das suas proporções e razões</p>
                </CardHeader>
                <CardContent>
                  <ReactApexChart
                    options={{
                      chart: {
                        type: 'radar'
                      },
                      xaxis: {
                        categories: [
                          'Cintura/Altura',
                          'Cintura/Quadril',
                          'Músculo/Gordura',
                          'IMC',
                          'Massa Magra'
                        ]
                      },
                      yaxis: {
                        show: false,
                        min: 0,
                        max: 100
                      },
                      plotOptions: {
                        radar: {
                          polygons: {
                            strokeColors: '#e5e7eb',
                            fill: {
                              colors: ['#f3f4f6', '#ffffff']
                            }
                          }
                        }
                      },
                      colors: ['#8b5cf6'],
                      fill: {
                        opacity: 0.25
                      },
                      stroke: {
                        show: true,
                        width: 2
                      },
                      markers: {
                        size: 5,
                        colors: ['#8b5cf6'],
                        strokeColors: '#fff',
                        strokeWidth: 2
                      },
                      tooltip: {
                        y: {
                          formatter: function(val, opts) {
                            const category = opts.w.globals.labels[opts.dataPointIndex];
                            if (category === 'Cintura/Altura') {
                              return calculatedMetrics.waistToHeightRatio.toFixed(2);
                            } else if (category === 'Cintura/Quadril') {
                              return calculatedMetrics.waistToHipRatio.toFixed(2);
                            } else if (category === 'Músculo/Gordura') {
                              return calculatedMetrics.muscleToFatRatio.toFixed(2);
                            } else if (category === 'IMC') {
                              return calculatedMetrics.bmi.toFixed(1);
                            } else {
                              return val.toFixed(1) + '%';
                            }
                          }
                        }
                      }
                    }}
                    series={[{
                      name: 'Suas Proporções',
                      data: [
                        Math.min(100, (1 - calculatedMetrics.waistToHeightRatio) * 100), // Inverso para melhor visualização
                        Math.min(100, (1 - calculatedMetrics.waistToHipRatio) * 100),
                        Math.min(100, calculatedMetrics.muscleToFatRatio * 20), // Escala ajustada
                        Math.min(100, (30 - calculatedMetrics.bmi) * 5), // Escala ajustada (30 - IMC)
                        Math.min(100, (calculatedMetrics.leanMass / measurements.weight) * 100)
                      ]
                    }]}
                    type="radar"
                    height={350}
                  />
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div className="p-2 bg-purple-50 rounded">
                      <span className="text-purple-600">Cintura/Altura:</span>
                      <span className="font-bold ml-2">{calculatedMetrics.waistToHeightRatio.toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <span className="text-purple-600">Cintura/Quadril:</span>
                      <span className="font-bold ml-2">{calculatedMetrics.waistToHipRatio.toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <span className="text-purple-600">Músculo/Gordura:</span>
                      <span className="font-bold ml-2">{calculatedMetrics.muscleToFatRatio.toFixed(2)}</span>
                    </div>
                    <div className="p-2 bg-purple-50 rounded">
                      <span className="text-purple-600">IMC:</span>
                      <span className="font-bold ml-2">{calculatedMetrics.bmi.toFixed(1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4. EVOLUÇÃO TEMPORAL - Linha com múltiplas métricas */}
              {evaluations.length > 0 && (
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      Evolução Temporal Completa
                    </CardTitle>
                    <p className="text-sm text-gray-600">Acompanhe seu progresso ao longo do tempo</p>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'line',
                          zoom: {
                            enabled: true
                          },
                          toolbar: {
                            show: true
                          }
                        },
                        dataLabels: {
                          enabled: false
                        },
                        stroke: {
                          curve: 'smooth',
                          width: [3, 3, 3, 2, 2]
                        },
                        colors: ['#3b82f6', '#10b981', '#ef4444', '#f59e0b', '#8b5cf6'],
                        xaxis: {
                          categories: evaluations.map(e => 
                            new Date(e.evaluation_date).toLocaleDateString('pt-BR')
                          ),
                          title: {
                            text: 'Data da Avaliação'
                          }
                        },
                        yaxis: [
                          {
                            title: {
                              text: 'Peso e Massas (kg)'
                            },
                            min: 0
                          },
                          {
                            opposite: true,
                            title: {
                              text: 'Percentuais e Índices'
                            },
                            min: 0,
                            max: 50
                          }
                        ],
                        legend: {
                          position: 'top',
                          horizontalAlign: 'center'
                        },
                        grid: {
                          borderColor: '#e7e7e7',
                          row: {
                            colors: ['#f3f3f3', 'transparent'],
                            opacity: 0.5
                          }
                        },
                        annotations: {
                          yaxis: [
                            {
                              y: 18,
                              y2: 25,
                              borderColor: '#00E396',
                              fillColor: '#00E396',
                              opacity: 0.1,
                              yAxisIndex: 1,
                              label: {
                                text: 'Faixa Ideal de Gordura',
                                style: {
                                  color: '#fff',
                                  background: '#00E396'
                                }
                              }
                            }
                          ]
                        },
                        tooltip: {
                          shared: true,
                          intersect: false,
                          y: {
                            formatter: function(val, opts) {
                              if (opts.seriesIndex <= 2) {
                                return val.toFixed(1) + ' kg';
                              }
                              return val.toFixed(1) + '%';
                            }
                          }
                        }
                      }}
                      series={[
                        {
                          name: 'Peso Total',
                          type: 'line',
                          data: evaluations.map(e => e.weight_kg || 0)
                        },
                        {
                          name: 'Massa Magra',
                          type: 'line',
                          data: evaluations.map(e => e.lean_mass_kg || 0)
                        },
                        {
                          name: 'Massa Gorda',
                          type: 'line',
                          data: evaluations.map(e => e.fat_mass_kg || 0)
                        },
                        {
                          name: '% Gordura',
                          type: 'area',
                          data: evaluations.map(e => e.body_fat_percentage || 0)
                        },
                        {
                          name: 'IMC',
                          type: 'line',
                          data: evaluations.map(e => e.bmi || 0)
                        }
                      ]}
                      type="line"
                      height={400}
                    />
                    
                    {/* Indicadores de Progresso */}
                    {evaluations.length >= 2 && (
                      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="text-xs text-blue-600 font-medium">Variação de Peso</div>
                          <div className="text-xl font-bold text-blue-700">
                            {((evaluations[evaluations.length - 1].weight_kg - evaluations[0].weight_kg) || 0).toFixed(1)} kg
                          </div>
                        </div>
                        <div className="bg-green-50 p-3 rounded-lg">
                          <div className="text-xs text-green-600 font-medium">Ganho Massa Magra</div>
                          <div className="text-xl font-bold text-green-700">
                            {((evaluations[evaluations.length - 1].lean_mass_kg - evaluations[0].lean_mass_kg) || 0).toFixed(1)} kg
                          </div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="text-xs text-red-600 font-medium">Redução de Gordura</div>
                          <div className="text-xl font-bold text-red-700">
                            {((evaluations[0].body_fat_percentage - evaluations[evaluations.length - 1].body_fat_percentage) || 0).toFixed(1)}%
                          </div>
                        </div>
                        <div className="bg-purple-50 p-3 rounded-lg">
                          <div className="text-xs text-purple-600 font-medium">Melhora no IMC</div>
                          <div className="text-xl font-bold text-purple-700">
                            {((evaluations[0].bmi - evaluations[evaluations.length - 1].bmi) || 0).toFixed(1)}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 5. RISCO METABÓLICO - Análise integrada de múltiplos fatores */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-orange-500" />
                    Análise de Risco Metabólico
                  </CardTitle>
                  <p className="text-sm text-gray-600">Avaliação integrada dos seus indicadores de saúde</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gauge de Risco Metabólico */}
                    <div>
                      <ReactApexChart
                        options={{
                          chart: {
                            type: 'radialBar',
                            offsetY: -20
                          },
                          plotOptions: {
                            radialBar: {
                              startAngle: -135,
                              endAngle: 135,
                              hollow: {
                                margin: 0,
                                size: '70%',
                                background: '#fff',
                                image: undefined,
                                position: 'front',
                                dropShadow: {
                                  enabled: true,
                                  top: 3,
                                  left: 0,
                                  blur: 4,
                                  opacity: 0.24
                                }
                              },
                              track: {
                                background: '#fff',
                                strokeWidth: '67%',
                                margin: 0,
                                dropShadow: {
                                  enabled: true,
                                  top: -3,
                                  left: 0,
                                  blur: 4,
                                  opacity: 0.35
                                }
                              },
                              dataLabels: {
                                show: true,
                                name: {
                                  offsetY: -10,
                                  show: true,
                                  color: '#888',
                                  fontSize: '17px'
                                },
                                value: {
                                  formatter: function(val) {
                                    const risk = parseInt(val.toString());
                                    if (risk < 30) return 'BAIXO';
                                    if (risk < 60) return 'MODERADO';
                                    if (risk < 80) return 'ALTO';
                                    return 'MUITO ALTO';
                                  },
                                  color: '#111',
                                  fontSize: '36px',
                                  show: true
                                }
                              }
                            }
                          },
                          fill: {
                            type: 'gradient',
                            gradient: {
                              shade: 'dark',
                              type: 'horizontal',
                              shadeIntensity: 0.5,
                              gradientToColors: ['#ef4444'],
                              inverseColors: false,
                              opacityFrom: 1,
                              opacityTo: 1,
                              stops: [0, 100]
                            }
                          },
                          stroke: {
                            lineCap: 'round'
                          },
                          labels: ['Risco Metabólico']
                        }}
                        series={[
                          (() => {
                            let riskScore = 0;
                            // Calcula score baseado em múltiplos fatores
                            if (calculatedMetrics.bmi > 30) riskScore += 25;
                            else if (calculatedMetrics.bmi > 25) riskScore += 15;
                            
                            if (calculatedMetrics.bodyFatPercentage > 30) riskScore += 25;
                            else if (calculatedMetrics.bodyFatPercentage > 25) riskScore += 15;
                            
                            if (calculatedMetrics.waistToHeightRatio > 0.6) riskScore += 25;
                            else if (calculatedMetrics.waistToHeightRatio > 0.5) riskScore += 15;
                            
                            if (measurements.abdominalCircumference > 102) riskScore += 25;
                            else if (measurements.abdominalCircumference > 94) riskScore += 15;
                            
                            return Math.min(riskScore, 100);
                          })()
                        ]}
                        type="radialBar"
                        height={350}
                      />
                    </div>

                    {/* Indicadores de Risco */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-gray-700">Fatores de Risco Analisados</h4>
                      
                      {/* IMC */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Índice de Massa Corporal</span>
                          <Badge className={
                            calculatedMetrics.bmi > 30 ? 'bg-red-100 text-red-800' :
                            calculatedMetrics.bmi > 25 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {calculatedMetrics.bmi.toFixed(1)}
                          </Badge>
                        </div>
                        <Progress 
                          value={Math.min((calculatedMetrics.bmi / 40) * 100, 100)} 
                          className="h-2"
                        />
                      </div>

                      {/* Gordura Corporal */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Gordura Corporal</span>
                          <Badge className={
                            calculatedMetrics.bodyFatPercentage > 30 ? 'bg-red-100 text-red-800' :
                            calculatedMetrics.bodyFatPercentage > 25 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {calculatedMetrics.bodyFatPercentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <Progress 
                          value={Math.min((calculatedMetrics.bodyFatPercentage / 50) * 100, 100)} 
                          className="h-2"
                        />
                      </div>

                      {/* Circunferência Abdominal */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Circunferência Abdominal</span>
                          <Badge className={
                            measurements.abdominalCircumference > 102 ? 'bg-red-100 text-red-800' :
                            measurements.abdominalCircumference > 94 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {measurements.abdominalCircumference || 0} cm
                          </Badge>
                        </div>
                        <Progress 
                          value={Math.min(((measurements.abdominalCircumference || 0) / 120) * 100, 100)} 
                          className="h-2"
                        />
                      </div>

                      {/* Relação Cintura-Altura */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Relação Cintura-Altura</span>
                          <Badge className={
                            calculatedMetrics.waistToHeightRatio > 0.6 ? 'bg-red-100 text-red-800' :
                            calculatedMetrics.waistToHeightRatio > 0.5 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }>
                            {calculatedMetrics.waistToHeightRatio.toFixed(2)}
                          </Badge>
                        </div>
                        <Progress 
                          value={Math.min((calculatedMetrics.waistToHeightRatio / 0.8) * 100, 100)} 
                          className="h-2"
                        />
                      </div>

                      {/* Recomendações */}
                      <Alert className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Recomendações</AlertTitle>
                        <AlertDescription>
                          {calculatedMetrics.riskLevel === 'high' ? 
                            'Atenção: Seus indicadores mostram risco elevado. Recomenda-se acompanhamento profissional regular.' :
                          calculatedMetrics.riskLevel === 'moderate' ?
                            'Seus indicadores mostram risco moderado. Continue monitorando e mantenha hábitos saudáveis.' :
                            'Parabéns! Seus indicadores estão dentro da faixa saudável. Continue assim!'}
                        </AlertDescription>
                      </Alert>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Evolução dos Últimos 6 Meses */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">Evolução dos Últimos 6 Meses</CardTitle>
              </CardHeader>
              <CardContent>
                <ReactApexChart
                  options={{
                    chart: {
                      type: 'line',
                      toolbar: {
                        show: true,
                        tools: {
                          download: true,
                          selection: false,
                          zoom: false,
                          zoomin: false,
                          zoomout: false,
                          pan: false,
                          reset: false
                        }
                      }
                    },
                    colors: ['#3b82f6', '#f59e0b', '#10b981'],
                    stroke: {
                      width: [4, 3, 3],
                      curve: 'smooth',
                      dashArray: [0, 0, 0]
                    },
                    grid: {
                      borderColor: '#e9e9e9',
                      row: {
                        colors: ['#f8f9fa', 'transparent'],
                        opacity: 0.5
                      }
                    },
                    markers: {
                      size: 6,
                      colors: ['#3b82f6', '#f59e0b', '#10b981'],
                      strokeColors: '#fff',
                      hover: {
                        size: 8
                      }
                    },
                    xaxis: {
                      categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                      title: {
                        text: ''
                      }
                    },
                    yaxis: [
                      {
                        title: {
                          text: 'Peso (kg)'
                        },
                        min: 79,
                        max: 83
                      },
                      {
                        opposite: true,
                        title: {
                          text: 'Composição %'
                        },
                        min: 0,
                        max: 100
                      }
                    ],
                    legend: {
                      position: 'bottom',
                      horizontalAlign: 'center'
                    },
                    dataLabels: {
                      enabled: false
                    },
                    tooltip: {
                      shared: true,
                      intersect: false,
                      y: {
                                                  formatter: function(value, { seriesIndex }) {
                            const numValue = typeof value === 'number' ? value : parseFloat(value);
                            if (seriesIndex === 0) return numValue.toFixed(1) + ' kg';
                            if (seriesIndex === 1) return numValue.toFixed(1) + ' kg';
                            return numValue.toFixed(1) + '%';
                          }
                      }
                    }
                  }}
                  series={[
                    {
                      name: 'Peso (kg)',
                      type: 'line',
                      data: evaluations.length >= 6 
                        ? evaluations.slice(0, 6).map(e => e.weight_kg || 0).reverse()
                        : [82.0, 81.5, 81.0, 80.5, 80.0, 79.8]
                    },
                    {
                      name: 'Massa Magra (kg)',
                      type: 'line',
                      data: evaluations.length >= 6 
                        ? evaluations.slice(0, 6).map(e => e.lean_mass_kg || 0).reverse()
                        : [81.1, 81.1, 81.1, 81.1, 81.1, 81.1]
                    },
                    {
                      name: '% Gordura',
                      type: 'area',
                      data: evaluations.length >= 6 
                        ? evaluations.slice(0, 6).map(e => e.body_fat_percentage || 0).reverse()
                        : [20.0, 19.8, 19.5, 19.0, 18.5, 18.0]
                    }
                  ]}
                  height={400}
                />
              </CardContent>
            </Card>

            {/* Gráficos de Composição Corporal Simplificados */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Gráfico 1: O que forma seu corpo */}
              <Card className="bg-purple-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Timer className="h-5 w-5 text-purple-500" />
                    O que forma seu corpo
                  </CardTitle>
                  <p className="text-sm text-gray-600">Distribuição simplificada</p>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[300px] flex items-center justify-center">
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'donut',
                        },
                        labels: ['Gordura', 'Músculos', 'Água', 'Outros'],
                        colors: ['#f59e0b', '#10b981', '#3b82f6', '#c084fc'],
                        legend: {
                          position: 'bottom',
                          fontSize: '14px',
                          markers: {
                            size: 12,
                          },
                          itemMargin: {
                            horizontal: 10,
                            vertical: 2
                          }
                        },
                        plotOptions: {
                          pie: {
                            donut: {
                              size: '60%',
                              labels: {
                                show: true,
                                name: {
                                  show: true,
                                  fontSize: '22px',
                                  fontWeight: 600,
                                  offsetY: 0,
                                },
                                value: {
                                  show: true,
                                  fontSize: '16px',
                                  fontWeight: 400,
                                  offsetY: 0,
                                },
                                total: {
                                  show: true,
                                  label: 'Principal',
                                  fontSize: '16px',
                                  formatter: function() {
                                    return 'Músculos';
                                  }
                                }
                              }
                            }
                          }
                        },
                        dataLabels: {
                          enabled: true,
                          formatter: function(val) {
                            const numVal = typeof val === 'number' ? val : parseFloat(String(val));
                            return numVal.toFixed(0) + "%";
                          },
                          style: {
                            fontSize: '14px',
                            fontWeight: 'bold',
                            colors: ['#fff']
                          },
                        },
                        responsive: [{
                          breakpoint: 480,
                          options: {
                            chart: {
                              height: 250
                            },
                            legend: {
                              position: 'bottom'
                            }
                          }
                        }]
                      }}
                      series={[
                        calculatedMetrics ? Math.round(calculatedMetrics.bodyFatPercentage) : 19,
                        calculatedMetrics ? Math.round((calculatedMetrics.muscleMass / measurements.weight) * 100) : 45,
                        calculatedMetrics ? Math.round(((measurements.weight - calculatedMetrics.fatMass - calculatedMetrics.muscleMass) * 0.8 / measurements.weight) * 100) : 35,
                        calculatedMetrics ? Math.round(((measurements.weight - calculatedMetrics.fatMass - calculatedMetrics.muscleMass) * 0.2 / measurements.weight) * 100) : 1
                      ]}
                      type="donut"
                      height={300}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-amber-100 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-amber-700">
                        {calculatedMetrics ? calculatedMetrics.bodyFatPercentage.toFixed(1) : "18.5"}%
                      </div>
                      <div className="text-sm font-medium text-amber-800">Gordura</div>
                    </div>
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                      <div className="text-xl font-bold text-green-700">
                        {calculatedMetrics ? ((calculatedMetrics.muscleMass / measurements.weight) * 100).toFixed(1) : "45.2"}%
                      </div>
                      <div className="text-sm font-medium text-green-800">Músculos</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfico 2: Como está sua composição hoje? */}
              <Card className="bg-teal-50/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Target className="h-5 w-5 text-teal-500" />
                    Como está sua composição hoje?
                  </CardTitle>
                  <p className="text-sm text-gray-600">Visão geral do seu corpo</p>
                </CardHeader>
                <CardContent>
                  <div className="relative h-[300px] flex items-center justify-center">
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'radar',
                          toolbar: {
                            show: false
                          },
                          dropShadow: {
                            enabled: true,
                            blur: 1,
                            left: 1,
                            top: 1
                          }
                        },
                        colors: ['#10b981'],
                        stroke: {
                          width: 2
                        },
                        fill: {
                          opacity: 0.5
                        },
                        markers: {
                          size: 5,
                          strokeColors: '#fff',
                          strokeWidth: 2
                        },
                        xaxis: {
                          categories: ['Gordura Corporal', 'Equilíbrio Muscular', 'Risco Abdominal', 'Energia Estimada']
                        },
                        yaxis: {
                          show: false,
                          min: 0,
                          max: 100
                        }
                      }}
                      series={[
                        {
                          name: "Composição Atual",
                          data: [
                            calculatedMetrics ? Math.max(0, 100 - calculatedMetrics.bodyFatPercentage * 2) : 70,
                            calculatedMetrics ? Math.min(100, calculatedMetrics.muscleToFatRatio * 25) : 65,
                            calculatedMetrics ? Math.max(0, 100 - (calculatedMetrics.waistToHeightRatio * 100)) : 75,
                            calculatedMetrics ? Math.min(100, calculatedMetrics.bmr / 30) : 80
                          ]
                        }
                      ]}
                      type="radar"
                      height={300}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-green-100 p-3 rounded-lg text-center">
                      <div className="text-sm font-medium text-green-800">Melhor área</div>
                      <div className="text-lg font-bold text-green-700">
                        {calculatedMetrics && calculatedMetrics.bodyFatPercentage < 25 ? "Gordura Corporal" : 
                         calculatedMetrics && calculatedMetrics.muscleToFatRatio > 2.5 ? "Equilíbrio Muscular" : 
                         calculatedMetrics && calculatedMetrics.waistToHeightRatio < 0.5 ? "Risco Abdominal" : 
                         "Energia Estimada"}
                      </div>
                    </div>
                    <div className="bg-amber-100 p-3 rounded-lg text-center">
                      <div className="text-sm font-medium text-amber-800">Pode melhorar</div>
                      <div className="text-lg font-bold text-amber-700">
                        {calculatedMetrics && calculatedMetrics.bodyFatPercentage > 30 ? "Gordura Corporal" : 
                         calculatedMetrics && calculatedMetrics.muscleToFatRatio < 1.5 ? "Equilíbrio Muscular" : 
                         calculatedMetrics && calculatedMetrics.waistToHeightRatio > 0.55 ? "Risco Abdominal" : 
                         "Energia Estimada"}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Comparação de Avaliações */}
            {showComparison && evaluations.length > 1 && (
              <EvaluationComparison
                evaluations={evaluations}
                currentEvaluation={calculatedMetrics ? {
                  ...measurements,
                  ...calculatedMetrics,
                  user_id: selectedUser.id,
                  evaluation_date: new Date().toISOString()
                } as any : undefined}
              />
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Demo com dados de exemplo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Demonstração - Dados de Exemplo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-red-50 to-red-100 p-4 rounded-lg border border-red-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 font-medium">% Gordura</p>
                        <p className="text-2xl font-bold text-red-700">18.5%</p>
                      </div>
                      <div className="h-12 w-12 bg-red-200 rounded-full flex items-center justify-center">
                        <Scale className="h-6 w-6 text-red-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-lg border border-green-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Massa Magra</p>
                        <p className="text-2xl font-bold text-green-700">65.2kg</p>
                      </div>
                      <div className="h-12 w-12 bg-green-200 rounded-full flex items-center justify-center">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-r from-rose-50 to-rose-100 p-4 rounded-lg border border-rose-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-rose-600 font-medium">Massa Gorda</p>
                        <p className="text-2xl font-bold text-rose-700">14.8kg</p>
                      </div>
                      <div className="h-12 w-12 bg-rose-200 rounded-full flex items-center justify-center">
                        <Activity className="h-6 w-6 text-rose-600" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">IMC</p>
                        <p className="text-2xl font-bold text-purple-700">24.8</p>
                      </div>
                      <div className="h-12 w-12 bg-purple-200 rounded-full flex items-center justify-center">
                        <Target className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Seção Principal - Análise de Riscos */}
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Como está sua saúde hoje?
                  </h2>
                  <p className="text-gray-600 mb-6">Veja seus principais indicadores de forma simples e clara</p>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. Risco Cardiometabólico */}
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Heart className="h-5 w-5 text-red-500" />
                          Seu Risco Cardiovascular
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Baseado na medida da sua cintura</p>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <ReactApexChart
                          options={{
                            chart: {
                              type: 'radialBar',
                              sparkline: {
                                enabled: true
                              }
                            },
                            plotOptions: {
                              radialBar: {
                                startAngle: -90,
                                endAngle: 90,
                                track: {
                                  background: '#e5e7eb',
                                  strokeWidth: '97%',
                                  margin: 5,
                                  dropShadow: {
                                    enabled: true,
                                    top: 2,
                                    left: 0,
                                    blur: 3,
                                    opacity: 0.1
                                  }
                                },
                                dataLabels: {
                                  name: {
                                    show: false
                                  },
                                  value: {
                                    offsetY: -2,
                                    fontSize: '28px',
                                    fontWeight: 'bold',
                                    color: undefined,
                                    formatter: function (val) {
                                      if (val < 33) return 'BAIXO';
                                      if (val < 66) return 'MÉDIO';
                                      return 'ALTO';
                                    }
                                  }
                                }
                              }
                            },
                            fill: {
                              type: 'gradient',
                              gradient: {
                                shade: 'light',
                                shadeIntensity: 0.4,
                                inverseColors: false,
                                opacityFrom: 1,
                                opacityTo: 1,
                                stops: [0, 50, 100],
                                colorStops: [
                                  {
                                    offset: 0,
                                    color: '#22c55e',
                                    opacity: 1
                                  },
                                  {
                                    offset: 50,
                                    color: '#eab308',
                                    opacity: 1
                                  },
                                  {
                                    offset: 100,
                                    color: '#ef4444',
                                    opacity: 1
                                  }
                                ]
                              }
                            },
                            stroke: {
                              lineCap: 'round'
                            }
                          }}
                          series={[25]}
                          type="radialBar"
                          height={200}
                        />
                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              Saudável
                            </span>
                            <span className="text-gray-600">até 94cm</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                              Atenção
                            </span>
                            <span className="text-gray-600">94-102cm</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                              Risco elevado
                            </span>
                            <span className="text-gray-600">acima 102cm</span>
                          </div>
                        </div>
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ Você está na faixa saudável! Continue assim.
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 2. Nível de Gordura Corporal */}
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Gauge className="h-5 w-5 text-orange-500" />
                          Nível de Gordura no Corpo
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Sua porcentagem atual</p>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="relative">
                          {/* Barra de progresso visual */}
                          <div className="h-12 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 rounded-full relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-around text-xs font-semibold text-white">
                              <span>Ideal</span>
                              <span>Atenção</span>
                              <span>Alto</span>
                            </div>
                            {/* Indicador */}
                            <div 
                              className="absolute top-1/2 transform -translate-y-1/2 w-1 h-16 bg-gray-900 shadow-lg"
                              style={{ left: '30%' }}
                            >
                              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1 rounded-full text-lg font-bold whitespace-nowrap">
                                18.5%
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 mt-8 text-center">
                          <div className="p-2 bg-green-50 rounded-lg">
                            <div className="text-xs text-green-600">Saudável</div>
                            <div className="font-bold text-green-800">10-20%</div>
                          </div>
                          <div className="p-2 bg-yellow-50 rounded-lg">
                            <div className="text-xs text-yellow-600">Atenção</div>
                            <div className="font-bold text-yellow-800">20-25%</div>
                          </div>
                          <div className="p-2 bg-red-50 rounded-lg">
                            <div className="text-xs text-red-600">Alto</div>
                            <div className="font-bold text-red-800">25%+</div>
                          </div>
                        </div>
                        
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 font-medium">
                            ✓ Gordura corporal dentro do ideal para sua idade!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Segunda linha */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    {/* 3. Composição Corporal Resumida */}
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <PieChart className="h-5 w-5 text-purple-500" />
                          O que forma seu corpo
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Distribuição simplificada</p>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <ReactApexChart
                          options={{
                            chart: {
                              type: 'donut'
                            },
                            labels: ['Gordura', 'Músculos', 'Água', 'Outros'],
                            colors: ['#fbbf24', '#10b981', '#3b82f6', '#a78bfa'],
                            legend: {
                              position: 'bottom',
                              fontSize: '14px'
                            },
                            dataLabels: {
                              enabled: true,
                              formatter: function(val: number) {
                                return Math.round(val) + '%';
                              }
                            },
                            plotOptions: {
                              pie: {
                                donut: {
                                  size: '65%',
                                  labels: {
                                    show: true,
                                    name: {
                                      show: true,
                                      fontSize: '16px',
                                      fontWeight: 600
                                    },
                                    value: {
                                      show: true,
                                      fontSize: '24px',
                                      fontWeight: 700,
                                      formatter: function(val) {
                                        return val + '%';
                                      }
                                    },
                                    total: {
                                      show: true,
                                      label: 'Principal',
                                      fontSize: '14px',
                                      formatter: function() {
                                        return 'Músculos';
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }}
                          series={[18.5, 45.2, 34.8, 1.5]}
                          type="donut"
                          height={280}
                        />
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="p-2 bg-yellow-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-yellow-700">18.5%</div>
                            <div className="text-xs text-yellow-600">Gordura</div>
                          </div>
                          <div className="p-2 bg-green-50 rounded-lg text-center">
                            <div className="text-2xl font-bold text-green-700">45.2%</div>
                            <div className="text-xs text-green-600">Músculos</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* 4. Radar de Saúde */}
                    <Card className="overflow-hidden">
                      <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Target className="h-5 w-5 text-teal-500" />
                          Como está sua composição hoje?
                        </CardTitle>
                        <p className="text-sm text-gray-600 mt-1">Visão geral do seu corpo</p>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <ReactApexChart
                          options={{
                            chart: {
                              type: 'radar'
                            },
                            xaxis: {
                              categories: [
                                'Gordura\nCorporal',
                                'Equilíbrio\nMuscular', 
                                'Risco\nAbdominal',
                                'Energia\nEstimada'
                              ]
                            },
                            yaxis: {
                              show: false,
                              min: 0,
                              max: 100
                            },
                            plotOptions: {
                              radar: {
                                polygons: {
                                  strokeColors: '#e5e7eb',
                                  fill: {
                                    colors: ['#f3f4f6', '#ffffff']
                                  }
                                }
                              }
                            },
                            colors: ['#10b981'],
                            fill: {
                              opacity: 0.3
                            },
                            stroke: {
                              show: true,
                              width: 2
                            },
                            markers: {
                              size: 5,
                              colors: ['#10b981'],
                              strokeColors: '#fff',
                              strokeWidth: 2
                            },
                            tooltip: {
                              y: {
                                formatter: function(val) {
                                  if (val >= 80) return 'Excelente';
                                  if (val >= 60) return 'Bom';
                                  if (val >= 40) return 'Regular';
                                  return 'Precisa melhorar';
                                }
                              }
                            }
                          }}
                          series={[{
                            name: 'Seu Perfil',
                            data: [85, 70, 80, 75]
                          }]}
                          type="radar"
                          height={280}
                        />
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <div className="p-2 bg-green-50 rounded-lg text-center">
                            <div className="text-xs text-green-600">Melhor área</div>
                            <div className="font-bold text-green-800">Gordura Corporal</div>
                          </div>
                          <div className="p-2 bg-yellow-50 rounded-lg text-center">
                            <div className="text-xs text-yellow-600">Pode melhorar</div>
                            <div className="font-bold text-yellow-800">Equilíbrio Muscular</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Índices Antropométricos */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Índices Antropométricos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">TMB (Mifflin-St Jeor)</div>
                        <div className="text-xl font-bold">1,847 kcal/dia</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Razão Cintura/Altura</div>
                        <div className="text-xl font-bold">0.52</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Razão Cintura/Quadril</div>
                        <div className="text-xl font-bold">0.89</div>
                      </div>
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600">Razão Músculo/Gordura</div>
                        <div className="text-xl font-bold">4.41</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Evolução Temporal */}
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>Evolução dos Últimos 6 Meses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReactApexChart
                      options={{
                        chart: {
                          type: 'line',
                          height: 350,
                          zoom: {
                            enabled: false
                          }
                        },
                        dataLabels: {
                          enabled: false
                        },
                        stroke: {
                          curve: 'smooth'
                        },
                        title: {
                          text: 'Evolução das Métricas',
                          align: 'left'
                        },
                        grid: {
                          borderColor: '#e7e7e7',
                          row: {
                            colors: ['#f3f3f3', 'transparent'],
                            opacity: 0.5
                          },
                        },
                        xaxis: {
                          categories: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
                        },
                        yaxis: [
                          {
                            title: {
                              text: 'Peso (kg)',
                            },
                          },
                          {
                            opposite: true,
                            title: {
                              text: '% Gordura'
                            }
                          }
                        ]
                      }}
                      series={[
                        {
                          name: "Peso (kg)",
                          data: [82, 81.5, 80.8, 80.2, 79.8, 80]
                        },
                        {
                          name: "% Gordura",
                          data: [22, 21.2, 20.1, 19.5, 18.8, 18.5]
                        },
                        {
                          name: "Massa Magra (kg)",
                          data: [64, 64.2, 64.7, 65, 65.1, 65.2]
                        }
                      ]}
                      type="line"
                      height={350}
                    />
                  </CardContent>
                </Card>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center mt-1">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Dados de Demonstração</h3>
                      <p className="text-blue-700 mt-1">
                        Esta é uma demonstração com dados de exemplo. Para usar dados reais, 
                        selecione um usuário e faça uma nova avaliação clicando no botão "Nova Avaliação".
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessionalEvaluationPage;