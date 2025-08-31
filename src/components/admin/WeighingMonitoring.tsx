import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Scale, 
  Search, 
  Filter, 
  TrendingUp,
  TrendingDown,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import WeightChartsModal from '../charts/WeightChartsModal';
import { useNavigate } from 'react-router-dom';

interface MeasurementData {
  id: string;
  user_id: string;
  peso_kg: number;
  imc?: number;
  gordura_corporal_percent?: number;
  massa_muscular_kg?: number;
  measurement_date: string;
  device_type: string;
  status: 'normal' | 'warning' | 'critical';
  weightChange?: number;
}

const WeighingMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const [measurements, setMeasurements] = useState<MeasurementData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'normal' | 'warning' | 'critical'>('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const fetchMeasurements = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('weight_measurements')
        .select('*')
        .order('measurement_date', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching measurements:', error);
        return;
      }

      // Processar dados e calcular variações de peso
      const processedData: MeasurementData[] = [];
      const userLastWeights = new Map<string, number>();

      (data || []).forEach((measurement, index) => {
        let status: 'normal' | 'warning' | 'critical' = 'normal';
        let weightChange: number | undefined;
        
        // Determinar status baseado no IMC
        if (measurement.imc) {
          if (measurement.imc >= 30) status = 'critical';
          else if (measurement.imc >= 25) status = 'warning';
        }

        // Calcular variação de peso (comparar com medição anterior do mesmo usuário)
        const previousWeight = userLastWeights.get(measurement.user_id);
        if (previousWeight) {
          weightChange = measurement.peso_kg - previousWeight;
        }
        userLastWeights.set(measurement.user_id, measurement.peso_kg);

        processedData.push({
          ...measurement,
          status,
          weightChange
        });
      });

      setMeasurements(processedData);

    } catch (error) {
      console.error('Error fetching measurements:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeasurements = measurements.filter(measurement => {
    const matchesSearch = measurement.user_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || measurement.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'normal':
        return <Badge variant="default" className="bg-green-100 text-green-800">Normal</Badge>;
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Atenção</Badge>;
      case 'critical':
        return <Badge variant="destructive">Crítico</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBMIClassification = (bmi: number) => {
    if (bmi < 18.5) return { text: 'Abaixo do peso', color: 'text-blue-500' };
    if (bmi < 25) return { text: 'Peso normal', color: 'text-green-500' };
    if (bmi < 30) return { text: 'Sobrepeso', color: 'text-yellow-500' };
    return { text: 'Obesidade', color: 'text-red-500' };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-10 bg-muted rounded w-32"></div>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
          <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-32"></div>
                    <div className="h-3 bg-muted rounded w-24"></div>
              </div>
                  <div className="h-6 bg-muted rounded w-16"></div>
            </div>
          </CardContent>
        </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Monitoramento de Pesagens</h1>
          <p className="text-muted-foreground">
            Acompanhe a evolução do peso e métricas corporais - {measurements.length} medições registradas
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            onClick={() => navigate('/professional-evaluation')}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Avaliação Profissional
          </Button>
          <Button>
            <Scale className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por usuário..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('all')}
              >
                Todos
              </Button>
              <Button
                variant={filterStatus === 'normal' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('normal')}
              >
                Normal
              </Button>
              <Button 
                variant={filterStatus === 'warning' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('warning')}
              >
                Atenção
              </Button>
              <Button 
                variant={filterStatus === 'critical' ? 'default' : 'outline'}
                onClick={() => setFilterStatus('critical')}
              >
                Crítico
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Measurements List */}
      <div className="space-y-4">
        {filteredMeasurements.map((measurement) => (
          <Card key={measurement.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                    <Scale className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      Pesagem #{measurement.id.slice(0, 8)}...
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        {measurement.peso_kg}kg
                      </div>
                      {measurement.imc && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          IMC: {measurement.imc.toFixed(1)}
                          <span className={getBMIClassification(measurement.imc).color}>
                            ({getBMIClassification(measurement.imc).text})
                          </span>
                        </div>
                      )}
                      {measurement.gordura_corporal_percent && (
                        <div className="flex items-center gap-1">
                          <Scale className="h-4 w-4" />
                          {measurement.gordura_corporal_percent.toFixed(1)}% gordura
                        </div>
                      )}
                      {measurement.massa_muscular_kg && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          {measurement.massa_muscular_kg.toFixed(1)}kg músculo
                        </div>
                      )}
                      {measurement.weightChange !== undefined && (
                        <div className="flex items-center gap-1">
                          {measurement.weightChange > 0 ? (
                            <>
                              <TrendingUp className="h-4 w-4 text-red-500" />
                              <span className="text-red-500">+{measurement.weightChange.toFixed(1)}kg</span>
                            </>
                          ) : measurement.weightChange < 0 ? (
                            <>
                              <TrendingDown className="h-4 w-4 text-green-500" />
                              <span className="text-green-500">{measurement.weightChange.toFixed(1)}kg</span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">±0kg</span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDate(measurement.measurement_date)}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {getStatusIcon(measurement.status)}
                  {getStatusBadge(measurement.status)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedUserId(measurement.user_id);
                      setIsModalOpen(true);
                    }}
                  >
                    Ver Gráficos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Medições</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{measurements.length}</div>
            <p className="text-xs text-muted-foreground">
              Medições registradas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status Normal</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {measurements.filter(m => m.status === 'normal').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Sem alertas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atenção</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {measurements.filter(m => m.status === 'warning').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requer monitoramento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crítico</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {measurements.filter(m => m.status === 'critical').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Intervenção necessária
            </p>
        </CardContent>
        </Card>
      </div>

      {/* Modal de Gráficos do Usuário */}
      {selectedUserId && (
        <WeightChartsModal
          userId={selectedUserId}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
};

export default WeighingMonitoring;