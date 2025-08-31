#!/bin/bash

echo "🔍 Verificando status do servidor de desenvolvimento..."

# Verificar se o processo está rodando
if pgrep -f "vite" > /dev/null; then
    echo "✅ Servidor Vite está rodando"
else
    echo "❌ Servidor Vite não está rodando"
    echo "🚀 Iniciando servidor..."
    npm run dev &
    sleep 5
fi

# Verificar se a porta 8080 está respondendo
if curl -s http://localhost:8080 > /dev/null; then
    echo "✅ Servidor respondendo na porta 8080"
else
    echo "❌ Servidor não está respondendo na porta 8080"
fi

# Verificar se a porta 5173 está respondendo
if curl -s http://localhost:5173 > /dev/null; then
    echo "✅ Servidor respondendo na porta 5173"
else
    echo "❌ Servidor não está respondendo na porta 5173"
fi

# Verificar se o dashboard está acessível
if curl -s http://localhost:8080/dashboard > /dev/null; then
    echo "✅ Dashboard acessível em http://localhost:8080/dashboard"
else
    echo "❌ Dashboard não está acessível"
fi

echo ""
echo "🌐 URLs disponíveis:"
echo "   - http://localhost:8080 (porta padrão)"
echo "   - http://localhost:5173 (porta alternativa)"
echo "   - http://localhost:8080/dashboard"
echo "   - http://localhost:8080/auth"
echo ""
echo "💡 Se o servidor não estiver rodando, execute: npm run dev" 