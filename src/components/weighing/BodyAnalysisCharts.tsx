import React, { useEffect, useRef, useState } from 'react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { Scale, User, Droplets, Activity, Heart, Target, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BodyMetricsCalculator } from '@/services/BodyMetricsCalculator';

declare global {
  interface Window {
    RGraph: any;
  }
}

interface BodyMetrics {
  peso: number;
  imc: number;
  massaGorda: number;
  massaMagra: number;
  massaMuscular: number;
  hidratacao: number;
  aguaIntracelular: number;
  aguaExtracelular: number;
  anguloFase: number;
  idadeCelular: number;
  tmb: number;
  rcest: number;
}

// Dados de exemplo para demonstração
const sampleData = [
  {
    id: '1',
    peso_kg: 85.2,
    imc: 28.5,
    gordura_corporal_percent: 22.5,
    massa_muscular_kg: 45.8,
    agua_corporal_percent: 58.2,
    osso_kg: 3.2,
    gordura_visceral: 8,
    idade_metabolica: 32,
    device_type: 'xiaomi_scale',
    measurement_date: '2024-01-15T08:30:00Z'
  },
  {
    id: '2',
    peso_kg: 84.8,
    imc: 28.3,
    gordura_corporal_percent: 22.1,
    massa_muscular_kg: 46.1,
    agua_corporal_percent: 58.5,
    osso_kg: 3.2,
    gordura_visceral: 8,
    idade_metabolica: 31,
    device_type: 'xiaomi_scale',
    measurement_date: '2024-01-18T08:15:00Z'
  },
  {
    id: '3',
    peso_kg: 84.1,
    imc: 28.1,
    gordura_corporal_percent: 21.8,
    massa_muscular_kg: 46.3,
    agua_corporal_percent: 58.8,
    osso_kg: 3.2,
    gordura_visceral: 7,
    idade_metabolica: 31,
    device_type: 'xiaomi_scale',
    measurement_date: '2024-01-21T08:45:00Z'
  }
];

// Graph history utility functions based on the provided code
const graphHistory = {
  generateHBars: function (values: number[], colors: string[]) {
    let hBars = values.map((item, index) => {
      var len = values[index - 1] ? item - values[index - 1] : item - 1;
      return [index > 0 ? values[index - 1] - 1 : 0, len, colors[index]];
    });
    return hBars;
  },

  drawHistory: function (canvasID: string, historyData: any[], xAxis: any, yAxis: any, hBars: any[],
    tooltipOptions = { cssClass: 'tooltips-value-history', radius: -1, strokestyle: '#bc960099', fillstyle: '#fffb9b' },
    clearCanvas: boolean, isMobileDevice: boolean, settings = { dontChangeCanvasSize: false }, overWriteGraphOptions?: any) {

    var theCanvas = document.getElementById(canvasID) as HTMLCanvasElement;
    if (!theCanvas) return null;

    if (clearCanvas) {
      const context = theCanvas.getContext('2d');
      if (context) {
        context.clearRect(0, 0, theCanvas.width, theCanvas.height);
      }
    }

    if (!settings.dontChangeCanvasSize) {
      const parent = theCanvas.parentElement;
      if (parent && parent.firstElementChild) {
        theCanvas.width = (parent.firstElementChild as HTMLElement).clientWidth;
      }
    }

    // Normalize data within Y axis bounds
    historyData.forEach(serie => {
      for (let i = 0; i < serie.length; i++) {
        if (serie[i][1] < yAxis.min) {
          serie[i][1] = yAxis.min;
        } else if (serie[i][1] > yAxis.max) {
          serie[i][1] = yAxis.max;
        }
      }
    });

    let textSize = theCanvas.width * 0.013;
    let gutterLeft = theCanvas.width * 0.032;
    let gutterBottom = theCanvas.height * 0.0694;

    let options: any = {
      text: { size: textSize },
      xmin: xAxis.min,
      xmax: xAxis.max,
      line: true,
      lineLinewidth: 2,
      ymax: yAxis.max,
      ymin: yAxis.min,
      yaxisLabelsOffsety: 45,
      gutterLeft: gutterLeft,
      gutterBottom,
      tickmarksStyle: 'circle',
      tickmarks: 'circle',
      tickmarksSize: 5,
      colorsDefault: "gray",
      lineColors: ['#22c55e', '#3b82f6', '#ef4444'],
      'tooltips.css.class': 'tooltips-goal-history',
      backgroundHbars: hBars,
      textColor: '#ccc'
    };

    if (xAxis.labels) {
      options.labels = xAxis.labels;
    }
    if (yAxis.labels) {
      options['ylabels.specific'] = yAxis.labels;
    }
    if (tooltipOptions.cssClass) {
      options['tooltips.css.class'] = tooltipOptions.cssClass;
    }
    if (overWriteGraphOptions) {
      options = Object.assign({}, options, overWriteGraphOptions);
    }

    try {
      var scatter = new window.RGraph.Scatter({
        id: canvasID,
        data: historyData,
        options
      });

      scatter.draw();
      return scatter;
    } catch (error) {
      console.error('Error drawing RGraph chart:', error);
      return null;
    }
  },

  generateLabelsForDate: function(startDate: any, endDate: any, maxNumberOfLabels = 6) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const labels = [];
    
    const diffMonths = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30);
    
    for (let i = 0; i <= Math.min(diffMonths, maxNumberOfLabels); i++) {
      const date = new Date(start.getTime() + (i * 30 * 24 * 60 * 60 * 1000));
      const month = date.getMonth() + 1;
      const year = date.getFullYear().toString().slice(-2);
      labels.push(`${month.toString().padStart(2, '0')}/${year}`);
    }
    
    return labels;
  }
};

