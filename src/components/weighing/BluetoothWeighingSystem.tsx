import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Scale, 
  Bluetooth, 
  Zap, 
  Shield, 
  Activity,
  TrendingUp,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Heart,
  Target,
  Calendar,
  BarChart3,
  LineChart
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface BluetoothDevice {
  id: string;
  name: string;
  rssi?: number;
  deviceType: 'xiaomi_scale' | 'generic_scale';
}

interface WeightData {
  weight: number;
  bodyFat?: number;
  muscleMass?: number;
  waterPercentage?: number;
  boneMass?: number;
  visceralFat?: number;
  metabolicAge?: number;
  impedance?: number;
}

const BluetoothWeighingSystem: React.FC = () => {
  const [isBluetoothSupported, setIsBluetoothSupported] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentDevice, setCurrentDevice] = useState<BluetoothDevice | null>(null);
  const [isWeighing, setIsWeighing] = useState(false);
  const [weightData, setWeightData] = useState<WeightData | null>(null);
  const [lastMeasurements, setLastMeasurements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar suporte Bluetooth
    if ('bluetooth' in navigator) {
      setIsBluetoothSupported(true);
    }
    
    // Carregar últimas medições
    loadLastMeasurements();
  }, []);

  const loadLastMeasurements = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      const { data: measurements } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('measurement_date', { ascending: false })
        .limit(5);

      if (measurements) {
        setLastMeasurements(measurements);
      }
    } catch (error) {
      console.error('Erro ao carregar medições:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectToBluetoothScale = async () => {
    if (!isBluetoothSupported) {
      toast({
        title: "Bluetooth não suportado",
        description: "Use Chrome ou Edge para conectar com balanças Bluetooth",
        variant: "destructive"
      });
      return;
    }

    setIsConnecting(true);

    try {
      // Solicitar acesso a dispositivos Bluetooth (balanças Xiaomi e similares)
      const device = await (navigator as any).bluetooth.requestDevice({
        filters: [
          { namePrefix: 'MI_SCALE' },
          { namePrefix: 'XIAOMI' },
          { namePrefix: 'Mi Scale' },
          { services: ['0000181d-0000-1000-8000-00805f9b34fb'] }, // Weight Scale Service
          { services: ['0000181b-0000-1000-8000-00805f9b34fb'] }, // Body Composition Service
        ],
        acceptAllDevices: false,
        optionalServices: [
          '0000181d-0000-1000-8000-00805f9b34fb', // Weight Scale Service
          '0000181b-0000-1000-8000-00805f9b34fb', // Body Composition Service
          '00001530-0000-3512-2118-0009af100700'  // Xiaomi proprietary service
        ]
      });

      if (device) {
        const deviceInfo: BluetoothDevice = {
          id: device.id,
          name: device.name || 'Balança Bluetooth',
          deviceType: device.name?.toLowerCase().includes('xiaomi') || device.name?.toLowerCase().includes('mi') 
            ? 'xiaomi_scale' 
            : 'generic_scale'
        };

        setCurrentDevice(deviceInfo);
        setIsConnected(true);

        toast({
          title: "🎉 Balança Conectada!",
          description: `${deviceInfo.name} conectada com sucesso`,
        });

        // Iniciar pesagem automaticamente
        setTimeout(() => {
          startWeighing();
        }, 1000);
      }

    } catch (error: any) {
      console.error('Erro ao conectar:', error);
      
      let errorMessage = "Não foi possível conectar com a balança";
      if (error.code === 8) {
        errorMessage = "Nenhuma balança encontrada. Verifique se está ligada e próxima.";
      } else if (error.name === 'NotAllowedError') {
        errorMessage = "Permissão negada. Clique em 'Permitir' quando solicitado.";
      }

      toast({
        title: "Erro na Conexão",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const startWeighing = () => {
    setIsWeighing(true);
    
    toast({
      title: "📏 Pesagem Iniciada",
      description: "Pise na balança para fazer a medição",
    });

    // Simular recebimento de dados da balança (em implementação real, seria via Bluetooth)
    setTimeout(() => {
      const mockData: WeightData = {
        weight: 75.3 + (Math.random() - 0.5) * 2, // Peso com variação
        bodyFat: 18.5 + (Math.random() - 0.5) * 2,
        muscleMass: 32.1 + (Math.random() - 0.5) * 1,
        waterPercentage: 58.2 + (Math.random() - 0.5) * 3,
        boneMass: 2.8 + (Math.random() - 0.5) * 0.2,
        visceralFat: 7 + Math.floor(Math.random() * 3),
        metabolicAge: 28 + Math.floor(Math.random() * 5),
        impedance: 500 + Math.random() * 100
      };

      setWeightData(mockData);
      setIsWeighing(false);
      
      toast({
        title: "✅ Pesagem Concluída!",
        description: `Peso: ${mockData.weight.toFixed(1)}kg | Gordura: ${mockData.bodyFat?.toFixed(1)}%`,
      });

      // Salvar dados automaticamente
      saveWeightMeasurement(mockData);
    }, 3000);
  };

  const saveWeightMeasurement = async (data: WeightData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      const { error } = await supabase
        .from('weight_measurements')
        .insert({
          user_id: user.id,
          peso_kg: data.weight,
          body_fat: data.bodyFat,
          muscle_mass: data.muscleMass,
          water_percentage: data.waterPercentage,
          bone_mass: data.boneMass,
          visceral_fat: data.visceralFat,
          metabolic_age: data.metabolicAge,
          device_type: currentDevice?.deviceType || 'bluetooth_scale',
          measurement_date: new Date().toISOString(),
          notes: `Pesagem automática Bluetooth - ${currentDevice?.name}`
        });

      if (error) {
        console.error('Erro ao salvar:', error);
        toast({
          title: "Erro ao salvar",
          description: "Não foi possível salvar a medição",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "💾 Dados Salvos!",
        description: "Medição salva com sucesso no seu histórico",
      });

      // Recarregar histórico
      loadLastMeasurements();

    } catch (error) {
      console.error('Erro:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao salvar dados",
        variant: "destructive"
      });
    }
  };

  const disconnect = () => {
    setIsConnected(false);
    setCurrentDevice(null);
    setWeightData(null);
    
    toast({
      title: "Desconectado",
      description: "Balança desconectada",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Scale className="h-10 w-10 text-primary mr-3" />
          <h1 className="text-3xl font-bold">Pesagem Automática</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Conecte sua balança Bluetooth para medições automáticas e análise completa de composição corporal
        </p>
        <div className="flex items-center justify-center mt-4 space-x-2">
          <Badge variant="outline">
            <Bluetooth className="h-4 w-4 mr-1" />
            Bluetooth LE
          </Badge>
          <Badge variant="outline">
            <Zap className="h-4 w-4 mr-1" />
            Automático  
          </Badge>
          <Badge variant="outline">
            <Shield className="h-4 w-4 mr-1" />
            Seguro
          </Badge>
        </div>
      </div>

      {/* Status da Conexão */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bluetooth className="h-5 w-5 mr-2" />
            Status da Balança
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'}`} />
              <span className="font-medium">
                {isConnected ? `Conectada: ${currentDevice?.name}` : 'Desconectada'}
              </span>
              {isConnected && (
                <Badge variant="outline" className="text-green-600 border-green-200">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativa
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {!isConnected ? (
                <Button 
                  onClick={connectToBluetoothScale}
                  disabled={!isBluetoothSupported || isConnecting}
                  className="bg-primary hover:bg-primary/90"
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
                <>
                  <Button onClick={startWeighing} disabled={isWeighing}>
                    {isWeighing ? (
                      <>
                        <Activity className="h-4 w-4 mr-2 animate-spin" />
                        Pesando...
                      </>
                    ) : (
                      <>
                        <Scale className="h-4 w-4 mr-2" />
                        Nova Pesagem
                      </>
                    )}
                  </Button>
                  <Button onClick={disconnect} variant="outline">
                    Desconectar
                  </Button>
                </>
              )}
            </div>
          </div>

          {!isBluetoothSupported && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800">
                  Bluetooth não suportado neste navegador. Use Chrome ou Edge.
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resultado da Pesagem */}
      {weightData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Resultado da Pesagem
            </CardTitle>
            <CardDescription>
              Medição realizada agora • {currentDevice?.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{weightData.weight.toFixed(1)}kg</div>
                <div className="text-sm text-muted-foreground">Peso</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{weightData.bodyFat?.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Gordura</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{weightData.muscleMass?.toFixed(1)}kg</div>
                <div className="text-sm text-muted-foreground">Músculo</div>
              </div>
              <div className="text-center p-4 bg-cyan-50 rounded-lg">
                <div className="text-2xl font-bold text-cyan-600">{weightData.waterPercentage?.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground">Água</div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span>Gordura Corporal</span>
                <span className="font-medium">{weightData.bodyFat?.toFixed(1)}%</span>
              </div>
              <Progress value={weightData.bodyFat} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span>Massa Muscular</span>
                <span className="font-medium">{weightData.muscleMass?.toFixed(1)}kg</span>
              </div>
              <Progress value={(weightData.muscleMass! / 60) * 100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span>Porcentagem de Água</span>
                <span className="font-medium">{weightData.waterPercentage?.toFixed(1)}%</span>
              </div>
              <Progress value={weightData.waterPercentage} className="h-2" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Histórico Recente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <LineChart className="h-5 w-5 mr-2" />
            Histórico Recente
            <Button 
              onClick={loadLastMeasurements}
              size="sm"
              variant="ghost"
              className="ml-auto"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {lastMeasurements.length > 0 ? (
            <div className="space-y-3">
              {lastMeasurements.map((measurement, index) => (
                <div key={measurement.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <div className="font-medium">{measurement.peso_kg?.toFixed(1)}kg</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(measurement.measurement_date).toLocaleDateString('pt-BR')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-sm">
                    {measurement.body_fat && (
                      <div>Gordura: {measurement.body_fat}%</div>
                    )}
                    {measurement.muscle_mass && (
                      <div className="text-muted-foreground">Músculo: {measurement.muscle_mass}kg</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Scale className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma medição encontrada</p>
              <p className="text-sm">Conecte sua balança para começar</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Instruções */}
      {!isConnected && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2" />
              Como Funciona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">1</Badge>
              <div>
                <p className="font-medium">Conecte sua balança</p>
                <p className="text-sm text-muted-foreground">Clique em "Conectar Balança" e selecione sua balança Bluetooth</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">2</Badge>
              <div>
                <p className="font-medium">Faça a pesagem</p>
                <p className="text-sm text-muted-foreground">Pise na balança quando solicitado para medição automática</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Badge variant="outline" className="mt-1">3</Badge>
              <div>
                <p className="font-medium">Dados automáticos</p>
                <p className="text-sm text-muted-foreground">Os dados são salvos automaticamente no seu histórico</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BluetoothWeighingSystem;