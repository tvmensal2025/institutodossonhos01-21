-- VERIFICAR E CORRIGIR TABELAS DE METAS E DEPENDÊNCIAS

-- 1. Verificar se as tabelas necessárias existem
DO $$
BEGIN
    -- Verificar se goal_categories existe
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'goal_categories') THEN
        -- Criar tabela goal_categories
        CREATE TABLE public.goal_categories (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            icon TEXT,
            color TEXT,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Habilitar RLS
        ALTER TABLE public.goal_categories ENABLE ROW LEVEL SECURITY;
        
        -- Política para permitir que todos vejam categorias
        CREATE POLICY "Everyone can view goal categories" 
        ON public.goal_categories 
        FOR SELECT 
        USING (true);
        
        -- Inserir categorias padrão
        INSERT INTO public.goal_categories (name, icon, color) VALUES 
        ('saude', '❤️', '#ef4444'),
        ('exercicio', '💪', '#3b82f6'),
        ('alimentacao', '🥗', '#10b981'),
        ('bem-estar', '😌', '#8b5cf6');
    END IF;
END
$$;

-- 2. Recriar tabela user_goals com estrutura correta
DROP TABLE IF EXISTS public.user_goals CASCADE;

CREATE TABLE public.user_goals (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    target_value DECIMAL(10,2) NOT NULL DEFAULT 1,
    current_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    unit TEXT NOT NULL DEFAULT 'unidade',
    difficulty TEXT NOT NULL DEFAULT 'medio',
    target_date DATE,
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovada', 'em_progresso', 'concluida', 'rejeitada', 'cancelada')),
    estimated_points INTEGER NOT NULL DEFAULT 100,
    challenge_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 3. Habilitar RLS na tabela user_goals
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas RLS mais específicas
CREATE POLICY "Users can view their own goals" 
ON public.user_goals 
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own goals" 
ON public.user_goals 
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own goals" 
ON public.user_goals 
FOR DELETE 
TO authenticated
USING (user_id = auth.uid());

-- 5. Criar função e trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION public.update_user_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_goals_updated_at ON public.user_goals;
CREATE TRIGGER update_user_goals_updated_at
    BEFORE UPDATE ON public.user_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_user_goals_updated_at();

-- 6. Inserir alguns dados de exemplo para teste
INSERT INTO public.user_goals (user_id, title, description, category, target_value, unit, difficulty, status, estimated_points)
SELECT 
    id,
    'Meta de Exemplo',
    'Esta é uma meta de exemplo para testar o sistema',
    'saude',
    10,
    'dias',
    'facil',
    'aprovada',
    50
FROM auth.users
WHERE email = 'teste@institutodossonhos.com'
ON CONFLICT DO NOTHING;