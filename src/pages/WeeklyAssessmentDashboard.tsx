import React, { useState } from 'react';
import { UltraBodyComposition } from '@/components/charts/UltraBodyComposition';
import { UltraHydration } from '@/components/charts/UltraHydration';
import { HydrationGauge } from '@/components/charts/HydrationGauge';
import { UltraWaterBalance } from '@/components/charts/UltraWaterBalance';
import { UltraLeanMass } from '@/components/charts/UltraLeanMass';
import { BodyMetricsChart } from '@/components/charts/BodyMetricsChart';
import { CellularAnalysisChart } from '@/components/charts/CellularAnalysisChart';
import { EvolutionChart } from '@/components/charts/EvolutionChart';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Scale, Users, Calendar, Bluetooth, Activity, TrendingUp } from 'lucide-react';

// Dados mock para exemplo
const mockUsers = [
  {
    id: '1',
    name: 'Rafael Ferreira Dias',
    email: 'rafael@instituto.com',
    birth_date: '1973-09-20',
    height_cm: 179,
    gender: 'M'
  },
  // ... outros usuários
];

const mockMeasurements = [
  {
    date: '31/07/2025',
    peso: 107.0,
    gorduraCorporal: 36.7,
    massaMagra: 67.7,
    imc: 33.4,
    hidratacao: 3.5
  },
  {
    date: '24/07/2025',
    peso: 108.2,
    gorduraCorporal: 37.1,
    massaMagra: 67.2,
    imc: 33.8,
    hidratacao: 3.4
  },
  {
    date: '17/07/2025',
    peso: 109.5,
    gorduraCorporal: 37.8,
    massaMagra: 66.8,
    imc: 34.2,
    hidratacao: 3.3
  }
];

