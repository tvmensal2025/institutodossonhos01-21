import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, 
  Tooltip, Legend, Area, AreaChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import PersonagemCorporal3D from '@/components/PersonagemCorporal3D';

interface BodyEvolutionChartProps {
  weightData: Array<{
    date: string;
    time: string;
    value: number;
    type: 'peso' | 'imc' | 'gordura';
  }>;
  bodyCompositionData: {
    gordura: number;
    musculo: number;
    agua: number;
    osso: number;
  };
  userGender?: string | null;
  className?: string;
}

export const BodyEvolutionChart: React.FC<BodyEvolutionChartProps> = ({
  weightData,
  bodyCompositionData,
  userGender,
  className = ''
}) => {
  // Verificações de segurança
  if (!weightData || weightData.length === 0) {
    return (
      <Card className={`bg-black text-white border-gray-800 ${className}`}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Nenhum dado de peso disponível para exibir o gráfico.</p>
        </CardContent>
      </Card>
    );
  }

  if (!bodyCompositionData) {
    return (
      <Card className={`bg-black text-white border-gray-800 ${className}`}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Dados de composição corporal não disponíveis.</p>
        </CardContent>
      </Card>
    );
  }

  // Ordenar dados do mais recente para o mais antigo
  const sortedData = [...weightData].reverse();
  
  // Verificações de segurança adicionais
  if (!sortedData || sortedData.length === 0) {
    return (
      <Card className={`bg-black text-white border-gray-800 ${className}`}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Dados de peso inválidos ou vazios.</p>
        </CardContent>
      </Card>
    );
  }

  // Verificar se todos os dados necessários estão presentes
  const hasValidData = sortedData.every(item => 
    item && 
    typeof item.date === 'string' && 
    typeof item.value === 'number' && 
    !isNaN(item.value)
  );

  if (!hasValidData) {
    return (
      <Card className={`bg-black text-white border-gray-800 ${className}`}>
        <CardContent className="p-8 text-center">
          <p className="text-gray-400">Dados de peso contêm valores inválidos.</p>
        </CardContent>
      </Card>
    );
  }

  // Calcular tendência
  const getTrendIcon = () => {
    if (sortedData.length < 2) return <Minus className="h-4 w-4 text-gray-400" />;
    const first = sortedData[0]?.value || 0;
    const last = sortedData[sortedData.length - 1]?.value || 0;
    if (first > last) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (first < last) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-400" />;
  };

  const getTrendText = () => {
    if (sortedData.length < 2) return 'Estável';
    const first = sortedData[0]?.value || 0;
    const last = sortedData[sortedData.length - 1]?.value || 0;
    if (first > last) return 'Aumentando';
    if (first < last) return 'Diminuindo';
    return 'Estável';
  };

  return (
    <Card className={`bg-black text-white border-gray-800 ${className}`}>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-yellow-400 text-center flex items-center justify-center gap-2 text-lg sm:text-xl">
          Evolução Corporal
          {getTrendIcon()}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
          {/* Coluna da Esquerda - Silhueta com Composição */}
          <div className="relative">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-400">Composição Corporal</h3>
              <p className="text-sm sm:text-base text-gray-400">Distribuição atual dos componentes</p>
            </div>
            
            {/* Modelo 3D com PersonagemCorporal3D */}
            <div className="relative flex flex-col gap-4">
              <div className="relative flex justify-center items-center">
                <div className="relative">
                  <PersonagemCorporal3D 
                    genero={userGender === 'masculino' ? 'masculino' : userGender === 'feminino' ? 'feminino' : 'feminino'}
                    className="w-56 h-80 sm:w-64 sm:h-96"
                  />
                  
                  {/* Números flutuando em volta do personagem 3D - COM FUNDO PRETO */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Gordura - Canto superior direito */}
                    <div className="absolute top-2 right-2 flex flex-col items-center bg-black/90 p-3 sm:p-4 rounded-lg backdrop-blur-sm border border-yellow-500/30">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-yellow-500 rounded-full mb-2"></div>
                      <span className="text-yellow-400 text-xl sm:text-2xl font-bold">{bodyCompositionData.gordura}%</span>
                      <span className="text-yellow-400 text-sm sm:text-base">Gordura</span>
                    </div>
                    
                    {/* Músculo - Canto superior esquerdo */}
                    <div className="absolute top-2 left-2 flex flex-col items-center bg-black/90 p-3 sm:p-4 rounded-lg backdrop-blur-sm border border-green-500/30">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full mb-2"></div>
                      <span className="text-green-400 text-xl sm:text-2xl font-bold">{bodyCompositionData.musculo}%</span>
                      <span className="text-green-400 text-sm sm:text-base">Músculo</span>
                    </div>
                    
                    {/* Água - Canto inferior direito */}
                    <div className="absolute bottom-2 right-2 flex flex-col items-center bg-black/90 p-3 sm:p-4 rounded-lg backdrop-blur-sm border border-blue-500/30">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-blue-500 rounded-full mb-2"></div>
                      <span className="text-blue-400 text-xl sm:text-2xl font-bold">{bodyCompositionData.agua}%</span>
                      <span className="text-blue-400 text-sm sm:text-base">Água</span>
                    </div>
                    
                    {/* Osso - Canto inferior esquerdo */}
                    <div className="absolute bottom-2 left-2 flex flex-col items-center bg-black/90 p-3 sm:p-4 rounded-lg backdrop-blur-sm border border-purple-500/30">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-purple-500 rounded-full mb-2"></div>
                      <span className="text-purple-400 text-xl sm:text-2xl font-bold">{bodyCompositionData.osso}%</span>
                      <span className="text-purple-400 text-sm sm:text-base">Osso</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna da Direita - Gráfico de Evolução */}
          <div className="px-0">
            <div className="text-center mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-yellow-400">Evolução do Peso</h3>
              <p className="text-sm sm:text-base text-gray-400">Tendência temporal das medições</p>
            </div>
            
            {/* Gráfico de linha */}
            <div className="h-80 sm:h-96 lg:h-[500px] -mx-5 sm:-mx-8 lg:-mx-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sortedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" strokeOpacity={0.3} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={14}
                    tick={{ fill: '#9CA3AF' }}
                    tickLine={{ stroke: '#9CA3AF', strokeWidth: 2 }}
                    axisLine={false}
                    padding={{ left: 5, right: 5 }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={14}
                    tick={{ fill: '#9CA3AF' }}
                    tickLine={{ stroke: '#9CA3AF', strokeWidth: 2 }}
                    axisLine={false}
                    padding={{ top: 5, bottom: 5 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1F2937', 
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#F9FAFB'
                    }}
                    labelStyle={{ color: '#F9FAFB' }}
                    formatter={(value: any) => [value, 'Peso (kg)']}
                    labelFormatter={(label: any) => `Data: ${label}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#F97316" 
                    fill="#F97316" 
                    fillOpacity={0.4}
                    strokeWidth={5}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Informações da evolução */}
            <div className="mt-6 sm:mt-8 space-y-4 sm:space-y-5 px-4 sm:px-6">
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg text-gray-400">Peso Atual:</span>
                <span className="text-xl sm:text-2xl font-bold text-yellow-400">
                  {sortedData[0]?.value ? sortedData[0].value.toFixed(1) : 'N/A'} kg
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg text-gray-400">Tendência:</span>
                <span className="text-base sm:text-lg font-medium text-gray-300">
                  {getTrendText()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base sm:text-lg text-gray-400">Última medição:</span>
                <span className="text-base sm:text-lg text-gray-300">
                  {sortedData[0]?.date ? `${sortedData[0].date} às ${sortedData[0].time || '08:30'}` : 'N/A'}
                </span>
              </div>
            </div>

            {/* Pontos de dados destacados */}
            <div className="mt-6 sm:mt-8 px-4 sm:px-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-300 mb-3 sm:mb-4">Histórico Recente</h4>
              <div className="space-y-3 sm:space-y-4">
                {sortedData.slice(0, 3).map((d, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${i === 0 ? 'bg-yellow-400' : 'bg-gray-500'}`}
                      ></div>
                      <span className={`text-sm sm:text-base ${i === 0 ? 'text-yellow-400 font-bold' : 'text-gray-400'}`}>
                        {d?.date ? `${d.date} às ${d.time || '08:30'}` : 'N/A'}
                      </span>
                    </div>
                    <span className={`text-sm sm:text-base font-medium ${i === 0 ? 'text-yellow-400' : 'text-gray-400'}`}>
                      {d?.value ? d.value.toFixed(1) : 'N/A'} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 