import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DraggableScoreWidgets from './DraggableScoreWidgets';

interface AreaData {
  name: string;
  score: number;
  icon: string;
  color: string;
}

const DashboardWithDraggableWidgets: React.FC = () => {
  // Dados simulados
  const mockData = {
    totalScore: 20,
    areas: [
      {
        name: 'Saúde e Disposição',
        score: 20,
        icon: '💪',
        color: '#f59e0b'
      },
      {
        name: 'Desenvolvimento Intelectual',
        score: 20,
        icon: '🧠',
        color: '#06b6d4'
      },
      {
        name: 'Equilíbrio Emocional',
        score: 20,
        icon: '🧘‍♀️',
        color: '#06b6d4'
      }
    ],
    otherAreasCount: 9
  };

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="container mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            🎯 Dashboard Interativo
          </h1>
          <p className="text-gray-300">
            Arraste os widgets para personalizar seu layout
          </p>
        </div>

        {/* Widgets Arrastáveis */}
        <div className="mb-8">
          <DraggableScoreWidgets
            totalScore={mockData.totalScore}
            areas={mockData.areas}
            otherAreasCount={mockData.otherAreasCount}
            layout="horizontal"
          />
        </div>

        {/* Outros componentes do dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">📊 Estatísticas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Outros componentes do dashboard podem ser adicionados aqui.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">🎯 Metas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Sistema de metas e objetivos.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 text-white border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">📈 Progresso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">
                Acompanhamento de progresso.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardWithDraggableWidgets; 