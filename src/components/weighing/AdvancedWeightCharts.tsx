import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GaugeChart, MultiGaugeChart } from '@/components/ui/gauge-chart';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { Scale } from 'lucide-react';

const AdvancedWeightCharts: React.FC = () => {
  const { measurements, loading, stats } = useWeightMeasurement();

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    );
  }

  if (measurements.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="text-center">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma Pesagem Registrada</h3>
            <p className="text-muted-foreground">
              Registre sua primeira pesagem para ver os gráficos avançados.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const latestMeasurement = measurements[0];
  
  // Dados básicos de composição corporal
  const bodyCompositionData = [
    {
      label: 'Massa Gorda',
      value: latestMeasurement.gordura_corporal_percent || 0,
      unit: '%',
      minValue: 5,
      maxValue: 50,
      target: 15,
      colorScheme: 'body-fat' as const
    },
    {
      label: '% Gordura',
      value: latestMeasurement.gordura_corporal_percent || 0,
      unit: '%',
      minValue: 5,
      maxValue: 40,
      target: 20,
      colorScheme: 'body-fat' as const
    },
    {
      label: 'Água Corporal Total',
      value: latestMeasurement.agua_corporal_percent || 0,
      unit: 'L',
      minValue: 20,
      maxValue: 60,
      target: 50,
      colorScheme: 'water' as const
    },
    {
      label: 'Hidratação',
      value: latestMeasurement.agua_corporal_percent || 0,
      unit: 'pontos',
      minValue: 0,
      maxValue: 10,
      target: 8,
      colorScheme: 'water' as const
    },
    {
      label: 'Água na Massa Magra',
      value: latestMeasurement.agua_corporal_percent ? latestMeasurement.agua_corporal_percent * 0.8 : 0,
      unit: '%',
      minValue: 30,
      maxValue: 80,
      target: 70,
      colorScheme: 'water' as const
    }
  ];

  // Segunda linha de dados
  const metabolicData = [
    {
      label: 'Intracelular',
      value: latestMeasurement.agua_corporal_percent ? latestMeasurement.agua_corporal_percent * 0.6 : 0,
      unit: 'L',
      minValue: 10,
      maxValue: 40,
      target: 30,
      colorScheme: 'water' as const
    },
    {
      label: 'Água Intra e Extra Celular',
      value: latestMeasurement.agua_corporal_percent || 0,
      unit: '%',
      minValue: 40,
      maxValue: 70,
      target: 60,
      colorScheme: 'water' as const
    },
    {
      label: 'Extracelular',
      value: latestMeasurement.agua_corporal_percent ? latestMeasurement.agua_corporal_percent * 0.4 : 0,
      unit: 'L',
      minValue: 8,
      maxValue: 25,
      target: 18,
      colorScheme: 'water' as const
    },
    {
      label: 'Massa Magra e Muscular',
      value: latestMeasurement.massa_muscular_kg || 0,
      unit: 'kg',
      minValue: 20,
      maxValue: 80,
      target: 60,
      colorScheme: 'muscle' as const
    },
    {
      label: 'Razão Músculo Gordura',
      value: latestMeasurement.massa_muscular_kg && latestMeasurement.gordura_corporal_percent 
        ? latestMeasurement.massa_muscular_kg / latestMeasurement.gordura_corporal_percent : 0,
      unit: 'ratio',
      minValue: 0,
      maxValue: 5,
      target: 3,
      colorScheme: 'muscle' as const
    }
  ];

  // Terceira linha de dados
  const advancedMetrics = [
    {
      label: 'Massa Muscular',
      value: latestMeasurement.massa_muscular_kg || 0,
      unit: 'kg',
      minValue: 20,
      maxValue: 80,
      target: 60,
      colorScheme: 'muscle' as const
    },
    {
      label: 'IMC',
      value: latestMeasurement.imc || 0,
      unit: 'kg/m²',
      minValue: 15,
      maxValue: 40,
      target: 25,
      colorScheme: 'health' as const
    },
    {
      label: 'Taxa Metabólica Basal',
      value: 1450, // Valor simulado - calcular com base nos dados reais
      unit: 'kcal',
      minValue: 1000,
      maxValue: 2500,
      target: 1600,
      colorScheme: 'health' as const
    },
    {
      label: 'Ângulo de Fase',
      value: 6.5, // Valor simulado
      unit: '°',
      minValue: 4,
      maxValue: 10,
      target: 7,
      colorScheme: 'health' as const
    },
    {
      label: 'Análise Celular',
      value: 85, // Valor simulado
      unit: 'anos',
      minValue: 20,
      maxValue: 100,
      target: 35,
      colorScheme: 'health' as const
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header com informações do usuário */}
      <Card className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <CardHeader>
          <CardTitle className="text-center text-xl">
            Avaliação: Laíse Cordeiro - Rafael Ferreira Dias
          </CardTitle>
          <div className="text-center text-sm text-slate-300">
            <p>Data da medição: {new Date(latestMeasurement.measurement_date).toLocaleDateString('pt-BR', { 
              day: '2-digit', 
              month: '2-digit', 
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</p>
            <p>Avaliação realizada através do InBody</p>
          </div>
        </CardHeader>
      </Card>

      {/* Primeira linha de gráficos */}
      <MultiGaugeChart
        title=""
        data={bodyCompositionData}
        className="bg-slate-900 text-white border-slate-700"
      />

      {/* Segunda linha de gráficos */}
      <MultiGaugeChart
        title=""
        data={metabolicData}
        className="bg-slate-900 text-white border-slate-700"
      />

      {/* Terceira linha de gráficos */}
      <MultiGaugeChart
        title=""
        data={advancedMetrics}
        className="bg-slate-900 text-white border-slate-700"
      />

      {/* Análise corporal com figura humana central */}
      <Card className="bg-slate-900 text-white border-slate-700">
        <CardHeader>
          <CardTitle className="text-center">Análise Corporal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna esquerda */}
            <div className="space-y-4">
              <GaugeChart
                title="Massa Magra"
                subtitle="Massa Magra e Muscular Razão Músculo Gordura"
                value={latestMeasurement.massa_muscular_kg || 50.4}
                unit="kg / 55.8 %"
                minValue={20}
                maxValue={80}
                target={60}
                colorScheme="muscle"
                size="md"
                showTarget={false}
                className="bg-slate-800 border-slate-600"
              />
              
              <div className="text-center">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm inline-block">
                  Vitality
                </div>
              </div>
            </div>

            {/* Coluna central - Figura humana */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative">
                <img
                  src="/images/silhueta.svg"
                  alt="Silhueta Humana"
                  width="150"
                  height="250"
                  className="opacity-80 filter brightness-0 invert"
                />
                
                {/* Medidas sobrepostas */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <div className="text-center">
                    <div className="text-sm font-bold">163</div>
                    <div className="text-xs">kg</div>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
                  <div className="text-center">
                    <div className="text-sm">Peso, Altura e TMB</div>
                    <div className="text-xs">Idade: 43 anos</div>
                  </div>
                </div>
              </div>
              
              {/* Botões de ação */}
              <div className="mt-4 space-y-2">
                <button className="bg-red-600 text-white px-4 py-1 rounded text-sm">
                  avva
                </button>
                <button className="bg-blue-600 text-white px-4 py-1 rounded text-sm">
                  Risco
                </button>
                <button className="bg-green-600 text-white px-4 py-1 rounded text-sm">
                  Sintomas
                </button>
              </div>
            </div>

            {/* Coluna direita */}
            <div className="space-y-4">
              <GaugeChart
                title="Ângulo de Fase"
                subtitle=""
                value={6.5}
                unit="°"
                minValue={4}
                maxValue={10}
                target={7}
                colorScheme="health"
                size="md"
                showTarget={false}
                className="bg-slate-800 border-slate-600"
              />
              
              <div className="text-center">
                <div className="text-sm">Análise celular</div>
                <div className="text-sm">Idade Celular</div>
                <div className="text-lg font-bold">43 anos</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedWeightCharts;