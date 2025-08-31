# Sistema Híbrido de Imagens dos Personagens

## 🎯 Objetivo
Sistema que funciona tanto com imagens locais quanto com URLs do Supabase, garantindo que as imagens sempre apareçam.

## 🔧 Como Funciona

### Sistema Híbrido
1. **Tenta Supabase primeiro** - URLs confiáveis para emails
2. **Fallback para local** - Se Supabase não estiver acessível
3. **Verificação automática** - Detecta qual URL funciona

### URLs Configuradas

#### Dr. Vital
- **Supabase**: `https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png`
- **Local**: `/images/dr-vital.png`
- **Fallback**: Usa local se Supabase der erro

#### Sofia
- **Supabase**: `https://imagensids.s3.us-east-1.amazonaws.com/Sofia%20sem%20fundo.png`
- **Local**: `/images/sofia.png`
- **Fallback**: Usa local se Supabase der erro

## 📁 Estrutura de Arquivos

```
src/lib/character-images.ts    # Configuração híbrida
public/images/
├── dr-vital.png              # Imagem local (fallback)
└── sofia.png                 # Imagem local (fallback)
```

## 🚀 Como Usar

### 1. Função Síncrona (Recomendada)
```typescript
import { getCharacterImageUrl } from '@/lib/character-images';

// Usa fallback automático
const drVitalUrl = getCharacterImageUrl('dr-vital');
const sofiaUrl = getCharacterImageUrl('sofia');
```

### 2. Função Assíncrona (Verificação completa)
```typescript
import { getCharacterImageUrlAsync } from '@/lib/character-images';

// Verifica qual URL funciona
const drVitalUrl = await getCharacterImageUrlAsync('dr-vital');
const sofiaUrl = await getCharacterImageUrlAsync('sofia');
```

## 📧 Vantagens para Emails

### ✅ Benefícios
- **Sempre funciona**: Fallback garante que as imagens apareçam
- **Melhor entrega**: URLs do Supabase quando disponíveis
- **Menor spam**: Imagens hospedadas em servidor confiável
- **Cache otimizado**: CDN do Supabase

### 🔄 Comportamento
1. **Emails**: Tenta Supabase primeiro (melhor entrega)
2. **Aplicação**: Usa fallback se necessário
3. **Desenvolvimento**: Funciona com imagens locais

## 🎯 Onde Aparecem

### 1. Chat da Sofia
- Avatar no header
- Avatar nas mensagens
- Usa URL híbrida automaticamente

### 2. Feedback do Dr. Vital
- Avatar no modal de feedback
- Avatar nas mensagens de análise
- Fallback para imagem local

### 3. Relatórios por Email
- Seção dedicada para cada personagem
- URLs do Supabase para melhor entrega
- Fallback para imagens locais se necessário

### 4. Templates de Email
- Layout responsivo
- Compatível com clientes de email
- URLs confiáveis do Supabase

## 🔄 Atualização de Imagens

### Para Imagens Locais
1. Substitua os arquivos em `public/images/`
2. Reinicie o servidor de desenvolvimento
3. As imagens aparecem automaticamente

### Para URLs do Supabase
1. Faça upload das imagens para o Supabase Storage
2. Atualize as URLs em `src/lib/character-images.ts`
3. Teste se as URLs estão acessíveis

## ✅ Verificação

### 1. Testar URLs
```bash
# Verificar Supabase
curl -I "https://imagensids.s3.us-east-1.amazonaws.com/Dr.Vital%20sem%20fundo.png"

# Verificar local
curl -I "http://localhost:3000/images/dr-vital.png"
```

### 2. Testar nos Componentes
- Abra o chat da Sofia
- Faça uma avaliação para ver o Dr. Vital
- Verifique se as imagens carregam

### 3. Testar em Emails
- Envie um relatório semanal
- Verifique se as imagens aparecem no email

## 🔧 Configuração Avançada

### Personalizar URLs
Edite `src/lib/character-images.ts`:
```typescript
const SUPABASE_URLS = {
  DR_VITAL: 'sua-url-do-supabase/dr-vital.png',
  SOFIA: 'sua-url-do-supabase/sofia.png'
};
```

### Adicionar Novos Personagens
```typescript
export const CHARACTER_IMAGES = {
  // ... personagens existentes
  NOVO_PERSONAGEM: {
    name: 'Novo Personagem',
    imageUrl: 'url-supabase',
    fallbackUrl: '/images/novo-personagem.png',
    // ...
  }
};
```

## 📝 Status Atual

### ✅ Funcionando
- Sistema híbrido configurado
- Fallback automático
- Componentes atualizados
- Templates de email configurados

### 🔄 Próximos Passos
1. **Substitua as imagens locais** pelas reais
2. **Configure URLs do Supabase** quando disponíveis
3. **Teste em todos os componentes**
4. **Verifique nos emails**

## 🚀 Vantagens do Sistema

### Para Desenvolvimento
- ✅ Funciona imediatamente com imagens locais
- ✅ Não depende de configuração externa
- ✅ Fácil de testar e debugar

### Para Produção
- ✅ URLs confiáveis do Supabase
- ✅ Melhor entrega de emails
- ✅ Menor risco de spam
- ✅ Cache otimizado

### Para Manutenção
- ✅ Fácil atualização de imagens
- ✅ Sistema robusto com fallback
- ✅ Configuração centralizada 