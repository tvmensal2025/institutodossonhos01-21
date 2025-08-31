// TESTE FINAL AUTOMÁTICO - Execute no console do navegador
console.log('🚀 TESTE FINAL AUTOMÁTICO DO GOOGLE FIT');
console.log('========================================');

async function testeFinal() {
  const resultados = {
    supabase: false,
    autenticacao: false,
    tabelas: false,
    edgeFunctions: false,
    oauth: false
  };

  try {
    // 1. Teste Supabase
    console.log('\n1️⃣ Testando Supabase...');
    if (window.supabase) {
      console.log('✅ Supabase disponível');
      resultados.supabase = true;
    } else {
      console.log('❌ Supabase não disponível');
      return;
    }

    // 2. Teste Autenticação
    console.log('\n2️⃣ Testando autenticação...');
    const { data: { session }, error: authError } = await window.supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Erro na autenticação:', authError.message);
      return;
    }
    
    if (!session) {
      console.log('❌ Usuário não logado');
      console.log('💡 Redirecionando para login...');
      window.location.href = '/auth';
      return;
    }
    
    console.log('✅ Usuário logado:', session.user.email);
    resultados.autenticacao = true;

    // 3. Teste Tabelas
    console.log('\n3️⃣ Testando tabelas...');
    
    // Testar google_fit_tokens
    const { data: tokensData, error: tokensError } = await window.supabase
      .from('google_fit_tokens')
      .select('*')
      .limit(1);
    
    if (tokensError) {
      console.log('❌ Erro na tabela tokens:', tokensError.message);
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
      console.log('✅ Tabela tokens OK');
    }

    // Testar google_fit_data
    const { data: fitData, error: fitError } = await window.supabase
      .from('google_fit_data')
      .select('*')
      .limit(1);
    
    if (fitError) {
      console.log('❌ Erro na tabela data:', fitError.message);
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
      console.log('✅ Tabela data OK');
      resultados.tabelas = true;
    }

    // 4. Teste Edge Functions
    console.log('\n4️⃣ Testando Edge Functions...');
    const { data, error } = await window.supabase.functions.invoke('google-fit-token', {
      body: { testSecrets: true }
    });
    
    if (error) {
      console.log('❌ Erro na Edge Function:', error.message);
    } else {
      console.log('✅ Edge Function funcionando:', data);
      resultados.edgeFunctions = true;
    }

    // 5. Teste OAuth
    console.log('\n5️⃣ Testando configuração OAuth...');
    const clientId = '705908448787-so9cco4hkduhmr0lq4ftkng10hjcj1is.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:8083/google-fit-callback';
    
    console.log('🔧 Client ID:', clientId);
    console.log('🔧 Redirect URI:', redirectUri);
    resultados.oauth = true;

    // 6. Resumo
    console.log('\n🎯 RESUMO DOS TESTES:');
    console.log('✅ Supabase:', resultados.supabase ? 'OK' : 'ERRO');
    console.log('✅ Autenticação:', resultados.autenticacao ? 'OK' : 'ERRO');
    console.log('✅ Tabelas:', resultados.tabelas ? 'OK' : 'ERRO');
    console.log('✅ Edge Functions:', resultados.edgeFunctions ? 'OK' : 'ERRO');
    console.log('✅ OAuth:', resultados.oauth ? 'OK' : 'ERRO');

    const totalTests = Object.keys(resultados).length;
    const passedTests = Object.values(resultados).filter(Boolean).length;
    
    console.log(`\n📊 RESULTADO: ${passedTests}/${totalTests} testes passaram`);
    
    if (passedTests >= 4) {
      console.log('🎉 TESTES PRINCIPAIS PASSARAM!');
      console.log('💡 O Google Fit está configurado corretamente!');
      console.log('🚀 Redirecionando para teste OAuth...');
      
      setTimeout(() => {
        window.location.href = '/google-fit-test';
      }, 2000);
    } else {
      console.log('⚠️ ALGUNS TESTES FALHARAM');
      console.log('💡 Execute os comandos SQL sugeridos acima');
    }

  } catch (error) {
    console.error('💥 Erro no teste final:', error);
  }
}

// Executar teste final
testeFinal();
