# 🤖 Instalar n8n - Automação Completa

## 🎯 **Objetivo**
Automatizar geração de relatório semanal e envio via WhatsApp

## 📊 **Workflow Automático**
```
📅 Cron (Sexta 9h)
   ↓
🌐 HTTP Request (Gerar HTML)
   ↓
📤 FTP Upload (Salvar no site)
   ↓
📱 WhatsApp (Enviar link)
```

---

## 🚀 **Passo 1: Instalar n8n**

### **1.1 Instalar Node.js (se não tiver):**
```bash
# macOS (via Homebrew)
brew install node

# Ou baixar de: https://nodejs.org/
```

### **1.2 Instalar n8n:**
```bash
npm install -g n8n
```

### **1.3 Iniciar n8n:**
```bash
n8n start
```

### **1.4 Acessar Interface:**
```
🌐 http://localhost:5678
```

---

## 🔧 **Passo 2: Configurar Variáveis**

### **2.1 Criar arquivo .env:**
```bash
# Criar arquivo .env no diretório do n8n
cat > .env << EOF
# Configurações WhatsApp
WHATSAPP_NUMBER=+5511999999999
WHATSAPP_TOKEN=seu_token_whatsapp

# Configurações Email (para notificações)
ADMIN_EMAIL=admin@institutodossonhos.com.br
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

# Configurações n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=senha_admin
N8N_ENCRYPTION_KEY=sua_chave_n8n
EOF
```

### **2.2 Configurar WhatsApp:**
```
📱 Número: +5511999999999 (substitua pelo número real)
🔑 Token: [obter do WhatsApp Business API]
```

---

## 📊 **Passo 3: Importar Workflow**

### **3.1 Acessar n8n:**
```
🌐 http://localhost:5678
👤 Login: admin
🔑 Senha: senha_admin
```

### **3.2 Importar Workflow:**
1. Clique em **"Import from file"**
2. Selecione: `n8n-workflow-automatic.json`
3. Clique em **"Import"**

### **3.3 Configurar Nós:**

**🌐 HTTP Request (Gerar HTML):**
- ✅ Já configurado
- ✅ Conecta com Supabase
- ✅ Gera HTML automaticamente

**📤 FTP Upload:**
- ✅ Host: ftp.institutodossonhos.com.br
- ✅ Usuário: rafaeldias2025@institutodossonhos.com.br
- ✅ Senha: S^]WBM[v5_$]
- ✅ Porta: 21

**📱 WhatsApp:**
- ✅ Número: {{ $env.WHATSAPP_NUMBER }}
- ✅ Mensagem: Link do relatório

---

## 🧪 **Passo 4: Testar Workflow**

### **4.1 Teste Manual:**
1. No n8n, clique no workflow
2. Clique em **"Execute Workflow"**
3. Verifique se todos os nós funcionam

### **4.2 Verificar Resultado:**
```
✅ HTML gerado
✅ Upload FTP realizado
✅ WhatsApp enviado
✅ Link: https://institutodossonhos.com.br/relatorio-semanal.html
```

---

## 📅 **Passo 5: Agendar Execução**

### **5.1 Configurar Cron:**
```
📅 Expressão: 0 9 * * 5
⏰ Significado: Toda sexta às 9h
🌍 Timezone: America/Sao_Paulo
```

### **5.2 Ativar Workflow:**
1. No n8n, clique no workflow
2. Clique em **"Activate"**
3. Workflow executará automaticamente

---

## 📱 **Configurar WhatsApp**

### **Opção A: WhatsApp Business API**
```
1. 🌐 Acesse: https://business.whatsapp.com/
2. 📱 Configure sua conta
3. 🔑 Obtenha o token de acesso
4. 📝 Configure no n8n
```

### **Opção B: WhatsApp Web (n8n-community)**
```
1. 📦 Instale: n8n-community
2. 📱 Configure WhatsApp Web
3. 🔗 Conecte com n8n
```

### **Opção C: Twilio WhatsApp**
```
1. 🌐 Acesse: https://www.twilio.com/
2. 📱 Configure WhatsApp
3. 🔑 Obtenha credenciais
4. 📝 Configure no n8n
```

---

## 🔒 **Segurança**

### **Variáveis de Ambiente:**
```bash
# Nunca commitar senhas no Git
echo ".env" >> .gitignore
echo "node_modules/" >> .gitignore
```

### **Firewall:**
```bash
# Permitir porta 5678 (n8n)
sudo ufw allow 5678
```

---

## 🛠️ **Troubleshooting**

### **Erro FTP:**
```
❌ Timeout: Aumentar timeout no n8n
❌ Login failed: Verificar credenciais
❌ Permission denied: Verificar permissões
```

### **Erro WhatsApp:**
```
❌ Token inválido: Verificar token
❌ Número inválido: Formato +5511999999999
❌ Rate limit: Aguardar e tentar novamente
```

### **Erro n8n:**
```
❌ Porta ocupada: Mudar porta no .env
❌ Permissão negada: sudo n8n start
❌ Node.js: Atualizar versão
```

---

## 📊 **Monitoramento**

### **Logs n8n:**
```bash
# Ver logs em tempo real
n8n start --verbose

# Ou verificar logs
tail -f ~/.n8n/logs/n8n.log
```

### **Notificações:**
```
✅ Sucesso: WhatsApp enviado
❌ Erro: Email para admin
📊 Estatísticas: Dashboard n8n
```

---

## 🎉 **Resultado Final**

### **Após configuração:**
- 🤖 **Automação completa** semanal
- 📊 **HTML gerado** automaticamente
- 📤 **Upload FTP** automático
- 📱 **WhatsApp enviado** automaticamente
- 📅 **Agendamento** configurado

### **Frequência:**
```
📅 Toda sexta às 9h
📱 WhatsApp com link
🌐 https://institutodossonhos.com.br/relatorio-semanal.html
```

**🚀 Tudo automatizado!**













