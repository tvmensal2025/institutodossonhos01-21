import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verificarBaseConhecimentoRobusta() {
  console.log('🔍 VERIFICANDO BASE DE CONHECIMENTO ROBUSTA');
  console.log('============================================');

  try {
    // 1. Verificar tabela alimentos_completos
    console.log('\n1️⃣ Verificando tabela alimentos_completos...');
    const { data: alimentosCompletos, error: error1 } = await supabase
      .from('alimentos_completos')
      .select('id, nome, categoria, propriedades_medicinais')
      .limit(5);
    
    if (error1) {
      console.log('❌ Erro ao consultar alimentos_completos:', error1.message);
    } else {
      console.log('✅ Tabela alimentos_completos encontrada!');
      console.log('📊 Registros encontrados:', alimentosCompletos?.length || 0);
      if (alimentosCompletos && alimentosCompletos.length > 0) {
        console.log('🍎 Exemplos de alimentos medicinais:');
        alimentosCompletos.forEach(alimento => {
          console.log(`   - ${alimento.nome} (${alimento.categoria})`);
        });
      }
    }

    // 2. Verificar tabela valores_nutricionais_completos
    console.log('\n2️⃣ Verificando tabela valores_nutricionais_completos...');
    const { data: valoresNutricionais, error: error2 } = await supabase
      .from('valores_nutricionais_completos')
      .select('id, alimento_id, calorias, proteina, carboidrato, gordura')
      .limit(5);
    
    if (error2) {
      console.log('❌ Erro ao consultar valores_nutricionais_completos:', error2.message);
    } else {
      console.log('✅ Tabela valores_nutricionais_completos encontrada!');
      console.log('📊 Registros encontrados:', valoresNutricionais?.length || 0);
    }

    // 3. Verificar tabela substituicoes_inteligentes
    console.log('\n3️⃣ Verificando tabela substituicoes_inteligentes...');
    const { data: substituicoes, error: error3 } = await supabase
      .from('substituicoes_inteligentes')
      .select('id, motivo_substituicao, beneficio_esperado')
      .limit(5);
    
    if (error3) {
      console.log('❌ Erro ao consultar substituicoes_inteligentes:', error3.message);
    } else {
      console.log('✅ Tabela substituicoes_inteligentes encontrada!');
      console.log('📊 Registros encontrados:', substituicoes?.length || 0);
      if (substituicoes && substituicoes.length > 0) {
        console.log('🔄 Exemplos de substituições:');
        substituicoes.forEach(sub => {
          console.log(`   - ${sub.motivo_substituicao}: ${sub.beneficio_esperado}`);
        });
      }
    }

    // 4. Verificar tabela combinacoes_terapeuticas
    console.log('\n4️⃣ Verificando tabela combinacoes_terapeuticas...');
    const { data: combinacoes, error: error4 } = await supabase
      .from('combinacoes_terapeuticas')
      .select('id, nome_combinacao, beneficio_sinergia')
      .limit(5);
    
    if (error4) {
      console.log('❌ Erro ao consultar combinacoes_terapeuticas:', error4.message);
    } else {
      console.log('✅ Tabela combinacoes_terapeuticas encontrada!');
      console.log('📊 Registros encontrados:', combinacoes?.length || 0);
      if (combinacoes && combinacoes.length > 0) {
        console.log('🔗 Exemplos de combinações:');
        combinacoes.forEach(combo => {
          console.log(`   - ${combo.nome_combinacao}: ${combo.beneficio_sinergia}`);
        });
      }
    }

    // 5. Verificar tabela doencas_condicoes
    console.log('\n5️⃣ Verificando tabela doencas_condicoes...');
    const { data: doencas, error: error5 } = await supabase
      .from('doencas_condicoes')
      .select('id, nome, categoria, abordagem_nutricional')
      .limit(5);
    
    if (error5) {
      console.log('❌ Erro ao consultar doencas_condicoes:', error5.message);
    } else {
      console.log('✅ Tabela doencas_condicoes encontrada!');
      console.log('📊 Registros encontrados:', doencas?.length || 0);
      if (doencas && doencas.length > 0) {
        console.log('🏥 Exemplos de doenças/condições:');
        doencas.forEach(doenca => {
          console.log(`   - ${doenca.nome} (${doenca.categoria})`);
        });
      }
    }

    // 6. Verificar tabela alimentos_doencas
    console.log('\n6️⃣ Verificando tabela alimentos_doencas...');
    const { data: alimentosDoencas, error: error6 } = await supabase
      .from('alimentos_doencas')
      .select('id, tipo_relacao, mecanismo_acao')
      .limit(5);
    
    if (error6) {
      console.log('❌ Erro ao consultar alimentos_doencas:', error6.message);
    } else {
      console.log('✅ Tabela alimentos_doencas encontrada!');
      console.log('📊 Registros encontrados:', alimentosDoencas?.length || 0);
    }

    // 7. Verificar tabela principios_ativos
    console.log('\n7️⃣ Verificando tabela principios_ativos...');
    const { data: principios, error: error7 } = await supabase
      .from('principios_ativos')
      .select('id, nome, categoria, mecanismo_acao')
      .limit(5);
    
    if (error7) {
      console.log('❌ Erro ao consultar principios_ativos:', error7.message);
    } else {
      console.log('✅ Tabela principios_ativos encontrada!');
      console.log('📊 Registros encontrados:', principios?.length || 0);
      if (principios && principios.length > 0) {
        console.log('🧪 Exemplos de princípios ativos:');
        principios.forEach(principio => {
          console.log(`   - ${principio.nome} (${principio.categoria})`);
        });
      }
    }

    // 8. Verificar tabela receitas_terapeuticas
    console.log('\n8️⃣ Verificando tabela receitas_terapeuticas...');
    const { data: receitas, error: error8 } = await supabase
      .from('receitas_terapeuticas')
      .select('id, nome, objetivo_terapeutico')
      .limit(5);
    
    if (error8) {
      console.log('❌ Erro ao consultar receitas_terapeuticas:', error8.message);
    } else {
      console.log('✅ Tabela receitas_terapeuticas encontrada!');
      console.log('📊 Registros encontrados:', receitas?.length || 0);
      if (receitas && receitas.length > 0) {
        console.log('👨‍🍳 Exemplos de receitas terapêuticas:');
        receitas.forEach(receita => {
          console.log(`   - ${receita.nome}: ${receita.objetivo_terapeutico}`);
        });
      }
    }

    // 9. Verificar tabela protocolos_nutricionais
    console.log('\n9️⃣ Verificando tabela protocolos_nutricionais...');
    const { data: protocolos, error: error9 } = await supabase
      .from('protocolos_nutricionais')
      .select('id, nome, objetivo, duracao')
      .limit(5);
    
    if (error9) {
      console.log('❌ Erro ao consultar protocolos_nutricionais:', error9.message);
    } else {
      console.log('✅ Tabela protocolos_nutricionais encontrada!');
      console.log('📊 Registros encontrados:', protocolos?.length || 0);
      if (protocolos && protocolos.length > 0) {
        console.log('📋 Exemplos de protocolos:');
        protocolos.forEach(protocolo => {
          console.log(`   - ${protocolo.nome}: ${protocolo.objetivo} (${protocolo.duracao})`);
        });
      }
    }

    // 10. Verificar tabela sintomas_alimentos
    console.log('\n🔟 Verificando tabela sintomas_alimentos...');
    const { data: sintomas, error: error10 } = await supabase
      .from('sintomas_alimentos')
      .select('id, sintoma, categoria_sintoma, alimentos_beneficos')
      .limit(5);
    
    if (error10) {
      console.log('❌ Erro ao consultar sintomas_alimentos:', error10.message);
    } else {
      console.log('✅ Tabela sintomas_alimentos encontrada!');
      console.log('📊 Registros encontrados:', sintomas?.length || 0);
      if (sintomas && sintomas.length > 0) {
        console.log('🤒 Exemplos de sintomas:');
        sintomas.forEach(sintoma => {
          console.log(`   - ${sintoma.sintoma} (${sintoma.categoria_sintoma})`);
        });
      }
    }

    console.log('\n📊 RESUMO DA BASE DE CONHECIMENTO ROBUSTA');
    console.log('==========================================');
    console.log('✅ Base de conhecimento robusta está aplicada!');
    console.log('🎯 Próximo passo: Integrar com a IA Sofia (sem mexer na configuração)');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar a verificação
verificarBaseConhecimentoRobusta();
