import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AbundanceArea {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
}

interface AbundanceChartsProps {
  responses: Record<string, number>;
  areas: AbundanceArea[];
}

export const AbundanceCharts: React.FC<AbundanceChartsProps> = ({
  responses,
  areas
}) => {
  // Dados para gráfico de barras (ranking)
  const barData = areas
    .map(area => ({
      name: area.name.split(' ')[0], // Nome curto
      fullName: area.name,
      score: responses[area.id] * 20, // Converter para percentual
      icon: area.icon
    }))
    .sort((a, b) => b.score - a.score);

  // Dados para gráfico de pizza (distribuição por nível)
  const distributionData = [
    {
      name: 'Excelente (80-100%)',
      value: areas.filter(area => responses[area.id] >= 4).length,
      color: 'hsl(var(--success))',
      emoji: '💎'
    },
    {
      name: 'Bom (60-79%)',
      value: areas.filter(area => responses[area.id] === 3).length,
      color: 'hsl(var(--health-calories))',
      emoji: '💰'
    },
    {
      name: 'Atenção (40-59%)',
      value: areas.filter(area => responses[area.id] === 2).length,
      color: 'hsl(var(--warning))',
      emoji: '⚠️'
    },
    {
      name: 'Crítico (0-39%)',
      value: areas.filter(area => responses[area.id] === 1).length,
      color: 'hsl(var(--destructive))',
      emoji: '🚨'
    }
  ].filter(item => item.value > 0);

  // Dados simulados para evolução (seria real em implementação completa)
  const evolutionData = [
    { mes: 'Jan', score: 45 },
    { mes: 'Fev', score: 48 },
    { mes: 'Mar', score: 52 },
    { mes: 'Abr', score: 58 },
    { mes: 'Mai', score: 62 },
    { mes: 'Atual', score: Math.round((Object.values(responses).reduce((a, b) => a + b, 0) / Object.keys(responses).length) * 20) }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      
      {/* Gráfico de Barras - Ranking */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            📊 Ranking por Área
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                {barData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={
                      entry.score >= 80 ? 'hsl(var(--success))' :
                      entry.score >= 60 ? 'hsl(var(--health-calories))' :
                      entry.score >= 40 ? 'hsl(var(--warning))' : 'hsl(var(--destructive))'
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
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

      {/* Gráfico de Linha - Evolução */}
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white flex items-center gap-2">
            📈 Evolução da Abundância
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="mes" stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="hsl(var(--health-steps))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--health-steps))', strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, stroke: 'hsl(var(--health-steps))', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          <div className="text-center mt-4">
            <p className="text-sm text-slate-300">
              📅 Evolução dos últimos 6 meses
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};