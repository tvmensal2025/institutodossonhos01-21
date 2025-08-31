import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface WeightData {
  peso_kg: number;
  measurement_date: string;
}

interface WeightChartProps {
  data: WeightData[];
}

export const WeightChart: React.FC<WeightChartProps> = ({ data }) => {
  const formatData = data.map(item => ({
    ...item,
    date: new Date(item.measurement_date).toLocaleDateString('pt-BR'),
    weight: item.peso_kg
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={formatData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
        <XAxis 
          dataKey="date" 
          stroke="#9CA3AF"
          fontSize={12}
        />
        <YAxis 
          stroke="#9CA3AF"
          fontSize={12}
          domain={['dataMin - 2', 'dataMax + 2']}
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#1F2937', 
            border: 'none', 
            borderRadius: '8px',
            color: '#F9FAFB'
          }}
        />
        <Line 
          type="monotone" 
          dataKey="weight" 
          stroke="#3B82F6" 
          strokeWidth={2}
          dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};