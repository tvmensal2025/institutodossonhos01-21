// Teste simples de envio de email para Rafael
async function testEmailDirect() {
  try {
    console.log('🚀 Iniciando teste de envio de email...');
    
    const response = await fetch('/api/functions/v1/send-weekly-email-report', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userIds: ['cc294798-5eff-44b2-b88a-af96627e600b'], // Rafael Ferreira
        customMessage: 'Teste do relatório semanal Dr. Vita - dados simulados'
      })
    });

    console.log('📡 Resposta recebida:', response.status);
    
    const result = await response.text();
    console.log('📋 Resultado:', result);
    
    if (response.ok) {
      console.log('✅ Email enviado com sucesso!');
      alert('Email enviado! Verifique a caixa de entrada do Rafael.');
    } else {
      console.error('❌ Erro ao enviar:', result);
      alert('Erro: ' + result);
    }
  } catch (error) {
    console.error('💥 Erro na requisição:', error);
    alert('Erro na requisição: ' + error.message);
  }
}

// Botão para testar
const btn = document.createElement('button');
btn.textContent = '📧 Enviar Relatório para Rafael';
btn.style.cssText = 'padding: 15px 30px; background: #667eea; color: white; border: none; border-radius: 10px; font-size: 16px; cursor: pointer; margin: 20px;';
btn.onclick = testEmailDirect;
document.body.appendChild(btn);

console.log('🎯 Botão de teste adicionado à página!');