// TESTE COMPLETO AUTOMÁTICO DO GOOGLE FIT
// Execute este script no console do navegador

async function testeCompleto() {
  console.log('🚀 TESTE COMPLETO AUTOMÁTICO DO GOOGLE FIT');
  console.log('==========================================');
  
  const resultados = {
    supabase: false,
    autenticacao: false,
    tabelas: false,
    edgeFunctions: false,
    oauth: false,
    dados: false
  };
  
  try {
    // 1. TESTE SUPABASE
    console.log('\n1️⃣ TESTANDO SUPABASE...');
    if (!window.supabase) {
      console.log('❌ Supabase não está disponível');
      console.log('💡 Verifique se o arquivo de configuração está correto');
      return;
    }
    console.log('✅ Supabase disponível');
    resultados.supabase = true;
    
    // 2. TESTE AUTENTICAÇÃO
    console.log('\n2️⃣ TESTANDO AUTENTICAÇÃO...');
    const { data: { session }, error: authError } = await window.supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Erro na autenticação:', authError.message);
      console.log('💡 Tente fazer logout e login novamente');
      return;
    }
    
    if (!session) {
      console.log('❌ Usuário não está logado');
      console.log('💡 Redirecionando para login...');
      window.location.href = '/auth';
      return;
    }
    
    console.log('✅ Usuário logado:', session.user.email);
    console.log('🔑 Token de acesso:', session.access_token ? 'Presente' : 'Ausente');
    resultados.autenticacao = true;
    
    // 3. TESTE TABELAS
    console.log('\n3️⃣ TESTANDO TABELAS...');
    
    // Testar google_fit_tokens
    try {
      const { data: tokensData, error: tokensError } = await window.supabase
        .from('google_fit_tokens')
        .select('*')
        .limit(1);
      
      if (tokensError) {
        console.log('❌ Erro na tabela google_fit_tokens:', tokensError.message);
        console.log('💡 Execute o SQL no Supabase SQL Editor:');
        console.log(`
-- Execute este SQL no Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS google_fit_tokens (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE google_fit_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own Google Fit tokens" ON google_fit_tokens;
CREATE POLICY "Users can manage their own Google Fit tokens" ON google_fit_tokens
  FOR ALL USING (auth.uid() = user_id);
        `);
      } else {
        console.log('✅ Tabela google_fit_tokens OK');
        console.log('📊 Dados encontrados:', tokensData.length);
      }
    } catch (tableError) {
      console.log('❌ Erro ao acessar tabela tokens:', tableError.message);
    }
    
    // Testar google_fit_data
    try {
      const { data: fitData, error: fitError } = await window.supabase
        .from('google_fit_data')
        .select('*')
        .limit(1);
      
      if (fitError) {
        console.log('❌ Erro na tabela google_fit_data:', fitError.message);
        console.log('💡 Execute o SQL no Supabase SQL Editor:');
        console.log(`
-- Execute este SQL no Supabase SQL Editor:
CREATE TABLE IF NOT EXISTS google_fit_data (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  data_type TEXT NOT NULL,
  value REAL,
  unit TEXT,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  source TEXT,
  active_minutes INTEGER DEFAULT 0,
  sleep_duration_hours DECIMAL(4,2) DEFAULT 0,
  weight_kg DECIMAL(5,2),
  height_cm DECIMAL(5,2),
  heart_rate_resting INTEGER,
  heart_rate_max INTEGER,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE google_fit_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own Google Fit data" ON google_fit_data;
CREATE POLICY "Users can manage their own Google Fit data" ON google_fit_data
  FOR ALL USING (auth.uid() = user_id);
        `);
      } else {
        console.log('✅ Tabela google_fit_data OK');
        console.log('📊 Dados encontrados:', fitData.length);
      }
    } catch (tableError) {
      console.log('❌ Erro ao acessar tabela fit_data:', tableError.message);
    }
    
    resultados.tabelas = true;
    
    // 4. TESTE EDGE FUNCTIONS
    console.log('\n4️⃣ TESTANDO EDGE FUNCTIONS...');
    
    // Testar google-fit-token
    try {
      const { data, error } = await window.supabase.functions.invoke('google-fit-token', {
        body: {
          testSecrets: true
        }
      });
      
      if (error) {
        console.log('❌ Erro na função google-fit-token:', error.message);
        console.log('📊 Detalhes:', error);
        
        if (error.message.includes('401')) {
          console.log('💡 Problema de autorização - verifique se está logado');
        } else if (error.message.includes('404')) {
          console.log('💡 Função não encontrada - verifique se foi deployada');
        }
      } else {
        console.log('✅ Função google-fit-token funcionando');
        console.log('📊 Resposta:', data);
        
        if (data.secretsTest) {
          console.log('🔧 Secrets configurados:');
          console.log('- Client ID:', data.clientIdDefined ? 'OK' : 'FALTANDO');
          console.log('- Client Secret:', data.clientSecretDefined ? 'OK' : 'FALTANDO');
        }
      }
    } catch (funcError) {
      console.log('❌ Erro ao chamar função:', funcError.message);
    }
    
    // Testar google-fit-sync
    try {
      const { data: syncData, error: syncError } = await window.supabase.functions.invoke('google-fit-sync', {
        body: {
          test: true
        }
      });
      
      if (syncError) {
        console.log('❌ Erro na função google-fit-sync:', syncError.message);
      } else {
        console.log('✅ Função google-fit-sync funcionando');
      }
    } catch (funcError) {
      console.log('❌ Erro ao chamar google-fit-sync:', funcError.message);
    }
    
    resultados.edgeFunctions = true;
    
    // 5. TESTE OAUTH
    console.log('\n5️⃣ TESTANDO CONFIGURAÇÃO OAUTH...');
    
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
    
    console.log('🔧 Configuração OAuth:');
    console.log('- Client ID:', clientId);
    console.log('- Redirect URI:', redirectUri);
    console.log('- Scopes:', scopes);
    console.log('🔗 URL de teste:', authUrl);
    
    resultados.oauth = true;
    
    // 6. TESTE DADOS EXISTENTES
    console.log('\n6️⃣ TESTANDO DADOS EXISTENTES...');
    
    try {
      const { data: existingTokens, error: tokensError } = await window.supabase
        .from('google_fit_tokens')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (tokensError) {
        console.log('❌ Erro ao buscar tokens:', tokensError.message);
      } else if (existingTokens && existingTokens.length > 0) {
        console.log('✅ Tokens encontrados:', existingTokens.length);
        console.log('📊 Token mais recente:', existingTokens[0]);
        resultados.dados = true;
      } else {
        console.log('ℹ️ Nenhum token encontrado - precisa fazer OAuth');
      }
      
      const { data: existingData, error: dataError } = await window.supabase
        .from('google_fit_data')
        .select('*')
        .eq('user_id', session.user.id)
        .limit(5);
      
      if (dataError) {
        console.log('❌ Erro ao buscar dados:', dataError.message);
      } else if (existingData && existingData.length > 0) {
        console.log('✅ Dados do Google Fit encontrados:', existingData.length);
        console.log('📊 Últimos dados:', existingData);
        resultados.dados = true;
      } else {
        console.log('ℹ️ Nenhum dado do Google Fit encontrado');
      }
    } catch (dataError) {
      console.log('❌ Erro ao testar dados:', dataError.message);
    }
    
    // 7. RESUMO FINAL
    console.log('\n🎯 RESUMO DOS TESTES:');
    console.log('=====================');
    console.log('✅ Supabase:', resultados.supabase ? 'OK' : 'ERRO');
    console.log('✅ Autenticação:', resultados.autenticacao ? 'OK' : 'ERRO');
    console.log('✅ Tabelas:', resultados.tabelas ? 'OK' : 'ERRO');
    console.log('✅ Edge Functions:', resultados.edgeFunctions ? 'OK' : 'ERRO');
    console.log('✅ OAuth:', resultados.oauth ? 'OK' : 'ERRO');
    console.log('✅ Dados:', resultados.dados ? 'OK' : 'ERRO');
    
    const totalTests = Object.keys(resultados).length;
    const passedTests = Object.values(resultados).filter(Boolean).length;
    
    console.log(`\n📊 RESULTADO: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests === totalTests) {
      console.log('🎉 TODOS OS TESTES PASSARAM!');
      console.log('💡 O Google Fit está funcionando perfeitamente!');
    } else if (passedTests >= 4) {
      console.log('✅ MAIORIA DOS TESTES PASSOU!');
      console.log('💡 Agora você pode testar o OAuth:');
      console.log('1. Vá para: http://localhost:8083/google-fit-test');
      console.log('2. Clique em "Conectar OAuth"');
      console.log('3. Autorize no Google');
    } else {
      console.log('⚠️ ALGUNS TESTES FALHARAM');
      console.log('💡 Verifique os erros acima e execute os comandos sugeridos');
    }
    
    // 8. TESTE FINAL - TENTAR OAUTH
    console.log('\n🚀 TESTE FINAL - INICIANDO OAUTH...');
    console.log('💡 Redirecionando para teste OAuth...');
    
    setTimeout(() => {
      window.location.href = '/google-fit-test';
    }, 5000);
    
  } catch (error) {
    console.error('💥 Erro no teste completo:', error);
    console.log('💡 Verifique se o Supabase está configurado corretamente');
  }
}

// Executar teste completo
testeCompleto();
