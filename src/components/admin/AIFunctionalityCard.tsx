import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Save, RotateCcw, TrendingUp, DollarSign } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AIConfig {
  id: string;
  functionality: string;
  service: string;
  model: string;
  max_tokens: number;
  temperature: number;
  is_enabled: boolean;
  preset_level: string;
}

interface AIFunctionalityCardProps {
  config: AIConfig;
  onUpdate: (config: Partial<AIConfig>) => Promise<void>;
  onReset: () => void;
  estimatedCost?: number;
}

const models = {
  openai: [
    { id: 'gpt-4.1-2025-04-14', name: 'GPT-4.1', cost: 0.03 },
    { id: 'o3-2025-04-16', name: 'o3-PRO', cost: 0.06 },
    { id: 'gpt-4.1-mini-2025-04-14', name: 'GPT-4.1 Mini', cost: 0.015 }
  ],
  gemini: [
    { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', cost: 0.02 },
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', cost: 0.035 }
  ]
};

const functionalityNames = {
  chat_daily: { name: 'Chat Diário', icon: '💬', description: 'Conversas com a Sofia' },
  weekly_report: { name: 'Relatório Semanal', icon: '📊', description: 'Análise semanal de progresso' },
  monthly_report: { name: 'Relatório Mensal', icon: '📈', description: 'Relatório mensal detalhado' },
  medical_analysis: { name: 'Análise Médica', icon: '🏥', description: 'Análise de exames médicos' },
  preventive_analysis: { name: 'Análise Preventiva', icon: '🛡️', description: 'Análise preventiva de saúde' }
};

export function AIFunctionalityCard({ config, onUpdate, onReset, estimatedCost }: AIFunctionalityCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);
  const { toast } = useToast();

  const functionality = functionalityNames[config.functionality as keyof typeof functionalityNames];

  const handleUpdate = async (updates: Partial<AIConfig>) => {
    setIsUpdating(true);
    try {
      const newConfig = { ...localConfig, ...updates };
      setLocalConfig(newConfig);
      await onUpdate(updates);
      
      toast({
        title: "✅ Configuração Atualizada",
        description: `${functionality?.name} foi configurado com sucesso`,
      });
    } catch (error) {
      toast({
        title: "❌ Erro",
        description: "Falha ao atualizar configuração",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const calculateCost = () => {
    const modelData = models[localConfig.service as keyof typeof models]?.find(
      m => m.id === localConfig.model
    );
    if (!modelData) return 0;
    
    // Cálculo aproximado: (tokens / 1000) * cost_per_1k_tokens
    return (localConfig.max_tokens / 1000) * modelData.cost;
  };

  const getPresetColor = (preset: string) => {
    switch (preset.toLowerCase()) {
      case 'minimo': return 'bg-green-100 text-green-800 border-green-200';
      case 'medio': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'maximo': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <Card className={`relative transition-all duration-200 ${localConfig.is_enabled ? 'border-primary/50 shadow-sm' : 'border-muted opacity-60'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{functionality?.icon}</span>
            <div>
              <CardTitle className="text-lg">{functionality?.name}</CardTitle>
              <p className="text-sm text-muted-foreground">{functionality?.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getPresetColor(localConfig.preset_level)}>
              {localConfig.preset_level.toUpperCase()}
            </Badge>
            <Switch
              checked={localConfig.is_enabled}
              onCheckedChange={(enabled) => handleUpdate({ is_enabled: enabled })}
              disabled={isUpdating}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Service & Model Selection */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label>Provedor</Label>
            <Select
              value={localConfig.service}
              onValueChange={(service) => {
                const firstModel = models[service as keyof typeof models]?.[0]?.id || '';
                handleUpdate({ service, model: firstModel });
              }}
              disabled={isUpdating || !localConfig.is_enabled}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="gemini">Google Gemini</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Modelo</Label>
            <Select
              value={localConfig.model}
              onValueChange={(model) => handleUpdate({ model })}
              disabled={isUpdating || !localConfig.is_enabled}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {models[localConfig.service as keyof typeof models]?.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{model.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ${model.cost}/1k
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tokens Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Tokens Máximos</Label>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{localConfig.max_tokens.toLocaleString()}</Badge>
              <Badge variant="outline" className="text-xs">
                <DollarSign className="w-3 h-3 mr-1" />
                ${calculateCost().toFixed(4)}
              </Badge>
            </div>
          </div>
          <Slider
            value={[localConfig.max_tokens]}
            onValueChange={([value]) => handleUpdate({ max_tokens: value })}
            min={512}
            max={8192}
            step={256}
            disabled={isUpdating || !localConfig.is_enabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>512</span>
            <span>2K</span>
            <span>4K</span>
            <span>8K</span>
          </div>
        </div>

        {/* Temperature Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Criatividade (Temperature)</Label>
            <Badge variant="outline">{localConfig.temperature}</Badge>
          </div>
          <Slider
            value={[localConfig.temperature]}
            onValueChange={([value]) => handleUpdate({ temperature: Number(value.toFixed(1)) })}
            min={0.1}
            max={1.0}
            step={0.1}
            disabled={isUpdating || !localConfig.is_enabled}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Preciso</span>
            <span>Equilibrado</span>
            <span>Criativo</span>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Velocidade</div>
            <div className="flex justify-center">
              {localConfig.max_tokens <= 2048 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : localConfig.max_tokens <= 4096 ? (
                <TrendingUp className="w-4 h-4 text-yellow-500" />
              ) : (
                <TrendingUp className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Custo/Uso</div>
            <div className="text-xs font-medium">
              ${calculateCost().toFixed(4)}
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Qualidade</div>
            <div className="flex justify-center">
              {localConfig.max_tokens >= 4096 ? (
                <Badge className="w-3 h-3 rounded-full bg-green-500" />
              ) : localConfig.max_tokens >= 2048 ? (
                <Badge className="w-3 h-3 rounded-full bg-yellow-500" />
              ) : (
                <Badge className="w-3 h-3 rounded-full bg-red-500" />
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            disabled={isUpdating}
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={isUpdating || !localConfig.is_enabled}
            className="flex-1"
          >
            <Settings className="w-4 h-4 mr-1" />
            Avançado
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}