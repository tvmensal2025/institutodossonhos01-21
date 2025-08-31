import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase usando as credenciais do projeto
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE1MzA0NywiZXhwIjoyMDY4NzI5MDQ3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"; // Você precisa adicionar sua service role key aqui

if (!SUPABASE_SERVICE_ROLE_KEY || SUPABASE_SERVICE_ROLE_KEY.includes("Ej8Ej8")) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY não configurada corretamente');
  console.log('💡 Para obter a service role key:');
  console.log('   1. Acesse o dashboard do Supabase');
  console.log('   2. Vá em Settings > API');
  console.log('   3. Copie a "service_role" key');
  console.log('   4. Configure como variável de ambiente:');
  console.log('      export SUPABASE_SERVICE_ROLE_KEY="sua_service_role_key"');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function corrigirFotoPerfil() {
  console.log('🔧 Iniciando correção do problema da foto de perfil...\n');

  try {
    // 1. Verificar se a tabela profiles existe e tem a coluna avatar_url
    console.log('1️⃣ Verificando estrutura da tabela profiles...');
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');

    if (tableError) {
      console.error('❌ Erro ao verificar estrutura da tabela:', tableError);
    } else {
      console.log('✅ Estrutura da tabela profiles:');
      tableInfo.forEach(col => {
        console.log(`   - ${col.column_name}: ${col.data_type}`);
      });
      
      const hasAvatarUrl = tableInfo.some(col => col.column_name === 'avatar_url');
      if (!hasAvatarUrl) {
        console.log('⚠️ Coluna avatar_url não encontrada, adicionando...');
        
        // Adicionar coluna avatar_url
        const { error: alterError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text;'
        });

        if (alterError) {
          console.error('❌ Erro ao adicionar coluna avatar_url:', alterError);
        } else {
          console.log('✅ Coluna avatar_url adicionada com sucesso');
        }
      } else {
        console.log('✅ Coluna avatar_url já existe');
      }
    }

    // 2. Verificar se o bucket avatars existe
    console.log('\n2️⃣ Verificando bucket avatars...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Erro ao listar buckets:', bucketError);
    } else {
      const avatarsBucket = buckets.find(b => b.id === 'avatars');
      if (avatarsBucket) {
        console.log('✅ Bucket avatars encontrado');
        console.log(`   - Nome: ${avatarsBucket.name}`);
        console.log(`   - Público: ${avatarsBucket.public}`);
      } else {
        console.log('⚠️ Bucket avatars não encontrado, criando...');
        
        const { error: createBucketError } = await supabase.storage.createBucket('avatars', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        });

        if (createBucketError) {
          console.error('❌ Erro ao criar bucket avatars:', createBucketError);
        } else {
          console.log('✅ Bucket avatars criado com sucesso');
        }
      }
    }

    // 3. Configurar políticas RLS para o bucket avatars
    console.log('\n3️⃣ Configurando políticas RLS para avatars...');
    const storagePolicies = [
      {
        name: 'Avatar images são acessíveis publicamente',
        sql: `
          DROP POLICY IF EXISTS "Avatar images são acessíveis publicamente" ON storage.objects;
          CREATE POLICY "Avatar images são acessíveis publicamente"
          ON storage.objects FOR SELECT
          USING (bucket_id = 'avatars');
        `
      },
      {
        name: 'Usuários autenticados podem fazer upload de avatars',
        sql: `
          DROP POLICY IF EXISTS "Usuários autenticados podem fazer upload de avatars" ON storage.objects;
          CREATE POLICY "Usuários autenticados podem fazer upload de avatars"
          ON storage.objects FOR INSERT
          WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      {
        name: 'Usuários podem atualizar seus próprios avatars',
        sql: `
          DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios avatars" ON storage.objects;
          CREATE POLICY "Usuários podem atualizar seus próprios avatars"
          ON storage.objects FOR UPDATE
          USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      {
        name: 'Usuários podem deletar seus próprios avatars',
        sql: `
          DROP POLICY IF EXISTS "Usuários podem deletar seus próprios avatars" ON storage.objects;
          CREATE POLICY "Usuários podem deletar seus próprios avatars"
          ON storage.objects FOR DELETE
          USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      }
    ];

    for (const policy of storagePolicies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy.sql });
        console.log(`✅ Política "${policy.name}" configurada`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ Política "${policy.name}" já existe`);
        } else {
          console.error(`❌ Erro ao configurar política "${policy.name}":`, error);
        }
      }
    }

    // 4. Configurar políticas RLS da tabela profiles
    console.log('\n4️⃣ Configurando políticas RLS da tabela profiles...');
    const profilePolicies = [
      {
        name: 'Users can view their own profile',
        sql: `
          DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
          CREATE POLICY "Users can view their own profile"
          ON public.profiles FOR SELECT
          USING (auth.uid() = user_id);
        `
      },
      {
        name: 'Users can insert their own profile',
        sql: `
          DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
          CREATE POLICY "Users can insert their own profile"
          ON public.profiles FOR INSERT
          WITH CHECK (auth.uid() = user_id);
        `
      },
      {
        name: 'Users can update their own profile',
        sql: `
          DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
          CREATE POLICY "Users can update their own profile"
          ON public.profiles FOR UPDATE
          USING (auth.uid() = user_id);
        `
      }
    ];

    for (const policy of profilePolicies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy.sql });
        console.log(`✅ Política "${policy.name}" configurada`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ Política "${policy.name}" já existe`);
        } else {
          console.error(`❌ Erro ao configurar política "${policy.name}":`, error);
        }
      }
    }

    // 5. Habilitar RLS na tabela profiles
    console.log('\n5️⃣ Habilitando RLS na tabela profiles...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('❌ Erro ao habilitar RLS:', rlsError);
    } else {
      console.log('✅ RLS habilitado na tabela profiles');
    }

    // 6. Criar função e trigger para updated_at
    console.log('\n6️⃣ Configurando função e trigger para updated_at...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION public.update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ language 'plpgsql';
      `
    });

    if (functionError) {
      console.error('❌ Erro ao criar função update_updated_at_column:', functionError);
    } else {
      console.log('✅ Função update_updated_at_column criada/atualizada');
    }

    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
        CREATE TRIGGER update_profiles_updated_at
          BEFORE UPDATE ON public.profiles
          FOR EACH ROW
          EXECUTE FUNCTION public.update_updated_at_column();
      `
    });

    if (triggerError) {
      console.error('❌ Erro ao criar trigger:', triggerError);
    } else {
      console.log('✅ Trigger update_profiles_updated_at criado/atualizado');
    }

    // 7. Testar inserção de avatar_url
    console.log('\n7️⃣ Testando inserção de avatar_url...');
    const testAvatarUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    // Buscar um usuário existente para teste
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name')
      .limit(1);

    if (usersError) {
      console.error('❌ Erro ao buscar usuários:', usersError);
    } else if (users && users.length > 0) {
      const testUser = users[0];
      console.log(`✅ Usuário encontrado para teste: ${testUser.full_name}`);

      const { data: updateResult, error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: testAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', testUser.user_id)
        .select();

      if (updateError) {
        console.error('❌ Erro ao testar atualização:', updateError);
      } else {
        console.log('✅ Teste de atualização bem-sucedido');
        console.log('   - Avatar URL salva:', updateResult[0].avatar_url ? 'SIM' : 'NÃO');
      }
    } else {
      console.log('⚠️ Nenhum usuário encontrado para teste');
    }

    // 8. Verificar estrutura final
    console.log('\n8️⃣ Verificando estrutura final...');
    const { data: finalCheck, error: finalError } = await supabase
      .from('profiles')
      .select('COUNT(*) as total, COUNT(avatar_url) as with_avatar')
      .limit(1);

    if (finalError) {
      console.error('❌ Erro na verificação final:', finalError);
    } else {
      console.log('✅ Estrutura final verificada');
      console.log(`   - Total de perfis: ${finalCheck[0]?.total || 0}`);
      console.log(`   - Perfis com avatar: ${finalCheck[0]?.with_avatar || 0}`);
    }

    console.log('\n🎉 Correção da foto de perfil concluída com sucesso!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Teste o upload de foto na interface');
    console.log('   2. Verifique se a foto aparece no perfil');
    console.log('   3. Se houver problemas, execute o script de teste');

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
}

// Executar correção
corrigirFotoPerfil().catch(console.error); 