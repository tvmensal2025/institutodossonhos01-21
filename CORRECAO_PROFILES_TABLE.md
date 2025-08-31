# Correção do Erro "permission denied for table users" - Problema da Tabela Profiles

## Problema Identificado
O erro `permission denied for table users` está sendo causado por consultas à tabela `profiles` que estão sendo executadas durante a criação de metas. O sistema está tentando acessar a tabela `profiles` mas pode estar fazendo isso de forma incorreta.

## Causa Raiz
No arquivo `CreateGoalDialog.tsx`, há duas consultas à tabela `profiles` que estão sendo executadas:

1. **Linha 126**: Consulta para buscar usuários da plataforma para convites
2. **Linha 226**: Consulta para buscar o perfil do usuário atual

## Soluções Aplicadas

### 1. **Frontend Corrigido**
- **Desabilitado temporariamente** a consulta de usuários da plataforma
- **Desabilitado temporariamente** a consulta do perfil do usuário
- **Simplificado** o sistema de convites para evitar consultas desnecessárias

### 2. **Script SQL de Diagnóstico**
Criado o arquivo `fix-profiles-table.sql` que:
- Verifica se a tabela `profiles` existe e está correta
- Verifica políticas RLS da tabela `profiles`
- Testa consultas simples na tabela
- Recria políticas RLS se necessário

## Passos para Resolver

### Passo 1: Executar Script de Diagnóstico
1. Abra o **SQL Editor** do Supabase
2. Execute o script `fix-profiles-table.sql`
3. Analise os resultados para verificar se a tabela `profiles` está correta

### Passo 2: Testar Criação de Meta
1. Abra o console do navegador (F12)
2. Tente criar uma nova meta
3. Verifique se o erro `permission denied for table users` ainda ocorre

### Passo 3: Verificar Logs
1. Verifique os logs detalhados no console
2. Confirme se a meta é criada com sucesso
3. Verifique se não há mais erros relacionados à tabela `users`

## Verificação de Sucesso

### ✅ Critérios de Sucesso
- [ ] Script SQL executa sem erros
- [ ] Tabela `profiles` existe e está acessível
- [ ] Meta é criada com sucesso no frontend
- [ ] Não há mais erro `permission denied for table users`
- [ ] Meta aparece na lista de metas pendentes

### 🔍 Logs Esperados (Sucesso)
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

## Arquivos Modificados

### Frontend
- `src/components/goals/CreateGoalDialog.tsx`: 
  - Desabilitada consulta de usuários da plataforma
  - Desabilitada consulta do perfil do usuário
  - Simplificado sistema de convites

### Backend
- `fix-profiles-table.sql`: Script de diagnóstico para tabela profiles
- `CORRECAO_PROFILES_TABLE.md`: Esta documentação

## Próximos Passos

### Se o problema persistir:
1. **Verificar tabela profiles**: Confirmar se a tabela existe e está correta
2. **Verificar políticas RLS**: Recriar políticas RLS para profiles
3. **Verificar funções**: Procurar por funções que podem estar acessando profiles incorretamente
4. **Verificar triggers**: Procurar por triggers que podem estar sendo executados

### Se o problema for resolvido:
1. **Reabilitar funcionalidades**: Reabilitar consultas de profiles gradualmente
2. **Testar convites**: Testar sistema de convites
3. **Testar admin**: Confirmar que admin consegue ver metas
4. **Testar aprovação**: Testar aprovação de metas pelo admin

## Comandos Úteis

### Verificar Tabela Profiles
```sql
SELECT schemaname, tablename 
FROM pg_tables 
WHERE tablename = 'profiles';
```

### Verificar Políticas RLS
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';
```

### Testar Consulta Profiles
```sql
SELECT user_id, full_name, email 
FROM public.profiles 
LIMIT 5;
```

## Status Atual
🔄 **Em Progresso**: Aguardando execução do script SQL e teste da criação de meta

## Notas Importantes
- As consultas à tabela `profiles` foram **desabilitadas temporariamente** para isolar o problema
- O sistema de convites foi **simplificado** para evitar consultas desnecessárias
- Após resolver o problema principal, as funcionalidades serão **reabilitadas gradualmente** 