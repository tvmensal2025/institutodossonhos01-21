-- =====================================================
-- MIGRAÇÃO PARA CRIAR FUNÇÕES AUXILIARES
-- =====================================================

-- Função para verificar se o usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = auth.uid()
      AND (
        raw_user_meta_data->>'role' = 'admin'
        OR
        raw_user_meta_data->>'isAdmin' = 'true'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se um usuário específico é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE id = user_id
      AND (
        raw_user_meta_data->>'role' = 'admin'
        OR
        raw_user_meta_data->>'isAdmin' = 'true'
      )
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter o ID do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS UUID AS $$
BEGIN
  RETURN auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se o usuário atual é o dono de um registro
CREATE OR REPLACE FUNCTION public.is_owner(record_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN auth.uid() = record_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 