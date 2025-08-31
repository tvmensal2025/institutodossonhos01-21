# 🚀 INSTRUÇÕES PARA APLICAR A MIGRAÇÃO DO SISTEMA DE MISSÃO DO DIA

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

1. **Inicie o servidor local:**
   ```bash
   npm run dev
   ```

2. **Acesse a aplicação:**
   - Vá para: http://localhost:3000
   - Faça login
   - Acesse "Missão do Dia"

3. **Teste as funcionalidades:**
   - Responda algumas perguntas
   - Verifique se salva automaticamente
   - Complete uma missão
   - Verifique se aparece a mensagem de conclusão

## **🔧 SE HOUVER PROBLEMAS:**

### **Erro de Conexão:**
- Verifique se o Supabase está rodando: `npx supabase status`
- Reinicie se necessário: `npx supabase stop && npx supabase start`

### **Erro de Autenticação:**
- Verifique as variáveis de ambiente no arquivo `.env`
- Confirme se as chaves do Supabase estão corretas

### **Erro de Permissão:**
- Verifique se as políticas RLS estão aplicadas corretamente
- Confirme se o usuário está autenticado

## **📞 SUPORTE:**

Se encontrar algum problema, verifique:
1. Logs do console do navegador
2. Logs do terminal onde o servidor está rodando
3. Logs do Supabase Dashboard

---

**🎯 PRÓXIMO PASSO:** Após aplicar a migração, teste o sistema completo! 