// Função para calcular métricas baseadas no peso usando o serviço padronizado
const calculateMetrics = (peso: number, altura: number = 170, idade: number = 30, sexo: 'masculino' | 'feminino' = 'masculino'): BodyMetrics => {
  // Usar dados padrão para cálculos aproximados
  const physicalData = { altura_cm: altura, idade, sexo };
  const bodyMeasurement = { peso_kg: peso };
  
  // Calcular usando o serviço centralizado
  const metrics = BodyMetricsCalculator.calculateMetrics(bodyMeasurement, physicalData, true);
  
  // Converter para o formato esperado pelo componente
  const massaGorda = metrics.gordura_corporal_percent || 20;
  const massaMagra = 100 - massaGorda;
  const massaMuscular = (metrics.massa_muscular_kg || peso * 0.3) / peso * 100; // Converter para %
  const hidratacao = Math.max(1.5, 4.0 - (massaGorda / 100) * 1.5);
  const aguaIntracelular = Math.max(45, 65 - (massaGorda / 100) * 15);
  const aguaExtracelular = 100 - aguaIntracelular;
  const anguloFase = Math.max(4, 9 - (massaGorda / 100) * 3);
  const idadeCelular = metrics.idade_metabolica || Math.min(80, 25 + (massaGorda / 100) * 30);
  const tmb = metrics.metabolismo_basal_kcal || 1500;
  const rcest = Math.max(0.4, Math.min(0.8, 0.45 + (massaGorda / 100) * 0.3));
  
  return {
    peso,
    imc: metrics.imc,
    massaGorda,
    massaMagra,
    massaMuscular,
    hidratacao,
    aguaIntracelular,
    aguaExtracelular,
    anguloFase,
    idadeCelular,
    tmb,
    rcest
  };
};

