# 🔧 APLICAR MIGRAÇÃO IA - INSTRUÇÕES

## 📋 **RESUMO**

Para completar a implementação do Controle Unificado de IA, é necessário aplicar a migração SQL manualmente no Supabase.

---

## 🚀 **PASSOS PARA APLICAR A MIGRAÇÃO**

### **1. Acessar o Supabase Dashboard**
1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione o projeto: `hlrkoyywjpckdotimtik`

### **2. Abrir o SQL Editor**
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**

### **3. Executar o Script SQL**
1. Copie o conteúdo do arquivo `apply-ai-configurations-update.sql`
2. Cole no editor SQL
3. Clique em **"Run"**

### **4. Verificar a Aplicação**
O script irá:
- ✅ Adicionar colunas `personality` e `level` na tabela `ai_configurations`
- ✅ Criar nova tabela `ai_documents`
- ✅ Criar índices para performance
- ✅ Atualizar configurações existentes
- ✅ Verificar se tudo foi aplicado corretamente

---

## 📁 **ARQUIVOS IMPORTANTES**

### **Script de Migração:**
```
apply-ai-configurations-update.sql
```

### **Componente Atualizado:**
```
src/components/admin/AIControlPanelUnified.tsx
```

### **Documentação:**
```
CONTROLE_IA_UNIFICADO_IMPLEMENTADO.md
```

---

## 🔧 **FUNCIONALIDADES IMPLEMENTADAS**

### **✅ Já Funcionando:**
- 🧠 Personalidades (DrVital/Sofia)
- ⚙️ Configuração por função
- 🎛️ Níveis (Máximo/Meio/Mínimo)
- 🧪 Sistema de teste individual
- 📊 Monitoramento

### **⏳ Aguardando Migração:**
- 📚 Upload de documentos
- 📖 Base de conhecimento
- 🔄 Funcionalidades de documentos

---

## 🎯 **APÓS APLICAR A MIGRAÇÃO**

### **1. Descomentar Funcionalidades**
No arquivo `AIControlPanelUnified.tsx`, descomente:
```typescript
// Remover comentários das funções:
// - loadDocuments()
// - uploadDocuments()
```

### **2. Testar o Sistema**
1. Acesse o admin
2. Vá para "Controle de IA"
3. Teste as configurações
4. Verifique upload de documentos

### **3. Configurar Personalidades**
1. Configure DrVital para análises médicas
2. Configure Sofia para motivação
3. Ajuste níveis por função
4. Teste cada configuração

---

## 📊 **VERIFICAÇÃO**

### **Verificar se a Migração Funcionou:**
```sql
-- Verificar colunas adicionadas
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ai_configurations' 
AND column_name IN ('personality', 'level');

-- Verificar tabela criada
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'ai_documents';
```

### **Resultado Esperado:**
- ✅ Colunas `personality` e `level` existem
- ✅ Tabela `ai_documents` foi criada
- ✅ Índices foram criados
- ✅ Configurações foram atualizadas

---

## 🚨 **EM CASO DE ERRO**

### **Se a Migração Falhar:**
1. Verifique se tem permissões de admin no Supabase
2. Execute o script em partes menores
3. Verifique se não há conflitos de nomes
4. Consulte os logs de erro

### **Se o Componente Não Funcionar:**
1. Verifique se as colunas foram criadas
2. Confirme se os tipos estão corretos
3. Teste a conexão com o Supabase
4. Verifique os logs do console

---

## ✅ **STATUS ATUAL**

### **Implementado:**
- ✅ Interface unificada
- ✅ Configuração por função
- ✅ Personalidades configuráveis
- ✅ Sistema de teste
- ✅ Monitoramento

### **Aguardando:**
- ⏳ Migração SQL (manual)
- ⏳ Upload de documentos
- ⏳ Base de conhecimento

**Próximo passo: Aplicar a migração SQL no Supabase! 🚀** 