import React from 'react';
import { GalileuGaugeChart } from '@/components/charts/GalileuGaugeChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const GalileuChartsPage: React.FC = () => {
  // Dados simulados baseados no relatório Galileu
  const bodyCompositionData = {
    gordura: {
      massaGorda: 24.7, // kg
      percentualGordura: 36.2, // %
    },
    hidratacao: {
      aguaCorporalTotal: 30.8, // litros
      percentualAgua: 45.2, // %
      indiceHidratacao: 2.7, // cm/ohms x 10
      aguaMassaMagra: 70.8, // %
    },
    aguaIntraExtra: {
      intracelular: 16.7, // litros
      percentualIntracelular: 54.2, // %
      extracelular: 14.1, // litros
    },
    massaMagraeMuscular: {
      massaMagra: 43.4, // kg
      percentualMassaMagra: 63.8, // %
      razaoMusculoGordura: 0.8, // kg músculo / kg gordura
      massaMuscular: 19.5, // kg
      percentualMassaMuscular: 28.6, // %
    },
    analiseCelular: {
      anguloFase: 8.1, // graus
      idadeCelular: 32, // anos
    },
    dadosBasicos: {
      peso: 68.1, // kg
      altura: 159, // cm
      imc: 26.9, // kg/m²
      idade: 40, // anos
      tmb: 1221, // kcal/24h
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700 mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white mb-2">
              📊 Análise Corporal Detalhada
            </CardTitle>
            <div className="text-slate-300">
              <p className="mb-1"><strong>Avaliada:</strong> Juliana Maria Lopes</p>
              <p className="mb-1"><strong>Data de nascimento:</strong> 09/07/1985</p>
              <p className="mb-1"><strong>Peso:</strong> {bodyCompositionData.dadosBasicos.peso} kg | <strong>Altura:</strong> {bodyCompositionData.dadosBasicos.altura} cm</p>
              <p><strong>Avaliador:</strong> Rafael Ferreira Dias | 28/07/2025 às 14:55</p>
            </div>
          </CardHeader>
        </Card>

        {/* Seção Gordura */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🔥 Gordura
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GalileuGaugeChart
              value={bodyCompositionData.gordura.massaGorda}
              maxValue={50}
              title="Massa Gorda"
              unit="Kg"
              ranges={[
                { min: 0, max: 15, color: '#22c55e', label: 'Ideal' },
                { min: 15, max: 25, color: '#eab308', label: 'Normal' },
                { min: 25, max: 35, color: '#f97316', label: 'Elevada' },
                { min: 35, max: 50, color: '#ef4444', label: 'Crítica' }
              ]}
            />
            <GalileuGaugeChart
              value={bodyCompositionData.gordura.percentualGordura}
              maxValue={50}
              title="% Gordura"
              unit="%"
              showTarget={true}
              targetValue={25}
              ranges={[
                { min: 0, max: 20, color: '#22c55e', label: 'Excelente' },
                { min: 20, max: 30, color: '#eab308', label: 'Bom' },
                { min: 30, max: 40, color: '#f97316', label: 'Alto' },
                { min: 40, max: 50, color: '#ef4444', label: 'Muito Alto' }
              ]}
            />
          </div>
        </div>

        {/* Seção Hidratação */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            💧 Hidratação
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GalileuGaugeChart
              value={bodyCompositionData.hidratacao.aguaCorporalTotal}
              maxValue={50}
              title="Água Corporal Total"
              subtitle={`${bodyCompositionData.hidratacao.percentualAgua}%`}
              unit="litros"
              color="#3b82f6"
            />
            <GalileuGaugeChart
              value={bodyCompositionData.hidratacao.indiceHidratacao}
              maxValue={5}
              title="Índice de Hidratação"
              unit="cm/ohms x 10"
              color="#06b6d4"
              ranges={[
                { min: 0, max: 2, color: '#ef4444', label: 'Baixo' },
                { min: 2, max: 3, color: '#eab308', label: 'Normal' },
                { min: 3, max: 4, color: '#22c55e', label: 'Bom' },
                { min: 4, max: 5, color: '#3b82f6', label: 'Excelente' }
              ]}
            />
            <GalileuGaugeChart
              value={bodyCompositionData.hidratacao.aguaMassaMagra}
              maxValue={100}
              title="Água na Massa Magra"
              unit="%"
              color="#10b981"
            />
          </div>
        </div>

        {/* Seção Água Intra e Extra Celular */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🧬 Água Intra e Extra Celular
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GalileuGaugeChart
              value={bodyCompositionData.aguaIntraExtra.percentualIntracelular}
              maxValue={100}
              title="Água Intracelular"
              subtitle={`${bodyCompositionData.aguaIntraExtra.intracelular} litros`}
              unit="%"
              color="#8b5cf6"
            />
            <GalileuGaugeChart
              value={100 - bodyCompositionData.aguaIntraExtra.percentualIntracelular}
              maxValue={100}
              title="Água Extracelular"
              subtitle={`${bodyCompositionData.aguaIntraExtra.extracelular} litros`}
              unit="%"
              color="#06b6d4"
            />
          </div>
        </div>

        {/* Seção Massa Magra e Muscular */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            💪 Massa Magra e Muscular
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GalileuGaugeChart
              value={bodyCompositionData.massaMagraeMuscular.percentualMassaMagra}
              maxValue={100}
              title="Massa Magra"
              subtitle={`${bodyCompositionData.massaMagraeMuscular.massaMagra} kg`}
              unit="%"
              color="#22c55e"
            />
            <GalileuGaugeChart
              value={bodyCompositionData.massaMagraeMuscular.razaoMusculoGordura}
              maxValue={2}
              title="Razão Músculo/Gordura"
              unit="kg músculo / kg gordura"
              color="#f59e0b"
              ranges={[
                { min: 0, max: 0.5, color: '#ef4444', label: 'Baixa' },
                { min: 0.5, max: 1, color: '#eab308', label: 'Normal' },
                { min: 1, max: 1.5, color: '#22c55e', label: 'Boa' },
                { min: 1.5, max: 2, color: '#3b82f6', label: 'Excelente' }
              ]}
            />
            <GalileuGaugeChart
              value={bodyCompositionData.massaMagraeMuscular.percentualMassaMuscular}
              maxValue={50}
              title="Massa Muscular"
              subtitle={`${bodyCompositionData.massaMagraeMuscular.massaMuscular} kg`}
              unit="%"
              color="#dc2626"
            />
          </div>
        </div>

        {/* Seção Análise Celular */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            🔬 Análise Celular
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GalileuGaugeChart
              value={bodyCompositionData.analiseCelular.anguloFase}
              maxValue={15}
              title="Ângulo de Fase"
              unit="graus"
              color="#8b5cf6"
              ranges={[
                { min: 0, max: 5, color: '#ef4444', label: 'Baixa Vitalidade' },
                { min: 5, max: 8, color: '#eab308', label: 'Normal' },
                { min: 8, max: 12, color: '#22c55e', label: 'Boa Vitalidade' },
                { min: 12, max: 15, color: '#3b82f6', label: 'Excelente' }
              ]}
            />
            <GalileuGaugeChart
              value={bodyCompositionData.analiseCelular.idadeCelular}
              maxValue={80}
              title="Idade Celular"
              unit="anos"
              color="#f59e0b"
              showTarget={true}
              targetValue={bodyCompositionData.dadosBasicos.idade}
            />
          </div>
        </div>

        {/* Seção Dados Básicos */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            📏 Peso, Altura e TMB
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <GalileuGaugeChart
              value={bodyCompositionData.dadosBasicos.imc}
              maxValue={40}
              title="IMC"
              unit="kg/m²"
              ranges={[
                { min: 0, max: 18.5, color: '#3b82f6', label: 'Abaixo' },
                { min: 18.5, max: 25, color: '#22c55e', label: 'Normal' },
                { min: 25, max: 30, color: '#eab308', label: 'Sobrepeso' },
                { min: 30, max: 40, color: '#ef4444', label: 'Obesidade' }
              ]}
            />
            <GalileuGaugeChart
              value={bodyCompositionData.dadosBasicos.idade}
              maxValue={100}
              title="Idade"
              unit="anos"
              color="#6366f1"
            />
            <GalileuGaugeChart
              value={bodyCompositionData.dadosBasicos.tmb}
              maxValue={2500}
              title="Taxa Metabólica Basal"
              unit="kcal/24h"
              color="#ec4899"
            />
          </div>
        </div>

        {/* Informações Adicionais */}
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-xl text-white flex items-center gap-2">
              ⚡ Dados de Bioimpedância
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-slate-400 text-sm">Resistência</p>
                <p className="text-white text-2xl font-bold">589 ohms</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Reatância</p>
                <p className="text-white text-2xl font-bold">84 ohms</p>
              </div>
              <div>
                <p className="text-slate-400 text-sm">Impedância</p>
                <p className="text-white text-2xl font-bold">595 ohms</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};