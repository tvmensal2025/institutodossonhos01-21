import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

// Dados do relatório
const reportData = {
  patient: {
    name: 'Rafael Ferreira Dias',
    evaluator: 'Edmundo roveri',
    birthDate: '20/09/1973',
    weight: 107.0,
    height: 179,
    evaluationDate: '31/07/2025 às 13:08'
  },
  metrics: {
    massaGorda: 39.3,
    percentualGordura: 36.7,
    massaMagra: 67.7,
    percentualMassaMagra: 63.3,
    massaMuscular: 30.1,
    percentualMassaMuscular: 28.2,
    aguaCorporalTotal: 48.3,
    percentualAgua: 45.2,
    indiceHidratacao: 3.5,
    aguaMassaMagra: 71.3,
    aguaIntracelular: 27.8,
    percentualIntracelular: 57.5,
    aguaExtracelular: 20.5,
    imc: 33.4,
    idade: 51,
    tmb: 1906,
    anguloFase: 6.1,
    idadeCelular: 57
  }
};

const ProfessionalReportPage: React.FC = () => {
  // Silhueta exata fornecida por você
  const PreciseHumanSilhouette = ({ 
    color = '#6366f1', 
    size = 120,
    className = ''
  }: { 
    color?: string; 
    size?: number;
    className?: string;
  }) => (
    <div className={`flex justify-center ${className}`}>
      <svg width={size} height={size * 1.6} viewBox="0 0 100 160" className="drop-shadow-sm">
        {/* Cabeça - círculo perfeito */}
        <circle cx="50" cy="15" r="12" fill={color} stroke="white" strokeWidth="1.5" opacity="0.9"/>
        
        {/* Pescoço removido por regra: apenas peso e perímetro abdominal */}
        
        {/* Tronco superior */}
        <path d="M 35 35 Q 35 40 40 45 L 40 65 Q 35 70 35 75 L 35 85 Q 35 90 40 90 L 60 90 Q 65 90 65 85 L 65 75 Q 65 70 60 65 L 60 45 Q 65 40 65 35 Q 60 30 50 30 Q 40 30 35 35 Z" 
              fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        
        {/* Braços */}
        <ellipse cx="25" cy="50" rx="7" ry="20" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        <ellipse cx="75" cy="50" rx="7" ry="20" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        
        {/* Antebraços */}
        <ellipse cx="20" cy="75" rx="5" ry="15" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        <ellipse cx="80" cy="75" rx="5" ry="15" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        
        {/* Mãos */}
        <circle cx="18" cy="90" r="3" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        <circle cx="82" cy="90" r="3" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        
        {/* Quadris */}
        <ellipse cx="50" cy="100" rx="15" ry="10" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        
        {/* Coxas */}
        <ellipse cx="42" cy="125" rx="8" ry="22" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        <ellipse cx="58" cy="125" rx="8" ry="22" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        
        {/* Panturrilhas */}
        <ellipse cx="42" cy="150" rx="6" ry="15" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        <ellipse cx="58" cy="150" rx="6" ry="15" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        
        {/* Pés */}
        <ellipse cx="40" cy="160" rx="8" ry="3" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
        <ellipse cx="60" cy="160" rx="8" ry="3" fill={color} stroke="white" strokeWidth="1" opacity="0.9"/>
      </svg>
    </div>
  );

  // Componente de Gauge Moderno
  const ModernGauge = ({ 
    value, 
    maxValue, 
    title,
    unit = '',
    size = 140,
    colors = ['#ef4444', '#f59e0b', '#84cc16', '#22c55e'],
    textColor = '#1f2937'
  }: {
    value: number;
    maxValue: number;
    title: string;
    unit?: string;
    size?: number;
    colors?: string[];
    textColor?: string;
  }) => {
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = Math.PI * radius; // Semicírculo
    const percentage = Math.min(value / maxValue, 1);
    
    // Calcula cor baseada no valor
    const getColor = () => {
      const segments = colors.length;
      const segmentSize = 1 / segments;
      const segmentIndex = Math.min(Math.floor(percentage / segmentSize), segments - 1);
      return colors[segmentIndex];
    };

    return (
      <div className="flex flex-col items-center space-y-3">
        <div className="relative" style={{ width: size, height: size / 2 + 30 }}>
          <svg width={size} height={size / 2 + 30} className="transform">
            {/* Background arc */}
            <path
              d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
              fill="none"
              stroke="#e5e7eb"
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
                  d={`M ${strokeWidth / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${size / 2}`}
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
          
          {/* Valor central */}
          <div className="absolute inset-0 flex flex-col items-center justify-end pb-2">
            <div className={`text-2xl font-bold`} style={{ color: getColor() }}>
              {value.toFixed(1)}{unit}
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-sm font-medium text-gray-600">{title}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Hospitalar Premium */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Informações do Paciente */}
            <div className="space-y-1">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Avaliado:</span> {reportData.patient.evaluator}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Data de nascimento:</span> {reportData.patient.birthDate}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Dimensões:</span> {reportData.patient.weight} kg | {reportData.patient.height} cm
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Avaliador:</span> {reportData.patient.name}
              </div>
              <div className="text-xs text-gray-500">{reportData.patient.evaluationDate}</div>
            </div>
            
            {/* Nome do Paciente */}
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{reportData.patient.name}</h1>
              <div className="flex items-center justify-center space-x-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Bioimpedância</Badge>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Análise Completa</Badge>
              </div>
            </div>
            
            {/* Logo/Branding */}
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 mb-1">b.i.a</div>
              <div className="text-sm text-gray-500">TeraScience</div>
              <div className="text-xs text-gray-400 mt-1">Análise Profissional</div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* COLUNA 1 - Composição Corporal */}
          <div className="space-y-6">
            
            {/* Card Gordura */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 text-center">
                  🔥 Gordura Corporal
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Massa Gorda</div>
                    <div className="text-2xl font-bold text-red-600">{reportData.metrics.massaGorda} kg</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 mb-1">Percentual</div>
                    <div className="text-2xl font-bold text-red-600">{reportData.metrics.percentualGordura}%</div>
                  </div>
                </div>
                
                <ModernGauge
                  value={reportData.metrics.percentualGordura}
                  maxValue={50}
                  title="Gordura Corporal"
                  unit="%"
                  colors={['#22c55e', '#84cc16', '#f59e0b', '#ef4444']}
                />
                
                <div className="mt-6 flex items-center justify-between">
                  <PreciseHumanSilhouette color="#ef4444" size={80} />
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg">
                    🎯 Definir Meta
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Card Massa Magra */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 text-center">
                  💪 Massa Magra e Muscular
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Massa Magra</span>
                    <span className="font-bold text-green-600">{reportData.metrics.massaMagra} kg / {reportData.metrics.percentualMassaMagra}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Massa Muscular</span>
                    <span className="font-bold text-green-600">{reportData.metrics.massaMuscular} kg / {reportData.metrics.percentualMassaMuscular}%</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Razão Músculo/Gordura</span>
                    <span className="font-bold text-orange-600">0,8 kg/kg</span>
                  </div>
                </div>
                
                <ModernGauge
                  value={0.8}
                  maxValue={2}
                  title="Razão Músculo/Gordura"
                  colors={['#ef4444', '#f59e0b', '#84cc16', '#22c55e']}
                />
                
                <div className="mt-6 flex items-center justify-between">
                  <PreciseHumanSilhouette color="#22c55e" size={80} />
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
                    ⚡ Vitalidade
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUNA 2 - Hidratação e Físico */}
          <div className="space-y-6">
            
            {/* Card Hidratação */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 text-center">
                  💧 Hidratação
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Água Total</div>
                      <div className="font-bold text-blue-600">{reportData.metrics.aguaCorporalTotal}L</div>
                      <div className="text-xs text-gray-500">{reportData.metrics.percentualAgua}%</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Massa Magra</div>
                      <div className="font-bold text-blue-600">{reportData.metrics.aguaMassaMagra}%</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Índice de Hidratação</div>
                    <div className="font-bold text-blue-600">{reportData.metrics.indiceHidratacao} cm/ohms x10</div>
                  </div>
                </div>
                
                <ModernGauge
                  value={reportData.metrics.indiceHidratacao}
                  maxValue={8}
                  title="Índice de Hidratação"
                  colors={['#ef4444', '#f59e0b', '#84cc16', '#22c55e']}
                />
                
                <div className="mt-6 flex justify-center">
                  <PreciseHumanSilhouette color="#3b82f6" size={80} />
                </div>
              </CardContent>
            </Card>
            
            {/* Card Dados Básicos */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 text-center">
                  📊 Dados Físicos e Metabólicos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">IMC</div>
                    <div className="text-2xl font-bold text-purple-600">{reportData.metrics.imc}</div>
                    <div className="text-xs text-gray-500">kg/m²</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
                    <div className="text-sm text-gray-600 mb-1">Idade</div>
                    <div className="text-2xl font-bold text-indigo-600">{reportData.metrics.idade}</div>
                    <div className="text-xs text-gray-500">anos</div>
                  </div>
                </div>
                
                <div className="text-center p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg mb-6">
                  <div className="text-sm text-gray-600 mb-1">Taxa Metabólica Basal</div>
                  <div className="text-2xl font-bold text-emerald-600">{reportData.metrics.tmb.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">kcal/24h</div>
                </div>
                
                {/* Silhueta com medidas */}
                <div className="relative">
                  <PreciseHumanSilhouette color="#6366f1" size={100} className="mx-auto" />
                  <div className="absolute top-0 right-4 bg-white px-2 py-1 rounded shadow text-sm font-medium">
                    {reportData.patient.height}cm
                  </div>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-sm font-medium">
                    {reportData.patient.weight}kg
                  </div>
                </div>
                
                <div className="flex justify-center gap-2 mt-6">
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">⚠️ Risco</Badge>
                  <Badge className="bg-red-100 text-red-800 border-red-300">❤️ Sintomas</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* COLUNA 3 - Análises Avançadas */}
          <div className="space-y-6">
            
            {/* Card Água Celular */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50 pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 text-center">
                  🧬 Água Intra e Extra Celular
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-gradient-to-r from-cyan-50 to-cyan-100 rounded-lg">
                    <div className="text-center mb-3">
                      <div className="text-sm text-gray-600">Intracelular</div>
                      <div className="text-xl font-bold text-cyan-600">{reportData.metrics.aguaIntracelular}L</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Percentual Intracelular</div>
                      <div className="text-2xl font-bold text-yellow-500">{reportData.metrics.percentualIntracelular}%</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-r from-teal-50 to-teal-100 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Extracelular</div>
                      <div className="text-xl font-bold text-teal-600">{reportData.metrics.aguaExtracelular}L</div>
                    </div>
                  </div>
                </div>
                
                <ModernGauge
                  value={reportData.metrics.percentualIntracelular}
                  maxValue={100}
                  title="Água Intracelular"
                  unit="%"
                  colors={['#ef4444', '#f59e0b', '#84cc16', '#06b6d4']}
                />
                
                <div className="mt-6 flex justify-center">
                  <PreciseHumanSilhouette color="#06b6d4" size={80} />
                </div>
              </CardContent>
            </Card>
            
            {/* Card Análise Celular */}
            <Card className="bg-white shadow-lg border-0 hover:shadow-xl transition-shadow duration-300">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 pb-4">
                <CardTitle className="text-xl font-bold text-gray-800 text-center">
                  🔬 Análise Celular
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Ângulo de Fase</div>
                      <div className="text-xl font-bold text-amber-600">{reportData.metrics.anguloFase}°</div>
                    </div>
                    <div className="text-center p-3 bg-amber-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Idade Real</div>
                      <div className="text-xl font-bold text-gray-700">{reportData.metrics.idade} anos</div>
                    </div>
                  </div>
                  
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-100 to-amber-100 rounded-lg border-2 border-yellow-300">
                    <div className="text-sm text-gray-600 mb-1">🏥 Idade Celular</div>
                    <div className="text-2xl font-bold text-yellow-700">{reportData.metrics.idadeCelular} anos</div>
                    <div className="text-xs text-gray-600 mt-1">Indicador de saúde celular</div>
                  </div>
                </div>
                
                <ModernGauge
                  value={reportData.metrics.anguloFase}
                  maxValue={12}
                  title="Ângulo de Fase"
                  unit="°"
                  colors={['#ef4444', '#f59e0b', '#84cc16', '#22c55e']}
                />
                
                <div className="mt-6 flex justify-center">
                  <PreciseHumanSilhouette color="#fbbf24" size={80} />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Footer Profissional */}
        <div className="mt-8 text-center py-6 bg-white rounded-lg shadow-lg">
          <div className="text-sm text-gray-600 mb-2">
            <span className="font-semibold">Instituto dos Sonhos</span> | Análise de Bioimpedância Profissional
          </div>
          <div className="text-xs text-gray-500">
            Relatório gerado em {new Date().toLocaleDateString('pt-BR')} | Tecnologia TeraScience b.i.a
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalReportPage;