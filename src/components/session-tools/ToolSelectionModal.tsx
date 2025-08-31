import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SessionTool } from '@/types/session-tools';
import { FileText, Users, Scale, Heart, Brain, Target, Zap, Sparkles } from 'lucide-react';

// Importar os componentes das ferramentas
import LimitingBeliefsWheel from '@/components/LimitingBeliefsWheel';
import HealthPyramidMapping from '@/components/HealthPyramidMapping';
import EmotionalTraumaMapping from '@/components/EmotionalTraumaMapping';


const availableTools: SessionTool[] = [
  {
    id: 'limiting-beliefs',
    name: 'Avaliação de Crenças Limitantes',
    description: 'Identifica e mapeia crenças que podem estar sabotando o progresso',
    icon: 'Brain',
    component: LimitingBeliefsWheel,
    estimatedTime: 15,
    category: 'assessment'
  },
  {
    id: 'health-pyramid',
    name: 'Mapeamento da Pirâmide de Saúde',
    description: 'Avalia as 4 dimensões hierárquicas da saúde (Física, Emocional, Mental, Espiritual)',
    icon: 'Zap',
    component: HealthPyramidMapping,
    estimatedTime: 25,
    category: 'assessment'
  },
  {
    id: 'trauma-mapping',
    name: 'Mapeamento de Traumas Emocionais',
    description: 'Ferramenta sensível para identificar e processar traumas relacionados ao peso',
    icon: 'Heart',
    component: EmotionalTraumaMapping,
    estimatedTime: 30,
    category: 'intervention'
  },

];

interface ToolSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (tool: SessionTool) => void;
  availableToolIds: string[];
  completedTools: string[];
}

const getIcon = (iconName: string) => {
  const icons = {
    Brain,
    Zap,
    Heart,
    FileText,
    Users,
    Scale,
    Target,
    Sparkles
  };
  const IconComponent = icons[iconName as keyof typeof icons] || FileText;
  return <IconComponent className="w-6 h-6" />;
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'assessment': return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    case 'intervention': return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    case 'analysis': return 'bg-green-500/20 text-green-300 border-green-500/30';
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
  }
};

const getCategoryLabel = (category: string) => {
  switch (category) {
    case 'assessment': return 'Avaliação';
    case 'intervention': return 'Intervenção';
    case 'analysis': return 'Análise';
    default: return 'Ferramenta';
  }
};

export const ToolSelectionModal: React.FC<ToolSelectionModalProps> = ({
  isOpen,
  onClose,
  onSelectTool,
  availableToolIds,
  completedTools
}) => {
  const filteredTools = availableTools.filter(tool => 
    availableToolIds.includes(tool.id)
  );

  const groupedTools = filteredTools.reduce((acc, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {} as Record<string, SessionTool[]>);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            🛠️ Ferramentas da Sessão
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(groupedTools).map(([category, tools]) => (
            <div key={category}>
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Badge variant="outline" className={getCategoryColor(category)}>
                  {getCategoryLabel(category)}
                </Badge>
                <span>({tools.length} ferramentas)</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tools.map((tool) => {
                  const isCompleted = completedTools.includes(tool.id);
                  
                  return (
                    <Card 
                      key={tool.id} 
                      className={`bg-gray-800/90 border-gray-700 transition-all hover:border-primary/50 ${
                        isCompleted ? 'border-green-500/50 bg-green-500/10' : ''
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <CardTitle className="text-white flex items-center gap-3">
                          {getIcon(tool.icon)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {tool.name}
                              {isCompleted && (
                                <Badge variant="default" className="bg-green-600 text-white">
                                  Concluída
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-400 font-normal mt-1">
                              ⏱️ {tool.estimatedTime} min
                            </div>
                          </div>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-300 text-sm mb-4">
                          {tool.description}
                        </p>
                        <Button 
                          onClick={() => onSelectTool(tool)}
                          className="w-full"
                          variant={isCompleted ? "outline" : "default"}
                        >
                          {isCompleted ? 'Ver Resultados' : 'Iniciar Ferramenta'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
          
          {filteredTools.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-400">Nenhuma ferramenta disponível para esta sessão.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};