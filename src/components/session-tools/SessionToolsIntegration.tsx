import React, { useState } from 'react';
import { SessionTool, ToolResponse } from '@/types/session-tools';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SessionToolsIntegrationProps {
  userSessionId: string;
  userId: string;
  selectedTool: SessionTool;
  existingData?: ToolResponse;
  onComplete: (toolResponse: ToolResponse) => void;
  onClose: () => void;
}

export const SessionToolsIntegration: React.FC<SessionToolsIntegrationProps> = ({
  userSessionId,
  userId,
  selectedTool,
  existingData,
  onComplete,
  onClose
}) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  // Componente da ferramenta selecionada
  const ToolComponent = selectedTool.component;

  const handleToolComplete = async (toolData: any) => {
    setIsCompleting(true);
    try {
      const toolResponse: ToolResponse = {
        toolId: selectedTool.id,
        completedAt: new Date().toISOString(),
        data: toolData,
        score: toolData.overallScore || toolData.averageScore || 0,
        insights: toolData.insights || toolData.recommendations || []
      };

      // Buscar tools_data atual da user_session
      const { data: current, error: fetchError } = await supabase
        .from('user_sessions')
        .select('tools_data')
        .eq('id', userSessionId)
        .single();
      if (fetchError) throw fetchError;

      const baseTools: Record<string, any> = (current?.tools_data as Record<string, any>) || {};
      const newToolsData: Record<string, any> = {
        ...baseTools,
        [selectedTool.id]: toolResponse
      };

      // Salvar no banco de dados na tabela correta (user_sessions)
      const { error: updateError } = await supabase
        .from('user_sessions')
        .update({ tools_data: newToolsData, last_activity: new Date().toISOString() })
        .eq('id', userSessionId);
      if (updateError) throw updateError;

      toast({
        title: 'Ferramenta concluída!',
        description: `${selectedTool.name} foi concluída e os dados foram salvos.`,
      });

      onComplete(toolResponse);
    } catch (error: any) {
      console.error('Erro ao salvar dados da ferramenta:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar os dados da ferramenta. Tente novamente.',
        variant: 'destructive'
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-6">
      <div className="container mx-auto max-w-7xl">
        {/* Header da Ferramenta */}
        <Card className="bg-gray-800/90 backdrop-blur border-gray-700 mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">{selectedTool.icon}</span>
                </div>
                <div>
                  <CardTitle className="text-white text-xl">
                    {selectedTool.name}
                  </CardTitle>
                  <p className="text-gray-400">{selectedTool.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">
                  ⏱️ {selectedTool.estimatedTime} min
                </Badge>
                {existingData && (
                  <Badge variant="default" className="bg-green-600">
                    Já Concluída
                  </Badge>
                )}
                <Button variant="outline" onClick={onClose}>
                  Voltar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Ferramenta Integrada */}
        <div className="bg-gray-900/50 rounded-lg p-1">
          <ToolComponent 
            onComplete={handleToolComplete}
            existingData={existingData?.data}
            sessionMode={true}
            isCompleting={isCompleting}
          />
        </div>
      </div>
    </div>
  );
};