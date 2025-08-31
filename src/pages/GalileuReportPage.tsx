import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// Dados exatos do relatório Galileu
const reportData = {
  patient: {
    name: 'Rafael Ferreira Dias',
    evaluatedBy: 'Edmundo rowei',
    birthDate: '20/09/1973',
    weight: 107.0,
    height: 179,
    evaluationDate: '31/07/2025 às 13:08'
  },
  bodyComposition: {
    // Seção Gordura
    bodyFat: {
      massaGorda: 39.3, // kg
      percentualGordura: 36.7 // %
    },
    
    // Seção Hidratação
    hydration: {
      aguaCorporalTotal: 48.3, // litros
      percentualAgua: 45.2, // %
      indiceHidratacao: 3.5, // cm/ohms x 10
      aguaMassaMagra: 71.3 // %
    },
    
    // Seção Água Intra e Extra Celular
    waterDistribution: {
      intracelular: 27.8, // litros
      percentualIntracelular: 57.5, // %
      extracelular: 20.5 // litros
    },
    
    // Seção Massa Magra e Muscular
    leanMass: {
      massaMagra: 67.7, // kg
      percentualMassaMagra: 63.3, // %
      razaoMusculoGordura: 0.8, // kg músculo / kg gordura
      massaMuscular: 30.1, // kg
      percentualMassaMuscular: 28.2 // %
    },
    
    // Seção Central - Peso, Altura e TMB
    basicData: {
      imc: 33.4, // kg/m²
      idade: 51, // anos
      tmb: 1906, // kcal/24h
      altura: 179, // cm
      peso: 107.0 // kg
    },
    
    // Seção Análise Celular
    cellularAnalysis: {
      anguloFase: 6.1, // graus
      idade: 51, // anos
      idadeCelular: 57 // anos
    }
  }
};