const WeeklyAssessmentDashboard: React.FC = () => {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [showWeighingModal, setShowWeighingModal] = useState(false);
  const [weighingType, setWeighingType] = useState<'balanca' | 'manual'>('balanca');

  // Dados atuais (última medição)
  const currentData = {
    peso: 107.0,
    altura: 179,
    massaGorda: 39.3,
    percentualGordura: 36.7,
    aguaCorporalTotal: 48.3,
    aguaCorporalPercentual: 45.2,
    indiceHidratacao: 3.5,
    aguaMassaMagra: 71.3,
    aguaIntracelular: 27.8,
    aguaIntracelularPercentual: 57.5,
    aguaExtracelular: 20.5,
    aguaExtracelularPercentual: 42.5,
    massaMagra: 67.7,
    massaMagraPercentual: 63.3,
    massaMuscular: 30.1,
    massaMuscularPercentual: 28.2,
    razaoMusculoGordura: 0.8,
    imc: 33.4,
    tmb: 1906,
    anguloFase: 6.1,
    idadeCronologica: 51,
    idadeCelular: 57
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      {/* Header Premium */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Título e Subtítulo */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Avaliação Semanal
              </h1>
              <p className="text-gray-600 mt-1">
                Análise completa de composição corporal e bioimpedância
              </p>
            </div>

            {/* Controles */}
            <div className="flex items-center space-x-4">
              {/* Seletor de Paciente */}
              <Select 
                value={selectedUser.id} 
                onValueChange={(value) => {
                  const user = mockUsers.find(u => u.id === value);
                  if (user) setSelectedUser(user);
                }}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="Selecionar Paciente" />
                </SelectTrigger>
                <SelectContent>
                  {mockUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{user.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Modal Nova Pesagem */}
              <Dialog open={showWeighingModal} onOpenChange={setShowWeighingModal}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Scale className="h-4 w-4 mr-2" />
                    Nova Avaliação
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Nova Avaliação - {selectedUser.name}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Método de Avaliação</Label>
                      <Select value={weighingType} onValueChange={(value: 'balanca' | 'manual') => setWeighingType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="balanca">
                            <div className="flex items-center space-x-2">
                              <Bluetooth className="h-4 w-4" />
                              <span>Balança Bluetooth</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="manual">
                            <div className="flex items-center space-x-2">
                              <Scale className="h-4 w-4" />
                              <span>Medição Manual</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {weighingType === 'manual' ? (
                      <>
                        <div>
                          <Label>Peso (kg)</Label>
                          <Input type="number" step="0.1" placeholder="Ex: 75.5" />
                        </div>
                        <div>
                          <Label>Circunferência Abdominal (cm)</Label>
                          <Input type="number" placeholder="Ex: 85" />
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-6">
                        <Bluetooth className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                        <p className="text-gray-600">
                          Conecte sua balança Bluetooth para iniciar a medição automática.
                        </p>
                      </div>
                    )}

                    <Button className="w-full">
                      {weighingType === 'balanca' ? 'Conectar Balança' : 'Salvar Medição'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Info do Paciente */}
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Calendar className="h-4 w-4 mr-1" />
              {selectedUser.birth_date}
            </Badge>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Activity className="h-4 w-4 mr-1" />
              {currentData.altura}cm
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              <TrendingUp className="h-4 w-4 mr-1" />
              {mockMeasurements.length} avaliações
            </Badge>
          </div>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Composição Corporal Ultra - Tela Cheia */}
        <div className="mb-6">
          <UltraBodyComposition
            data={{
              massaGorda: currentData.massaGorda,
              percentualGordura: currentData.percentualGordura,
              massaMagra: currentData.massaMagra,
              percentualMagra: currentData.massaMagraPercentual,
              agua: currentData.aguaCorporalTotal,
              percentualAgua: currentData.aguaCorporalPercentual,
              minerais: 3.2,
              percentualMinerais: 3.0
            }}
            historico={[
              { data: '01/05/2025', percentualGordura: 38.2 },
              { data: '01/06/2025', percentualGordura: 37.5 },
              { data: '01/07/2025', percentualGordura: 36.7 }
            ]}
            idade={currentData.idadeCronologica}
            sexo="M"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Outros componentes aqui */}
          
          {/* Hidratação Ultra - Último */}
          <div className="lg:col-span-2">
            <UltraHydration
              data={{
                aguaCorporalTotal: currentData.aguaCorporalTotal,
                aguaCorporalPercentual: currentData.aguaCorporalPercentual,
                indiceHidratacao: currentData.indiceHidratacao,
                aguaMassaMagra: currentData.aguaMassaMagra,
                recomendacaoDiaria: 3.5
              }}
              horarios={[
                { hora: '07:00', quantidade: 450, status: 'ideal' },
                { hora: '09:00', quantidade: 350, status: 'ideal' },
                { hora: '11:00', quantidade: 350, status: 'ideal' },
                { hora: '13:00', quantidade: 300, status: 'ideal' },
                { hora: '15:00', quantidade: 250, status: 'ideal' },
                { hora: '17:00', quantidade: 200, status: 'alerta' },
                { hora: '19:00', quantidade: 100, status: 'critico' }
              ]}
              historico={[
                { data: '24/07', indiceHidratacao: 3.3 },
                { data: '17/07', indiceHidratacao: 3.4 },
                { data: '10/07', indiceHidratacao: 3.2 }
              ]}
            />
          </div>

          {/* Água Intra/Extra Celular Ultra */}
          <UltraWaterBalance
            aguaIntracelular={currentData.aguaIntracelular}
            aguaIntracelularPercentual={currentData.aguaIntracelularPercentual}
            aguaExtracelular={currentData.aguaExtracelular}
            aguaExtracelularPercentual={currentData.aguaExtracelularPercentual}
          />

          {/* Massa Magra Ultra */}
          <UltraLeanMass
            massaMagra={currentData.massaMagra}
            massaMagraPercentual={currentData.massaMagraPercentual}
            massaMuscular={currentData.massaMuscular}
            massaMuscularPercentual={currentData.massaMuscularPercentual}
            razaoMusculoGordura={currentData.razaoMusculoGordura}
            classificacao="Regular"
            altura={currentData.altura}
            idade={currentData.idadeCronologica}
            sexo="M"
          />

          {/* Métricas Corporais */}
          <BodyMetricsChart
            peso={currentData.peso}
            altura={currentData.altura}
            imc={currentData.imc}
            tmb={currentData.tmb}
            classificacaoIMC="Obesidade grau I"
            risco="ALTO"
          />

          {/* Análise Celular */}
          <CellularAnalysisChart
            anguloFase={currentData.anguloFase}
            idadeCronologica={currentData.idadeCronologica}
            idadeCelular={currentData.idadeCelular}
            classificacao="Bom"
          />
        </div>

        {/* Evolução Temporal */}
        <div className="mt-6">
          <EvolutionChart
            measurements={mockMeasurements}
            metricaAtual={{
              peso: currentData.peso,
              gorduraCorporal: currentData.percentualGordura,
              massaMagra: currentData.massaMagra,
              imc: currentData.imc,
              hidratacao: currentData.indiceHidratacao
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default WeeklyAssessmentDashboard;