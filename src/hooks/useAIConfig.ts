import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIConfigRecord {
  id?: string;
  functionality?: string;
  service?: string;
  service_name?: string;
  model?: string;
  max_tokens?: number;
  temperature?: number;
  is_enabled?: boolean;
  is_active?: boolean;
  preset_level?: string;
  system_prompt?: string;
  personality?: string;
}

interface UseAIConfigParams {
  functionality?: string;
  personality?: 'drvital' | 'sofia' | string;
}

const DEFAULT_CONFIG: Required<Pick<AIConfigRecord, 'service' | 'model' | 'max_tokens' | 'temperature'>> = {
  service: 'openai',
  model: 'gpt-4o-mini',
  max_tokens: 1024,
  temperature: 0.6,
};

export function useAIConfig(params: UseAIConfigParams) {
  const { functionality, personality } = params;
  const [config, setConfig] = useState<AIConfigRecord | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let query = supabase.from('ai_configurations').select('*');
        if (functionality) query = query.eq('functionality', functionality);
        if (personality) query = query.eq('personality', personality);

        const { data, error } = await query.single();
        if (error && error.code !== 'PGRST116') throw error; // no rows

        const isActive = !!(data && data.is_enabled === true);
        const effective: AIConfigRecord = isActive
          ? data
          : { ...DEFAULT_CONFIG, service_name: 'openai', personality, functionality };

        if (isMounted) setConfig(effective);
      } catch (err: any) {
        console.error('Erro ao carregar AI config:', err);
        if (isMounted) setError(err?.message || 'Erro ao carregar configuração');
        if (isMounted)
          setConfig({ ...DEFAULT_CONFIG, service_name: 'openai', personality, functionality });
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [functionality, personality]);

  const effective = useMemo(() => {
    if (!config) return null;
    return {
      ...config,
      service: config.service || config.service_name || 'openai',
      model: config.model || DEFAULT_CONFIG.model,
      max_tokens: config.max_tokens ?? DEFAULT_CONFIG.max_tokens,
      temperature: config.temperature ?? DEFAULT_CONFIG.temperature,
    } as AIConfigRecord;
  }, [config]);

  return { config: effective, loading, error } as const;
}
