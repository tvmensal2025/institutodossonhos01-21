import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserPersonalizedInfo } from '@/components/dashboard/UserPersonalizedInfo';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  ComposedChart,
  Bar
} from 'recharts';
import { 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Heart, 
  Activity, 
  AlertTriangle,
  CheckCircle,
  User,
  Calendar,
  Target,
  Zap,
  BarChart3,
  Users,
  Timer,
  Bluetooth,
  Shield,
  ChevronDown,
  Plus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

// Tipos
interface WeightMeasurement {
  id?: string;
  user_id: string;
  peso_kg: number;
  circunferencia_abdominal_cm: number;
  measurement_date: string;
  measurement_date_time?: string;
  measurement_type: 'balanca' | 'manual';
  gordura_corporal_percent?: number;
  massa_muscular_kg?: number;
  agua_corporal_percent?: number;
  imc?: number;
  rce?: number; // Relação Cintura-Estatura
  evaluation_id?: string;
  notes?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  birth_date: string;
  height_cm: number;
  gender: 'M' | 'F';
  avatar_url?: string;
}

interface Evaluation {
  id: string;
  user_id: string;
  evaluation_date: string;
  evaluation_type: 'profissional' | 'auto' | 'demonstracao';
  evaluator_name?: string;
  notes?: string;
  measurements: WeightMeasurement[];
}

// Dados mock de usuários
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Rafael Ferreira Dias',
    email: 'rafael@instituto.com',
    birth_date: '1973-09-20',
    height_cm: 179,
    gender: 'M'
  },
  {
    id: '2', 
    name: 'Maria Silva Santos',
    email: 'maria@instituto.com',
    birth_date: '1985-03-15',
    height_cm: 165,
    gender: 'F'
  },
  {
    id: '3',
    name: 'João Carlos Oliveira',
    email: 'joao@instituto.com', 
    birth_date: '1978-11-08',
    height_cm: 175,
    gender: 'M'
  }
];

// Dados mock extensos para demonstração
const generateMockData = (userId: string, days: number) => {
  const data: WeightMeasurement[] = [];
  const baseWeight = 107.0;
  const baseWaist = 124;
  
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    // Variação realística
    const weightVariation = (Math.random() - 0.5) * 2; // ±1kg
    const waistVariation = (Math.random() - 0.5) * 4; // ±2cm
    
    const weight = baseWeight + weightVariation;
    const waist = baseWaist + waistVariation;
    const imc = weight / Math.pow(179 / 100, 2);
    const rce = waist / 179;
    
    data.push({
      id: `mock-${i}`,
      user_id: userId,
      peso_kg: Math.round(weight * 10) / 10,
      circunferencia_abdominal_cm: Math.round(waist),
      measurement_date: date.toISOString().split('T')[0],
      measurement_date_time: date.toISOString(),
      measurement_type: Math.random() > 0.5 ? 'balanca' : 'manual',
      gordura_corporal_percent: 36.7 + (Math.random() - 0.5) * 4,
      massa_muscular_kg: 30.1 + (Math.random() - 0.5) * 2,
      agua_corporal_percent: 45.2 + (Math.random() - 0.5) * 3,
      imc: Math.round(imc * 10) / 10,
      rce: Math.round(rce * 100) / 100,
      evaluation_id: `eval-${Math.floor(i / 7)}`, // Agrupa por semana
      notes: Math.random() > 0.7 ? 'Observação importante' : undefined
    });
  }
  
  return data;
};

