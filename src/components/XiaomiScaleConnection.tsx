import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { 
  Bluetooth, 
  Scale, 
  CheckCircle, 
  XCircle,
  Activity,
  Zap,
  Battery,
  Wifi,
  Signal,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';

interface XiaomiScaleData {
  weight?: number;
  bodyFat?: number;
  muscleMass?: number;
  waterPercentage?: number;
  boneMass?: number;
  bmi?: number;
  timestamp?: Date;
}

interface XiaomiScaleConnectionProps {
  trigger?: React.ReactNode;
  onDataReceived?: (data: XiaomiScaleData) => void;
}

export const XiaomiScaleConnection: React.FC<XiaomiScaleConnectionProps> = ({ 
  trigger,
  onDataReceived 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [device, setDevice] = useState<any>(null);
  const [server, setServer] = useState<any>(null);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [lastWeight, setLastWeight] = useState<XiaomiScaleData | null>(null);
  const [isWeighing, setIsWeighing] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  const connectToScale = async () => {
    try {
      setIsConnecting(true);
      
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          '0000181d-0000-1000-8000-00805f9b34fb', // Weight Scale Service
          '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
          '0000181b-0000-1000-8000-00805f9b34fb', // Body Composition Service
        ]
      });

      if (device) {
        const server = await device.gatt?.connect();
        if (server) {
          setDevice(device);
          setServer(server);
          setIsConnected(true);
          
          // Configurar notificações para receber dados
          await setupNotifications(server);
          
          // Verificar bateria
          await checkBatteryLevel(server);
          
          toast({
            title: "Balança conectada!",
            description: `Conectado com ${device.name}`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      toast({
        title: "Erro de conexão",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const setupNotifications = async (server: any) => {
    try {
      const weightService = await server.getPrimaryService('0000181d-0000-1000-8000-00805f9b34fb');
      const weightCharacteristic = await weightService.getCharacteristic('00002a98-0000-1000-8000-00805f9b34fb');
      
      await weightCharacteristic.startNotifications();
      weightCharacteristic.addEventListener('characteristicvaluechanged', handleWeightData);
      
    } catch (error) {
      console.log('Erro ao configurar notificações:', error);
    }
  };

  const handleWeightData = (event: any) => {
    const value = event.target.value;
    const data = decodeWeightData(value);
    
    if (data.weight) {
      setLastWeight(data);
      onDataReceived?.(data);
      
      toast({
        title: "Peso registrado!",
        description: `${data.weight}kg - IMC: ${data.bmi?.toFixed(1)}`,
      });
    }
  };

  const decodeWeightData = (value: DataView): XiaomiScaleData => {
    const data = new Uint8Array(value.buffer);
    
    // Decodificação simplificada - ajuste conforme o protocolo específico da sua balança
    const weight = data[1] + (data[2] << 8) / 100; // Peso em kg
    const bodyFat = data[3]; // Gordura corporal em %
    const muscleMass = data[4] + (data[5] << 8) / 100; // Massa muscular em kg
    const waterPercentage = data[6]; // Água em %
    const boneMass = data[7] / 100; // Massa óssea em kg
    
    const height = 170; // Altura em cm - ajuste conforme necessário
    const bmi = weight / Math.pow(height / 100, 2);
    
    return {
      weight,
      bodyFat,
      muscleMass,
      waterPercentage,
      boneMass,
      bmi,
      timestamp: new Date()
    };
  };

  const checkBatteryLevel = async (server: any) => {
    try {
      const batteryService = await server.getPrimaryService('0000180f-0000-1000-8000-00805f9b34fb');
      const batteryCharacteristic = await batteryService.getCharacteristic('00002a19-0000-1000-8000-00805f9b34fb');
      const value = await batteryCharacteristic.readValue();
      const level = value.getUint8(0);
      setBatteryLevel(level);
    } catch (error) {
      console.log('Erro ao verificar bateria:', error);
    }
  };

  const startWeighing = async () => {
    if (!isConnected) {
      toast({
        title: "Balança não conectada",
        description: "Conecte a balança primeiro",
        variant: "destructive"
      });
      return;
    }

    setIsWeighing(true);
    toast({
      title: "Iniciando pesagem...",
      description: "Suba na balança para medir",
    });

    // Simular tempo de pesagem
    setTimeout(() => {
      setIsWeighing(false);
    }, 10000); // 10 segundos
  };

  const disconnect = async () => {
    if (device && device.gatt?.connected) {
      await device.gatt.disconnect();
    }
    setIsConnected(false);
    setDevice(null);
    setServer(null);
    setBatteryLevel(null);
    setLastWeight(null);
    
    toast({
      title: "Balança desconectada",
      description: "Conexão encerrada",
    });
  };

  const getConnectionStatus = () => {
    if (isConnecting) return { text: 'Conectando...', color: 'text-blue-500', icon: Activity };
    if (isConnected) return { text: 'Conectado', color: 'text-green-500', icon: CheckCircle };
    return { text: 'Desconectado', color: 'text-red-500', icon: XCircle };
  };

  const status = getConnectionStatus();
  const StatusIcon = status.icon;

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="w-full">
            <Bluetooth className="mr-2 h-4 w-4" />
            {isConnected ? 'Balança Conectada' : 'Conectar Balança'}
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Balança Xiaomi
          </DialogTitle>
          <DialogDescription>
            Conecte e use sua balança Xiaomi Mi Body Scale 2
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status da Conexão */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <StatusIcon className={`h-4 w-4 ${status.color}`} />
                  <span className="font-medium">{status.text}</span>
                </div>
                {isConnected && (
                  <Badge variant="secondary">
                    {device?.name || 'Balança'}
                  </Badge>
                )}
              </div>
              
              {batteryLevel !== null && (
                <div className="mt-2 flex items-center gap-2">
                  <Battery className="h-4 w-4 text-green-500" />
                  <span className="text-sm">Bateria: {batteryLevel}%</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Última Pesagem */}
          {lastWeight && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Última Pesagem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Peso:</span>
                    <span className="font-medium">{lastWeight.weight}kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>IMC:</span>
                    <span className="font-medium">{lastWeight.bmi?.toFixed(1)}</span>
                  </div>
                  {lastWeight.bodyFat && (
                    <div className="flex justify-between">
                      <span>Gordura:</span>
                      <span className="font-medium">{lastWeight.bodyFat}%</span>
                    </div>
                  )}
                  {lastWeight.muscleMass && (
                    <div className="flex justify-between">
                      <span>Músculo:</span>
                      <span className="font-medium">{lastWeight.muscleMass}kg</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="space-y-2">
            {!isConnected ? (
              <Button 
                onClick={connectToScale}
                disabled={isConnecting}
                className="w-full"
              >
                {isConnecting ? (
                  <>
                    <Activity className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Bluetooth className="mr-2 h-4 w-4" />
                    Conectar Balança
                  </>
                )}
              </Button>
            ) : (
              <>
                <Button 
                  onClick={startWeighing}
                  disabled={isWeighing}
                  className="w-full"
                >
                  {isWeighing ? (
                    <>
                      <Activity className="mr-2 h-4 w-4 animate-spin" />
                      Pesando...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Iniciar Pesagem
                    </>
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={disconnect}
                  className="w-full"
                >
                  <Pause className="mr-2 h-4 w-4" />
                  Desconectar
                </Button>
              </>
            )}
          </div>

          {/* Instruções */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-800 mb-2">📋 Instruções</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• Certifique-se de que a balança está ligada</p>
                <p>• Fique próximo à balança durante a conexão</p>
                <p>• Suba na balança quando iniciar a pesagem</p>
                <p>• Aguarde a medição completa</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 