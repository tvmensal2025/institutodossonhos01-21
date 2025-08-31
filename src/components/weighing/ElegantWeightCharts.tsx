import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GaugeChart, MultiGaugeChart } from '@/components/ui/gauge-chart';
import { PersonIcon } from '@/components/ui/person-icon';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { Activity, Heart, Droplets, Zap, TrendingUp, Target } from 'lucide-react';

const ElegantWeightCharts: React.FC = () => {
  const { measurements, loading, stats } = useWeightMeasurement();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-32 bg-muted/20 rounded-lg"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!measurements.length) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
        <CardContent className="p-8 text-center">
          <PersonIcon className="mx-auto mb-4" size="xl" variant="outline" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma medição encontrada</h3>
          <p className="text-muted-foreground">Faça sua primeira pesagem para ver os gráficos aqui.</p>
        </CardContent>
      </Card>
    );
  }

  const latestMeasurement = measurements[0];

  const compositionData = [
    {
      title: 'Gordura Corporal',
      value: latestMeasurement?.gordura_corporal_percent || 0,
      minValue: 5,
      maxValue: 40,
      unit: '%',
      target: 15,
      colorScheme: 'body-fat' as const,
      icon: <Activity className="h-4 w-4" />
    },
    {
      title: 'Massa Muscular',
      value: latestMeasurement?.massa_muscular_kg || 0,
      minValue: 30,
      maxValue: 80,
      unit: 'kg',
      target: 50,
      colorScheme: 'muscle' as const,
      icon: <Heart className="h-4 w-4" />
    },
    {
      title: 'Água Corporal',
      value: latestMeasurement?.agua_corporal_percent || 0,
      minValue: 40,
      maxValue: 70,
      unit: '%',
      target: 60,
      colorScheme: 'water' as const,
      icon: <Droplets className="h-4 w-4" />
    },
    {
      title: 'Metabolismo Basal',
      value: latestMeasurement?.metabolismo_basal_kcal || 0,
      minValue: 1200,
      maxValue: 2500,
      unit: 'kcal',
      target: 1800,
      colorScheme: 'health' as const,
      icon: <Zap className="h-4 w-4" />
    },
    {
      title: 'IMC',
      value: stats.currentIMC || 0,
      minValue: 15,
      maxValue: 35,
      unit: '',
      target: 22,
      colorScheme: 'default' as const,
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      title: 'Peso Atual',
      value: latestMeasurement?.peso_kg || 0,
      minValue: 40,
      maxValue: 120,
      unit: 'kg',
      target: 70,
      colorScheme: 'health' as const,
      icon: <Target className="h-4 w-4" />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Header com Estatísticas Principais */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-primary/10 via-primary/5 to-background backdrop-blur-sm">
        <CardContent className="p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                {stats.currentWeight}
              </div>
              <div className="text-sm text-muted-foreground">Peso Atual (kg)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                {stats.currentIMC}
              </div>
              <div className="text-sm text-muted-foreground">IMC</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                {stats.weightChange}
              </div>
              <div className="text-sm text-muted-foreground">Mudança (kg)</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-primary mb-1">
                {measurements.length}
              </div>
              <div className="text-sm text-muted-foreground">Medições</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos de Composição Corporal em Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {compositionData.map((data, index) => (
          <Card 
            key={index} 
            className="border-0 shadow-lg bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:scale-105"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                {data.icon}
                {data.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <GaugeChart
                title=""
                value={data.value}
                minValue={data.minValue}
                maxValue={data.maxValue}
                unit={data.unit}
                target={data.target}
                size="lg"
                colorScheme={data.colorScheme}
                showTarget={true}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Análise Centralizada com Figura Humana */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Análise Corporal Completa</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            {/* Métricas Esquerda */}
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-orange-500/10 to-orange-600/10">
                <div className="text-2xl font-bold text-orange-600">{latestMeasurement?.gordura_corporal_percent || 0}%</div>
                <div className="text-sm text-muted-foreground">Gordura Corporal</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-blue-600/10">
                <div className="text-2xl font-bold text-blue-600">{latestMeasurement?.massa_muscular_kg || 0}kg</div>
                <div className="text-sm text-muted-foreground">Massa Muscular</div>
              </div>
            </div>

            {/* Figura Central */}
            <div className="flex justify-center">
              <div className="relative">
                <PersonIcon 
                  size="xl" 
                  variant="filled" 
                  className="w-32 h-32 text-primary drop-shadow-lg"
                />
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  {stats.currentWeight}kg
                </div>
              </div>
            </div>

            {/* Métricas Direita */}
            <div className="space-y-4">
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-cyan-500/10 to-cyan-600/10">
                <div className="text-2xl font-bold text-cyan-600">{latestMeasurement?.agua_corporal_percent || 0}%</div>
                <div className="text-sm text-muted-foreground">Água Corporal</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-r from-green-500/10 to-green-600/10">
                <div className="text-2xl font-bold text-green-600">{latestMeasurement?.metabolismo_basal_kcal ? Math.round(latestMeasurement.metabolismo_basal_kcal).toLocaleString() : 0}</div>
                <div className="text-sm text-muted-foreground">Metabolismo Basal</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ElegantWeightCharts;