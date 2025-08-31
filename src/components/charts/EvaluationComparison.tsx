import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Calendar } from 'lucide-react';
import { ProfessionalEvaluation } from '@/hooks/useProfessionalEvaluation';

interface EvaluationComparisonProps {
  evaluations: ProfessionalEvaluation[];
  currentEvaluation?: ProfessionalEvaluation;
}

export const EvaluationComparison: React.FC<EvaluationComparisonProps> = ({
  evaluations,
  currentEvaluation
}) => {
  // Prepara dados para o gráfico de evolução
  const evolutionData = evaluations.map(evaluation => ({
    date: new Date(evaluation.evaluation_date).toLocaleDateString('pt-BR'),
    peso: evaluation.weight_kg,
    gordura: evaluation.body_fat_percentage || 0,
    massaMagra: evaluation.lean_mass_kg || 0,
    imc: evaluation.bmi || 0,
    cintura: evaluation.waist_circumference_cm
  }));

  // Configuração do gráfico de evolução
  const evolutionOptions = {
    chart: {
      type: 'line' as const,
      height: 400,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true
        }
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800
      }
    },
    stroke: {
      curve: 'smooth' as const,
      width: [3, 3, 3, 3]
    },
    markers: {
      size: 5,
      strokeWidth: 2,
      hover: {
        size: 7
      }
    },
    xaxis: {
      categories: evolutionData.map(d => d.date),
      labels: {
        style: {
          colors: '#64748b',
          fontSize: '12px'
        }
      }
    },
    yaxis: [
      {
        title: {
          text: 'Peso (kg)',
          style: {
            color: '#3b82f6'
          }
        },
        labels: {
          style: {
            colors: '#3b82f6'
          }
        }
      },
      {
        opposite: true,
        title: {
          text: '% Gordura',
          style: {
            color: '#ef4444'
          }
        },
        labels: {
          style: {
            colors: '#ef4444'
          }
        }
      }
    ],
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 5
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'left' as const
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: {
        formatter: function(value: number, { seriesIndex }: any) {
          if (seriesIndex === 1) return value.toFixed(1) + '%';
          return value.toFixed(1) + 'kg';
        }
      }
    },
    colors: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b']
  };

  const evolutionSeries = [
    {
      name: 'Peso',
      data: evolutionData.map(d => d.peso)
    },
    {
      name: '% Gordura',
      data: evolutionData.map(d => d.gordura),
      yAxisIndex: 1
    },
    {
      name: 'Massa Magra',
      data: evolutionData.map(d => d.massaMagra)
    },
    {
      name: 'IMC',
      data: evolutionData.map(d => d.imc)
    }
  ];

  // Calcula variações
  const calculateVariation = (current: number, previous: number) => {
    const diff = current - previous;
    const percentage = (diff / previous) * 100;
    return { diff, percentage };
  };

  // Pega última e penúltima avaliação para comparação
  const lastEvaluation = evaluations[0];
  const previousEvaluation = evaluations[1];

  const getVariationIcon = (diff: number, isNegativeGood: boolean = false) => {
    if (Math.abs(diff) < 0.1) return <Minus className="h-4 w-4 text-gray-500" />;
    if (diff > 0) {
      return isNegativeGood ? 
        <TrendingUp className="h-4 w-4 text-red-500" /> : 
        <TrendingUp className="h-4 w-4 text-green-500" />;
    }
    return isNegativeGood ? 
      <TrendingDown className="h-4 w-4 text-green-500" /> : 
      <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Evolução Temporal</span>
            <Badge variant="outline">
              <Calendar className="h-3 w-3 mr-1" />
              {evaluations.length} avaliações
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
        <ReactApexChart
          options={evolutionOptions}
          series={evolutionSeries}
          type="line"
          height={400}
        />
        </CardContent>
      </Card>

      {/* Comparativo entre avaliações */}
      {lastEvaluation && previousEvaluation && (
        <Card>
          <CardHeader>
            <CardTitle>Comparativo com Avaliação Anterior</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Peso */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Peso</span>
                  {getVariationIcon(
                    lastEvaluation.weight_kg - previousEvaluation.weight_kg,
                    true // Para peso, negativo pode ser bom
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {lastEvaluation.weight_kg.toFixed(1)} kg
                </div>
                <div className="text-sm text-gray-500">
                  {previousEvaluation.weight_kg.toFixed(1)} kg anterior
                </div>
                <div className={`text-xs mt-1 ${
                  lastEvaluation.weight_kg < previousEvaluation.weight_kg ? 
                  'text-green-600' : 'text-red-600'
                }`}>
                  {lastEvaluation.weight_kg < previousEvaluation.weight_kg ? '↓' : '↑'} 
                  {Math.abs(lastEvaluation.weight_kg - previousEvaluation.weight_kg).toFixed(1)} kg
                </div>
              </div>

              {/* % Gordura */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">% Gordura</span>
                  {getVariationIcon(
                    (lastEvaluation.body_fat_percentage || 0) - (previousEvaluation.body_fat_percentage || 0),
                    true // Para gordura, negativo é bom
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {(lastEvaluation.body_fat_percentage || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-500">
                  {(previousEvaluation.body_fat_percentage || 0).toFixed(1)}% anterior
                </div>
                <div className={`text-xs mt-1 ${
                  (lastEvaluation.body_fat_percentage || 0) < (previousEvaluation.body_fat_percentage || 0) ? 
                  'text-green-600' : 'text-red-600'
                }`}>
                  {(lastEvaluation.body_fat_percentage || 0) < (previousEvaluation.body_fat_percentage || 0) ? '↓' : '↑'} 
                  {Math.abs((lastEvaluation.body_fat_percentage || 0) - (previousEvaluation.body_fat_percentage || 0)).toFixed(1)}%
                </div>
              </div>

              {/* Massa Magra */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Massa Magra</span>
                  {getVariationIcon(
                    (lastEvaluation.lean_mass_kg || 0) - (previousEvaluation.lean_mass_kg || 0),
                    false // Para massa magra, positivo é bom
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {(lastEvaluation.lean_mass_kg || 0).toFixed(1)} kg
                </div>
                <div className="text-sm text-gray-500">
                  {(previousEvaluation.lean_mass_kg || 0).toFixed(1)} kg anterior
                </div>
                <div className={`text-xs mt-1 ${
                  (lastEvaluation.lean_mass_kg || 0) > (previousEvaluation.lean_mass_kg || 0) ? 
                  'text-green-600' : 'text-red-600'
                }`}>
                  {(lastEvaluation.lean_mass_kg || 0) > (previousEvaluation.lean_mass_kg || 0) ? '↑' : '↓'} 
                  {Math.abs((lastEvaluation.lean_mass_kg || 0) - (previousEvaluation.lean_mass_kg || 0)).toFixed(1)} kg
                </div>
              </div>

              {/* IMC */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">IMC</span>
                  {getVariationIcon(
                    (lastEvaluation.bmi || 0) - (previousEvaluation.bmi || 0),
                    true // Para IMC, negativo pode ser bom
                  )}
                </div>
                <div className="text-2xl font-bold">
                  {(lastEvaluation.bmi || 0).toFixed(1)}
                </div>
                <div className="text-sm text-gray-500">
                  {(previousEvaluation.bmi || 0).toFixed(1)} anterior
                </div>
                <div className={`text-xs mt-1 ${
                  (lastEvaluation.bmi || 0) < (previousEvaluation.bmi || 0) ? 
                  'text-green-600' : 'text-red-600'
                }`}>
                  {(lastEvaluation.bmi || 0) < (previousEvaluation.bmi || 0) ? '↓' : '↑'} 
                  {Math.abs((lastEvaluation.bmi || 0) - (previousEvaluation.bmi || 0)).toFixed(1)}
                </div>
              </div>
            </div>

            {/* Tabela de evolução detalhada */}
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Métrica</th>
                    <th className="text-right py-2">Anterior</th>
                    <th className="text-right py-2">Atual</th>
                    <th className="text-right py-2">Variação</th>
                    <th className="text-right py-2">%</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2">Peso (kg)</td>
                    <td className="text-right">{previousEvaluation.weight_kg.toFixed(1)}</td>
                    <td className="text-right font-medium">{lastEvaluation.weight_kg.toFixed(1)}</td>
                    <td className="text-right">{(lastEvaluation.weight_kg - previousEvaluation.weight_kg).toFixed(1)}</td>
                    <td className="text-right">{((lastEvaluation.weight_kg - previousEvaluation.weight_kg) / previousEvaluation.weight_kg * 100).toFixed(1)}%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Gordura (%)</td>
                    <td className="text-right">{(previousEvaluation.body_fat_percentage || 0).toFixed(1)}</td>
                    <td className="text-right font-medium">{(lastEvaluation.body_fat_percentage || 0).toFixed(1)}</td>
                    <td className="text-right">{((lastEvaluation.body_fat_percentage || 0) - (previousEvaluation.body_fat_percentage || 0)).toFixed(1)}</td>
                    <td className="text-right">-</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Massa Gorda (kg)</td>
                    <td className="text-right">{(previousEvaluation.fat_mass_kg || 0).toFixed(1)}</td>
                    <td className="text-right font-medium">{(lastEvaluation.fat_mass_kg || 0).toFixed(1)}</td>
                    <td className="text-right">{((lastEvaluation.fat_mass_kg || 0) - (previousEvaluation.fat_mass_kg || 0)).toFixed(1)}</td>
                    <td className="text-right">{(((lastEvaluation.fat_mass_kg || 0) - (previousEvaluation.fat_mass_kg || 0)) / (previousEvaluation.fat_mass_kg || 1) * 100).toFixed(1)}%</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2">Massa Magra (kg)</td>
                    <td className="text-right">{(previousEvaluation.lean_mass_kg || 0).toFixed(1)}</td>
                    <td className="text-right font-medium">{(lastEvaluation.lean_mass_kg || 0).toFixed(1)}</td>
                    <td className="text-right">{((lastEvaluation.lean_mass_kg || 0) - (previousEvaluation.lean_mass_kg || 0)).toFixed(1)}</td>
                    <td className="text-right">{(((lastEvaluation.lean_mass_kg || 0) - (previousEvaluation.lean_mass_kg || 0)) / (previousEvaluation.lean_mass_kg || 1) * 100).toFixed(1)}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};