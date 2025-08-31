import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testarFotoPerfil() {
  console.log('🧪 Testando funcionalidade da foto de perfil...\n');

  try {
    // 1. Simular upload de foto (base64)
    console.log('1️⃣ Simulando upload de foto...');
    const testAvatarUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    // 2. Buscar um usuário existente para teste
    console.log('2️⃣ Buscando usuário para teste...');
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url')
      .limit(1);

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ Nenhum usuário encontrado para teste');
      return;
    }

    const testUser = users[0];
    console.log(`✅ Usuário encontrado: ${testUser.full_name} (${testUser.user_id})`);

    // 3. Testar atualização do avatar_url
    console.log('3️⃣ Testando atualização do avatar_url...');
    const { data: updateResult, error: updateError } = await supabase
      .from('profiles')
      .update({
        avatar_url: testAvatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', testUser.user_id)
      .select();

    if (updateError) {
      console.error('❌ Erro ao atualizar avatar_url:', updateError);
    } else {
      console.log('✅ Avatar URL atualizada com sucesso');
      console.log('   - Avatar URL salva:', updateResult[0].avatar_url ? 'SIM' : 'NÃO');
      console.log('   - Tamanho da URL:', updateResult[0].avatar_url?.length || 0);
    }

    // 4. Verificar se a atualização foi persistida
    console.log('4️⃣ Verificando persistência da atualização...');
    const { data: verifyResult, error: verifyError } = await supabase
      .from('profiles')
      .select('avatar_url, updated_at')
      .eq('user_id', testUser.user_id)
      .single();

    if (verifyError) {
      console.error('❌ Erro ao verificar persistência:', verifyError);
    } else {
      console.log('✅ Verificação de persistência:');
      console.log('   - Avatar URL existe:', verifyResult.avatar_url ? 'SIM' : 'NÃO');
      console.log('   - Updated at:', verifyResult.updated_at);
    }

    // 5. Testar upload para storage (se necessário)
    console.log('5️⃣ Testando upload para storage...');
    try {
      const testFileName = `test-${Date.now()}.jpg`;
      const testFilePath = `${testUser.user_id}/${testFileName}`;
      
      // Converter base64 para blob
      const base64Data = testAvatarUrl.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(testFilePath, blob, {
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
          .getPublicUrl(testFilePath);
        
        console.log('   - URL pública:', publicUrl);

        // Atualizar perfil com URL do storage
        const { error: storageUpdateError } = await supabase
          .from('profiles')
          .update({
            avatar_url: publicUrl,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', testUser.user_id);

        if (storageUpdateError) {
          console.error('❌ Erro ao atualizar com URL do storage:', storageUpdateError);
        } else {
          console.log('✅ Perfil atualizado com URL do storage');
        }
      }
    } catch (storageError) {
      console.error('❌ Erro no teste de storage:', storageError);
    }

    // 6. Verificar estrutura final
    console.log('6️⃣ Verificando estrutura final...');
    const { data: finalResult, error: finalError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', testUser.user_id)
      .single();

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
    } else {
      console.log('✅ Estrutura final do perfil:');
      console.log('   - ID:', finalResult.id);
      console.log('   - User ID:', finalResult.user_id);
      console.log('   - Full Name:', finalResult.full_name);
      console.log('   - Avatar URL:', finalResult.avatar_url ? 'PRESENTE' : 'AUSENTE');
      console.log('   - Created at:', finalResult.created_at);
      console.log('   - Updated at:', finalResult.updated_at);
    }

    console.log('\n🎯 Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

// Executar teste
testarFotoPerfil().catch(console.error); 