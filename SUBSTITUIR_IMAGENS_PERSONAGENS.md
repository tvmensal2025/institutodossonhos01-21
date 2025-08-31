# 🔄 Substituir Imagens dos Personagens

## 🎯 Objetivo
Substituir as imagens placeholder pelos personagens reais (Dr. Vital e Sofia).

## 📋 Status Atual
- ⚠️ `dr-vital.png`: 0.11KB (placeholder)
- ⚠️ `sofia.png`: 0.11KB (placeholder)

## 🚀 Como Substituir

### Opção 1: Substituição Manual

#### 1. Baixar as Imagens
```bash
# Baixar Dr. Vital
curl -o "public/images/dr-vital.png" "https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png"

# Baixar Sofia
curl -o "public/images/sofia.png" "https://imagensids.s3.us-east-1.amazonaws.com/Sofia%20sem%20fundo.png"
```

#### 2. Verificar Download
```bash
# Verificar se as imagens foram baixadas
ls -la public/images/dr-vital.png public/images/sofia.png
```

#### 3. Testar URLs
```bash
# Testar se as URLs estão funcionando
curl -I "https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png"
curl -I "https://imagensids.s3.us-east-1.amazonaws.com/Sofia%20sem%20fundo.png"
```

### Opção 2: Upload Manual

#### 1. Acessar URLs
- **Dr. Vital**: https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png
- **Sofia**: https://imagensids.s3.us-east-1.amazonaws.com/Sofia%20sem%20fundo.png

#### 2. Salvar Imagens
1. Clique com botão direito em cada imagem
2. Selecione "Salvar imagem como..."
3. Salve como:
   - `dr-vital.png` na pasta `public/images/`
   - `sofia.png` na pasta `public/images/`

#### 3. Verificar Substituição
```bash
# Executar script de verificação
node substituir-imagens.js
```

## ✅ Verificação

### 1. Verificar Tamanho das Imagens
```bash
# Verificar se as imagens são reais (mais de 1KB)
ls -la public/images/dr-vital.png public/images/sofia.png
```

### 2. Testar nos Componentes
1. **Chat da Sofia**: Abra o chat e verifique o avatar
2. **Dr. Vital**: Faça uma avaliação e verifique o feedback
3. **Emails**: Envie um relatório semanal

### 3. Verificar URLs
```bash
# Testar URLs locais
curl -I "http://localhost:3000/images/dr-vital.png"
curl -I "http://localhost:3000/images/sofia.png"
```

## 🔧 Configuração Automática

### Sistema Híbrido Funcionando
- ✅ **URLs do Supabase**: Para emails (melhor entrega)
- ✅ **Imagens locais**: Para desenvolvimento e fallback
- ✅ **Detecção automática**: Qual URL funciona

### Fallback Automático
```typescript
// Se Supabase não funcionar, usa local automaticamente
const imageUrl = getCharacterImageUrl('dr-vital');
// Retorna: /images/dr-vital.png se Supabase falhar
```

## 📧 Benefícios para Emails

### ✅ Após Substituição
- **Imagens reais**: Dr. Vital e Sofia aparecem corretamente
- **Melhor entrega**: URLs do Supabase confiáveis
- **Menor spam**: Imagens hospedadas em servidor confiável
- **Cache otimizado**: CDN do Supabase

### 🎯 Onde Aparecem
1. **Relatórios semanais**: Dr. Vital e Sofia com imagens reais
2. **Relatórios mensais**: Personagens com avatares corretos
3. **Templates de email**: Layout responsivo com imagens
4. **WhatsApp**: Imagens otimizadas para mobile

## 🔄 Próximos Passos

### 1. Substituir Imagens
```bash
# Baixar imagens reais
curl -o "public/images/dr-vital.png" "URL_DO_DR_VITAL"
curl -o "public/images/sofia.png" "URL_DA_SOFIA"
```

### 2. Verificar Substituição
```bash
# Executar verificação
node substituir-imagens.js
```

### 3. Testar Componentes
- Chat da Sofia
- Feedback do Dr. Vital
- Relatórios por email

### 4. Configurar Supabase (Opcional)
- Faça upload das imagens para Supabase Storage
- Atualize URLs em `src/lib/character-images.ts`
- Teste URLs do Supabase

## 📝 Troubleshooting

### Problema: Imagens não carregam
```bash
# Verificar se arquivos existem
ls -la public/images/dr-vital.png public/images/sofia.png

# Verificar tamanho (deve ser > 1KB)
du -h public/images/dr-vital.png public/images/sofia.png
```

### Problema: URLs do Supabase não funcionam
- ✅ Sistema usa fallback automático
- ✅ Imagens locais funcionam
- ✅ Emails ainda funcionam com imagens locais

### Problema: Imagens quebradas em emails
- ✅ URLs do Supabase são mais confiáveis
- ✅ Fallback para imagens locais
- ✅ Sistema híbrido garante funcionamento

## 🎉 Resultado Esperado

Após substituição:
- ✅ Dr. Vital aparece com imagem real
- ✅ Sofia aparece com imagem real
- ✅ Emails têm melhor entrega
- ✅ Menor risco de spam
- ✅ Sistema robusto com fallback 