import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórias');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnosticarProblemaFotoPerfil() {
  console.log('🔍 Iniciando diagnóstico do problema da foto de perfil...\n');

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
        console.error('❌ Coluna avatar_url não encontrada na tabela profiles!');
      } else {
        console.log('✅ Coluna avatar_url encontrada');
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
        console.error('❌ Bucket avatars não encontrado!');
      }
    }

    // 3. Verificar políticas RLS da tabela profiles
    console.log('\n3️⃣ Verificando políticas RLS da tabela profiles...');
    const { data: policies, error: policyError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_name', 'profiles')
      .eq('table_schema', 'public');

    if (policyError) {
      console.error('❌ Erro ao verificar políticas:', policyError);
    } else {
      console.log(`✅ ${policies.length} políticas encontradas para a tabela profiles`);
      policies.forEach(policy => {
        console.log(`   - ${policy.policy_name}: ${policy.action} (${policy.permissive ? 'PERMISSIVE' : 'RESTRICTIVE'})`);
      });
    }

    // 4. Verificar políticas RLS do storage
    console.log('\n4️⃣ Verificando políticas RLS do storage...');
    const { data: storagePolicies, error: storagePolicyError } = await supabase
      .from('information_schema.policies')
      .select('*')
      .eq('table_name', 'objects')
      .eq('table_schema', 'storage');

    if (storagePolicyError) {
      console.error('❌ Erro ao verificar políticas do storage:', storagePolicyError);
    } else {
      const avatarPolicies = storagePolicies.filter(p => p.policy_name.includes('avatar') || p.policy_name.includes('Avatar'));
      console.log(`✅ ${avatarPolicies.length} políticas encontradas para avatars no storage`);
      avatarPolicies.forEach(policy => {
        console.log(`   - ${policy.policy_name}: ${policy.action}`);
      });
    }

    // 5. Testar inserção de avatar_url
    console.log('\n5️⃣ Testando inserção de avatar_url...');
    const testUserId = '00000000-0000-0000-0000-000000000000'; // ID de teste
    const testAvatarUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';

    const { data: insertTest, error: insertError } = await supabase
      .from('profiles')
      .upsert({
        user_id: testUserId,
        avatar_url: testAvatarUrl,
        full_name: 'Teste Avatar',
        updated_at: new Date().toISOString()
      })
      .select();

    if (insertError) {
      console.error('❌ Erro ao testar inserção:', insertError);
    } else {
      console.log('✅ Teste de inserção bem-sucedido');
      console.log('   - Avatar URL salva:', insertTest[0].avatar_url ? 'SIM' : 'NÃO');
    }

    // 6. Verificar se há usuários sem avatar_url
    console.log('\n6️⃣ Verificando usuários sem avatar_url...');
    const { data: usersWithoutAvatar, error: usersError } = await supabase
      .from('profiles')
      .select('user_id, full_name, avatar_url')
      .is('avatar_url', null)
      .limit(5);

    if (usersError) {
      console.error('❌ Erro ao verificar usuários:', usersError);
    } else {
      console.log(`✅ ${usersWithoutAvatar.length} usuários encontrados sem avatar_url`);
      usersWithoutAvatar.forEach(user => {
        console.log(`   - ${user.full_name || 'Sem nome'} (${user.user_id})`);
      });
    }

    console.log('\n🎯 Diagnóstico concluído!');

  } catch (error) {
    console.error('❌ Erro durante diagnóstico:', error);
  }
}

async function corrigirProblemaFotoPerfil() {
  console.log('🔧 Iniciando correção do problema da foto de perfil...\n');

  try {
    // 1. Garantir que a coluna avatar_url existe
    console.log('1️⃣ Verificando/criando coluna avatar_url...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE public.profiles 
        ADD COLUMN IF NOT EXISTS avatar_url text;
      `
    });

    if (alterError) {
      console.error('❌ Erro ao adicionar coluna avatar_url:', alterError);
    } else {
      console.log('✅ Coluna avatar_url verificada/criada');
    }

    // 2. Garantir que o bucket avatars existe
    console.log('\n2️⃣ Verificando/criando bucket avatars...');
    const { error: bucketError } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Erro ao criar bucket avatars:', bucketError);
    } else {
      console.log('✅ Bucket avatars verificado/criado');
    }

    // 3. Criar políticas RLS para o bucket avatars
    console.log('\n3️⃣ Configurando políticas RLS para avatars...');
    const policies = [
      {
        name: 'Avatar images são acessíveis publicamente',
        sql: `
          CREATE POLICY "Avatar images são acessíveis publicamente"
          ON storage.objects FOR SELECT
          USING (bucket_id = 'avatars');
        `
      },
      {
        name: 'Usuários autenticados podem fazer upload de avatars',
        sql: `
          CREATE POLICY "Usuários autenticados podem fazer upload de avatars"
          ON storage.objects FOR INSERT
          WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      {
        name: 'Usuários podem atualizar seus próprios avatars',
        sql: `
          CREATE POLICY "Usuários podem atualizar seus próprios avatars"
          ON storage.objects FOR UPDATE
          USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      },
      {
        name: 'Usuários podem deletar seus próprios avatars',
        sql: `
          CREATE POLICY "Usuários podem deletar seus próprios avatars"
          ON storage.objects FOR DELETE
          USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
        `
      }
    ];

    for (const policy of policies) {
      try {
        await supabase.rpc('exec_sql', { sql: policy.sql });
        console.log(`✅ Política "${policy.name}" criada`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`ℹ️ Política "${policy.name}" já existe`);
        } else {
          console.error(`❌ Erro ao criar política "${policy.name}":`, error);
        }
      }
    }

    // 4. Garantir que a função update_updated_at_column existe
    console.log('\n4️⃣ Verificando função update_updated_at_column...');
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
      console.log('✅ Função update_updated_at_column verificada/criada');
    }

    // 5. Garantir que o trigger existe
    console.log('\n5️⃣ Verificando trigger update_profiles_updated_at...');
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
      console.log('✅ Trigger update_profiles_updated_at verificado/criado');
    }

    console.log('\n✅ Correção concluída! O problema da foto de perfil deve estar resolvido.');

  } catch (error) {
    console.error('❌ Erro durante correção:', error);
  }
}

// Executar diagnóstico e correção
async function main() {
  console.log('🚀 Iniciando verificação e correção do problema da foto de perfil...\n');
  
  await diagnosticarProblemaFotoPerfil();
  console.log('\n' + '='.repeat(60) + '\n');
  await corrigirProblemaFotoPerfil();
  
  console.log('\n🎉 Processo concluído!');
}

main().catch(console.error); 