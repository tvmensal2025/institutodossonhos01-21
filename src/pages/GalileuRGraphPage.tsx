import React, { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';

// Dados exatos da análise do console
const rGraphData = {
  patient: {
    name: 'Rafael Ferreira Dias',
    evaluator: 'Edmundo roveri',
    birthDate: '20/09/1973',
    weight: 107.0,
    height: 179,
    evaluationDate: '31/07/2025 às 13:08'
  },
  // Dados extraídos do console fat-gauge-component
  fatGauge: {
    fatPerc: 36.7,
    fatWeight: '39,3',
    stdDevs: undefined,
    dehydrated: false,
    anasarca: undefined
  },
  // Dados do muscle-mass-component  
  muscleMass: {
    sex: 1, // masculino
    age: 51,
    isLandscapeOrientation: false,
    errosMedidaAtual: false,
    isRendered: true,
    hasVitality: true,
    razaoMusculoGordura: -0.09691001300805639 // valor calculado real
  },
  // Dados básicos
  basicData: {
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

// Declare global para RGraph (para usar as libraries originais)
declare global {
  interface Window {
    RGraph: any;
  }
}

const GalileuRGraphPage: React.FC = () => {
  // Refs para cada canvas como no original
  const gorduraCorporalRef = useRef<HTMLCanvasElement>(null);
  const massaMuscularRef = useRef<HTMLCanvasElement>(null);
  const indiceHidratacaoRef = useRef<HTMLCanvasElement>(null);
  const ecwIcwRef = useRef<HTMLCanvasElement>(null);
  const saudeCelularRef = useRef<HTMLCanvasElement>(null);

  // Carrega as bibliotecas RGraph exatamente como na Galileu
  useEffect(() => {
    const loadRGraphLibraries = async () => {
      // Lista completa das libraries na ordem correta
      const libraries = [
        '/rgraph/RGraph.common.core.js',
        '/rgraph/libraries/RGraph.common.context.js',
        '/rgraph/libraries/RGraph.common.dynamic.js', 
        '/rgraph/libraries/RGraph.common.key.js',
        '/rgraph/libraries/RGraph.common.tooltips.js',
        '/rgraph/libraries/RGraph.bar.js',
        '/rgraph/libraries/RGraph.drawing.image.js',
        '/rgraph/libraries/RGraph.drawing.rect.js',
        '/rgraph/libraries/RGraph.drawing.text.js',
        '/rgraph/libraries/RGraph.gauge.js',
        '/rgraph/libraries/RGraph.hprogress.js',
        '/rgraph/libraries/RGraph.line.js',
        '/rgraph/libraries/RGraph.meter.js', // Principal para os gauges
        '/rgraph/libraries/RGraph.pie.js',
        '/rgraph/libraries/RGraph.scatter.js',
        '/rgraph/libraries/RGraph.thermometer.js'
      ];

      // Carrega bibliotecas sequencialmente
      for (const lib of libraries) {
        try {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `https://galileuonline.com.br${lib}`;
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
        } catch (error) {
          console.log(`Falha ao carregar ${lib}, usando versão local`);
        }
      }
    };

    loadRGraphLibraries();
  }, []);

  // Cria os gráficos RGraph exatos como no console
  useEffect(() => {
    if (!window.RGraph) return;

    const createRGraphMeter = (
      canvasId: string,
      canvasRef: React.RefObject<HTMLCanvasElement>,
      value: number,
      max: number,
      title: string,
      colors: string[]
    ) => {
      if (!canvasRef.current) return;

      try {
        // Configuração exata do RGraph.meter como no original
        const meter = new window.RGraph.Meter({
          id: canvasRef.current,
          min: 0,
          max: max,
          value: value,
          options: {
            title: title,
            titleColor: '#ffffff',
            titleSize: 16,
            titleBold: true,
            backgroundFill: 'transparent',
            colors: colors,
            needleColor: '#ffffff',
            needleWidth: 3,
            centerpin: true,
            centerpinColor: '#ffffff',
            centerpinRadius: 8,
            shadow: false,
            textSize: 12,
            textColor: '#ffffff',
            scaleDecimals: 1,
            marginTop: 20,
            marginBottom: 20,
            marginLeft: 20,
            marginRight: 20,
            labelsColor: '#ffffff',
            centerLabel: value.toFixed(1),
            centerLabelColor: '#ffffff',
            centerLabelSize: 18,
            centerLabelBold: true,
            angleStart: Math.PI + (Math.PI / 4), // -135 graus
            angleEnd: (Math.PI / 4), // 45 graus
            radius: 80
          }
        });

        meter.draw();
      } catch (error) {
        console.error(`Erro ao criar gráfico ${canvasId}:`, error);
        
        // Fallback para Canvas manual se RGraph falhar
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!ctx) return;

        const centerX = canvas.width / 2;
        const centerY = canvas.height - 30;
        const radius = 70;
        
        // Desenha arco de fundo
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, Math.PI, 0);
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 12;
        ctx.stroke();
        
        // Desenha valor
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(value.toFixed(1), centerX, centerY - 20);
      }
    };

    // Timeout para garantir que o DOM esteja pronto
    setTimeout(() => {
      // Gráfico de Gordura Corporal (gorduraCorporal)
      createRGraphMeter(
        'gorduraCorporal',
        gorduraCorporalRef,
        rGraphData.basicData.percentualGordura,
        50,
        '',
        ['#22c55e', '#84cc16', '#f59e0b', '#ef4444']
      );

      // Gráfico de Massa Muscular (massaMuscular) 
      createRGraphMeter(
        'massaMuscular',
        massaMuscularRef,
        Math.abs(rGraphData.muscleMass.razaoMusculoGordura * 10), // Normaliza o valor
        2,
        '',
        ['#ef4444', '#f59e0b', '#84cc16', '#22c55e']
      );

      // Gráfico de Hidratação (indice_hidratacao)
      createRGraphMeter(
        'indice_hidratacao',
        indiceHidratacaoRef,
        rGraphData.basicData.indiceHidratacao,
        8,
        '',
        ['#ef4444', '#f59e0b', '#84cc16', '#22c55e']
      );

      // Gráfico Água Intra/Extra Celular (ecw_icw)
      createRGraphMeter(
        'ecw_icw',
        ecwIcwRef,
        rGraphData.basicData.percentualIntracelular,
        100,
        '',
        ['#ef4444', '#f59e0b', '#84cc16', '#3b82f6']
      );

      // Gráfico Saúde Celular (saudeCelular)
      createRGraphMeter(
        'saudeCelular',
        saudeCelularRef,
        rGraphData.basicData.anguloFase,
        12,
        '',
        ['#ef4444', '#f59e0b', '#84cc16', '#22c55e']
      );
    }, 1000);
  }, []);

  // Silhueta humana precisa (baseada na imagem fornecida)
  const PreciseHumanSilhouette = ({ 
    color = '#ef4444', 
    size = 70 
  }: { 
    color?: string; 
    size?: number;
  }) => (
    <svg width={size} height={size * 1.8} viewBox="0 0 100 180">
      {/* Cabeça - círculo */}
      <circle cx="50" cy="18" r="14" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      
      {/* Pescoço */}
      <rect x="46" y="32" width="8" height="8" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      
      {/* Ombros e tronco superior */}
      <ellipse cx="50" cy="55" rx="22" ry="18" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      
      {/* Braços */}
      <ellipse cx="28" cy="50" rx="6" ry="20" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      <ellipse cx="72" cy="50" rx="6" ry="20" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      
      {/* Antebraços */}
      <ellipse cx="22" cy="75" rx="5" ry="15" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      <ellipse cx="78" cy="75" rx="5" ry="15" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      
      {/* Tronco inferior */}
      <ellipse cx="50" cy="85" rx="18" ry="20" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      
      {/* Quadris */}
      <ellipse cx="50" cy="110" rx="16" ry="12" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      
      {/* Coxas */}
      <ellipse cx="42" cy="135" rx="8" ry="22" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      <ellipse cx="58" cy="135" rx="8" ry="22" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      
      {/* Panturrilhas */}
      <ellipse cx="42" cy="165" rx="6" ry="15" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
      <ellipse cx="58" cy="165" rx="6" ry="15" fill={color} stroke="#ffffff" strokeWidth="0.8"/>
    </svg>
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header idêntico */}
      <div className="bg-black p-6 border-b border-gray-800">
        <div className="flex items-start justify-between">
          {/* Informações do paciente (esquerda) */}
          <div className="text-sm text-gray-300 space-y-1 max-w-xs">
            <div>Avaliado: {rGraphData.patient.evaluator}</div>
            <div>Data de nascimento: {rGraphData.patient.birthDate}</div>
            <div>Peso: {rGraphData.patient.weight} kg Altura: {rGraphData.patient.height} cm</div>
            <div>Avaliador: {rGraphData.patient.name}</div>
            <div>{rGraphData.patient.evaluationDate}</div>
            <div className="pt-2">
              <Button className="bg-green-600 text-white text-xs px-2 py-1 rounded h-6">
                📊
              </Button>
            </div>
          </div>
          
          {/* Nome do paciente (centro) */}
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold">{rGraphData.patient.name}</h1>
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className="w-6 h-6 bg-gray-600 rounded"></div>
              <div className="w-6 h-6 bg-gray-600 rounded"></div>
              <div className="w-6 h-6 bg-gray-600 rounded"></div>
            </div>
          </div>
          
          {/* Logo (direita) */}
          <div className="text-right">
            <div className="text-2xl font-bold">b.i.a</div>
            <div className="text-sm text-gray-400">TeraScience</div>
          </div>
        </div>
      </div>

      {/* Grid principal 3x2 */}
      <div className="p-6">
        <div className="grid grid-cols-3 gap-6 min-h-[75vh]">
          
          {/* COLUNA 1 */}
          <div className="space-y-8">
            
            {/* Seção Gordura */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">Gordura</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h5 className="text-sm text-gray-400 mb-1">Massa Gorda</h5>
                  <h3 className="text-2xl font-bold">{rGraphData.basicData.massaGorda} <span className="text-lg font-normal">Kg</span></h3>
                </div>
                <div>
                  <h5 className="text-sm text-gray-400 mb-1">% Gordura</h5>
                  <h3 className="text-2xl font-bold">{rGraphData.basicData.percentualGordura} <span className="text-lg font-normal">%</span></h3>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <canvas 
                  ref={gorduraCorporalRef} 
                  width="180" 
                  height="140"
                  className="bg-transparent"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <PreciseHumanSilhouette color="#ef4444" size={70} />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm">
                  🎯 Target
                </Button>
              </div>
            </div>
            
            {/* Seção Massa Magra e Muscular */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">Massa Magra e Muscular</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div>
                  <h5 className="text-gray-400 mb-1">Massa Magra</h5>
                  <div className="text-lg font-bold">{rGraphData.basicData.massaMagra} Kg / {rGraphData.basicData.percentualMassaMagra} %</div>
                </div>
                <div>
                  <h5 className="text-gray-400 mb-1">Razão Músculo Gordura</h5>
                  <div className="text-lg font-bold">0,8 kg músculo / kg gordura</div>
                </div>
                <div>
                  <h5 className="text-gray-400 mb-1">Massa Muscular</h5>
                  <div className="text-lg font-bold">{rGraphData.basicData.massaMuscular} Kg / {rGraphData.basicData.percentualMassaMuscular} %</div>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <canvas 
                  ref={massaMuscularRef} 
                  width="180" 
                  height="140"
                  className="bg-transparent"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <PreciseHumanSilhouette color="#ef4444" size={70} />
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm">
                  ⚡ Vitality
                </Button>
              </div>
            </div>
          </div>

          {/* COLUNA 2 */}
          <div className="space-y-8">
            
            {/* Seção Hidratação */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">
                🌊 Hidratação
              </h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div>
                  <h5 className="text-gray-400 mb-1">Água Corporal Total</h5>
                  <div className="text-lg font-bold">{rGraphData.basicData.aguaCorporalTotal} litros / {rGraphData.basicData.percentualAgua} %</div>
                </div>
                <div>
                  <h5 className="text-gray-400 mb-1">Índice de hidratação</h5>
                  <div className="text-lg font-bold">{rGraphData.basicData.indiceHidratacao} cm/ohms x 10</div>
                </div>
                <div>
                  <h5 className="text-gray-400 mb-1">Água na Massa Magra</h5>
                  <div className="text-lg font-bold">{rGraphData.basicData.aguaMassaMagra} %</div>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <canvas 
                  ref={indiceHidratacaoRef} 
                  width="180" 
                  height="140"
                  className="bg-transparent"
                />
              </div>
              
              <div className="flex justify-center">
                <PreciseHumanSilhouette color="#22c55e" size={70} />
              </div>
            </div>
            
            {/* Seção Peso, Altura e TMB */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">Peso, Altura e TMB</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h5 className="text-sm text-gray-400 mb-1">IMC</h5>
                  <h3 className="text-2xl font-bold">{rGraphData.basicData.imc} <span className="text-lg font-normal">Kg/m²</span></h3>
                </div>
                <div>
                  <h5 className="text-sm text-gray-400 mb-1">Idade</h5>
                  <h3 className="text-2xl font-bold">{rGraphData.basicData.idade} <span className="text-lg font-normal">anos</span></h3>
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h5 className="text-sm text-gray-400 mb-1">Taxa Metabólica Basal</h5>
                <h3 className="text-2xl font-bold">{rGraphData.basicData.tmb.toLocaleString()} <span className="text-lg font-normal">kcal/24h</span></h3>
              </div>
              
              {/* Silhueta com medidas */}
              <div className="relative flex justify-center mb-6">
                <div className="relative">
                  <PreciseHumanSilhouette color="#6b7280" size={90} />
                  
                  {/* Medidas */}
                  <div className="absolute -top-4 -right-10 text-lg font-bold">
                    {rGraphData.patient.height} cm
                  </div>
                  <div className="absolute top-12 -left-14 text-lg font-bold">
                    124,0 cm
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-lg font-bold">
                    {rGraphData.patient.weight} kg
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
          <div className="space-y-8">
            
            {/* Seção Água Intra e Extra Celular */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">Água Intra e Extra Celular</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h5 className="text-sm text-gray-400 mb-1">Intracelular</h5>
                  <h3 className="text-2xl font-bold">{rGraphData.basicData.aguaIntracelular} <span className="text-lg font-normal">litros</span></h3>
                  <h5 className="text-sm text-gray-400 mb-1 mt-2">Água Intracelular %</h5>
                  <h3 className="text-2xl font-bold text-yellow-400">{rGraphData.basicData.percentualIntracelular} <span className="text-lg font-normal">%</span></h3>
                </div>
                
                <div>
                  <h5 className="text-sm text-gray-400 mb-1">Extracelular</h5>
                  <h3 className="text-2xl font-bold">{rGraphData.basicData.aguaExtracelular} <span className="text-lg font-normal">litros</span></h3>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <canvas 
                  ref={ecwIcwRef} 
                  width="180" 
                  height="140"
                  className="bg-transparent"
                />
              </div>
              
              <div className="flex justify-center">
                <PreciseHumanSilhouette color="#3b82f6" size={70} />
              </div>
            </div>
            
            {/* Seção Análise Celular */}
            <div>
              <h3 className="text-2xl font-bold mb-6 text-center">Análise celular</h3>
              
              <div className="space-y-4 mb-6">
                <div>
                  <h5 className="text-sm text-gray-400 mb-1">Ângulo de Fase</h5>
                  <h3 className="text-2xl font-bold">{rGraphData.basicData.anguloFase} <span className="text-lg font-normal">graus</span></h3>
                </div>
                
                <div>
                  <h5 className="text-sm text-gray-400 mb-1">Idade</h5>
                  <h3 className="text-2xl font-bold">{rGraphData.basicData.idade} <span className="text-lg font-normal">anos</span></h3>
                </div>
                
                <div>
                  <h5 className="text-sm text-gray-400 mb-1">🏥 Idade Celular</h5>
                  <h3 className="text-2xl font-bold text-yellow-400">{rGraphData.basicData.idadeCelular} <span className="text-lg font-normal">anos</span></h3>
                </div>
              </div>
              
              <div className="flex justify-center mb-6">
                <canvas 
                  ref={saudeCelularRef} 
                  width="180" 
                  height="140"
                  className="bg-transparent"
                />
              </div>
              
              <div className="flex justify-center">
                <PreciseHumanSilhouette color="#facc15" size={70} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GalileuRGraphPage;