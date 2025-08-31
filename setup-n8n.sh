#!/bin/bash

# 🤖 Script de Instalação e Configuração n8n
# 📊 Relatório Semanal WhatsApp - Instituto dos Sonhos

echo "🚀 Iniciando instalação do n8n..."

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Instalando..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js já instalado: $(node --version)"
fi

# Verificar se npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm não encontrado. Instalando..."
    sudo apt-get install -y npm
else
    echo "✅ npm já instalado: $(npm --version)"
fi

# Instalar n8n globalmente
echo "📦 Instalando n8n..."
sudo npm install -g n8n

# Criar diretório para o projeto
echo "📁 Criando diretório do projeto..."
mkdir -p ~/n8n-relatorio-semanal
cd ~/n8n-relatorio-semanal

# Copiar arquivos de configuração
echo "📋 Copiando arquivos de configuração..."
cp n8n-workflow-config.json ~/n8n-relatorio-semanal/
cp n8n-env-variables.env ~/n8n-relatorio-semanal/

# Criar arquivo .env
echo "🔧 Configurando variáveis de ambiente..."
cat > ~/n8n-relatorio-semanal/.env << EOF
# Configurações FTP Hostgator
FTP_HOST=ftp.institutodossonhos.com.br
FTP_USERNAME=seu_usuario_ftp
FTP_PASSWORD=sua_senha_ftp
FTP_PORT=21
FTP_PATH=/public_html/

# Configurações WhatsApp
WHATSAPP_NUMBER=+5511999999999
WHATSAPP_TOKEN=seu_token_whatsapp

# Configurações Email
ADMIN_EMAIL=admin@institutodossonhos.com.br
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASSWORD=sua_senha_app

# Configurações n8n
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=senha_admin
N8N_ENCRYPTION_KEY=sua_chave_n8n
N8N_HOST=localhost
N8N_PORT=5678
N8N_PROTOCOL=http
EOF

# Criar script de inicialização
echo "🚀 Criando script de inicialização..."
cat > ~/n8n-relatorio-semanal/start-n8n.sh << 'EOF'
#!/bin/bash

echo "🤖 Iniciando n8n..."
echo "📊 Relatório Semanal WhatsApp"
echo "🌐 Acesse: http://localhost:5678"
echo "👤 Usuário: admin"
echo "🔑 Senha: senha_admin"

# Carregar variáveis de ambiente
source .env

# Iniciar n8n
n8n start
EOF

chmod +x ~/n8n-relatorio-semanal/start-n8n.sh

# Criar script de teste
echo "🧪 Criando script de teste..."
cat > ~/n8n-relatorio-semanal/test-workflow.sh << 'EOF'
#!/bin/bash

echo "🧪 Testando workflow..."

# Testar conexão com Supabase
echo "🌐 Testando conexão com Supabase..."
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI" \
  -d '{
    "testMode": true,
    "testEmail": "tvmensal2025@gmail.com",
    "testUserName": "Sirlene Correa",
    "returnHTML": true
  }' \
  https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/weekly-health-report

echo ""
echo "✅ Teste concluído!"
EOF

chmod +x ~/n8n-relatorio-semanal/test-workflow.sh

# Criar service do systemd (opcional)
echo "🔧 Criando service do systemd..."
sudo tee /etc/systemd/system/n8n.service > /dev/null << EOF
[Unit]
Description=n8n Workflow Automation
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/n8n-relatorio-semanal
Environment=NODE_ENV=production
ExecStart=/usr/bin/n8n start
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Habilitar e iniciar service
echo "🚀 Habilitando service..."
sudo systemctl daemon-reload
sudo systemctl enable n8n
sudo systemctl start n8n

echo ""
echo "🎉 Instalação concluída!"
echo ""
echo "📋 Próximos passos:"
echo "1. 🔧 Editar arquivo .env com suas credenciais"
echo "2. 🌐 Acessar: http://localhost:5678"
echo "3. 👤 Login: admin / senha_admin"
echo "4. 📊 Importar workflow: n8n-workflow-config.json"
echo "5. 🧪 Testar: ./test-workflow.sh"
echo "6. 🚀 Ativar workflow no n8n"
echo ""
echo "📁 Arquivos criados em: ~/n8n-relatorio-semanal/"
echo "🔧 Service: sudo systemctl status n8n"
echo "📱 WhatsApp: Configure suas credenciais no .env"
echo ""
echo "✅ Tudo pronto para automatizar o relatório semanal!"













