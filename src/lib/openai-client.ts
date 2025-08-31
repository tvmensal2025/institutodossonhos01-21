import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

// Tipos para as mensagens
export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model?: string;
}

// Função para fazer chamadas seguras via Edge Function
async function callGPTSafely(
  messages: ChatMessage[],
  model: string = 'gpt-4o',
  temperature: number = 0.7,
  maxTokens: number = 1000
): Promise<ChatResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('gpt-chat', {
      body: {
        messages,
        model,
        temperature,
        max_tokens: maxTokens,
        // Permite que chamadas específicas peçam JSON; outras continuarão texto livre
        response_format: model?.includes('4o') ? { type: 'json_object' } : undefined,
      }
    });

    if (error) {
      console.error('Erro na edge function:', error);
      throw new Error(`Erro na comunicação: ${error.message}`);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    return {
      content: data.content,
      usage: data.usage,
      model: data.model
    };
  } catch (error) {
    console.error('Erro na chamada GPT:', error);
    throw new Error(error instanceof Error ? error.message : 'Erro desconhecido na comunicação com GPT');
  }
}

// Configuração do agente GPT
export class GPTAgent {
  private messages: ChatMessage[] = [];
  private model: string;
  private maxTokens: number;
  private temperature: number;

  constructor(
    model: string = 'gpt-4o',
    maxTokens: number = 1000,
    temperature: number = 0.7
  ) {
    this.model = model;
    this.maxTokens = maxTokens;
    this.temperature = temperature;
  }

  // Adicionar mensagem ao histórico
  addMessage(role: 'system' | 'user' | 'assistant', content: string) {
    this.messages.push({ role, content });
  }

  // Limpar histórico
  clearHistory() {
    this.messages = [];
  }

  // Enviar mensagem para o GPT via Edge Function
  async sendMessage(message: string): Promise<ChatResponse> {
    try {
      // Adicionar mensagem do usuário
      this.addMessage('user', message);

      // Fazer chamada via Edge Function
      const response = await callGPTSafely(
        this.messages,
        this.model,
        this.temperature,
        this.maxTokens
      );

      // Adicionar resposta do assistente ao histórico
      this.addMessage('assistant', response.content);

      return response;
    } catch (error) {
      console.error('Erro na chamada GPT:', error);
      throw new Error(error instanceof Error ? error.message : 'Falha na comunicação com o GPT');
    }
  }

  // Configurar contexto do sistema
  setSystemPrompt(prompt: string) {
    // Remover prompts de sistema anteriores
    this.messages = this.messages.filter(msg => msg.role !== 'system');
    // Adicionar novo prompt de sistema
    this.addMessage('system', prompt);
  }

  // Obter histórico de mensagens
  getHistory(): ChatMessage[] {
    return [...this.messages];
  }

  // Configurar parâmetros
  setParameters(model?: string, maxTokens?: number, temperature?: number) {
    if (model) this.model = model;
    if (maxTokens) this.maxTokens = maxTokens;
    if (temperature) this.temperature = temperature;
  }
}

// Instância padrão do agente
export const gptAgent = new GPTAgent();

// Funções utilitárias para diferentes tipos de uso
export const healthAssistant = new GPTAgent('gpt-4o', 1800, 0.6);
healthAssistant.setSystemPrompt(`
Você é um assistente especializado em saúde e bem-estar.
Ajude os usuários com:
- Dicas de nutrição e exercícios
- Análise de dados de peso e composição corporal
- Motivação para metas de saúde
- Explicações sobre IMC e saúde metabólica
- Receitas saudáveis e planos de treino
Sempre seja encorajador e baseado em evidências científicas.
`);

export const codingAssistant = new GPTAgent('gpt-4o', 2000, 0.3);
codingAssistant.setSystemPrompt(`
Você é um assistente de programação especializado em React, TypeScript e desenvolvimento web.
Ajude com:
- Debugging de código
- Refatoração e otimização
- Explicações de conceitos técnicos
- Sugestões de arquitetura
- Integração de APIs
Sempre forneça código limpo e bem documentado.
`);

// Hook para usar o GPT no React
export const useGPTAgent = (agent: GPTAgent = gptAgent) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (message: string): Promise<ChatResponse | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await agent.sendMessage(message);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendMessage,
    isLoading,
    error,
    history: agent.getHistory(),
    clearHistory: () => agent.clearHistory(),
  };
};