const GalileuReportPage: React.FC = () => {
  // Componente de Gauge Semicircular
  const GaugeChart = ({ 
    value, 
    maxValue, 
    size = 160, 
    strokeWidth = 12,
    colors = ['#ef4444', '#f59e0b', '#84cc16', '#22c55e'],
    showValue = true,
    valueColor = '#ffffff',
    fontSize = '28px',
    unit = '',
    centerY = 0
  }: {
    value: number;
    maxValue: number;
    size?: number;
    strokeWidth?: number;
    colors?: string[];
    showValue?: boolean;
    valueColor?: string;
    fontSize?: string;
    unit?: string;
    centerY?: number;
  }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius; // Semicírculo
    const percentage = Math.min(value / maxValue, 1);
    
    // Calcula a cor baseada no valor
    const getColor = () => {
      const segments = colors.length;
      const segmentSize = 1 / segments;
      const segmentIndex = Math.min(Math.floor(percentage / segmentSize), segments - 1);
      return colors[segmentIndex];
    };

    const strokeDasharray = circumference;
    const strokeDashoffset = circumference * (1 - percentage);

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size / 2 + 40 }}>
        <svg width={size} height={size / 2 + 40} className="transform">
          {/* Background arc */}
          <path
            d={`M ${strokeWidth / 2} ${size / 2 + centerY} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2 + centerY}`}
            fill="none"
            stroke="#374151"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Colored segments */}
          {colors.map((color, index) => {
            const segmentSize = 1 / colors.length;
            const segmentStart = index * segmentSize;
            const segmentEnd = (index + 1) * segmentSize;
            const segmentPercentage = Math.max(0, Math.min(percentage - segmentStart, segmentSize)) / segmentSize;
            
            if (segmentPercentage <= 0) return null;
            
            const segmentDashoffset = circumference * (1 - (segmentStart + segmentPercentage * segmentSize));
            const segmentDasharray = circumference * segmentPercentage * segmentSize;
            
            return (
              <path
                key={index}
                d={`M ${strokeWidth / 2} ${size / 2 + centerY} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2 + centerY}`}
                fill="none"
                stroke={color}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${segmentDasharray} ${circumference}`}
                strokeDashoffset={segmentDashoffset}
              />
            );
          })}
        </svg>
        
        {showValue && (
          <div 
            className="absolute flex flex-col items-center justify-center"
            style={{ 
              bottom: '10px',
              color: valueColor,
              fontSize: fontSize,
              fontWeight: 'bold'
            }}
          >
            {value.toFixed(1)}{unit}
          </div>
        )}
      </div>
    );
  };

  // Componente Silhueta Humana
  const HumanSilhouette = ({ 
    color = '#ef4444', 
    size = 80,
    className = ''
  }: { 
    color?: string; 
    size?: number;
    className?: string;
  }) => (
    <svg 
      className={className} 
      width={size} 
      height={size * 1.5} 
      viewBox="0 0 100 150" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Cabeça */}
      <ellipse cx="50" cy="20" rx="12" ry="15" fill={color} stroke="#ffffff" strokeWidth="1"/>
      
      {/* Tronco */}
      <ellipse cx="50" cy="55" rx="18" ry="25" fill={color} stroke="#ffffff" strokeWidth="1"/>
      
      {/* Braços */}
      <ellipse cx="30" cy="50" rx="6" ry="20" fill={color} stroke="#ffffff" strokeWidth="1"/>
      <ellipse cx="70" cy="50" rx="6" ry="20" fill={color} stroke="#ffffff" strokeWidth="1"/>
      
      {/* Quadris */}
      <ellipse cx="50" cy="90" rx="15" ry="12" fill={color} stroke="#ffffff" strokeWidth="1"/>
      
      {/* Pernas */}
      <ellipse cx="42" cy="120" rx="8" ry="25" fill={color} stroke="#ffffff" strokeWidth="1"/>
      <ellipse cx="58" cy="120" rx="8" ry="25" fill={color} stroke="#ffffff" strokeWidth="1"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Header exato da Galileu */}
      <div className="bg-black border-b border-gray-800 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-400 space-y-1">
            <div>Avaliado: {reportData.patient.evaluatedBy}</div>
            <div>Data de nascimento: {reportData.patient.birthDate}</div>
            <div>Peso: {reportData.patient.weight} kg Altura: {reportData.patient.height} cm</div>
            <div>Avaliador: {reportData.patient.name}</div>
            <div>{reportData.patient.evaluationDate}</div>
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">{reportData.patient.name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex space-x-2">
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
                <div className="w-6 h-6 bg-gray-600 rounded"></div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-lg font-bold">b.i.a</div>
            <div className="text-sm">TeraScience</div>
          </div>
        </div>
      </div>

      {/* Layout principal em grid exato da Galileu */}
      <div className="grid grid-cols-3 gap-6 p-6 h-[calc(100vh-120px)]">
        
        {/* COLUNA 1 */}
        <div className="space-y-6">
          
          {/* Seção Gordura */}
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-6 text-center">Gordura</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div>
                <h5 className="text-sm text-gray-400">Massa Gorda</h5>
                <h3 className="text-2xl font-bold">{reportData.bodyComposition.bodyFat.massaGorda} <span className="text-sm">kg</span></h3>
              </div>
              <div>
                <h5 className="text-sm text-gray-400">% Gordura</h5>
                <h3 className="text-2xl font-bold">{reportData.bodyComposition.bodyFat.percentualGordura} <span className="text-sm">%</span></h3>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <GaugeChart
                value={reportData.bodyComposition.bodyFat.percentualGordura}
                maxValue={50}
                colors={['#22c55e', '#84cc16', '#f59e0b', '#ef4444']}
                valueColor="#ef4444"
                unit="%"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <HumanSilhouette color="#ef4444" size={60} />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
                🎯 Target
              </Button>
            </div>
          </div>
          
          {/* Seção Massa Magra e Muscular */}
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-6 text-center">Massa Magra e Muscular</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <h5 className="text-gray-400">Massa Magra</h5>
                <div className="font-bold">{reportData.bodyComposition.leanMass.massaMagra} kg / {reportData.bodyComposition.leanMass.percentualMassaMagra} %</div>
              </div>
              <div>
                <h5 className="text-gray-400">Massa Muscular</h5>
                <div className="font-bold">{reportData.bodyComposition.leanMass.massaMuscular} kg / {reportData.bodyComposition.leanMass.percentualMassaMuscular} %</div>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <h5 className="text-gray-400">Razão Músculo Gordura</h5>
              <div className="text-sm">{reportData.bodyComposition.leanMass.razaoMusculoGordura} kg músculo / kg gordura</div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <GaugeChart
                value={reportData.bodyComposition.leanMass.razaoMusculoGordura}
                maxValue={2}
                colors={['#ef4444', '#f59e0b', '#84cc16', '#22c55e']}
                valueColor="#ef4444"
                fontSize="36px"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <HumanSilhouette color="#ef4444" size={60} />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full">
                ⚡ Vitality
              </Button>
            </div>
          </div>
        </div>

        {/* COLUNA 2 */}
        <div className="space-y-6">
          
          {/* Seção Hidratação */}
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-6 text-center">🌊 Hidratação</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <h5 className="text-gray-400">Água Corporal Total</h5>
                <div className="font-bold">{reportData.bodyComposition.hydration.aguaCorporalTotal} litros / {reportData.bodyComposition.hydration.percentualAgua} %</div>
              </div>
              <div>
                <h5 className="text-gray-400">Água na Massa Magra</h5>
                <div className="font-bold">{reportData.bodyComposition.hydration.aguaMassaMagra} %</div>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <h5 className="text-gray-400">Índice de hidratação</h5>
              <div className="text-sm">cm/ohms x 10</div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <GaugeChart
                value={reportData.bodyComposition.hydration.indiceHidratacao}
                maxValue={8}
                colors={['#ef4444', '#f59e0b', '#84cc16', '#22c55e']}
                valueColor="#22c55e"
                fontSize="36px"
              />
            </div>
            
            <div className="flex justify-center">
              <HumanSilhouette color="#22c55e" size={60} />
            </div>
          </div>
          
          {/* Seção Peso, Altura e TMB */}
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-6 text-center">Peso, Altura e TMB</h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <h5 className="text-gray-400">IMC 🏥</h5>
                <h3 className="text-2xl font-bold">{reportData.bodyComposition.basicData.imc} <span className="text-sm">kg/m²</span></h3>
              </div>
              <div className="text-center">
                <h5 className="text-gray-400">Idade</h5>
                <h3 className="text-2xl font-bold">{reportData.bodyComposition.basicData.idade} <span className="text-sm">anos</span></h3>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <h5 className="text-gray-400">Taxa Metabólica Basal</h5>
              <h3 className="text-2xl font-bold">{reportData.bodyComposition.basicData.tmb} <span className="text-sm">kcal/24h</span></h3>
            </div>
            
            {/* Silhueta com medidas */}
            <div className="relative flex justify-center mb-6">
              <div className="relative">
                <HumanSilhouette color="#6b7280" size={80} />
                
                {/* Medidas */}
                <div className="absolute -top-4 -right-8 text-xs bg-gray-700 px-2 py-1 rounded">
                  {reportData.bodyComposition.basicData.altura} cm
                </div>
                <div className="absolute top-8 -left-12 text-xs bg-gray-700 px-2 py-1 rounded">
                  124,0 cm
                </div>
                <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs bg-gray-700 px-2 py-1 rounded">
                  {reportData.bodyComposition.basicData.peso} kg
                </div>
              </div>
            </div>
            
            {/* Botões */}
            <div className="flex justify-center gap-2">
              <Button className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded">
                ⚠️ Risco
              </Button>
              <Button className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1 rounded">
                ❤️ Sintomas
              </Button>
            </div>
          </div>
        </div>

        {/* COLUNA 3 */}
        <div className="space-y-6">
          
          {/* Seção Água Intra e Extra Celular */}
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-6 text-center">Água Intra e Extra Celular</h3>
            
            <div className="space-y-4">
              <div className="text-center">
                <h5 className="text-gray-400">Intracelular</h5>
                <h3 className="text-2xl font-bold">{reportData.bodyComposition.waterDistribution.intracelular} <span className="text-sm">litros</span></h3>
                <h5 className="text-gray-400">Água Intracelular %</h5>
                <h3 className="text-2xl font-bold text-yellow-400">{reportData.bodyComposition.waterDistribution.percentualIntracelular} <span className="text-sm">%</span></h3>
              </div>
              
              <div className="text-center">
                <h5 className="text-gray-400">Extracelular</h5>
                <h3 className="text-2xl font-bold">{reportData.bodyComposition.waterDistribution.extracelular} <span className="text-sm">litros</span></h3>
              </div>
            </div>
            
            <div className="flex items-center justify-center mt-6">
              <GaugeChart
                value={reportData.bodyComposition.waterDistribution.percentualIntracelular}
                maxValue={100}
                colors={['#ef4444', '#f59e0b', '#84cc16', '#3b82f6']}
                valueColor="#3b82f6"
                unit="%"
              />
            </div>
            
            <div className="flex justify-center mt-4">
              <HumanSilhouette color="#3b82f6" size={60} />
            </div>
          </div>
          
          {/* Seção Análise Celular */}
          <div className="bg-gray-900/50 p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-6 text-center">Análise celular</h3>
            
            <div className="space-y-4 mb-6">
              <div className="text-center">
                <h5 className="text-gray-400">Ângulo de Fase</h5>
                <h3 className="text-2xl font-bold">{reportData.bodyComposition.cellularAnalysis.anguloFase} <span className="text-sm">graus</span></h3>
              </div>
              
              <div className="text-center">
                <h5 className="text-gray-400">Idade</h5>
                <h3 className="text-2xl font-bold">{reportData.bodyComposition.cellularAnalysis.idade} <span className="text-sm">anos</span></h3>
              </div>
              
              <div className="text-center">
                <h5 className="text-gray-400">🏥 Idade Celular</h5>
                <h3 className="text-2xl font-bold text-yellow-400">{reportData.bodyComposition.cellularAnalysis.idadeCelular} <span className="text-sm">anos</span></h3>
              </div>
            </div>
            
            <div className="flex items-center justify-center mb-4">
              <GaugeChart
                value={reportData.bodyComposition.cellularAnalysis.anguloFase}
                maxValue={12}
                colors={['#ef4444', '#f59e0b', '#84cc16', '#22c55e']}
                valueColor="#facc15"
                fontSize="36px"
                unit="°"
              />
            </div>
            
            <div className="flex justify-center">
              <HumanSilhouette color="#facc15" size={60} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalileuReportPage;