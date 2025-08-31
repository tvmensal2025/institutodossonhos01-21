-- Adicionar coluna content na tabela lessons
ALTER TABLE lessons ADD COLUMN IF NOT EXISTS content TEXT;

-- Verificar se existem colunas de status/aprovação nas tabelas de desafios e metas
-- Adicionar colunas de status para aprovação de admin se não existirem
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'pending' CHECK (admin_status IN ('pending', 'approved', 'rejected'));
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS admin_reviewed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE user_goals ADD COLUMN IF NOT EXISTS admin_reviewed_by UUID;

-- Adicionar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_user_goals_admin_status ON user_goals(admin_status);
CREATE INDEX IF NOT EXISTS idx_user_goals_user_status ON user_goals(user_id, status);