import React from 'react';
interface MedicalHealthAnalysisProps {
  data: any[];
  period: 'day' | 'week' | 'month';
  userGoals: any;
}
export const MedicalHealthAnalysis: React.FC<MedicalHealthAnalysisProps> = ({
  data,
  period,
  userGoals
}) => {
  console.log('MedicalHealthAnalysis - Componente sendo renderizado!');
  console.log('MedicalHealthAnalysis - Dados recebidos:', data);
  console.log('MedicalHealthAnalysis - Período:', period);

  // Renderizar um div simples para debug
  return (
    <div>
      <p>MedicalHealthAnalysis Debug</p>
    </div>
  );
};