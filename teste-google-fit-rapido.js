// Teste rápido para verificar se Google Fit está funcionando
// Execute no console do navegador

console.log('🧪 Testando Google Fit...');

// 1. Verificar se o botão existe
const botaoGoogleFit = document.querySelector('button:contains("CONECTAR GOOGLE FIT")') || 
                      [...document.querySelectorAll('button')].find(btn => 
                        btn.textContent.includes('CONECTAR GOOGLE FIT') || 
                        btn.textContent.includes('GOOGLE FIT')
                      );

if (botaoGoogleFit) {
    console.log('✅ Botão Google Fit encontrado!');
    console.log('Texto do botão:', botaoGoogleFit.textContent);
} else {
    console.log('❌ Botão Google Fit NÃO encontrado');
    console.log('Botões disponíveis:');
    document.querySelectorAll('button').forEach((btn, i) => {
        console.log(`${i}: "${btn.textContent.trim()}"`);
    });
}

// 2. Verificar localStorage para tokens
const accessToken = localStorage.getItem('google_fit_access_token');
const refreshToken = localStorage.getItem('google_fit_refresh_token');

console.log('📱 Status dos tokens:');
console.log('Access Token:', accessToken ? 'PRESENTE' : 'AUSENTE');
console.log('Refresh Token:', refreshToken ? 'PRESENTE' : 'AUSENTE');

// 3. Verificar URL atual
console.log('🌐 URL atual:', window.location.href);

// 4. Testar OAuth URL (sem executar)
const clientId = '705908448787-ndqju36rr7d23no0vqkhqsaqrf5unsmc.apps.googleusercontent.com';
const isLocalhost = window.location.hostname === 'localhost';
const isInstitutoSonhos = window.location.hostname === 'institutodossonhos.com.br';

const redirectUri = isLocalhost 
    ? `http://localhost:${window.location.port}/google-fit-callback`
    : isInstitutoSonhos 
      ? 'https://institutodossonhos.com.br/google-fit-callback'
      : 'https://eb451b44-5d36-4bf7-8628-481a619af74a.lovableproject.com/google-fit-callback';

console.log('🔗 Redirect URI que seria usado:', redirectUri);

// 5. Verificar se está na página certa
const isPesagemPage = window.location.pathname.includes('pesagem') || 
                     window.location.pathname.includes('dashboard') ||
                     document.querySelector('[data-testid="pesagem"]') ||
                     document.querySelector('.pesagem') ||
                     document.body.textContent.includes('PESAGEM');

console.log('📄 Está na página de pesagem?', isPesagemPage ? 'SIM' : 'NÃO');

console.log('\n🎯 RESULTADO DO TESTE:');
if (botaoGoogleFit && isPesagemPage) {
    console.log('🎉 TUDO OK! Botão está na página certa');
    console.log('👆 Clique no botão para testar OAuth');
} else if (botaoGoogleFit) {
    console.log('⚠️ Botão existe mas pode não estar na página certa');
} else {
    console.log('❌ Botão não encontrado - verificar implementação');
}

console.log('\n📋 Próximos passos se o OAuth falhar:');
console.log('1. Verificar se criou OAuth no Google Cloud Console');
console.log('2. Verificar se adicionou todas as URLs de callback');
console.log('3. Verificar variáveis de ambiente no Supabase');
console.log('4. Verificar se executou o SQL para criar tabela google_fit_data');