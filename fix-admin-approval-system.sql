-- Script para corrigir sistema de aprovação admin
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura da tabela profiles
SELECT 'Estrutura da tabela profiles:' as info,
       column_name, 
       data_type, 
       is_nullable,
       column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Adicionar coluna email se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 3. Adicionar outras colunas necessárias se não existirem
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
ADD COLUMN IF NOT EXISTS admin_level TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- 4. Verificar estrutura da tabela user_goals
SELECT 'Estrutura da tabela user_goals:' as info,
       column_name, 
       data_type, 
       is_nullable
FROM information_schema.columns
WHERE table_name = 'user_goals'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Adicionar colunas necessárias em user_goals se não existirem
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- 6. Atualizar emails nos perfis baseado nos usuários auth
UPDATE public.profiles 
SET email = auth_users.email,
    updated_at = NOW()
FROM auth.users auth_users
WHERE profiles.user_id = auth_users.id
AND (profiles.email IS NULL OR profiles.email = '');

-- 7. Criar função para aprovar meta
CREATE OR REPLACE FUNCTION approve_goal(
    goal_id UUID,
    admin_user_id UUID,
    admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN := FALSE;
BEGIN
    -- Verificar se o usuário é admin
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE user_id = admin_user_id 
        AND role = 'admin'
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Usuário não tem permissão de admin';
    END IF;
    
    -- Aprovar a meta
    UPDATE public.user_goals 
    SET 
        status = 'aprovada',
        approved_by = admin_user_id,
        approved_at = NOW(),
        admin_notes = COALESCE(admin_notes, ''),
        updated_at = NOW()
    WHERE id = goal_id;
    
    RETURN FOUND;
END;
$$;

-- 8. Criar função para rejeitar meta
CREATE OR REPLACE FUNCTION reject_goal(
    goal_id UUID,
    admin_user_id UUID,
    rejection_reason TEXT,
    admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    is_admin BOOLEAN := FALSE;
BEGIN
    -- Verificar se o usuário é admin
    SELECT EXISTS(
        SELECT 1 FROM public.profiles 
        WHERE user_id = admin_user_id 
        AND role = 'admin'
    ) INTO is_admin;
    
    IF NOT is_admin THEN
        RAISE EXCEPTION 'Usuário não tem permissão de admin';
    END IF;
    
    -- Rejeitar a meta
    UPDATE public.user_goals 
    SET 
        status = 'rejeitada',
        approved_by = admin_user_id,
        approved_at = NOW(),
        rejection_reason = rejection_reason,
        admin_notes = COALESCE(admin_notes, ''),
        updated_at = NOW()
    WHERE id = goal_id;
    
    RETURN FOUND;
END;
$$;

-- 9. Criar políticas RLS para as funções
DROP POLICY IF EXISTS "admin_can_manage_goals" ON public.user_goals;
CREATE POLICY "admin_can_manage_goals" ON public.user_goals
FOR ALL TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    )
    OR user_id = auth.uid()
);

-- 10. Garantir que admin pode ver todos os perfis
DROP POLICY IF EXISTS "admin_can_view_all_profiles" ON public.profiles;
CREATE POLICY "admin_can_view_all_profiles" ON public.profiles
FOR SELECT TO authenticated
USING (
    user_id = auth.uid() 
    OR EXISTS (
        SELECT 1 FROM public.profiles admin_profile
        WHERE admin_profile.user_id = auth.uid() 
        AND admin_profile.role = 'admin'
    )
);

-- 11. Verificar se há metas pendentes
SELECT 'Metas pendentes para aprovação:' as info,
       ug.id,
       ug.title,
       ug.description,
       ug.status,
       ug.created_at,
       p.full_name as usuario,
       p.email
FROM public.user_goals ug
LEFT JOIN public.profiles p ON ug.user_id = p.user_id
WHERE ug.status = 'pendente'
ORDER BY ug.created_at DESC;

-- 12. Verificar usuários admin
SELECT 'Usuários admin:' as info,
       p.user_id,
       p.full_name,
       p.email,
       p.role,
       p.admin_level
FROM public.profiles p
WHERE p.role = 'admin';

-- 13. Teste das funções (descomente para testar)
/*
-- Teste aprovar meta (substitua os IDs reais)
SELECT approve_goal(
    'ID_DA_META_AQUI'::UUID,
    'ID_DO_ADMIN_AQUI'::UUID,
    'Meta aprovada pelo admin'
);

-- Teste rejeitar meta (substitua os IDs reais)
SELECT reject_goal(
    'ID_DA_META_AQUI'::UUID,
    'ID_DO_ADMIN_AQUI'::UUID,
    'Meta não atende aos critérios',
    'Precisa de mais detalhes'
);
*/

-- 14. Resultado final
SELECT 'SISTEMA DE APROVAÇÃO:' as status,
       CASE 
           WHEN EXISTS (
               SELECT 1 FROM information_schema.routines 
               WHERE routine_name IN ('approve_goal', 'reject_goal')
               AND routine_schema = 'public'
           ) THEN 'FUNÇÕES CRIADAS COM SUCESSO! ✅'
           ELSE 'ERRO: Funções não foram criadas ❌'
       END as resultado;