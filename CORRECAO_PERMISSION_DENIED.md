# 🔧 Correção: "permission denied for table users"

## 🚨 Problema Identificado

**Erro:** `permission denied for table users`
**Código:** `42501`
**Localização:** `CreateGoalDialog.tsx:189`

## 🔍 Diagnóstico

O erro indica que o código está tentando acessar uma tabela chamada `users` que não existe no Supabase. No Supabase, a tabela de usuários é `auth.users` (não acessível diretamente) e os perfis estão em `profiles`.

## ✅ Soluções Aplicadas

### 1. **Código Simplificado**
- ✅ Removido temporariamente `processInvites` que pode estar causando o problema
- ✅ Adicionados logs detalhados para debug
- ✅ Isolado o problema na inserção básica

### 2. **Script SQL para Correção**
- ✅ `fix-permission-denied.sql` - Para verificar e corrigir políticas RLS

## 🚀 Como Resolver

### **Passo 1: Executar Script SQL**
Execute no Supabase SQL Editor:
```sql
-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_goals';

-- Recriar políticas mais simples
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### **Passo 2: Testar Criação Simplificada**
1. Abra o console do navegador (F12)
2. Tente criar uma nova meta
3. Verifique os logs:
   - `🚀 Iniciando criação de meta...`
   - `👤 Usuário autenticado: [ID]`
   - `📝 Dados para inserção: {...}`
   - `✅ Meta criada com sucesso: {...}` ou `❌ Erro ao criar meta: {...}`

### **Passo 3: Verificar no Banco**
```sql
-- Verificar se a meta foi criada
SELECT COUNT(*) as total_goals FROM user_goals;
SELECT * FROM user_goals WHERE status = 'pendente' ORDER BY created_at DESC;
```

## 🔧 Possíveis Causas

### **1. Política RLS Restritiva**
```sql
-- Solução: Recriar política mais permissiva
CREATE POLICY "Users can create their own goals" 
ON public.user_goals 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
```

### **2. Função ou Trigger Problemática**
```sql
-- Verificar se há triggers causando problema
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'user_goals';
```

### **3. Consulta a Tabela Inexistente**
- Verificar se há alguma consulta tentando acessar `users` em vez de `profiles`
- Verificar edge functions que podem estar tentando acessar tabela errada

## 📋 Checklist de Verificação

- [ ] Script SQL executado no Supabase
- [ ] Políticas RLS recriadas
- [ ] Teste de criação simplificada realizado
- [ ] Logs verificados no console
- [ ] Meta aparece no banco após criação

## 🎯 Resultado Esperado

Após as correções:
- ✅ Meta é criada sem erro de permission denied
- ✅ Meta aparece no banco de dados
- ✅ Meta aparece na lista do usuário
- ✅ Meta aparece para o admin aprovar

## 📞 Próximos Passos

1. **Execute o script SQL** no Supabase
2. **Teste criar uma meta** com a versão simplificada
3. **Verifique os logs** no console do navegador
4. **Se ainda der erro**, envie os logs para análise

**Agora teste criar uma meta e me envie os logs do console para eu identificar exatamente onde está o problema!** 