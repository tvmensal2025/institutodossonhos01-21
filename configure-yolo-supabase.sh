#!/bin/bash

echo "🚀 Configurando YOLO11 no Supabase..."

# Configurações
SUPABASE_URL="https://hlrkoyywjpckdotimtik.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI"
YOLO_SERVICE_URL="http://45.67.221.216:8002"

echo "📝 Configurando variáveis de ambiente..."

# Configurar YOLO_ENABLED=true
echo "✅ YOLO_ENABLED=true"
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/set_config" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"key": "YOLO_ENABLED", "value": "true"}' || echo "⚠️ Erro ao configurar YOLO_ENABLED"

# Configurar YOLO_SERVICE_URL
echo "✅ YOLO_SERVICE_URL=$YOLO_SERVICE_URL"
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/set_config" \
  -H "apikey: $SUPABASE_ANON_KEY" \
  -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"key\": \"YOLO_SERVICE_URL\", \"value\": \"$YOLO_SERVICE_URL\"}" || echo "⚠️ Erro ao configurar YOLO_SERVICE_URL"

echo ""
echo "🎯 Configuração Manual no Supabase Dashboard:"
echo ""
echo "1. Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik"
echo "2. Vá em 'Settings' > 'Edge Functions'"
echo "3. Configure as variáveis:"
echo ""
echo "   YOLO_ENABLED=true"
echo "   YOLO_SERVICE_URL=http://45.67.221.216:8002"
echo ""
echo "4. Clique em 'Save'"
echo ""
echo "🔗 URLs de Teste:"
echo "   - Health Check: http://45.67.221.216:8002/health"
echo "   - API Info: http://45.67.221.216:8002/"
echo "   - Detecção: POST http://45.67.221.216:8002/detect"
echo ""
echo "✅ YOLO11 configurado com sucesso!"
