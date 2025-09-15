-- Adicionar suporte para análise quinzenal automática
-- Execute este SQL no Supabase SQL Editor

-- 1. Adicionar coluna last_analysis_date na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_analysis_date TIMESTAMP WITH TIME ZONE;

-- 2. Criar tabela para logs das análises agendadas
CREATE TABLE IF NOT EXISTS public.scheduled_analysis_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  execution_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  users_processed INTEGER NOT NULL DEFAULT 0,
  success_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  results JSONB DEFAULT '[]',
  execution_time_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_profiles_last_analysis_date 
ON public.profiles(last_analysis_date);

CREATE INDEX IF NOT EXISTS idx_scheduled_analysis_logs_execution_date 
ON public.scheduled_analysis_logs(execution_date DESC);

-- 4. Habilitar RLS na nova tabela
ALTER TABLE public.scheduled_analysis_logs ENABLE ROW LEVEL SECURITY;

-- 5. Criar política para admins visualizarem logs
CREATE POLICY "Admins can view scheduled analysis logs" 
ON public.scheduled_analysis_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND (role = 'admin' OR is_admin = true)
  )
);

-- 6. Comentários para documentação
COMMENT ON TABLE public.scheduled_analysis_logs IS 'Logs das análises automáticas executadas de 15 em 15 dias';
COMMENT ON COLUMN public.profiles.last_analysis_date IS 'Data da última análise automática do usuário';

-- 7. Verificar se tudo foi criado corretamente
SELECT 
  'scheduled_analysis_logs' as table_name,
  COUNT(*) as row_count
FROM public.scheduled_analysis_logs
UNION ALL
SELECT 
  'profiles_with_analysis_date' as table_name,
  COUNT(*) as row_count
FROM public.profiles 
WHERE last_analysis_date IS NOT NULL;
