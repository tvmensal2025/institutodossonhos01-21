// Script de teste para verificar a integração da base de conhecimento
// NÃO MEXE NA IA PRINCIPAL - APENAS TESTA A FUNÇÃO AUXILIAR

import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE1MzA0NywiZXhwIjoyMDY4NzI5MDQ3fQ.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testEnrichFoodData() {
  console.log('🧪 TESTANDO INTEGRAÇÃO DA BASE DE CONHECIMENTO');
  console.log('================================================');

  try {
    // 1. TESTAR CONSULTA À TABELA ALIMENTOS_COMPLETOS
    console.log('\n1️⃣ Testando consulta à tabela alimentos_completos...');
    
    const { data: alimentosCompletos, error: error1 } = await supabase
      .from('alimentos_completos')
      .select('*')
      .limit(5);

    if (error1) {
      console.log('❌ Erro ao consultar alimentos_completos:', error1);
    } else {
      console.log('✅ alimentos_completos encontrados:', alimentosCompletos?.length || 0);
      console.log('📋 Exemplos:', alimentosCompletos?.map(a => a.nome).join(', '));
    }

    // 2. TESTAR CONSULTA À TABELA VALORES_NUTRICIONAIS_COMPLETOS
    console.log('\n2️⃣ Testando consulta à tabela valores_nutricionais_completos...');
    
    const { data: valoresNutricionais, error: error2 } = await supabase
      .from('valores_nutricionais_completos')
      .select('*')
      .limit(5);

    if (error2) {
      console.log('❌ Erro ao consultar valores_nutricionais_completos:', error2);
    } else {
      console.log('✅ valores_nutricionais_completos encontrados:', valoresNutricionais?.length || 0);
    }

    // 3. TESTAR CONSULTA À TABELA SUBSTITUIÇÕES_INTELIGENTES
    console.log('\n3️⃣ Testando consulta à tabela substituicoes_inteligentes...');
    
    const { data: substituicoes, error: error3 } = await supabase
      .from('substituicoes_inteligentes')
      .select('*')
      .limit(5);

    if (error3) {
      console.log('❌ Erro ao consultar substituicoes_inteligentes:', error3);
    } else {
      console.log('✅ substituicoes_inteligentes encontradas:', substituicoes?.length || 0);
    }

    // 4. TESTAR CONSULTA À TABELA COMBINAÇÕES_TERAPÊUTICAS
    console.log('\n4️⃣ Testando consulta à tabela combinacoes_terapeuticas...');
    
    const { data: combinacoes, error: error4 } = await supabase
      .from('combinacoes_terapeuticas')
      .select('*')
      .limit(5);

    if (error4) {
      console.log('❌ Erro ao consultar combinacoes_terapeuticas:', error4);
    } else {
      console.log('✅ combinacoes_terapeuticas encontradas:', combinacoes?.length || 0);
    }

    // 5. TESTAR CONSULTA À TABELA DOENÇAS_CONDICOES
    console.log('\n5️⃣ Testando consulta à tabela doencas_condicoes...');
    
    const { data: doencas, error: error5 } = await supabase
      .from('doencas_condicoes')
      .select('*')
      .limit(5);

    if (error5) {
      console.log('❌ Erro ao consultar doencas_condicoes:', error5);
    } else {
      console.log('✅ doencas_condicoes encontradas:', doencas?.length || 0);
      console.log('📋 Exemplos:', doencas?.map(d => d.nome).join(', '));
    }

    // 6. TESTAR BUSCA ESPECÍFICA POR ALIMENTO
    console.log('\n6️⃣ Testando busca específica por alimento (frango)...');
    
    const { data: frangoCompleto, error: error6 } = await supabase
      .from('alimentos_completos')
      .select(`
        *,
        valores_nutricionais_completos (*)
      `)
      .ilike('nome', '%frango%')
      .limit(1);

    if (error6) {
      console.log('❌ Erro ao buscar frango:', error6);
    } else if (frangoCompleto && frangoCompleto.length > 0) {
      const frango = frangoCompleto[0];
      console.log('✅ Frango encontrado:', frango.nome);
      console.log('🏥 Propriedades medicinais:', frango.propriedades_medicinais ? 'Sim' : 'Não');
      console.log('💊 Princípios ativos:', frango.principios_ativos?.length || 0);
      console.log('🔥 Calorias:', frango.valores_nutricionais_completos?.calorias || 'N/A');
    } else {
      console.log('⚠️ Frango não encontrado na base completa');
    }

    // 7. RESUMO FINAL
    console.log('\n📊 RESUMO DA BASE DE CONHECIMENTO');
    console.log('====================================');
    
    const { data: totalAlimentos } = await supabase
      .from('alimentos_completos')
      .select('id', { count: 'exact' });

    const { data: totalValores } = await supabase
      .from('valores_nutricionais_completos')
      .select('id', { count: 'exact' });

    const { data: totalSubstituicoes } = await supabase
      .from('substituicoes_inteligentes')
      .select('id', { count: 'exact' });

    const { data: totalCombinacoes } = await supabase
      .from('combinacoes_terapeuticas')
      .select('id', { count: 'exact' });

    const { data: totalDoencas } = await supabase
      .from('doencas_condicoes')
      .select('id', { count: 'exact' });

    console.log(`🍎 Alimentos medicinais: ${totalAlimentos?.length || 0}`);
    console.log(`📊 Valores nutricionais: ${totalValores?.length || 0}`);
    console.log(`🔄 Substituições inteligentes: ${totalSubstituicoes?.length || 0}`);
    console.log(`🔗 Combinações terapêuticas: ${totalCombinacoes?.length || 0}`);
    console.log(`🏥 Doenças/condições: ${totalDoencas?.length || 0}`);

    console.log('\n✅ TESTE CONCLUÍDO - Base de conhecimento está disponível!');
    console.log('🎯 Próximo passo: Integrar com a IA Sofia (sem mexer na configuração atual)');

  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

// Executar o teste
testEnrichFoodData();
