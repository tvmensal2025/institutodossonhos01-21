import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarUploadFoto() {
  console.log('🧪 Testando upload de foto...\n');

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

    console.log(`✅ Usuário logado: ${user.email}`);

    // 2. Simular upload de foto (base64)
    console.log('\n2️⃣ Simulando upload de foto...');
    const testAvatarUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    // 3. Testar atualização direta
    console.log('3️⃣ Testando atualização direta...');
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: testAvatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select();

    if (updateError) {
      console.error('❌ Erro na atualização:', updateError);
      console.log('🔍 Detalhes do erro:', updateError);
      
      // Verificar se é problema de RLS
      if (updateError.message.includes('RLS') || updateError.message.includes('policy')) {
        console.log('⚠️ Problema de RLS detectado');
        console.log('💡 Verificando políticas...');
        
        const { data: policies, error: policiesError } = await supabase
          .from('information_schema.policies')
          .select('*')
          .eq('table_name', 'profiles')
          .eq('table_schema', 'public');

        if (policiesError) {
          console.error('❌ Erro ao verificar políticas:', policiesError);
        } else {
          console.log(`📋 ${policies.length} políticas encontradas:`);
          policies.forEach(policy => {
            console.log(`   - ${policy.policy_name}: ${policy.action}`);
          });
        }
      }
    } else {
      console.log('✅ Atualização bem-sucedida');
      console.log(`   - Avatar URL salva: ${updateResult[0].avatar_url ? 'SIM' : 'NÃO'}`);
      console.log(`   - Tamanho: ${updateResult[0].avatar_url?.length || 0} caracteres`);
    }

    // 4. Verificar se a atualização foi persistida
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
      console.log(`   - Updated at: ${verifyResult.updated_at}`);
    }

    // 5. Testar com upsert
    console.log('\n5️⃣ Testando com upsert...');
    const { data: upsertResult, error: upsertError } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        avatar_url: testAvatarUrl + '_upsert',
        updated_at: new Date().toISOString()
      })
      .select();

    if (upsertError) {
      console.error('❌ Erro no upsert:', upsertError);
    } else {
      console.log('✅ Upsert bem-sucedido');
      console.log(`   - Avatar URL: ${upsertResult[0].avatar_url ? 'PRESENTE' : 'AUSENTE'}`);
    }

    // 6. Testar upload para storage
    console.log('\n6️⃣ Testando upload para storage...');
    try {
      // Criar um blob de teste
      const base64Data = testAvatarUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const fileName = `test-${Date.now()}.jpg`;
      const filePath = `${user.id}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('❌ Erro no upload para storage:', uploadError);
      } else {
        console.log('✅ Upload para storage bem-sucedido');
        
        // Obter URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        console.log('   - URL pública:', publicUrl);

        // Atualizar perfil com URL do storage
        const { error: storageUpdateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (storageUpdateError) {
          console.error('❌ Erro ao atualizar com URL do storage:', storageUpdateError);
        } else {
          console.log('✅ Perfil atualizado com URL do storage');
        }
      }
    } catch (storageError) {
      console.error('❌ Erro no teste de storage:', storageError);
    }

    // 7. Verificar resultado final
    console.log('\n7️⃣ Verificando resultado final...');
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
      console.log(`   - Created at: ${finalResult.created_at}`);
      console.log(`   - Updated at: ${finalResult.updated_at}`);
    }

    console.log('\n🎯 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

// Executar teste
testarUploadFoto().catch(console.error); 