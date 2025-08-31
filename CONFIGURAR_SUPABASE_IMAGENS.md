# Configurar Supabase para Imagens dos Personagens

## 🎯 Objetivo
Hospedar as imagens do Dr. Vital e Sofia no Supabase Storage para melhorar a entrega de emails e reduzir risco de spam.

## 📋 Pré-requisitos

### 1. Configurar Variáveis de Ambiente
Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Criar arquivo .env.local
touch .env.local
```

Adicione as seguintes variáveis:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

### 2. Obter Credenciais do Supabase
1. Acesse: https://supabase.com
2. Faça login na sua conta
3. Selecione seu projeto
4. Vá em Settings > API
5. Copie:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** → `VITE_SUPABASE_ANON_KEY`

## 🚀 Upload das Imagens

### Opção 1: Script Automático
```bash
# Executar o script de upload
node upload-images-to-supabase.js
```

### Opção 2: Upload Manual
1. Acesse o Supabase Dashboard
2. Vá em Storage
3. Crie um bucket chamado `character-images`
4. Configure como público
5. Faça upload das imagens:
   - `dr-vital.png`
   - `sofia.png`

## 📁 Estrutura do Bucket
```
character-images/
├── dr-vital.png    # Imagem do Dr. Vital
└── sofia.png       # Imagem da Sofia
```

## 🔧 Configuração do Bucket

### Políticas de Segurança
```sql
-- Permitir acesso público às imagens
CREATE POLICY "Public Access" ON storage.objects
FOR SELECT USING (bucket_id = 'character-images');

-- Permitir upload de imagens
CREATE POLICY "Authenticated users can upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'character-images' 
  AND auth.role() = 'authenticated'
);
```

## 📧 Vantagens para Emails

### ✅ Benefícios
- **Melhor entrega**: URLs confiáveis do Supabase
- **Menor spam**: Imagens hospedadas em servidor confiável
- **Cache otimizado**: CDN do Supabase
- **Sempre disponível**: 99.9% uptime

### ❌ Problemas Evitados
- Imagens quebradas em emails
- Bloqueio por provedores de email
- Problemas de cache local
- URLs instáveis

## 🎯 URLs Finais

Após o upload, as URLs serão:
```
https://[projeto].supabase.co/storage/v1/object/public/character-images/dr-vital.png
https://[projeto].supabase.co/storage/v1/object/public/character-images/sofia.png
```

## ✅ Verificação

### 1. Testar URLs
```bash
# Verificar se as imagens estão acessíveis
curl -I "https://[projeto].supabase.co/storage/v1/object/public/character-images/dr-vital.png"
curl -I "https://[projeto].supabase.co/storage/v1/object/public/character-images/sofia.png"
```

### 2. Testar nos Componentes
- Abra o chat da Sofia
- Faça uma avaliação para ver o Dr. Vital
- Verifique se as imagens carregam

### 3. Testar em Emails
- Envie um relatório semanal
- Verifique se as imagens aparecem no email

## 🔄 Atualização de Imagens

Para atualizar as imagens no futuro:

### Via Script
```bash
# Substitua as imagens em public/images/
# Execute o script novamente
node upload-images-to-supabase.js
```

### Via Dashboard
1. Acesse Supabase Dashboard
2. Vá em Storage > character-images
3. Faça upload das novas imagens
4. Atualize o arquivo `src/lib/character-images.ts`

## 📝 Configuração Automática

O script `upload-images-to-supabase.js`:
1. ✅ Cria o bucket se não existir
2. ✅ Faz upload das imagens
3. ✅ Gera URLs públicas
4. ✅ Atualiza o arquivo de configuração
5. ✅ Configura cache e headers

## 🚀 Próximos Passos

1. ✅ Configure as variáveis de ambiente
2. ✅ Execute o script de upload
3. ✅ Teste as URLs
4. ✅ Verifique nos componentes
5. ✅ Teste nos emails

## 📞 Suporte

Se houver problemas:
1. Verifique as variáveis de ambiente
2. Confirme se o projeto Supabase está ativo
3. Verifique as políticas de segurança do bucket
4. Teste as URLs manualmente 