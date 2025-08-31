import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarDesafioJejum() {
  console.log('🔍 Verificando Desafio de Jejum\n');

  try {
    // 1. Buscar todos os desafios
    console.log('1. Buscando todos os desafios...');
    const { data: allChallenges, error: challengesError } = await supabase
      .from('challenges')
      .select('*')
      .order('created_at', { ascending: false });

    if (challengesError) {
      console.error('❌ Erro ao buscar desafios:', challengesError);
      return;
    }

    console.log(`✅ Encontrados ${allChallenges.length} desafios no total\n`);

    // 2. Filtrar desafios de jejum
    const jejumChallenges = allChallenges.filter(challenge => 
      challenge.category === 'jejum' || 
      challenge.title.toLowerCase().includes('jejum') ||
      challenge.description.toLowerCase().includes('jejum')
    );

    console.log(`2. Desafios de jejum encontrados: ${jejumChallenges.length}`);
    
    if (jejumChallenges.length === 0) {
      console.log('⚠️ Nenhum desafio de jejum encontrado!');
      console.log('\n3. Criando desafio de jejum...');
      
      // Criar desafio de jejum
      const { data: newJejumChallenge, error: createError } = await supabase
        .from('challenges')
        .insert({
          title: 'Jejum Intermitente',
          description: 'Faça jejum de 16 horas por dia por uma semana',
          category: 'jejum',
          difficulty: 'medio',
          duration_days: 7,
          points_reward: 120,
          badge_icon: '⏰',
          badge_name: 'Mestre do Jejum',
          instructions: 'Faça jejum de 16 horas por dia. Por exemplo: jante às 20h e só coma novamente às 12h do dia seguinte.',
          tips: ['Beba muita água durante o jejum', 'Mantenha-se ocupado para não pensar na comida', 'Comece gradualmente'],
          is_active: true,
          is_featured: false,
          is_group_challenge: false,
          daily_log_target: 16,
          daily_log_unit: 'horas'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar desafio de jejum:', createError);
        return;
      }

      console.log('✅ Desafio de jejum criado com sucesso!');
      console.log(`📊 ID: ${newJejumChallenge.id}`);
      console.log(`📝 Título: ${newJejumChallenge.title}`);
    } else {
      console.log('\n3. Detalhes dos desafios de jejum:');
      jejumChallenges.forEach((challenge, index) => {
        console.log(`   ${index + 1}. ID: ${challenge.id}`);
        console.log(`      Título: ${challenge.title}`);
        console.log(`      Categoria: ${challenge.category}`);
        console.log(`      Ativo: ${challenge.is_active ? 'Sim' : 'Não'}`);
        console.log(`      Criado em: ${challenge.created_at}`);
        console.log(`      Meta: ${challenge.daily_log_target} ${challenge.daily_log_unit}`);
        console.log('');
      });
    }

    // 4. Verificar desafios ativos
    console.log('4. Verificando desafios ativos...');
    const { data: activeChallenges, error: activeError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true);

    if (activeError) {
      console.error('❌ Erro ao buscar desafios ativos:', activeError);
      return;
    }

    console.log(`✅ Encontrados ${activeChallenges.length} desafios ativos`);
    
    const activeJejumChallenges = activeChallenges.filter(challenge => 
      challenge.category === 'jejum' || 
      challenge.title.toLowerCase().includes('jejum')
    );

    console.log(`📊 Desafios de jejum ativos: ${activeJejumChallenges.length}`);

    // 5. Verificar participações do usuário
    const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';
    console.log('\n5. Verificando participações do usuário...');
    
    const { data: userParticipations, error: participationsError } = await supabase
      .from('challenge_participations')
      .select('*, challenges(*)')
      .eq('user_id', userId);

    if (participationsError) {
      console.error('❌ Erro ao buscar participações:', participationsError);
      return;
    }

    console.log(`✅ Usuário tem ${userParticipations.length} participações`);
    
    const jejumParticipations = userParticipations.filter(p => 
      p.challenges.category === 'jejum' || 
      p.challenges.title.toLowerCase().includes('jejum')
    );

    console.log(`📊 Participações em desafios de jejum: ${jejumParticipations.length}`);

    if (jejumParticipations.length === 0 && activeJejumChallenges.length > 0) {
      console.log('\n6. Criando participação em desafio de jejum...');
      
      const jejumChallenge = activeJejumChallenges[0];
      const { data: newParticipation, error: participationError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: userId,
          challenge_id: jejumChallenge.id,
          target_value: jejumChallenge.daily_log_target,
          progress: 0,
          started_at: new Date().toISOString()
        })
        .select()
        .single();

      if (participationError) {
        console.error('❌ Erro ao criar participação:', participationError);
        return;
      }

      console.log('✅ Participação em desafio de jejum criada!');
      console.log(`📊 ID da participação: ${newParticipation.id}`);
    }

    // 6. Resumo final
    console.log('\n🎯 RESUMO FINAL:');
    console.log(`   - Total de desafios: ${allChallenges.length}`);
    console.log(`   - Desafios ativos: ${activeChallenges.length}`);
    console.log(`   - Desafios de jejum: ${jejumChallenges.length}`);
    console.log(`   - Desafios de jejum ativos: ${activeJejumChallenges.length}`);
    console.log(`   - Participações do usuário: ${userParticipations.length}`);
    console.log(`   - Participações em jejum: ${jejumParticipations.length}`);

    if (activeJejumChallenges.length === 0) {
      console.log('\n⚠️ PROBLEMA: Não há desafios de jejum ativos!');
      console.log('💡 SOLUÇÃO: Criar um desafio de jejum ativo');
    } else if (jejumParticipations.length === 0) {
      console.log('\n⚠️ PROBLEMA: Usuário não participa de desafios de jejum!');
      console.log('💡 SOLUÇÃO: Criar participação em desafio de jejum');
    } else {
      console.log('\n✅ TUDO OK: Desafio de jejum está disponível para o usuário!');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar o teste
verificarDesafioJejum(); 