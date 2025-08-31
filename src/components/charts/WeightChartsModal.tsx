import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Scale,
  Target
} from 'lucide-react';

interface WeightChartsModalProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface WeightData {
  id: string;
  peso_kg: number;
  imc?: number;
  gordura_corporal_percent?: number;
  massa_muscular_kg?: number;
  measurement_date: string;
}

const WeightChartsModal: React.FC<WeightChartsModalProps> = ({
  userId,
  isOpen,
  onClose
}) => {
  const [weightData, setWeightData] = useState<WeightData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserWeightData();
    }
  }, [isOpen, userId]);

  const fetchUserWeightData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('weight_measurements')
        .select('*')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: true })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        return;
      }

      setWeightData(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChartData = () => {
    return weightData.map((item, index) => ({
      date: new Date(item.measurement_date).toLocaleDateString('pt-BR'),
      peso: item.peso_kg,
      imc: item.imc,
      gordura: item.gordura_corporal_percent,
      musculo: item.massa_muscular_kg,
      measurement_number: index + 1
    }));
  };

  const getWeightTrend = () => {
    if (weightData.length < 2) return null;
    
    const first = weightData[0];
    const last = weightData[weightData.length - 1];
    const difference = last.peso_kg - first.peso_kg;
    
    return {
      difference: difference.toFixed(1),
      isPositive: difference > 0,
      percentage: ((difference / first.peso_kg) * 100).toFixed(1)
    };
  };

  const getLatestMeasurement = () => {
    if (weightData.length === 0) return null;
    return weightData[weightData.length - 1];
  };

  const trend = getWeightTrend();
  const latest = getLatestMeasurement();
  const chartData = formatChartData();

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Gráficos de Evolução do Peso
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <div className="animate-pulse">
              <div className="h-64 bg-muted rounded"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resumo Estatístico */}
            {latest && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-1">
                      <Scale className="h-4 w-4" />
                      Peso Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{latest.peso_kg}kg</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      IMC Atual
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {latest.imc ? latest.imc.toFixed(1) : 'N/A'}
                    </div>
                  </CardContent>
                </Card>

                {trend && (
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium flex items-center gap-1">
                        {trend.isPositive ? (
                          <TrendingUp className="h-4 w-4 text-red-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-500" />
                        )}
                        Variação Total
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${
                        trend.isPositive ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {trend.isPositive ? '+' : ''}{trend.difference}kg
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {trend.percentage}%
                      </p>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total de Medições
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{weightData.length}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Gráfico de Evolução do Peso */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Peso</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        fontSize={12}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        labelFormatter={(label) => `Data: ${label}`}
                        formatter={(value, name) => [
                          `${value}${name === 'peso' ? 'kg' : name === 'imc' ? '' : '%'}`,
                          name === 'peso' ? 'Peso' : name === 'imc' ? 'IMC' : name === 'gordura' ? 'Gordura' : 'Músculo'
                        ]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="peso" 
                        stroke="#8884d8" 
                        strokeWidth={3}
                        dot={{ r: 4 }}
                        name="Peso (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de IMC */}
            {chartData.some(item => item.imc) && (
              <Card>
                <CardHeader>
                  <CardTitle>Evolução do IMC</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          labelFormatter={(label) => `Data: ${label}`}
                          formatter={(value) => [`${value}`, 'IMC']}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="imc" 
                          stroke="#82ca9d" 
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          name="IMC"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Gráfico de Composição Corporal */}
            {chartData.some(item => item.gordura || item.musculo) && (
              <Card>
                <CardHeader>
                  <CardTitle>Composição Corporal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          fontSize={12}
                          angle={-45}
                          textAnchor="end"
                          height={80}
                        />
                        <YAxis fontSize={12} />
                        <Tooltip 
                          labelFormatter={(label) => `Data: ${label}`}
                          formatter={(value, name) => [
                            `${value}${name === 'musculo' ? 'kg' : '%'}`,
                            name === 'gordura' ? 'Gordura Corporal' : 'Massa Muscular'
                          ]}
                        />
                        <Legend />
                        {chartData.some(item => item.gordura) && (
                          <Bar 
                            dataKey="gordura" 
                            fill="#ff7300" 
                            name="Gordura (%)"
                          />
                        )}
                        {chartData.some(item => item.musculo) && (
                          <Bar 
                            dataKey="musculo" 
                            fill="#00d2ff" 
                            name="Músculo (kg)"
                          />
                        )}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Lista de Medições Recentes */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Medições</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  {weightData.slice(-10).reverse().map((measurement, index) => (
                    <div key={measurement.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {new Date(measurement.measurement_date).toLocaleDateString('pt-BR')}
                        </Badge>
                        <span className="font-medium">{measurement.peso_kg}kg</span>
                        {measurement.imc && (
                          <span className="text-sm text-muted-foreground">
                            IMC: {measurement.imc.toFixed(1)}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        {measurement.gordura_corporal_percent && (
                          <div className="flex flex-col items-center bg-yellow-500/10 px-3 py-1 rounded-lg border border-yellow-500/20">
                            <span className="text-yellow-600 font-bold text-lg">
                              {measurement.gordura_corporal_percent.toFixed(1)}%
                            </span>
                            <span className="text-yellow-600 text-xs">Gordura</span>
                          </div>
                        )}
                        {measurement.massa_muscular_kg && (
                          <div className="flex flex-col items-center bg-green-500/10 px-3 py-1 rounded-lg border border-green-500/20">
                            <span className="text-green-600 font-bold text-lg">
                              {measurement.massa_muscular_kg.toFixed(1)}kg
                            </span>
                            <span className="text-green-600 text-xs">Músculo</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WeightChartsModal;