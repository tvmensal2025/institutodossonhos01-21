import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AreaData {
  name: string;
  score: number;
  icon: string;
  color: string;
}

interface AreaSummaryNodeData {
  areas: AreaData[];
  otherAreasCount: number;
  label: string;
}

interface AreaSummaryNodeProps {
  data: AreaSummaryNodeData;
}

export const AreaSummaryNode: React.FC<AreaSummaryNodeProps> = memo(({ data }) => {
  const { areas, otherAreasCount } = data;

  return (
    <div className="react-flow__node-default">
      <Card 
        className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-slate-700 w-80"
        style={{ minWidth: '320px' }}
      >
      <CardHeader className="text-center pb-4">
        <CardTitle className="text-lg font-semibold text-white">
          Resumo por Área
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {areas.map((area, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-slate-600 last:border-b-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">{area.icon}</span>
              <span className="text-sm text-slate-200 font-medium">
                {area.name}
              </span>
            </div>
            <span className={`text-lg font-bold ${area.color}`}>
              {area.score}%
            </span>
          </div>
        ))}
        
        {otherAreasCount > 0 && (
          <div className="text-center pt-3 border-t border-slate-600">
            <span className="text-xs text-slate-400">
              +{otherAreasCount} outras áreas avaliadas
            </span>
          </div>
        )}
      </CardContent>
      
      {/* Handles para conexões (opcionais) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-slate-500 border-2 border-slate-300"
      />
    </Card>
    </div>
  );
});