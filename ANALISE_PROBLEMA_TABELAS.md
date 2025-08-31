# 🚨 ANÁLISE COMPLETA - PROBLEMA DAS TABELAS

## 📊 **PROBLEMA IDENTIFICADO**

Existe um **conflito grave** entre tabelas `profiles` e `user_profiles` que está causando problemas no sistema.

---

## 🔍 **TABELAS DUPLICADAS ENCONTRADAS**

### **1. TABELA `profiles` (CORRETA)**
**Localizações encontradas:**
- `supabase/migrations/20250727011556-48f7736f-dc5a-424c-bdc1-093131890af6.sql`
- `supabase/migrations/20250101000004_initial_schema.sql`
- `supabase/migrations/20250726232516-1fee926c-819b-486d-bdbf-33a81c716ff8.sql`
- `supabase/migrations/20250101000002_subscription_system.sql`

**Estrutura:**
```sql
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Brasil',
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **2. TABELA `user_profiles` (CONFLITANTE)**
**Localizações encontradas:**
- `supabase/migrations/20250726195926-286529c0-fa0d-4352-9321-a1f88baf0638.sql`
- `supabase/migrations/20250729055450-a1fa6949-d607-49e7-9970-969f31099706.sql`
- `supabase/migrations/20250723205423-11a83023-8f71-48e3-a84f-766e6487d5d1.sql`
- `supabase/migrations/20250726200042-a3ba6367-9001-4672-b772-78d395d1ae85.sql`
- `supabase/migrations/20250122000000-user-profiles.sql`

**Estrutura:**
```sql
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  full_name TEXT,
  phone TEXT,
  birth_date DATE,
  city TEXT,
  state TEXT,
  avatar_url TEXT,
  bio TEXT,
  goals TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

---

## 🚨 **PROBLEMAS IDENTIFICADOS**

### **1. CONFLITO DE NOMES**
- ❌ **`profiles`** - Usada pelo sistema atual
- ❌ **`user_profiles`** - Criada em migrações antigas
- ❌ **Ambas existem** no banco de dados

### **2. CÓDIGO CONFUSO**
```typescript
// O código está tentando usar 'profiles' mas pode estar encontrando 'user_profiles'
const { data: profile } = await supabase
  .from('profiles')  // ← Pode estar vazio se a tabela for 'user_profiles'
  .select('*')
  .eq('user_id', userId)
  .single();
```

### **3. MIGRAÇÕES CONFLITANTES**
- **Múltiplas migrações** criando tabelas similares
- **Ordem de execução** pode estar causando problemas
- **Políticas RLS** duplicadas

---

## ✅ **SOLUÇÃO PROPOSTA**

### **PASSO 1: VERIFICAR TABELAS ATUAIS**
```sql
-- Verificar quais tabelas existem
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name IN ('profiles', 'user_profiles')
AND table_schema = 'public';

-- Verificar estrutura de cada tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;
```

### **PASSO 2: UNIFICAR TABELAS**
```sql
-- Se ambas existem, migrar dados de user_profiles para profiles
INSERT INTO profiles (user_id, full_name, email, phone, city, state, avatar_url, bio, created_at, updated_at)
SELECT user_id, full_name, email, phone, city, state, avatar_url, bio, created_at, updated_at
FROM user_profiles
ON CONFLICT (user_id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  city = EXCLUDED.city,
  state = EXCLUDED.state,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- Remover tabela user_profiles
DROP TABLE IF EXISTS user_profiles CASCADE;
```

### **PASSO 3: CORRIGIR MIGRAÇÕES**
```sql
-- Garantir que apenas a tabela 'profiles' existe
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  birth_date DATE,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'Brasil',
  bio TEXT,
  avatar_url TEXT,
  goals TEXT[] DEFAULT '{}',
  achievements TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Recriar políticas RLS
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
```

---

## 📋 **TABELAS ESSENCIAIS VERIFICADAS**

### **✅ TABELAS CORRETAS:**
1. **`profiles`** - Perfil do usuário
2. **`weight_measurements`** - Medições de peso
3. **`daily_mission_sessions`** - Sessões de missões
4. **`daily_responses`** - Respostas diárias
5. **`user_achievements`** - Conquistas
6. **`weekly_insights`** - Insights semanais

### **❌ TABELAS PROBLEMÁTICAS:**
1. **`user_profiles`** - Duplicada, deve ser removida
2. **`weighings`** - Antiga, substituída por `weight_measurements`
3. **`missions`** - Antiga, substituída por `daily_mission_sessions`

---

## 🎯 **AÇÃO IMEDIATA**

### **1. Execute este script para verificar:**
```sql
-- VERIFICAÇÃO COMPLETA DAS TABELAS
SELECT 'TABELAS EXISTENTES:' as info;
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'user_profiles', 'weight_measurements', 'daily_mission_sessions')
ORDER BY table_name;

-- VERIFICAR DADOS NAS TABELAS
SELECT 'DADOS EM PROFILES:' as info;
SELECT COUNT(*) as total_profiles FROM profiles;

SELECT 'DADOS EM USER_PROFILES:' as info;
SELECT COUNT(*) as total_user_profiles FROM user_profiles;

SELECT 'DADOS EM WEIGHT_MEASUREMENTS:' as info;
SELECT COUNT(*) as total_measurements FROM weight_measurements;

SELECT 'DADOS EM DAILY_MISSION_SESSIONS:' as info;
SELECT COUNT(*) as total_sessions FROM daily_mission_sessions;
```

### **2. Se houver conflitos, execute a unificação:**
```sql
-- UNIFICAR TABELAS DE PROFILES
-- (Script completo de unificação)
```

---

## 📊 **RESULTADO ESPERADO**

Após a correção:
- ✅ **Apenas `profiles`** deve existir
- ✅ **Dados unificados** em uma única tabela
- ✅ **Código funcionando** corretamente
- ✅ **Triggers funcionando** para criação automática
- ✅ **Admin panel** mostrando todos os usuários

**Execute a verificação AGORA para identificar o problema exato!** 🚀 