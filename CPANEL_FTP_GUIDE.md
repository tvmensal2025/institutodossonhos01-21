# 📋 Guia Visual - Configurar FTP no cPanel

## 🎯 **Passo 1: Acessar cPanel**

### **1.1 Login:**
```
🌐 URL: https://institutodossonhos.com.br/cpanel
👤 Usuário: [seu_usuario_cpanel]
🔑 Senha: [sua_senha_cpanel]
```

### **1.2 Navegação:**
1. **Procure a seção "Arquivos"** (Files)
2. **Clique em "Contas FTP"** (FTP Accounts)

---

## 📁 **Passo 2: Criar Nova Conta FTP**

### **2.1 Preencher Formulário:**
```
👤 Login: relatorio_semanal
📧 Email: relatorio@institutodossonhos.com.br
🔑 Senha: [crie_senha_forte_123!]
📂 Diretório: /public_html/
```

### **2.2 Configurações Avançadas:**
- ✅ **Permissões**: Leitura e Escrita
- ✅ **Quota**: Sem limite
- ✅ **Acesso**: Apenas diretório especificado

---

## 🔧 **Passo 3: Verificar Configuração**

### **3.1 Lista de Contas FTP:**
Após criar, você verá:
```
📋 Conta: relatorio_semanal
🌐 Servidor: ftp.institutodossonhos.com.br
📁 Diretório: /public_html/
🔐 Status: Ativo
```

### **3.2 Informações de Conexão:**
```
🔗 Host: ftp.institutodossonhos.com.br
👤 Usuário: relatorio_semanal
🔑 Senha: [sua_senha]
📁 Porta: 21
```

---

## 🧪 **Passo 4: Testar Conexão**

### **4.1 Instalar Dependência:**
```bash
npm install basic-ftp
```

### **4.2 Executar Teste:**
```bash
node test-ftp-connection.js
```

### **4.3 Resultado Esperado:**
```
🧪 Testando conexão FTP...
🔗 Conectando ao servidor FTP...
✅ Conexão FTP estabelecida com sucesso!
📁 Listando arquivos em /public_html/:
  📄 index.html (1234 bytes)
  📄 relatorio.html (5678 bytes)
📤 Testando upload...
✅ Upload de teste realizado com sucesso!
🗑️ Arquivo de teste removido
```

---

## 🔒 **Passo 5: Configurar Segurança**

### **5.1 Senha Forte:**
```
✅ Mínimo 12 caracteres
✅ Letras maiúsculas e minúsculas
✅ Números
✅ Caracteres especiais
```

### **5.2 Permissões:**
```
📁 public_html/ → 755
📄 *.html → 644
📄 *.css → 644
📄 *.js → 644
```

---

## 📊 **Passo 6: Configurar n8n**

### **6.1 Variáveis de Ambiente:**
```bash
FTP_HOST=ftp.institutodossonhos.com.br
FTP_USERNAME=relatorio_semanal
FTP_PASSWORD=sua_senha_forte
FTP_PORT=21
FTP_PATH=/public_html/
```

### **6.2 Testar no n8n:**
1. Acesse: http://localhost:5678
2. Crie novo workflow
3. Adicione nó FTP
4. Configure com suas credenciais
5. Teste upload

---

## 🛠️ **Troubleshooting**

### **Erro: "Login failed"**
- ✅ Verificar usuário e senha
- ✅ Confirmar se conta está ativa
- ✅ Verificar se não há bloqueio

### **Erro: "Connection refused"**
- ✅ Verificar se porta 21 está aberta
- ✅ Confirmar servidor FTP correto
- ✅ Testar com cliente FTP diferente

### **Erro: "Permission denied"**
- ✅ Verificar permissões da conta
- ✅ Confirmar diretório correto
- ✅ Verificar quota disponível

---

## 📱 **Próximos Passos**

### **Após FTP configurado:**
1. 🔧 **Configurar n8n** com credenciais FTP
2. 📊 **Testar workflow** de geração de HTML
3. 📤 **Configurar upload** automático
4. 📱 **Integrar WhatsApp** para envio
5. 📅 **Agendar execução** semanal

### **URLs de Teste:**
```
🌐 Relatório: https://institutodossonhos.com.br/relatorio-semanal.html
📊 Admin: https://institutodossonhos.com.br/relatorio.html
🧪 Teste: https://institutodossonhos.com.br/teste-ftp.html
```

---

## ✅ **Checklist de Configuração**

- [ ] ✅ Conta FTP criada no cPanel
- [ ] ✅ Senha forte configurada
- [ ] ✅ Permissões corretas
- [ ] ✅ Conexão FTP testada
- [ ] ✅ Upload de teste funcionando
- [ ] ✅ Credenciais anotadas
- [ ] ✅ n8n configurado
- [ ] ✅ Workflow testado

**🎉 FTP configurado com sucesso!**













