import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuração do Supabase REMOTO
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function executarSofiaDados() {
  console.log('🚀 EXECUTANDO DADOS NUTRICIONAIS DA SOFIA...');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.slice(0, 20) + '...');

  try {
    // 1. Ler o arquivo SQL
    console.log('\n1. Lendo arquivo SQL...');
    const sqlFilePath = path.join(process.cwd(), 'SOFIA_DADOS_NUTRICIONAIS_COMPLETO.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
      console.log('❌ Arquivo SQL não encontrado:', sqlFilePath);
      return;
    }

    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('✅ Arquivo SQL lido com sucesso!');
    console.log('📄 Tamanho:', sqlContent.length, 'caracteres');

    // 2. Dividir o SQL em comandos individuais
    console.log('\n2. Dividindo comandos SQL...');
    const commands = sqlContent
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

    console.log(`✅ ${commands.length} comandos SQL identificados`);

    // 3. Executar comandos em lotes
    console.log('\n3. Executando comandos SQL...');
    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      
      if (command.trim().length === 0) continue;

      try {
        console.log(`\n📝 Executando comando ${i + 1}/${commands.length}...`);
        
        // Executar comando via RPC (função personalizada)
        const { data, error } = await supabase.rpc('exec_sql', {
          sql_command: command
        });

        if (error) {
          console.log(`❌ Erro no comando ${i + 1}:`, error.message);
          errorCount++;
        } else {
          console.log(`✅ Comando ${i + 1} executado com sucesso!`);
          successCount++;
        }

        // Pequena pausa entre comandos
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.log(`❌ Erro geral no comando ${i + 1}:`, error.message);
        errorCount++;
      }
    }

    // 4. Verificar resultados
    console.log('\n4. Verificando resultados...');
    
    // Verificar se as tabelas foram criadas
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['alimentos', 'valores_nutricionais', 'beneficios_objetivo', 'contraindicacoes', 'combinacoes_ideais', 'substituicoes', 'preparo_conservacao']);

    if (tablesError) {
      console.log('❌ Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('✅ Tabelas criadas:', tablesData.length);
      tablesData.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Verificar dados inseridos
    const { data: alimentosData, error: alimentosError } = await supabase
      .from('alimentos')
      .select('count')
      .limit(1);

    if (alimentosError) {
      console.log('❌ Erro ao verificar alimentos:', alimentosError.message);
    } else {
      console.log('✅ Dados de alimentos inseridos!');
    }

    // 5. Resumo final
    console.log('\n🎉 RESUMO DA EXECUÇÃO:');
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    console.log(`📊 Taxa de sucesso: ${((successCount / (successCount + errorCount)) * 100).toFixed(1)}%`);

    if (successCount > errorCount) {
      console.log('\n🎊 SUCESSO: Dados nutricionais da SOFIA implementados!');
      console.log('📱 Agora teste no dashboard: http://localhost:8081/dashboard');
    } else {
      console.log('\n⚠️ ATENÇÃO: Alguns comandos falharam. Verifique os logs acima.');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar implementação
executarSofiaDados(); 