# 🔑 Guia de Login no cPanel - Hostgator

## 🎯 **Acesso ao cPanel**

### **URLs de Acesso:**
```
🌐 https://institutodossonhos.com.br/cpanel
🌐 https://institutodossonhos.com.br:2083
🌐 https://www.institutodossonhos.com.br/cpanel
```

### **Credenciais:**
```
👤 Usuário: rafa2191
🔑 Senha: S^]WBM[v5_$]
```

---

## 📋 **Passo a Passo no cPanel**

### **1. Login:**
1. 🌐 Acesse: https://institutodossonhos.com.br/cpanel
2. 👤 Digite: **rafa2191**
3. 🔑 Digite: **S^]WBM[v5_$]**
4. ✅ Clique em "Log In"

### **2. Navegar até FTP:**
1. 📁 Procure a seção **"Arquivos"** (Files)
2. 🔗 Clique em **"Contas FTP"** (FTP Accounts)

### **3. Verificar Conta Existente:**
Você já tem uma conta FTP configurada:
```
👤 Usuário: rafaeldias2025@institutodossonhos.com.br
🌐 Servidor: ftp.institutodossonhos.com.br
📁 Porta: 21
📂 Diretório: /home2/rafa2...rafaeldias2025
```

---

## 🔧 **Configurações FTP para n8n**

### **Credenciais Atuais:**
```
🌐 Host: ftp.institutodossonhos.com.br
👤 Usuário: rafaeldias2025@institutodossonhos.com.br
🔑 Senha: S^]WBM[v5_$]
📁 Porta: 21
📂 Diretório: /public_html/
```

### **Teste de Conexão:**
```bash
node test-ftp-connection.js
```

---

## 📁 **Criar Nova Conta FTP (Opcional)**

### **Se quiser uma conta específica para relatórios:**
```
👤 Login: relatorio_semanal
📧 Email: relatorio@institutodossonhos.com.br
🔑 Senha: [senha_forte_12_caracteres]
📂 Diretório: /public_html/
```

### **Passos:**
1. 📁 Na seção "Contas FTP"
2. ➕ Clique em "Criar Conta FTP"
3. 📝 Preencha os dados acima
4. ✅ Clique em "Criar Conta"

---

## 🧪 **Testar Upload**

### **Após login no cPanel:**
1. 📁 Vá em "Gerenciador de Arquivos"
2. 📂 Navegue até `/public_html/`
3. 📤 Faça upload do arquivo `relatorio-hostgator.html`
4. 🌐 Teste: https://institutodossonhos.com.br/relatorio-hostgator.html

---

## 🔒 **Verificar Permissões**

### **Permissões Corretas:**
```
📁 public_html/ → 755
📄 *.html → 644
📄 *.css → 644
📄 *.js → 644
```

### **Como Verificar:**
1. 📁 Gerenciador de Arquivos
2. 📄 Clique com botão direito no arquivo
3. 🔧 Clique em "Permissões"
4. ✅ Configure conforme acima

---

## 📊 **Próximos Passos**

### **Após confirmar FTP:**
1. 🧪 **Testar conexão** com script
2. 🤖 **Instalar n8n**
3. 📊 **Configurar workflow**
4. 📱 **Integrar WhatsApp**
5. 📅 **Agendar execução**

---

## ✅ **Checklist cPanel**

- [ ] ✅ Login no cPanel funcionando
- [ ] ✅ Seção "Contas FTP" acessível
- [ ] ✅ Conta FTP existente verificada
- [ ] ✅ Credenciais anotadas
- [ ] ✅ Teste de upload realizado
- [ ] ✅ Permissões configuradas

**🎉 cPanel configurado! Próximo passo: n8n**













