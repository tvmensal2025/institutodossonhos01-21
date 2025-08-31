#!/bin/bash

echo "🚀 Iniciando deploy do projeto..."

# Build do projeto
echo "📦 Fazendo build de produção..."
npm run build

# Verificar se o build foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso!"
    
    # Criar arquivo de deploy para Netlify
    echo "🌐 Configurando para deploy..."
    cat > dist/_redirects << EOF
/*    /index.html   200
EOF
    
    echo "📁 Arquivos prontos para deploy:"
    echo "   - Local: http://localhost:4173/"
    echo "   - Rede: http://192.168.15.5:4173/"
    echo ""
    echo "🎯 Para fazer deploy:"
    echo "   1. Vá para https://app.netlify.com/"
    echo "   2. Arraste a pasta 'dist' para o deploy"
    echo "   3. Ou use: npx netlify-cli deploy --dir=dist --prod"
    echo ""
    echo "📊 Build finalizado em: $(date)"
    echo "📁 Pasta dist contém: $(ls -la dist/ | wc -l) arquivos"
    
else
    echo "❌ Erro no build!"
    exit 1
fi 