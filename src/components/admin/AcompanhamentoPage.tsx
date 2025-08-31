import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Activity, 
  Users, 
  TrendingUp, 
  Heart,
  Droplets,
  Zap,
  Target,
  Scale,
  AlertTriangle,
  BarChart3,
  Plus,
  Bluetooth,
  Settings
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CircularGaugeProps {
  value: number;
  max: number;
  size: number;
  strokeWidth: number;
  label: string;
  unit: string;
  change?: number;
  targetValue?: number;
  showTarget?: boolean;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({
  value,
  max,
  size,
  strokeWidth,
  label,
  unit,
  change,
  targetValue,
  showTarget = false
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / max) * circumference;
  
  // Determinar cor baseada no valor e tipo de métrica
  const getSegmentColor = (percentage: number) => {
    if (label.includes('Gordura') || label.includes('IMC')) {
      // Para gordura e IMC, valores menores são melhores
      if (percentage > 0.7) return '#ef4444'; // vermelho
      if (percentage > 0.4) return '#f59e0b'; // amarelo
      return '#10b981'; // verde
    } else {
      // Para outras métricas, valores maiores são melhores
      if (percentage < 0.3) return '#ef4444'; // vermelho
      if (percentage < 0.7) return '#f59e0b'; // amarelo
      return '#10b981'; // verde
    }
  };

  const percentage = value / max;
  const color = getSegmentColor(percentage);

  return (
    <div className="relative flex flex-col items-center">
      <div className="relative">
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="opacity-20"
          />
          
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Target marker if enabled */}
          {showTarget && targetValue && (
            <circle
              cx={size / 2 + radius * Math.cos((targetValue / max) * 2 * Math.PI - Math.PI / 2)}
              cy={size / 2 + radius * Math.sin((targetValue / max) * 2 * Math.PI - Math.PI / 2)}
              r={4}
              fill="#3b82f6"
              className="transform rotate-90"
            />
          )}
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color }}>
              {value.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {unit}
            </div>
            {change !== undefined && (
              <div className={`text-xs mt-1 ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(1)}
              </div>
            )}
          </div>
        </div>
        
        {/* Target badge */}
        {showTarget && (
          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
            <Badge variant="secondary" className="text-xs px-2 py-1">
              Target
            </Badge>
          </div>
        )}
      </div>
      
      {/* Label */}
      <div className="text-center mt-3">
        <div className="text-sm font-medium text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  );
};

interface User {
  id: string;
  full_name: string;
  email: string;
  height_cm?: number;
}

const AcompanhamentoPage: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pesagemMode, setPesagemMode] = useState<'manual' | 'automatica'>('manual');
  const [manualData, setManualData] = useState({
    peso: '',
    perimetroAbdominal: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Dados zerados iniciais
  const [bodyData, setBodyData] = useState({
    massaGorda: 0,
    percentualGordura: 0,
    aguaCorporal: 0,
    hidratacao: 0,
    aguaMassaMagra: 0,
    intracelular: 0,
    extracelular: 0,
    massaMagra: 0,
    razaoMusculoGordura: 0,
    massaMuscular: 0,
    peso: 0,
    altura: 0,
    imc: 0,
    taxaMetabolica: 0,
    anguloFase: 0,
    idadeCelular: 0,
    aguaIntraExtra: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .not('full_name', 'is', null);
      
      if (profiles) {
        const userList = profiles.map(p => ({
          id: p.user_id,
          full_name: p.full_name,
          email: p.email
        })).filter(u => u.full_name);
        setUsers(userList);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const calcularDadosAutomaticos = (peso: number, perimetroAbdominal: number, altura: number, idade?: number) => {
    // Cálculos baseados em fórmulas padrão de bioimpedância
    const imc = peso / ((altura / 100) * (altura / 100));
    
    // Estimativa de gordura corporal baseada em IMC e perímetro abdominal
    const percentualGordura = Math.max(0, Math.min(50, 
      (1.20 * imc) + (0.23 * (idade || 30)) - (10.8 * 1) - 5.4 + (perimetroAbdominal * 0.1)
    ));
    
    // Estimativas baseadas no peso e percentual de gordura
    const massaGorda = (percentualGordura / 100) * peso;
    const massaMagra = peso - massaGorda;
    const massaMuscular = massaMagra * 0.75; // aproximadamente 75% da massa magra
    
    // Estimativas de água corporal (55-60% do peso corporal)
    const aguaCorporal = peso * 0.58;
    const intracelular = aguaCorporal * 0.6;
    const extracelular = aguaCorporal * 0.4;
    const aguaMassaMagra = (aguaCorporal / massaMagra) * 100;
    
    // Taxa metabólica basal (Harris-Benedict) com idade real
    const taxaMetabolica = 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * (idade || 30));
    
    // Outros valores calculados/estimados
    const hidratacao = aguaCorporal > (peso * 0.55) ? 8 : 5;
    const razaoMusculoGordura = massaMuscular / (massaGorda || 1);
    const anguloFase = 6.5 - (percentualGordura * 0.05); // estimativa
    const idadeCelular = Math.round(imc * 0.8 + (idade || 30) * 0.2); // Usar idade real do usuário
    const aguaIntraExtra = (aguaCorporal / peso) * 100;

    return {
      massaGorda,
      percentualGordura,
      aguaCorporal,
      hidratacao,
      aguaMassaMagra,
      intracelular,
      extracelular,
      massaMagra,
      razaoMusculoGordura,
      massaMuscular,
      peso,
      altura,
      imc,
      taxaMetabolica,
      anguloFase,
      idadeCelular,
      aguaIntraExtra
    };
  };

  const handleManualWeighing = async () => {
    if (!selectedUser) {
      toast({
        title: "Erro",
        description: "Selecione um usuário primeiro",
        variant: "destructive"
      });
      return;
    }

    if (!manualData.peso || !manualData.perimetroAbdominal) {
      toast({
        title: "Erro", 
        description: "Peso e perímetro abdominal são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Buscar dados físicos do usuário (altura e idade)
      let altura = 170; // valor padrão em cm
      let physicalData = null;
      
      // Tentar buscar dados físicos completos
      try {
        const { data: userData } = await supabase
          .from('user_physical_data')
          .select('altura_cm, idade')
          .eq('user_id', selectedUser.id)
          .single();
        
        if (userData) {
          physicalData = userData;
          altura = userData.altura_cm || 170;
        }
      } catch (error) {
        // Se não tiver dados físicos, tentar buscar altura do perfil
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', selectedUser.id)
            .single();
          
          // Se tiver altura no perfil, usar ela
          if (profile && (profile as any).altura_cm) {
            altura = (profile as any).altura_cm;
          }
        } catch (error) {
          console.log('Altura não encontrada, usando valor padrão');
        }
      }

      const peso = parseFloat(manualData.peso);
      const perimetroAbdominal = parseFloat(manualData.perimetroAbdominal);

      // Calcular todos os dados automaticamente com idade real
      const dadosCalculados = calcularDadosAutomaticos(
        peso, 
        perimetroAbdominal, 
        altura,
        physicalData?.idade
      );

      // Salvar na base de dados
      const { error } = await supabase
        .from('weight_measurements')
        .insert({
          user_id: selectedUser.id,
          peso_kg: peso,
          altura_cm: altura,
          gordura_corporal_percent: dadosCalculados.percentualGordura,
          massa_muscular_kg: dadosCalculados.massaMuscular,
          agua_corporal_percent: (dadosCalculados.aguaCorporal / peso) * 100,
           osso_kg: 3.2, // valor padrão
           imc: dadosCalculados.imc,
           circunferencia_abdominal_cm: perimetroAbdominal,
          measurement_date: new Date().toISOString(),
          measurement_type: 'manual'
        });

      if (error) throw error;

      // Atualizar dados na tela
      setBodyData(dadosCalculados);

      toast({
        title: "Sucesso!",
        description: "Dados calculados e salvos automaticamente",
      });

      // Limpar formulário
      setManualData({
        peso: '',
        perimetroAbdominal: ''
      });

    } catch (error) {
      console.error('Error saving measurement:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar dados de pesagem",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const metrics = [
    {
      title: 'Massa Gorda',
      value: bodyData.massaGorda,
      max: 50,
      unit: 'kg',
      change: -1.5,
      showTarget: true,
      targetValue: 15
    },
    {
      title: '% Gordura',
      value: bodyData.percentualGordura,
      max: 50,
      unit: '%',
      change: -1.0,
      showTarget: true,
      targetValue: 20
    },
    {
      title: 'Água Corporal Total',
      value: bodyData.aguaCorporal,
      max: 50,
      unit: 'L',
      change: 0.2
    },
    {
      title: 'Hidratação',
      value: bodyData.hidratacao,
      max: 10,
      unit: 'pontos',
      change: 0.2
    },
    {
      title: 'Água na Massa Magra',
      value: bodyData.aguaMassaMagra,
      max: 100,
      unit: '%',
      change: 0.3
    },
    {
      title: 'Intracelular',
      value: bodyData.intracelular,
      max: 30,
      unit: 'L',
      change: 0.1
    },
    {
      title: 'Água Intra e Extra Celular',
      value: bodyData.aguaIntraExtra,
      max: 100,
      unit: '%',
      change: -0.5
    },
    {
      title: 'Extracelular',
      value: bodyData.extracelular,
      max: 20,
      unit: 'L',
      change: 0.2
    },
    {
      title: 'Massa Magra e Muscular',
      value: bodyData.massaMagra,
      max: 100,
      unit: 'kg',
      change: 0.1
    },
    {
      title: 'Razão Músculo Gordura',
      value: bodyData.razaoMusculoGordura,
      max: 5,
      unit: 'ratio',
      change: 0.1
    },
    {
      title: 'Massa Muscular',
      value: bodyData.massaMuscular,
      max: 50,
      unit: 'kg',
      change: 0.2
    },
    {
      title: 'IMC',
      value: bodyData.imc,
      max: 40,
      unit: 'kg/m²',
      change: -0.3,
      showTarget: true,
      targetValue: 25
    },
    {
      title: 'Taxa Metabólica Basal',
      value: bodyData.taxaMetabolica,
      max: 2500,
      unit: 'kcal',
      change: 12
    },
    {
      title: 'Ângulo de Fase',
      value: bodyData.anguloFase,
      max: 10,
      unit: '°',
      change: -0.3
    },
    {
      title: 'Análise Celular',
      value: bodyData.idadeCelular,
      max: 80,
      unit: 'anos',
      change: -1
    }
  ];

  return (
    <div className="space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-card border-b">
        <div>
          <h1 className="text-3xl font-bold">Acompanhamento</h1>
          <p className="text-muted-foreground">
            Análise completa de composição corporal - {selectedUser?.full_name || 'Nenhum usuário selecionado'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            {bodyData.peso > 0 ? 'Dados Atualizados' : 'Aguardando Pesagem'}
          </Badge>
        </div>
      </div>

      {/* Controles de Pesagem */}
      <Card className="mx-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Controle de Pesagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de usuário */}
          <div className="space-y-2">
            <Label>Usuário para Pesagem</Label>
            <select 
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const user = users.find(u => u.id === e.target.value);
                setSelectedUser(user || null);
              }}
              className="w-full px-3 py-2 border rounded-md bg-background"
            >
              <option value="">Selecione um usuário...</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name} ({user.email})
                </option>
              ))}
            </select>
          </div>

          {/* Modo de pesagem */}
          <div className="space-y-2">
            <Label>Modo de Pesagem</Label>
            <div className="flex gap-4">
              <Button
                variant={pesagemMode === 'manual' ? 'default' : 'outline'}
                onClick={() => setPesagemMode('manual')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Manual
              </Button>
              <Button
                variant={pesagemMode === 'automatica' ? 'default' : 'outline'}
                onClick={() => setPesagemMode('automatica')}
                className="flex items-center gap-2"
              >
                <Bluetooth className="h-4 w-4" />
                Automática (Bluetooth)
              </Button>
            </div>
          </div>

          {/* Formulário manual */}
          {pesagemMode === 'manual' && (
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="peso">Peso (kg) *</Label>
                <Input
                  id="peso"
                  type="number"
                  placeholder="70.5"
                  value={manualData.peso}
                  onChange={(e) => setManualData(prev => ({ ...prev, peso: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="perimetroAbdominal">Perímetro Abdominal (cm) *</Label>
                <Input
                  id="perimetroAbdominal"
                  type="number"
                  placeholder="85.0"
                  value={manualData.perimetroAbdominal}
                  onChange={(e) => setManualData(prev => ({ ...prev, perimetroAbdominal: e.target.value }))}
                />
              </div>
              <div className="col-span-full">
                <p className="text-xs text-muted-foreground mb-2">
                  * A altura será obtida do cadastro do usuário. Todos os demais dados serão calculados automaticamente.
                </p>
                <Button 
                  onClick={handleManualWeighing}
                  disabled={isLoading || !selectedUser}
                  className="w-full"
                >
                  {isLoading ? 'Calculando e Salvando...' : 'Calcular e Salvar Dados'}
                </Button>
              </div>
            </div>
          )}

          {/* Status automático */}
          {pesagemMode === 'automatica' && (
            <div className="p-4 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">Balança Bluetooth</h4>
                  <p className="text-sm text-muted-foreground">Status da conexão</p>
                </div>
                <Badge variant="destructive">Desconectada</Badge>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Bluetooth className="h-4 w-4 mr-2" />
                  Procurar Dispositivos
                </Button>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid de Métricas */}
      <div className="px-6">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="flex justify-center">
              <CircularGauge
                value={metric.value}
                max={metric.max}
                size={140}
                strokeWidth={8}
                label={metric.title}
                unit={metric.unit}
                change={metric.change}
                targetValue={metric.targetValue}
                showTarget={metric.showTarget}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Silhueta Central */}
      <div className="flex justify-center py-8">
        <Card className="p-8">
          <div className="text-center">
            <div className="text-6xl mb-4">
              🚶‍♂️
            </div>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{bodyData.peso || 0} kg</div>
              <div className="text-lg text-muted-foreground">{bodyData.altura || 0} cm</div>
              <div className="text-sm">IMC: {bodyData.imc.toFixed(1)}</div>
              <div className="text-xs text-muted-foreground">
                Idade: {bodyData.idadeCelular} anos
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 pb-8">
        <Button size="lg" disabled={bodyData.peso === 0}>
          <BarChart3 className="h-5 w-5 mr-2" />
          Gerar Relatório
        </Button>
        <Button variant="outline" size="lg" disabled={bodyData.peso === 0}>
          <TrendingUp className="h-5 w-5 mr-2" />
          Ver Evolução
        </Button>
        <Button variant="outline" size="lg" disabled={bodyData.peso === 0}>
          <Target className="h-5 w-5 mr-2" />
          Definir Metas
        </Button>
      </div>
    </div>
  );
};

export default AcompanhamentoPage;