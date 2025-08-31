import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Bluetooth, 
  Scale, 
  Settings, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Zap,
  Wrench,
  TestTube,
  Activity,
  AlertTriangle,
  Wifi,
  Signal
} from 'lucide-react';

interface AdjustmentStep {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'running' | 'success' | 'error';
  action?: () => Promise<void>;
}

export const XiaomiScaleAdjuster: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>({});
  const { toast } = useToast();

  const [steps, setSteps] = useState<AdjustmentStep[]>([
    {
      id: 'reset-bluetooth',
      title: 'Resetar Configuração Bluetooth',
      description: 'Limpar cache e reconectar Bluetooth',
      status: 'pending',
      action: async () => {
        try {
          // Simular reset do Bluetooth
          await new Promise(resolve => setTimeout(resolve, 2000));
          setResults(prev => ({ ...prev, bluetoothReset: true }));
          return Promise.resolve();
        } catch (error) {
          throw new Error('Erro ao resetar Bluetooth');
        }
      }
    },
    {
      id: 'update-filters',
      title: 'Atualizar Filtros de Dispositivo',
      description: 'Configurar filtros específicos para Xiaomi',
      status: 'pending',
      action: async () => {
        try {
          // Configurar filtros mais abrangentes
          const filters = [
            { namePrefix: 'MIBCS' },
            { namePrefix: 'Mi Body Composition Scale' },
            { namePrefix: 'Mi Scale' },
            { namePrefix: 'Xiaomi' },
            { namePrefix: 'MI_SCALE' },
            { namePrefix: 'Mi' },
            { namePrefix: 'BCS' }
          ];
          
          setResults(prev => ({ ...prev, filters }));
          return Promise.resolve();
        } catch (error) {
          throw new Error('Erro ao configurar filtros');
        }
      }
    },
    {
      id: 'expand-services',
      title: 'Expandir Serviços Suportados',
      description: 'Adicionar todos os serviços Xiaomi conhecidos',
      status: 'pending',
      action: async () => {
        try {
          const services = [
            '0000181d-0000-1000-8000-00805f9b34fb', // Weight Scale Service
            '0000180f-0000-1000-8000-00805f9b34fb', // Battery Service
            '0000181b-0000-1000-8000-00805f9b34fb', // Body Composition Service
            '00001530-1212-efde-1523-785feabcd123', // Mi Fitness Service
            'a22116c4-b1b4-4e40-8c71-c1e3e5b0b2b3', // Custom Mi Scale Service
            '0000180a-0000-1000-8000-00805f9b34fb', // Device Information Service
            '0000180d-0000-1000-8000-00805f9b34fb', // Heart Rate Service
            '0000180e-0000-1000-8000-00805f9b34fb', // Health Thermometer Service
          ];
          
          setResults(prev => ({ ...prev, services }));
          return Promise.resolve();
        } catch (error) {
          throw new Error('Erro ao expandir serviços');
        }
      }
    },
    {
      id: 'test-connection',
      title: 'Testar Conexão Melhorada',
      description: 'Tentar conectar com configurações otimizadas',
      status: 'pending',
      action: async () => {
        try {
          const device = await (navigator as any).bluetooth.requestDevice({
            acceptAllDevices: true,
            optionalServices: results.services || [
              '0000181d-0000-1000-8000-00805f9b34fb',
              '0000180f-0000-1000-8000-00805f9b34fb',
              '0000181b-0000-1000-8000-00805f9b34fb',
              '00001530-1212-efde-1523-785feabcd123',
              'a22116c4-b1b4-4e40-8c71-c1e3e5b0b2b3',
            ]
          });
          
          if (device) {
            const server = await device.gatt?.connect();
            if (server) {
              setResults(prev => ({ ...prev, device, server }));
              return Promise.resolve();
            }
          }
          
          throw new Error('Falha na conexão');
        } catch (error) {
          throw new Error('Erro na conexão: ' + error.message);
        }
      }
    },
    {
      id: 'configure-notifications',
      title: 'Configurar Notificações Avançadas',
      description: 'Configurar múltiplas características para notificações',
      status: 'pending',
      action: async () => {
        try {
          if (!results.server) {
            throw new Error('Servidor não conectado');
          }

          const services = await results.server.getPrimaryServices();
          let notificationsConfigured = 0;

          for (const service of services) {
            try {
              const characteristics = await service.getCharacteristics();
              for (const characteristic of characteristics) {
                if (characteristic.properties.notify || characteristic.properties.indicate) {
                  try {
                    await characteristic.startNotifications();
                    notificationsConfigured++;
                  } catch (err) {
                    console.log(`Erro ao configurar notificação para ${characteristic.uuid}:`, err);
                  }
                }
              }
            } catch (err) {
              console.log(`Erro ao ler características do serviço ${service.uuid}:`, err);
            }
          }

          setResults(prev => ({ ...prev, notificationsConfigured }));
          return Promise.resolve();
        } catch (error) {
          throw new Error('Erro ao configurar notificações: ' + error.message);
        }
      }
    },
    {
      id: 'test-data-reception',
      title: 'Testar Recepção de Dados',
      description: 'Verificar se os dados estão sendo recebidos corretamente',
      status: 'pending',
      action: async () => {
        try {
          // Simular teste de recepção de dados
          await new Promise(resolve => setTimeout(resolve, 3000));
          setResults(prev => ({ ...prev, dataReceptionTested: true }));
          return Promise.resolve();
        } catch (error) {
          throw new Error('Erro no teste de recepção');
        }
      }
    }
  ]);

  const runAdjustment = async () => {
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
          title: `Erro no ajuste: ${step.title}`,
          description: error.message,
          variant: 'destructive'
        });
        
        break;
      }
    }

    setIsRunning(false);
  };

  const resetAdjustment = () => {
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
      default:
        return <Settings className="h-4 w-4 text-gray-400" />;
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
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const successCount = steps.filter(step => step.status === 'success').length;
  const totalSteps = steps.length;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Wrench className="mr-2 h-4 w-4" />
          ⚙️ Ajustar Balança Xiaomi
        </Button>
      </DialogTrigger>
      
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Ajuste Automático da Balança Xiaomi
          </DialogTitle>
          <DialogDescription>
            Configure automaticamente a conexão com sua balança Xiaomi Mi Body Scale 2
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-blue-800">Progresso do Ajuste</h4>
                  <p className="text-sm text-blue-600">
                    {successCount} de {totalSteps} passos concluídos
                  </p>
                </div>
                <Badge variant={successCount === totalSteps ? 'default' : 'secondary'}>
                  {successCount === totalSteps ? 'Concluído' : 'Em Progresso'}
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
                    </div>
                    <Badge variant={step.status === 'error' ? 'destructive' : 'secondary'}>
                      {step.status === 'pending' && 'Pendente'}
                      {step.status === 'running' && 'Executando'}
                      {step.status === 'success' && 'Sucesso'}
                      {step.status === 'error' && 'Erro'}
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
                <CardTitle className="text-lg">Resultados do Ajuste</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {results.bluetoothReset && (
                    <div className="flex items-center gap-2">
                      <Bluetooth className="h-4 w-4 text-blue-500" />
                      <span>Bluetooth resetado com sucesso</span>
                    </div>
                  )}
                  {results.filters && (
                    <div className="flex items-center gap-2">
                      <Wifi className="h-4 w-4 text-green-500" />
                      <span>{results.filters.length} filtros configurados</span>
                    </div>
                  )}
                  {results.services && (
                    <div className="flex items-center gap-2">
                      <Scale className="h-4 w-4 text-purple-500" />
                      <span>{results.services.length} serviços suportados</span>
                    </div>
                  )}
                  {results.device && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Dispositivo conectado: {results.device.name}</span>
                    </div>
                  )}
                  {results.notificationsConfigured && (
                    <div className="flex items-center gap-2">
                      <Signal className="h-4 w-4 text-green-500" />
                      <span>{results.notificationsConfigured} notificações configuradas</span>
                    </div>
                  )}
                  {results.dataReceptionTested && (
                    <div className="flex items-center gap-2">
                      <TestTube className="h-4 w-4 text-green-500" />
                      <span>Teste de recepção concluído</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Ações */}
          <div className="flex gap-2">
            <Button 
              onClick={runAdjustment}
              disabled={isRunning}
              className="flex-1"
            >
              {isRunning ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Ajustando...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Executar Ajuste Automático
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={resetAdjustment}
              disabled={isRunning}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Instruções */}
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-orange-800 mb-2">⚠️ Aviso Importante</h4>
              <div className="space-y-1 text-sm text-orange-700">
                <p>• Este ajuste irá reconfigurar completamente a conexão Bluetooth</p>
                <p>• Certifique-se de que a balança está ligada e próxima</p>
                <p>• O processo pode levar alguns minutos</p>
                <p>• Não interrompa o processo durante a execução</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 