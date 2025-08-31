# 🚨 CONFIGURAÇÃO URGENTE GOOGLE CLOUD

## ❌ **Erro Atual:** 
`Erro 401: invalid_client` - O OAuth client não foi encontrado

## ✅ **Solução Rápida:**

### **1. Acesse o Google Cloud Console**
📍 **URL:** https://console.cloud.google.com/

### **2. Crie/Configure OAuth 2.0**

#### **Passo 2.1: Vá para Credenciais**
- Navegue para: **APIs & Serviços** → **Credenciais**
- Clique em: **+ CRIAR CREDENCIAIS** → **ID do cliente OAuth 2.0**

#### **Passo 2.2: Configure a Aplicação Web**
- **Tipo de aplicação:** `Aplicação Web`
- **Nome:** `Instituto dos Sonhos - Google Fit`

#### **Passo 2.3: Adicione as URLs (IMPORTANTE!)**

**Origens JavaScript autorizadas:**
```
http://localhost:3000
http://localhost:8080  
https://institutodossonhos.com.br
https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com
```

**URIs de redirecionamento autorizados:**
```
http://localhost:3000/google-fit-callback
http://localhost:8080/google-fit-callback
https://institutodossonhos.com.br/google-fit-callback  
https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback
```

### **3. Ativar APIs Necessárias**

Vá para: **APIs & Serviços** → **Biblioteca**

Ative estas APIs:
- ✅ **Fitness API**
- ✅ **People API** (opcional)

### **4. Copie as Credenciais**

Após criar, você receberá:
- **Client ID:** `705908448787-...apps.googleusercontent.com`
- **Client Secret:** `GOCSPX-...`

### **5. Configure no Supabase**

No Supabase Dashboard → **Settings** → **Edge Functions** → **Environment Variables**:

```
GOOGLE_FIT_CLIENT_ID=SEU_CLIENT_ID_AQUI
GOOGLE_FIT_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI
```

---

## 🔥 **AÇÃO URGENTE NECESSÁRIA:**

1. ✅ **Execute o SQL** (criar tabela)
2. ✅ **Configure Google Cloud** (OAuth)
3. ✅ **Adicione variáveis Supabase**

**Depois disso, a integração funcionará perfeitamente!** 🚀

await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://plataforma.institutodossonhos.com.br' // ou omita para usar o Site URL
  }
})