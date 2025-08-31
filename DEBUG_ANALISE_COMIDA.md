# 🔍 Debug da Análise de Comida por Imagem

## 🚨 PROBLEMA IDENTIFICADO
A análise de comida por imagem não está funcionando. Vamos debugar passo a passo.

## 📋 Passos para Debug:

### 1. **Verificar Logs do Frontend:**
1. Abra o navegador
2. Pressione F12 → Console
3. Envie uma foto de comida
4. Procure por logs com emojis:
   - 👤 Usuário atual
   - 📸 Iniciando upload da imagem
   - 📸 URL da imagem
   - 📤 Enviando mensagem para o chatbot
   - 📥 Resposta da função
   - ✅ Resposta recebida
   - ❌ Erro da Edge Function

### 2. **Verificar Logs da Função:**
1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/functions
2. Clique em "health-chat-bot"
3. Veja os logs em tempo real
4. Procure por logs com emojis:
   - 📸 Recebida imagem
   - 🔍 Analisando imagem para detectar comida
   - 🤖 Chamando Google AI para análise
   - 📊 Resposta do Google AI
   - 📝 Texto extraído
   - ✅ Análise de comida
   - ❌ Erro na análise da imagem
   - 🔍 Verificando se detectou comida
   - ✅ Comida detectada! Gerando análise nutricional
   - ❌ Comida não detectada ou confiança baixa

### 3. **Possíveis Problemas:**

#### **A) Imagem não está sendo enviada:**
- Verificar se o bucket `chat-images` existe
- Verificar se o upload está funcionando
- Verificar se a URL está sendo gerada

#### **B) Google AI não está respondendo:**
- Verificar se a API key está configurada
- Verificar se a URL da imagem é acessível
- Verificar se o prompt está correto

#### **C) Análise não está sendo detectada:**
- Verificar se `is_food` está sendo retornado como `true`
- Verificar se `confidence` está acima de 0.7
- Verificar se o JSON está sendo parseado corretamente

#### **D) Resposta não está sendo exibida:**
- Verificar se a resposta está sendo formatada corretamente
- Verificar se o frontend está recebendo a resposta
- Verificar se a mensagem está sendo adicionada ao chat

## 🛠️ Comandos para Testar:

### **Teste Local da Função:**
```bash
curl -X POST http://127.0.0.1:54321/functions/v1/health-chat-bot \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_ANON_KEY" \
  -d '{
    "message": "teste",
    "userId": "test",
    "imageUrl": "https://example.com/test.jpg"
  }'
```

### **Verificar Bucket:**
```bash
npx supabase storage ls
```

### **Verificar Funções:**
```bash
npx supabase functions list
```

## 📊 Status Atual:

- ✅ **Função Deployada**: health-chat-bot
- ✅ **Logs Adicionados**: Frontend e Backend
- ✅ **Interface Simplificada**: Usa apenas uma função
- ❓ **Análise Automática**: Precisa ser testada
- ❓ **Resposta Personalizada**: Precisa ser testada

## 🎯 Próximos Passos:

1. **Teste agora**: Envie uma foto de comida
2. **Verifique logs**: Console do navegador e função
3. **Reporte resultados**: O que aparece nos logs
4. **Ajuste se necessário**: Baseado nos logs

## 🔧 Arquivos Modificados:

- ✅ `src/components/HealthChatBot.tsx` - Logs de debug adicionados
- ✅ `supabase/functions/health-chat-bot/index.ts` - Logs de debug adicionados
- ✅ Função deployada com logs

---

**🔍 AGORA TESTE E VERIFIQUE OS LOGS!** Isso nos ajudará a identificar exatamente onde está o problema. 