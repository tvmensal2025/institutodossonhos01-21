-- Script para corrigir problema da coluna evidence_required
-- Execute este script diretamente no SQL Editor do Supabase

-- 1. Verificar se a coluna evidence_required existe
DO $$
BEGIN
  -- Adicionar coluna evidence_required se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='evidence_required') THEN
    ALTER TABLE public.user_goals ADD COLUMN evidence_required BOOLEAN DEFAULT TRUE;
    RAISE NOTICE 'Coluna evidence_required adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna evidence_required já existe';
  END IF;
  
  -- Adicionar coluna is_group_goal se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='is_group_goal') THEN
    ALTER TABLE public.user_goals ADD COLUMN is_group_goal BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Coluna is_group_goal adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna is_group_goal já existe';
  END IF;
  
  -- Adicionar coluna transform_to_challenge se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_goals' AND column_name='transform_to_challenge') THEN
    ALTER TABLE public.user_goals ADD COLUMN transform_to_challenge BOOLEAN DEFAULT FALSE;
    RAISE NOTICE 'Coluna transform_to_challenge adicionada com sucesso';
  ELSE
    RAISE NOTICE 'Coluna transform_to_challenge já existe';
  END IF;
  
END $$;

-- 2. Verificar estrutura atual da tabela user_goals
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
ORDER BY ordinal_position;

-- 3. Verificar se há dados na tabela
SELECT COUNT(*) as total_goals FROM public.user_goals;

-- 4. Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_goals'; 