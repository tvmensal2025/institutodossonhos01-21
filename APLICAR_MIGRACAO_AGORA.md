# 🚀 APLICAR MIGRAÇÃO NO SUPABASE REMOTO AGORA

## **📋 PASSO A PASSO:**

### **1. Acesse o Supabase Dashboard**
- Vá para: https://supabase.com/dashboard
- Faça login na sua conta
- Selecione o projeto: **Plataforma** (hlrkoyywjpckdotimtik)

### **2. Abra o SQL Editor**
- No menu lateral, clique em **"SQL Editor"**
- Clique em **"New query"**

### **3. Cole o Código SQL**
Copie e cole todo o conteúdo do arquivo `APPLY_DAILY_MISSIONS_MIGRATION.sql` no editor.

### **4. Execute a Migração**
- Clique em **"Run"** para executar o SQL
- Aguarde a execução completa

### **5. Verifique se Funcionou**
Você deve ver a mensagem: `"Migração do Sistema de Missão do Dia aplicada com sucesso!"`

## **✅ O QUE SERÁ CRIADO:**

### **Tabelas:**
- `daily_mission_sessions` - Sessões diárias de missão
- `daily_responses` - Respostas das perguntas
- `user_achievements` - Conquistas do usuário
- `weekly_insights` - Insights semanais

### **Funcionalidades:**
- ✅ Row Level Security (RLS) habilitado
- ✅ Políticas de segurança configuradas
- ✅ Índices para performance
- ✅ Funções para calcular streak
- ✅ Triggers para gerar insights semanais
- ✅ Sistema de conquistas automático

## **🧪 TESTE APÓS APLICAÇÃO:**

1. **Acesse a aplicação:**
   - Vá para: http://localhost:8080
   - Faça login
   - Acesse "Missão do Dia"

2. **Teste as funcionalidades:**
   - Responda algumas perguntas
   - Verifique se salva automaticamente
   - Complete uma missão
   - Verifique se aparece a mensagem de conclusão

## **🎯 PRÓXIMO PASSO:**

Após aplicar a migração, o sistema de Missão do Dia deve funcionar perfeitamente com todas as 12 perguntas!

---

**⚠️ IMPORTANTE:** Esta migração é necessária para que o sistema funcione corretamente! 