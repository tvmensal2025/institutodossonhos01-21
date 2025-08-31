import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WeightMeasurement } from '@/hooks/useProgressData';
import { PersonIcon, BodyCompositionIcon, HealthIndicatorIcon } from '@/components/ui/person-icon';

interface ProgressChartsProps {
  measurements: WeightMeasurement[];
}

export default function ProgressCharts({ measurements }: ProgressChartsProps) {
  // Preparar dados para os gráficos
  const chartData = measurements
    .sort((a, b) => new Date(a.measurement_date).getTime() - new Date(b.measurement_date).getTime())
    .map((measurement, index) => ({
      date: new Date(measurement.measurement_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      }),
      weight: measurement.peso_kg,
      bodyFat: measurement.gordura_corporal_percent || 0,
      muscleMass: measurement.massa_muscular_kg || 0,
      bmi: measurement.imc || 0,
      metabolicAge: measurement.idade_metabolica || 0,
      index
    }));

  const formatTooltip = (value: string | number, name: string) => {
    switch (name) {
      case 'weight':
        return [`${value}kg`, 'Peso'];
      case 'bodyFat':
        return [`${value}%`, 'Gordura Corporal'];
      case 'muscleMass':
        return [`${value}kg`, 'Massa Muscular'];
      case 'bmi':
        return [value, 'IMC'];
      case 'metabolicAge':
        return [`${value} anos`, 'Idade Metabólica'];
      default:
        return [value, name];
    }
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ color: string; name: string; value: string | number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground">{label}</p>
          {payload.map((entry: { color: string; name: string; value: string | number }, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (measurements.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PersonIcon size="md" variant="filled" color="#F97316" />
              <span>Evolução do Peso</span>
            </CardTitle>
            <CardDescription>
              Histórico de pesagens ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <PersonIcon size="lg" variant="gradient" color="#F97316" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Seu progresso de peso ao longo do tempo</p>
                <p className="text-xs text-muted-foreground">O boneco representa você e sua jornada de saúde</p>
              </div>
            </div>
            <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Nenhuma medição registrada</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PersonIcon size="md" variant="filled" color="#10B981" />
              <span>Composição Corporal</span>
            </CardTitle>
            <CardDescription>
              Gordura corporal vs massa muscular
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
              <p className="text-muted-foreground">Nenhuma medição registrada</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mobile-grid-1 gap-4 md:gap-6">
      {/* Gráfico de Evolução do Peso */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">1</span>
            <PersonIcon size="md" variant="filled" color="#F97316" />
            <span>Evolução do Peso</span>
          </CardTitle>
          <CardDescription>
            Histórico de pesagens ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <PersonIcon size="lg" variant="gradient" color="#F97316" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Seu progresso de peso ao longo do tempo</p>
              <p className="text-xs text-muted-foreground">O boneco representa você e sua jornada de saúde</p>
            </div>
          </div>
          <div className="h-80 sm:h-96 lg:h-[500px] -mx-4 sm:-mx-6 lg:-mx-8">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  interval="preserveStartEnd"
                  padding={{ left: 5, right: 5 }}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={14}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}kg`}
                  width={45}
                  padding={{ top: 5, bottom: 5 }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#f97316"
                  strokeWidth={4}
                  fill="url(#weightGradient)"
                  name="weight"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Composição Corporal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">2</span>
            <PersonIcon size="md" variant="filled" color="#10B981" />
            <span>Composição Corporal</span>
          </CardTitle>
          <CardDescription>
            Gordura corporal vs massa muscular
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <PersonIcon size="lg" variant="gradient" color="#10B981" />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Análise detalhada da composição do seu corpo</p>
              <p className="text-xs text-muted-foreground">Cada componente é representado por cores diferentes</p>
            </div>
          </div>
          
          {/* Ícones de composição corporal */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <BodyCompositionIcon type="fat" size="sm" />
            <BodyCompositionIcon type="muscle" size="sm" />
          </div>
          
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                angle={-45}
                textAnchor="end"
                height={60}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}kg`}
                width={45}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="bodyFat" 
                fill="#ef4444" 
                radius={[4, 4, 0, 0]}
                name="bodyFat"
              />
              <Line
                type="monotone"
                dataKey="muscleMass"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                name="muscleMass"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de IMC */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">3</span>
            📏 Evolução do IMC
          </CardTitle>
          <CardDescription>
            Índice de Massa Corporal ao longo do tempo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="bmi"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="bmi"
              />
              {/* Linhas de referência do IMC */}
              <Line
                type="monotone"
                data={chartData.map(() => ({ bmi: 25 }))}
                dataKey="bmi"
                stroke="#22c55e"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="IMC Normal"
              />
              <Line
                type="monotone"
                data={chartData.map(() => ({ bmi: 30 }))}
                dataKey="bmi"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Sobrepeso"
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500"></div>
              <span>IMC Normal (25)</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-yellow-500"></div>
              <span>Sobrepeso (30)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Idade Metabólica */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">4</span>
            🔥 Idade Metabólica
          </CardTitle>
          <CardDescription>
            Evolução da idade metabólica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value} anos`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="metabolicAge"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4 }}
                name="metabolicAge"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
} 