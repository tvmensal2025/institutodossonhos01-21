-- Adicionar coluna isActive faltante na tabela course_modules
ALTER TABLE public.course_modules ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_course_modules_is_active ON public.course_modules(is_active);

-- Comentário na coluna
COMMENT ON COLUMN public.course_modules.is_active IS 'Indica se o módulo está ativo e disponível para os usuários';