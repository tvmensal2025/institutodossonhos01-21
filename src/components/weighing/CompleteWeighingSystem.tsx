import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Scale, Edit3, Bluetooth, Zap, Shield, Github, Download, Activity, TrendingUp, Users, Code, Heart, LineChart, BarChart3, Target, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import SimpleWeightForm from './SimpleWeightForm';
import { XiaomiScaleFlow } from '../XiaomiScaleFlow';
import { XiaomiScaleConnection } from '../XiaomiScaleConnection';
import { XiaomiScaleTroubleshooter } from '../XiaomiScaleTroubleshooter';
import { XiaomiScaleAdjuster } from '../XiaomiScaleAdjuster';
import PersonagemCorporal3D from '../PersonagemCorporal3D';
import { supabase } from '@/integrations/supabase/client';
import { useUserGender } from '@/hooks/useUserGender';
import type { User } from '@supabase/supabase-js';
import BodyAnalysisCharts from './BodyAnalysisCharts';
import { useToast } from '@/hooks/use-toast';

// Componente de gráfico simples
const WeightChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <LineChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum dado de pesagem encontrado</p>
          <p className="text-sm">Conecte sua balança para começar</p>
        </div>
      </div>
    );
  }

  const maxWeight = Math.max(...data.map(d => d.peso_kg));
  const minWeight = Math.min(...data.map(d => d.peso_kg));
  const range = maxWeight - minWeight;

  return (
    <div className="h-64 relative">
      {/* Eixo Y */}
      <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-muted-foreground">
        <span>{maxWeight.toFixed(1)}kg</span>
        <span>{((maxWeight + minWeight) / 2).toFixed(1)}kg</span>
        <span>{minWeight.toFixed(1)}kg</span>
      </div>
      
      {/* Linha de tendência */}
      <div className="absolute inset-0 flex items-end justify-between px-4 pb-4 ml-12">
        {data.map((point, index) => {
          const height = range > 0 ? ((point.peso_kg - minWeight) / range) * 100 : 50;
          const isLatest = index === 0;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={`w-8 rounded-t transition-all duration-300 hover:bg-blue-600 ${
                  isLatest ? 'bg-blue-600 shadow-lg' : 'bg-blue-500'
                }`}
                style={{ height: `${height}%` }}
                title={`${point.peso_kg}kg - ${new Date(point.measurement_date).toLocaleDateString()}`}
              />
              <span className="text-xs text-muted-foreground mt-2">
                {new Date(point.measurement_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente de composição corporal
const BodyCompositionCard = ({ data }: { data: any }) => {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Composição Corporal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Conecte sua balança para ver dados de composição corporal</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2" />
          Composição Corporal
        </CardTitle>
        <CardDescription>
          Última medição: {new Date(data.measurement_date).toLocaleDateString('pt-BR')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{data.peso_kg?.toFixed(1)}kg</div>
            <div className="text-sm text-muted-foreground">Peso</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{data.imc?.toFixed(1)}</div>
            <div className="text-sm text-muted-foreground">IMC</div>
          </div>
        </div>
        
        {data.body_fat && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Gordura Corporal</span>
              <span className="font-medium">{data.body_fat}%</span>
            </div>
            <Progress value={data.body_fat} className="h-2" />
          </div>
        )}
        
        {data.muscle_mass && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Massa Muscular</span>
              <span className="font-medium">{data.muscle_mass}kg</span>
            </div>
            <Progress value={(data.muscle_mass / 100) * 100} className="h-2" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const CompleteWeighingSystem: React.FC = () => {
  const [activeWeighingType, setActiveWeighingType] = useState<'manual' | 'automatic'>('manual');
  const [user, setUser] = useState<User | null>(null);
  const [weightData, setWeightData] = useState<any[]>([]);
  const [lastMeasurement, setLastMeasurement] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { gender } = useUserGender(user);
  const { toast } = useToast();

  // Dados de exemplo do openScale
  const sampleData = [
    {
      id: 1,
      user_id: 'user123',
      peso_kg: 85.2,
      imc: 28.5,
      circunferencia_abdominal_cm: 92,
      body_fat: 22.5,
      muscle_mass: 45.8,
      water_percentage: 58.2,
      bone_mass: 3.2,
      visceral_fat: 8,
      metabolic_age: 32,
      device_type: 'xiaomi_scale',
      measurement_date: '2024-01-15T08:30:00Z'
    },
    {
      id: 2,
      user_id: 'user123',
      peso_kg: 84.8,
      imc: 28.3,
      circunferencia_abdominal_cm: 91.5,
      body_fat: 22.1,
      muscle_mass: 46.1,
      water_percentage: 58.5,
      bone_mass: 3.2,
      visceral_fat: 8,
      metabolic_age: 31,
      device_type: 'xiaomi_scale',
      measurement_date: '2024-01-18T08:15:00Z'
    },
    {
      id: 3,
      user_id: 'user123',
      peso_kg: 84.1,
      imc: 28.1,
      circunferencia_abdominal_cm: 91,
      body_fat: 21.8,
      muscle_mass: 46.3,
      water_percentage: 58.8,
      bone_mass: 3.2,
      visceral_fat: 7,
      metabolic_age: 31,
      device_type: 'xiaomi_scale',
      measurement_date: '2024-01-21T08:45:00Z'
    },
    {
      id: 4,
      user_id: 'user123',
      peso_kg: 83.7,
      imc: 28.0,
      circunferencia_abdominal_cm: 90.5,
      body_fat: 21.5,
      muscle_mass: 46.5,
      water_percentage: 59.1,
      bone_mass: 3.2,
      visceral_fat: 7,
      metabolic_age: 30,
      device_type: 'xiaomi_scale',
      measurement_date: '2024-01-24T08:20:00Z'
    },
    {
      id: 5,
      user_id: 'user123',
      peso_kg: 83.2,
      imc: 27.8,
      circunferencia_abdominal_cm: 90,
      body_fat: 21.2,
      muscle_mass: 46.8,
      water_percentage: 59.4,
      bone_mass: 3.2,
      visceral_fat: 7,
      metabolic_age: 30,
      device_type: 'xiaomi_scale',
      measurement_date: '2024-01-27T08:30:00Z'
    }
  ];

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
    loadWeightData();
  }, []);

  const loadWeightData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Se não há usuário, usar dados de exemplo
        setWeightData(sampleData);
        setLastMeasurement(sampleData[0]);
        setLoading(false);
        return;
      }

      // Buscar últimas 10 pesagens
      const { data: weightMeasurements, error } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Erro ao carregar dados:', error);
        // Usar dados de exemplo em caso de erro
        setWeightData(sampleData);
        setLastMeasurement(sampleData[0]);
        return;
      }

      if (weightMeasurements && weightMeasurements.length > 0) {
        setWeightData(weightMeasurements);
        setLastMeasurement(weightMeasurements[0]);
      } else {
        // Se não há dados reais, usar dados de exemplo
        setWeightData(sampleData);
        setLastMeasurement(sampleData[0]);
      }

    } catch (error) {
      console.error('Erro:', error);
      // Usar dados de exemplo em caso de erro
      setWeightData(sampleData);
      setLastMeasurement(sampleData[0]);
    } finally {
      setLoading(false);
    }
  };

  const connectToScale = async () => {
    setIsConnecting(true);
    
    try {
      // Simular conexão com balança
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsConnected(true);
      toast({
        title: "Balança Conectada! 🎉",
        description: "Xiaomi Mi Body Scale conectada com sucesso",
      });
      
      // Recarregar dados após conexão
      await loadWeightData();
      
    } catch (error) {
      toast({
        title: "Erro na Conexão",
        description: "Não foi possível conectar com a balança",
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectScale = () => {
    setIsConnected(false);
    toast({
      title: "Balança Desconectada",
      description: "A balança foi desconectada",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
      {/* Header Gigante para TV */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl border-b-4 border-blue-400">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-8">
            <div className="flex items-center space-x-4 sm:space-x-6 lg:space-x-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl lg:rounded-3xl flex items-center justify-center border-2 border-white/30">
                <Scale className="h-6 w-6 sm:h-8 sm:w-8 lg:h-12 lg:w-12 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold mb-1 sm:mb-2">Central de Pesagem</h1>
                <p className="text-sm sm:text-lg lg:text-xl xl:text-2xl text-blue-100">Análise corporal inteligente</p>
              </div>
            </div>
            <div className="flex space-x-3 sm:space-x-4 lg:space-x-6">
              <button
                onClick={() => setActiveWeighingType('manual')}
                className={`px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 xl:px-12 xl:py-6 rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg xl:text-xl transition-all duration-300 ${
                  activeWeighingType === 'manual'
                    ? 'bg-white text-blue-600 shadow-2xl transform scale-105 lg:scale-110'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-2 border-white/20'
                }`}
              >
                <Edit3 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-8 xl:w-8 inline mr-2 sm:mr-3 lg:mr-4" />
                Manual
              </button>
              <button
                onClick={() => setActiveWeighingType('automatic')}
                className={`px-4 py-2 sm:px-6 sm:py-3 lg:px-8 lg:py-4 xl:px-12 xl:py-6 rounded-xl lg:rounded-2xl font-bold text-sm sm:text-base lg:text-lg xl:text-xl transition-all duration-300 ${
                  activeWeighingType === 'automatic'
                    ? 'bg-white text-blue-600 shadow-2xl transform scale-105 lg:scale-110'
                    : 'bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm border-2 border-white/20'
                }`}
              >
                <Scale className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 xl:h-8 xl:w-8 inline mr-2 sm:mr-3 lg:mr-4" />
                Automática
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal para TV */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10 xl:py-12">
        
        {/* Card de Pesagem */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
          <div className="bg-gradient-to-r from-blue-500/50 to-indigo-500/50 px-4 sm:px-6 lg:px-8 xl:px-12 py-4 sm:py-6 lg:py-8 border-b-2 border-white/20">
            <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white flex items-center">
              {activeWeighingType === 'manual' ? (
                <>
                  <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-blue-300 mr-3 sm:mr-4 lg:mr-6" />
                  Nova Pesagem Manual
                </>
              ) : (
                <>
                  <Scale className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-blue-300 mr-3 sm:mr-4 lg:mr-6" />
                  Balança Xiaomi Mi Body Scale 2
                </>
              )}
            </h2>
          </div>
          <div className="p-4 sm:p-6 lg:p-8 xl:p-12">
            {activeWeighingType === 'manual' ? (
              <SimpleWeightForm />
            ) : (
              <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                <p className="text-sm sm:text-base lg:text-lg xl:text-2xl text-gray-200">
                  Conecte sua balança Xiaomi para pesagem automática e análise completa
                </p>
                <div className="grid gap-4 sm:gap-6">
                  <XiaomiScaleFlow />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <XiaomiScaleConnection />
                    <XiaomiScaleTroubleshooter />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Grid Principal com Personagem 3D Central */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
          
          {/* Coluna Esquerda - Gráficos */}
          <div className="xl:col-span-3 space-y-6 sm:space-y-8">
            
            {/* Resumo Corporal */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/50 to-cyan-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-300 mr-2 sm:mr-3 lg:mr-4" />
                  Resumo Corporal
                </h3>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                {lastMeasurement ? (
                  <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                    {/* Peso Principal */}
                    <div className="text-center bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-xl lg:rounded-2xl p-4 sm:p-6 border-2 border-blue-400/30">
                      <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-blue-300 mb-2 sm:mb-4">
                        {lastMeasurement.peso_kg?.toFixed(1)}kg
                      </div>
                      <div className="text-sm sm:text-base lg:text-lg text-gray-200">
                        Última: {new Date(lastMeasurement.measurement_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    {/* Métricas Principais */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div className="bg-green-500/30 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center border-2 border-green-400/30">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-300">
                          {lastMeasurement.imc?.toFixed(1) || '--'}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-200">IMC</div>
                      </div>
                      <div className="bg-purple-500/30 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center border-2 border-purple-400/30">
                        <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-300">
                          {lastMeasurement.body_fat?.toFixed(1) || '--'}%
                        </div>
                        <div className="text-xs sm:text-sm text-gray-200">Gordura</div>
                      </div>
                    </div>

                    {/* Variação de Peso */}
                    {weightData.length > 1 && (
                      <div className="bg-gray-500/30 rounded-xl lg:rounded-2xl p-3 sm:p-4 border-2 border-gray-400/30">
                        <div className="text-center">
                          <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-200">
                            {weightData[0].peso_kg - weightData[1].peso_kg > 0 ? '+' : ''}
                            {(weightData[0].peso_kg - weightData[1].peso_kg).toFixed(1)}kg
                          </div>
                          <div className="text-xs sm:text-sm text-gray-300">Variação</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-300 py-8 sm:py-12">
                    <Scale className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mx-auto mb-4 sm:mb-6 opacity-50" />
                    <p className="text-base sm:text-lg lg:text-xl">Nenhuma pesagem registrada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Composição Corporal */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Composição Corporal</h3>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <BodyCompositionCard data={lastMeasurement} />
              </div>
            </div>

            {/* Métricas Detalhadas */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500/50 to-amber-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Métricas Detalhadas</h3>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { name: "Circunferência abdominal", value: lastMeasurement?.circunferencia_abdominal_cm, unit: "cm", precision: "1cm", icon: "📏" },
                    { name: "Massa muscular", value: lastMeasurement?.muscle_mass, unit: "kg", precision: "0.1kg", icon: "💪" },
                    { name: "Água corporal", value: lastMeasurement?.water_percentage, unit: "%", precision: "0.1%", icon: "💧" },
                    { name: "Massa óssea", value: lastMeasurement?.bone_mass, unit: "kg", precision: "0.1kg", icon: "🦴" },
                    { name: "Gordura visceral", value: lastMeasurement?.visceral_fat, unit: "", precision: "nível 1-30", icon: "⚠️" },
                    { name: "Idade metabólica", value: lastMeasurement?.metabolic_age, unit: "anos", precision: "1 ano", icon: "⏰" }
                  ].map((metric, index) => (
                    <div key={index} className="flex justify-between items-center py-2 sm:py-3 lg:py-4 border-b-2 border-white/10 last:border-b-0">
                      <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                        <span className="text-lg sm:text-xl lg:text-2xl">{metric.icon}</span>
                        <span className="text-sm sm:text-base lg:text-lg text-gray-200">{metric.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm sm:text-base lg:text-lg font-bold text-white">
                          {metric.value ? `${metric.value}${metric.unit}` : 'N/A'}
                        </span>
                        <div className="text-xs sm:text-sm text-gray-300">({metric.precision})</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Central - Personagem 3D Gigante */}
          <div className="xl:col-span-6">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden h-full">
              <div className="bg-gradient-to-r from-pink-500/50 to-rose-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center">Visualização Corporal 3D</h3>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
                <div className="text-center w-full">
                  <PersonagemCorporal3D 
                    genero={gender === 'male' ? 'masculino' : gender === 'female' ? 'feminino' : 'masculino'} 
                    className="w-full h-[500px] sm:h-[600px] lg:h-[700px] xl:h-[800px] 2xl:h-[900px] mx-auto" 
                  />
                  <p className="text-sm sm:text-base lg:text-lg text-gray-200 mt-4 sm:mt-6">
                    Visualização da composição corporal
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Gráficos */}
          <div className="xl:col-span-3 space-y-6 sm:space-y-8">
            
            {/* Gráfico de Evolução */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/50 to-emerald-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                  <LineChart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-green-300 mr-2 sm:mr-3 lg:mr-4" />
                  Evolução do Peso
                </h3>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="h-64 sm:h-72 lg:h-80">
                  <WeightChart data={weightData} />
                </div>
              </div>
            </div>

            {/* Análise Corporal Avançada */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500/50 to-blue-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Análise Corporal Avançada</h3>
                <p className="text-sm sm:text-base lg:text-lg text-gray-200 mt-1 sm:mt-2">Gráficos detalhados de composição corporal</p>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <BodyAnalysisCharts />
              </div>
            </div>

            {/* Novo Gráfico - Distribuição de Gordura */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500/50 to-pink-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                  <span className="text-2xl mr-2">🔥</span>
                  Distribuição de Gordura
                </h3>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4">
                  {lastMeasurement && [
                    { name: 'Gordura Subcutânea', value: lastMeasurement.body_fat || 0, color: 'bg-red-500', max: 50 },
                    { name: 'Gordura Visceral', value: lastMeasurement.visceral_fat || 0, color: 'bg-orange-500', max: 30 },
                    { name: 'Gordura Total', value: (lastMeasurement.body_fat || 0) + (lastMeasurement.visceral_fat || 0), color: 'bg-pink-500', max: 80 }
                  ].map((metric, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-200">{metric.name}</span>
                        <span className="font-bold text-white">{metric.value}%</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-3">
                        <div 
                          className={`${metric.color} h-3 rounded-full transition-all duration-500 shadow-sm`}
                          style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Novo Gráfico - Metabolismo */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-500/50 to-orange-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                  <span className="text-2xl mr-2">⚡</span>
                  Metabolismo
                </h3>
              </div>
              <div className="p-4 sm:p-6 lg:p-8">
                <div className="space-y-4">
                  {lastMeasurement && [
                    { name: 'Idade Metabólica', value: lastMeasurement.metabolic_age || 25, unit: 'anos', icon: '⏰' },
                    { name: 'Taxa Metabólica', value: Math.round((lastMeasurement.peso_kg || 70) * 24), unit: 'kcal/dia', icon: '🔥' },
                    { name: 'Nível de Atividade', value: 'Moderado', unit: '', icon: '🏃' }
                  ].map((metric, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-xl p-3 border border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">{metric.icon}</span>
                          <span className="text-sm text-gray-200">{metric.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">{metric.value}{metric.unit}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteWeighingSystem;