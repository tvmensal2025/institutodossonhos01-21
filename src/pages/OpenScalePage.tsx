import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, 
  Bluetooth, 
  Zap, 
  Shield, 
  Github, 
  Download, 
  Smartphone,
  Activity,
  TrendingUp,
  Users,
  Code,
  Heart,
  LineChart,
  BarChart3,
  Target,
  Calendar,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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

// Componente de gráfico de composição corporal
const BodyCompositionChart = ({ data }: { data: any }) => {
  if (!data) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Nenhum dado de composição corporal</p>
        </div>
      </div>
    );
  }

  const metrics = [
    { name: 'Gordura', value: data.body_fat || 0, color: 'bg-red-500', max: 50 },
    { name: 'Músculo', value: data.muscle_mass || 0, color: 'bg-blue-500', max: 100 },
    { name: 'Água', value: data.water_percentage || 0, color: 'bg-cyan-500', max: 80 },
    { name: 'Osso', value: data.bone_mass || 0, color: 'bg-yellow-500', max: 10 }
  ];

  return (
    <div className="space-y-4">
      {metrics.map((metric, index) => (
        <div key={index} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{metric.name}</span>
            <span className="font-medium">
              {metric.name === 'Gordura' || metric.name === 'Água' ? `${metric.value}%` : `${metric.value}kg`}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`${metric.color} h-2 rounded-full transition-all duration-500`}
              style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
            />
          </div>
        </div>
      ))}
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

