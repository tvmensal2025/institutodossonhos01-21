
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Users, 
  Target, 
  Calendar, 
  Brain,
  Bot
} from 'lucide-react';
import UnifiedManagement from './UnifiedManagement';

type ToolType = 'overview' | 'management';

const ToolsManagement: React.FC = () => {
  const [activetool, setActiveTools] = useState<ToolType>('overview');

  const tools = [
    {
      id: 'management' as ToolType,
      title: 'Gerenciamento Unificado',
      description: 'Gerenciar sabotadores e sessões em uma única interface',
      icon: <Users className="h-6 w-6" />,
      color: 'bg-blue-500'
    }
  ];

  const renderContent = () => {
    switch (activetool) {
      case 'management':
        return <UnifiedManagement />;
      default:
        return (
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {tools.map((tool) => (
              <Card key={tool.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tool.color} text-white`}>
                      {tool.icon}
                    </div>
                    <div>
                      <CardTitle>{tool.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => setActiveTools(tool.id)}
                    className="w-full"
                  >
                    Acessar {tool.title}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Ferramentas Administrativas</h2>
          <p className="text-muted-foreground">
            Gerenciamento unificado de sabotadores e sessões
          </p>
        </div>
        {activetool !== 'overview' && (
          <Button 
            variant="outline" 
            onClick={() => setActiveTools('overview')}
          >
            Voltar para Visão Geral
          </Button>
        )}
      </div>

      {renderContent()}
    </div>
  );
};

export default ToolsManagement;
