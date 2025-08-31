# 🔑 Configurar Nova Chave Google TTS (FINAL)

## ❌ **Problema**
Todas as chaves do Google AI expiraram e não funcionam para Text-to-Speech.

## ✅ **Solução Definitiva**

### **1. Acesse Google Cloud Console**
🔗 [https://console.cloud.google.com/](https://console.cloud.google.com/)

### **2. Crie Novo Projeto (ou use existente)**
- Clique em "Selecionar projeto" no topo
- Clique em "Novo projeto"
- **Nome**: `sofia-voice-chat`
- Clique em "Criar"

### **3. Ative a API Text-to-Speech**
- Menu lateral → "APIs e serviços" → "Biblioteca"
- Procure por **"Cloud Text-to-Speech API"**
- Clique na API → "Ativar"

### **4. Crie Nova Chave de API**
- Menu lateral → "APIs e serviços" → "Credenciais"
- Clique em **"Criar credenciais"** → **"Chave de API"**
- **IMPORTANTE**: Copie a chave gerada (começa com `AIza...`)

### **5. Configure no Projeto**
Execute este comando substituindo `SUA_CHAVE_AQUI` pela chave real:

```bash
# Remover chave antiga
sed -i '' '/VITE_GOOGLE_TTS_API_KEY/d' .env

# Adicionar nova chave
echo "VITE_GOOGLE_TTS_API_KEY=SUA_CHAVE_AQUI" >> .env
```

### **6. Teste a Configuração**
```bash
# Testar se funciona
node testar-google-tts.js

# Reiniciar servidor
npm run dev

# Acessar
http://localhost:8081/sofia-voice
```

## 🎉 **Resultado Esperado**
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

## 🚨 **IMPORTANTE**
- A chave deve começar com `AIza...`
- A API "Cloud Text-to-Speech" deve estar ativada
- O projeto deve ter créditos disponíveis

---

**🎤 Configure a nova chave e a Sofia terá voz natural!**
