# Solução Rápida para Erro "permission denied for table users"

## 🚨 Problema Atual
Erro `ERRO: 42809: "array_agg" é uma função de agregação` no SQL Editor do Supabase.

## 🔧 Solução Imediata

### Passo 1: Execute o Script Simples
1. Abra o **SQL Editor** do Supabase
2. Execute o script `test-goal-creation.sql` (mais simples, sem funções complexas)
3. Verifique se executa sem erros

### Passo 2: Teste a Criação de Meta
1. Abra o console do navegador (F12)
2. Tente criar uma nova meta
3. Verifique se o erro `permission denied for table users` ainda ocorre

### Passo 3: Se Ainda Houver Erro
Execute este comando SQL simples:

```sql
-- Verificar se a tabela user_goals existe
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'user_goals';

-- Recriar políticas RLS simples
DROP POLICY IF EXISTS "Users can view their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can create their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can update their own goals" ON public.user_goals;
DROP POLICY IF EXISTS "Users can delete their own goals" ON public.user_goals;

CREATE POLICY "Users can view their own goals"
ON public.user_goals
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals"
ON public.user_goals
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals"
ON public.user_goals
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals"
ON public.user_goals
FOR DELETE
USING (auth.uid() = user_id);
```

## ✅ Verificação de Sucesso

### Logs Esperados (Sucesso)
```
🚀 Iniciando criação de meta...
👤 Usuário autenticado: [user-id]
📊 Pontos estimados: [pontos]
📝 Dados para inserção: [dados]
✅ Meta criada com sucesso: [meta]
```

### Se Ainda Houver Erro
- Verifique se a tabela `user_goals` existe
- Verifique se as políticas RLS foram criadas corretamente
- Teste inserção direta no SQL Editor

## 📝 Arquivos Criados
- `test-goal-creation.sql`: Script simples para testar criação de meta
- `fix-profiles-simple.sql`: Script simples para verificar tabela profiles
- `SOLUCAO_RAPIDA_ERRO_USERS.md`: Este guia

## 🎯 Próximo Passo
Execute o script `test-goal-creation.sql` e teste a criação de meta! 