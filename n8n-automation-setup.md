# 🤖 Automação n8n - Relatório Semanal WhatsApp

## 🎯 Objetivo
Automatizar geração de HTML semanal e envio via WhatsApp usando n8n

## 📋 Informações Necessárias

### **1. Credenciais FTP Hostgator:**
```
🌐 Servidor FTP: ftp.institutodossonhos.com.br
👤 Usuário FTP: [seu_usuario_ftp]
🔑 Senha FTP: [sua_senha_ftp]
📁 Porta: 21
📂 Pasta: public_html/
```

### **2. Configuração WhatsApp:**
```
📱 Número WhatsApp: [numero_destino]
💬 Mensagem: Relatório semanal disponível
🔗 Link: https://institutodossonhos.com.br/relatorio.html
```

## 🚀 Workflow n8n

### **Estrutura do Workflow:**
```
1. 📅 Cron (Agendamento Semanal)
   ↓
2. 🌐 HTTP Request (Gerar HTML)
   ↓
3. 📤 FTP Upload (Salvar arquivo)
   ↓
4. 📱 WhatsApp Send (Enviar mensagem)
```

### **1. Cron Trigger (Agendamento)**
```json
{
  "rule": "0 9 * * 5", // Toda sexta às 9h
  "timezone": "America/Sao_Paulo"
}
```

### **2. HTTP Request (Gerar HTML)**
```json
{
  "method": "POST",
  "url": "https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/weekly-health-report",
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI"
  },
  "body": {
    "testMode": true,
    "testEmail": "tvmensal2025@gmail.com",
    "testUserName": "Sirlene Correa",
    "returnHTML": true
  }
}
```

### **3. FTP Upload**
```json
{
  "host": "ftp.institutodossonhos.com.br",
  "username": "[SEU_USUARIO_FTP]",
  "password": "[SUA_SENHA_FTP]",
  "port": 21,
  "remotePath": "/public_html/relatorio-semanal.html",
  "localPath": "{{ $json.html }}"
}
```

### **4. WhatsApp Send**
```json
{
  "to": "[NUMERO_WHATSAPP]",
  "message": "🏥 Dr. Vita - Relatório Semanal\n\n📊 Seu relatório de saúde está disponível:\n🌐 https://institutodossonhos.com.br/relatorio-semanal.html\n\n📈 Acompanhe sua evolução semanal!"
}
```

## 🔧 Configuração n8n

### **Passo 1: Instalar n8n**
```bash
npm install -g n8n
n8n start
```

### **Passo 2: Criar Workflow**
1. Acesse: http://localhost:5678
2. Crie novo workflow
3. Adicione os nós conforme estrutura acima

### **Passo 3: Configurar Variáveis**
```json
{
  "FTP_HOST": "ftp.institutodossonhos.com.br",
  "FTP_USER": "[seu_usuario]",
  "FTP_PASS": "[sua_senha]",
  "WHATSAPP_NUMBER": "[numero_destino]",
  "SUPABASE_URL": "https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/weekly-health-report"
}
```

## 📱 Integração WhatsApp

### **Opção A: WhatsApp Business API**
- Requer aprovação do Facebook
- Mais profissional
- Custo mensal

### **Opção B: WhatsApp Web (n8n-community)**
- Gratuito
- Usa WhatsApp Web
- Mais simples de configurar

### **Opção C: Twilio WhatsApp**
- API oficial
- Custo por mensagem
- Muito confiável

## 🔒 Segurança

### **Variáveis de Ambiente:**
```bash
export FTP_USERNAME="seu_usuario"
export FTP_PASSWORD="sua_senha"
export WHATSAPP_TOKEN="seu_token"
```

### **Criptografia:**
- ✅ Senhas criptografadas
- ✅ Tokens seguros
- ✅ HTTPS para todas as conexões

## 📅 Agendamento

### **Frequências Disponíveis:**
- 📅 **Semanal**: Toda sexta às 9h
- 📅 **Quinzenal**: 1º e 15º de cada mês
- 📅 **Mensal**: Primeiro dia do mês
- 📅 **Personalizado**: Qualquer cron expression

### **Exemplo Cron:**
```bash
# Toda sexta às 9h
0 9 * * 5

# Toda segunda às 8h
0 8 * * 1

# 1º e 15º de cada mês às 10h
0 10 1,15 * *
```

## 🛠️ Troubleshooting

### **Erro FTP:**
- Verificar credenciais
- Confirmar porta (21)
- Testar conexão manual

### **Erro WhatsApp:**
- Verificar número no formato internacional
- Confirmar token de acesso
- Testar envio manual

### **Erro HTML:**
- Verificar Edge Function
- Confirmar CORS
- Testar requisição manual

## 📊 Monitoramento

### **Logs n8n:**
- ✅ Sucesso: HTML gerado e enviado
- ❌ Erro: Detalhes do problema
- 📈 Estatísticas de envio

### **Notificações:**
- 📧 Email em caso de erro
- 📱 WhatsApp para administrador
- 🔔 Slack/Discord (opcional)

## 🎉 Resultado Final

Após configuração, você terá:
- 🤖 **Automação completa** semanal
- 📊 **HTML gerado** automaticamente
- 📤 **Upload FTP** automático
- 📱 **Envio WhatsApp** automático
- 📅 **Agendamento** configurável
- 🔒 **Segurança** implementada

**Frequência:** Toda sexta às 9h
**Destino:** WhatsApp configurado
**Arquivo:** https://institutodossonhos.com.br/relatorio-semanal.html













