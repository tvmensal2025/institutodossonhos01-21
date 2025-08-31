# 🚀 Configurar Google TTS em 5 minutos

## ❌ **Problema Atual**
A chave do Google AI expirou e não funciona para Text-to-Speech.

## ✅ **Solução Rápida**

### **1. Acesse Google Cloud Console**
🔗 [https://console.cloud.google.com/](https://console.cloud.google.com/)

### **2. Crie/Selecione Projeto**
- Clique em "Selecionar projeto" no topo
- Selecione o projeto existente ou crie um novo
- **Nome sugerido**: `sofia-voice-chat`

### **3. Ative a API Text-to-Speech**
- Menu lateral → "APIs e serviços" → "Biblioteca"
- Procure por **"Cloud Text-to-Speech API"**
- Clique na API → "Ativar"

### **4. Crie Nova Chave de API**
- Menu lateral → "APIs e serviços" → "Credenciais"
- Clique em **"Criar credenciais"** → **"Chave de API"**
- Copie a chave gerada

### **5. Configure no Projeto**
Crie/edite o arquivo `.env` na raiz do projeto:

```env
# Google Cloud Text-to-Speech API Key
VITE_GOOGLE_TTS_API_KEY=sua_nova_chave_aqui
```

### **6. Teste**
```bash
# Reinicie o servidor
npm run dev

# Acesse
http://localhost:8081/sofia-voice
```

## 🎉 **Resultado**
- ✅ Voz natural da Sofia
- ✅ 1 milhão de caracteres/mês gratuitos
- ✅ Voz feminina brasileira neural

## 💰 **Custos**
- **Gratuito**: 1 milhão de caracteres/mês
- **Pago**: $4.00 por 1 milhão adicional

## 🔧 **Vozes Disponíveis**
- `pt-BR-Neural2-A` (Feminina - Padrão)
- `pt-BR-Neural2-B` (Masculina)
- `pt-BR-Neural2-C` (Feminina 2)
- `pt-BR-Neural2-D` (Masculina 2)

---

**🎤 Configure agora e a Sofia terá voz natural!**
