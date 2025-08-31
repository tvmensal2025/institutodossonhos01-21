# Correção - Admin não consegue aceitar/recusar desafios

## 🚨 **Problemas Identificados**

### **1. Estrutura de Tabelas Incompleta**
- ❌ Coluna `email` ausente na tabela `profiles`
- ❌ Colunas de aprovação ausentes em `user_goals`
- ❌ Funções SQL para aprovação não existem

### **2. Código Frontend Problemático**
- ❌ Consultas com JOINs para colunas inexistentes
- ❌ Lógica de aprovação usando UPDATE direto
- ❌ Sem tratamento adequado de erros

## ✅ **Soluções Implementadas**

### **1. Script de Correção Completa**
**`fix-admin-approval-system.sql`** - Corrige toda a estrutura:
- ✅ Adiciona colunas ausentes em `profiles` e `user_goals`
- ✅ Cria funções `approve_goal()` e `reject_goal()`
- ✅ Atualiza emails nos perfis baseado em `auth.users`
- ✅ Cria políticas RLS adequadas para admin
- ✅ Verifica e lista metas pendentes

### **2. Correção do Frontend**
**`GoalManagement.tsx`** - Atualizado para:
- ✅ Usar funções SQL `approve_goal()` e `reject_goal()`
- ✅ Logs detalhados para debugging
- ✅ Tratamento adequado de erros
- ✅ Atualização correta de pontos

### **3. Script de Teste**
**`test-admin-approval.sql`** - Para verificar:
- ✅ Se funções foram criadas
- ✅ Se usuários admin existem
- ✅ Se metas pendentes estão disponíveis
- ✅ Teste automatizado de aprovação

## 🚀 **Passos para Resolver**

### **Passo 1: Execute o Script Principal**
```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: fix-admin-approval-system.sql
```

### **Passo 2: Verifique o Sistema**
```sql
-- Execute no SQL Editor do Supabase
-- Arquivo: test-admin-approval.sql
```

### **Passo 3: Teste na Interface**
1. **Faça login** como admin (`teste@institutodossonhos.com`)
2. **Vá para** `/admin/goals` ou página admin
3. **Procure** por metas pendentes
4. **Clique** em "Aprovar" ou "Rejeitar"
5. **Verifique** os logs no console

## 🔍 **Verificação de Sucesso**

### **Logs Esperados no Console:**
```
🔍 Processando aprovação: {goalId: "...", approval: {...}, adminId: "..."}
✅ Meta aprovada com sucesso
```

### **No Banco de Dados:**
```sql
-- Verificar se meta foi aprovada
SELECT id, title, status, approved_by, approved_at, admin_notes
FROM public.user_goals 
WHERE status IN ('aprovada', 'rejeitada')
ORDER BY approved_at DESC;
```

## 🛠️ **Estrutura Criada**

### **Novas Colunas em `profiles`:**
- `email` - Email do usuário
- `full_name` - Nome completo
- `role` - Função (admin/user)
- `admin_level` - Nível admin (super/normal)

### **Novas Colunas em `user_goals`:**
- `approved_by` - ID do admin que aprovou
- `approved_at` - Data/hora da aprovação
- `rejection_reason` - Motivo da rejeição
- `admin_notes` - Notas do admin

### **Funções SQL Criadas:**
- `approve_goal(goal_id, admin_user_id, admin_notes)` - Aprovar meta
- `reject_goal(goal_id, admin_user_id, rejection_reason, admin_notes)` - Rejeitar meta

## 🔐 **Políticas RLS Atualizadas**

### **Para `user_goals`:**
- Admin pode ver/editar todas as metas
- Usuário pode ver apenas suas próprias metas

### **Para `profiles`:**
- Admin pode ver todos os perfis
- Usuário pode ver apenas seu próprio perfil

## 🚨 **Se Ainda Não Funcionar**

### **1. Verificar Admin Existe:**
```sql
SELECT * FROM public.profiles WHERE role = 'admin';
```

### **2. Criar Admin Manualmente:**
```sql
-- Use o script create-admin-user.sql
```

### **3. Verificar Funções:**
```sql
SELECT routine_name FROM information_schema.routines 
WHERE routine_name IN ('approve_goal', 'reject_goal');
```

### **4. Logs Detalhados:**
- Abra **Console do Navegador** (F12)
- Vá para aba **Console**
- Tente aprovar uma meta
- Copie todos os logs de erro

## 📋 **Arquivos Criados**
- `fix-admin-approval-system.sql` - Correção completa
- `test-admin-approval.sql` - Script de teste
- `CORRECAO_ADMIN_APROVACAO.md` - Este guia

## 🎯 **Ação Imediata**
1. **Execute** `fix-admin-approval-system.sql`
2. **Execute** `test-admin-approval.sql`
3. **Recarregue** a aplicação
4. **Teste** aprovação como admin

**O sistema de aprovação deve funcionar perfeitamente após executar os scripts!** ✅