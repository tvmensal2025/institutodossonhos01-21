# Como Salvar as Imagens dos Personagens

## 📁 Estrutura de Arquivos

Para que as imagens funcionem, você precisa salvar os arquivos nos seguintes locais:

```
public/
└── images/
    ├── dr-vital.png    # Imagem do Dr. Vital
    └── sofia.png       # Imagem da Sofia
```

## 🖼️ Passos para Salvar as Imagens

### 1. Criar a pasta de imagens
```bash
mkdir -p public/images
```

### 2. Salvar as imagens
- Salve a imagem do **Dr. Vital** como `public/images/dr-vital.png`
- Salve a imagem da **Sofia** como `public/images/sofia.png`

### 3. Verificar se funcionam
Após salvar as imagens, elas estarão disponíveis em:
- Dr. Vital: `http://localhost:3000/images/dr-vital.png`
- Sofia: `http://localhost:3000/images/sofia.png`

## 🔧 Configuração Atual

O arquivo `src/lib/character-images.ts` já está configurado para usar:
- Dr. Vital: `/images/dr-vital.png`
- Sofia: `/images/sofia.png`

## ✅ Verificação

Para verificar se as imagens estão funcionando:

1. Salve as imagens nos locais corretos
2. Execute o projeto: `npm run dev`
3. Acesse: `http://localhost:3000/images/dr-vital.png`
4. Acesse: `http://localhost:3000/images/sofia.png`

## 🎯 Onde as Imagens Aparecem

Após salvar as imagens, elas aparecerão em:

1. **Chat da Sofia** - Avatar no header do chat
2. **Feedback do Dr. Vital** - Avatar no modal de feedback
3. **Relatórios por Email** - Imagens incorporadas nos templates
4. **Templates de Email** - Seções dedicadas para cada personagem

## 📝 Notas Importantes

- As imagens devem estar em formato PNG ou JPG
- Tamanho recomendado: 200x200 pixels ou maior
- Fundo transparente é preferível para melhor integração
- As imagens são servidas estaticamente pelo Vite

## 🚀 Próximos Passos

1. Salve as imagens nos locais especificados
2. Teste se estão acessíveis via navegador
3. As imagens aparecerão automaticamente nos componentes 