# 🎤 Configurar Google TTS para a Sofia

## ✅ **Ajustes Realizados**

### 1. **Pré-processamento de Texto Melhorado**
- ✅ Remoção completa de emojis
- ✅ Limpeza de caracteres especiais
- ✅ Normalização de espaços
- ✅ Arquivo: `src/utils/ttsPreprocessor.ts`

### 2. **API Direta do Google TTS**
- ✅ Removida dependência da edge function
- ✅ Chamada direta para API do Google
- ✅ Configuração otimizada para voz da Sofia
- ✅ Arquivo: `src/hooks/useConversation.ts`

### 3. **Configuração da Voz da Sofia**
- ✅ Voz: `pt-BR-Neural2-C` (Feminina 2)
- ✅ Velocidade: 0.85 (mais lenta para clareza)
- ✅ Pitch: 1.3 (mais feminino)
- ✅ Volume: 1.2 (mais alto)
- ✅ Otimizado para fones de ouvido

## 🚀 **Próximos Passos**

### 1. **Criar Arquivo .env**
Crie um arquivo `.env` na raiz do projeto com:

```env
# Google Cloud Text-to-Speech API Key
VITE_GOOGLE_TTS_API_KEY=sua_chave_aqui
```

### 2. **Obter API Key do Google Cloud**
1. Acesse: https://console.cloud.google.com/
2. Crie um projeto ou selecione um existente
3. Ative a API "Cloud Text-to-Speech"
4. Crie uma chave de API
5. Substitua "sua_chave_aqui" pela chave real

### 3. **Testar**
```bash
# Reiniciar servidor
npm run dev

# Acessar
http://localhost:8081/sofia-voice
```

## 💰 **Custos**
- **Gratuito**: 1 milhão de caracteres/mês
- **Pago**: $4.00 por 1 milhão adicional

## 🎤 **Vozes Disponíveis**
- `pt-BR-Neural2-A` (Feminina - Padrão)
- `pt-BR-Neural2-B` (Masculina)
- `pt-BR-Neural2-C` (Feminina 2) - **Configurada para Sofia**
- `pt-BR-Neural2-D` (Masculina 2)

## 🔧 **Fallback Automático**
Se a API key não estiver configurada ou falhar, o sistema automaticamente usa a Web Speech API (gratuita).

---

**🎤 Configure a API key e a Sofia terá voz natural!**


