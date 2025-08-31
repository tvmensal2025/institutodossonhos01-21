# 🚨 EMERGÊNCIA - Resolver Problema user_goals

## 🎯 **Problema Persistente**
O erro `Could not find the 'category' column of 'user_goals' in the schema cache` continua mesmo após tentativas de adicionar colunas.

## 🔥 **Soluções de Emergência**

### **Opção 1: Script Simples (RECOMENDADO)**
Execute `simple-fix-user-goals.sql` no SQL Editor:
- ✅ Cria tabela se não existir
- ✅ Adiciona colunas uma por uma com verificação
- ✅ Força refresh do schema
- ✅ Menos arriscado

### **Opção 2: Recriar Tabela (DRÁSTICO)**
Execute `recreate-user-goals-table.sql` no SQL Editor:
- ⚠️ **CUIDADO**: Apaga dados existentes
- ✅ Recria tabela do zero
- ✅ Estrutura 100% correta
- ⚠️ Use apenas se Opção 1 falhar

### **Opção 3: Verificação Manual**
Execute no SQL Editor:
```sql
-- Verificar se tabela existe
SELECT * FROM pg_tables WHERE tablename = 'user_goals';

-- Verificar colunas existentes
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'user_goals' AND table_schema = 'public';
```

## 🚀 **Passos Imediatos**

### **Passo 1: Execute Script Simples**
1. Abra **SQL Editor** do Supabase
2. Cole e execute `simple-fix-user-goals.sql`
3. Verifique se executa sem erros

### **Passo 2: Teste Criação de Meta**
1. Recarregue a página do frontend
2. Tente criar uma meta
3. Verifique logs no console

### **Passo 3: Se Ainda Falhar**
1. Execute `recreate-user-goals-table.sql`
2. **ATENÇÃO**: Isso apagará dados existentes
3. Teste novamente

## ✅ **Verificação de Sucesso**
Após executar o script, os logs devem mostrar:
```
🚀 Iniciando criação de meta...
🔍 Auth data: { user: {...}, authError: null }
👤 Usuário autenticado: [user-id]
📊 Pontos estimados: [pontos]
📝 Dados para inserção: [dados]
✅ Meta criada com sucesso: [meta]
```

## 📋 **Checklist**
- [ ] Executei `simple-fix-user-goals.sql`
- [ ] Script executou sem erros
- [ ] Recarreguei a página do frontend
- [ ] Testei criar uma meta
- [ ] Meta foi criada com sucesso

## 🆘 **Se Nada Funcionar**
1. Verifique se está conectado ao projeto correto
2. Verifique se tem permissões de admin no Supabase
3. Tente fazer logout/login no Supabase Dashboard
4. Execute `NOTIFY pgrst, 'reload schema';` manualmente

## 🎯 **Ação Imediata**
**Execute `simple-fix-user-goals.sql` AGORA no SQL Editor do Supabase!**