// Gera avaliações mock baseadas nos dados
const generateMockEvaluations = (userId: string, measurements: WeightMeasurement[]): Evaluation[] => {
  const evaluations: Evaluation[] = [];
  
  // Agrupa medições por avaliação (semanal)
  const groupedMeasurements = measurements.reduce((acc, measurement) => {
    const week = Math.floor(new Date(measurement.measurement_date).getTime() / (7 * 24 * 60 * 60 * 1000));
    if (!acc[week]) acc[week] = [];
    acc[week].push(measurement);
    return acc;
  }, {} as Record<number, WeightMeasurement[]>);
  
  Object.entries(groupedMeasurements).forEach(([week, weekMeasurements], index) => {
    const latestMeasurement = weekMeasurements[weekMeasurements.length - 1];
    const evaluationDate = new Date(latestMeasurement.measurement_date);
    
    evaluations.push({
      id: `eval-${week}`,
      user_id: userId,
      evaluation_date: evaluationDate.toISOString().split('T')[0],
      evaluation_type: index === 0 ? 'profissional' : 'auto',
      evaluator_name: index === 0 ? 'Dr. Maroco' : undefined,
      notes: index === 0 ? 'Avaliação antropométrica com adipômetro' : 'Auto-avaliação',
      measurements: weekMeasurements
    });
  });
  
  return evaluations.sort((a, b) => new Date(b.evaluation_date).getTime() - new Date(a.evaluation_date).getTime());
};

