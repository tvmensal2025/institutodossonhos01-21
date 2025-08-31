import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { Activity, TrendingUp, Scale } from 'lucide-react';

declare global {
  interface Window {
    RGraph: any;
  }
}

const RGraphWeightCharts: React.FC = () => {
  const { measurements, loading, stats } = useWeightMeasurement();
  const lineChartRef = useRef<HTMLCanvasElement>(null);
  const barChartRef = useRef<HTMLCanvasElement>(null);
  const gaugeChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Load RGraph scripts
    const loadRGraph = async () => {
      if (window.RGraph) return;

      const scripts = [
        '/rgraph/RGraph.common.core.js',
        '/rgraph/RGraph.common.dynamic.js',
        '/rgraph/RGraph.common.tooltips.js',
        '/rgraph/RGraph.line.js',
        '/rgraph/RGraph.bar.js',
        '/rgraph/RGraph.gauge.js'
      ];

      for (const src of scripts) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = src;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }
    };

    loadRGraph().catch(() => {
      console.log('RGraph não encontrado, usando fallback');
    });
  }, []);

  useEffect(() => {
    if (!window.RGraph || !measurements.length || loading) return;

    try {
      // Prepare data for charts
      const weightData = measurements.slice(-10).reverse().map(m => m.peso_kg);
      const imcData = measurements.slice(-10).reverse().map(m => m.imc || 0);
      const dates = measurements.slice(-10).reverse().map(m => 
        new Date(m.measurement_date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
      );

      // Line Chart - Weight Evolution
      if (lineChartRef.current) {
        const lineChart = new window.RGraph.Line({
          id: lineChartRef.current,
          data: weightData,
          options: {
            title: 'Evolução do Peso (kg)',
            titleSize: 16,
            titleColor: 'hsl(var(--primary))',
            linewidth: 3,
            colors: ['hsl(var(--primary))'],
            backgroundGridColor: 'rgba(0,0,0,0.1)',
            xaxisLabels: dates,
            xaxisLabelsAngle: 45,
            marginLeft: 50,
            marginRight: 20,
            marginTop: 50,
            marginBottom: 80,
            textSize: 10,
            shadow: true,
            shadowOffsetx: 2,
            shadowOffsety: 2,
            shadowBlur: 3,
            shadowColor: 'rgba(0,0,0,0.3)',
            spline: true,
            tickmarksStyle: 'circle',
            tickmarksSize: 4,
            tickmarksFill: 'hsl(var(--primary))',
            tooltips: weightData.map((weight, i) => `${dates[i]}: ${weight}kg`),
            tooltipsEffect: 'fade'
          }
        }).draw();
      }

      // Bar Chart - IMC Evolution
      if (barChartRef.current) {
        const barChart = new window.RGraph.Bar({
          id: barChartRef.current,
          data: imcData,
          options: {
            title: 'Evolução do IMC',
            titleSize: 16,
            titleColor: 'hsl(var(--primary))',
            colors: ['hsl(var(--chart-2))'],
            backgroundGridColor: 'rgba(0,0,0,0.1)',
            xaxisLabels: dates,
            xaxisLabelsAngle: 45,
            marginLeft: 50,
            marginRight: 20,
            marginTop: 50,
            marginBottom: 80,
            textSize: 10,
            shadow: true,
            shadowOffsetx: 2,
            shadowOffsety: 2,
            shadowBlur: 3,
            shadowColor: 'rgba(0,0,0,0.3)',
            tooltips: imcData.map((imc, i) => `${dates[i]}: IMC ${imc.toFixed(1)}`),
            tooltipsEffect: 'fade',
            strokestyle: 'transparent'
          }
        }).draw();
      }

      // Gauge Chart - Current Weight
      if (gaugeChartRef.current && measurements[0]) {
        const currentWeight = measurements[0].peso_kg;
        const minWeight = Math.min(...weightData) - 5;
        const maxWeight = Math.max(...weightData) + 5;
        
        const gaugeChart = new window.RGraph.Gauge({
          id: gaugeChartRef.current,
          min: minWeight,
          max: maxWeight,
          value: currentWeight,
          options: {
            title: `Peso Atual: ${currentWeight}kg`,
            titleSize: 16,
            titleColor: 'hsl(var(--primary))',
            marginTop: 30,
            marginBottom: 30,
            colors: {
              ranges: [
                [minWeight, maxWeight * 0.7, 'hsl(var(--chart-1))'],
                [maxWeight * 0.7, maxWeight * 0.9, 'hsl(var(--chart-2))'],
                [maxWeight * 0.9, maxWeight, 'hsl(var(--chart-3))']
              ]
            },
            needleColor: 'hsl(var(--primary))',
            textSize: 12,
            scaleDecimals: 1,
            centerpin: true,
            centerpinColor: 'hsl(var(--primary))',
            shadow: true,
            shadowOffsetx: 3,
            shadowOffsety: 3,
            shadowBlur: 6,
            shadowColor: 'rgba(0,0,0,0.3)'
          }
        }).draw();
      }

    } catch (error) {
      console.error('Erro ao criar gráficos RGraph:', error);
    }
  }, [measurements, loading]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-lg bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm animate-pulse">
            <CardContent className="p-6">
              <div className="h-64 bg-muted/20 rounded-lg"></div>
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
          <Scale className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Nenhuma medição encontrada</h3>
          <p className="text-muted-foreground">Faça sua primeira pesagem para ver os gráficos RGraph aqui.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header com Estatísticas */}
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

      {/* RGraph Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Line Chart - Weight Evolution */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              Evolução do Peso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <canvas 
              ref={lineChartRef} 
              width="400" 
              height="300"
              className="w-full h-auto max-w-full"
            />
          </CardContent>
        </Card>

        {/* Bar Chart - IMC Evolution */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Evolução do IMC
            </CardTitle>
          </CardHeader>
          <CardContent>
            <canvas 
              ref={barChartRef} 
              width="400" 
              height="300"
              className="w-full h-auto max-w-full"
            />
          </CardContent>
        </Card>

        {/* Gauge Chart - Current Weight */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Scale className="h-5 w-5 text-primary" />
              Peso Atual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <canvas 
              ref={gaugeChartRef} 
              width="400" 
              height="300"
              className="w-full h-auto max-w-full"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RGraphWeightCharts;