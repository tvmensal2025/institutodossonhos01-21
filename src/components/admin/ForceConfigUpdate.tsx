import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';

const ForceConfigUpdate: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const forceUpdateAllToMaximo = async () => {
    try {
      setLoading(true);
      console.log('🔄 Forçando atualização para MÁXIMO...');

      // Configurações para MÁXIMO
      const maximoConfigs = [
        {
          functionality: 'chat_daily',
          service: 'openai',
          model: 'gpt-4.1-2025-04-14',
          max_tokens: 8192,
          temperature: 0.8,
          preset_level: 'maximo',
          is_enabled: true
        },
        {
          functionality: 'weekly_report',
          service: 'openai',
          model: 'gpt-4.1-2025-04-14',
          max_tokens: 8192,
          temperature: 0.7,
          preset_level: 'maximo',
          is_enabled: true
        },
        {
          functionality: 'monthly_report',
          service: 'openai',
          model: 'gpt-4.1-2025-04-14',
          max_tokens: 8192,
          temperature: 0.6,
          preset_level: 'maximo',
          is_enabled: true
        },
        {
          functionality: 'medical_analysis',
          service: 'openai',
          model: 'o3-2025-04-16',
          max_tokens: 8192,
          temperature: 0.3,
          preset_level: 'maximo',
          is_enabled: true
        },
        {
          functionality: 'preventive_analysis',
          service: 'openai',
          model: 'gpt-4.1-2025-04-14',
          max_tokens: 8192,
          temperature: 0.5,
          preset_level: 'maximo',
          is_enabled: true
        }
      ];

      let successCount = 0;
      
      for (const config of maximoConfigs) {
        try {
          const { error } = await supabase
            .from('ai_configurations')
            .update({
              service: config.service,
              model: config.model,
              max_tokens: config.max_tokens,
              temperature: config.temperature,
              preset_level: config.preset_level,
              is_enabled: config.is_enabled
            })
            .eq('functionality', config.functionality);

          if (error) {
            console.error(`❌ Erro ao atualizar ${config.functionality}:`, error);
          } else {
            console.log(`✅ ${config.functionality} atualizado para MÁXIMO`);
            successCount++;
          }
        } catch (err) {
          console.error(`💥 Erro fatal em ${config.functionality}:`, err);
        }
      }

      if (successCount === maximoConfigs.length) {
        toast.success(`🚀 Todas as ${successCount} configurações foram atualizadas para MÁXIMO!`);
      } else {
        toast.error(`⚠️ Apenas ${successCount}/${maximoConfigs.length} configurações foram atualizadas`);
      }

    } catch (error) {
      console.error('💥 Erro fatal ao forçar atualização:', error);
      toast.error('Erro ao forçar atualização das configurações');
    } finally {
      setLoading(false);
    }
  };

  const testSpecificConfig = async () => {
    try {
      setLoading(true);
      console.log('🧪 Testando configuração específica...');

      // Testar chat_daily especificamente
      const { data: config, error: readError } = await supabase
        .from('ai_configurations')
        .select('*')
        .eq('functionality', 'chat_daily')
        .single();

      if (readError) {
        throw readError;
      }

      console.log('📋 Config atual do chat_daily:', config);

      // Tentar atualizar manualmente
      const { error: updateError } = await supabase
        .from('ai_configurations')
        .update({
          model: 'gpt-4.1-2025-04-14',
          max_tokens: 8192,
          preset_level: 'maximo',
          temperature: 0.8
        })
        .eq('id', config.id);

      if (updateError) {
        throw updateError;
      }

      // Verificar se atualizou
      const { data: updatedConfig, error: verifyError } = await supabase
        .from('ai_configurations')
        .select('*')
        .eq('id', config.id)
        .single();

      if (verifyError) {
        throw verifyError;
      }

      console.log('🔍 Config após atualização:', updatedConfig);
      
      toast.success('✅ Teste específico concluído! Verifique o console.');

    } catch (error) {
      console.error('❌ Erro no teste específico:', error);
      toast.error(`Erro no teste: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Forçar Atualização de Configurações
          <Badge variant="destructive" className="ml-2">TESTE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-800">⚠️ Função de Teste</p>
            <p className="text-yellow-700 mt-1">
              Esta função força a atualização das configurações de IA diretamente no banco.
              Use apenas para depuração.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={forceUpdateAllToMaximo}
            disabled={loading}
            className="flex items-center gap-2"
            variant="destructive"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="h-4 w-4" />
            )}
            Forçar TODAS para MÁXIMO
          </Button>

          <Button 
            onClick={testSpecificConfig}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Settings className="h-4 w-4" />
            )}
            Testar Config Específica
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ForceConfigUpdate;