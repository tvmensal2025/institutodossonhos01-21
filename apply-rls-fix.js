import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyRLSFix() {
  console.log('🔧 Aplicando correção RLS...\n');

  try {
    // 1. Verificar se RLS está ativo
    console.log('1. Verificando RLS...');
    const { data: rlsCheck, error: rlsError } = await supabase
      .rpc('check_rls_status', { table_name: 'ai_configurations' });

    if (rlsError) {
      console.log('RLS está ativo, aplicando correção...');
    }

    // 2. Aplicar correção RLS via função
    console.log('2. Aplicando políticas RLS...');
    const { error: policyError } = await supabase
      .rpc('fix_ai_configurations_rls');

    if (policyError) {
      console.log('Tentando método alternativo...');
      
      // Método alternativo: inserir diretamente
      const testConfig = {
        functionality: 'test_config',
        service: 'openai',
        model: 'gpt-4',
        max_tokens: 4096,
        temperature: 0.8,
        is_enabled: false
      };

      const { error: insertError } = await supabase
        .from('ai_configurations')
        .insert(testConfig);

      if (insertError) {
        console.error('❌ Erro ao inserir teste:', insertError);
        console.log('💡 Solução: Execute o script SQL manualmente no Supabase Dashboard');
        console.log('   - Vá para SQL Editor no Supabase');
        console.log('   - Execute o arquivo fix-rls-ai-configs.sql');
      } else {
        console.log('✅ Inserção de teste funcionou!');
        
        // Limpar teste
        await supabase
          .from('ai_configurations')
          .delete()
          .eq('functionality', 'test_config');
      }
    } else {
      console.log('✅ Políticas RLS aplicadas com sucesso!');
    }

  } catch (error) {
    console.error('❌ Erro ao aplicar RLS:', error);
    console.log('\n💡 SOLUÇÃO MANUAL:');
    console.log('1. Acesse o Supabase Dashboard');
    console.log('2. Vá para SQL Editor');
    console.log('3. Execute o conteúdo do arquivo fix-rls-ai-configs.sql');
  }
}

// Executar correção
applyRLSFix(); 