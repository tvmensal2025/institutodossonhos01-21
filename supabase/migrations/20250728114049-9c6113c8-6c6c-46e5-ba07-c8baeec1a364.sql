-- Adicionar campo para ferramentas nas sessões
ALTER TABLE public.sessions 
ADD COLUMN IF NOT EXISTS tools JSONB DEFAULT '[]'::jsonb;

-- Adicionar campo para dados das ferramentas nas sessões do usuário
ALTER TABLE public.user_sessions 
ADD COLUMN IF NOT EXISTS tools_data JSONB DEFAULT '{}'::jsonb;

-- Comentários para clarificar
COMMENT ON COLUMN public.sessions.tools IS 'Array de ferramentas disponíveis na sessão: ["limiting-beliefs", "health-pyramid", "trauma-mapping", "anamnesis"]';
COMMENT ON COLUMN public.user_sessions.tools_data IS 'Dados salvos das ferramentas executadas pelo usuário';