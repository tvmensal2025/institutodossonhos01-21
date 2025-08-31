import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase REMOTO
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function aplicarSofiaDados() {
  console.log('🚀 APLICANDO DADOS NUTRICIONAIS DA SOFIA...');

  try {
    // 1. Verificar se as tabelas já existem
    console.log('\n1. Verificando tabelas existentes...');
    
    const { data: existingTables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['alimentos', 'valores_nutricionais', 'beneficios_objetivo']);

    if (tablesError) {
      console.log('❌ Erro ao verificar tabelas:', tablesError.message);
    } else {
      console.log('✅ Tabelas existentes:', existingTables.length);
      existingTables.forEach(table => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // 2. Inserir dados de alimentos
    console.log('\n2. Inserindo dados de alimentos...');
    
    const alimentos = [
      {
        nome: 'Frango grelhado',
        nome_cientifico: 'Gallus gallus domesticus',
        nome_ingles: 'Grilled chicken',
        categoria: 'proteina',
        subcategoria: 'ave',
        origem: 'animal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'Sudeste Asiático',
        culinarias: 'brasileira, mediterrânea, asiática'
      },
      {
        nome: 'Salmão',
        nome_cientifico: 'Salmo salar',
        nome_ingles: 'Salmon',
        categoria: 'proteina',
        subcategoria: 'peixe',
        origem: 'animal',
        sazonalidade: 'sempre',
        disponibilidade: 'moderado',
        regiao_origem: 'Atlântico Norte',
        culinarias: 'mediterrânea, japonesa, nórdica'
      },
      {
        nome: 'Ovos',
        nome_cientifico: 'Gallus gallus domesticus',
        nome_ingles: 'Eggs',
        categoria: 'proteina',
        subcategoria: 'ovo',
        origem: 'animal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'Sudeste Asiático',
        culinarias: 'brasileira, mediterrânea, francesa'
      },
      {
        nome: 'Arroz integral',
        nome_cientifico: 'Oryza sativa',
        nome_ingles: 'Brown rice',
        categoria: 'carboidrato',
        subcategoria: 'cereal',
        origem: 'vegetal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'Ásia',
        culinarias: 'brasileira, asiática, mediterrânea'
      },
      {
        nome: 'Batata doce',
        nome_cientifico: 'Ipomoea batatas',
        nome_ingles: 'Sweet potato',
        categoria: 'carboidrato',
        subcategoria: 'tuberculo',
        origem: 'vegetal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'América Central',
        culinarias: 'brasileira, africana, americana'
      },
      {
        nome: 'Aveia',
        nome_cientifico: 'Avena sativa',
        nome_ingles: 'Oats',
        categoria: 'carboidrato',
        subcategoria: 'cereal',
        origem: 'vegetal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'Europa',
        culinarias: 'nórdica, americana, britânica'
      },
      {
        nome: 'Feijão preto',
        nome_cientifico: 'Phaseolus vulgaris',
        nome_ingles: 'Black beans',
        categoria: 'proteina',
        subcategoria: 'leguminosa',
        origem: 'vegetal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'América Central',
        culinarias: 'brasileira, mexicana, caribenha'
      },
      {
        nome: 'Brócolis',
        nome_cientifico: 'Brassica oleracea var. italica',
        nome_ingles: 'Broccoli',
        categoria: 'verdura',
        subcategoria: 'crucifera',
        origem: 'vegetal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'Mediterrâneo',
        culinarias: 'mediterrânea, asiática, moderna'
      },
      {
        nome: 'Espinafre',
        nome_cientifico: 'Spinacia oleracea',
        nome_ingles: 'Spinach',
        categoria: 'verdura',
        subcategoria: 'folhosa',
        origem: 'vegetal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'Pérsia',
        culinarias: 'mediterrânea, indiana, moderna'
      },
      {
        nome: 'Banana',
        nome_cientifico: 'Musa acuminata',
        nome_ingles: 'Banana',
        categoria: 'fruta',
        subcategoria: 'tropical',
        origem: 'vegetal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'Sudeste Asiático',
        culinarias: 'brasileira, tropical, mundial'
      },
      {
        nome: 'Maçã',
        nome_cientifico: 'Malus domestica',
        nome_ingles: 'Apple',
        categoria: 'fruta',
        subcategoria: 'temperada',
        origem: 'vegetal',
        sazonalidade: 'outono',
        disponibilidade: 'facil',
        regiao_origem: 'Ásia Central',
        culinarias: 'mundial, europeia, americana'
      },
      {
        nome: 'Amêndoas',
        nome_cientifico: 'Prunus dulcis',
        nome_ingles: 'Almonds',
        categoria: 'gordura',
        subcategoria: 'oleaginosa',
        origem: 'vegetal',
        sazonalidade: 'sempre',
        disponibilidade: 'facil',
        regiao_origem: 'Mediterrâneo',
        culinarias: 'mediterrânea, árabe, moderna'
      }
    ];

    // Inserir alimentos
    const { data: alimentosData, error: alimentosError } = await supabase
      .from('alimentos')
      .insert(alimentos)
      .select();

    if (alimentosError) {
      console.log('❌ Erro ao inserir alimentos:', alimentosError.message);
    } else {
      console.log(`✅ ${alimentosData.length} alimentos inseridos com sucesso!`);
    }

    // 3. Inserir valores nutricionais
    console.log('\n3. Inserindo valores nutricionais...');
    
    const valoresNutricionais = [
      {
        alimento_id: 1,
        proteina: 31.0,
        carboidrato: 0.0,
        gordura: 3.6,
        gordura_saturada: 1.1,
        gordura_insaturada: 1.2,
        fibras: 0.0,
        calorias: 165,
        indice_glicemico: 0,
        indice_saciedade: 8,
        vitamina_c: 0.0,
        vitamina_b1: 0.1,
        vitamina_b2: 0.2,
        vitamina_b6: 0.6,
        vitamina_b12: 0.3,
        calcio: 15.0,
        ferro: 1.0,
        magnesio: 28.0,
        potassio: 256.0,
        zinco: 1.8,
        omega_3: 0.1,
        omega_6: 0.7,
        pdcaas: 0.92,
        valor_biologico: 79
      },
      {
        alimento_id: 2,
        proteina: 20.0,
        carboidrato: 0.0,
        gordura: 13.0,
        gordura_saturada: 2.5,
        gordura_insaturada: 8.5,
        fibras: 0.0,
        calorias: 208,
        indice_glicemico: 0,
        indice_saciedade: 7,
        vitamina_c: 3.9,
        vitamina_b1: 0.2,
        vitamina_b2: 0.4,
        vitamina_b6: 0.9,
        vitamina_b12: 2.6,
        calcio: 9.0,
        ferro: 0.3,
        magnesio: 27.0,
        potassio: 363.0,
        zinco: 0.4,
        omega_3: 2.3,
        omega_6: 0.4,
        pdcaas: 0.78,
        valor_biologico: 83
      },
      {
        alimento_id: 3,
        proteina: 12.5,
        carboidrato: 0.6,
        gordura: 9.7,
        gordura_saturada: 3.1,
        gordura_insaturada: 5.8,
        fibras: 0.0,
        calorias: 155,
        indice_glicemico: 0,
        indice_saciedade: 9,
        vitamina_c: 0.0,
        vitamina_b1: 0.1,
        vitamina_b2: 0.5,
        vitamina_b6: 0.1,
        vitamina_b12: 1.1,
        calcio: 56.0,
        ferro: 1.8,
        magnesio: 12.0,
        potassio: 138.0,
        zinco: 1.3,
        omega_3: 0.1,
        omega_6: 1.1,
        pdcaas: 1.00,
        valor_biologico: 100
      }
    ];

    const { data: valoresData, error: valoresError } = await supabase
      .from('valores_nutricionais')
      .insert(valoresNutricionais)
      .select();

    if (valoresError) {
      console.log('❌ Erro ao inserir valores nutricionais:', valoresError.message);
    } else {
      console.log(`✅ ${valoresData.length} valores nutricionais inseridos!`);
    }

    // 4. Inserir benefícios por objetivo
    console.log('\n4. Inserindo benefícios por objetivo...');
    
    const beneficios = [
      {
        alimento_id: 1,
        objetivo: 'emagrecimento',
        beneficio: 'Proteína magra que aumenta saciedade',
        descricao: 'A proteína do frango aumenta a saciedade e o gasto energético',
        intensidade: 8,
        evidencia_cientifica: 'forte'
      },
      {
        alimento_id: 1,
        objetivo: 'hipertrofia',
        beneficio: 'Proteína completa para construção muscular',
        descricao: 'Rico em aminoácidos essenciais para síntese proteica',
        intensidade: 9,
        evidencia_cientifica: 'forte'
      },
      {
        alimento_id: 2,
        objetivo: 'saude_cardiovascular',
        beneficio: 'Rico em ômega 3 para saúde do coração',
        descricao: 'Ômega 3 reduz inflamação e melhora saúde cardiovascular',
        intensidade: 9,
        evidencia_cientifica: 'forte'
      },
      {
        alimento_id: 3,
        objetivo: 'hipertrofia',
        beneficio: 'Proteína de referência biológica',
        descricao: 'Proteína com valor biológico 100, padrão de referência',
        intensidade: 10,
        evidencia_cientifica: 'forte'
      }
    ];

    const { data: beneficiosData, error: beneficiosError } = await supabase
      .from('beneficios_objetivo')
      .insert(beneficios)
      .select();

    if (beneficiosError) {
      console.log('❌ Erro ao inserir benefícios:', beneficiosError.message);
    } else {
      console.log(`✅ ${beneficiosData.length} benefícios inseridos!`);
    }

    // 5. Verificar resultados finais
    console.log('\n5. Verificando resultados finais...');
    
    const { data: totalAlimentos, error: totalError } = await supabase
      .from('alimentos')
      .select('count');

    if (totalError) {
      console.log('❌ Erro ao verificar total:', totalError.message);
    } else {
      console.log(`✅ Total de alimentos no banco: ${totalAlimentos.length}`);
    }

    console.log('\n🎉 SUCESSO: Dados nutricionais da SOFIA implementados!');
    console.log('📱 Agora teste no dashboard: http://localhost:8081/dashboard');

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

// Executar implementação
aplicarSofiaDados(); 