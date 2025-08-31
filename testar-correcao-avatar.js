import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarCorrecaoAvatar() {
  console.log('🧪 Testando correção do avatar...\n');

  try {
    // 1. Verificar autenticação
    console.log('1️⃣ Verificando autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError);
      return;
    }

    if (!user) {
      console.log('⚠️ Nenhum usuário logado');
      console.log('💡 Faça login primeiro');
      return;
    }

    console.log(`✅ Usuário logado: ${user.email} (${user.id})`);

    // 2. Verificar perfil atual
    console.log('\n2️⃣ Verificando perfil atual...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      return;
    }

    console.log('✅ Perfil encontrado');
    console.log(`   - ID: ${profile.id}`);
    console.log(`   - Nome: ${profile.full_name}`);
    console.log(`   - Avatar URL: ${profile.avatar_url || 'NÃO DEFINIDA'}`);

    // 3. Testar UPDATE (correção aplicada)
    console.log('\n3️⃣ Testando UPDATE (correção aplicada)...');
    const testAvatarUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: testAvatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select();

    if (updateError) {
      console.error('❌ Erro no UPDATE:', updateError);
      console.log('🔍 Detalhes do erro:', updateError);
    } else {
      console.log('✅ UPDATE bem-sucedido');
      console.log(`   - Avatar URL salva: ${updateResult[0].avatar_url ? 'SIM' : 'NÃO'}`);
      console.log(`   - Tamanho da URL: ${updateResult[0].avatar_url?.length || 0}`);
    }

    // 4. Testar UPSERT (problema anterior)
    console.log('\n4️⃣ Testando UPSERT (problema anterior)...');
    const { data: upsertResult, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        avatar_url: testAvatarUrl + '_upsert',
        updated_at: new Date().toISOString()
      })
      .select();

    if (upsertError) {
      console.error('❌ Erro no UPSERT (esperado):', upsertError);
      console.log('✅ Isso confirma que o problema era o UPSERT');
    } else {
      console.log('⚠️ UPSERT funcionou (inesperado)');
    }

    // 5. Verificar resultado final
    console.log('\n5️⃣ Verificando resultado final...');
    const { data: finalResult, error: finalError } = await supabase
      .from('profiles')
      .select('avatar_url, updated_at')
      .eq('user_id', user.id)
      .single();

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
    } else {
      console.log('✅ Resultado final:');
      console.log(`   - Avatar URL: ${finalResult.avatar_url ? 'PRESENTE' : 'AUSENTE'}`);
      console.log(`   - Tamanho: ${finalResult.avatar_url?.length || 0} caracteres`);
      console.log(`   - Updated at: ${finalResult.updated_at}`);
    }

    // 6. Testar remoção de avatar
    console.log('\n6️⃣ Testando remoção de avatar...');
    const { error: removeError } = await supabase
      .from('profiles')
      .update({
        avatar_url: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    if (removeError) {
      console.error('❌ Erro ao remover avatar:', removeError);
    } else {
      console.log('✅ Avatar removido com sucesso');
    }

    // 7. Verificar após remoção
    console.log('\n7️⃣ Verificando após remoção...');
    const { data: afterRemove, error: afterRemoveError } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('user_id', user.id)
      .single();

    if (afterRemoveError) {
      console.error('❌ Erro ao verificar após remoção:', afterRemoveError);
    } else {
      console.log('✅ Verificação após remoção:');
      console.log(`   - Avatar URL: ${afterRemove.avatar_url ? 'PRESENTE' : 'AUSENTE'}`);
    }

    console.log('\n🎯 Teste concluído!');
    console.log('\n📋 Resumo:');
    console.log('   - UPDATE funcionou:', !updateError);
    console.log('   - UPSERT falhou (esperado):', !!upsertError);
    console.log('   - Avatar salvo:', !!finalResult?.avatar_url);
    console.log('   - Avatar removido:', !afterRemove?.avatar_url);

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

// Executar teste
testarCorrecaoAvatar().catch(console.error); 