# Solução para Problema da Foto de Perfil

## 🔍 Problema Identificado

A foto de perfil não estava sendo salva corretamente no usuário. O problema estava relacionado a:

1. **Estrutura da tabela**: Possível falta da coluna `avatar_url` na tabela `profiles`
2. **Políticas RLS**: Configuração incorreta das políticas de segurança
3. **Bucket Storage**: Problemas com o bucket `avatars` no Supabase Storage
4. **Implementação**: Falha na persistência dos dados

## 🛠️ Soluções Implementadas

### 1. Correção da Estrutura da Tabela

```sql
-- Garantir que a tabela profiles existe com a coluna avatar_url
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  full_name text,
  email text,
  phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text DEFAULT 'Brasil',
  bio text,
  avatar_url text,  -- ← Coluna essencial para foto de perfil
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Adicionar coluna se não existir
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;
```

### 2. Configuração do Bucket de Storage

```sql
-- Criar bucket avatars se não existir
INSERT INTO storage.buckets (id, name, public) 
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas RLS para o bucket avatars
CREATE POLICY "Avatar images são acessíveis publicamente"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

CREATE POLICY "Usuários autenticados podem fazer upload de avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem atualizar seus próprios avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Usuários podem deletar seus próprios avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### 3. Políticas RLS da Tabela Profiles

```sql
-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Políticas para a tabela profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);
```

### 4. Trigger para Auto-atualização

```sql
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

## 🔧 Scripts de Correção

### 1. Script de Diagnóstico (`corrigir-foto-perfil.js`)

Este script faz um diagnóstico completo do problema:

- ✅ Verifica estrutura da tabela `profiles`
- ✅ Verifica existência do bucket `avatars`
- ✅ Testa políticas RLS
- ✅ Testa inserção de `avatar_url`
- ✅ Verifica usuários sem foto

### 2. Script de Teste (`testar-foto-perfil.js`)

Este script testa especificamente a funcionalidade:

- ✅ Simula upload de foto
- ✅ Testa atualização do `avatar_url`
- ✅ Verifica persistência dos dados
- ✅ Testa upload para storage
- ✅ Verifica estrutura final

### 3. Migração SQL (`corrigir-avatar-url.sql`)

Migração completa que corrige todos os problemas:

- ✅ Cria/atualiza tabela `profiles`
- ✅ Configura bucket `avatars`
- ✅ Aplica políticas RLS
- ✅ Cria triggers necessários
- ✅ Verifica dados existentes

## 🚀 Como Aplicar a Correção

### Opção 1: Usando o Script JavaScript

```bash
# Instalar dependências se necessário
npm install @supabase/supabase-js

# Configurar variáveis de ambiente
export SUPABASE_URL="sua_url_do_supabase"
export SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key"

# Executar correção
node corrigir-foto-perfil.js
```

### Opção 2: Usando a Migração SQL

```bash
# Executar no Supabase SQL Editor
# Copiar e colar o conteúdo de corrigir-avatar-url.sql
```

### Opção 3: Teste Específico

```bash
# Testar funcionalidade
node testar-foto-perfil.js
```

## 📋 Verificação da Correção

Após aplicar a correção, verifique:

1. **Estrutura da tabela**:
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' AND table_schema = 'public';
   ```

2. **Bucket de storage**:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'avatars';
   ```

3. **Políticas RLS**:
   ```sql
   SELECT * FROM information_schema.policies 
   WHERE table_name = 'profiles' AND table_schema = 'public';
   ```

4. **Teste de inserção**:
   ```sql
   UPDATE profiles 
   SET avatar_url = 'data:image/jpeg;base64,...' 
   WHERE user_id = 'seu_user_id';
   ```

## 🎯 Resultado Esperado

Após a correção:

- ✅ Foto de perfil é salva corretamente no banco
- ✅ URL da foto é persistida na coluna `avatar_url`
- ✅ Upload para storage funciona (opcional)
- ✅ Políticas de segurança funcionam corretamente
- ✅ Interface mostra a foto atualizada

## 🔍 Troubleshooting

### Se a foto ainda não salvar:

1. **Verificar console do navegador** para erros JavaScript
2. **Verificar logs do Supabase** para erros de RLS
3. **Testar com o script de diagnóstico** para identificar o problema específico
4. **Verificar se o usuário está autenticado** corretamente

### Erros comuns:

- **"RLS policy violation"**: Políticas RLS mal configuradas
- **"Bucket not found"**: Bucket `avatars` não existe
- **"Column not found"**: Coluna `avatar_url` não existe na tabela
- **"Permission denied"**: Usuário não tem permissão para atualizar

## 📞 Suporte

Se o problema persistir após aplicar todas as correções:

1. Execute o script de diagnóstico
2. Verifique os logs de erro
3. Teste com um usuário específico
4. Consulte a documentação do Supabase sobre RLS e Storage 