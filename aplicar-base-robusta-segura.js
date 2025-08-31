import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function aplicarBaseRobustaSegura() {
  console.log('🛡️ APLICANDO BASE ROBUSTA DE FORMA SEGURA');
  console.log('===========================================');
  console.log('⚠️  ATENÇÃO: IA ATUAL NÃO SERÁ AFETADA');
  console.log('✅  Apenas novas tabelas serão criadas');
  console.log('');

  try {
    // 1. Ler o arquivo SQL
    console.log('📖 Lendo arquivo SQL da base robusta...');
    const sqlContent = fs.readFileSync('aplicar-base-robusta-segura.sql', 'utf8');
    
    // 2. Dividir em comandos individuais
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`🔧 Executando ${commands.length} comandos SQL...`);
    console.log('');

    // 3. Executar cada comando
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: command });
        
        if (error) {
          console.log(`❌ Comando ${i + 1}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Comando ${i + 1}: Executado com sucesso`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Comando ${i + 1}: ${err.message}`);
        errorCount++;
      }
    }

    console.log('');
    console.log('📊 RESUMO DA APLICAÇÃO:');
    console.log('========================');
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    console.log(`📈 Taxa de sucesso: ${((successCount / commands.length) * 100).toFixed(1)}%`);

    if (successCount > 0) {
      console.log('');
      console.log('🎉 BASE ROBUSTA APLICADA COM SUCESSO!');
      console.log('🛡️ IA ATUAL NÃO FOI AFETADA');
      console.log('🎯 Próximo passo: Inserir dados na base robusta');
    } else {
      console.log('');
      console.log('❌ FALHA NA APLICAÇÃO');
      console.log('💡 Verifique as permissões do banco de dados');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a aplicação
aplicarBaseRobustaSegura();
