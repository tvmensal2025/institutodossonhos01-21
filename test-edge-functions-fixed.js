import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarEdgeFunctionsCorrigidas() {
  console.log('🧪 TESTANDO EDGE FUNCTIONS CORRIGIDAS');
  console.log('=====================================');
  console.log('🌐 Site: web.institutodossonhos.com.br');
  console.log('🗓️ Data:', new Date().toLocaleString('pt-BR'));
  console.log('');

  const testes = [
    {
      nome: 'test-google-fit-config',
      descricao: 'Testa configuração do Google Fit',
      payload: { testMode: true }
    },
    {
      nome: 'google-fit-token', 
      descricao: 'Testa geração de token Google Fit',
      payload: { action: 'test', testMode: true }
    }
  ];

  let sucessos = 0;
  let total = testes.length;

  for (const teste of testes) {
    console.log(`🧪 Testando: ${teste.nome}`);
    console.log(`📝 Descrição: ${teste.descricao}`);
    
    try {
      const { data, error } = await supabase.functions.invoke(teste.nome, {
        body: teste.payload
      });

      if (error) {
        console.log(`❌ Erro na função ${teste.nome}:`, error.message);
      } else {
        console.log(`✅ Função ${teste.nome} funcionando!`);
        if (data) {
          console.log(`📊 Resposta:`, JSON.stringify(data, null, 2));
        }
        sucessos++;
      }
    } catch (err) {
      console.log(`❌ Erro crítico na função ${teste.nome}:`, err.message);
    }
    
    console.log('');
  }

  console.log('📊 RESULTADO FINAL:');
  console.log('==================');
  console.log(`✅ Sucessos: ${sucessos}/${total}`);
  console.log(`📈 Taxa de sucesso: ${((sucessos/total) * 100).toFixed(1)}%`);
  
  if (sucessos === total) {
    console.log('🎉 TODAS AS EDGE FUNCTIONS ESTÃO FUNCIONANDO!');
    console.log('✅ Problema das Edge Functions quebradas RESOLVIDO!');
  } else {
    console.log('⚠️  Algumas Edge Functions ainda precisam de ajustes');
  }

  console.log('');
  console.log('🔧 PRÓXIMOS PASSOS NECESSÁRIOS:');
  console.log('1. ✅ Configurar variáveis de ambiente no Supabase Dashboard');
  console.log('2. ✅ Adicionar URLs do domínio web.institutodossonhos.com.br no Google Cloud');
  console.log('3. ✅ Testar OAuth do Google Fit no site de produção');
  console.log('');
  console.log('📍 CONFIGURAÇÕES ATUALIZADAS PARA:');
  console.log('   🌐 Domínio: web.institutodossonhos.com.br');
  console.log('   📧 Callback: https://web.institutodossonhos.com.br/google-fit-callback');
}

// Executar o teste
testarEdgeFunctionsCorrigidas().catch(console.error);
