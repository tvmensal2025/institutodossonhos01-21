# 🎤 Configuração Google Text-to-Speech (Voz Natural)

## 🎯 **Por que Google TTS?**

- ✅ **Voz muito mais natural** que Web Speech API
- ✅ **1 milhão de caracteres/mês** gratuitos
- ✅ **Vozes neurais** em português brasileiro
- ✅ **Muito barato** após limite gratuito

## 🚀 **Passo a Passo para Configurar:**

### 1. **Criar Conta Google Cloud**
1. Acesse [Google Cloud Console](https://console.cloud.google.com/)
2. Faça login com sua conta Google
3. Aceite os termos de serviço

### 2. **Criar Projeto**
1. Clique em "Selecionar projeto" no topo
2. Clique em "Novo projeto"
3. Nome: `sofia-voice-chat`
4. Clique em "Criar"

### 3. **Ativar API Text-to-Speech**
1. No menu lateral, vá em "APIs e serviços" → "Biblioteca"
2. Procure por "Cloud Text-to-Speech API"
3. Clique na API e depois em "Ativar"

### 4. **Criar Chave de API**
1. No menu lateral, vá em "APIs e serviços" → "Credenciais"
2. Clique em "Criar credenciais" → "Chave de API"
3. Copie a chave gerada

### 5. **Configurar no Projeto**
1. Crie arquivo `.env` na raiz do projeto:
```env
VITE_GOOGLE_TTS_API_KEY=sua_chave_aqui
```

2. Reinicie o servidor:
```bash
npm run dev
```

## 🎉 **Resultado:**

- **Voz natural** da Sofia
- **1 milhão de caracteres/mês** gratuitos
- **Fallback automático** para Web Speech API se falhar

## 💰 **Custos:**

- **Gratuito**: 1 milhão de caracteres/mês
- **Pago**: $4.00 por 1 milhão adicional
- **Estimativa**: ~2.200-3.300 conversas gratuitas/mês

## 🔧 **Vozes Disponíveis:**

- `pt-BR-Neural2-A` (Feminina - Padrão)
- `pt-BR-Neural2-B` (Masculina)
- `pt-BR-Neural2-C` (Feminina 2)
- `pt-BR-Neural2-D` (Masculina 2)

## 🐛 **Solução de Problemas:**

### Erro: "API não ativada"
- Verifique se a API está ativada no console

### Erro: "Chave inválida"
- Verifique se a chave está correta no .env

### Erro: "Quota excedida"
- Aguarde o próximo mês ou adicione pagamento

---

**🎤 Agora a Sofia terá voz natural!**
