#!/bin/bash

echo "🚀 Configurando Label Studio para validação de alimentos..."

# Aguardar Label Studio estar pronto
echo "⏳ Aguardando Label Studio estar online..."
until curl -s http://localhost:8080/api/health > /dev/null 2>&1; do
    echo "   Aguardando... (tente acessar http://localhost:8080)"
    sleep 5
done

echo "✅ Label Studio está online!"

# Criar usuário admin (se não existir)
echo "👤 Criando usuário admin..."
curl -X POST http://localhost:8080/api/users/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }' 2>/dev/null || echo "   Usuário admin já existe ou erro (normal)"

# Fazer login e obter token
echo "🔑 Fazendo login..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Falha ao obter token. Tente fazer login manualmente em http://localhost:8080"
    echo "   Usuário: admin"
    echo "   Senha: admin123"
    exit 1
fi

echo "✅ Token obtido: ${TOKEN:0:20}..."

# Criar projeto para validação de alimentos
echo "📋 Criando projeto de validação de alimentos..."
PROJECT_RESPONSE=$(curl -s -X POST http://localhost:8080/api/projects/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Validação de Alimentos - Sofia AI",
    "description": "Projeto para validar detecções de alimentos da Sofia AI",
    "label_config": "<View><Image name=\"image\" value=\"$image\"/><Choices name=\"food_detection\" toName=\"image\" showInLine=\"true\"><Choice value=\"arroz\"/><Choice value=\"feijão\"/><Choice value=\"carne\"/><Choice value=\"frango\"/><Choice value=\"batata\"/><Choice value=\"salada\"/><Choice value=\"farofa\"/><Choice value=\"queijo\"/><Choice value=\"outro\"/></Choices></View>"
  }')

PROJECT_ID=$(echo $PROJECT_RESPONSE | grep -o '"id":[0-9]*' | cut -d':' -f2)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Falha ao criar projeto. Resposta: $PROJECT_RESPONSE"
    exit 1
fi

echo "✅ Projeto criado com ID: $PROJECT_ID"

# Salvar configurações
echo "💾 Salvando configurações..."
cat > .env-label-studio << EOF
# Label Studio Configuration
LABEL_STUDIO_ENABLED=true
LABEL_STUDIO_URL=http://localhost:8080
LABEL_STUDIO_TOKEN=$TOKEN
LABEL_STUDIO_PROJECT_ID=$PROJECT_ID
EOF

echo "✅ Configuração salva em .env-label-studio"
echo ""
echo "🎉 Label Studio configurado com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure as variáveis de ambiente na função sofia-image-analysis:"
echo "   LABEL_STUDIO_ENABLED=true"
echo "   LABEL_STUDIO_URL=http://localhost:8080"
echo "   LABEL_STUDIO_TOKEN=$TOKEN"
echo "   LABEL_STUDIO_PROJECT_ID=$PROJECT_ID"
echo ""
echo "2. Acesse o Label Studio: http://localhost:8080"
echo "   Usuário: admin"
echo "   Senha: admin123"
echo ""
echo "3. Teste enviando uma imagem pela Sofia - ela será enviada para validação!"
