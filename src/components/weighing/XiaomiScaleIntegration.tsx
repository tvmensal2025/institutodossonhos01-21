import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Scale,
  Bluetooth,
  Wifi, 
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Activity,
  Heart,
  Target,
  Info,
  Zap,
  Battery
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { xiaomiScaleService, XiaomiScaleData, XiaomiScaleDevice } from '@/lib/xiaomi-scale-service';

interface XiaomiScaleIntegrationProps {
  user: { id: string } | null;
}

const XiaomiScaleIntegration: React.FC<XiaomiScaleIntegrationProps> = ({ user }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isWeighing, setIsWeighing] = useState(false);
  const [bluetoothSupported, setBluetoothSupported] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<XiaomiScaleDevice | null>(null);
  const [weighingData, setWeighingData] = useState<XiaomiScaleData | null>(null);
  const [lastWeighing, setLastWeighing] = useState<{
    peso_kg: number;
    measurement_date: string;
    imc?: number;
  } | null>(null);
  const [userPhysicalData, setUserPhysicalData] = useState<{
    altura_cm: number;
    idade: number;
    sexo: string;
  } | null>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkBluetoothSupport();
    if (user) {
      fetchUserPhysicalData();
      fetchLastWeighing();
    }

    // Configurar callbacks do serviço
    xiaomiScaleService.onData(handleScaleData);
    xiaomiScaleService.onConnectionChange(handleConnectionChange);

    return () => {
      // Cleanup
      xiaomiScaleService.disconnect();
    };
  }, [user]);

  const checkBluetoothSupport = () => {
    if ('bluetooth' in navigator) {
      setBluetoothSupported(true);
    } else {
      setBluetoothSupported(false);
    }
  };

  const fetchUserPhysicalData = async () => {
    try {
      const { data, error } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user physical data:', error);
      } else {
        setUserPhysicalData(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchLastWeighing = async () => {
    try {
      const { data, error } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', user?.id)
        .order('measurement_date', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching last weighing:', error);
      } else {
        setLastWeighing(data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleConnectionChange = (connected: boolean) => {
    setIsConnected(connected);
    if (connected) {
      const device = xiaomiScaleService.getDeviceInfo();
      setDeviceInfo(device);
      
      // Obter nível da bateria
      xiaomiScaleService.getBatteryLevel().then(level => {
        setBatteryLevel(level);
      });

      toast({
        title: "Balança Conectada! 🎉",
        description: "Xiaomi Mi Body Scale 2 conectada com sucesso",
      });
    } else {
      setDeviceInfo(null);
      setBatteryLevel(null);
      toast({
        title: "Balança Desconectada",
        description: "A balança foi desconectada",
        variant: "destructive",
      });
    }
  };

  const handleScaleData = async (data: XiaomiScaleData) => {
    console.log('Dados recebidos da balança:', data);
    setWeighingData(data);
    setIsWeighing(false);

    // Salvar dados automaticamente
    try {
      await saveWeighingData(data);
      toast({
        title: "Pesagem Concluída! 🎉",
        description: `Peso: ${data.weight.toFixed(1)}kg registrado automaticamente`,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Peso registrado mas não foi possível salvar no banco de dados",
        variant: "destructive",
      });
    }
  };

  const connectToScale = async () => {
    try {
      setIsScanning(true);
      
      const device = await xiaomiScaleService.connect();
      setDeviceInfo(device);
      setIsConnected(true);

      // Obter nível da bateria
      const battery = await xiaomiScaleService.getBatteryLevel();
      setBatteryLevel(battery);

    } catch (error) {
      console.error('Erro ao conectar com a balança:', error);
      toast({
        title: "Erro de Conexão",
        description: error instanceof Error ? error.message : "Não foi possível conectar com a balança",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const disconnectFromScale = async () => {
    try {
      await xiaomiScaleService.disconnect();
      setIsConnected(false);
      setDeviceInfo(null);
      setBatteryLevel(null);
    } catch (error) {
      console.error('Erro ao desconectar:', error);
    }
  };

  const startWeighing = async () => {
    if (!isConnected) {
      toast({
        title: "Balança não conectada",
        description: "Conecte-se a uma balança primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsWeighing(true);
    xiaomiScaleService.startWeighing();
    
    toast({
      title: "Pesagem Iniciada",
      description: "Suba na balança descalço. Peso será registrado automaticamente em 10 segundos.",
    });
  };

  const saveWeighingData = async (data: XiaomiScaleData) => {
    if (!user || !userPhysicalData) return;

    const bmi = calculateBMI(data.weight);
    
    // Estimar circunferência abdominal baseada na composição corporal
    const estimatedAbdominalCircumference = data.bodyFat ? 
      Math.round(70 + (data.bodyFat - 15) * 1.5) : // Estimativa baseada na gordura corporal
      Math.round(80 + (data.weight - 60) * 0.5); // Estimativa básica baseada no peso
    
    try {
      const weightMeasurement = {
        user_id: user.id,
        peso_kg: data.weight,
        gordura_corporal_percent: data.bodyFat,
        massa_muscular_kg: data.muscleMass,
        agua_corporal_percent: data.bodyWater,
        osso_kg: data.boneMass,
        metabolismo_basal_kcal: data.basalMetabolism,
        idade_metabolica: data.metabolicAge,
        imc: bmi,
        circunferencia_abdominal_cm: estimatedAbdominalCircumference,
        gordura_visceral: data.bodyFat ? Math.round(data.bodyFat * 0.4) : undefined, // Estimativa de gordura visceral
        device_type: 'xiaomi_scale',
        notes: `Pesagem automática - Gordura: ${data.bodyFat?.toFixed(1)}%, Músculo: ${data.muscleMass?.toFixed(1)}kg, Água: ${data.bodyWater?.toFixed(1)}%`
      };

      const { error } = await supabase
        .from('weight_measurements')
        .insert(weightMeasurement);

      if (error) {
        console.error('Error saving weighing data:', error);
        throw error;
      }

      // Refresh data
      await fetchLastWeighing();
      await fetchUserPhysicalData();

    } catch (error) {
      console.error('Error saving data:', error);
      throw error;
    }
  };

  const calculateBMI = (weight: number) => {
    if (!userPhysicalData?.altura_cm) return null;
    const heightInMeters = userPhysicalData.altura_cm / 100;
    return weight / (heightInMeters * heightInMeters);
  };

  const getWeightTrend = () => {
    if (!weighingData || !lastWeighing) return null;
    
    const difference = weighingData.weight - lastWeighing.peso_kg;
    if (Math.abs(difference) < 0.1) return 'stable';
    return difference > 0 ? 'up' : 'down';
  };

  const getTrendIcon = () => {
    const trend = getWeightTrend();
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-500' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-500' };
    return { text: 'Obesidade', color: 'text-red-500' };
  };

        return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Scale className="h-10 w-10 text-blue-600" />
          Xiaomi Mi Body Scale 2
        </h1>
        <p className="text-muted-foreground text-lg">
          Conecte sua balança inteligente e monitore sua evolução em tempo real
        </p>
      </div>

      {/* Bluetooth Support Check */}
            {!bluetoothSupported && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
            Seu navegador não suporta Web Bluetooth API. Para usar esta funcionalidade, 
            acesse através do Chrome ou Edge mais recente.
                </AlertDescription>
              </Alert>
            )}

      {/* Connection Status */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="font-medium">
                {isConnected ? 'Conectado' : 'Desconectado'}
              </span>
          </div>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? 'Online' : 'Offline'}
            </Badge>
          </div>

          {deviceInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Dispositivo:</span>
                <span className="font-medium">{deviceInfo.name}</span>
              </div>
              {batteryLevel !== null && (
                <div className="flex items-center justify-between text-sm">
                  <span>Bateria:</span>
                  <div className="flex items-center gap-2">
                    <Battery className="h-4 w-4" />
                    <span className="font-medium">{batteryLevel}%</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {!isConnected && (
            <div className="space-y-4">
              <Button 
                onClick={connectToScale}
                disabled={isScanning}
                className="w-full"
              >
                {isScanning ? 'Procurando...' : 'Conectar Balança'}
              </Button>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Certifique-se de que sua balança Xiaomi está ligada e próxima ao dispositivo.
                  A balança deve estar em modo de descoberta.
                </AlertDescription>
              </Alert>
                        </div>
          )}

          {isConnected && (
            <Button 
              onClick={disconnectFromScale}
              variant="outline"
              className="w-full"
            >
              Desconectar
            </Button>
                      )}
              </CardContent>
            </Card>

      {/* Weighing Process */}
      <Card className="health-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Processo de Pesagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConnected ? (
            <div className="text-center py-8">
              <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Conecte-se a uma balança para iniciar a pesagem
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {isWeighing && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 animate-pulse text-primary" />
                    <span className="text-sm font-medium">Aguardando dados da balança...</span>
                  </div>
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">⏱️ Timeout em 10 segundos</p>
                    <p className="text-lg font-semibold text-primary">Suba na balança para registrar seu peso</p>
                  </div>
                  <Progress value={50} className="w-full" />
              </div>
              )}
              
              <div className="flex gap-3">
                <Button 
                  onClick={startWeighing}
                  disabled={isWeighing}
                  className="flex-1 bg-primary hover:bg-primary/90"
                >
                  {isWeighing ? (
                    <>
                      <Activity className="h-4 w-4 mr-2 animate-pulse" />
                      Aguardando...
                    </>
                  ) : (
                    <>
                      <Scale className="h-4 w-4 mr-2" />
                      Iniciar Pesagem
                    </>
                  )}
                </Button>
                
                <Button variant="outline" size="icon">
                  <Info className="h-4 w-4" />
                </Button>
              </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                  Suba na balança descalço e mantenha-se imóvel. O peso será registrado automaticamente 
                  após 10 segundos ou quando o peso estabilizar (mínimo 10kg).
                  </AlertDescription>
                </Alert>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {weighingData && (
        <Card className="health-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              Resultados da Pesagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Weight Display */}
            <div className="text-center p-6 bg-gradient-primary rounded-xl text-white">
              <div className="flex items-center justify-center gap-2 mb-2">
                <h3 className="text-3xl font-bold">{weighingData.weight.toFixed(1)} kg</h3>
                {getTrendIcon()}
              </div>
              {userPhysicalData?.altura_cm && (
                <p className="text-lg opacity-90">
                  IMC: {calculateBMI(weighingData.weight)?.toFixed(1)}
                  {calculateBMI(weighingData.weight) && (
                    <span className="ml-2 text-sm">
                      ({getBMIClassification(calculateBMI(weighingData.weight)!).text})
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Gordura Corporal</p>
                <p className="text-xl font-bold">{weighingData.bodyFat?.toFixed(1)}%</p>
          </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Massa Muscular</p>
                <p className="text-xl font-bold">{weighingData.muscleMass?.toFixed(1)}kg</p>
            </div>

              <div className="text-center p-4 bg-muted rounded-lg">
                <Wifi className="h-8 w-8 text-cyan-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Água Corporal</p>
                <p className="text-xl font-bold">{weighingData.bodyWater?.toFixed(1)}%</p>
              </div>
              
              <div className="text-center p-4 bg-muted rounded-lg">
                <Scale className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Massa Óssea</p>
                <p className="text-xl font-bold">{weighingData.boneMass?.toFixed(1)}kg</p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Metabolismo</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Metabolismo Basal:</span>
                    <span className="font-medium">{weighingData.basalMetabolism} kcal</span>
            </div>
                  <div className="flex justify-between">
                    <span>Idade Metabólica:</span>
                    <span className="font-medium">{weighingData.metabolicAge} anos</span>
                  </div>
          </div>
            </div>

              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Comparação</h4>
                <div className="space-y-2">
                  {lastWeighing && (
                    <div className="flex justify-between">
                      <span>Variação:</span>
                      <span className={`font-medium ${getWeightTrend() === 'down' ? 'text-green-500' : 'text-red-500'}`}>
                        {(weighingData.weight - lastWeighing.peso_kg).toFixed(1)} kg
                      </span>
                      </div>
                    )}
                      </div>
                      </div>
                  </div>
                </CardContent>
              </Card>
            )}
    </div>
  );
}; 

export default XiaomiScaleIntegration; 