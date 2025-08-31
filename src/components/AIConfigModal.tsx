
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { X } from 'lucide-react';

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

interface AIConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AIConfiguration | null;
  onSave: (config: AIConfiguration) => void;
}

export const AIConfigModal: React.FC<AIConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [localConfig, setLocalConfig] = useState<AIConfiguration | null>(config);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [loadingOllama, setLoadingOllama] = useState(false);

  React.useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  React.useEffect(() => {
    const loadOllamaTags = async () => {
      if (!localConfig || localConfig.service_name !== 'ollama') return;
      setLoadingOllama(true);
      try {
        // Se existir variável do frontend, utiliza; caso contrário, usa host padrão
        const base = (import.meta as any).env?.VITE_OLLAMA_PROXY_URL || 'https://ids-ollama.ifrhb3.easypanel.host';
        const resp = await fetch(`${String(base).replace(/\/$/, '')}/api/tags`);
        if (!resp.ok) throw new Error('Falha ao ler tags');
        const data = await resp.json();
        const names: string[] = (data?.models || []).map((m: any) => m?.name).filter(Boolean);
        if (Array.isArray(names) && names.length) setOllamaModels(names);
      } catch (_) {
        // Silencioso: usa fallback
      } finally {
        setLoadingOllama(false);
      }
    };
    loadOllamaTags();
  }, [localConfig?.service_name]);

  if (!localConfig) return null;

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  const getFunctionTitle = (functionality: string) => {
    const titles = {
      chat_daily: 'Chat Diário',
      weekly_report: 'Relatórios Semanais', 
      monthly_report: 'Relatórios Mensais',
      medical_analysis: 'Análise Médica',
      preventive_analysis: 'Análise Preventiva',
      food_analysis: 'Análise Alimentar',
      daily_missions: 'Missões Diárias',
      whatsapp_reports: 'Relatórios WhatsApp',
      email_reports: 'Relatórios Email'
    } as Record<string, string>;
    return titles[functionality] || functionality;
  };

  // Fallback estático para Ollama quando lista dinâmica não estiver disponível
  const ollamaFallback = [
    'llama3.1:8b-instruct-q5_K_M',
    'deepseek-r1:8b',
    'llama3.1:8b',
    'qwen2.5',
    'mistral'
  ];

  const availableOllamaModels = ollamaModels.length ? ollamaModels : ollamaFallback;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="config-dialog-description">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Configuração Avançada: {getFunctionTitle(localConfig.functionality)}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <div id="config-dialog-description" className="sr-only">
            Modal para configuração avançada de parâmetros da IA
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Coluna Esquerda - Status e Configuração */}
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h3 className="font-semibold mb-4">Status</h3>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Ativo</span>
                <Switch
                  checked={localConfig.is_active}
                  onCheckedChange={(checked) =>
                    setLocalConfig({ ...localConfig, is_active: checked })
                  }
                />
              </div>
            </div>

            {/* Configuração de IA */}
            <div>
              <h3 className="font-semibold mb-4">Configuração de IA</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Serviço</label>
                  <select
                    value={localConfig.service_name}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, service_name: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="gemini">Google Gemini</option>
                    <option value="ollama">Ollama</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Modelo</label>
                  <select
                    value={localConfig.model}
                    onChange={(e) =>
                      setLocalConfig({ ...localConfig, model: e.target.value })
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    {localConfig.service_name === 'openai' && (
                      <>
                        <option value="gpt-4o">GPT-4o</option>
                        <option value="gpt-4">GPT-4</option>
                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                        <option value="o1-pro">O1 Pro</option>
                      </>
                    )}
                    {localConfig.service_name === 'gemini' && (
                      <>
                        <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      </>
                    )}
                    {localConfig.service_name === 'ollama' && (
                      <>
                        {loadingOllama && <option value="">Carregando modelos...</option>}
                        {!loadingOllama && availableOllamaModels.map((m) => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Tokens Máximos: {localConfig.max_tokens}
                  </label>
                  <Slider
                    value={[localConfig.max_tokens]}
                    onValueChange={([value]) =>
                      setLocalConfig({ ...localConfig, max_tokens: Math.max(50, value) })
                    }
                    max={8192}
                    min={50}
                    step={50}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Mínimo: 50 tokens • Máximo: 8192 tokens
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Temperatura: {localConfig.temperature}
                  </label>
                  <Slider
                    value={[localConfig.temperature]}
                    onValueChange={([value]) =>
                      setLocalConfig({ ...localConfig, temperature: Math.round(value * 10) / 10 })
                    }
                    max={2}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    0.0 (determinístico) • 2.0 (muito criativo)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coluna Direita - Métricas e Prompt */}
          <div className="space-y-6">
            {/* Métricas */}
            <div>
              <h3 className="font-semibold mb-4">Métricas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Tokens:</span>
                  <span className="font-mono">{localConfig.max_tokens}</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperatura:</span>
                  <span className="font-mono">{localConfig.temperature}</span>
                </div>
                <div className="flex justify-between">
                  <span>Custo:</span>
                  <span className="font-mono text-green-600">$0.002</span>
                </div>
                <div className="flex justify-between">
                  <span>Prioridade:</span>
                  <span className="font-mono">Alta</span>
                </div>
              </div>
            </div>

            {/* Prompt do Sistema */}
            <div>
              <h3 className="font-semibold mb-4">Prompt do Sistema</h3>
              <textarea
                value={localConfig.system_prompt || `Você é um assistente especializado em ${getFunctionTitle(localConfig.functionality).toLowerCase()}. Sua função é fornecer respostas precisas e úteis.`}
                onChange={(e) =>
                  setLocalConfig({ ...localConfig, system_prompt: e.target.value })
                }
                className="w-full h-32 p-3 border rounded-md text-sm resize-none"
                placeholder="Digite o prompt do sistema para esta funcionalidade..."
              />
              <div className="mt-2 text-xs text-gray-500">
                Usado nesta funcionalidade: {getFunctionTitle(localConfig.functionality)}
              </div>
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Fechar
          </Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
            Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
