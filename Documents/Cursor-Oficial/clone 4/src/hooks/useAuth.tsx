import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName?: string, celular?: string, dataNascimento?: string, sexo?: string, altura?: number) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName?: string, celular?: string, dataNascimento?: string, sexo?: string, altura?: number) => {
    try {
      // 1. Validar campos obrigatórios
      if (!fullName?.trim()) {
        return { error: new Error('Nome completo é obrigatório') };
      }
      if (!celular?.trim()) {
        return { error: new Error('Celular é obrigatório') };
      }
      if (!dataNascimento?.trim()) {
        return { error: new Error('Data de nascimento é obrigatória') };
      }
      if (!sexo?.trim()) {
        return { error: new Error('Sexo é obrigatório') };
      }
      if (!altura || altura < 100 || altura > 250) {
        return { error: new Error('Altura deve estar entre 100 e 250 cm') };
      }

      // 2. Verificar se email já existe na tabela profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (existingProfile) {
        return { error: new Error('E-mail já registrado. Tente outro.') };
      }

      const redirectUrl = `${window.location.origin}/`;
      
      // 3. Criar usuário no auth do Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName.trim(),
            celular: celular.trim(),
            data_nascimento: dataNascimento,
            sexo: sexo,
            altura_cm: altura.toString(),
          },
        },
      });

      if (authError) {
        console.error('❌ Erro no auth.signUp:', authError);
        return { error: authError };
      }

      if (!authData.user) {
        return { error: new Error('Falha ao criar usuário') };
      }

      console.log('✅ Usuário criado no auth:', authData.user.id);

      // 4. Aguardar trigger criar o profile básico
      await new Promise(resolve => setTimeout(resolve, 1500));

      // 5. Usar sistema de cadastro completo com stored procedure
      console.log('🔄 Iniciando cadastro completo com stored procedure...');
      
      const { data: registrationResult, error: registrationError } = await supabase.rpc(
        'create_complete_user_registration',
        {
          p_user_id: authData.user.id,
          p_full_name: fullName.trim(),
          p_email: email.toLowerCase().trim(),
          p_data_nascimento: dataNascimento,
          p_sexo: sexo,
          p_altura_cm: altura,
          p_peso_atual_kg: 70.0, // Peso inicial padrão
          p_circunferencia_abdominal_cm: 90.0, // Circunferência inicial padrão
          p_celular: celular.trim(),
          p_meta_peso_kg: 70.0 // Meta inicial igual ao peso
        }
      );

      if (registrationError) {
        console.error('❌ Erro na stored procedure:', registrationError);
        
        // Sistema de fallback manual
        try {
          console.log('🔄 Tentando fallback manual...');
          
          // Aguardar um pouco mais
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          // Buscar profile criado pelo trigger
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('user_id', authData.user.id)
            .single();

          if (profileError || !profile) {
            throw new Error('Profile não criado pelo trigger');
          }

          console.log('✅ Profile encontrado:', profile.id);

          // Atualizar dados do profile
          await supabase
            .from('profiles')
            .update({
              full_name: fullName.trim(),
              celular: celular.trim(),
              data_nascimento: dataNascimento,
              sexo: sexo,
              altura_cm: altura,
              updated_at: new Date().toISOString()
            })
            .eq('id', profile.id);

          // Criar dados físicos completos
          await supabase
            .from('dados_fisicos_usuario')
            .insert({
              user_id: profile.id,
              nome_completo: fullName.trim(),
              data_nascimento: dataNascimento,
              sexo: sexo,
              altura_cm: altura,
              peso_atual_kg: 70.0,
              circunferencia_abdominal_cm: 90.0,
              meta_peso_kg: 70.0
            });

          // Criar dados de saúde
          await supabase
            .from('dados_saude_usuario')
            .insert({
              user_id: profile.id,
              peso_atual_kg: 70.0,
              altura_cm: altura,
              circunferencia_abdominal_cm: 90.0,
              meta_peso_kg: 70.0
            });

          // Criar primeira pesagem
          await supabase
            .from('pesagens')
            .insert({
              user_id: profile.id,
              peso_kg: 70.0,
              circunferencia_abdominal_cm: 90.0,
              data_medicao: new Date().toISOString(),
              origem_medicao: 'cadastro_inicial'
            });

          // Criar pontos iniciais (equivalente ao ranking)
          await supabase
            .from('user_points')
            .insert({
              user_id: profile.id,
              total_points: 0,
              daily_points: 0,
              weekly_points: 0,
              monthly_points: 0,
              current_streak: 0,
              best_streak: 0,
              completed_challenges: 0,
              last_activity_date: new Date().toISOString().split('T')[0]
            });

          console.log('✅ Fallback manual concluído com sucesso');
          
        } catch (fallbackError) {
          console.error('❌ Erro no fallback manual:', fallbackError);
          return { error: new Error('Erro ao completar cadastro. Tente novamente.') };
        }
      } else {
        console.log('✅ Cadastro completo realizado via stored procedure:', registrationResult);
      }

      return { error: null };
      
    } catch (error) {
      console.error('❌ Erro geral no signUp:', error);
      if (error instanceof Error) {
        return { error };
      }
      return { error: new Error('Erro inesperado no cadastro. Tente novamente.') };
    }
  };

  const signOut = async () => {
    try {
      // Limpar todos os dados do localStorage relacionados ao usuário
      if (user) {
        localStorage.removeItem(`physical_data_complete_${user.id}`);
        // Limpar outros dados em cache se necessário
        Object.keys(localStorage).forEach(key => {
          if (key.includes(user.id)) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Fazer logout no Supabase
      await supabase.auth.signOut();
      
      // Limpar estado local
      setUser(null);
      setSession(null);
      
      // Redirecionar para página inicial (se necessário)
      window.location.href = '/';
      
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      // Mesmo com erro, limpar estado local
      setUser(null);
      setSession(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      signIn,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};