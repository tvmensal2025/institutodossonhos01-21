import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';
import { Badge } from '@/components/ui/badge';

// Declare global for RGraph
declare global {
  interface Window {
    RGraph: any;
  }
}

interface PatientData {
  name: string;
  evaluatedBy: string;
  birthDate: string;
  measurementDate: string;
  weight: number;
  height: number;
  bodyFat: number;
  muscleMass: number;
  waterTotal: number;
  waterTotalPercent: number;
  waterIntracellular: number;
  waterIntracellularPercent: number;
  waterExtracellular: number;
  waterExtracellularPercent: number;
  hydrationIndex: number;
  waterInLeanMass: number;
  leanMass: number;
  leanMassPercent: number;
  bmr: number;
  phaseAngle: number;
  cellularAge: number;
  bmi: number;
  age: number;
  muscleToFatRatio: number;
}

const SessionDashboardPage: React.FC = () => {
  // Refs para os gráficos
  const bodyFatRef = useRef<HTMLCanvasElement>(null);
  const hydrationRef = useRef<HTMLCanvasElement>(null);
  const waterBalanceRef = useRef<HTMLCanvasElement>(null);
  const leanMassRef = useRef<HTMLCanvasElement>(null);
  const phaseAngleRef = useRef<HTMLCanvasElement>(null);
  const cellularAgeRef = useRef<HTMLCanvasElement>(null);

  // Dados do paciente baseados na imagem
  const patientData: PatientData = {
    name: 'Rafael Ferreira Dias',
    evaluatedBy: 'Edmundo rowei',
    birthDate: '20/09/1973',
    measurementDate: '31/07/2025 às 13:08',
    weight: 107.0,
    height: 179,
    bodyFat: 36.7,
    muscleMass: 30.1,
    waterTotal: 48.3,
    waterTotalPercent: 45.2,
    waterIntracellular: 27.8,
    waterIntracellularPercent: 57.5,
    waterExtracellular: 20.5,
    waterExtracellularPercent: 42.5,
    hydrationIndex: 3.5,
    waterInLeanMass: 71.3,
    leanMass: 39.3,
    leanMassPercent: 63.3,
    bmr: 1906,
    phaseAngle: 6.1,
    cellularAge: 57,
    bmi: 33.4,
    age: 51,
    muscleToFatRatio: 0.8
  };

  // Carrega RGraph
  useEffect(() => {
    const loadRGraph = () => {
      if (window.RGraph) return;
      
      const script = document.createElement('script');
      script.src = '/rgraph/RGraph.common.core.js';
      script.onload = () => {
        // Carrega outros arquivos RGraph necessários
        const gaugeScript = document.createElement('script');
        gaugeScript.src = 'https://www.rgraph.net/libraries/RGraph.gauge.js';
        document.head.appendChild(gaugeScript);
      };
      document.head.appendChild(script);
    };

    loadRGraph();
  }, []);

  // Cria os gráficos quando RGraph estiver carregado
  useEffect(() => {
    if (!window.RGraph) return;

    const createGaugeChart = (
      canvasRef: React.RefObject<HTMLCanvasElement>,
      value: number,
      max: number,
      title: string,
      colors: string[],
      ranges?: [number, number, string][]
    ) => {
      if (!canvasRef.current) return;

      const gauge = new window.RGraph.Gauge({
        id: canvasRef.current,
        min: 0,
        max: max,
        value: value,
        options: {
          title: title,
          titleColor: '#ffffff',
          titleSize: 14,
          titleBold: true,
          backgroundFill: 'transparent',
          colors: ranges ? { ranges: ranges } : colors,
          needleColor: '#ffffff',
          needleWidth: 3,
          centerpin: true,
          centerpinColor: '#ffffff',
          centerpinRadius: 8,
          shadow: false,
          textSize: 10,
          textColor: '#ffffff',
          scaleDecimals: 1,
          marginTop: 20,
          marginBottom: 20,
          marginLeft: 20,
          marginRight: 20,
          labelsColor: '#ffffff',
          centerLabel: value.toFixed(1),
          centerLabelColor: '#ffffff',
          centerLabelSize: 16,
          centerLabelBold: true,
          angleStart: Math.PI * 1.25,
          angleEnd: Math.PI * 0.25
        }
      });

      gauge.draw();
    };

    // Timeout para garantir que o canvas esteja renderizado
    setTimeout(() => {
      // Gráfico de Gordura Corporal
      createGaugeChart(
        bodyFatRef,
        patientData.bodyFat,
        50,
        '',
        [],
        [
          [0, 15, '#22c55e'],
          [15, 25, '#84cc16'],
          [25, 35, '#f59e0b'],
          [35, 50, '#ef4444']
        ]
      );

      // Gráfico de Hidratação
      createGaugeChart(
        hydrationRef,
        patientData.hydrationIndex,
        8,
        '',
        [],
        [
          [0, 2, '#ef4444'],
          [2, 4, '#f59e0b'],
          [4, 6, '#84cc16'],
          [6, 8, '#22c55e']
        ]
      );

      // Gráfico de Razão Músculo/Gordura
      createGaugeChart(
        leanMassRef,
        patientData.muscleToFatRatio,
        2,
        '',
        [],
        [
          [0, 0.5, '#ef4444'],
          [0.5, 1, '#f59e0b'],
          [1, 1.5, '#84cc16'],
          [1.5, 2, '#22c55e']
        ]
      );

      // Gráfico de Ângulo de Fase
      createGaugeChart(
        phaseAngleRef,
        patientData.phaseAngle,
        12,
        '',
        [],
        [
          [0, 4, '#ef4444'],
          [4, 6, '#f59e0b'],
          [6, 8, '#84cc16'],
          [8, 12, '#22c55e']
        ]
      );
    }, 500);
  }, [patientData]);

  const BodySilhouette = ({ className, color = '#ef4444' }: { className?: string; color?: string }) => (
    <svg className={className} viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50 10 C45 10 40 15 40 25 C40 30 42 35 45 40 L45 60 C42 65 40 70 40 80 L40 120 C40 125 42 130 45 130 L45 140 C45 145 48 150 50 150 C52 150 55 145 55 140 L55 130 C58 130 60 125 60 120 L60 80 C60 70 58 65 55 60 L55 40 C58 35 60 30 60 25 C60 15 55 10 50 10 Z"
        fill={color}
        stroke="#ffffff"
        strokeWidth="1"
      />
    </svg>
  );

  const CircularProgress = ({ 
    value, 
    max, 
    size = 120, 
    strokeWidth = 8, 
    color = '#3b82f6',
    backgroundColor = '#374151',
    showValue = true,
    unit = '%',
    label = ''
  }: {
    value: number;
    max: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showValue?: boolean;
    unit?: string;
    label?: string;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const percentage = (value / max) * 100;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="relative flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={backgroundColor}
            strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <span className="text-2xl font-bold">{value.toFixed(1)}</span>
            <span className="text-xs opacity-75">{unit}</span>
            {label && <span className="text-xs opacity-75 mt-1">{label}</span>}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header Profissional */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {patientData.name}
            </h1>
            <div className="flex items-center gap-6 mt-2 text-sm text-gray-400">
              <span>📧 Avaliador: {patientData.evaluatedBy}</span>
              <span>📅 Data de nascimento: {patientData.birthDate}</span>
              <span>🗓️ {patientData.measurementDate}</span>
            </div>
            <div className="flex items-center gap-6 mt-1 text-sm text-gray-300">
              <span>⚖️ Peso: {patientData.weight} kg</span>
              <span>📏 Altura: {patientData.height} cm</span>
              <span>📊 IMC: {patientData.bmi} kg/m²</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <img src="/images/dr-vital.png" alt="Logo" className="h-12 w-12" />
            <div className="text-right">
              <div className="text-sm font-semibold">b.i.a</div>
              <div className="text-xs text-gray-400">TeraScience</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Principal */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* SEÇÃO 1: GORDURA */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-white">Gordura</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <CircularProgress
                  value={patientData.bodyFat}
                  max={50}
                  size={140}
                  strokeWidth={12}
                  color="#ef4444"
                  unit="%"
                />
              </div>
              
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Massa Gorda</div>
                <div className="text-2xl font-bold">{patientData.leanMass} <span className="text-sm">kg</span></div>
                <div className="text-sm text-gray-400">% Gordura</div>
                <div className="text-lg font-semibold text-red-400">{patientData.bodyFat}%</div>
              </div>

              <div className="flex items-center justify-center mt-4">
                <BodySilhouette className="h-16 w-16" color="#ef4444" />
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full">
                🎯 Target
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 2: HIDRATAÇÃO */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-white">🌊 Hidratação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <CircularProgress
                  value={patientData.hydrationIndex}
                  max={8}
                  size={140}
                  strokeWidth={12}
                  color="#22c55e"
                  unit=""
                />
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400">{patientData.hydrationIndex}</div>
                <div className="text-sm text-gray-400">Índice de hidratação</div>
              </div>

              <div className="grid grid-cols-1 gap-3 w-full text-sm">
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <div className="text-gray-400">Água Corporal Total</div>
                  <div className="font-bold">{patientData.waterTotal} <span className="text-xs">litros</span> / {patientData.waterTotalPercent} <span className="text-xs">%</span></div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <div className="text-gray-400">Índice de hidratação</div>
                  <div className="font-bold">{patientData.hydrationIndex} <span className="text-xs">cm/ohms x 10</span></div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <div className="text-gray-400">Água na Massa Magra</div>
                  <div className="font-bold">{patientData.waterInLeanMass}%</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 3: ÁGUA INTRA E EXTRA CELULAR */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-white">Água Intra e Extra Celular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              
              {/* Água Intracelular */}
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Intracelular</div>
                <CircularProgress
                  value={patientData.waterIntracellular}
                  max={40}
                  size={120}
                  strokeWidth={10}
                  color="#3b82f6"
                  unit="litros"
                />
                <div className="mt-2">
                  <div className="text-2xl font-bold text-yellow-400">{patientData.waterIntracellularPercent}%</div>
                  <div className="text-sm text-gray-400">Água Intracelular %</div>
                  <div className="font-bold">{patientData.waterIntracellular} litros</div>
                </div>
              </div>

              <div className="w-full h-px bg-gray-600"></div>

              {/* Água Extracelular */}
              <div className="text-center">
                <div className="text-sm text-gray-400 mb-2">Extracelular</div>
                <div className="flex items-center justify-center">
                  <BodySilhouette className="h-12 w-12" color="#22c55e" />
                  <div className="ml-4 text-left">
                    <div className="text-lg font-bold">{patientData.waterExtracellular} litros</div>
                    <div className="text-sm text-gray-400">{patientData.waterExtracellularPercent}%</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 4: MASSA MAGRA E MUSCULAR */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-white">Massa Magra e Muscular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <CircularProgress
                  value={patientData.muscleToFatRatio}
                  max={2}
                  size={140}
                  strokeWidth={12}
                  color="#f59e0b"
                  unit=""
                />
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-400">{patientData.muscleToFatRatio}</div>
                <div className="text-sm text-gray-400">Razão Músculo/Gordura</div>
              </div>

              <div className="grid grid-cols-1 gap-3 w-full text-sm">
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <div className="text-gray-400">Massa Magra</div>
                  <div className="font-bold">{patientData.leanMass} kg / {patientData.leanMassPercent}%</div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <div className="text-gray-400">Razão Músculo Gordura</div>
                  <div className="font-bold">{patientData.muscleToFatRatio} kg músculo / kg gordura</div>
                </div>
                <div className="bg-gray-800/50 p-3 rounded-lg text-center">
                  <div className="text-gray-400">Massa Muscular</div>
                  <div className="font-bold">{patientData.muscleMass} kg / 28,2%</div>
                </div>
              </div>

              <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full">
                ⚡ Vitality
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 5: PESO, ALTURA E TMB */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-white">Peso, Altura e TMB</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-6">
              
              {/* Silhueta com medidas */}
              <div className="relative">
                <BodySilhouette className="h-32 w-24" color="#6b7280" />
                
                {/* Indicadores de medidas */}
                <div className="absolute -top-2 -right-8">
                  <Badge variant="secondary" className="bg-gray-700 text-white text-xs">
                    {patientData.height} cm
                  </Badge>
                </div>
                <div className="absolute top-8 -left-12">
                  <Badge variant="secondary" className="bg-gray-700 text-white text-xs">
                    124,0 cm
                  </Badge>
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                  <Badge variant="secondary" className="bg-gray-700 text-white text-xs">
                    {patientData.weight} kg
                  </Badge>
                </div>
              </div>

              {/* Grid de dados */}
              <div className="grid grid-cols-2 gap-4 w-full">
                <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-400">IMC</div>
                  <div className="text-2xl font-bold">{patientData.bmi}</div>
                  <div className="text-xs text-gray-500">kg/m²</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-400">Idade</div>
                  <div className="text-2xl font-bold">{patientData.age}</div>
                  <div className="text-xs text-gray-500">anos</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-400">Taxa Metabólica Basal</div>
                  <div className="text-xl font-bold">{patientData.bmr}</div>
                  <div className="text-xs text-gray-500">kcal/24h</div>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg text-center">
                  <div className="text-sm text-gray-400">Ângulo de Fase</div>
                  <div className="text-xl font-bold">{patientData.phaseAngle}</div>
                  <div className="text-xs text-gray-500">graus</div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex gap-3">
                <Button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm">
                  ⚠️ Risco
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-full text-sm">
                  ❤️ Sintomas
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* SEÇÃO 6: ANÁLISE CELULAR */}
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl font-bold text-white">Análise Celular</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <CircularProgress
                  value={patientData.phaseAngle}
                  max={12}
                  size={140}
                  strokeWidth={12}
                  color="#facc15"
                  unit="°"
                />
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-yellow-400">{patientData.phaseAngle}°</div>
                <div className="text-sm text-gray-400">Ângulo de Fase</div>
              </div>

              <div className="flex flex-col items-center space-y-4 mt-6">
                <BodySilhouette className="h-16 w-12" color="#facc15" />
                
                <div className="grid grid-cols-1 gap-3 w-full text-center">
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Idade</div>
                    <div className="text-xl font-bold">{patientData.age} anos</div>
                  </div>
                  <div className="bg-gray-800/50 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">🏥 Idade Celular</div>
                    <div className="text-xl font-bold text-yellow-400">{patientData.cellularAge} anos</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Profissional */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 p-4 text-center text-gray-400 text-sm">
        <p className="mb-1">🔬 Dashboard de Análise Corporal por Bioimpedância | Instituto dos Sonhos</p>
        <p>📊 Relatório gerado automaticamente com base nos dados mais recentes do paciente</p>
      </div>
    </div>
  );
};

export default SessionDashboardPage;