const AdvancedHealthDashboard: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User>(mockUsers[0]);
  const [measurements, setMeasurements] = useState<WeightMeasurement[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [selectedEvaluation, setSelectedEvaluation] = useState<Evaluation | null>(null);
  const [showWeighingModal, setShowWeighingModal] = useState(false);
  const [weighingType, setWeighingType] = useState<'balanca' | 'manual'>('balanca');
  const [newMeasurement, setNewMeasurement] = useState({
    peso_kg: '',
    circunferencia_abdominal_cm: ''
  });
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('month');

  // Carrega medições e avaliações do usuário
  useEffect(() => {
    loadUserData();
  }, [selectedUser, timeRange]);

  // Atualiza avaliação selecionada quando mudam os dados
  useEffect(() => {
    if (evaluations.length > 0 && !selectedEvaluation) {
      setSelectedEvaluation(evaluations[0]);
    }
  }, [evaluations]);

  const loadUserData = async () => {
    // Gera dados mock baseados no período selecionado
    let days = 7; // padrão semana
    if (timeRange === 'month') days = 30;
    if (timeRange === 'quarter') days = 90;
    
    const mockMeasurements = generateMockData(selectedUser.id, days);
    const mockEvaluations = generateMockEvaluations(selectedUser.id, mockMeasurements);
    
    console.log('🔍 DEBUG: Carregando dados do usuário:', selectedUser.name);
    console.log('📊 DEBUG: Medições geradas:', mockMeasurements.length);
    console.log('📋 DEBUG: Avaliações geradas:', mockEvaluations.length);
    
    setMeasurements(mockMeasurements);
    setEvaluations(mockEvaluations);
  };

  // Calcula IMC
  const calculateIMC = (weight: number, height: number) => {
    return weight / Math.pow(height / 100, 2);
  };

  // Calcula RCE (Relação Cintura-Estatura)
  const calculateRCE = (waist: number, height: number) => {
    return waist / height;
  };

  // Análise de risco cardiometabólico
  const getCardiometabolicRisk = (rce: number, imc: number) => {
    if (rce >= 0.6) {
      return { level: 'ALTO', color: '#ef4444', description: 'Risco elevado para doenças cardiovasculares' };
    } else if (rce >= 0.5) {
      return { level: 'MODERADO', color: '#f59e0b', description: 'Risco moderado - atenção necessária' };
    } else {
      return { level: 'BAIXO', color: '#22c55e', description: 'Risco baixo - continue assim!' };
    }
  };

  // Submete nova medição
  const submitMeasurement = async () => {
    const weight = parseFloat(newMeasurement.peso_kg);
    const waist = parseFloat(newMeasurement.circunferencia_abdominal_cm);
    
    if (!weight || !waist) return;

    const imc = calculateIMC(weight, selectedUser.height_cm);
    const rce = calculateRCE(waist, selectedUser.height_cm);

    const measurement: WeightMeasurement = {
      user_id: selectedUser.id,
      peso_kg: weight,
      circunferencia_abdominal_cm: waist,
      measurement_date: new Date().toISOString().split('T')[0],
      measurement_date_time: new Date().toISOString(),
      measurement_type: weighingType,
      imc: imc,
      rce: rce,
      evaluation_id: selectedEvaluation?.id
    };

    // Aqui salvaria no Supabase
    setMeasurements([measurement, ...measurements]);
    setNewMeasurement({ peso_kg: '', circunferencia_abdominal_cm: '' });
    setShowWeighingModal(false);
  };

  // Filtra medições baseadas na avaliação selecionada
  const filteredMeasurements = selectedEvaluation 
    ? measurements.filter(m => m.evaluation_id === selectedEvaluation.id)
    : measurements;

  const latestMeasurement = filteredMeasurements[0];
  const riskData = latestMeasurement ? getCardiometabolicRisk(latestMeasurement.rce || 0, latestMeasurement.imc || 0) : null;

  // Dados para gráficos de evolução com formatação baseada no período
  const evolutionData = filteredMeasurements.slice().reverse().map((m, index) => {
    const date = new Date(m.measurement_date);
    let formattedDate = '';
    
    if (timeRange === 'week') {
      formattedDate = date.toLocaleDateString('pt-BR', { weekday: 'short' });
    } else if (timeRange === 'month') {
      formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    } else {
      formattedDate = date.toLocaleDateString('pt-BR', { month: 'short' });
    }
    
    return {
      date: formattedDate,
      fullDate: m.measurement_date,
      peso: m.peso_kg,
      cintura: m.circunferencia_abdominal_cm,
      imc: m.imc,
      rce: m.rce
    };
  });

  // Dados para gráfico de composição corporal
  const bodyCompositionData = latestMeasurement ? [
    { name: 'Gordura', value: latestMeasurement.gordura_corporal_percent || 36.7, color: '#ef4444' },
    { name: 'Músculo', value: 28.2, color: '#22c55e' },
    { name: 'Água', value: latestMeasurement.agua_corporal_percent || 45.2, color: '#3b82f6' },
    { name: 'Ossos', value: 15, color: '#94a3b8' }
  ] : [];

  // Silhueta SVG moderna
  const ModernSilhouette = ({ 
    color = '#6366f1', 
    size = 120,
    className = ''
  }: { 
    color?: string; 
    size?: number;
    className?: string;
  }) => (
    <div className={`flex justify-center ${className}`}>
      <svg width={size} height={size * 1.6} viewBox="0 0 100 160" className="drop-shadow-lg">
        {/* Cabeça */}
        <circle cx="50" cy="15" r="12" fill={color} opacity="0.9" className="transition-all duration-300"/>
        
        {/* Pescoço */}
        <rect x="47" y="27" width="6" height="8" fill={color} opacity="0.9"/>
        
        {/* Tronco */}
        <path d="M 35 35 Q 35 40 40 45 L 40 65 Q 35 70 35 75 L 35 85 Q 35 90 40 90 L 60 90 Q 65 90 65 85 L 65 75 Q 65 70 60 65 L 60 45 Q 65 40 65 35 Q 60 30 50 30 Q 40 30 35 35 Z" 
              fill={color} opacity="0.9"/>
        
        {/* Braços */}
        <ellipse cx="25" cy="50" rx="7" ry="20" fill={color} opacity="0.9"/>
        <ellipse cx="75" cy="50" rx="7" ry="20" fill={color} opacity="0.9"/>
        
        {/* Quadris */}
        <ellipse cx="50" cy="100" rx="15" ry="10" fill={color} opacity="0.9"/>
        
        {/* Pernas */}
        <ellipse cx="42" cy="125" rx="8" ry="22" fill={color} opacity="0.9"/>
        <ellipse cx="58" cy="125" rx="8" ry="22" fill={color} opacity="0.9"/>
        
        {/* Pés */}
        <ellipse cx="42" cy="150" rx="6" ry="8" fill={color} opacity="0.9"/>
        <ellipse cx="58" cy="150" rx="6" ry="8" fill={color} opacity="0.9"/>
      </svg>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Dashboard de Saúde Avançado</h1>
                <p className="text-gray-600">Análise completa de composição corporal e risco cardiometabólico</p>
              </div>
            </div>
            
            {/* Seletor de Usuário */}
            <div className="flex items-center space-x-4">
              <Select value={selectedUser.id} onValueChange={(value) => {
                const user = mockUsers.find(u => u.id === value);
                if (user) {
                  setSelectedUser(user);
                  setSelectedEvaluation(null); // Reset avaliação selecionada
                }
              }}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Selecionar Paciente" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{user.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Botão Nova Pesagem */}
              <Dialog open={showWeighingModal} onOpenChange={setShowWeighingModal}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    <Scale className="h-4 w-4 mr-2" />
                    Nova Pesagem
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Pesagem - {selectedUser.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Tipo de Pesagem</Label>
                      <Select value={weighingType} onValueChange={(value: 'balanca' | 'manual') => setWeighingType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balanca">
                            <div className="flex items-center space-x-2">
                              <Bluetooth className="h-4 w-4" />
                              <span>Balança Bluetooth</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="manual">
                            <div className="flex items-center space-x-2">
                              <Scale className="h-4 w-4" />
                              <span>Pesagem Manual</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="peso">Peso (kg)</Label>
                      <Input
                        id="peso"
                        type="number"
                        step="0.1"
                        value={newMeasurement.peso_kg}
                        onChange={(e) => setNewMeasurement({...newMeasurement, peso_kg: e.target.value})}
                        placeholder="Ex: 75.5"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="cintura">Circunferência Abdominal (cm)</Label>
                      <Input
                        id="cintura"
                        type="number"
                        value={newMeasurement.circunferencia_abdominal_cm}
                        onChange={(e) => setNewMeasurement({...newMeasurement, circunferencia_abdominal_cm: e.target.value})}
                        placeholder="Ex: 85"
                      />
                    </div>
                    
                    <Button onClick={submitMeasurement} className="w-full">
                      {weighingType === 'balanca' ? 'Conectar Balança' : 'Salvar Medição'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Avaliações */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {/* DEBUG: Indicador visual */}
        <div className="bg-red-500 text-white p-4 mb-4 rounded-lg text-center font-bold text-lg">
          🔍 DEBUG: SEÇÃO DE AVALIAÇÕES - SE VOCÊ VÊ ISSO, O CÓDIGO ESTÁ FUNCIONANDO!
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-full">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Avaliação Profissional Completa</h2>
                <p className="text-sm text-white/80 flex items-center space-x-1">
                  <Shield className="h-3 w-3 text-yellow-300" />
                  <span>Acesso Admin • Análise antropométrica com adipômetro</span>
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Seletor de Avaliação */}
              <Select 
                value={selectedEvaluation?.id || ''} 
                onValueChange={(value) => {
                  const evaluation = evaluations.find(e => e.id === value);
                  setSelectedEvaluation(evaluation || null);
                }}
              >
                <SelectTrigger className="w-48 bg-white/20 border-white/30 text-white">
                  <SelectValue placeholder="Selecionar Avaliação" />
                </SelectTrigger>
                <SelectContent>
                  {evaluations.map(evaluation => (
                    <SelectItem key={evaluation.id} value={evaluation.id}>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {evaluation.evaluation_type === 'profissional' ? 'Dr. Maroco' : 'Auto-avaliação'}
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

              {/* Botão Nova Avaliação */}
              <Button className="bg-white text-blue-600 hover:bg-white/90">
                <Plus className="h-4 w-4 mr-2" />
                Nova Avaliação
              </Button>
            </div>
          </div>
        </div>

        {/* Seção de Demonstração */}
        <div className="bg-gradient-to-r from-green-500 to-teal-600 rounded-xl shadow-lg p-6 mb-6 text-white">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-white" />
            <h3 className="text-lg font-bold text-white">Demonstração - Dados de Exemplo</h3>
          </div>
        </div>
      </div>

      {/* Dashboard Principal */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Informações Personalizadas do Usuário */}
          <div className="lg:col-span-1">
            <UserPersonalizedInfo userId={selectedUser.id} />
          </div>

          {/* Card Principal - Status Atual */}
          <Card className="lg:col-span-3 bg-gradient-to-br from-white to-blue-50 border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-xl text-gray-800">
                  Status Atual - {selectedUser.name}
                  {selectedEvaluation && (
                    <Badge variant="outline" className="ml-2 text-xs">
                      {selectedEvaluation.evaluation_type === 'profissional' ? 'Profissional' : 'Auto'}
                    </Badge>
                  )}
                </span>
                <Badge variant={riskData?.level === 'ALTO' ? 'destructive' : riskData?.level === 'MODERADO' ? 'secondary' : 'default'}>
                  {riskData?.level} RISCO
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestMeasurement && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                  
                  {/* Peso Atual */}
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <Scale className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{latestMeasurement.peso_kg}kg</div>
                    <div className="text-sm text-gray-600">Peso Atual</div>
                  </div>

                  {/* IMC */}
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{latestMeasurement.imc?.toFixed(1)}</div>
                    <div className="text-sm text-gray-600">IMC</div>
                  </div>

                  {/* Cintura */}
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <Target className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-gray-800">{latestMeasurement.circunferencia_abdominal_cm}cm</div>
                    <div className="text-sm text-gray-600">Cintura</div>
                  </div>

                  {/* RCE */}
                  <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                    <Heart className={`h-8 w-8 mx-auto mb-2`} style={{ color: riskData?.color }} />
                    <div className="text-2xl font-bold text-gray-800">{latestMeasurement.rce?.toFixed(2)}</div>
                    <div className="text-sm text-gray-600">RCE</div>
                  </div>
                </div>
              )}

              {/* Silhueta e Análise de Risco */}
              <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="text-center">
                  <ModernSilhouette 
                    color={riskData?.color || '#6366f1'} 
                    size={120} 
                  />
                  <div className="mt-4">
                    <Badge className="text-sm" style={{ backgroundColor: riskData?.color }}>
                      {riskData?.level} RISCO CARDIOMETABÓLICO
                    </Badge>
                    <p className="text-sm text-gray-600 mt-2">{riskData?.description}</p>
                  </div>
                </div>

                {/* Gauge RCE */}
                <div className="flex items-center justify-center">
                  <div className="relative w-48 h-24">
                    <svg width="192" height="96" viewBox="0 0 192 96">
                      {/* Background arc */}
                      <path
                        d="M 16 80 A 80 80 0 0 1 176 80"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      
                      {/* Colored segments */}
                      <path
                        d="M 16 80 A 80 80 0 0 0 96 16"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 96 16 A 80 80 0 0 0 136 30"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 136 30 A 80 80 0 0 0 176 80"
                        fill="none"
                        stroke="#ef4444"
                        strokeWidth="12"
                        strokeLinecap="round"
                      />
                      
                      {/* Needle */}
                      {latestMeasurement && (
                        <g>
                          <line
                            x1="96"
                            y1="80"
                            x2={96 + Math.cos((Math.PI * (1 - (latestMeasurement.rce || 0) / 0.8)) - Math.PI/2) * 60}
                            y2={80 + Math.sin((Math.PI * (1 - (latestMeasurement.rce || 0) / 0.8)) - Math.PI/2) * 60}
                            stroke="#1f2937"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          <circle cx="96" cy="80" r="4" fill="#1f2937" />
                        </g>
                      )}
                    </svg>
                    
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 text-center">
                      <div className="text-2xl font-bold text-gray-800">{latestMeasurement?.rce?.toFixed(2)}</div>
                      <div className="text-sm text-gray-600">Relação Cintura-Estatura</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos de Evolução */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Evolução do Peso */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span>Evolução do Peso</span>
                </div>
                
                {/* Controles de Período */}
                <div className="flex items-center space-x-2">
                  <Label className="text-sm text-gray-600">Período:</Label>
                  <Select value={timeRange} onValueChange={(value: 'week' | 'month' | 'quarter') => setTimeRange(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Semana</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="month">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Mês</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="quarter">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4" />
                          <span>Trimestre</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={12}
                      angle={timeRange === 'quarter' ? -45 : 0}
                      textAnchor={timeRange === 'quarter' ? 'end' : 'middle'}
                      height={timeRange === 'quarter' ? 60 : 30}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(label) => {
                        const dataPoint = evolutionData.find(d => d.date === label);
                        return dataPoint ? new Date(dataPoint.fullDate).toLocaleDateString('pt-BR') : label;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="peso"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.1}
                      strokeWidth={3}
                    />
                    <Line
                      type="monotone"
                      dataKey="peso"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              {/* Estatísticas do período */}
              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Início</div>
                  <div className="text-lg font-bold text-blue-600">
                    {evolutionData.length > 0 ? `${evolutionData[0]?.peso}kg` : '-'}
                  </div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Atual</div>
                  <div className="text-lg font-bold text-green-600">
                    {evolutionData.length > 0 ? `${evolutionData[evolutionData.length - 1]?.peso}kg` : '-'}
                  </div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm text-gray-600">Variação</div>
                  <div className="text-lg font-bold text-orange-600">
                    {evolutionData.length > 1 ? 
                      `${(evolutionData[evolutionData.length - 1]?.peso - evolutionData[0]?.peso).toFixed(1)}kg` : 
                      '-'
                    }
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Análise de Risco Temporal */}
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-600" />
                  <span>Risco Cardiometabólico</span>
                </div>
                
                {/* Período atual */}
                <Badge variant="outline" className="text-xs">
                  {timeRange === 'week' ? 'Última Semana' : 
                   timeRange === 'month' ? 'Último Mês' : 'Último Trimestre'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#64748b" 
                      fontSize={12}
                      angle={timeRange === 'quarter' ? -45 : 0}
                      textAnchor={timeRange === 'quarter' ? 'end' : 'middle'}
                      height={timeRange === 'quarter' ? 60 : 30}
                    />
                    <YAxis stroke="#64748b" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px'
                      }}
                      labelFormatter={(label) => {
                        const dataPoint = evolutionData.find(d => d.date === label);
                        return dataPoint ? new Date(dataPoint.fullDate).toLocaleDateString('pt-BR') : label;
                      }}
                    />
                    
                    {/* Zona de risco de fundo */}
                    <Area
                      type="monotone"
                      dataKey={() => 0.6}
                      stroke="none"
                      fill="#ef4444"
                      fillOpacity={0.1}
                      stackId="1"
                    />
                    
                    <Bar dataKey="cintura" fill="#f59e0b" opacity={0.3} yAxisId="cintura" />
                    <Line
                      type="monotone"
                      dataKey="rce"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>RCE &gt; 0.6:</strong> Alto risco cardiometabólico
                </div>
                <div className="text-sm text-gray-600">
                  <strong>RCE 0.5-0.6:</strong> Risco moderado
                </div>
                <div className="text-sm text-gray-600">
                  <strong>RCE &lt; 0.5:</strong> Baixo risco
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Composição Corporal */}
        <div className="mt-6">
          <Card className="bg-white border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg text-gray-800">Composição Corporal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={bodyCompositionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {bodyCompositionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, '']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2 mt-4">
                {bodyCompositionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedHealthDashboard;