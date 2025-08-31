# 🔧 Correção: Meta não está sendo salva no banco

## 🚨 Problema Identificado

- ✅ Meta aparece como "criada com sucesso" na interface
- ❌ Meta não aparece na lista do usuário
- ❌ Meta não aparece para o admin aprovar
- ❌ Meta não está sendo salva no banco de dados

## 🔍 Diagnóstico

### Possíveis Causas:

1. **Políticas RLS (Row Level Security)** - Usuário não tem permissão para inserir
2. **Estrutura da tabela** - Campos obrigatórios não estão sendo preenchidos
3. **Erro silencioso** - A inserção falha mas não mostra erro
4. **Problema de autenticação** - Usuário não está autenticado corretamente

## ✅ Soluções Aplicadas

### 1. **Logs de Debug Adicionados**
- ✅ Adicionados `console.log` no `CreateGoalDialog.tsx`
- ✅ Logs mostram dados de inserção e erros detalhados

### 2. **Script SQL para Verificar Banco**
- ✅ `fix-user-goals-insert.sql` - Verifica estrutura e políticas
- ✅ `fix-admin-goals-query.sql` - Corrige query do admin

### 3. **Correção da Query do Admin**
- ✅ Removido relacionamento `goal_categories` que pode não existir
- ✅ Query simplificada para evitar erros 400

## 🚀 Como Resolver

### **Passo 1: Executar Script SQL**
Execute no Supabase SQL Editor:
```sql
-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_goals' 
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_goals';

-- Recriar políticas se necessário
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### **Passo 2: Testar Criação de Meta**
1. Abra o console do navegador (F12)
2. Tente criar uma nova meta
3. Verifique os logs no console:
   - `🚀 Iniciando criação de meta...`
   - `👤 Usuário autenticado: [ID]`
   - `📝 Dados para inserção: {...}`
   - `✅ Meta criada com sucesso: {...}` ou `❌ Erro ao criar meta: {...}`

### **Passo 3: Verificar no Banco**
Execute no Supabase:
```sql
-- Verificar se há metas no banco
SELECT COUNT(*) as total_goals FROM user_goals;

-- Verificar metas pendentes
SELECT * FROM user_goals WHERE status = 'pendente';
```

## 🔧 Correções Específicas

### **Se o erro for RLS:**
```sql
-- Permitir inserção para usuários autenticados
CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### **Se o erro for estrutura da tabela:**
```sql
-- Adicionar colunas faltantes
ALTER TABLE public.user_goals 
ADD COLUMN IF NOT EXISTS evidence_required BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_group_goal BOOLEAN DEFAULT FALSE;
```

### **Se o erro for autenticação:**
- Verificar se o usuário está logado
- Verificar se o `user_id` está sendo enviado corretamente

## 📋 Checklist de Verificação

- [ ] Script SQL executado no Supabase
- [ ] Logs aparecem no console do navegador
- [ ] Meta aparece no banco após criação
- [ ] Meta aparece na lista do usuário
- [ ] Meta aparece para o admin aprovar

## 🎯 Resultado Esperado

Após as correções:
- ✅ Meta é salva no banco de dados
- ✅ Meta aparece na lista do usuário
- ✅ Meta aparece para o admin aprovar
- ✅ Logs mostram sucesso no console

## 📞 Próximos Passos

1. **Execute o script SQL** no Supabase
2. **Teste criar uma meta** e verifique os logs
3. **Verifique no banco** se a meta foi salva
4. **Se ainda não funcionar**, envie os logs do console para análise

**Agora teste criar uma meta e me envie os logs do console para eu te ajudar a identificar o problema específico!** 