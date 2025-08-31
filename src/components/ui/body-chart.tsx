import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PersonIcon } from '@/components/ui/person-icon';

interface BodyChartProps {
  title: string;
  data: {
    imc?: number;
    idade?: number;
    tmb?: number;
    peso?: number;
    altura?: number;
    circunferencia?: number;
  };
  showRisk?: boolean;
  showSymptoms?: boolean;
  className?: string;
}

export const BodyChart: React.FC<BodyChartProps> = ({
  title,
  data,
  showRisk = true,
  showSymptoms = true,
  className = ''
}) => {
  const getIMCStatus = (imc: number) => {
    if (imc < 18.5) return { status: 'Baixo Peso', color: '#3B82F6' };
    if (imc < 25) return { status: 'Normal', color: '#10B981' };
    if (imc < 30) return { status: 'Sobrepeso', color: '#F59E0B' };
    if (imc < 35) return { status: 'Obesidade I', color: '#F97316' };
    return { status: 'Obesidade II/III', color: '#EF4444' };
  };

  const imcStatus = data.imc ? getIMCStatus(data.imc) : null;

  return (
    <Card className={`bg-black text-white border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="text-yellow-400 text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* IMC */}
          <div className="text-center">
            <div className="text-yellow-400 text-sm font-medium">IMC</div>
            <div className="text-white text-lg font-bold">
              {data.imc?.toFixed(1)} Kg/m²
            </div>
          </div>

          {/* Idade */}
          <div className="text-center">
            <div className="text-yellow-400 text-sm font-medium">Idade</div>
            <div className="text-white text-lg font-bold">
              {data.idade} anos
            </div>
          </div>

          {/* TMB */}
          <div className="text-center">
            <div className="text-yellow-400 text-sm font-medium">Taxa Metabólica Basal</div>
            <div className="text-white text-lg font-bold">
              {data.tmb?.toLocaleString()} kcal/24h
            </div>
          </div>
        </div>

        {/* Silhueta com dados */}
        <div className="relative flex justify-center items-center mb-6">
          {/* Altura */}
          <div className="absolute left-4 top-0 h-full flex flex-col items-center">
            <div className="w-1 h-full bg-gray-600"></div>
            <div className="text-white text-sm mt-2">{data.altura} cm</div>
          </div>

          {/* Silhueta humana usando imagem real */}
          <div className="relative">
            <img
              src="/images/silhueta.svg"
              alt="Silhueta Humana"
              width="200"
              height="300"
              className="text-white"
              style={{
                opacity: 0.8,
                filter: 'brightness(0) invert(1)'
              }}
            />
            
            {/* Linha da cintura sobreposta */}
            {data.circunferencia && (
              <svg
                width="200"
                height="300"
                viewBox="0 0 200 300"
                className="absolute inset-0 pointer-events-none"
              >
                <line
                  x1="50"
                  y1="140"
                  x2="150"
                  y2="140"
                  stroke="#F97316"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              </svg>
            )}
          </div>

          {/* Medidas sobrepostas */}
          {data.circunferencia && (
            <div className="absolute top-32 right-0 transform translate-x-4">
              <div className="text-white text-sm font-bold">
                {data.circunferencia} cm
              </div>
            </div>
          )}

          {data.peso && (
            <div className="absolute bottom-0 right-0 transform translate-x-4">
              <div className="text-white text-sm font-bold">
                {data.peso} kg
              </div>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="flex flex-col gap-2">
          <button className="bg-red-600 text-white px-4 py-2 rounded flex items-center gap-2">
            <PersonIcon size="sm" variant="filled" color="white" />
            <span>avva</span>
          </button>
          
          {showRisk && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span>Risco</span>
            </button>
          )}
          
          {showSymptoms && (
            <button className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
              <span>Sintomas</span>
            </button>
          )}
        </div>

        {/* Status do IMC */}
        {imcStatus && (
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-400">Status IMC:</div>
            <div className="text-lg font-bold" style={{ color: imcStatus.color }}>
              {imcStatus.status}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente para gráfico de composição corporal dentro do corpo
interface BodyCompositionChartProps {
  data: {
    gordura: number;
    musculo: number;
    agua: number;
    osso: number;
  };
  className?: string;
}

export const BodyCompositionChart: React.FC<BodyCompositionChartProps> = ({
  data,
  className = ''
}) => {
  return (
    <Card className={`bg-black text-white border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="text-yellow-400 text-center">Composição Corporal</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative flex justify-center items-center">
          <img
            src="/images/silhueta.svg"
            alt="Silhueta Humana"
            width="200"
            height="300"
            className="text-white"
            style={{
              opacity: 0.8,
              filter: 'brightness(0) invert(1)'
            }}
          />
          
          {/* Gradiente sobreposto para composição */}
          <svg
            width="200"
            height="300"
            viewBox="0 0 200 300"
            className="absolute inset-0 pointer-events-none"
          >
            <defs>
              <linearGradient id="bodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
                <stop offset="25%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.3" />
                <stop offset="75%" stopColor="#8B5CF6" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            <rect x="0" y="0" width="200" height="300" fill="url(#bodyGradient)" />
          </svg>

          {/* Números flutuando em volta do personagem - COM FUNDO PRETO */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Gordura - Canto superior direito */}
            <div className="absolute top-4 right-4 flex flex-col items-center bg-black/90 p-3 rounded-lg backdrop-blur-sm border border-yellow-500/30">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mb-1"></div>
              <span className="text-yellow-400 text-lg font-bold">{data.gordura.toFixed(1)}%</span>
              <span className="text-yellow-400 text-xs">Gordura</span>
            </div>
            
            {/* Músculo - Canto superior esquerdo */}
            <div className="absolute top-4 left-4 flex flex-col items-center bg-black/90 p-3 rounded-lg backdrop-blur-sm border border-green-500/30">
              <div className="w-3 h-3 bg-green-500 rounded-full mb-1"></div>
              <span className="text-green-400 text-lg font-bold">{data.musculo.toFixed(1)}%</span>
              <span className="text-green-400 text-xs">Músculo</span>
            </div>
            
            {/* Água - Canto inferior direito */}
            <div className="absolute bottom-4 right-4 flex flex-col items-center bg-black/90 p-3 rounded-lg backdrop-blur-sm border border-blue-500/30">
              <div className="w-3 h-3 bg-blue-500 rounded-full mb-1"></div>
              <span className="text-blue-400 text-lg font-bold">{data.agua.toFixed(1)}%</span>
              <span className="text-blue-400 text-xs">Água</span>
            </div>
            
            {/* Osso - Canto inferior esquerdo */}
            <div className="absolute bottom-4 left-4 flex flex-col items-center bg-black/90 p-3 rounded-lg backdrop-blur-sm border border-purple-500/30">
              <div className="w-3 h-3 bg-purple-500 rounded-full mb-1"></div>
              <span className="text-purple-400 text-lg font-bold">{data.osso.toFixed(1)}%</span>
              <span className="text-purple-400 text-xs">Osso</span>
            </div>
          </div>
        </div>

        {/* Resumo da composição - NÚMEROS MAIORES */}
        <div className="mt-6 grid grid-cols-2 gap-6 text-center">
          <div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/20">
            <div className="text-yellow-400 text-xs font-medium mb-1">Gordura Corporal</div>
            <div className="text-yellow-400 text-2xl font-bold">{data.gordura.toFixed(1)}%</div>
          </div>
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="text-green-400 text-xs font-medium mb-1">Massa Muscular</div>
            <div className="text-green-400 text-2xl font-bold">{data.musculo.toFixed(1)}%</div>
          </div>
          <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
            <div className="text-blue-400 text-xs font-medium mb-1">Água Corporal</div>
            <div className="text-blue-400 text-2xl font-bold">{data.agua.toFixed(1)}%</div>
          </div>
          <div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/20">
            <div className="text-purple-400 text-xs font-medium mb-1">Massa Óssea</div>
            <div className="text-purple-400 text-2xl font-bold">{data.osso.toFixed(1)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Componente para gráfico de evolução temporal dentro do corpo
interface BodyTrendChartProps {
  data: Array<{
    date: string;
    time: string;
    value: number;
    type: 'peso' | 'imc' | 'gordura';
  }>;
  className?: string;
}

export const BodyTrendChart: React.FC<BodyTrendChartProps> = ({
  data,
  className = ''
}) => {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  const getColor = (type: string) => {
    switch (type) {
      case 'peso': return '#F97316';
      case 'imc': return '#3B82F6';
      case 'gordura': return '#F59E0B';
      default: return '#10B981';
    }
  };

  // Ordenar dados do mais recente para o mais antigo
  const sortedData = [...data].reverse();

  return (
    <Card className={`bg-black text-white border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="text-yellow-400 text-center">Evolução Corporal</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="relative flex justify-center items-center">
          <img
            src="/images/silhueta.svg"
            alt="Silhueta Humana"
            width="200"
            height="300"
            className="text-white"
            style={{
              opacity: 0.3,
              filter: 'brightness(0) invert(1)'
            }}
          />

          {/* Linha de tendência dentro do corpo */}
          <svg
            width="200"
            height="300"
            viewBox="0 0 200 300"
            className="absolute inset-0 pointer-events-none"
          >
            <polyline
              points={sortedData.map((d, i) => {
                const x = 70 + (i / (sortedData.length - 1)) * 60;
                const normalizedValue = (d.value - minValue) / range;
                const y = 170 - normalizedValue * 100;
                return `${x},${y}`;
              }).join(' ')}
              fill="none"
              stroke={getColor(sortedData[0]?.type || 'peso')}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pontos de dados com tamanhos diferentes */}
            {sortedData.map((d, i) => {
              const x = 70 + (i / (sortedData.length - 1)) * 60;
              const normalizedValue = (d.value - minValue) / range;
              const y = 170 - normalizedValue * 100;
              // Tamanho do ponto: maior para o mais recente, menor para os antigos
              const radius = i === 0 ? 8 : Math.max(3, 8 - i * 1.5);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={radius}
                  fill={getColor(d.type)}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Legenda dos dados com dia e hora */}
          <div className="absolute right-0 top-0 space-y-2">
            {sortedData.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className={`rounded-full ${i === 0 ? 'w-4 h-4' : 'w-3 h-3'}`}
                  style={{ backgroundColor: getColor(d.type) }}
                ></div>
                <div className="text-sm">
                  <div className={`${i === 0 ? 'font-bold text-yellow-400' : 'text-gray-300'}`}>
                    {d.value.toFixed(1)} kg
                  </div>
                  <div className="text-xs text-gray-400">
                    {d.date} às {d.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo da tendência */}
        <div className="mt-4 text-center">
          <div className="text-yellow-400 text-sm">Tendência</div>
          <div className="text-white text-lg font-bold">
            {sortedData.length > 1 ? 
              (sortedData[0].value > sortedData[sortedData.length - 1].value ? '📈 Aumentando' : '📉 Diminuindo') :
              '➡️ Estável'
            }
          </div>
          <div className="text-sm text-gray-400 mt-1">
            Peso atual: <span className="text-yellow-400 font-bold">{sortedData[0]?.value.toFixed(1)} kg</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BodyChart; 