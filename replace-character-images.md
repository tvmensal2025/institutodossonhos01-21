# Como Substituir as Imagens dos Personagens

## 📍 Localização dos Arquivos

As imagens placeholder estão em:
- `public/images/dr-vital.png` (placeholder)
- `public/images/sofia.png` (placeholder)

## 🔄 Como Substituir

### Opção 1: Substituição Manual
1. Abra a pasta `public/images/`
2. Substitua o arquivo `dr-vital.png` pela imagem real do Dr. Vital
3. Substitua o arquivo `sofia.png` pela imagem real da Sofia

### Opção 2: Usando o Terminal
```bash
# Navegar para a pasta
cd public/images/

# Substituir as imagens (copie suas imagens para esta pasta)
# Renomeie suas imagens para:
# - dr-vital.png
# - sofia.png
```

## 🖼️ Especificações das Imagens

### Dr. Vital
- **Arquivo**: `public/images/dr-vital.png`
- **Descrição**: Médico com jaleco branco, estetoscópio, expressão amigável
- **Estilo**: Cartoon profissional
- **Fundo**: Transparente (preferível)

### Sofia
- **Arquivo**: `public/images/sofia.png`
- **Descrição**: Jovem mulher com cabelo escuro cacheado, expressão acolhedora
- **Estilo**: Cartoon amigável
- **Fundo**: Transparente (preferível)

## ✅ Verificação

Após substituir as imagens:

1. **Teste local**:
   ```bash
   npm run dev
   ```
   Acesse: `http://localhost:3000/images/dr-vital.png`
   Acesse: `http://localhost:3000/images/sofia.png`

2. **Teste nos componentes**:
   - Abra o chat da Sofia
   - Faça uma avaliação para ver o Dr. Vital
   - Verifique se as imagens aparecem corretamente

## 🎯 Onde Aparecem

As imagens aparecerão em:

1. **Chat da Sofia** (`HealthChatBot.tsx`)
   - Avatar no header do chat
   - Avatar nas mensagens

2. **Feedback do Dr. Vital** (`DrVitalFeedback.tsx`)
   - Avatar no modal de feedback
   - Avatar nas mensagens de análise

3. **Relatórios por Email**
   - Seção dedicada para cada personagem
   - Mensagens personalizadas

4. **Templates de Email**
   - Layout responsivo
   - Compatível com clientes de email

## 🔧 Configuração Automática

O arquivo `src/lib/character-images.ts` já está configurado para usar:
```typescript
DR_VITAL: {
  imageUrl: '/images/dr-vital.png',
  // ...
},
SOFIA: {
  imageUrl: '/images/sofia.png',
  // ...
}
```

## 🚀 Próximos Passos

1. ✅ Substitua as imagens placeholder pelas reais
2. ✅ Teste se as imagens carregam corretamente
3. ✅ Verifique se aparecem nos componentes
4. ✅ Teste nos relatórios por email

## 📝 Notas

- As imagens são servidas estaticamente pelo Vite
- URLs relativas funcionam em desenvolvimento e produção
- Formato PNG com fundo transparente é ideal
- Tamanho recomendado: 200x200 pixels ou maior 