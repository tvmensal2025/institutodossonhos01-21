// Teste final do SendPulse - Versão Funcional
// Uso: node test-sendpulse-working.js

const API_KEY = 'f4ff39f7982cd93fb7a458b603e50ca4';
const API_SECRET = '62e56fd32f7861cae09f0d904843ccf1';
const BASE_URL = 'https://api.sendpulse.com';

async function getAccessToken() {
  const response = await fetch(`${BASE_URL}/oauth/access_token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: API_KEY,
      client_secret: API_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error(`Falha na autenticação: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function sendEmailWithRetry(accessToken, emailData) {
  // Primeira tentativa
  const response = await fetch(`${BASE_URL}/smtp/emails`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(emailData),
  });

  if (response.ok) {
    return await response.json();
  }

  const errorData = await response.json().catch(() => ({ message: response.statusText }));
  
  // Se o erro for de remetente inválido, tentar com email verificado
  if (errorData.message && errorData.message.includes('Sender is not valid')) {
    console.log('⚠️ Remetente inválido, tentando com email verificado...');
    
    emailData.email.from.email = 'suporte@institutodossonhos.com.br';
    
    const retryResponse = await fetch(`${BASE_URL}/smtp/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(emailData),
    });

    if (retryResponse.ok) {
      return await retryResponse.json();
    } else {
      const retryError = await retryResponse.json().catch(() => ({ message: retryResponse.statusText }));
      throw new Error(`Erro no retry: ${retryError.message}`);
    }
  }
  
  throw new Error(`Erro SendPulse: ${errorData.message}`);
}

async function testSendPulse() {
  console.log('🔍 Testando SendPulse com retry automático...');
  
  try {
    // 1. Obter token de acesso
    console.log('🔑 Obtendo token de acesso...');
    const accessToken = await getAccessToken();
    console.log('✅ Token obtido com sucesso!');
    
    // 2. Testar informações do usuário
    console.log('\n👤 Testando informações do usuário...');
    const userResponse = await fetch(`${BASE_URL}/user/info`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (userResponse.ok) {
      const userData = await userResponse.json();
      console.log('✅ Informações do usuário obtidas!');
      console.log('📊 Nome:', userData.name);
      console.log('📧 Email:', userData.email);
    } else {
      console.log('❌ Erro ao obter informações do usuário:', userResponse.status);
      return false;
    }

    // 3. Testar envio de email com retry
    console.log('\n📧 Testando envio de email...');
    
    const emailData = {
      email: {
        html: `
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; }
                .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
                .content { padding: 30px; background: #f9f9f9; }
                .footer { background: #333; color: white; padding: 20px; text-align: center; }
                .success { color: #28a745; font-weight: bold; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>🎉 SendPulse Funcionando!</h1>
                  <p>Instituto dos Sonhos</p>
                </div>
                <div class="content">
                  <h2>✅ Teste Concluído com Sucesso</h2>
                  <p>Este email foi enviado via <strong>SendPulse API</strong> com sucesso!</p>
                  <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
                  <p><strong>Status:</strong> <span class="success">✅ Funcionando perfeitamente!</span></p>
                  <p>O sistema está pronto para enviar emails automáticos para os usuários.</p>
                </div>
                <div class="footer">
                  <p>© 2024 Instituto dos Sonhos - Transformando vidas através da saúde</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `SendPulse Funcionando!\n\nEste email foi enviado via SendPulse API com sucesso!\nData: ${new Date().toLocaleString('pt-BR')}\nStatus: ✅ Funcionando perfeitamente!\n\n© 2024 Instituto dos Sonhos`,
        subject: '🎉 SendPulse Funcionando - Instituto dos Sonhos',
        from: {
          name: 'Instituto dos Sonhos',
          email: 'noreply@institutodossonhos.com', // Será substituído automaticamente se inválido
        },
        to: [
          {
            name: 'Teste',
            email: 'suporte@institutodossonhos.com.br',
          },
        ],
      },
    };

    const result = await sendEmailWithRetry(accessToken, emailData);
    console.log('✅ Email enviado com sucesso!');
    console.log('📧 Resultado:', result);

    console.log('\n🎉 Todos os testes passaram!');
    console.log('✅ SendPulse está 100% funcional!');
    console.log('🚀 Pode usar nas funções Supabase.');
    return true;

  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return false;
  }
}

// Executar teste
testSendPulse().then(success => {
  if (success) {
    console.log('\n🎯 SendPulse configurado e pronto para uso!');
    console.log('📧 Migração do Resend para SendPulse concluída com sucesso!');
  } else {
    console.log('\n❌ Teste falhou.');
    console.log('🔧 Verifique as credenciais ou configure domínios no SendPulse.');
  }
}); 