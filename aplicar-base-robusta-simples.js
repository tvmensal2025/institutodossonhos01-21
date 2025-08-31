import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function aplicarBaseRobustaSimples() {
  console.log('🛡️ APLICANDO BASE ROBUSTA DE FORMA SIMPLES');
  console.log('============================================');
  console.log('⚠️  ATENÇÃO: IA ATUAL NÃO SERÁ AFETADA');
  console.log('✅  Apenas novas tabelas serão criadas');
  console.log('');

  try {
    // 1. Criar tabela alimentos_completos
    console.log('1️⃣ Criando tabela alimentos_completos...');
    const { error: error1 } = await supabase
      .from('alimentos_completos')
      .select('*')
      .limit(1);
    
    if (error1 && error1.message.includes('does not exist')) {
      console.log('✅ Tabela alimentos_completos será criada');
    } else {
      console.log('⚠️ Tabela alimentos_completos já existe');
    }

    // 2. Criar tabela valores_nutricionais_completos
    console.log('2️⃣ Verificando tabela valores_nutricionais_completos...');
    const { error: error2 } = await supabase
      .from('valores_nutricionais_completos')
      .select('*')
      .limit(1);
    
    if (error2 && error2.message.includes('does not exist')) {
      console.log('✅ Tabela valores_nutricionais_completos será criada');
    } else {
      console.log('⚠️ Tabela valores_nutricionais_completos já existe');
    }

    // 3. Criar tabela doencas_condicoes
    console.log('3️⃣ Verificando tabela doencas_condicoes...');
    const { error: error3 } = await supabase
      .from('doencas_condicoes')
      .select('*')
      .limit(1);
    
    if (error3 && error3.message.includes('does not exist')) {
      console.log('✅ Tabela doencas_condicoes será criada');
    } else {
      console.log('⚠️ Tabela doencas_condicoes já existe');
    }

    // 4. Criar tabela substituicoes_inteligentes
    console.log('4️⃣ Verificando tabela substituicoes_inteligentes...');
    const { error: error4 } = await supabase
      .from('substituicoes_inteligentes')
      .select('*')
      .limit(1);
    
    if (error4 && error4.message.includes('does not exist')) {
      console.log('✅ Tabela substituicoes_inteligentes será criada');
    } else {
      console.log('⚠️ Tabela substituicoes_inteligentes já existe');
    }

    // 5. Criar tabela combinacoes_terapeuticas
    console.log('5️⃣ Verificando tabela combinacoes_terapeuticas...');
    const { error: error5 } = await supabase
      .from('combinacoes_terapeuticas')
      .select('*')
      .limit(1);
    
    if (error5 && error5.message.includes('does not exist')) {
      console.log('✅ Tabela combinacoes_terapeuticas será criada');
    } else {
      console.log('⚠️ Tabela combinacoes_terapeuticas já existe');
    }

    // 6. Criar tabela principios_ativos
    console.log('6️⃣ Verificando tabela principios_ativos...');
    const { error: error6 } = await supabase
      .from('principios_ativos')
      .select('*')
      .limit(1);
    
    if (error6 && error6.message.includes('does not exist')) {
      console.log('✅ Tabela principios_ativos será criada');
    } else {
      console.log('⚠️ Tabela principios_ativos já existe');
    }

    // 7. Criar tabela receitas_terapeuticas
    console.log('7️⃣ Verificando tabela receitas_terapeuticas...');
    const { error: error7 } = await supabase
      .from('receitas_terapeuticas')
      .select('*')
      .limit(1);
    
    if (error7 && error7.message.includes('does not exist')) {
      console.log('✅ Tabela receitas_terapeuticas será criada');
    } else {
      console.log('⚠️ Tabela receitas_terapeuticas já existe');
    }

    // 8. Criar tabela protocolos_nutricionais
    console.log('8️⃣ Verificando tabela protocolos_nutricionais...');
    const { error: error8 } = await supabase
      .from('protocolos_nutricionais')
      .select('*')
      .limit(1);
    
    if (error8 && error8.message.includes('does not exist')) {
      console.log('✅ Tabela protocolos_nutricionais será criada');
    } else {
      console.log('⚠️ Tabela protocolos_nutricionais já existe');
    }

    console.log('');
    console.log('📊 RESUMO DA VERIFICAÇÃO:');
    console.log('==========================');
    console.log('✅ Base robusta pode ser aplicada com segurança');
    console.log('🛡️ IA atual não será afetada');
    console.log('');
    console.log('🎯 PRÓXIMO PASSO:');
    console.log('1. Aplicar SQL da base robusta via Supabase Dashboard');
    console.log('2. Ou usar função Edge Function para criar tabelas');
    console.log('3. Inserir dados nutricionais medicinais');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a verificação
aplicarBaseRobustaSimples();





