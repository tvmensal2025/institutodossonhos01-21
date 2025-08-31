# 📧 Guia de Migração: Resend → SendPulse

## 🎯 **Objetivo**
Migrar completamente o sistema de envio de emails do Resend para o SendPulse.

## 📋 **Arquivos que precisam ser atualizados:**

### 1. **Funções Supabase (Edge Functions)**
- ✅ `supabase/functions/send-email/index.ts` - **JÁ ATUALIZADO**
- ⏳ `supabase/functions/generate-weight-report/index.ts`
- ⏳ `supabase/functions/goal-notifications/index.ts`
- ⏳ `supabase/functions/weekly-health-report/index.ts`
- ⏳ `supabase/functions/send-session-notifications/index.ts`

### 2. **Variáveis de Ambiente**
- ❌ `RESEND_API_KEY` → ✅ `SENDPULSE_API_KEY`
- ❌ `RESEND_API_SECRET` → ✅ `SENDPULSE_API_SECRET`

### 3. **Cliente SendPulse**
- ✅ `src/lib/sendpulse-client.ts` - **CRIADO**

## 🔧 **Configuração do SendPulse**

### **1. Criar conta no SendPulse**
1. Acesse: https://sendpulse.com
2. Crie uma conta gratuita
3. Verifique seu domínio de email
4. Obtenha as credenciais da API

### **2. Configurar variáveis de ambiente**

#### **Local (.env.local)**
```bash
# Remover
RESEND_API_KEY=your_resend_key

# Adicionar
SENDPULSE_API_KEY=your_sendpulse_api_key
SENDPULSE_API_SECRET=your_sendpulse_api_secret
```

#### **Supabase (Dashboard)**
1. Acesse: https://supabase.com/dashboard
2. Vá em: Settings → Environment Variables
3. Adicione:
   - `SENDPULSE_API_KEY` = sua_chave_api
   - `SENDPULSE_API_SECRET` = seu_secret_api
4. Remova: `RESEND_API_KEY`

### **3. Verificar domínio**
- Configure `noreply@institutodossonhos.com` no SendPulse
- Ou use um domínio verificado no SendPulse

## 📝 **Diferenças entre Resend e SendPulse**

### **Resend (Antigo)**
```typescript
import { Resend } from 'npm:resend@4.0.0';
const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

await resend.emails.send({
  from: "Dr. Vita <onboarding@resend.dev>",
  to: [email],
  subject: subject,
  html: htmlContent,
});
```

### **SendPulse (Novo)**
```typescript
import { sendPulseClient } from '../../../src/lib/sendpulse-client.ts';

await sendPulseClient.sendEmail({
  to: email,
  subject: subject,
  html: htmlContent,
  from: "noreply@institutodossonhos.com",
  from_name: "Dr. Vita"
});
```

## 🚀 **Próximos Passos**

### **1. Atualizar todas as funções Supabase**
```bash
# Exemplo para cada função
sed -i '' 's/import { Resend } from "npm:resend@4.0.0";/import { sendPulseClient } from "..\/..\/..\/src\/lib\/sendpulse-client.ts";/g' supabase/functions/*/index.ts
```

### **2. Testar conexão**
```typescript
// Teste de conexão
const isConnected = await sendPulseClient.testConnection();
console.log('SendPulse conectado:', isConnected);
```

### **3. Migrar templates**
- Os templates HTML existentes continuam funcionando
- Apenas o método de envio muda

## ✅ **Vantagens do SendPulse**

1. **📊 Analytics avançados**
   - Taxa de entrega
   - Taxa de abertura
   - Taxa de clique

2. **🌍 Melhor entrega global**
   - Servidores distribuídos
   - Menor risco de spam

3. **💰 Preços competitivos**
   - Plano gratuito generoso
   - Preços por email mais baixos

4. **🔧 API robusta**
   - Autenticação OAuth2
   - Rate limiting inteligente
   - Suporte a templates

## ⚠️ **Atenções Importantes**

1. **Domínio verificado**: Configure seu domínio no SendPulse
2. **Rate limits**: SendPulse tem limites diferentes do Resend
3. **Templates**: Mantenha os templates HTML existentes
4. **Testes**: Teste todos os tipos de email antes de migrar

## 🔄 **Rollback (se necessário)**

Se precisar voltar ao Resend:
1. Mantenha as variáveis antigas
2. Reverta os commits de migração
3. Teste novamente

## 📞 **Suporte SendPulse**

- **Documentação**: https://sendpulse.com/api
- **Suporte**: https://sendpulse.com/support
- **Status**: https://status.sendpulse.com

---

**Status da Migração**: 🟡 Em andamento
**Próximo**: Atualizar todas as funções Supabase restantes 