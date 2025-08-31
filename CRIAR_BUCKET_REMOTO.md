# 🪣 Criar Bucket chat-images no Supabase Remoto

## 🚨 PROBLEMA IDENTIFICADO
O bucket `chat-images` foi criado apenas no ambiente local, mas o frontend está tentando fazer upload no Supabase remoto.

**Erro encontrado:**
```
❌ Erro ao fazer upload da imagem: StorageApiError: Bucket not found
📸 URL da imagem: null
```

## 🔧 SOLUÇÃO: Criar Bucket no Remoto

### Passo 1: Acessar o Dashboard do Supabase
1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik
2. Faça login na sua conta

### Passo 2: Criar o Bucket
1. No menu lateral, clique em **"Storage"**
2. Clique no botão **"New bucket"**
3. Configure o bucket:
   - **Name:** `chat-images`
   - **Public bucket:** ✅ Marque esta opção
   - **File size limit:** 5MB
   - **Allowed MIME types:** `image/jpeg, image/png, image/gif, image/webp`

### Passo 3: Configurar Políticas RLS
1. Clique no bucket `chat-images` criado
2. Vá para a aba **"Policies"**
3. Adicione as seguintes políticas:

#### Política 1: Permitir upload
```sql
CREATE POLICY "Users can upload chat images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'chat-images');
```

#### Política 2: Permitir visualização
```sql
CREATE POLICY "Chat images are publicly accessible" ON storage.objects
FOR SELECT USING (bucket_id = 'chat-images');
```

#### Política 3: Permitir atualização
```sql
CREATE POLICY "Users can update their own chat images" ON storage.objects
FOR UPDATE USING (bucket_id = 'chat-images');
```

#### Política 4: Permitir exclusão
```sql
CREATE POLICY "Users can delete their own chat images" ON storage.objects
FOR DELETE USING (bucket_id = 'chat-images');
```

## ✅ VERIFICAÇÃO

Após criar o bucket, teste novamente:

1. **Envie uma foto de comida:**
   - Abra o chat da Sofia
   - Clique no botão da câmera 📷
   - Tire uma foto do seu prato
   - Envie a mensagem

2. **Verifique os logs:**
   - Console do navegador (F12): Procure por logs com emojis
   - Deve aparecer: `📸 URL da imagem: https://...` (não mais `null`)

## 🎯 RESULTADO ESPERADO

Após criar o bucket, a análise de comida deve funcionar:

- ✅ **Upload da imagem:** Funcionando
- ✅ **URL da imagem:** Gerada corretamente
- ✅ **Análise de comida:** Detectada pela IA
- ✅ **Resposta personalizada:** Sofia analisa o prato

---

**🔧 CRIE O BUCKET NO DASHBOARD E TESTE NOVAMENTE!** 