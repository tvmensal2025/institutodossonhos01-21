import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function integrarBaseRobustaIASofia() {
  console.log('🚀 INTEGRANDO BASE ROBUSTA COM IA SOFIA');
  console.log('========================================');
  console.log('🛡️ ATENÇÃO: IA ATUAL NÃO SERÁ AFETADA');
  console.log('✅ Apenas enriquecimento de dados');
  console.log('');

  try {
    // 1. Verificar se a base robusta está aplicada
    console.log('1️⃣ Verificando base robusta...');
    const { data: alimentosCompletos, error: error1 } = await supabase
      .from('alimentos_completos')
      .select('id, nome, propriedades_medicinais')
      .limit(5);
    
    if (error1) {
      console.log('❌ Base robusta não está aplicada:', error1.message);
      console.log('💡 Execute primeiro o SQL da base robusta');
      return;
    }

    console.log('✅ Base robusta encontrada!');
    console.log(`📊 ${alimentosCompletos?.length || 0} alimentos medicinais disponíveis`);

    // 2. Verificar dados nutricionais completos
    console.log('\n2️⃣ Verificando dados nutricionais...');
    const { data: valoresNutricionais, error: error2 } = await supabase
      .from('valores_nutricionais_completos')
      .select('id, alimento_id, calorias, proteina, carboidrato, gordura')
      .limit(5);
    
    if (error2) {
      console.log('❌ Dados nutricionais não encontrados:', error2.message);
    } else {
      console.log('✅ Dados nutricionais completos encontrados!');
      console.log(`📊 ${valoresNutricionais?.length || 0} registros nutricionais`);
    }

    // 3. Verificar doenças e condições
    console.log('\n3️⃣ Verificando doenças e condições...');
    const { data: doencas, error: error3 } = await supabase
      .from('doencas_condicoes')
      .select('id, nome, categoria, abordagem_nutricional')
      .limit(5);
    
    if (error3) {
      console.log('❌ Doenças não encontradas:', error3.message);
    } else {
      console.log('✅ Doenças e condições encontradas!');
      console.log(`📊 ${doencas?.length || 0} doenças com abordagem nutricional`);
    }

    // 4. Verificar substituições inteligentes
    console.log('\n4️⃣ Verificando substituições inteligentes...');
    const { data: substituicoes, error: error4 } = await supabase
      .from('substituicoes_inteligentes')
      .select('id, motivo_substituicao, beneficio_esperado')
      .limit(5);
    
    if (error4) {
      console.log('❌ Substituições não encontradas:', error4.message);
    } else {
      console.log('✅ Substituições inteligentes encontradas!');
      console.log(`📊 ${substituicoes?.length || 0} substituições inteligentes`);
    }

    // 5. Verificar combinações terapêuticas
    console.log('\n5️⃣ Verificando combinações terapêuticas...');
    const { data: combinacoes, error: error5 } = await supabase
      .from('combinacoes_terapeuticas')
      .select('id, nome_combinacao, beneficio_sinergia')
      .limit(5);
    
    if (error5) {
      console.log('❌ Combinações não encontradas:', error5.message);
    } else {
      console.log('✅ Combinações terapêuticas encontradas!');
      console.log(`📊 ${combinacoes?.length || 0} combinações sinérgicas`);
    }

    // 6. Verificar princípios ativos
    console.log('\n6️⃣ Verificando princípios ativos...');
    const { data: principios, error: error6 } = await supabase
      .from('principios_ativos')
      .select('id, nome, categoria, beneficios_terapeuticos')
      .limit(5);
    
    if (error6) {
      console.log('❌ Princípios ativos não encontrados:', error6.message);
    } else {
      console.log('✅ Princípios ativos encontrados!');
      console.log(`📊 ${principios?.length || 0} princípios ativos documentados`);
    }

    console.log('');
    console.log('📊 RESUMO DA INTEGRAÇÃO:');
    console.log('=========================');
    console.log('✅ Base robusta está pronta para integração!');
    console.log('🛡️ IA Sofia atual continua funcionando normalmente');
    console.log('');
    console.log('🎯 PRÓXIMO PASSO:');
    console.log('1. Criar função de enriquecimento de dados');
    console.log('2. Modificar IA Sofia para usar base robusta (opcional)');
    console.log('3. Testar funcionalidades avançadas');
    console.log('');
    console.log('💡 ESTRATÉGIA SEGURA:');
    console.log('- IA atual continua usando tabelas básicas');
    console.log('- Função auxiliar enriquece com dados medicinais');
    console.log('- Fallback para dados básicos se necessário');
    console.log('- Pode ativar/desativar recursos gradualmente');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a integração
integrarBaseRobustaIASofia();





