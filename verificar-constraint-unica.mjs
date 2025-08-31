import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarConstraintUnica() {
  console.log('🔍 Verificando constraint única na tabela challenge_participations...\n');

  try {
    // 1. Verificar participações existentes
    console.log('1. Verificando participações existentes...');
    const { data: participations, error: participationsError } = await supabase
      .from('challenge_participations')
      .select('*')
      .order('created_at', { ascending: true });

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
      return;
    }

    console.log(`✅ Encontradas ${participations.length} participações\n`);

    // 2. Verificar se há conflitos de chave única
    const combinacoes = new Map();
    const conflitos = [];

    participations.forEach(participation => {
      const key = `${participation.user_id}-${participation.challenge_id}`;
      
      if (combinacoes.has(key)) {
        conflitos.push({
          key,
          participacao1: combinacoes.get(key),
          participacao2: participation
        });
      } else {
        combinacoes.set(key, participation);
      }
    });

    if (conflitos.length > 0) {
      console.log('⚠️ Conflitos de chave única encontrados:');
      conflitos.forEach(conflito => {
        console.log(`   ${conflito.key}:`);
        console.log(`     Participação 1: ${conflito.participacao1.id} (${conflito.participacao1.created_at})`);
        console.log(`     Participação 2: ${conflito.participacao2.id} (${conflito.participacao2.created_at})`);
      });
    } else {
      console.log('✅ Nenhum conflito de chave única encontrado');
    }

    // 3. Testar inserção de uma nova participação
    console.log('\n2. Testando inserção de nova participação...');
    
    const userId = 'c6a29ad1-65b4-4fcb-bfd1-a61b48cb319e';
    const challengeId = '8e5196df-d576-450e-9f8e-78a6be6b83c9';

    // Verificar se já existe
    const { data: existing, error: checkError } = await supabase
      .from('challenge_participations')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_id', challengeId)
      .maybeSingle();

    if (checkError) {
      console.error('❌ Erro ao verificar participação existente:', checkError);
      return;
    }

    if (existing) {
      console.log('⚠️ Participação já existe, testando inserção duplicada...');
      
      // Tentar inserir duplicata para testar a constraint
      const { data: duplicateTest, error: duplicateError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          target_value: 30,
          progress: 0
        })
        .select();

      if (duplicateError) {
        console.log('✅ Constraint única está funcionando corretamente');
        console.log('📝 Erro esperado:', duplicateError.message);
      } else {
        console.log('⚠️ Constraint única não está funcionando!');
        console.log('📝 Dados inseridos:', duplicateTest);
      }
    } else {
      console.log('✅ Nenhuma participação existente para teste');
    }

    // 4. Verificar estrutura da tabela
    console.log('\n3. Verificando estrutura da tabela...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'challenge_participations')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('❌ Erro ao verificar estrutura da tabela:', tableError);
    } else {
      console.log('📋 Constraints da tabela:');
      tableInfo.forEach(constraint => {
        console.log(`   ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar a verificação
verificarConstraintUnica(); 