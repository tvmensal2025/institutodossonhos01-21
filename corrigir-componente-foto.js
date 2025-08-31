import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function corrigirComponenteFoto() {
  console.log('🔧 Corrigindo componente de foto de perfil...\n');

  try {
    // 1. Verificar se há usuários logados
    console.log('1️⃣ Verificando autenticação...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError);
      console.log('💡 Faça login primeiro para testar');
      return;
    }

    if (!user) {
      console.log('⚠️ Nenhum usuário logado');
      console.log('💡 Faça login primeiro para testar');
      return;
    }

    console.log(`✅ Usuário logado: ${user.email} (${user.id})`);

    // 2. Verificar se o perfil existe
    console.log('\n2️⃣ Verificando perfil...');
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.log('⚠️ Perfil não encontrado, criando...');
      
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || 'Usuário',
          email: user.email,
          avatar_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Erro ao criar perfil:', createError);
        return;
      } else {
        console.log('✅ Perfil criado com sucesso');
        profile = newProfile;
      }
    } else {
      console.log('✅ Perfil encontrado');
      console.log(`   - Nome: ${profile.full_name}`);
      console.log(`   - Avatar URL: ${profile.avatar_url || 'NÃO DEFINIDA'}`);
    }

    // 3. Testar atualização com diferentes métodos
    console.log('\n3️⃣ Testando diferentes métodos de atualização...');
    
    const testAvatarUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    // Método 1: Update simples
    console.log('   Método 1: Update simples');
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: testAvatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select();

    if (updateError) {
      console.error('     ❌ Erro no update:', updateError);
    } else {
      console.log('     ✅ Update bem-sucedido');
      console.log(`     - Avatar URL salva: ${updateResult[0].avatar_url ? 'SIM' : 'NÃO'}`);
    }

    // Método 2: Upsert
    console.log('   Método 2: Upsert');
    const { data: upsertResult, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        avatar_url: testAvatarUrl + '_upsert',
        updated_at: new Date().toISOString()
      })
      .select();

    if (upsertError) {
      console.error('     ❌ Erro no upsert:', upsertError);
    } else {
      console.log('     ✅ Upsert bem-sucedido');
      console.log(`     - Avatar URL: ${upsertResult[0].avatar_url ? 'PRESENTE' : 'AUSENTE'}`);
    }

    // 4. Verificar se as atualizações foram persistidas
    console.log('\n4️⃣ Verificando persistência...');
    const { data: verifyResult, error: verifyError } = await supabase
      .from('profiles')
      .select('avatar_url, updated_at')
      .eq('user_id', user.id)
      .single();

    if (verifyError) {
      console.error('❌ Erro ao verificar persistência:', verifyError);
    } else {
      console.log('✅ Verificação de persistência:');
      console.log(`   - Avatar URL existe: ${verifyResult.avatar_url ? 'SIM' : 'NÃO'}`);
      console.log(`   - Tamanho da URL: ${verifyResult.avatar_url?.length || 0}`);
      console.log(`   - Updated at: ${verifyResult.updated_at}`);
    }

    // 5. Testar com dados reais (simulando o componente)
    console.log('\n5️⃣ Testando com dados reais (simulando componente)...');
    
    // Simular o que o componente faz
    const realAvatarUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    // Simular updateProfile do hook
    const updateProfile = async (newData) => {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profile.full_name,
            phone: profile.phone,
            birth_date: profile.birth_date,
            city: profile.city,
            state: profile.state,
            avatar_url: newData.avatarUrl || realAvatarUrl,
            bio: profile.bio,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (error) {
          console.error('     ❌ Erro no updateProfile:', error);
          throw error;
        }

        return { success: true };
      } catch (error) {
        console.error('     ❌ Erro no updateProfile:', error);
        return { success: false, error };
      }
    };

    console.log('   Simulando updateProfile...');
    const result = await updateProfile({ avatarUrl: realAvatarUrl });
    
    if (result.success) {
      console.log('     ✅ updateProfile bem-sucedido');
    } else {
      console.error('     ❌ updateProfile falhou:', result.error);
    }

    // 6. Verificar resultado final
    console.log('\n6️⃣ Verificando resultado final...');
    const { data: finalResult, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
    } else {
      console.log('✅ Resultado final:');
      console.log(`   - ID: ${finalResult.id}`);
      console.log(`   - User ID: ${finalResult.user_id}`);
      console.log(`   - Full Name: ${finalResult.full_name}`);
      console.log(`   - Avatar URL: ${finalResult.avatar_url ? 'PRESENTE' : 'AUSENTE'}`);
      console.log(`   - Tamanho da URL: ${finalResult.avatar_url?.length || 0}`);
      console.log(`   - Created at: ${finalResult.created_at}`);
      console.log(`   - Updated at: ${finalResult.updated_at}`);
    }

    // 7. Testar interface (simular o que o usuário vê)
    console.log('\n7️⃣ Testando interface...');
    if (finalResult.avatar_url) {
      console.log('✅ Avatar URL está presente no banco');
      console.log('✅ Interface deve mostrar a foto');
    } else {
      console.log('❌ Avatar URL não está presente no banco');
      console.log('❌ Interface não mostrará a foto');
    }

    console.log('\n🎉 Correção do componente concluída!');
    console.log('\n📋 Resumo:');
    console.log('   - Usuário autenticado:', !!user);
    console.log('   - Perfil encontrado:', !!profile);
    console.log('   - Avatar URL salva:', !!finalResult?.avatar_url);
    console.log('   - Tamanho da URL:', finalResult?.avatar_url?.length || 0);

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
}

// Executar correção
corrigirComponenteFoto().catch(console.error); 