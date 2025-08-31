# 🔍 VERIFICAÇÃO DE CONFIGURAÇÃO DA SOFIA

## ❌ PROBLEMA ATUAL
A função `sofia-image-analysis` está retornando erro 500, mesmo com as chaves configuradas.

## 📋 CHECKLIST DE VERIFICAÇÃO

### 1. **Verificar Logs da Função**
```
https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/functions/sofia-image-analysis/logs
```
- Acesse o link acima
- Procure por erros recentes
- Veja se aparece alguma mensagem sobre API keys

### 2. **Verificar Variáveis de Ambiente**
```
https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/settings/functions
```

Confirme que estas variáveis estão configuradas:

#### **GOOGLE_AI_API_KEY**
```
AIzaSyCOdeLu7T_uhCcXlTzZgat5wbo8Y-0DbNc
```

#### **OPENAI_API_KEY**
```
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
```

### 3. **Verificar se as Variáveis Estão Aplicadas à Função**
- Na página de funções, clique em `sofia-image-analysis`
- Vá em "Settings" ou "Configuration"
- Verifique se as variáveis de ambiente estão listadas lá

### 4. **Possíveis Problemas**

#### A) **Variáveis não propagadas**
- Após adicionar as variáveis, pode levar alguns minutos
- Tente fazer um "Redeploy" da função

#### B) **API Key inválida**
- A chave da OpenAI pode ter expirado ou estar incorreta
- Verifique se a chave começa com `sk-proj-`

#### C) **Limite de API**
- As APIs podem ter limite de uso
- Verifique o status das APIs nos dashboards:
  - OpenAI: https://platform.openai.com/usage
  - Google AI: https://makersuite.google.com/app/apikey

## 🛠️ SOLUÇÃO ALTERNATIVA

Se as variáveis não estiverem funcionando, podemos tentar:

1. **Redeploy da função**
```bash
npx supabase functions deploy sofia-image-analysis
```

2. **Verificar se a função está usando as variáveis**
- No código da função, as variáveis são acessadas assim:
  ```typescript
  const GOOGLE_AI_API_KEY = Deno.env.get('GOOGLE_AI_API_KEY');
  const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
  ```

## 📊 TESTE RÁPIDO

Após verificar tudo acima, teste novamente:

```bash
node testar-sofia-uuid.js
```

## 💡 DICA IMPORTANTE

Se você vir nos logs algo como:
- "Missing GOOGLE_AI_API_KEY"
- "Missing OPENAI_API_KEY"
- "Invalid API key"

Isso confirma que o problema é na configuração das variáveis.

**Me avise o que você encontrou nos logs para eu poder ajudar melhor!**