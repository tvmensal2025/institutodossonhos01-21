import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function aplicarFuncaoJoinChallenge() {
  console.log('🔧 Aplicando função join_challenge no Supabase...\n');

  try {
    // SQL para criar a função join_challenge
    const sqlFunction = `
      CREATE OR REPLACE FUNCTION public.join_challenge(
        user_uuid UUID,
        challenge_uuid UUID
      )
      RETURNS JSON
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      DECLARE
        challenge_record RECORD;
        participation_id UUID;
        result JSON;
      BEGIN
        -- Buscar desafio
        SELECT * INTO challenge_record 
        FROM public.challenges 
        WHERE id = challenge_uuid AND is_active = true;
        
        IF NOT FOUND THEN
          RAISE EXCEPTION 'Desafio não encontrado ou inativo';
        END IF;
        
        -- Verificar se já participa
        IF EXISTS (
          SELECT 1 FROM public.challenge_participations 
          WHERE user_id = user_uuid AND challenge_id = challenge_uuid
        ) THEN
          RAISE EXCEPTION 'Usuário já participa deste desafio';
        END IF;
        
        -- Criar participação
        INSERT INTO public.challenge_participations (
          user_id,
          challenge_id,
          target_value,
          progress,
          started_at
        ) VALUES (
          user_uuid,
          challenge_uuid,
          challenge_record.daily_log_target,
          0,
          NOW()
        ) RETURNING id INTO participation_id;
        
        -- Retornar resultado
        result := JSON_BUILD_OBJECT(
          'participation_id', participation_id,
          'challenge_id', challenge_uuid,
          'user_id', user_uuid,
          'message', 'Participação criada com sucesso'
        );
        
        RETURN result;
      END;
      $$;
    `;

    // Executar a função SQL
    console.log('1. Executando função SQL...');
    const { data, error } = await supabase.rpc('exec_sql', { sql: sqlFunction });

    if (error) {
      console.error('❌ Erro ao executar SQL:', error);
      
      // Tentar método alternativo - inserção direta
      console.log('\n2. Tentando inserção direta na tabela...');
      const { data: testData, error: testError } = await supabase
        .from('challenge_participations')
        .insert({
          user_id: 'c6a29ad1-65b4-4fcb-bfd1-a61b48cb319e',
          challenge_id: '8e5196df-d576-450e-9f8e-78a6be6b83c9',
          target_value: 30,
          progress: 0
        })
        .select();

      if (testError) {
        console.error('❌ Erro na inserção direta:', testError);
      } else {
        console.log('✅ Inserção direta funcionou!');
        console.log('📊 Dados inseridos:', testData);
      }
      
      return;
    }

    console.log('✅ Função SQL executada com sucesso!');
    console.log('📊 Resultado:', data);

    // Verificar se a função foi criada
    console.log('\n3. Verificando se a função foi criada...');
    const { data: functions, error: functionsError } = await supabase
      .from('information_schema.routines')
      .select('routine_name')
      .eq('routine_schema', 'public')
      .eq('routine_name', 'join_challenge');

    if (functionsError) {
      console.error('❌ Erro ao verificar funções:', functionsError);
    } else {
      console.log('✅ Função join_challenge criada com sucesso!');
    }

  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

// Executar a aplicação da função
aplicarFuncaoJoinChallenge(); 