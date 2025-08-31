import React from 'react';
interface HealthExecutiveSummaryProps {
  data: any[];
  period: 'day' | 'week' | 'month';
  userGoals: any;
}
export const HealthExecutiveSummary: React.FC<HealthExecutiveSummaryProps> = ({
  data,
  period,
  userGoals
}) => {
  console.log('HealthExecutiveSummary - Componente sendo renderizado!');
  console.log('HealthExecutiveSummary - Dados recebidos:', data);
  console.log('HealthExecutiveSummary - Período:', period);

  // Renderizar um div simples para debug
  return (
    <div>
      <p>HealthExecutiveSummary Debug</p>
    </div>
  );
};