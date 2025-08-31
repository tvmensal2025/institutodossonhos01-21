# 🚨 CORREÇÃO URGENTE - PROFILES NÃO SENDO CRIADOS

## 🎯 **PROBLEMA IDENTIFICADO**
Os usuários que você criou não estão sendo automaticamente adicionados à tabela `profiles` porque os **triggers não estão funcionando corretamente**.

## ✅ **SOLUÇÃO IMEDIATA**

### **PASSO 1: Execute o Script de Correção**
1. **Abra o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Cole e execute este script:**

```sql
-- CORREÇÃO URGENTE - Triggers de Profiles
-- Execute este script NO SQL EDITOR DO SUPABASE

-- 1. Verificar triggers existentes
SELECT 'TRIGGERS EXISTENTES:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%auth%' OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- 2. Verificar função handle_new_user
SELECT 'FUNÇÃO handle_new_user:' as info;
SELECT routine_name, routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- 3. Recriar função handle_new_user corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    full_name, 
    email,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', 'Usuário'),
    NEW.email,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$;

-- 4. Remover triggers conflitantes
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_created_profile ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_role_created ON auth.users;

-- 5. Criar trigger único e correto
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Verificar se trigger foi criado
SELECT 'TRIGGER CRIADO:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. Corrigir usuários existentes que não têm profile
INSERT INTO public.profiles (user_id, full_name, email, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data ->> 'full_name', 'Usuário'),
  au.email,
  NOW(),
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 8. Verificar quantos usuários foram corrigidos
SELECT 'USUÁRIOS CORRIGIDOS:' as info;
SELECT COUNT(*) as usuarios_sem_perfil
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 9. Verificar estrutura da tabela profiles
SELECT 'ESTRUTURA DA TABELA PROFILES:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 10. Verificar políticas RLS
SELECT 'POLÍTICAS RLS:' as info;
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 11. Recriar políticas RLS se necessário
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all profiles" 
ON public.profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 12. Mensagem de sucesso
SELECT '✅ TRIGGERS E PROFILES CORRIGIDOS!' as resultado;
```

### **PASSO 2: Execute o Script de Teste**
Após executar o script acima, execute este script de teste:

```sql
-- TESTE DE TRIGGERS DE PROFILES
-- Execute este script para verificar se os triggers estão funcionando

-- 1. Verificar triggers ativos
SELECT '🔍 VERIFICANDO TRIGGERS:' as info;
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE trigger_name LIKE '%auth%' OR trigger_name LIKE '%user%'
ORDER BY trigger_name;

-- 2. Verificar usuários sem profile
SELECT '🔍 USUÁRIOS SEM PROFILE:' as info;
SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data ->> 'full_name' as full_name,
    p.id as profile_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
WHERE p.id IS NULL;

-- 3. Verificar total de usuários vs profiles
SELECT '🔍 COMPARAÇÃO USUÁRIOS VS PROFILES:' as info;
SELECT 
    (SELECT COUNT(*) FROM auth.users) as total_usuarios,
    (SELECT COUNT(*) FROM public.profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users) - (SELECT COUNT(*) FROM public.profiles) as diferenca;

-- 4. Mensagem final
SELECT '✅ TESTE CONCLUÍDO! Verifique os resultados acima.' as resultado;
```

### **PASSO 3: Verifique o Resultado**
Após executar os scripts, você deve ver:
- ✅ **Triggers ativos** - `on_auth_user_created` deve aparecer
- ✅ **Usuários corrigidos** - Todos os usuários devem ter profiles
- ✅ **Diferência = 0** - Número de usuários deve igual ao de profiles

### **PASSO 4: Teste Criação de Novo Usuário**
1. **Crie um novo usuário** no sistema
2. **Verifique se o profile foi criado automaticamente**
3. **Confirme que aparece na lista de admin**

## 🔍 **VERIFICAÇÃO DE SUCESSO**

### **Logs Esperados:**
```
✅ TRIGGERS E PROFILES CORRIGIDOS!
🔍 VERIFICANDO TRIGGERS: [trigger ativo]
🔍 USUÁRIOS SEM PROFILE: [lista vazia]
🔍 COMPARAÇÃO USUÁRIOS VS PROFILES: [diferenca = 0]
```

### **No Painel Admin:**
- ✅ Usuários aparecem na lista
- ✅ Dados de perfil carregam corretamente
- ✅ Edição de usuários funciona

## 🚨 **SE AINDA NÃO FUNCIONAR**

### **1. Verificar se a Tabela Profiles Existe:**
```sql
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables 
  WHERE table_name = 'profiles' 
  AND table_schema = 'public'
);
```

### **2. Recriar Tabela Profiles (ÚLTIMO RECURSO):**
```sql
-- CUIDADO: Isso apaga todos os dados existentes!
DROP TABLE IF EXISTS public.profiles CASCADE;

CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

## 📋 **ARQUIVOS CRIADOS**
- `CORRECAO_TRIGGERS_PROFILES.sql` - Script de correção
- `TESTE_TRIGGERS_PROFILES.sql` - Script de teste
- `INSTRUCOES_CORRECAO_PROFILES.md` - Este guia

## 🎯 **AÇÃO IMEDIATA**
**Execute os scripts SQL AGORA no Supabase Dashboard!**

O problema será resolvido e todos os usuários terão profiles criados automaticamente. 🚀 