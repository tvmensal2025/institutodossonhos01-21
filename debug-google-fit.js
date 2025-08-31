// Debug completo do Google Fit
// Execute este script no console do navegador

async function debugGoogleFit() {
  console.log('🔍 DEBUG COMPLETO DO GOOGLE FIT');
  console.log('================================');
  
  try {
    // 1. Verificar se o Supabase está disponível
    console.log('\n1️⃣ Verificando Supabase...');
    if (!window.supabase) {
      console.log('❌ Supabase não está disponível');
      return;
    }
    console.log('✅ Supabase disponível');
    
    // 2. Verificar autenticação
    console.log('\n2️⃣ Verificando autenticação...');
    const { data: { session }, error: authError } = await window.supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Erro na autenticação:', authError.message);
      return;
    }
    
    if (!session) {
      console.log('❌ Usuário não está logado');
      console.log('💡 Faça login em: http://localhost:8083/auth');
      return;
    }
    
    console.log('✅ Usuário logado:', session.user.email);
    console.log('🔑 Token de acesso:', session.access_token ? 'Presente' : 'Ausente');
    
    // 3. Testar função google-fit-token
    console.log('\n3️⃣ Testando função google-fit-token...');
    try {
      const { data, error } = await window.supabase.functions.invoke('google-fit-token', {
        body: {
          testSecrets: true
        }
      });
      
      if (error) {
        console.log('❌ Erro na função:', error.message);
        console.log('📊 Detalhes do erro:', error);
      } else {
        console.log('✅ Função funcionando:', data);
      }
    } catch (funcError) {
      console.log('❌ Erro ao chamar função:', funcError.message);
    }
    
    // 4. Verificar tabelas
    console.log('\n4️⃣ Verificando tabelas...');
    
    // Tabela google_fit_tokens
    try {
      const { data: tokensData, error: tokensError } = await window.supabase
        .from('google_fit_tokens')
        .select('*')
        .limit(1);
      
      if (tokensError) {
        console.log('❌ Erro na tabela google_fit_tokens:', tokensError.message);
      } else {
        console.log('✅ Tabela google_fit_tokens OK');
        console.log('📊 Dados:', tokensData);
      }
    } catch (tableError) {
      console.log('❌ Erro ao acessar tabela tokens:', tableError.message);
    }
    
    // Tabela google_fit_data
    try {
      const { data: fitData, error: fitError } = await window.supabase
        .from('google_fit_data')
        .select('*')
        .limit(1);
      
      if (fitError) {
        console.log('❌ Erro na tabela google_fit_data:', fitError.message);
      } else {
        console.log('✅ Tabela google_fit_data OK');
        console.log('📊 Dados:', fitData);
      }
    } catch (tableError) {
      console.log('❌ Erro ao acessar tabela fit_data:', tableError.message);
    }
    
    // 5. Testar OAuth URL
    console.log('\n5️⃣ Verificando configuração OAuth...');
    const clientId = '705908448787-so9cco4hkduhmr0lq4ftkng10hjcj1is.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:8083/google-fit-callback';
    const scopes = [
      'https://www.googleapis.com/auth/fitness.activity.read',
      'https://www.googleapis.com/auth/fitness.body.read',
      'https://www.googleapis.com/auth/fitness.heart_rate.read',
      'https://www.googleapis.com/auth/fitness.sleep.read'
    ].join(' ');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${clientId}&` +
      `redirect_uri=${encodeURIComponent(redirectUri)}&` +
      `scope=${encodeURIComponent(scopes)}&` +
      `response_type=code&` +
      `access_type=offline&` +
      `prompt=consent&` +
      `include_granted_scopes=true`;
    
    console.log('🔗 URL de autorização:', authUrl);
    console.log('🔧 Configuração:');
    console.log('- Client ID:', clientId);
    console.log('- Redirect URI:', redirectUri);
    console.log('- Scopes:', scopes);
    
    console.log('\n🎯 RESUMO DO DEBUG:');
    console.log('- Supabase disponível:', !!window.supabase);
    console.log('- Usuário logado:', !!session);
    console.log('- Token de acesso:', !!session?.access_token);
    
    console.log('\n💡 PRÓXIMOS PASSOS:');
    if (session?.access_token) {
      console.log('1. Teste o OAuth em: http://localhost:8083/google-fit-test');
      console.log('2. Clique em "Conectar OAuth"');
      console.log('3. Se der erro, verifique o console para detalhes');
    } else {
      console.log('1. Faça login primeiro em: http://localhost:8083/auth');
      console.log('2. Depois teste o OAuth');
    }
    
  } catch (error) {
    console.error('💥 Erro no debug:', error);
  }
}

// Executar o debug
debugGoogleFit();
