import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function chamarEdgeFunctionBaseRobusta() {
  console.log('🚀 CHAMANDO EDGE FUNCTION PARA APLICAR BASE ROBUSTA');
  console.log('==================================================');
  console.log('🛡️ ATENÇÃO: IA ATUAL NÃO SERÁ AFETADA');
  console.log('✅ Apenas novas tabelas serão criadas');
  console.log('');

  try {
    // Chamar a Edge Function
    const { data, error } = await supabase.functions.invoke('apply-robust-base', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {}
    });

    if (error) {
      console.log('❌ Erro ao chamar Edge Function:', error.message);
      return;
    }

    console.log('📊 RESULTADO DA APLICAÇÃO:');
    console.log('===========================');
    console.log(`✅ Sucesso: ${data.success}`);
    console.log(`📈 Comandos executados: ${data.successCount}`);
    console.log(`❌ Comandos com erro: ${data.errorCount}`);
    console.log(`📊 Taxa de sucesso: ${data.successRate}%`);
    console.log(`💬 Mensagem: ${data.message}`);

    if (data.errors && data.errors.length > 0) {
      console.log('');
      console.log('❌ ERROS DETALHADOS:');
      data.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log('');
    if (data.success) {
      console.log('🎉 BASE ROBUSTA APLICADA COM SUCESSO!');
      console.log('🛡️ IA ATUAL NÃO FOI AFETADA');
      console.log('🎯 Próximo passo: Inserir dados nutricionais medicinais');
    } else {
      console.log('❌ FALHA NA APLICAÇÃO');
      console.log('💡 Verifique as permissões do banco de dados');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a chamada
chamarEdgeFunctionBaseRobusta();





