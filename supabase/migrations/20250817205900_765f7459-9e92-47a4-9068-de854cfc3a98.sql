-- CORREÇÃO CRÍTICA: Políticas RLS para tabelas em falta
-- Corrigindo todas as tabelas que têm RLS habilitado mas sem políticas

-- 1. ai_configurations (contém chaves de API sensíveis)
CREATE POLICY "Only admins can manage AI configurations" ON public.ai_configurations
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
    );

-- 2. ai_usage_logs (logs de uso de IA)
CREATE POLICY "Users can view their own AI usage logs" ON public.ai_usage_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create AI usage logs" ON public.ai_usage_logs
    FOR INSERT WITH CHECK (true);

-- 3. receita_componentes (componentes de receitas)
CREATE POLICY "Recipe components are viewable by everyone" ON public.receita_componentes
    FOR SELECT USING (true);

CREATE POLICY "Only admins can manage recipe components" ON public.receita_componentes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'::app_role
        )
    );

-- 4. Corrigir search_path das funções existentes
ALTER FUNCTION public.calculate_imc() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 5. Criar usuário admin de teste se não existir
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Criar usuário de teste se não existir
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        'admin@institutodossonhos.com',
        crypt('admin123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"full_name": "Administrador", "role": "admin"}'
    ) ON CONFLICT (email) DO NOTHING;

    -- Obter o ID do usuário
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@institutodossonhos.com';

    -- Criar perfil
    INSERT INTO public.profiles (
        user_id,
        full_name,
        email,
        role,
        created_at,
        updated_at
    ) VALUES (
        admin_user_id,
        'Administrador',
        'admin@institutodossonhos.com',
        'admin',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        role = 'admin',
        full_name = 'Administrador';

    -- Criar role de admin
    INSERT INTO public.user_roles (
        user_id,
        role,
        assigned_at
    ) VALUES (
        admin_user_id,
        'admin'::app_role,
        NOW()
    ) ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Usuário admin criado: admin@institutodossonhos.com / admin123456';
END $$;

-- 6. Criar usuário normal de teste
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Criar usuário normal se não existir
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
        'usuario@institutodossonhos.com',
        crypt('user123456', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"full_name": "Usuário Teste", "role": "user"}'
    ) ON CONFLICT (email) DO NOTHING;

    -- Obter o ID do usuário
    SELECT id INTO user_id FROM auth.users WHERE email = 'usuario@institutodossonhos.com';

    -- Criar perfil
    INSERT INTO public.profiles (
        user_id,
        full_name,
        email,
        role,
        created_at,
        updated_at
    ) VALUES (
        user_id,
        'Usuário Teste',
        'usuario@institutodossonhos.com',
        'user',
        NOW(),
        NOW()
    ) ON CONFLICT (user_id) DO UPDATE SET
        full_name = 'Usuário Teste';

    -- Criar role de user
    INSERT INTO public.user_roles (
        user_id,
        role,
        assigned_at
    ) VALUES (
        user_id,
        'user'::app_role,
        NOW()
    ) ON CONFLICT (user_id, role) DO NOTHING;

    RAISE NOTICE 'Usuário normal criado: usuario@institutodossonhos.com / user123456';
END $$;

-- 7. Verificar criação de usuários
SELECT 'USUÁRIOS CRIADOS:' as info;
SELECT email, created_at FROM auth.users WHERE email IN ('admin@institutodossonhos.com', 'usuario@institutodossonhos.com');

-- 8. Verificar perfis criados
SELECT 'PERFIS CRIADOS:' as info;
SELECT full_name, email, role FROM public.profiles WHERE email IN ('admin@institutodossonhos.com', 'usuario@institutodossonhos.com');