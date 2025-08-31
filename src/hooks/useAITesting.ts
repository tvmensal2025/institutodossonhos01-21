import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AITestResult {
  service: 'openai' | 'gemini' | 'ollama';
  model: string;
  success: boolean;
  response?: string;
  error?: string;
  duration?: number;
  tokens?: number;
}

export function useAITesting() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<AITestResult[]>([]);

  const testOpenAI = async (model: string, message: string = 'Olá, como você está?', functionality?: string): Promise<AITestResult> => {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('gpt-chat', {
        body: {
          service: 'openai',
          model,
          messages: [
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 100,
          functionality
        }
      });

      if (error) throw error;

      return {
        service: 'openai',
        model,
        success: true,
        response: data.content,
        duration: Date.now() - startTime,
        tokens: data.usage?.total_tokens
      };
    } catch (error) {
      return {
        service: 'openai',
        model,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  };

  const testGemini = async (model: string, message: string = 'Olá, como você está?', functionality?: string): Promise<AITestResult> => {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('gpt-chat', {
        body: {
          service: 'gemini',
          model,
          prompt: message,
          temperature: 0.7,
          max_tokens: 100,
          functionality
        }
      });

      if (error) throw error;

      return {
        service: 'gemini',
        model,
        success: true,
        response: data.content,
        duration: Date.now() - startTime,
        tokens: data.usage?.total_tokens
      };
    } catch (error) {
      return {
        service: 'gemini',
        model,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  };

  const testOllama = async (model: string, message: string = 'Olá, como você está?', functionality?: string): Promise<AITestResult> => {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('gpt-chat', {
        body: {
          service: 'ollama',
          model,
          messages: [
            { role: 'user', content: message }
          ],
          temperature: 0.7,
          max_tokens: 100,
          functionality
        }
      });

      if (error) throw error;

      return {
        service: 'ollama',
        model,
        success: true,
        response: data.content,
        duration: Date.now() - startTime,
        tokens: data.usage?.total_tokens
      };
    } catch (error: any) {
      return {
        service: 'ollama',
        model,
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  };

  const testSofiaChat = async (message: string = 'Oi Sofia!'): Promise<AITestResult> => {
    const startTime = Date.now();
    
    try {
      const { data, error } = await supabase.functions.invoke('health-chat-bot', {
        body: {
          message,
          userId: 'test-user-id',
          conversationHistory: []
        }
      });

      if (error) throw error;

      return {
        service: 'gemini',
        model: 'sofia-chat',
        success: true,
        response: data.response,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        service: 'gemini',
        model: 'sofia-chat',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }
  };

  const runFullAITest = async () => {
    setIsLoading(true);
    setResults([]);

    const testCases = [
      // OpenAI Tests
      { type: 'openai', model: 'gpt-4.1-2025-04-14', message: 'Teste OpenAI GPT-4.1' },
      { type: 'openai', model: 'gpt-4o-mini', message: 'Teste OpenAI GPT-4o-mini' },
      { type: 'openai', model: 'o3-2025-04-16', message: 'Teste OpenAI O3' },
      
      // Gemini Tests
      { type: 'gemini', model: 'gemini-1.5-pro', message: 'Teste Gemini Pro' },
      { type: 'gemini', model: 'gemini-1.5-flash', message: 'Teste Gemini Flash' },
      // Ollama Tests
      { type: 'ollama', model: 'llama3.1:8b-instruct-q4_0', message: 'Teste Ollama Llama3.1' }
    ];

    const testResults: AITestResult[] = [];

    for (const testCase of testCases) {
      try {
        let result: AITestResult;
        
        if (testCase.type === 'openai') {
          result = await testOpenAI(testCase.model, testCase.message);
        } else if (testCase.type === 'gemini') {
          result = await testGemini(testCase.model, testCase.message);
        } else if (testCase.type === 'ollama') {
          result = await testOllama(testCase.model, testCase.message);
        }
        
        testResults.push(result);
        setResults([...testResults]);
        
        // Aguardar um pouco entre testes para evitar rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`Erro no teste ${testCase.model}:`, error);
        testResults.push({
          service: (testCase.type === 'openai' ? 'openai' : (testCase.type === 'gemini' ? 'gemini' : 'ollama')) as any,
          model: testCase.model,
          success: false,
          error: error.message
        });
        setResults([...testResults]);
      }
    }

    setIsLoading(false);
    return testResults;
  };

  const testSpecificModel = async (service: 'openai' | 'gemini' | 'ollama', model: string, message: string, functionality?: string) => {
    setIsLoading(true);
    
    let result: AITestResult;
    
    try {
      if (service === 'openai') {
        result = await testOpenAI(model, message, functionality);
      } else if (service === 'gemini') {
        result = await testGemini(model, message, functionality);
      } else if (service === 'ollama') {
        result = await testOllama(model, message, functionality);
      }
      
      setResults(prev => [...prev, result]);
      setIsLoading(false);
      return result;
    } catch (error: any) {
      result = {
        service: service as any,
        model,
        success: false,
        error: error.message
      };
      setResults(prev => [...prev, result]);
      setIsLoading(false);
      return result;
    }
  };

  return {
    isLoading,
    results,
    runFullAITest,
    testSpecificModel,
    testOpenAI,
    testGemini,
    clearResults: () => setResults([])
  };
}