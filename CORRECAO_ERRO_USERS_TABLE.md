# Correção do Erro "permission denied for table users"

## Problema Identificado
O erro `permission denied for table users` (código 42501) está ocorrendo durante a inserção de metas no banco de dados. Este erro indica que alguma parte do código está tentando acessar uma tabela `users` que não existe no Supabase.

## Possíveis Causas

### 1. **Função ou Trigger Automático**
Pode haver uma função ou trigger que está sendo executada automaticamente durante a inserção e tentando acessar a tabela `users` em vez de `auth.users`.

### 2. **Política RLS Incorreta**
Alguma política RLS pode estar tentando acessar a tabela `users` em vez de `auth.users`.

### 3. **Função Edge Function**
Alguma Edge Function pode estar sendo chamada automaticamente e tentando acessar a tabela `users`.

## Soluções Aplicadas

### 1. **Script SQL de Diagnóstico**
Criado o arquivo `fix-users-table-error.sql` que:
- Verifica se existe alguma tabela `users` (não deveria existir)
- Identifica funções que estão tentando acessar `users`
- Verifica triggers que podem estar causando o problema
- Recria políticas RLS simplificadas
- Testa inserção com RLS desabilitado

### 2. **Correção no Frontend**
- Simplificado o hook `useGoals` para remover relacionamentos que podem não existir
- Adicionado logs detalhados no `CreateGoalDialog.tsx` para rastrear o erro

## Passos para Resolver

### Passo 1: Executar Script de Diagnóstico
1. Abra o **SQL Editor** do Supabase
2. Execute o script `fix-users-table-error.sql`
3. Analise os resultados para identificar a causa

### Passo 2: Verificar Funções Edge
1. Vá para **Edge Functions** no Supabase
2. Verifique se há alguma função que está sendo chamada automaticamente
3. Procure por referências à tabela `users` nas funções

### Passo 3: Testar Inserção
1. Execute o teste de inserção no script SQL
2. Verifique se a inserção funciona com RLS desabilitado
3. Reabilite RLS e teste novamente

### Passo 4: Verificar Logs
1. Abra o console do navegador
2. Tente criar uma nova meta
3. Verifique os logs detalhados que foram adicionados

## Verificação de Sucesso

### ✅ Critérios de Sucesso
- [ ] Script SQL executa sem erros
- [ ] Inserção de teste funciona
- [ ] Meta é criada com sucesso no frontend
- [ ] Meta aparece na lista de metas pendentes
- [ ] Admin consegue ver a meta para aprovação

### 🔍 Logs Esperados
```
🚀 Iniciando criação de meta...
👤 Usuário autenticado: [user-id]
📊 Pontos estimados: [pontos]
📝 Dados para inserção: [dados]
✅ Meta criada com sucesso: [meta]
```

### ❌ Logs de Erro (se ainda houver problema)
```
❌ Erro ao criar meta: [erro]
❌ Erro na mutation: [erro]
```

## Próximos Passos

### Se o problema persistir:
1. **Verificar Edge Functions**: Procurar por funções que podem estar sendo chamadas automaticamente
2. **Verificar Triggers**: Procurar por triggers que podem estar sendo executados
3. **Verificar Políticas RLS**: Recriar todas as políticas RLS para `user_goals`
4. **Verificar Relacionamentos**: Remover relacionamentos que podem não existir

### Se o problema for resolvido:
1. **Testar criação de meta**: Criar uma nova meta pelo frontend
2. **Verificar admin**: Confirmar que a meta aparece para o admin
3. **Testar aprovação**: Aprovar a meta pelo admin
4. **Verificar listagem**: Confirmar que a meta aparece na lista do usuário

## Arquivos Modificados

### Frontend
- `src/hooks/useGoals.ts`: Simplificado select para remover relacionamentos
- `src/components/goals/CreateGoalDialog.tsx`: Adicionados logs detalhados

### Backend
- `fix-users-table-error.sql`: Script de diagnóstico e correção
- `CORRECAO_ERRO_USERS_TABLE.md`: Esta documentação

## Comandos Úteis

### Verificar Políticas RLS
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'user_goals';
```

### Verificar Funções
```sql
SELECT routine_name, routine_definition
FROM information_schema.routines
WHERE routine_definition LIKE '%users%'
AND routine_schema = 'public';
```

### Verificar Triggers
```sql
SELECT trigger_name, event_object_table, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'user_goals';
```

## Status Atual
🔄 **Em Progresso**: Aguardando execução do script SQL e teste da criação de meta 