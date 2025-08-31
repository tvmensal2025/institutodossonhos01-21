import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarDesafioFrontend() {
  console.log('🧪 Testando desafio no frontend...');
  
  try {
    // 1. Simular login do usuário Rafael
    console.log('1. Simulando login...');
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'rafael@teste.com',
      password: '123456'
    });
    
    if (authError) {
      console.log('⚠️ Erro no login:', authError.message);
      console.log('Tentando com credenciais alternativas...');
      
      // Tentar com email diferente
      const { data: { user: user2 }, error: authError2 } = await supabase.auth.signInWithPassword({
        email: 'teste@teste.com',
        password: '123456'
      });
      
      if (authError2) {
        console.log('❌ Não foi possível fazer login:', authError2.message);
        return;
      }
      
      console.log('✅ Login realizado com:', user2.email);
    } else {
      console.log('✅ Login realizado com:', user.email);
    }
    
    // 2. Buscar desafios
    console.log('2. Buscando desafios...');
    const { data: desafios, error: desafiosError } = await supabase
      .from('challenges')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (desafiosError) {
      console.error('❌ Erro ao buscar desafios:', desafiosError);
      return;
    }

    console.log(`✅ Encontrados ${desafios.length} desafios`);
    
    // 3. Testar criação de participação
    const desafio = desafios[0];
    console.log(`3. Testando participação no desafio: ${desafio.title}`);
    
    const { data: participacao, error: participacaoError } = await supabase
      .from('challenge_participations')
      .insert({
        user_id: user?.id || 'e5565dd4-961c-4cb1-b1ec-eba97493d006',
        challenge_id: desafio.id,
        progress: 0,
        is_completed: false,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (participacaoError) {
      console.error('❌ Erro ao criar participação:', participacaoError);
      return;
    }

    console.log('✅ Participação criada:', participacao.id);
    
    // 4. Testar atualização de progresso
    console.log('4. Testando atualização de progresso...');
    const novoProgresso = 5;
    const { error: updateError } = await supabase
      .from('challenge_participations')
      .update({
        progress: novoProgresso,
        is_completed: novoProgresso >= desafio.daily_log_target,
        updated_at: new Date().toISOString()
      })
      .eq('id', participacao.id);

    if (updateError) {
      console.error('❌ Erro ao atualizar progresso:', updateError);
      return;
    }

    console.log('✅ Progresso atualizado para:', novoProgresso);
    
    console.log('🎉 Teste frontend concluído com sucesso!');
    console.log('📱 Agora teste no dashboard: http://localhost:8081/dashboard');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  }
}

testarDesafioFrontend(); 