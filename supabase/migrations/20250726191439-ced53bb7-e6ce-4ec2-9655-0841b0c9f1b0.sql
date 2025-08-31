-- Adicionar coluna updated_at na tabela user_goals
ALTER TABLE public.user_goals 
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_user_goals_updated_at
    BEFORE UPDATE ON public.user_goals
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();