import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BodyCompositionData {
  weight_kg?: number;
  body_fat_percentage?: number;
  muscle_mass_kg?: number;
  water_percentage?: number;
  bone_mass?: number;
  visceral_fat?: number;
  metabolic_age?: number;
}

interface BodyCompositionCardProps {
  data: BodyCompositionData;
}

export const BodyCompositionCard: React.FC<BodyCompositionCardProps> = ({ data }) => {
  const metrics = [
    {
      name: 'Gordura Corporal',
      value: data.body_fat_percentage || 0,
      unit: '%',
      icon: '🔥',
      color: 'bg-red-500',
      max: 50
    },
    {
      name: 'Massa Muscular',
      value: data.muscle_mass_kg || 0,
      unit: 'kg',
      icon: '💪',
      color: 'bg-green-500',
      max: 50
    },
    {
      name: 'Água Corporal',
      value: data.water_percentage || 0,
      unit: '%',
      icon: '💧',
      color: 'bg-blue-500',
      max: 100
    },
    {
      name: 'Gordura Visceral',
      value: data.visceral_fat || 0,
      unit: '',
      icon: '⚠️',
      color: 'bg-orange-500',
      max: 30
    }
  ];

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl lg:rounded-3xl shadow-2xl border-2 border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-purple-500/50 to-indigo-500/50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b-2 border-white/20">
        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">Composição Corporal</h3>
      </div>
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{metric.icon}</span>
                  <span className="text-sm text-gray-200">{metric.name}</span>
                </div>
                <span className="font-bold text-white">
                  {metric.value.toFixed(1)}{metric.unit}
                </span>
              </div>
              <Progress 
                value={(metric.value / metric.max) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};