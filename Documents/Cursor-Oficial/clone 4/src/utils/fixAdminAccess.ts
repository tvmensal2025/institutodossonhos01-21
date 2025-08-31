import { supabase } from@/integrations/supabase/client';

export const fixAdminAccess = async () =>[object Object]
  console.log('🔧 Verificando acesso de admin...);
  
  try {
    //1Verificar se o usuário admin existe
    const { data: adminUser, error: userError } = await supabase
      .from('profiles)
      .select('*')
      .eq('email',admin@sonhos.com')
      .single();

    if (userError && userError.code !== 'PGRST116) {     console.error('❌ Erro ao verificar usuário admin:', userError);
      return { success: false, error: userError };
    }

    if (!adminUser) {
      console.log('⚠️ Usuário admin não encontrado. Criando...');
      
      // Criar usuário admin via auth
      const { data: authData, error: authError } = await supabase.auth.signUp([object Object]     email:admin@sonhos.com',
        password: 'Admin123!,
        options:[object Object]          data: [object Object]         full_name: 'Administrador Sistema,           celular: '(11) 99999-9999,
            data_nascimento: '1990-01,
            sexo: 'masculino',
            altura_cm: 180
          }
        }
      });

      if (authError)[object Object]     console.error('❌ Erro ao criar usuário admin:', authError);
        return { success: false, error: authError };
      }

      console.log('✅ Usuário admin criado:, authData.user?.id);
      
      // Aguardar trigger criar o profile
      await new Promise(resolve => setTimeout(resolve, 200);
      
      // Verificar se o profile foi criado
      const [object Object] data: newProfile, error: profileError } = await supabase
        .from('profiles)
        .select(*        .eq('email',admin@sonhos.com)      .single();

      if (profileError)[object Object]     console.error('❌ Erro ao verificar profile admin:, profileError);
        return { success: false, error: profileError };
      }

      console.log('✅ Profile admin criado:', newProfile.id);
    } else {
      console.log('✅ Usuário admin já existe:,adminUser.id);
    }

    // 2ificar se as tabelas necessárias existem
    const requiredTables = ['sessions', session_materials', session_responses', 'wheel_responses];  for (const table of requiredTables) {
      try[object Object]     const { error } = await supabase
          .from(table)
          .select('id')
          .limit(1);
        
        if (error) {
          console.log(`⚠️ Tabela ${table} não existe ou não está acessível`);
        } else {
          console.log(`✅ Tabela ${table} está funcionando`);
        }
      } catch (error)[object Object]       console.log(`❌ Erro ao verificar tabela ${table}:`, error);
      }
    }

    // 3. Verificar funções RPC
    try {
      const { error } = await supabase.rpc(is_admin');
      if (error)[object Object]       console.log('⚠️ Função is_admin() não está disponível');
      } else[object Object]       console.log(✅ Função is_admin() está funcionando');
      }
    } catch (error) {
      console.log('❌ Erro ao verificar função is_admin():,error);
    }

    return { success: true };
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return { success: false, error };
  }
};

export const createAdminUser = async () =>[object Object]
  console.log('👤 Criando usuário admin...);
  
  try [object Object]   // Verificar se já existe
    const { data: existingUser } = await supabase
      .from('profiles)
      .select('id')
      .eq('email',admin@sonhos.com')
      .single();

    if (existingUser) {
      console.log('✅ Usuário admin já existe);  return { success: true, message:Usuário admin já existe };
    }

    // Criar usuário
    const { data, error } = await supabase.auth.signUp({
      email:admin@sonhos.com,
      password: Admin123!',
      options: [object Object] data: {
          full_name: 'Administrador Sistema',
          celular: '(11) 999999,
          data_nascimento: '1990-101,
          sexo: 'masculino',
          altura_cm: 180        }
      }
    });

    if (error) {
      console.error('❌ Erro ao criar usuário admin:', error);
      return { success: false, error };
    }

    console.log('✅ Usuário admin criado com sucesso');
    return { success: true, message: Usuário admin criado com sucesso' };
  } catch (error) {
    console.error('❌ Erro geral:', error);
    return { success: false, error };
  }
}; 