const BodyAnalysisCharts: React.FC = () => {
  const { measurements, loading } = useWeightMeasurement();
  const [useSampleData, setUseSampleData] = useState(false);
  const [rgraphLoaded, setRgraphLoaded] = useState(false);
  
  // Refs para os canvas dos gráficos combinados
  const composicaoCorporalRef = useRef<HTMLCanvasElement>(null);
  const hidratacaoRef = useRef<HTMLCanvasElement>(null);
  const saudeCelularRef = useRef<HTMLCanvasElement>(null);
  const metricasRef = useRef<HTMLCanvasElement>(null);

  // Determinar dados a usar
  const dataToUse = useSampleData || measurements.length === 0 ? sampleData : measurements;
  const currentMeasurement = dataToUse[0];

  useEffect(() => {
    // Carregar scripts RGraph
    const loadRGraph = async () => {
      if (window.RGraph) {
        setRgraphLoaded(true);
        return;
      }

      try {
        const script = document.createElement('script');
        script.src = '/rgraph/RGraph.common.core.js';
        script.onload = () => {
          console.log('RGraph carregado com sucesso');
          setRgraphLoaded(true);
        };
        script.onerror = () => {
          console.log('Erro ao carregar RGraph, usando fallback');
          setRgraphLoaded(false);
        };
        document.head.appendChild(script);
      } catch (error) {
        console.log('Erro ao carregar RGraph:', error);
        setRgraphLoaded(false);
      }
    };

    loadRGraph();
  }, []);

  useEffect(() => {
    if (!currentMeasurement) return;

    const currentWeight = currentMeasurement.peso_kg;
    const metrics = calculateMetrics(currentWeight);

    if (!rgraphLoaded) {
      // Fallback sem RGraph - mostrar dados em cards
      return;
    }

    try {
      // 1. GRÁFICO DE COMPOSIÇÃO CORPORAL (Gauge)
      if (composicaoCorporalRef.current) {
        const composicaoGauge = new window.RGraph.Gauge({
          id: composicaoCorporalRef.current,
          min: 0,
          max: 100,
          value: metrics.massaGorda,
          options: {
            title: `Composição Corporal (${currentWeight}kg)`,
            titleColor: '#ffffff',
            titleSize: 16,
            backgroundFill: '#000000',
            colors: {
              ranges: [
                [0, 20, '#22c55e'],    // Baixo
                [20, 30, '#eab308'],   // Moderado
                [30, 100, '#ef4444']   // Alto
              ]
            },
            needleColor: '#ffffff',
            centerpin: true,
            centerpinColor: '#ffffff',
            shadow: true,
            shadowOffsetx: 3,
            shadowOffsety: 3,
            shadowBlur: 6,
            shadowColor: 'rgba(0,0,0,0.3)',
            textSize: 12,
            textColor: '#ffffff',
            scaleDecimals: 1,
            marginTop: 40,
            marginBottom: 40,
            labels: {
              specific: [
                [10, 'Ideal'],
                [25, 'Normal'],
                [35, 'Alto'],
                [45, 'Crítico']
              ]
            },
            labelsColor: '#ffffff',
            centerLabel: `${metrics.massaGorda.toFixed(1)}%\nGordura`,
            centerLabelColor: '#ffffff',
            centerLabelSize: 14
          }
        }).draw();
      }

      // 2. ANÁLISE DE HIDRATAÇÃO (Gauge)
      if (hidratacaoRef.current) {
        const hidratacaoGauge = new window.RGraph.Gauge({
          id: hidratacaoRef.current,
          min: 1.4,
          max: 4.5,
          value: metrics.hidratacao,
          options: {
            title: 'Hidratação Total',
            titleColor: '#ffffff',
            titleSize: 16,
            backgroundFill: '#000000',
            colors: {
              ranges: [
                [1.4, 2.5, '#ef4444'],
                [2.5, 3.5, '#eab308'],
                [3.5, 4.5, '#22c55e']
              ]
            },
            needleColor: '#06b6d4',
            centerpin: true,
            centerpinColor: '#06b6d4',
            shadow: true,
            shadowOffsetx: 3,
            shadowOffsety: 3,
            shadowBlur: 6,
            shadowColor: 'rgba(0,0,0,0.3)',
            textSize: 12,
            textColor: '#ffffff',
            scaleDecimals: 1,
            marginTop: 40,
            marginBottom: 40,
            labels: {
              specific: [
                [1.5, 'Baixo'],
                [2.5, 'Normal'],
                [3.5, 'Ideal'],
                [4.0, 'Alto']
              ]
            },
            labelsColor: '#ffffff',
            centerLabel: `${metrics.hidratacao.toFixed(1)}L\nÁgua`,
            centerLabelColor: '#ffffff',
            centerLabelSize: 14
          }
        }).draw();
      }

      // 3. SAÚDE CELULAR (Gauge)
      if (saudeCelularRef.current) {
        const anguloGauge = new window.RGraph.Gauge({
          id: saudeCelularRef.current,
          min: 4,
          max: 9,
          value: metrics.anguloFase,
          options: {
            title: 'Saúde Celular',
            titleColor: '#ffffff',
            titleSize: 16,
            backgroundFill: '#000000',
            colors: {
              ranges: [
                [4, 6, '#ef4444'],
                [6, 7.5, '#eab308'],
                [7.5, 9, '#22c55e']
              ]
            },
            needleColor: '#8b5cf6',
            centerpin: true,
            centerpinColor: '#8b5cf6',
            shadow: true,
            shadowOffsetx: 3,
            shadowOffsety: 3,
            shadowBlur: 6,
            shadowColor: 'rgba(0,0,0,0.3)',
            textSize: 12,
            textColor: '#ffffff',
            scaleDecimals: 1,
            marginTop: 40,
            marginBottom: 40,
            labels: {
              specific: [
                [4.5, 'Crítico'],
                [6, 'Atenção'],
                [7.5, 'Bom'],
                [8.5, 'Excelente']
              ]
            },
            labelsColor: '#ffffff',
            centerLabel: `${metrics.anguloFase.toFixed(1)}°\nÂngulo de Fase`,
            centerLabelColor: '#ffffff',
            centerLabelSize: 14
          }
        }).draw();
      }

      // 4. INDICADORES DE SAÚDE (Barras)
      if (metricasRef.current) {
        const barChart = new window.RGraph.Bar({
          id: metricasRef.current,
          data: [metrics.imc, metrics.tmb / 100, metrics.rcest * 100],
          options: {
            title: 'Indicadores de Saúde',
            titleColor: '#ffffff',
            titleSize: 16,
            backgroundFill: '#000000',
            colors: [
              metrics.imc < 18.5 ? '#3b82f6' : metrics.imc < 25 ? '#22c55e' : metrics.imc < 30 ? '#eab308' : '#ef4444',
              '#f97316',
              metrics.rcest < 0.5 ? '#22c55e' : metrics.rcest < 0.6 ? '#eab308' : '#ef4444'
            ],
            shadow: true,
            shadowOffsetx: 2,
            shadowOffsety: 2,
            shadowBlur: 3,
            shadowColor: 'rgba(0,0,0,0.3)',
            xaxisLabels: ['IMC', 'TMB/100', 'RCEst%'],
            xaxisLabelsColor: '#ffffff',
            xaxisColor: '#ffffff',
            yaxisColor: '#ffffff',
            textColor: '#ffffff',
            textSize: 12,
            marginLeft: 50,
            marginRight: 50,
            marginTop: 50,
            marginBottom: 80,
            tooltips: [
              `IMC: ${metrics.imc.toFixed(1)} (Normal: 18.5-24.9)`,
              `TMB: ${metrics.tmb.toFixed(0)} kcal/dia`,
              `RCEst: ${(metrics.rcest * 100).toFixed(1)}% (Ideal: <50%)`
            ]
          }
        }).draw();
      }

    } catch (error) {
      console.error('Erro ao criar gráficos RGraph:', error);
      setRgraphLoaded(false);
    }
  }, [currentMeasurement, rgraphLoaded]);

  if (loading) {
    return (
      <div className="bg-black min-h-screen p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-800 rounded-lg p-6 animate-pulse h-80">
              <div className="h-full bg-gray-700 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!currentMeasurement) {
    return (
      <div className="bg-black min-h-screen p-8 flex items-center justify-center">
        <div className="text-center text-white">
          <Scale className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma medição encontrada</h3>
          <p className="text-gray-400 mb-4">Faça sua primeira pesagem para ver a análise corporal completa.</p>
          <Button 
            onClick={() => setUseSampleData(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Ver Demonstração
          </Button>
        </div>
      </div>
    );
  }

  const currentWeight = currentMeasurement.peso_kg;
  const metrics = calculateMetrics(currentWeight);

  // Fallback sem RGraph - mostrar cards com dados
  if (!rgraphLoaded) {
    return (
      <div className="bg-black min-h-screen p-6">
        {/* Header */}
        <div className="text-center py-8 border-b border-gray-800">
          <h2 className="text-4xl font-bold text-white mb-2">
            Análise Corporal Integrada
          </h2>
          <p className="text-gray-400 text-lg">
            Peso atual: {currentWeight}kg • IMC: {metrics.imc.toFixed(1)} • Última medição
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Dados de composição corporal baseados em suas medições
          </p>
          {useSampleData && (
            <Badge variant="outline" className="mt-2 text-yellow-400 border-yellow-400">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Dados de Demonstração
            </Badge>
          )}
        </div>

        {/* Cards de métricas */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">{currentWeight}kg</div>
                <div className="text-sm text-gray-400">Peso Atual</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-2">{metrics.massaMuscular.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Massa Muscular</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">{metrics.hidratacao.toFixed(1)}</div>
                <div className="text-sm text-gray-400">Hidratação</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-400 mb-2">{metrics.anguloFase.toFixed(1)}°</div>
                <div className="text-sm text-gray-400">Ângulo de Fase</div>
              </CardContent>
            </Card>
          </div>

          {/* Métricas detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Composição Corporal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Gordura Corporal</span>
                  <span className="text-white font-semibold">{metrics.massaGorda.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.massaGorda < 20 ? 'bg-green-500' : 
                      metrics.massaGorda < 30 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(metrics.massaGorda, 100)}%` }}
                  />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Massa Magra</span>
                  <span className="text-white font-semibold">{metrics.massaMagra.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${metrics.massaMagra}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Metabolismo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Taxa Metabólica Basal</span>
                  <span className="text-white font-semibold">{metrics.tmb.toFixed(0)} kcal/dia</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Idade Metabólica</span>
                  <span className="text-white font-semibold">{metrics.idadeCelular.toFixed(0)} anos</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">IMC</span>
                  <span className="text-white font-semibold">{metrics.imc.toFixed(1)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              Resumo Executivo
            </h3>
            
            <div className="flex flex-wrap gap-4">
              {metrics.massaGorda > 35 && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-red-400">⚠️</span>
                  <span className="text-red-300 text-sm">Percentual de gordura elevado</span>
                </div>
              )}
              {metrics.hidratacao < 2.5 && (
                <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-blue-400">💧</span>
                  <span className="text-blue-300 text-sm">Hidratação baixa</span>
                </div>
              )}
              {metrics.anguloFase < 6 && (
                <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3 flex items-center gap-2">
                  <span className="text-orange-400">🔋</span>
                  <span className="text-orange-300 text-sm">Saúde celular necessita atenção</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <div className="text-center py-8 border-b border-gray-800">
        <h2 className="text-4xl font-bold text-white mb-2">
          Análise Corporal Integrada
        </h2>
        <p className="text-gray-400 text-lg">
          Peso atual: {currentWeight}kg • IMC: {metrics.imc.toFixed(1)} • Última medição
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Gráficos combinados para melhor visualização e análise
        </p>
        {useSampleData && (
          <Badge variant="outline" className="mt-2 text-yellow-400 border-yellow-400">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Dados de Demonstração
          </Badge>
        )}
      </div>

      {/* Grid de gráficos combinados */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* 1. Composição Corporal (3 em 1) */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-96">
            <canvas 
              ref={composicaoCorporalRef} 
              width="400" 
              height="320"
              className="w-full h-full"
            />
          </div>

          {/* 2. Análise de Hidratação (2 em 1) */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-96">
            <canvas 
              ref={hidratacaoRef} 
              width="400" 
              height="320"
              className="w-full h-full"
            />
          </div>

          {/* 3. Saúde Celular (2 em 1) */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-96">
            <canvas 
              ref={saudeCelularRef} 
              width="400" 
              height="320"
              className="w-full h-full"
            />
          </div>

          {/* 4. Indicadores de Saúde (3 em 1) */}
          <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 h-96">
            <canvas 
              ref={metricasRef} 
              width="400" 
              height="320"
              className="w-full h-full"
            />
          </div>
        </div>

        {/* Resumo rápido */}
        <div className="mt-8 bg-gray-900 border border-gray-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            Resumo Executivo
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-yellow-400">{currentWeight}kg</div>
              <div className="text-sm text-gray-400">Peso Atual</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{metrics.massaMuscular.toFixed(1)}%</div>
              <div className="text-sm text-gray-400">Massa Muscular</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{metrics.hidratacao.toFixed(1)}</div>
              <div className="text-sm text-gray-400">Hidratação</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-400">{metrics.anguloFase.toFixed(1)}°</div>
              <div className="text-sm text-gray-400">Ângulo de Fase</div>
            </div>
          </div>
          
          {/* Alertas importantes */}
          <div className="mt-6 flex flex-wrap gap-4">
            {metrics.massaGorda > 35 && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex items-center gap-2">
                <span className="text-red-400">⚠️</span>
                <span className="text-red-300 text-sm">Percentual de gordura elevado</span>
              </div>
            )}
            {metrics.hidratacao < 2.5 && (
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-3 flex items-center gap-2">
                <span className="text-blue-400">💧</span>
                <span className="text-blue-300 text-sm">Hidratação baixa</span>
              </div>
            )}
            {metrics.anguloFase < 6 && (
              <div className="bg-orange-900/30 border border-orange-700 rounded-lg p-3 flex items-center gap-2">
                <span className="text-orange-400">🔋</span>
                <span className="text-orange-300 text-sm">Saúde celular necessita atenção</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BodyAnalysisCharts;