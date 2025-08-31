
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Settings, Brain, FileText, Mail, MessageSquare, Heart, Utensils, Target, Phone } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { AIConfigModal } from '@/components/AIConfigModal';

interface AIConfiguration {
  id: string;
  functionality: string;
  service_name: string;
  model: string;
  max_tokens: number;
  temperature: number;
  is_active: boolean;
  preset_level: string;
  system_prompt?: string;
}

const functionalities = [
  {
    key: 'chat_daily',
    title: 'Chat Diário',
    description: 'Conversas e orientações personalizadas',
    icon: MessageSquare,
    color: 'bg-blue-50 border-blue-200'
  },
  {
    key: 'weekly_report',
    title: 'Relatórios Semanais',
    description: 'Análises e insights semanais automáticos',
    icon: FileText,
    color: 'bg-green-50 border-green-200'
  },
  {
    key: 'monthly_report',
    title: 'Relatórios Mensais',
    description: 'Relatórios mensais completos e detalhados',
    icon: FileText,
    color: 'bg-purple-50 border-purple-200'
  },
  {
    key: 'medical_analysis',
    title: 'Análise Médica',
    description: 'Interpretação inteligente de exames médicos',
    icon: Heart,
    color: 'bg-red-50 border-red-200'
  },
  {
    key: 'preventive_analysis',
    title: 'Análise Preventiva',
    description: 'Identificação precoce de riscos à saúde',
    icon: Brain,
    color: 'bg-orange-50 border-orange-200'
  },
  {
    key: 'food_analysis',
    title: 'Análise Alimentar',
    description: 'Avaliação nutricional de refeições via foto',
    icon: Utensils,
    color: 'bg-yellow-50 border-yellow-200'
  },
  {
    key: 'daily_missions',
    title: 'Missões Diárias',
    description: 'Geração inteligente de tarefas personalizadas',
    icon: Target,
    color: 'bg-indigo-50 border-indigo-200'
  },
  {
    key: 'whatsapp_reports',
    title: 'Relatórios WhatsApp',
    description: 'Envio automático via WhatsApp Business',
    icon: Phone,
    color: 'bg-green-50 border-green-200'
  },
  {
    key: 'email_reports',
    title: 'Relatórios Email',
    description: 'Envio personalizado de relatórios por email',
    icon: Mail,
    color: 'bg-blue-50 border-blue-200'
  }
];

export default function AIControlPage() {
  const [configurations, setConfigurations] = useState<AIConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConfig, setSelectedConfig] = useState<AIConfiguration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_configurations')
        .select('*');

      if (error) throw error;

      setConfigurations((data || []).map((config: any) => ({
        ...config,
        service_name: config.service,
        is_active: config.is_active ?? config.is_enabled,
        preset_level: config.level,
        system_prompt: config.system_prompt,
      })));
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const toggleAI = async (functionality: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('ai_configurations')
        .update({ is_enabled: !currentStatus, is_active: !currentStatus })
        .eq('functionality', functionality);

      if (error) throw error;

      setConfigurations(prev =>
        prev.map(config =>
          config.functionality === functionality
            ? { ...config, is_active: !currentStatus }
            : config
        )
      );

      toast.success(`IA ${!currentStatus ? 'ativada' : 'desativada'} com sucesso`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast.error('Erro ao alterar status da IA');
    }
  };

  const openConfigModal = (functionality: string) => {
    let config = configurations.find(c => c.functionality === functionality);
    
    if (!config) {
      config = {
        id: `temp-${functionality}`,
        functionality,
        service_name: 'openai',
        model: 'gpt-4o',
        max_tokens: 4096,
        temperature: 0.8,
        is_active: false,
        preset_level: 'maximo'
      };
    }
    
    setSelectedConfig(config);
    setIsModalOpen(true);
  };

  const saveConfiguration = async (config: AIConfiguration) => {
    try {
      const payload = {
        functionality: config.functionality,
        service: config.service_name,
        model: config.model,
        max_tokens: config.max_tokens,
        temperature: config.temperature,
        is_enabled: config.is_active,
        is_active: config.is_active,
        level: config.preset_level,
        system_prompt: config.system_prompt,
      } as any;

      if (config.id.startsWith('temp-')) {
        const { error } = await supabase
          .from('ai_configurations')
          .upsert(payload, { onConflict: 'functionality' });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('ai_configurations')
          .update(payload)
          .eq('id', config.id);

        if (error) throw error;
      }

      await loadConfigurations();
      toast.success('Configuração salva com sucesso');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      toast.error('Erro ao salvar configuração');
    }
  };

  const getConfigForFunctionality = (functionality: string) => {
    return configurations.find(c => c.functionality === functionality);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center gap-3 mb-8">
        <Brain className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Controle Unificado de IA</h1>
          <p className="text-gray-600">Gerencie todas as funcionalidades de IA em um só lugar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {functionalities.map((func) => {
          const config = getConfigForFunctionality(func.key);
          const IconComponent = func.icon;
          
          return (
            <Card key={func.key} className={`${func.color} hover:shadow-lg transition-shadow`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg">
                      <IconComponent className="w-5 h-5 text-gray-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{func.title}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{func.description}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openConfigModal(func.key)}
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={config?.is_active ? "default" : "secondary"}>
                      {config?.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                    {config && (
                      <span className="text-xs text-gray-500">
                        {config.model}
                      </span>
                    )}
                  </div>
                  <Switch
                    checked={config?.is_active || false}
                    onCheckedChange={() => toggleAI(func.key, config?.is_active || false)}
                  />
                </div>
                
                {config && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Tokens: {config.max_tokens}</span>
                      <span>Temp: {config.temperature}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AIConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        config={selectedConfig}
        onSave={saveConfiguration}
      />
    </div>
  );
}
