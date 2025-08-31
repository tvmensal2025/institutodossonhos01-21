import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Scale, Edit3, LineChart, BarChart3, Target } from 'lucide-react';
import SimpleWeightForm from '../weighing/SimpleWeightForm';
import { XiaomiScaleFlow } from '../XiaomiScaleFlow';
import { XiaomiScaleConnection } from '../XiaomiScaleConnection';
import { XiaomiScaleTroubleshooter } from '../XiaomiScaleTroubleshooter';
import PersonagemCorporal3D from '../PersonagemCorporal3D';
import { useUserGender } from '@/hooks/useUserGender';
import { WeightChart } from '../weighing/WeightChart';
import BodyAnalysisCharts from '../weighing/BodyAnalysisCharts';
import { BodyCompositionCard } from '../weighing/BodyCompositionCard';
import { ProfessionalEvaluation, UserProfile } from '@/hooks/useProfessionalEvaluation';

interface ProfessionalWeighingSystemProps {
  user: UserProfile;
  evaluation?: ProfessionalEvaluation;
  onWeightChange?: (weight: number) => void;
  onSave?: (evaluation: Partial<ProfessionalEvaluation>) => Promise<void>;
}

export const ProfessionalWeighingSystem: React.FC<ProfessionalWeighingSystemProps> = ({
  user,
  evaluation,
  onWeightChange,
  onSave
}) => {
  const [activeWeighingType, setActiveWeighingType] = useState<'manual' | 'automatic'>('manual');
  const { gender } = useUserGender(null);

  // Dados do usuário e medições - usando propriedades disponíveis no ProfessionalEvaluation
  const lastMeasurement = evaluation ? {
    weight_kg: evaluation.weight_kg || 0,
    body_fat_percentage: evaluation.body_fat_percentage || 0,
    muscle_mass_kg: evaluation.muscle_mass_kg || 0,
    water_percentage: 25, // Mock value - não está no schema atual
    bone_mass: 3, // Mock value - não está no schema atual
    visceral_fat: 5, // Mock value - calculado a partir do body_fat_percentage
    metabolic_age: 25, // Mock value - não está no schema atual
    bmi: evaluation.bmi || 0,
    waist_circumference: evaluation.waist_circumference_cm || 0
  } : {
    weight_kg: 0,
    body_fat_percentage: 0,
    muscle_mass_kg: 0,
    water_percentage: 0,
    bone_mass: 0,
    visceral_fat: 0,
    metabolic_age: 0,
    bmi: 0,
    waist_circumference: 0
  };

  // Histórico de pesagens (mock para exemplo)
  const weightData = [
    { peso_kg: lastMeasurement.weight_kg, measurement_date: new Date().toISOString() }
  ];

  return (
    <div className="w-full">
      {/* Grid Principal com Personagem 3D Central */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 xl:gap-12">
        
        {/* Coluna Esquerda - Gráficos */}
        <div className="xl:col-span-3 space-y-6 sm:space-y-8">
          
          {/* Resumo Corporal */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/50 to-cyan-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 text-blue-300 mr-2 sm:mr-3 lg:mr-4" />
                Resumo Corporal
              </h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              {lastMeasurement ? (
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  {/* Peso Principal */}
                  <div className="text-center bg-gradient-to-r from-blue-500/30 to-indigo-500/30 rounded-xl lg:rounded-2xl p-4 sm:p-6 border-2 border-blue-400/30">
                    <div className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-blue-300 mb-2 sm:mb-4">
                      {lastMeasurement.weight_kg?.toFixed(1)}kg
                    </div>
                    <div className="text-sm sm:text-base lg:text-lg text-gray-200">
                      Última medição
                    </div>
                  </div>
                  
                  {/* Métricas Principais */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-green-500/30 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center border-2 border-green-400/30">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-300">
                      {lastMeasurement.bmi?.toFixed(1) || '--'}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-200">IMC</div>
                  </div>
                  <div className="bg-purple-500/30 rounded-xl lg:rounded-2xl p-3 sm:p-4 text-center border-2 border-purple-400/30">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-300">
                      {lastMeasurement.body_fat_percentage?.toFixed(1) || '--'}%
                      </div>
                      <div className="text-xs sm:text-sm text-gray-200">Gordura</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-300 py-8 sm:py-12">
                  <Scale className="h-12 w-12 sm:h-16 sm:w-16 lg:h-20 lg:w-20 mx-auto mb-4 sm:mb-6 opacity-50" />
                  <p className="text-base sm:text-lg lg:text-xl">Nenhuma pesagem registrada</p>
                </div>
              )}
            </div>
          </div>

          {/* Composição Corporal */}
          <BodyCompositionCard data={lastMeasurement} />

          {/* Métricas Detalhadas */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500/50 to-amber-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Métricas Detalhadas</h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-3 sm:space-y-4">
                {[
                  { name: "Circunferência abdominal", value: lastMeasurement?.waist_circumference, unit: "cm", precision: "1cm", icon: "📏" },
                  { name: "Massa muscular", value: lastMeasurement?.muscle_mass_kg, unit: "kg", precision: "0.1kg", icon: "💪" },
                  { name: "Água corporal", value: lastMeasurement?.water_percentage, unit: "%", precision: "0.1%", icon: "💧" },
                  { name: "Massa óssea", value: lastMeasurement?.bone_mass, unit: "kg", precision: "0.1kg", icon: "🦴" },
                  { name: "Gordura visceral", value: lastMeasurement?.visceral_fat, unit: "", precision: "nível 1-30", icon: "⚠️" },
                  { name: "Idade metabólica", value: lastMeasurement?.metabolic_age, unit: "anos", precision: "1 ano", icon: "⏰" }
                ].map((metric, index) => (
                  <div key={index} className="flex justify-between items-center py-2 sm:py-3 lg:py-4 border-b-2 border-white/10 last:border-b-0">
                    <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4">
                      <span className="text-lg sm:text-xl lg:text-2xl">{metric.icon}</span>
                      <span className="text-sm sm:text-base lg:text-lg text-gray-200">{metric.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm sm:text-base lg:text-lg font-bold text-white">
                        {metric.value ? `${metric.value}${metric.unit}` : 'N/A'}
                      </span>
                      <div className="text-xs sm:text-sm text-gray-300">({metric.precision})</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Central - Personagem 3D Gigante */}
        <div className="xl:col-span-6">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden h-full">
            <div className="bg-gradient-to-r from-pink-500/50 to-rose-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white text-center">Visualização Corporal 3D</h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
              <div className="text-center w-full">
                <PersonagemCorporal3D 
                  genero={gender === 'male' ? 'masculino' : gender === 'female' ? 'feminino' : 'masculino'} 
                  className="w-full h-[500px] sm:h-[600px] lg:h-[700px] xl:h-[800px] 2xl:h-[900px] mx-auto" 
                />
                <p className="text-sm sm:text-base lg:text-lg text-gray-200 mt-4 sm:mt-6">
                  Visualização da composição corporal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita - Gráficos */}
        <div className="xl:col-span-3 space-y-6 sm:space-y-8">
          
          {/* Pesagem */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/50 to-indigo-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
              <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-white flex items-center">
                {activeWeighingType === 'manual' ? (
                  <>
                    <Edit3 className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-blue-300 mr-3 sm:mr-4 lg:mr-6" />
                    Nova Pesagem Manual
                  </>
                ) : (
                  <>
                    <Scale className="h-5 w-5 sm:h-6 sm:w-6 lg:h-8 lg:w-8 xl:h-10 xl:w-10 text-blue-300 mr-3 sm:mr-4 lg:mr-6" />
                    Balança Xiaomi Mi Body Scale 2
                  </>
                )}
              </h2>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              {activeWeighingType === 'manual' ? (
                <SimpleWeightForm />
              ) : (
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                  <p className="text-sm sm:text-base lg:text-lg xl:text-2xl text-gray-200">
                    Conecte sua balança Xiaomi para pesagem automática e análise completa
                  </p>
                  <div className="grid gap-4 sm:gap-6">
                    <XiaomiScaleFlow />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <XiaomiScaleConnection />
                      <XiaomiScaleTroubleshooter />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Evolução */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-500/50 to-emerald-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                <LineChart className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 xl:h-8 xl:w-8 text-green-300 mr-2 sm:mr-3 lg:mr-4" />
                Evolução do Peso
              </h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="h-64 sm:h-72 lg:h-80">
                <WeightChart data={weightData} />
              </div>
            </div>
          </div>

          {/* Análise Corporal Avançada */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500/50 to-blue-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Análise Corporal Avançada</h3>
              <p className="text-sm sm:text-base lg:text-lg text-gray-200 mt-1 sm:mt-2">Gráficos detalhados de composição corporal</p>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <BodyAnalysisCharts />
            </div>
          </div>

          {/* Novo Gráfico - Distribuição de Gordura */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500/50 to-pink-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                <span className="text-2xl mr-2">🔥</span>
                Distribuição de Gordura
              </h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4">
                {lastMeasurement && [
                  { name: 'Gordura Subcutânea', value: lastMeasurement.body_fat_percentage || 0, color: 'bg-red-500', max: 50 },
                  { name: 'Gordura Visceral', value: lastMeasurement.visceral_fat || 0, color: 'bg-orange-500', max: 30 },
                  { name: 'Gordura Total', value: (lastMeasurement.body_fat_percentage || 0) + (lastMeasurement.visceral_fat || 0), color: 'bg-pink-500', max: 80 }
                ].map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-200">{metric.name}</span>
                      <span className="font-bold text-white">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-3">
                      <div 
                        className={`${metric.color} h-3 rounded-full transition-all duration-500 shadow-sm`}
                        style={{ width: `${Math.min((metric.value / metric.max) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Novo Gráfico - Metabolismo */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500/50 to-orange-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white flex items-center">
                <span className="text-2xl mr-2">⚡</span>
                Metabolismo
              </h3>
            </div>
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="space-y-4">
                {lastMeasurement && [
                  { name: 'Idade Metabólica', value: lastMeasurement.metabolic_age || 25, unit: 'anos', icon: '⏰' },
                  { name: 'Taxa Metabólica', value: Math.round((lastMeasurement.weight_kg || 70) * 24), unit: 'kcal/dia', icon: '🔥' },
                  { name: 'Nível de Atividade', value: 'Moderado', unit: '', icon: '🏃' }
                ].map((metric, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-xl p-3 border border-gray-600">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">{metric.icon}</span>
                        <span className="text-sm text-gray-200">{metric.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-white">{metric.value}{metric.unit}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
