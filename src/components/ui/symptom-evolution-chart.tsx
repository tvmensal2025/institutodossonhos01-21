import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';

interface EvolutionDataPoint {
  month: string;
  score: number;
}

interface SymptomEvolutionChartProps {
  data?: EvolutionDataPoint[];
  className?: string;
  title?: string;
}

export const SymptomEvolutionChart: React.FC<SymptomEvolutionChartProps> = ({
  data,
  className = "",
  title = "Evolução dos Sintomas"
}) => {
  // Dados padrão se não fornecidos
  const defaultData = [
    { month: 'jan', score: 140 },
    { month: 'fev', score: 80 },
    { month: 'mar', score: 30 },
    { month: 'abr', score: 6 },
    { month: 'mai', score: 8 },
    { month: 'jun', score: 10 }
  ];

  const chartData = data && data.length > 0 ? data : defaultData;

  return (
    <Card className={`bg-gray-900 text-white border-gray-700 ${className}`}>
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-white text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3,3" stroke="#444" />
            <XAxis 
              dataKey="month" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9ca3af', fontSize: 12 }}
              domain={[0, 150]}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#eab308"
              strokeWidth={4}
              dot={{ fill: '#eab308', strokeWidth: 2, r: 8 }}
              activeDot={{ r: 10, fill: '#eab308' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default SymptomEvolutionChart;