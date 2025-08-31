-- =====================================================
-- DADOS DE TESTE PARA O SISTEMA
-- =====================================================

-- Inserir perfis de teste (admin e usuário)
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
VALUES 
  ('d4c7e35c-2f66-4e5d-8d09-c0ba8d0d7187', 'admin@institutodossonhos.com', NOW(), NOW(), NOW(), '{"role": "admin", "isAdmin": "true"}'),
  ('550e8400-e29b-41d4-a716-446655440001', 'usuario@teste.com', NOW(), NOW(), NOW(), '{"role": "client"}')
ON CONFLICT (id) DO NOTHING;

-- Inserir perfis correspondentes
INSERT INTO public.profiles (id, full_name, email, role, created_at)
VALUES 
  ('d4c7e35c-2f66-4e5d-8d09-c0ba8d0d7187', 'Administrador Sistema', 'admin@institutodossonhos.com', 'admin', NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'João Silva Teste', 'usuario@teste.com', 'client', NOW())
ON CONFLICT (id) DO NOTHING;

-- Inserir uma sessão de exemplo
INSERT INTO public.sessions (
  title,
  description,
  content,
  video_url,
  category,
  created_by,
  assigned_to,
  is_public,
  estimated_time,
  status
) VALUES (
  'Sessão de Autoconhecimento',
  'Uma sessão inicial para conhecer melhor seus objetivos e valores',
  'Bem-vindo à sua primeira sessão! Nesta atividade, vamos explorar:

1. Seus principais objetivos de vida
2. Valores que mais importam para você  
3. Como alinhar suas ações com seus sonhos

Assista ao vídeo de introdução e depois responda às perguntas de reflexão. Lembre-se: não há respostas certas ou erradas, apenas sua verdade pessoal.

Use a Roda da Vida para avaliar diferentes áreas da sua vida e identificar onde focar sua energia.',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'autoconhecimento',
  'd4c7e35c-2f66-4e5d-8d09-c0ba8d0d7187',
  '550e8400-e29b-41d4-a716-446655440001',
  false,
  45,
  'draft'
) ON CONFLICT DO NOTHING; 