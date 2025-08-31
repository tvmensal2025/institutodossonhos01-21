import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, Ruler, Activity, Zap, AlertTriangle } from 'lucide-react';

interface BodyMetricsChartProps {
  peso: number;
  altura: number;
  imc: number;
  tmb: number;
  classificacaoIMC: string;
  risco: 'BAIXO' | 'MODERADO' | 'ALTO';
}

export const BodyMetricsChart: React.FC<BodyMetricsChartProps> = ({
  peso,
  altura,
  imc,
  tmb,
  classificacaoIMC,
  risco
}) => {
  // Configuração do gráfico de barras para IMC
  const options = {
    chart: {
      type: 'bar' as const,
      height: 140,
      toolbar: {
        show: false
      },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 800,
        animateGradually: {
          enabled: true,
          delay: 150
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '70%',
        distributed: true,
        borderRadius: 5,
        dataLabels: {
          position: 'bottom'
        }
      }
    },
    colors: ['#22c55e', '#84cc16', '#f59e0b', '#ef4444', '#dc2626'],
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: ['IMC'],
      labels: {
        show: true,
        style: {
          colors: '#64748b'
        }
      },
      min: 15,
      max: 40,
      axisBorder: {
        show: false
      }
    },
    yaxis: {
      labels: {
        show: false
      }
    },
    grid: {
      show: false
    }
  };

  // Classificação de risco
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'BAIXO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MODERADO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ALTO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Classificação IMC
  const getIMCColor = (classificacao: string) => {
    switch (classificacao.toLowerCase()) {
      case 'abaixo do peso':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'peso normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sobrepeso':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'obesidade grau i':
      case 'obesidade grau ii':
      case 'obesidade grau iii':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-white shadow-xl border-0">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Métricas Corporais</CardTitle>
          <div className="flex space-x-2">
            <Badge className={getIMCColor(classificacaoIMC)}>
              {classificacaoIMC}
            </Badge>
            <Badge className={getRiskColor(risco)}>
              Risco {risco}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Grid de Métricas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Peso */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Scale className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-900">Peso</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {peso.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">quilogramas</div>
          </div>

          {/* Altura */}
          <div className="bg-green-50 p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Ruler className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-900">Altura</span>
            </div>
            <div className="text-2xl font-bold text-green-600">
              {altura}
            </div>
            <div className="text-sm text-gray-600">centímetros</div>
          </div>

          {/* IMC */}
          <div className="bg-yellow-50 p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-900">IMC</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">
              {imc.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">kg/m²</div>
          </div>

          {/* TMB */}
          <div className="bg-purple-50 p-4 rounded-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="h-5 w-5 text-purple-600" />
              <span className="font-medium text-purple-900">TMB</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">
              {tmb.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">kcal/dia</div>
          </div>
        </div>

        {/* Gráfico IMC */}
        <div className="mb-6">
          <ReactApexChart
            options={options}
            series={[{
              name: 'IMC',
              data: [imc]
            }]}
            type="bar" as const
            height={140}
          />
        </div>

        {/* Faixas de IMC */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            <span>Abaixo do Peso: &lt; 18.5</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Peso Normal: 18.5 - 24.9</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Sobrepeso: 25 - 29.9</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Obesidade I: 30 - 34.9</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span>Obesidade II: 35 - 39.9</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-800"></div>
            <span>Obesidade III: ≥ 40</span>
          </div>
        </div>

        {/* Alerta de Risco */}
        {risco === 'ALTO' && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Atenção!</span>
            </div>
            <p className="text-sm text-red-600 mt-1">
              Seus indicadores sugerem risco elevado. Recomendamos consulta médica para avaliação detalhada.
            </p>
          </div>
        )}

        {/* TMB Info */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-sm">
            <span className="font-medium text-gray-700">Taxa Metabólica Basal (TMB):</span>
            <span className="text-gray-600"> representa o gasto energético mínimo diário em repouso.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};