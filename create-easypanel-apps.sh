#!/bin/bash

echo "🚀 Criando apps no EasyPanel..."

# Configurações
EASYPANEL_URL="http://45.67.221.216:3000"
EMAIL="rafael.ids@icloud.com"
PASSWORD="201097De."

# Login no EasyPanel
echo "📝 Fazendo login no EasyPanel..."
LOGIN_RESPONSE=$(curl -s -X POST "$EASYPANEL_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Erro no login. Verifique as credenciais."
    exit 1
fi

echo "✅ Login realizado com sucesso!"

# Criar app ollama-proxy
echo "🔧 Criando app ollama-proxy..."
curl -s -X POST "$EASYPANEL_URL/api/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ollama-proxy",
    "type": "docker-compose",
    "domain": "ollama-proxy.ifrhb3.easypanel.host",
    "port": 8001,
    "environment": {
      "OLLAMA_URL": "http://ids-ollama:11434"
    }
  }'

# Criar app yolo-service
echo "🔧 Criando app yolo-service..."
curl -s -X POST "$EASYPANEL_URL/api/projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "yolo-service",
    "type": "docker-compose",
    "domain": "yolo-service.ifrhb3.easypanel.host",
    "port": 8002,
    "environment": {
      "YOLO_MODEL": "yolo11s.pt",
      "YOLO_TASK": "segment",
      "YOLO_CONF": "0.35"
    }
  }'

echo "✅ Apps criados com sucesso!"
echo ""
echo "🌐 URLs dos apps:"
echo "   - Ollama Proxy: https://ollama-proxy.ifrhb3.easypanel.host"
echo "   - YOLO Service: https://yolo-service.ifrhb3.easypanel.host"
echo ""
echo "📊 Para verificar:"
echo "   - Acesse: $EASYPANEL_URL"
echo "   - Vá em 'Projetos' para ver os apps criados"
