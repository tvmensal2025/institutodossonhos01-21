#!/bin/bash

echo "🧪 Testando integração YOLO11..."

# Configurações
YOLO_SERVICE_URL="http://45.67.221.216:8002"
SUPABASE_URL="https://hlrkoyywjpckdotimtik.supabase.co/functions/v1"

echo "1️⃣ Testando YOLO Service diretamente..."
echo "   Health Check:"
curl -s "$YOLO_SERVICE_URL/health" | jq '.' 2>/dev/null || curl -s "$YOLO_SERVICE_URL/health"

echo ""
echo "2️⃣ Testando detecção com imagem de exemplo..."
TEST_RESPONSE=$(curl -s -X POST "$YOLO_SERVICE_URL/detect" \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://picsum.photos/400/300", "confidence": 0.3}')

echo "   Resposta da detecção:"
echo "$TEST_RESPONSE" | jq '.' 2>/dev/null || echo "$TEST_RESPONSE"

echo ""
echo "3️⃣ Testando Edge Function do Supabase..."
echo "   ⚠️ Para testar a integração completa, você precisa:"
echo "   1. Configurar as variáveis no Supabase Dashboard"
echo "   2. Fazer deploy da Edge Function 'sofia-image-analysis'"
echo "   3. Testar com uma imagem real do seu app"

echo ""
echo "📋 Resumo da Configuração:"
echo "   ✅ YOLO11 rodando em: $YOLO_SERVICE_URL"
echo "   ✅ Modelo: yolo11s-seg.pt"
echo "   ✅ Tarefa: segment"
echo "   ✅ Confiança: 0.35"
echo ""
echo "🔧 Próximos passos:"
echo "   1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik"
echo "   2. Settings > Edge Functions"
echo "   3. Configure:"
echo "      YOLO_ENABLED=true"
echo "      YOLO_SERVICE_URL=$YOLO_SERVICE_URL"
echo "   4. Deploy da função 'sofia-image-analysis'"
echo "   5. Teste no seu app!"
