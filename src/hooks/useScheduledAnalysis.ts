import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ScheduledAnalysisResult {
  success: boolean;
  message: string;
  summary?: {
    users_processed: number;
    success_count: number;
    error_count: number;
  };
  results?: any[];
}

export const useScheduledAnalysis = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<ScheduledAnalysisResult | null>(null);
  const { toast } = useToast();

  // Executar análise quinzenal manualmente (apenas admins)
  const runScheduledAnalysis = async (): Promise<ScheduledAnalysisResult> => {
    setIsRunning(true);
    
    try {
      console.log('🔄 Iniciando análise quinzenal manual...');
      
      const { data, error } = await supabase.functions.invoke('scheduled-analysis', {
        body: {
          manual_trigger: true,
          triggered_by: 'admin'
        }
      });

      if (error) {
        console.error('❌ Erro na análise quinzenal:', error);
        throw error;
      }

      console.log('✅ Análise quinzenal concluída:', data);
      setLastResult(data);

      toast({
        title: "✅ Análise Quinzenal Concluída",
        description: `Processados: ${data.summary?.users_processed || 0} usuários. Sucessos: ${data.summary?.success_count || 0}`,
        duration: 10000,
      });

      return data;

    } catch (error: any) {
      console.error('💥 Erro na análise quinzenal:', error);
      
      const errorResult = {
        success: false,
        message: error.message || 'Erro desconhecido na análise quinzenal'
      };
      
      setLastResult(errorResult);
      
      toast({
        title: "❌ Erro na Análise Quinzenal",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
        duration: 10000,
      });

      return errorResult;
    } finally {
      setIsRunning(false);
    }
  };

  // Buscar logs das análises anteriores
  const getAnalysisLogs = async (limit: number = 10) => {
    try {
      // Comentado temporariamente - tabela não existe
      // const { data, error } = await supabase
      //   .from('scheduled_analysis_logs')
      //   .select('*')
      //   .order('execution_date', { ascending: false })
      //   .limit(limit);

      // if (error) {
      //   console.error('❌ Erro ao buscar logs:', error);
      //   throw error;
      // }

      // return data || [];
      return [];
    } catch (error) {
      console.error('❌ Erro ao buscar logs de análise:', error);
      return [];
    }
  };

  // Verificar usuários que precisam de análise
  const getUsersNeedingAnalysis = async () => {
    try {
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, last_analysis_date, created_at')
        .or(`last_analysis_date.is.null,last_analysis_date.lt.${fifteenDaysAgo.toISOString()}`)
        .limit(100);

      if (error) {
        console.error('❌ Erro ao buscar usuários:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('💥 Erro ao verificar usuários:', error);
      return [];
    }
  };

  // Forçar análise para um usuário específico
  const runAnalysisForUser = async (userId: string) => {
    setIsRunning(true);
    
    try {
      console.log(`🔍 Executando análise para usuário: ${userId}`);
      
      const { data, error } = await supabase.functions.invoke('sofia-tracking-analysis', {
        body: {
          userId: userId,
          analysis_type: 'manual_admin'
        }
      });

      if (error) {
        console.error('❌ Erro na análise individual:', error);
        throw error;
      }

      // Atualizar data da última análise
      await supabase
        .from('profiles')
        .update({ 
          last_analysis_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      toast({
        title: "✅ Análise Individual Concluída",
        description: `Usuário ${userId} analisado com sucesso`,
        duration: 5000,
      });

      return { success: true, data };

    } catch (error: any) {
      console.error('💥 Erro na análise individual:', error);
      
      toast({
        title: "❌ Erro na Análise Individual",
        description: error.message || 'Erro desconhecido',
        variant: "destructive",
        duration: 5000,
      });

      return { success: false, error: error.message };
    } finally {
      setIsRunning(false);
    }
  };

  return {
    isRunning,
    lastResult,
    runScheduledAnalysis,
    getAnalysisLogs,
    getUsersNeedingAnalysis,
    runAnalysisForUser
  };
};
