import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// Dados exatos extraídos do console da Galileu
const galileuData = {
  patient: {
    name: 'Rafael Ferreira Dias',
    evaluator: 'Edmundo roveri',
    birthDate: '20/09/1973',
    weight: 107,
    height: 179,
    evaluationDate: '31/07/2025 às 13:08'
  },
  bodyComposition: {
    // Gordura (fat-gauge-component)
    fat: {
      percentage: 36.7,
      massKg: 39.3,
      stdDevs: undefined // do console
    },
    
    // Massa Magra e Muscular (muscle-mass-component)  
    leanMass: {
      massKg: 67.7,
      percentage: 63.3,
      muscleMassKg: 30.1,
      muscleMassPercentage: 28.2,
      muscleToFatRatio: 0.8 // RazaoMusculoGordura do console
    },
    
    // Hidratação (indice_hidratacao)
    hydration: {
      totalWaterLiters: 48.3,
      totalWaterPercentage: 45.2,
      hydrationIndex: 3.5,
      waterInLeanMassPercentage: 71.3
    },
    
    // Água Intra/Extra Celular (ecw_icw)
    water: {
      intracellularLiters: 27.8,
      intracellularPercentage: 57.5,
      extracellularLiters: 20.5,
      extracellularPercentage: 42.5 // calculado
    },
    
    // Análise Celular (saudeCelular)
    cellular: {
      phaseAngle: 6.1,
      age: 51,
      cellularAge: 57
    },
    
    // Dados Básicos
    basic: {
      bmi: 33.4,
      age: 51,
      bmr: 1906,
      height: 179,
      weight: 107.0
    }
  }
};

