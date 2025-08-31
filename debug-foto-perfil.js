import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugFotoPerfil() {
  console.log('🔍 Debugando problema da foto de perfil...\n');

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

    // 2. Verificar perfil atual
    console.log('\n2️⃣ Verificando perfil atual...');
    let { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ Erro ao buscar perfil:', profileError);
      
      // Tentar criar perfil se não existir
      console.log('🔄 Tentando criar perfil...');
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: user.id,
          full_name: user.user_metadata?.full_name || 'Usuário',
          email: user.email,
          avatar_url: null
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

    // 3. Testar atualização direta
    console.log('\n3️⃣ Testando atualização direta...');
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
      console.error('❌ Erro ao atualizar avatar_url:', updateError);
      console.log('🔍 Detalhes do erro:', updateError);
    } else {
      console.log('✅ Atualização direta bem-sucedida');
      console.log(`   - Avatar URL salva: ${updateResult[0].avatar_url ? 'SIM' : 'NÃO'}`);
      console.log(`   - Tamanho da URL: ${updateResult[0].avatar_url?.length || 0}`);
    }

    // 4. Verificar políticas RLS
    console.log('\n4️⃣ Verificando políticas RLS...');
    const { data: policies, error: policiesError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');

    if (policiesError) {
      console.error('❌ Erro ao verificar políticas:', policiesError);
    } else {
      console.log(`✅ ${policies.length} políticas encontradas para profiles`);
      policies.forEach(policy => {
        console.log(`   - ${policy.policy_name}: ${policy.action}`);
      });
    }

    // 5. Testar com diferentes métodos
    console.log('\n5️⃣ Testando diferentes métodos de atualização...');
    
    // Método 1: Upsert
    console.log('   Método 1: Upsert');
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
    }

    // Método 2: Insert (se não existir)
    console.log('   Método 2: Insert');
    const { data: insertResult, error: insertError } = await supabase
      .from('profiles')
      .insert({
        user_id: user.id + '_test',
        full_name: 'Teste Insert',
        avatar_url: testAvatarUrl + '_insert',
        updated_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('     ❌ Erro no insert:', insertError);
    } else {
      console.log('     ✅ Insert bem-sucedido');
    }

    // 6. Verificar estrutura da tabela
    console.log('\n6️⃣ Verificando estrutura da tabela...');
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public')
      .order('ordinal_position');

    if (columnsError) {
      console.error('❌ Erro ao verificar estrutura:', columnsError);
    } else {
      console.log('✅ Estrutura da tabela profiles:');
      columns.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }

    // 7. Testar com dados reais
    console.log('\n7️⃣ Testando com dados reais...');
    const realAvatarUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    const { data: finalResult, error: finalError } = await supabase
      .from('profiles')
      .update({
        avatar_url: realAvatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select();

    if (finalError) {
      console.error('❌ Erro final:', finalError);
    } else {
      console.log('✅ Teste final bem-sucedido');
      console.log(`   - Avatar URL final: ${finalResult[0].avatar_url ? 'PRESENTE' : 'AUSENTE'}`);
      console.log(`   - Tamanho: ${finalResult[0].avatar_url?.length || 0} caracteres`);
    }

    console.log('\n🎯 Debug concluído!');
    console.log('\n📋 Resumo:');
    console.log('   - Usuário autenticado:', !!user);
    console.log('   - Perfil encontrado:', !!profile);
    console.log('   - Políticas RLS:', policies?.length || 0);
    console.log('   - Estrutura da tabela:', columns?.length || 0);

  } catch (error) {
    console.error('❌ Erro durante debug:', error);
  }
}

// Executar debug
debugFotoPerfil().catch(console.error); 