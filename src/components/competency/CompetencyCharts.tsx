import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface CompetencyArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface CompetencyChartsProps {
  responses: Record<string, number>;
  areas: CompetencyArea[];
}

export const CompetencyCharts: React.FC<CompetencyChartsProps> = ({
  responses,
  areas
}) => {
  // Dados para gráfico de barras (ranking)
  const barData = areas
    .map(area => ({
      name: area.name.length > 15 ? area.name.substring(0, 12) + '...' : area.name,
      fullName: area.name,
      score: responses[area.id],
      icon: area.icon
    }))
    .sort((a, b) => b.score - a.score);

  // Dados para gráfico radar (comparação com perfil ideal)
  const radarData = areas.map(area => ({
    subject: area.name.split(' ')[0], // Nome curto
    atual: responses[area.id],
    ideal: 8, // Score ideal para comparação
    fullName: area.name
  }));

  // Dados para gráfico de pizza (distribuição por nível)
  const distributionData = [
    {
      name: 'Excepcional (9-10)',
      value: areas.filter(area => responses[area.id] >= 9).length,
      color: '#3b82f6',
      emoji: '🔵'
    },
    {
      name: 'Bom (7-8)',
      value: areas.filter(area => responses[area.id] >= 7 && responses[area.id] <= 8).length,
      color: '#10b981',
      emoji: '🟢'
    },
    {
      name: 'Adequado (5-6)',
      value: areas.filter(area => responses[area.id] >= 5 && responses[area.id] <= 6).length,
      color: '#eab308',
      emoji: '🟡'
    },
    {
      name: 'Desenvolvimento (3-4)',
      value: areas.filter(area => responses[area.id] >= 3 && responses[area.id] <= 4).length,
      color: '#f97316',
      emoji: '🟠'
    },
    {
      name: 'Básico (1-2)',
      value: areas.filter(area => responses[area.id] >= 1 && responses[area.id] <= 2).length,
      color: '#ef4444',
      emoji: '🔴'
    }
  ].filter(item => item.value > 0);

  // Dados simulados para benchmark de mercado
  const benchmarkData = areas.map(area => ({
    name: area.name.split(' ')[0],
    meuScore: responses[area.id],
    mercado: Math.floor(Math.random() * 3) + 6, // Simula média de mercado entre 6-8
    fullName: area.name
  }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Gráfico de Barras - Ranking */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            📊 Ranking de Competências
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" domain={[0, 10]} stroke="#94a3b8" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={100}
                stroke="#94a3b8"
                fontSize={12}
              />
              <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.score >= 9 ? '#3b82f6' :
                      entry.score >= 7 ? '#10b981' :
                      entry.score >= 5 ? '#eab308' :
                      entry.score >= 3 ? '#f97316' : '#ef4444'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico Radar - Competências vs Ideal */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            🎯 Perfil vs Ideal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#374151" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 10]} 
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Radar
                name="Atual"
                dataKey="atual"
                stroke="#3b82f6"
                fill="#3b82f6"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <Radar
                name="Ideal"
                dataKey="ideal"
                stroke="#10b981"
                fill="transparent"
                strokeWidth={2}
                strokeDasharray="5 5"
              />
            </RadarChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-slate-300">Seu Perfil</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1 bg-green-500"></div>
              <span className="text-sm text-slate-300">Perfil Ideal</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico de Pizza - Distribuição */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            🥧 Distribuição por Nível
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {distributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Legenda customizada */}
          <div className="space-y-2 mt-4">
            {distributionData.map((entry, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-300">{entry.name}</span>
                </div>
                <span className="text-white font-medium">{entry.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benchmark de Mercado */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            📈 Benchmark de Mercado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={benchmarkData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
              <YAxis domain={[0, 10]} stroke="#94a3b8" />
              <Bar dataKey="meuScore" fill="#3b82f6" name="Meu Score" />
              <Bar dataKey="mercado" fill="#64748b" name="Média Mercado" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-sm text-slate-300">Meu Score</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-slate-500 rounded"></div>
              <span className="text-sm text-slate-300">Média Mercado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};