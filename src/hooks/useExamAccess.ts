import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, addMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExamAccessStatus {
  canAccess: boolean;
  lastAccessDate?: Date;
  nextAccessDate?: Date;
  daysUntilNextAccess: number;
  loading: boolean;
  error?: string;
}

export const useExamAccess = () => {
  const [status, setStatus] = useState<ExamAccessStatus>({
    canAccess: false,
    daysUntilNextAccess: 0,
    loading: true
  });

  useEffect(() => {
    checkExamAccess();
  }, []);

  const checkExamAccess = async () => {
    try {
      setStatus(prev => ({ ...prev, loading: true, error: undefined }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setStatus({
          canAccess: false,
          daysUntilNextAccess: 0,
          loading: false,
          error: 'Usuário não autenticado'
        });
        return;
      }

      // Verificar se já acessou este mês (usando localStorage como fallback)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastAccessKey = `exam_access_${user.id}_${currentMonth}`;
      const hasAccessedThisMonth = localStorage.getItem(lastAccessKey) === 'true';

      if (hasAccessedThisMonth) {
        // Já acessou este mês, calcular próximo acesso
        const nextMonth = addMonths(startOfMonth(new Date()), 1);
        const daysUntilNext = Math.ceil((nextMonth.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        setStatus({
          canAccess: false,
          nextAccessDate: nextMonth,
          daysUntilNextAccess: Math.max(0, daysUntilNext),
          loading: false
        });
      } else {
        // Pode acessar este mês
        setStatus({
          canAccess: true,
          nextAccessDate: new Date(),
          daysUntilNextAccess: 0,
          loading: false
        });
      }

    } catch (error) {
      console.error('Erro ao verificar acesso aos exames:', error);
      setStatus({
        canAccess: false,
        daysUntilNextAccess: 0,
        loading: false,
        error: 'Erro ao verificar acesso'
      });
    }
  };

  const registerExamAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Registrar acesso aos exames no localStorage
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastAccessKey = `exam_access_${user.id}_${currentMonth}`;
      localStorage.setItem(lastAccessKey, 'true');

      // Recarregar status
      await checkExamAccess();

      return true;
    } catch (error) {
      console.error('Erro ao registrar acesso aos exames:', error);
      return false;
    }
  };

  const formatNextAccessDate = () => {
    if (!status.nextAccessDate) return '';
    
    return format(status.nextAccessDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  const getAccessMessage = () => {
    if (status.loading) return 'Verificando acesso...';
    if (status.error) return 'Erro ao verificar acesso';
    
    if (status.canAccess) {
      return 'Você pode acessar os exames este mês!';
    } else {
      if (status.daysUntilNextAccess === 0) {
        return 'Próximo acesso disponível hoje!';
      } else if (status.daysUntilNextAccess === 1) {
        return 'Próximo acesso disponível amanhã!';
      } else {
        return `Próximo acesso em ${status.daysUntilNextAccess} dias`;
      }
    }
  };

  return {
    ...status,
    registerExamAccess,
    formatNextAccessDate,
    getAccessMessage,
    refreshAccess: checkExamAccess
  };
}; 