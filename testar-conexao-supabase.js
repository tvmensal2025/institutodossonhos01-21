import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase REMOTO
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarConexaoSupabase() {
  console.log('🧪 Testando conexão com Supabase REMOTO...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.slice(0, 20) + '...');

  try {
    // 1. Testar conexão básica
    console.log('\n1. Testando conexão básica...');
    const { data: testData, error: testError } = await supabase
      .from('challenges')
      .select('count')
      .limit(1);

    if (testError) {
      console.log('❌ Erro na conexão básica:', testError.message);
      return;
    } else {
      console.log('✅ Conexão básica funcionando!');
    }

    // 2. Testar autenticação
    console.log('\n2. Testando autenticação...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.log('❌ Erro na autenticação:', authError.message);
    } else {
      console.log('✅ Autenticação funcionando!');
      console.log('Sessão:', authData.session ? 'Ativa' : 'Inativa');
    }

    // 3. Testar consulta de desafios
    console.log('\n3. Testando consulta de desafios...');
    const { data: desafiosData, error: desafiosError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (desafiosError) {
      console.log('❌ Erro ao consultar desafios:', desafiosError.message);
    } else {
      console.log(`✅ Consulta de desafios funcionando: ${desafiosData.length} desafios`);
      desafiosData.forEach((desafio, index) => {
        console.log(`${index + 1}. ${desafio.title}`);
      });
    }

    console.log('\n🎉 Teste de conexão concluído com sucesso!');
    console.log('📱 Agora teste no dashboard: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar teste
testarConexaoSupabase(); 