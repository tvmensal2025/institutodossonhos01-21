#!/bin/bash

# Script para migrar do Resend para SendPulse
# Uso: ./migrate-to-sendpulse.sh

echo "📧 Iniciando migração do Resend para SendPulse..."

# Backup dos arquivos originais
echo "📦 Criando backup dos arquivos originais..."
mkdir -p backup/$(date +%Y%m%d_%H%M%S)
cp supabase/functions/*/index.ts backup/$(date +%Y%m%d_%H%M%S)/

# Função para atualizar um arquivo
update_file() {
    local file=$1
    echo "🔄 Atualizando $file..."
    
    # Substituir import do Resend
    sed -i '' 's/import { Resend } from "npm:resend@[0-9.]*";/import { sendPulseClient } from "..\/..\/..\/src\/lib\/sendpulse-client.ts";/g' "$file"
    
    # Substituir inicialização do Resend
    sed -i '' '/const resend = new Resend(Deno.env.get("RESEND_API_KEY"));/d' "$file"
    
    # Substituir verificação da API key
    sed -i '' 's/const resendApiKey = Deno.env.get("RESEND_API_KEY");/const sendPulseApiKey = Deno.env.get("SENDPULSE_API_KEY");\n  const sendPulseApiSecret = Deno.env.get("SENDPULSE_API_SECRET");/g' "$file"
    sed -i '' 's/if (!resendApiKey) {/if (!sendPulseApiKey || !sendPulseApiSecret) {/g' "$file"
    sed -i '' 's/throw new Error("RESEND_API_KEY não configurado");/throw new Error("SENDPULSE_API_KEY e SENDPULSE_API_SECRET devem estar configurados");/g' "$file"
    
    # Substituir chamadas de envio de email
    sed -i '' 's/await resend.emails.send({/await sendPulseClient.sendEmail({/g' "$file"
    sed -i '' 's/from: ".*",/from: "noreply@institutodossonhos.com",\n      from_name: "Dr. Vital",/g' "$file"
    sed -i '' 's/to: \[.*\],/to: email,/g' "$file"
    
    # Substituir tratamento de erro
    sed -i '' 's/const { error } = await/const result = await/g' "$file"
    sed -i '' 's/if (error) {/if (!result.success) {/g' "$file"
    sed -i '' 's/throw new Error(`Erro ao enviar email: ${error.message}`);/throw new Error(`Erro ao enviar email: ${result.error}`);/g' "$file"
    
    # Substituir logs
    sed -i '' 's/console.log.*Resend.*/console.log("Email sent successfully via SendPulse:", result);/g' "$file"
}

# Atualizar todas as funções
echo "🔧 Atualizando funções Supabase..."

# Lista de arquivos para atualizar
files=(
    "supabase/functions/generate-weight-report/index.ts"
    "supabase/functions/goal-notifications/index.ts"
    "supabase/functions/send-session-notifications/index.ts"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        update_file "$file"
        echo "✅ $file atualizado"
    else
        echo "⚠️  $file não encontrado"
    fi
done

# Atualizar variáveis de ambiente
echo "🔑 Atualizando variáveis de ambiente..."

# Criar arquivo .env.example atualizado
cat > .env.example << EOF
# SendPulse Configuration
SENDPULSE_API_KEY=your_sendpulse_api_key_here
SENDPULSE_API_SECRET=your_sendpulse_api_secret_here

# Outras configurações...
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
EOF

echo "📝 Criado .env.example com configurações SendPulse"

# Verificar se há referências restantes ao Resend
echo "🔍 Verificando referências restantes ao Resend..."
grep -r "resend" supabase/functions/ --ignore-case || echo "✅ Nenhuma referência ao Resend encontrada"

echo "✅ Migração concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure SENDPULSE_API_KEY e SENDPULSE_API_SECRET no Supabase"
echo "2. Teste o envio de emails"
echo "3. Remova RESEND_API_KEY das variáveis de ambiente"
echo "4. Deploy das funções atualizadas"
echo ""
echo "📚 Consulte MIGRACAO_SENDPULSE_GUIDE.md para mais detalhes" 