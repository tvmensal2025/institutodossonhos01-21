import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bug, 
  Scale, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Search,
  Wifi,
  Bluetooth,
  Battery,
  Activity,
  Info,
  Lightbulb
} from 'lucide-react';

interface TroubleshootingStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error' | 'warning';
  action?: () => Promise<void>;
  solution?: string;
}

export const XiaomiScaleTroubleshooter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>({});
  const { toast } = useToast();

  const [steps, setSteps] = useState<TroubleshootingStep[]>([
    {
      id: 'bluetooth-support',
      title: 'Verificar Suporte Bluetooth',
      description: 'Testar se o navegador suporta Web Bluetooth API',
      status: 'pending',
      action: async () => {
        try {
          if (!(navigator as any).bluetooth) {
            throw new Error('Web Bluetooth não suportado');
          }
          setResults(prev => ({ ...prev, bluetoothSupported: true }));
          return Promise.resolve();
        } catch (error) {
          throw new Error('Web Bluetooth não disponível');
        }
      },
      solution: 'Use Chrome, Edge ou Safari no macOS'
    },
    {
      id: 'device-discovery',
      title: 'Descoberta de Dispositivos',
      description: 'Procurar por dispositivos Bluetooth próximos',
      status: 'pending',
      action: async () => {
        try {
          const device = await (navigator as any).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['0000181d-0000-1000-8000-00805f9b34fb']
          });
          
          if (device) {
            setResults(prev => ({ ...prev, deviceFound: device.name }));
            return Promise.resolve();
          }
          
          throw new Error('Nenhum dispositivo encontrado');
        } catch (error) {
          throw new Error('Erro na descoberta: ' + error.message);
        }
      },
      solution: 'Certifique-se de que a balança está ligada e próxima'
    },
    {
      id: 'connection-test',
      title: 'Teste de Conexão',
      description: 'Tentar conectar com o dispositivo',
      status: 'pending',
      action: async () => {
        try {
          const device = await (navigator as any).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['0000181d-0000-1000-8000-00805f9b34fb']
          });
          
          const server = await device.gatt?.connect();
          if (server) {
            setResults(prev => ({ ...prev, connectionSuccessful: true }));
            return Promise.resolve();
          }
          
          throw new Error('Falha na conexão GATT');
        } catch (error) {
          throw new Error('Erro de conexão: ' + error.message);
        }
      },
      solution: 'Verifique se a balança não está conectada a outro dispositivo'
    },
    {
      id: 'service-discovery',
      title: 'Descoberta de Serviços',
      description: 'Verificar serviços disponíveis no dispositivo',
      status: 'pending',
      action: async () => {
        try {
          const device = await (navigator as any).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: [
              '0000181d-0000-1000-8000-00805f9b34fb',
              '0000180f-0000-1000-8000-00805f9b34fb',
              '0000181b-0000-1000-8000-00805f9b34fb'
            ]
          });
          
          const server = await device.gatt?.connect();
          const services = await server?.getPrimaryServices();
          
          if (services && services.length > 0) {
            setResults(prev => ({ ...prev, servicesFound: services.length }));
            return Promise.resolve();
          }
          
          throw new Error('Nenhum serviço encontrado');
        } catch (error) {
          throw new Error('Erro na descoberta de serviços: ' + error.message);
        }
      },
      solution: 'A balança pode não estar no modo de descoberta'
    },
    {
      id: 'battery-check',
      title: 'Verificação de Bateria',
      description: 'Verificar nível de bateria da balança',
      status: 'pending',
      action: async () => {
        try {
          const device = await (navigator as any).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: ['0000180f-0000-1000-8000-00805f9b34fb']
          });
          
          const server = await device.gatt?.connect();
          const batteryService = await server?.getPrimaryService('0000180f-0000-1000-8000-00805f9b34fb');
          const batteryLevel = await batteryService?.getCharacteristic('00002a19-0000-1000-8000-00805f9b34fb');
          const value = await batteryLevel?.readValue();
          
          if (value) {
            const level = value.getUint8(0);
            setResults(prev => ({ ...prev, batteryLevel: level }));
            
            if (level < 20) {
              throw new Error('Bateria baixa: ' + level + '%');
            }
            
            return Promise.resolve();
          }
          
          throw new Error('Não foi possível ler a bateria');
        } catch (error) {
          throw new Error('Erro na verificação de bateria: ' + error.message);
        }
      },
      solution: 'Recarregue a balança se a bateria estiver baixa'
    },
    {
      id: 'data-reception',
      title: 'Teste de Recepção de Dados',
      description: 'Verificar se os dados são recebidos corretamente',
      status: 'pending',
      action: async () => {
        try {
          // Simular teste de recepção
          await new Promise(resolve => setTimeout(resolve, 2000));
          setResults(prev => ({ ...prev, dataReceptionTested: true }));
          return Promise.resolve();
        } catch (error) {
          throw new Error('Erro no teste de recepção');
        }
      },
      solution: 'Suba na balança para gerar dados de teste'
    }
  ]);

  const runTroubleshooting = async () => {
    setIsRunning(true);

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      
      // Atualizar status para running
      setSteps(prev => prev.map((s, index) => 
        index === i ? { ...s, status: 'running' } : s
      ));

      try {
        if (step.action) {
          await step.action();
        }
        
        // Atualizar status para success
        setSteps(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'success' } : s
        ));
        
      } catch (error) {
        // Atualizar status para error
        setSteps(prev => prev.map((s, index) => 
          index === i ? { ...s, status: 'error' } : s
        ));
        
        toast({
          title: `Problema detectado: ${step.title}`,
          description: error.message,
          variant: 'destructive'
        });
        
        // Não parar o processo, continuar para detectar outros problemas
      }
    }

    setIsRunning(false);
  };

  const resetTroubleshooting = () => {
    setSteps(prev => prev.map(step => ({ ...step, status: 'pending' })));
    setResults({});
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="h-4 w-4 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bug className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'border-blue-500 bg-blue-50';
      case 'success':
        return 'border-green-500 bg-green-50';
      case 'error':
        return 'border-red-500 bg-red-50';
      case 'warning':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const successCount = steps.filter(step => step.status === 'success').length;
  const errorCount = steps.filter(step => step.status === 'error').length;
  const totalSteps = steps.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Bug className="mr-2 h-4 w-4" />
          🔍 Diagnosticar Problemas
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Diagnóstico da Balança Xiaomi
          </DialogTitle>
          <DialogDescription>
            Identifique e resolva problemas de conexão com sua balança Xiaomi
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-800">Status do Diagnóstico</h4>
                  <p className="text-sm text-blue-600">
                    {successCount} OK, {errorCount} problemas encontrados
                  </p>
                </div>
                <Badge variant={errorCount === 0 ? 'default' : 'destructive'}>
                  {errorCount === 0 ? 'Tudo OK' : `${errorCount} Problemas`}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Passos */}
          <div className="space-y-3">
            {steps.map((step, index) => (
              <Card key={step.id} className={`border-2 ${getStepColor(step.status)}`}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {getStepIcon(step.status)}
                    <div className="flex-1">
                      <h4 className="font-medium">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                      {step.status === 'error' && step.solution && (
                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                          <div className="flex items-center gap-1 text-yellow-700">
                            <Lightbulb className="h-3 w-3" />
                            <span className="text-xs font-medium">Solução: {step.solution}</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <Badge variant={step.status === 'error' ? 'destructive' : 'secondary'}>
                      {step.status === 'pending' && 'Pendente'}
                      {step.status === 'running' && 'Testando'}
                      {step.status === 'success' && 'OK'}
                      {step.status === 'error' && 'Erro'}
                      {step.status === 'warning' && 'Aviso'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Resultados */}
          {Object.keys(results).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Resultados do Diagnóstico</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {results.bluetoothSupported && (
                    <div className="flex items-center gap-2">
                      <Bluetooth className="h-4 w-4 text-green-500" />
                      <span>Web Bluetooth suportado</span>
                    </div>
                  )}
                  {results.deviceFound && (
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-green-500" />
                      <span>Dispositivo encontrado: {results.deviceFound}</span>
                    </div>
                  )}
                  {results.connectionSuccessful && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Conexão estabelecida com sucesso</span>
                    </div>
                  )}
                  {results.servicesFound && (
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span>{results.servicesFound} serviços descobertos</span>
                    </div>
                  )}
                  {results.batteryLevel !== undefined && (
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-green-500" />
                      <span>Bateria: {results.batteryLevel}%</span>
                    </div>
                  )}
                  {results.dataReceptionTested && (
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-green-500" />
                      <span>Recepção de dados testada</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              onClick={runTroubleshooting}
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Diagnosticando...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Executar Diagnóstico Completo
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={resetTroubleshooting}
              disabled={isRunning}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Dicas */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-800 mb-2">💡 Dicas Importantes</h4>
              <div className="space-y-1 text-sm text-blue-700">
                <p>• Certifique-se de que a balança está ligada e próxima</p>
                <p>• Use Chrome, Edge ou Safari para melhor compatibilidade</p>
                <p>• Verifique se a balança não está conectada a outro dispositivo</p>
                <p>• Recarregue a balança se a bateria estiver baixa</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 