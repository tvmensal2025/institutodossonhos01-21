import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, Activity, Droplets, Flame, TrendingUp, TrendingDown, Minus, Heart, Calendar } from 'lucide-react';

interface WeighingReportProps {
  measurement: {
    id: string;
    peso_kg: number;
    imc?: number;
    risco_metabolico?: string;
    gordura_corporal_percent?: number;
    agua_corporal_percent?: number;
    massa_muscular_kg?: number;
    metabolismo_basal_kcal?: number;
    idade_metabolica?: number;
    circunferencia_abdominal_cm?: number;
    measurement_date: string;
  };
  physicalData?: {
    altura_cm: number;
    idade: number;
    sexo: string;
  };
}

const WeighingReport: React.FC<WeighingReportProps> = ({ measurement, physicalData }) => {
  const getRiskBadgeColor = (risk?: string) => {
    switch (risk) {
      case 'baixo_peso':
        return 'bg-blue-500 text-white';
      case 'normal':
        return 'bg-green-500 text-white';
      case 'sobrepeso':
        return 'bg-yellow-500 text-white';
      case 'obesidade_grau1':
      case 'obesidade_grau2':
      case 'obesidade_grau3':
        return 'bg-red-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRiskText = (risk?: string) => {
    switch (risk) {
      case 'baixo_peso':
        return 'Abaixo do peso';
      case 'normal':
        return 'Peso normal';
      case 'sobrepeso':
        return 'Sobrepeso';
      case 'obesidade_grau1':
        return 'Obesidade Grau I';
      case 'obesidade_grau2':
        return 'Obesidade Grau II';
      case 'obesidade_grau3':
        return 'Obesidade Grau III';
      default:
        return 'Não definido';
    }
  };

  const getWaistRisk = (waist?: number, gender?: string) => {
    if (!waist || !gender) return { level: 'desconhecido', text: 'Não informado', color: 'bg-gray-500' };
    
    if (gender === 'masculino') {
      if (waist >= 102) return { level: 'alto', text: 'Alto risco', color: 'bg-red-500' };
      if (waist >= 94) return { level: 'moderado', text: 'Risco moderado', color: 'bg-yellow-500' };
      return { level: 'baixo', text: 'Baixo risco', color: 'bg-green-500' };
    } else {
      if (waist >= 88) return { level: 'alto', text: 'Alto risco', color: 'bg-red-500' };
      if (waist >= 80) return { level: 'moderado', text: 'Risco moderado', color: 'bg-yellow-500' };
      return { level: 'baixo', text: 'Baixo risco', color: 'bg-green-500' };
    }
  };

  const getBodyFatRange = (gender?: string) => {
    if (gender === 'masculino') {
      return { excellent: [6, 13], good: [14, 17], average: [18, 24], poor: [25, 40] };
    } else {
      return { excellent: [14, 20], good: [21, 24], average: [25, 31], poor: [32, 45] };
    }
  };

  const getBodyFatCategory = (bodyFat?: number, gender?: string) => {
    if (!bodyFat || !gender) return { text: 'Não informado', color: 'text-gray-500' };
    
    const ranges = getBodyFatRange(gender);
    
    if (bodyFat <= ranges.excellent[1]) return { text: 'Excelente', color: 'text-green-600' };
    if (bodyFat <= ranges.good[1]) return { text: 'Bom', color: 'text-blue-600' };
    if (bodyFat <= ranges.average[1]) return { text: 'Médio', color: 'text-yellow-600' };
    return { text: 'Acima do ideal', color: 'text-red-600' };
  };

  const waistRisk = getWaistRisk(measurement.circunferencia_abdominal_cm, physicalData?.sexo);
  const bodyFatCategory = getBodyFatCategory(measurement.gordura_corporal_percent, physicalData?.sexo);

  // Calcular metas diárias baseadas no TMB
  const dailyCalories = measurement.metabolismo_basal_kcal ? Math.round(measurement.metabolismo_basal_kcal * 1.2) : 0;
  const dailyWater = Math.round((measurement.peso_kg * 35) / 250) * 250; // Arredondar para 250ml
  const dailyProtein = Math.round(measurement.peso_kg * 1.2);

  return (
    <div className="space-y-6">
      {/* Header do Relatório */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Relatório de Pesagem Completo
          </CardTitle>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {new Date(measurement.measurement_date).toLocaleString('pt-BR')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{measurement.peso_kg}kg</div>
              <div className="text-sm text-muted-foreground">Peso</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{measurement.imc?.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">IMC</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{physicalData?.altura_cm}cm</div>
              <div className="text-sm text-muted-foreground">Altura</div>
            </div>
            <div className="text-center">
              <Badge className={getRiskBadgeColor(measurement.risco_metabolico)}>
                {getRiskText(measurement.risco_metabolico)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Composição Corporal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Composição Corporal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gordura Corporal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Gordura Corporal</span>
                <span className={`text-sm font-semibold ${bodyFatCategory.color}`}>
                  {measurement.gordura_corporal_percent?.toFixed(1)}% - {bodyFatCategory.text}
                </span>
              </div>
              <Progress value={measurement.gordura_corporal_percent} className="h-2" />
            </div>

            {/* Água Corporal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Droplets className="h-4 w-4" />
                  Água Corporal
                </span>
                <span className="text-sm font-semibold text-blue-600">
                  {measurement.agua_corporal_percent?.toFixed(1)}%
                </span>
              </div>
              <Progress value={measurement.agua_corporal_percent} className="h-2" />
            </div>

            {/* Massa Muscular */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Massa Muscular</span>
                <span className="text-sm font-semibold text-green-600">
                  {measurement.massa_muscular_kg?.toFixed(1)}kg
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {((measurement.massa_muscular_kg || 0) / measurement.peso_kg * 100).toFixed(1)}% do peso total
              </div>
            </div>

            {/* Idade Metabólica */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Idade Metabólica</span>
                <span className="text-sm font-semibold">
                  {measurement.idade_metabolica} anos
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                {measurement.idade_metabolica && physicalData?.idade && measurement.idade_metabolica < physicalData.idade ? (
                  <span className="text-green-600">✓ Mais jovem que a idade real</span>
                ) : measurement.idade_metabolica && physicalData?.idade && measurement.idade_metabolica > physicalData.idade ? (
                  <span className="text-red-600">⚠ Mais velha que a idade real</span>
                ) : (
                  <span className="text-gray-600">≈ Igual à idade real</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Avaliação de Riscos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Avaliação de Riscos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risco por IMC</span>
                <Badge className={getRiskBadgeColor(measurement.risco_metabolico)}>
                  {getRiskText(measurement.risco_metabolico)}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Risco Abdominal</span>
                <Badge className={`${waistRisk.color} text-white`}>
                  {waistRisk.text}
                </Badge>
              </div>
              {measurement.circunferencia_abdominal_cm && (
                <div className="text-xs text-muted-foreground">
                  Circunferência: {measurement.circunferencia_abdominal_cm}cm
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metas Diárias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Metas Diárias Recomendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{dailyCalories}</div>
              <div className="text-sm text-red-800">kcal/dia</div>
              <div className="text-xs text-muted-foreground mt-1">Calorias (TMB x 1.2)</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{dailyWater}ml</div>
              <div className="text-sm text-blue-800">Água/dia</div>
              <div className="text-xs text-muted-foreground mt-1">35ml por kg corporal</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{dailyProtein}g</div>
              <div className="text-sm text-green-800">Proteína/dia</div>
              <div className="text-xs text-muted-foreground mt-1">1.2g por kg corporal</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metabolismo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="h-5 w-5" />
            Informações Metabólicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-lg font-semibold">{measurement.metabolismo_basal_kcal} kcal/dia</div>
              <div className="text-sm text-muted-foreground">Taxa Metabólica Basal (TMB)</div>
              <div className="text-xs text-muted-foreground mt-1">
                Calorias queimadas em repouso absoluto
              </div>
            </div>
            
            <div>
              <div className="text-lg font-semibold">{dailyCalories} kcal/dia</div>
              <div className="text-sm text-muted-foreground">Gasto Energético Diário</div>
              <div className="text-xs text-muted-foreground mt-1">
                Para manter o peso atual (atividade leve)
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeighingReport;