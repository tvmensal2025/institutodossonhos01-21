# 🔧 Verificar e Configurar Variáveis de Ambiente do Google Fit

## **Problema Identificado:**
❌ **Edge Functions falhando** - 4/5 testes passaram, mas Edge Functions falharam

## **Solução em 3 Passos:**

### **1️⃣ Executar Script SQL de Correção**
```sql
-- Execute este arquivo no Supabase SQL Editor
fix-google-fit-edge-functions.sql
```

### **2️⃣ Verificar Variáveis de Ambiente no Supabase**

Acesse: **Supabase Dashboard → Settings → Edge Functions**

**Variáveis OBRIGATÓRIAS:**
```bash
GOOGLE_FIT_CLIENT_ID=705908448787-so9cco4hkduhmr0lq4ftkng10hjcj1is.apps.googleusercontent.com
GOOGLE_FIT_CLIENT_SECRET=[SEU_CLIENT_SECRET_AQUI]
SUPABASE_URL=[SUA_URL_DO_SUPABASE]
SUPABASE_SERVICE_ROLE_KEY=[SUA_SERVICE_ROLE_KEY]
```

### **3️⃣ Deploy das Edge Functions**

```bash
# No terminal, na pasta do projeto
cd supabase/functions

# Deploy de todas as funções do Google Fit
supabase functions deploy google-fit-token
supabase functions deploy google-fit-callback
supabase functions deploy google-fit-sync
supabase functions deploy test-google-fit-config
```

## **Teste de Verificação:**

### **A) Testar Configuração:**
```bash
curl -X POST "https://[SEU_PROJECT].supabase.co/functions/v1/test-google-fit-config"
```

### **B) Testar Token:**
```bash
curl -X POST "https://[SEU_PROJECT].supabase.co/functions/v1/google-fit-token" \
  -H "Content-Type: application/json" \
  -d '{"action": "connect"}'
```

## **Resultado Esperado:**
✅ **Edge Functions** - Funcionando
✅ **OAuth** - Funcionando  
✅ **Sincronização** - Funcionando
✅ **Dados nos Gráficos** - Funcionando

## **Se Ainda Falhar:**

### **Verificar Logs:**
```bash
supabase functions logs google-fit-token
supabase functions logs google-fit-callback
supabase functions logs google-fit-sync
```

### **Verificar Permissões:**
- Google Cloud Console → APIs habilitadas
- Google Fit API ativada
- OAuth consent screen configurado

## **Status Atual:**
- ✅ Supabase: Funcionando
- ✅ Autenticação: Funcionando
- ✅ Tabelas: Funcionando
- ✅ OAuth: Funcionando
- ❌ **Edge Functions: FALHANDO** ← **PROBLEMA AQUI**

## **Próximo Passo:**
Execute o script SQL e verifique as variáveis de ambiente!
