import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugModalProgresso() {
  console.log('🔍 Debugando modal de progresso...');
  
  try {
    // 1. Verificar se há usuários autenticados
    console.log('1. Verificando sessão atual...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.log('❌ Erro ao verificar sessão:', sessionError);
    } else if (session) {
      console.log('✅ Usuário autenticado:', session.user.email);
      console.log('🆔 User ID:', session.user.id);
    } else {
      console.log('⚠️ Nenhum usuário autenticado');
    }
    
    // 2. Verificar desafios
    console.log('2. Verificando desafios...');
    const { data: desafios, error: desafiosError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .limit(1);

    if (desafiosError) {
      console.error('❌ Erro ao buscar desafios:', desafiosError);
      return;
    }

    if (desafios.length === 0) {
      console.log('⚠️ Nenhum desafio encontrado');
      return;
    }

    const desafio = desafios[0];
    console.log(`✅ Desafio encontrado: ${desafio.title}`);
    console.log(`📊 Target: ${desafio.daily_log_target} ${desafio.daily_log_unit}`);
    
    // 3. Verificar participações existentes
    console.log('3. Verificando participações...');
    const { data: participacoes, error: participacoesError } = await supabase
      .from('challenge_participations')
      .select('*')
      .eq('challenge_id', desafio.id)
      .limit(5);
    
    if (participacoesError) {
      console.log('❌ Erro ao buscar participações:', participacoesError);
    } else {
      console.log(`✅ Encontradas ${participacoes.length} participações`);
      participacoes.forEach((part, index) => {
        console.log(`   ${index + 1}. User: ${part.user_id} | Progress: ${part.progress} | Completed: ${part.is_completed}`);
      });
    }
    
    // 4. Simular o que o modal faz
    console.log('4. Simulando lógica do modal...');
    
    if (session) {
      // Buscar participação do usuário atual
      const { data: participacao, error: participacaoError } = await supabase
        .from('challenge_participations')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('challenge_id', desafio.id)
        .single();
      
      if (participacaoError) {
        console.log('⚠️ Participação não encontrada para usuário atual');
        console.log('💡 Isso explica o erro no modal!');
        console.log('🔧 Solução: O modal precisa criar a participação primeiro');
      } else {
        console.log('✅ Participação encontrada:', participacao.id);
        console.log(`📊 Progresso atual: ${participacao.progress}`);
        console.log(`✅ Completo: ${participacao.is_completed}`);
      }
    } else {
      console.log('⚠️ Usuário não autenticado - não é possível testar participação');
    }
    
    console.log('\n🎯 DIAGNÓSTICO:');
    console.log('O problema é que o modal tenta buscar uma participação que não existe.');
    console.log('Quando o usuário clica em "Iniciar Desafio", a participação é criada,');
    console.log('mas o modal ainda tenta buscar uma participação existente.');
    console.log('\n🔧 SOLUÇÃO:');
    console.log('O modal deve verificar se a participação existe antes de tentar atualizá-la.');
    console.log('Se não existir, deve criar uma nova participação.');
    
  } catch (error) {
    console.error('❌ Erro no debug:', error);
  }
}

debugModalProgresso(); 