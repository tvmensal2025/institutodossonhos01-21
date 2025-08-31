import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function monitorTempoReal() {
  console.log('🔍 MONITORAMENTO EM TEMPO REAL - SISTEMA DE DESAFIOS\n');
  console.log('Pressione Ctrl+C para parar o monitoramento\n');

  const userId = '109a2a65-9e2e-4723-8543-fbbf68bdc085';
  let lastState = null;

  const checkSystem = async () => {
    try {
      // Buscar dados atuais
      const { data: challenges } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      const { data: participations } = await supabase
        .from('challenge_participations')
        .select('*, challenges(*)')
        .eq('user_id', userId);

      // Criar estado atual
      const currentState = {
        timestamp: new Date().toISOString(),
        challenges: challenges?.length || 0,
        participations: participations?.length || 0,
        jejumChallenge: challenges?.find(c => c.category === 'jejum'),
        jejumParticipation: participations?.find(p => p.challenges.category === 'jejum'),
        individuais: challenges?.filter(c => !c.is_group_challenge).length || 0,
        publicos: challenges?.filter(c => c.is_group_challenge).length || 0
      };

      // Verificar mudanças
      if (lastState) {
        const changes = [];
        
        if (currentState.challenges !== lastState.challenges) {
          changes.push(`📊 Desafios: ${lastState.challenges} → ${currentState.challenges}`);
        }
        
        if (currentState.participations !== lastState.participations) {
          changes.push(`👤 Participações: ${lastState.participations} → ${currentState.participations}`);
        }
        
        if (currentState.individuais !== lastState.individuais) {
          changes.push(`🎯 Individuais: ${lastState.individuais} → ${currentState.individuais}`);
        }
        
        if (currentState.publicos !== lastState.publicos) {
          changes.push(`👥 Públicos: ${lastState.publicos} → ${currentState.publicos}`);
        }

        if (changes.length > 0) {
          console.log(`\n🔄 MUDANÇAS DETECTADAS (${new Date().toLocaleTimeString()}):`);
          changes.forEach(change => console.log(`   ${change}`));
        }
      }

      // Mostrar status atual
      console.log(`\n📊 STATUS ATUAL (${new Date().toLocaleTimeString()}):`);
      console.log(`   🎯 Desafios ativos: ${currentState.challenges}`);
      console.log(`   👤 Participações: ${currentState.participations}`);
      console.log(`   🎯 Individuais: ${currentState.individuais}`);
      console.log(`   👥 Públicos: ${currentState.publicos}`);
      
      if (currentState.jejumChallenge) {
        console.log(`   ⏰ Jejum: ${currentState.jejumChallenge.title} (${currentState.jejumParticipation ? 'Participando' : 'Não participando'})`);
      } else {
        console.log(`   ⏰ Jejum: Não encontrado`);
      }

      lastState = currentState;

    } catch (error) {
      console.error('❌ Erro no monitoramento:', error);
    }
  };

  // Verificação inicial
  await checkSystem();

  // Monitoramento contínuo
  const interval = setInterval(checkSystem, 5000); // Verificar a cada 5 segundos

  // Parar monitoramento com Ctrl+C
  process.on('SIGINT', () => {
    console.log('\n🛑 Monitoramento parado pelo usuário');
    clearInterval(interval);
    process.exit(0);
  });
}

// Executar monitoramento
monitorTempoReal(); 