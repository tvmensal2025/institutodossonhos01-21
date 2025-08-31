import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase REMOTO
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarSofiaDados() {
  console.log('🔍 VERIFICANDO DADOS NUTRICIONAIS DA SOFIA...');

  try {
    // 1. Verificar alimentos
    console.log('\n1. Verificando alimentos...');
    
    const { data: alimentos, error: alimentosError } = await supabase
      .from('alimentos')
      .select('*')
      .order('id');

    if (alimentosError) {
      console.log('❌ Erro ao consultar alimentos:', alimentosError.message);
    } else {
      console.log(`✅ ${alimentos.length} alimentos encontrados:`);
      alimentos.forEach((alimento, index) => {
        console.log(`   ${index + 1}. ${alimento.nome} (${alimento.categoria})`);
      });
    }

    // 2. Verificar valores nutricionais
    console.log('\n2. Verificando valores nutricionais...');
    
    const { data: valores, error: valoresError } = await supabase
      .from('valores_nutricionais')
      .select('*')
      .order('alimento_id');

    if (valoresError) {
      console.log('❌ Erro ao consultar valores nutricionais:', valoresError.message);
    } else {
      console.log(`✅ ${valores.length} valores nutricionais encontrados:`);
      valores.forEach((valor, index) => {
        console.log(`   ${index + 1}. Alimento ID ${valor.alimento_id}: ${valor.calorias} cal, ${valor.proteina}g prot, ${valor.carboidrato}g carb`);
      });
    }

    // 3. Verificar benefícios por objetivo
    console.log('\n3. Verificando benefícios por objetivo...');
    
    const { data: beneficios, error: beneficiosError } = await supabase
      .from('beneficios_objetivo')
      .select('*')
      .order('alimento_id');

    if (beneficiosError) {
      console.log('❌ Erro ao consultar benefícios:', beneficiosError.message);
    } else {
      console.log(`✅ ${beneficios.length} benefícios encontrados:`);
      beneficios.forEach((beneficio, index) => {
        console.log(`   ${index + 1}. ${beneficio.objetivo}: ${beneficio.beneficio} (Intensidade: ${beneficio.intensidade})`);
      });
    }

    // 4. Verificar contraindicações
    console.log('\n4. Verificando contraindicações...');
    
    const { data: contraindicacoes, error: contraindicacoesError } = await supabase
      .from('contraindicacoes')
      .select('*')
      .order('alimento_id');

    if (contraindicacoesError) {
      console.log('❌ Erro ao consultar contraindicações:', contraindicacoesError.message);
    } else {
      console.log(`✅ ${contraindicacoes.length} contraindicações encontradas:`);
      contraindicacoes.forEach((contra, index) => {
        console.log(`   ${index + 1}. ${contra.tipo}: ${contra.descricao} (Severidade: ${contra.severidade})`);
      });
    }

    // 5. Verificar combinações ideais
    console.log('\n5. Verificando combinações ideais...');
    
    const { data: combinacoes, error: combinacoesError } = await supabase
      .from('combinacoes_ideais')
      .select('*')
      .order('id');

    if (combinacoesError) {
      console.log('❌ Erro ao consultar combinações:', combinacoesError.message);
    } else {
      console.log(`✅ ${combinacoes.length} combinações encontradas:`);
      combinacoes.forEach((combinacao, index) => {
        console.log(`   ${index + 1}. ${combinacao.nome_combinacao}: ${combinacao.beneficio} (Intensidade: ${combinacao.intensidade})`);
      });
    }

    // 6. Verificar substituições
    console.log('\n6. Verificando substituições...');
    
    const { data: substituicoes, error: substituicoesError } = await supabase
      .from('substituicoes')
      .select('*')
      .order('id');

    if (substituicoesError) {
      console.log('❌ Erro ao consultar substituições:', substituicoesError.message);
    } else {
      console.log(`✅ ${substituicoes.length} substituições encontradas:`);
      substituicoes.forEach((substituicao, index) => {
        console.log(`   ${index + 1}. Motivo: ${substituicao.motivo} (Similaridade: ${substituicao.similaridade})`);
      });
    }

    // 7. Verificar preparo e conservação
    console.log('\n7. Verificando preparo e conservação...');
    
    const { data: preparos, error: preparosError } = await supabase
      .from('preparo_conservacao')
      .select('*')
      .order('alimento_id');

    if (preparosError) {
      console.log('❌ Erro ao consultar preparos:', preparosError.message);
    } else {
      console.log(`✅ ${preparos.length} métodos de preparo encontrados:`);
      preparos.forEach((preparo, index) => {
        console.log(`   ${index + 1}. Método: ${preparo.metodo_preparo} (Tempo: ${preparo.tempo_cozimento}min, Conservação: ${preparo.conservacao})`);
      });
    }

    // 8. Resumo final
    console.log('\n📊 RESUMO FINAL:');
    console.log(`🍎 Alimentos: ${alimentos?.length || 0}`);
    console.log(`📊 Valores nutricionais: ${valores?.length || 0}`);
    console.log(`🎯 Benefícios: ${beneficios?.length || 0}`);
    console.log(`⚠️ Contraindicações: ${contraindicacoes?.length || 0}`);
    console.log(`🔗 Combinações: ${combinacoes?.length || 0}`);
    console.log(`🔄 Substituições: ${substituicoes?.length || 0}`);
    console.log(`👨‍🍳 Preparos: ${preparos?.length || 0}`);

    const totalDados = (alimentos?.length || 0) + (valores?.length || 0) + (beneficios?.length || 0) + 
                      (contraindicacoes?.length || 0) + (combinacoes?.length || 0) + 
                      (substituicoes?.length || 0) + (preparos?.length || 0);

    console.log(`\n🎉 TOTAL DE DADOS NUTRICIONAIS: ${totalDados}`);

    if (totalDados > 0) {
      console.log('\n✅ SUCESSO: Base de dados nutricional da SOFIA está funcionando!');
      console.log('📱 Agora teste no dashboard: http://localhost:8081/dashboard');
    } else {
      console.log('\n❌ ATENÇÃO: Nenhum dado nutricional encontrado!');
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar verificação
verificarSofiaDados(); 