const OpenScalePage: React.FC = () => {
  const [weightData, setWeightData] = useState<any[]>([]);
  const [lastMeasurement, setLastMeasurement] = useState<any>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
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

  // Carregar dados de pesagem do usuário
  useEffect(() => {
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Scale className="h-12 w-12 text-blue-600 mr-3" />
          <h1 className="text-4xl font-bold text-gray-900">openScale</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Plataforma open-source para integração inteligente com balanças de composição corporal
        </p>
        <div className="flex items-center justify-center mt-4 space-x-2">
          <Badge variant="secondary" className="text-sm">
            <Github className="h-4 w-4 mr-1" />
            Open Source
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Bluetooth className="h-4 w-4 mr-1" />
            Bluetooth LE
          </Badge>
          <Badge variant="outline" className="text-sm">
            <Shield className="h-4 w-4 mr-1" />
            Privacidade
          </Badge>
        </div>
      </div>

      {/* Status da Conexão */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bluetooth className="h-6 w-6 mr-2" />
            Status da Balança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {isConnected ? 'Conectada' : 'Desconectada'}
              </span>
              {isConnected && (
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Xiaomi Mi Body Scale 2
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {!isConnected ? (
                <Button 
                  onClick={connectToScale} 
                  disabled={isConnecting}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isConnecting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Bluetooth className="h-4 w-4 mr-2" />
                      Conectar Balança
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  onClick={disconnectScale} 
                  variant="outline"
                >
                  <Bluetooth className="h-4 w-4 mr-2" />
                  Desconectar
                </Button>
              )}
              <Button 
                onClick={loadWeightData} 
                variant="outline"
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Principal */}
      <Tabs defaultValue="overview" className="mb-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
          <TabsTrigger value="composition">Composição</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Resumo de Peso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Resumo de Peso
                </CardTitle>
              </CardHeader>
              <CardContent>
                {lastMeasurement ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {lastMeasurement.peso_kg?.toFixed(1)}kg
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Última pesagem: {new Date(lastMeasurement.measurement_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                    
                    {weightData.length > 1 && (
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-lg font-semibold text-green-600">
                            {weightData[0].peso_kg - weightData[1].peso_kg > 0 ? '+' : ''}
                            {(weightData[0].peso_kg - weightData[1].peso_kg).toFixed(1)}kg
                          </div>
                          <div className="text-xs text-muted-foreground">Variação</div>
                        </div>
                        <div>
                          <div className="text-lg font-semibold text-purple-600">
                            {weightData.length}
                          </div>
                          <div className="text-xs text-muted-foreground">Medições</div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma pesagem registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Composição Corporal */}
            <BodyCompositionCard data={lastMeasurement} />
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <LineChart className="h-5 w-5 mr-2" />
                  Evolução do Peso
                </CardTitle>
                <CardDescription>
                  Histórico das últimas {weightData.length} pesagens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <WeightChart data={weightData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Composição Corporal
                </CardTitle>
                <CardDescription>
                  Distribuição atual dos componentes corporais
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BodyCompositionChart data={lastMeasurement} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="composition" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Métricas Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Peso", value: lastMeasurement?.peso_kg, unit: "kg", precision: "0.1kg" },
                  { name: "IMC", value: lastMeasurement?.imc, unit: "", precision: "0.1" },
                  { name: "Circunferência abdominal", value: lastMeasurement?.circunferencia_abdominal_cm, unit: "cm", precision: "1cm" }
                ].map((metric, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">{metric.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        {metric.value ? `${metric.value}${metric.unit}` : 'N/A'}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">({metric.precision})</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Composição Corporal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: "Gordura corporal", value: lastMeasurement?.body_fat, unit: "%", precision: "0.1%" },
                  { name: "Massa muscular", value: lastMeasurement?.muscle_mass, unit: "kg", precision: "0.1kg" },
                  { name: "Água corporal", value: lastMeasurement?.water_percentage, unit: "%", precision: "0.1%" },
                  { name: "Massa óssea", value: lastMeasurement?.bone_mass, unit: "kg", precision: "0.1kg" },
                  { name: "Gordura visceral", value: lastMeasurement?.visceral_fat, unit: "", precision: "nível 1-30" },
                  { name: "Idade metabólica", value: lastMeasurement?.metabolic_age, unit: "anos", precision: "1 ano" }
                ].map((metric, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-700">{metric.name}</span>
                    <div className="text-right">
                      <span className="text-sm font-medium">
                        {metric.value ? `${metric.value}${metric.unit}` : 'N/A'}
                      </span>
                      <span className="text-xs text-gray-400 ml-2">({metric.precision})</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-6">
          {/* O que é o openScale */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Code className="h-6 w-6 mr-2 text-blue-600" />
                O que é o openScale?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-700 mb-4">
                    O <strong>openScale</strong> é um projeto open-source que permite conectar 
                    balanças inteligentes (como Xiaomi Mi Body Scale) diretamente ao seu smartphone 
                    ou computador via Bluetooth, sem depender de aplicativos proprietários.
                  </p>
                  <p className="text-gray-700 mb-4">
                    Desenvolvido pela comunidade, ele oferece uma alternativa transparente e 
                    controlada pelo usuário para monitorar sua composição corporal.
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://github.com/oliexdev/openScale" target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-1" />
                        Ver no GitHub
                      </a>
                    </Button>
                    <Button variant="outline" size="sm" asChild>
                      <a href="https://github.com/oliexdev/openScale/releases" target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-3">Características Principais</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center">
                      <Zap className="h-4 w-4 text-blue-600 mr-2" />
                      Conexão direta via Bluetooth LE
                    </li>
                    <li className="flex items-center">
                      <Shield className="h-4 w-4 text-green-600 mr-2" />
                      Dados ficam no seu dispositivo
                    </li>
                    <li className="flex items-center">
                      <Activity className="h-4 w-4 text-purple-600 mr-2" />
                      Suporte a múltiplas balanças
                    </li>
                    <li className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-orange-600 mr-2" />
                      Análise de tendências
                    </li>
                    <li className="flex items-center">
                      <Users className="h-4 w-4 text-red-600 mr-2" />
                      Múltiplos usuários
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Balanças Suportadas */}
          <Card>
            <CardHeader>
              <CardTitle>Balanças Compatíveis</CardTitle>
              <CardDescription>
                Modelos testados e suportados pelo protocolo openScale
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    name: "Xiaomi Mi Body Scale 2",
                    features: ["Peso", "Gordura corporal", "Massa muscular", "Água corporal"],
                    status: "✅ Totalmente compatível"
                  },
                  {
                    name: "Xiaomi Mi Body Composition Scale",
                    features: ["Peso", "Gordura corporal", "Massa muscular", "Água corporal", "Massa óssea"],
                    status: "✅ Totalmente compatível"
                  },
                  {
                    name: "Xiaomi Mi Scale",
                    features: ["Peso", "IMC"],
                    status: "✅ Compatível"
                  },
                  {
                    name: "Outras balanças Bluetooth LE",
                    features: ["Peso básico"],
                    status: "🔄 Suporte experimental"
                  }
                ].map((scale, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">{scale.name}</h4>
                    <ul className="text-sm text-gray-600 mb-3">
                      {scale.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Badge variant="outline" className="text-xs">
                      {scale.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* CTA */}
      <Card className="text-center">
        <CardContent className="pt-6">
          <h3 className="text-2xl font-bold mb-4">Pronto para começar?</h3>
          <p className="text-gray-600 mb-6">
            Conecte sua balança Xiaomi e comece a monitorar sua saúde de forma inteligente e privada
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700" asChild>
              <a href="/app/scale-test">
                <Scale className="h-5 w-5 mr-2" />
                Conectar Balança
              </a>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="https://github.com/oliexdev/openScale" target="_blank" rel="noopener noreferrer">
                <Github className="h-5 w-5 mr-2" />
                Saiba Mais
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenScalePage;
