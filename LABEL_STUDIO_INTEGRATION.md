# 🏷️ Integração Label Studio - Validação de Alimentos

## 📋 Visão Geral

Esta integração permite enviar automaticamente as previsões de alimentos da Sofia AI para o Label Studio, onde podem ser validadas e corrigidas por humanos antes de serem confirmadas.

## 🚀 Como Funciona

1. **Detecção**: Sofia detecta alimentos na imagem
2. **Envio**: Previsões são enviadas para Label Studio como "tasks"
3. **Validação**: Humanos podem revisar e corrigir as previsões
4. **Feedback**: Correções podem ser usadas para melhorar futuras detecções

## 🛠️ Instalação

### 1. Subir os Containers

```bash
# Subir Label Studio + PostgreSQL
docker-compose up -d label-studio label-studio-postgres

# Aguardar estar online (porta 8080)
curl http://localhost:8080/api/health
```

### 2. Configurar Projeto

```bash
# Executar script de configuração automática
./setup-label-studio.sh
```

### 3. Configurar Variáveis de Ambiente

No Supabase Dashboard → Edge Functions → sofia-image-analysis:

```
LABEL_STUDIO_ENABLED=true
LABEL_STUDIO_URL=http://localhost:8080
LABEL_STUDIO_TOKEN=<token_do_script>
LABEL_STUDIO_PROJECT_ID=<project_id_do_script>
```

## 📊 Configuração Manual (Alternativa)

Se o script automático falhar:

### 1. Acessar Label Studio
- URL: http://localhost:8080
- Usuário: admin
- Senha: admin123

### 2. Criar Projeto
- Nome: "Validação de Alimentos - Sofia AI"
- Configuração de Labels:
```xml
<View>
  <Image name="image" value="$image"/>
  <Choices name="food_detection" toName="image" showInLine="true">
    <Choice value="arroz"/>
    <Choice value="feijão"/>
    <Choice value="carne"/>
    <Choice value="frango"/>
    <Choice value="batata"/>
    <Choice value="salada"/>
    <Choice value="farofa"/>
    <Choice value="queijo"/>
    <Choice value="outro"/>
  </Choices>
</View>
```

### 3. Obter Token
- Settings → Access Token → Create Token
- Copiar o token gerado

### 4. Obter Project ID
- URL do projeto: `http://localhost:8080/projects/<PROJECT_ID>/`
- Copiar o ID da URL

## 🔄 Fluxo de Integração

### Envio Automático
```typescript
// Na função sofia-image-analysis
if (labelStudioEnabled && isFood && confidence >= 0.5) {
  const result = await sendToLabelStudio(imageUrl, detectedFoods, confidence, userId);
  // Salva task_id no banco
}
```

### Formato da Task
```json
{
  "data": {
    "image": "https://..."
  },
  "predictions": [
    {
      "result": [
        {
          "type": "choices",
          "value": { "choices": ["arroz"] },
          "from_name": "food_detection",
          "to_name": "image"
        }
      ],
      "score": 0.85
    }
  ],
  "meta": {
    "userId": "user123",
    "confidence": 0.85,
    "source": "sofia-ai"
  }
}
```

## 📈 Benefícios

### Para Validação
- **Qualidade**: Revisão humana das previsões
- **Correção**: Interface amigável para ajustes
- **Histórico**: Rastreamento de todas as validações

### Para Melhoria do Modelo
- **Dataset**: Correções podem ser exportadas
- **Fine-tuning**: Dados para treinar modelo customizado
- **Feedback Loop**: Melhoria contínua

## 🔧 Configurações Avançadas

### Adicionar Novos Alimentos
1. Editar configuração do projeto no Label Studio
2. Adicionar novas `<Choice>` tags
3. Atualizar mapeamento na função Sofia

### Exportar Anotações
```bash
# Via API
curl -H "Authorization: Token $TOKEN" \
  "http://localhost:8080/api/projects/$PROJECT_ID/export" \
  -o annotations.json
```

### Integração com Modelo Customizado
1. Exportar anotações validadas
2. Converter para formato COCO/YOLO
3. Treinar modelo customizado
4. Substituir modelo atual

## 🐛 Troubleshooting

### Label Studio não inicia
```bash
# Verificar logs
docker-compose logs label-studio

# Verificar PostgreSQL
docker-compose logs label-studio-postgres
```

### Erro de autenticação
```bash
# Recriar token
curl -X POST http://localhost:8080/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

### Tasks não aparecem
- Verificar se `LABEL_STUDIO_PROJECT_ID` está correto
- Verificar se `LABEL_STUDIO_TOKEN` é válido
- Verificar logs da função Sofia

## 📝 Exemplo de Uso

1. **Usuário envia foto** pela Sofia
2. **Sofia detecta**: arroz, feijão, carne
3. **Envia para Label Studio** automaticamente
4. **Validador acessa** http://localhost:8080
5. **Revisa e corrige** as previsões
6. **Confirma** ou ajusta os alimentos
7. **Dados salvos** para melhoria futura

## 🔗 Links Úteis

- [Label Studio Documentation](https://labelstud.io/guide/)
- [API Reference](https://labelstud.io/api/)
- [Docker Installation](https://labelstud.io/guide/install.html#Install-with-Docker)
- [Export Formats](https://labelstud.io/guide/export.html)
