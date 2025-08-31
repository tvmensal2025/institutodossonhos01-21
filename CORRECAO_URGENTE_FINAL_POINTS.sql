-- CORREÇÃO URGENTE - Todas as colunas faltantes na tabela user_goals
-- Execute este script NO SQL EDITOR DO SUPABASE AGORA!

-- 1. Adicionar coluna final_points (PRINCIPAL)
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS final_points INTEGER DEFAULT 0;

-- 2. Adicionar outras colunas que podem estar faltando
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS admin_notes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendente',
ADD COLUMN IF NOT EXISTS estimated_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS target_value NUMERIC,
ADD COLUMN IF NOT EXISTS unit TEXT,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medio',
ADD COLUMN IF NOT EXISTS target_date DATE,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS challenge_id UUID,
ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT true;

-- 3. Verificar se as colunas foram adicionadas
SELECT 'COLUNAS ADICIONADAS:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
AND column_name IN ('final_points', 'approved_by', 'rejection_reason', 'admin_notes', 'updated_at')
ORDER BY column_name;

-- 4. Atualizar registros existentes
UPDATE public.user_goals 
SET final_points = estimated_points 
WHERE final_points IS NULL 
AND estimated_points IS NOT NULL;

-- 5. Verificar estrutura completa da tabela
SELECT 'ESTRUTURA COMPLETA DA TABELA:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
ORDER BY ordinal_position;

-- 6. Teste de inserção (opcional - descomente se quiser testar)
-- INSERT INTO public.user_goals (user_id, title, description, final_points, status)
-- VALUES (auth.uid(), 'Teste de Meta', 'Meta de teste para verificar estrutura', 10, 'pendente')
-- ON CONFLICT DO NOTHING;

-- 7. Mensagem de sucesso
SELECT '✅ CORREÇÃO CONCLUÍDA! Todas as colunas foram adicionadas.' as resultado; 