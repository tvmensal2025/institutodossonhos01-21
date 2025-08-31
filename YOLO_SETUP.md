# 🦾 Configuração do YOLO para Detecção de Alimentos

## 📋 Visão Geral

O YOLO (You Only Look Once) é usado como **primeira camada de detecção** para identificar objetos básicos na imagem, fornecendo contexto para o Gemini fazer uma análise mais precisa e detalhada.

## 🔄 Fluxo de Análise

```
📸 Imagem → 🦾 YOLO (Detecção Básica) → 🤖 Gemini (Análise Detalhada) → 🧮 Cálculos Nutricionais
```

### 1. 🦾 YOLO - Detecção Inicial
- **Objetivo**: Identificar objetos básicos (pratos, copos, alimentos)
- **Confiança**: 0.35+ (baixa para capturar mais objetos)
- **Saída**: Lista de objetos detectados com confiança

### 2. 🤖 Gemini - Análise Refinada
- **Objetivo**: Análise detalhada usando contexto do YOLO
- **Entrada**: Imagem + contexto do YOLO
- **Saída**: Alimentos específicos + porções + calorias

## 🚀 Configuração

### Variáveis de Ambiente

```bash
# Habilitar YOLO (padrão: true)
YOLO_ENABLED=true

# URL do serviço YOLO
YOLO_SERVICE_URL=http://localhost:8001

# Modelo Gemini (padrão: gemini-1.5-pro)
SOFIA_GEMINI_MODEL=gemini-1.5-pro

# Modo de porção (ai_strict ou defaults)
SOFIA_PORTION_MODE=ai_strict

# Confiança mínima do YOLO
SOFIA_PORTION_CONFIDENCE_MIN=0.55
```

### Serviço YOLO

O YOLO deve estar rodando em um microserviço que aceita:

**Endpoint**: `POST /detect`

**Request**:
```json
{
  "image_url": "https://exemplo.com/imagem.jpg",
  "task": "segment",
  "confidence": 0.35
}
```

**Response**:
```json
{
  "objects": [
    {
      "class_name": "apple",
      "score": 0.85,
      "bbox": [x, y, w, h]
    }
  ]
}
```

## 🍽️ Mapeamento de Classes

O sistema mapeia classes COCO/YOLO para alimentos brasileiros:

```typescript
const YOLO_CLASS_MAP = {
  // Frutas
  'apple': 'maçã',
  'banana': 'banana',
  'orange': 'laranja',
  
  // Legumes
  'broccoli': 'brócolis',
  'carrot': 'cenoura',
  'tomato': 'tomate',
  
  // Proteínas
  'chicken': 'frango',
  'beef': 'carne bovina',
  'fish': 'peixe',
  
  // Pratos
  'pizza': 'pizza',
  'hamburger': 'hambúrguer',
  'sandwich': 'sanduíche',
  
  // Bebidas
  'cup': 'copo',
  'bottle': 'garrafa',
  'wine glass': 'taça de vinho'
}
```

## 🔧 Benefícios da Integração

### ✅ Vantagens do YOLO + Gemini

1. **🎯 Precisão**: YOLO detecta objetos básicos, Gemini refina
2. **⚡ Velocidade**: YOLO é rápido para detecção inicial
3. **🧠 Inteligência**: Gemini entende contexto e detalhes
4. **🛡️ Redundância**: Dupla verificação reduz erros
5. **📊 Confiança**: Múltiplas fontes de validação

### 🔄 Fluxo Detalhado

1. **📸 Upload da imagem**
2. **🦾 YOLO detecta objetos básicos**
3. **📋 Contexto enviado para Gemini**
4. **🤖 Gemini analisa com contexto**
5. **🧮 Cálculos nutricionais**
6. **✅ Confirmação do usuário**

## 🐛 Troubleshooting

### YOLO não detecta objetos
- Verificar se o serviço está rodando
- Verificar URL do serviço
- Verificar se a imagem é acessível

### Gemini não usa contexto do YOLO
- Verificar logs do YOLO
- Verificar prompt do Gemini
- Verificar mapeamento de classes

### Erros de conexão
- Verificar `YOLO_SERVICE_URL`
- Verificar firewall/network
- Verificar se o serviço aceita CORS

## 📊 Monitoramento

### Logs Importantes

```bash
🦾 YOLO: Iniciando detecção de objetos...
🦾 YOLO: Detectou 5 objetos brutos
🦾 YOLO: 3 objetos mapeados para alimentos
✅ YOLO: Detecção concluída: { foods: 2, liquids: 1, maxConfidence: 0.85 }
🤖 Gemini: Análise com contexto do YOLO...
```

### Métricas

- **Taxa de detecção do YOLO**
- **Confiança média**
- **Tempo de resposta**
- **Taxa de erro**

## 🎯 Próximos Passos

1. **Deploy do serviço YOLO**
2. **Configuração das variáveis de ambiente**
3. **Teste com imagens reais**
4. **Ajuste de confiança e mapeamento**
5. **Monitoramento e otimização**
