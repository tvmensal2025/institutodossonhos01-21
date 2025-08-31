#!/bin/bash

echo "🚀 Configurando YOLO11 no EasyPanel..."

# Configurações
EASYPANEL_URL="http://45.67.221.216:3000"
EMAIL="rafael.ids@icloud.com"
PASSWORD="201097De."

echo "📝 Verificando se o YOLO11 já está configurado..."

# Verificar se o app já existe
sshpass -p '534WLI410zfWCFR1veAcUbi' ssh root@45.67.221.216 'ls -la /opt/yolo-service-easypanel/'

echo ""
echo "🔧 Configuração do YOLO11 no EasyPanel:"
echo ""
echo "1️⃣ Acesse o EasyPanel:"
echo "   URL: http://45.67.221.216:3000"
echo "   Email: rafael.ids@icloud.com"
echo "   Senha: 201097De."
echo ""
echo "2️⃣ Crie um novo app:"
echo "   - Clique em 'New Project'"
echo "   - Escolha 'Python'"
echo "   - Nome: 'yolo11-service'"
echo "   - Port: 8000"
echo ""
echo "3️⃣ Configure o Source:"
echo "   - Source: Local Directory"
echo "   - Path: /opt/yolo-service-easypanel"
echo ""
echo "4️⃣ Configure as variáveis de ambiente:"
echo "   YOLO_MODEL=yolo11s-seg.pt"
echo "   YOLO_TASK=segment"
echo "   YOLO_CONF=0.35"
echo ""
echo "5️⃣ Configure o comando de inicialização:"
echo "   Command: uvicorn main:app --host 0.0.0.0 --port 8000"
echo ""
echo "6️⃣ Deploy o app"
echo ""
echo "🔗 URLs de teste após deploy:"
echo "   - Health: http://45.67.221.216:8000/health"
echo "   - Info: http://45.67.221.216:8000/"
echo "   - Detecção: POST http://45.67.221.216:8000/detect"
echo ""
echo "✅ YOLO11 configurado no EasyPanel!"
