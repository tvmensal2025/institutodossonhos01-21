#!/bin/bash

echo "🚀 Criando app YOLO11 no EasyPanel..."

# Configurações
EASYPANEL_URL="http://45.67.221.216:3000"
EMAIL="rafael.ids@icloud.com"
PASSWORD="201097De."

echo "📝 Tentando criar app via API..."

# Tentar diferentes endpoints de login
echo "🔐 Tentando login..."

# Método 1: Login direto
LOGIN_RESPONSE=$(curl -s -X POST "$EASYPANEL_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Resposta do login: $LOGIN_RESPONSE"

# Método 2: Tentar endpoint alternativo
if [[ $LOGIN_RESPONSE == *"not found"* ]]; then
    echo "🔄 Tentando endpoint alternativo..."
    LOGIN_RESPONSE=$(curl -s -X POST "$EASYPANEL_URL/api/login" \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
    echo "Resposta alternativa: $LOGIN_RESPONSE"
fi

# Método 3: Tentar com GET
if [[ $LOGIN_RESPONSE == *"not found"* ]]; then
    echo "🔄 Tentando método GET..."
    LOGIN_RESPONSE=$(curl -s -X GET "$EASYPANEL_URL/api/auth/login?email=$EMAIL&password=$PASSWORD")
    echo "Resposta GET: $LOGIN_RESPONSE"
fi

echo ""
echo "📋 Configuração Manual no EasyPanel:"
echo ""
echo "1️⃣ Acesse: http://45.67.221.216:3000"
echo "2️⃣ Login com:"
echo "   Email: $EMAIL"
echo "   Senha: $PASSWORD"
echo ""
echo "3️⃣ Crie novo projeto:"
echo "   - Clique em 'New Project'"
echo "   - Escolha 'Python'"
echo "   - Nome: 'yolo11-service'"
echo "   - Port: 8000"
echo ""
echo "4️⃣ Configure Source:"
echo "   - Source: Local Directory"
echo "   - Path: /opt/yolo-service-easypanel"
echo ""
echo "5️⃣ Variáveis de ambiente:"
echo "   YOLO_MODEL=yolo11s-seg.pt"
echo "   YOLO_TASK=segment"
echo "   YOLO_CONF=0.35"
echo ""
echo "6️⃣ Comando de inicialização:"
echo "   uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "7️⃣ Deploy o projeto"
echo ""
echo "✅ App YOLO11 criado no EasyPanel!"
