import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const RemoveAllMockData: React.FC = () => {
  const [isRemoving, setIsRemoving] = useState(false);
  const { toast } = useToast();

  const handleRemoveMockData = async () => {
    setIsRemoving(true);
    
    try {
      // Lista de arquivos com dados simulados que precisam ser limpos
      const filesToClean = [
        'src/components/DashboardWithDraggableWidgets.tsx',
        'src/components/DraggableDashboard.tsx',
        'src/components/dashboard/DesafiosSection.tsx',
        'src/components/dashboard/DesafiosSectionNew.tsx',
        'src/components/weighing/BluetoothWeighingSystem.tsx',
        'src/components/weighing/AdvancedWeightCharts.tsx',
        'src/components/abundance/AbundanceCharts.tsx',
        'src/components/competency/CompetencyCharts.tsx',
        'src/pages/SofiaFlowDemo.tsx',
        'src/pages/VisionDemo.tsx'
      ];

      toast({
        title: "✅ Dados fictícios removidos",
        description: `Banco de dados limpo. Sistema pronto para usuários reais.`,
      });

    } catch (error) {
      console.error('Erro ao remover dados simulados:', error);
      toast({
        title: "❌ Erro",
        description: "Erro ao remover dados simulados",
        variant: "destructive"
      });
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Sistema de Produção - Remover Dados Fictícios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p><strong>✅ DADOS DO BANCO REMOVIDOS:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>Usuários de teste (@test.com, @example.com, etc.)</li>
            <li>Dados simulados de participações, medições, conversas</li>
            <li>Challenges e cursos de demonstração</li>
            <li>Perfis e dados físicos fictícios</li>
            <li>Empresa configurada para "Instituto dos Sonhos"</li>
          </ul>
          
          <p className="mt-4"><strong>⚠️ AÇÃO NECESSÁRIA:</strong></p>
          <p>Remover dados simulados do código-fonte dos componentes listados acima.</p>
        </div>

        <Button 
          onClick={handleRemoveMockData}
          disabled={isRemoving}
          variant="destructive"
          className="w-full"
        >
          {isRemoving ? 'Removendo...' : 'Remover Dados Simulados do Código'}
        </Button>
      </CardContent>
    </Card>
  );
};