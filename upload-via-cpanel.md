# 📤 Upload via cPanel File Manager

## 🎯 **Alternativa ao FTP**

Como o FTP está com timeout, vamos usar o **File Manager** do cPanel para fazer upload direto.

## 📋 **Passo a Passo**

### **1. Acessar File Manager:**
```
🌐 cPanel: https://institutodossonhos.com.br/cpanel
👤 Login: rafa2191
🔑 Senha: S^]WBM[v5_$]
📁 Vá em "Arquivos" → "Gerenciador de Arquivos"
```

### **2. Navegar até public_html:**
```
📂 Clique em "public_html"
📂 Este é o diretório raiz do seu site
📂 Aqui ficam todos os arquivos públicos
```

### **3. Upload do Arquivo:**
```
📤 Clique em "Upload" (botão azul)
📁 Selecione: relatorio-hostgator.html
✅ Clique em "Upload Files"
```

### **4. Verificar Upload:**
```
🌐 Teste: https://institutodossonhos.com.br/relatorio-hostgator.html
📄 Deve aparecer a página do relatório
```

## 🔧 **Configurar n8n sem FTP**

### **Opção 1: Usar HTTP Request**
```javascript
// Em vez de FTP, usar HTTP POST para gerar HTML
const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/weekly-health-report', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer [TOKEN]'
  },
  body: JSON.stringify({
    testMode: true,
    returnHTML: true
  })
});

const htmlContent = await response.text();
// Salvar HTML localmente ou enviar por email
```

### **Opção 2: Email com HTML**
```javascript
// Enviar HTML por email em vez de FTP
const emailContent = `
🏥 Dr. Vita - Relatório Semanal

📊 Seu relatório está disponível em:
🌐 https://institutodossonhos.com.br/relatorio-semanal.html

📈 Acompanhe sua evolução semanal!
`;
```

## 📱 **Workflow n8n Atualizado**

### **Estrutura Simplificada:**
```
1. 📅 Cron (Agendamento Semanal)
   ↓
2. 🌐 HTTP Request (Gerar HTML)
   ↓
3. 📧 Email Send (Enviar relatório)
   ↓
4. 📱 WhatsApp Send (Notificar)
```

### **Vantagens:**
- ✅ Não precisa de FTP
- ✅ Mais simples de configurar
- ✅ Menos pontos de falha
- ✅ Funciona mesmo com firewall

## 🧪 **Teste Manual**

### **1. Upload Manual:**
```
📁 cPanel → File Manager → public_html
📤 Upload: relatorio-hostgator.html
🌐 Teste: https://institutodossonhos.com.br/relatorio-hostgator.html
```

### **2. Gerar HTML Manual:**
```bash
node test-html-generation.js
```

### **3. Verificar Resultado:**
```
✅ Página carrega corretamente
✅ Relatório aparece
✅ Design responsivo funciona
```

## 🎯 **Próximos Passos**

### **Após upload manual:**
1. ✅ **Confirmar** que página funciona
2. 🤖 **Instalar n8n**
3. 📊 **Configurar workflow** simplificado
4. 📱 **Integrar WhatsApp**
5. 📅 **Agendar execução**

## ✅ **Checklist Upload**

- [ ] ✅ File Manager acessível
- [ ] ✅ public_html navegável
- [ ] ✅ Upload realizado
- [ ] ✅ Página testada
- [ ] ✅ HTML gerado
- [ ] ✅ n8n configurado

**🎉 Upload via cPanel funcionando! Próximo: n8n**