const GalileuPrecisionPage: React.FC = () => {
  // Refs para canvas igual ao sistema Galileu
  const fatGaugeRef = useRef<HTMLCanvasElement>(null);
  const muscleMassRef = useRef<HTMLCanvasElement>(null);
  const hydrationRef = useRef<HTMLCanvasElement>(null);
  const waterBalanceRef = useRef<HTMLCanvasElement>(null);
  const cellularRef = useRef<HTMLCanvasElement>(null);
  
  // Componente RGraph Gauge (replicação exata)
  const RGraphGauge = ({ 
    canvasRef, 
    value, 
    maxValue, 
    title = '',
    colorRanges,
    size = 160
  }: {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    value: number;
    maxValue: number;
    title?: string;
    colorRanges: Array<[number, number, string]>;
    size?: number;
  }) => {
    useEffect(() => {
      if (!canvasRef.current) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Limpa canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Configurações do gauge (baseado no RGraph original)
      const centerX = canvas.width / 2;
      const centerY = canvas.height - 20;
      const radius = Math.min(centerX, centerY) - 20;
      const startAngle = Math.PI; // 180 graus
      const endAngle = 0; // 0 graus
      const sweepAngle = Math.PI; // 180 graus total
      
      // Desenha arco de fundo
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 12;
      ctx.stroke();
      
      // Desenha segmentos coloridos
      const segmentAngle = sweepAngle / colorRanges.length;
      colorRanges.forEach((range, index) => {
        const [min, max, color] = range;
        const segmentStart = startAngle - (index * segmentAngle);
        const segmentEnd = segmentStart - segmentAngle;
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, segmentStart, segmentEnd);
        ctx.strokeStyle = color;
        ctx.lineWidth = 12;
        ctx.stroke();
      });
      
      // Desenha ponteiro
      const percentage = Math.min(value / maxValue, 1);
      const needleAngle = startAngle - (percentage * sweepAngle);
      const needleLength = radius - 10;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(needleAngle) * needleLength,
        centerY + Math.sin(needleAngle) * needleLength
      );
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.stroke();
      
      // Centro do ponteiro
      ctx.beginPath();
      ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      
      // Valor no centro
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(value.toFixed(1), centerX, centerY - 30);
      
    }, [value, maxValue, colorRanges]);

    return (
      <canvas 
        ref={canvasRef} 
        width={size} 
        height={size} 
        className="bg-transparent"
      />
    );
  };

  // Silhueta humana exata da Galileu
  const GalileuSilhouette = ({ 
    color = '#ef4444', 
    size = 80 
  }: { 
    color?: string; 
    size?: number;
  }) => (
    <svg width={size} height={size * 1.5} viewBox="0 0 100 150">
      {/* Cabeça */}
      <circle cx="50" cy="20" r="12" fill={color} stroke="#ffffff" strokeWidth="1"/>
      {/* Pescoço */}
      <rect x="47" y="32" width="6" height="8" fill={color} stroke="#ffffff" strokeWidth="1"/>
      {/* Tronco */}
      <ellipse cx="50" cy="65" rx="20" ry="25" fill={color} stroke="#ffffff" strokeWidth="1"/>
      {/* Braços */}
      <ellipse cx="25" cy="55" rx="8" ry="25" fill={color} stroke="#ffffff" strokeWidth="1"/>
      <ellipse cx="75" cy="55" rx="8" ry="25" fill={color} stroke="#ffffff" strokeWidth="1"/>
      {/* Quadris */}
      <ellipse cx="50" cy="95" rx="18" ry="15" fill={color} stroke="#ffffff" strokeWidth="1"/>
      {/* Pernas */}
      <ellipse cx="42" cy="125" rx="10" ry="25" fill={color} stroke="#ffffff" strokeWidth="1"/>
      <ellipse cx="58" cy="125" rx="10" ry="25" fill={color} stroke="#ffffff" strokeWidth="1"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header exato da Galileu */}
      <div className="bg-black p-6">
        <div className="flex items-center justify-between">
          {/* Info do paciente (esquerda) */}
          <div className="text-sm text-gray-400 space-y-1 leading-tight">
            <div>Avaliado: {galileuData.patient.evaluator}</div>
            <div>Data de nascimento: {galileuData.patient.birthDate}</div>
            <div>Peso: {galileuData.patient.weight} kg Altura: {galileuData.patient.height} cm</div>
            <div>Avaliador: {galileuData.patient.name}</div>
            <div>{galileuData.patient.evaluationDate}</div>
            <div className="mt-2">
              <Button className="bg-green-600 text-white text-xs px-2 py-1 rounded">
                📊
              </Button>
            </div>
          </div>
          
          {/* Nome central */}
          <div className="text-center">
            <h1 className="text-3xl font-bold">{galileuData.patient.name}</h1>
            <div className="flex items-center justify-center gap-2 mt-2">
              <div className="w-6 h-6 bg-gray-600 rounded"></div>
              <div className="w-6 h-6 bg-gray-600 rounded"></div>
              <div className="w-6 h-6 bg-gray-600 rounded"></div>
            </div>
          </div>
          
          {/* Logo (direita) */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold">b.i.a</div>
              <div className="text-sm text-gray-400">TeraScience</div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout principal em grid 3x2 exato */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-3 gap-6 h-[80vh]">
          
          {/* COLUNA 1 */}
          <div className="space-y-6">
            
            {/* Seção Gordura */}
            <div className="bg-transparent">
              <h3 className="text-2xl font-bold mb-4 text-center">Gordura</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h5 className="text-sm font-normal mb-1">Massa Gorda</h5>
                  <h3 className="text-2xl font-bold">{galileuData.bodyComposition.fat.massKg} <span className="text-base font-normal">Kg</span></h3>
                </div>
                <div>
                  <h5 className="text-sm font-normal mb-1">% Gordura</h5>
                  <h3 className="text-2xl font-bold">{galileuData.bodyComposition.fat.percentage} <span className="text-base font-normal">%</span></h3>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <RGraphGauge
                  canvasRef={fatGaugeRef}
                  value={galileuData.bodyComposition.fat.percentage}
                  maxValue={50}
                  colorRanges={[
                    [0, 15, '#22c55e'],
                    [15, 25, '#84cc16'],
                    [25, 35, '#f59e0b'],
                    [35, 50, '#ef4444']
                  ]}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <GalileuSilhouette color="#ef4444" size={60} />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
                  🎯 Target
                </Button>
              </div>
            </div>
            
            {/* Seção Massa Magra e Muscular */}
            <div className="bg-transparent">
              <h3 className="text-2xl font-bold mb-4 text-center">Massa Magra e Muscular</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div>
                  <h5 className="font-normal mb-1">Massa Magra</h5>
                  <h3 className="text-lg font-bold">{galileuData.bodyComposition.leanMass.massKg} Kg / {galileuData.bodyComposition.leanMass.percentage} %</h3>
                </div>
                <div>
                  <h5 className="font-normal mb-1">Razão Músculo Gordura</h5>
                  <h3 className="text-lg font-bold">{galileuData.bodyComposition.leanMass.muscleToFatRatio} kg músculo / kg gordura</h3>
                </div>
                <div>
                  <h5 className="font-normal mb-1">Massa Muscular</h5>
                  <h3 className="text-lg font-bold">{galileuData.bodyComposition.leanMass.muscleMassKg} Kg / {galileuData.bodyComposition.leanMass.muscleMassPercentage} %</h3>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <RGraphGauge
                  canvasRef={muscleMassRef}
                  value={galileuData.bodyComposition.leanMass.muscleToFatRatio}
                  maxValue={2}
                  colorRanges={[
                    [0, 0.5, '#ef4444'],
                    [0.5, 1, '#f59e0b'],
                    [1, 1.5, '#84cc16'],
                    [1.5, 2, '#22c55e']
                  ]}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <GalileuSilhouette color="#ef4444" size={60} />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
                  ⚡ Vitality
                </Button>
              </div>
            </div>
          </div>

          {/* COLUNA 2 */}
          <div className="space-y-6">
            
            {/* Seção Hidratação */}
            <div className="bg-transparent">
              <h3 className="text-2xl font-bold mb-4 text-center">
                <span className="mr-2">🌊</span>Hidratação
              </h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div>
                  <h5 className="font-normal mb-1">Água Corporal Total</h5>
                  <h3 className="text-lg font-bold">{galileuData.bodyComposition.hydration.totalWaterLiters} litros / {galileuData.bodyComposition.hydration.totalWaterPercentage} %</h3>
                </div>
                <div>
                  <h5 className="font-normal mb-1">Índice de hidratação</h5>
                  <h3 className="text-lg font-bold">{galileuData.bodyComposition.hydration.hydrationIndex} cm/ohms x 10</h3>
                </div>
                <div>
                  <h5 className="font-normal mb-1">Água na Massa Magra</h5>
                  <h3 className="text-lg font-bold">{galileuData.bodyComposition.hydration.waterInLeanMassPercentage} %</h3>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <RGraphGauge
                  canvasRef={hydrationRef}
                  value={galileuData.bodyComposition.hydration.hydrationIndex}
                  maxValue={8}
                  colorRanges={[
                    [0, 2, '#ef4444'],
                    [2, 4, '#f59e0b'],
                    [4, 6, '#84cc16'],
                    [6, 8, '#22c55e']
                  ]}
                />
              </div>
              
              <div className="flex justify-center">
                <GalileuSilhouette color="#22c55e" size={60} />
              </div>
            </div>
            
            {/* Seção Peso, Altura e TMB */}
            <div className="bg-transparent">
              <h3 className="text-2xl font-bold mb-4 text-center">Peso, Altura e TMB</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-sm font-normal mb-1">IMC</h5>
                  <h3 className="text-2xl font-bold">{galileuData.bodyComposition.basic.bmi} <span className="text-base font-normal">Kg/m²</span></h3>
                </div>
                <div>
                  <h5 className="text-sm font-normal mb-1">Idade</h5>
                  <h3 className="text-2xl font-bold">{galileuData.bodyComposition.basic.age} <span className="text-base font-normal">anos</span></h3>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h5 className="text-sm font-normal mb-1">Taxa Metabólica Basal</h5>
                <h3 className="text-2xl font-bold">{galileuData.bodyComposition.basic.bmr.toLocaleString()} <span className="text-base font-normal">kcal/24h</span></h3>
              </div>
              
              {/* Silhueta com medidas */}
              <div className="relative flex justify-center mb-6">
                <div className="relative">
                  <GalileuSilhouette color="#6b7280" size={80} />
                  
                  {/* Medidas posicionadas */}
                  <div className="absolute -top-4 -right-8 text-lg font-bold">
                    {galileuData.bodyComposition.basic.height} cm
                  </div>
                  <div className="absolute top-8 -left-12 text-lg font-bold">
                    124,0 cm
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-lg font-bold">
                    {galileuData.bodyComposition.basic.weight} kg
                  </div>
                </div>
              </div>
              
              {/* Botões */}
              <div className="flex justify-center gap-2">
                <Button disabled className="bg-gray-600 text-white text-sm px-3 py-1 rounded">
                  avva
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded">
                  Risco
                </Button>
                <Button className="bg-red-600 hover:bg-red-700 text-white text-sm px-3 py-1 rounded">
                  Sintomas
                </Button>
              </div>
            </div>
          </div>

          {/* COLUNA 3 */}
          <div className="space-y-6">
            
            {/* Seção Água Intra e Extra Celular */}
            <div className="bg-transparent">
              <h3 className="text-2xl font-bold mb-4 text-center">Água Intra e Extra Celular</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h5 className="text-sm font-normal mb-1">Intracelular</h5>
                  <h3 className="text-2xl font-bold">{galileuData.bodyComposition.water.intracellularLiters} <span className="text-base font-normal">litros</span></h3>
                  <h5 className="text-sm font-normal mb-1 mt-2">Água Intracelular %</h5>
                  <h3 className="text-2xl font-bold text-yellow-400">{galileuData.bodyComposition.water.intracellularPercentage} <span className="text-base font-normal">%</span></h3>
                </div>
                
                <div>
                  <h5 className="text-sm font-normal mb-1">Extracelular</h5>
                  <h3 className="text-2xl font-bold">{galileuData.bodyComposition.water.extracellularLiters} <span className="text-base font-normal">litros</span></h3>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <RGraphGauge
                  canvasRef={waterBalanceRef}
                  value={galileuData.bodyComposition.water.intracellularPercentage}
                  maxValue={100}
                  colorRanges={[
                    [0, 25, '#ef4444'],
                    [25, 50, '#f59e0b'],
                    [50, 75, '#84cc16'],
                    [75, 100, '#3b82f6']
                  ]}
                />
              </div>
              
              <div className="flex justify-center">
                <GalileuSilhouette color="#3b82f6" size={60} />
              </div>
            </div>
            
            {/* Seção Análise Celular */}
            <div className="bg-transparent">
              <h3 className="text-2xl font-bold mb-4 text-center">Análise celular</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h5 className="text-sm font-normal mb-1">Ângulo de Fase</h5>
                  <h3 className="text-2xl font-bold">{galileuData.bodyComposition.cellular.phaseAngle} <span className="text-base font-normal">graus</span></h3>
                </div>
                
                <div>
                  <h5 className="text-sm font-normal mb-1">Idade</h5>
                  <h3 className="text-2xl font-bold">{galileuData.bodyComposition.cellular.age} <span className="text-base font-normal">anos</span></h3>
                </div>
                
                <div>
                  <h5 className="text-sm font-normal mb-1">
                    <span className="mr-2">🏥</span>Idade Celular
                  </h5>
                  <h3 className="text-2xl font-bold text-yellow-400">{galileuData.bodyComposition.cellular.cellularAge} <span className="text-base font-normal">anos</span></h3>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <RGraphGauge
                  canvasRef={cellularRef}
                  value={galileuData.bodyComposition.cellular.phaseAngle}
                  maxValue={12}
                  colorRanges={[
                    [0, 3, '#ef4444'],
                    [3, 6, '#f59e0b'],
                    [6, 9, '#84cc16'],
                    [9, 12, '#22c55e']
                  ]}
                />
              </div>
              
              <div className="flex justify-center">
                <GalileuSilhouette color="#facc15" size={60} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalileuPrecisionPage;