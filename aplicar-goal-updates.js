import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTQ5NzI5MSwiZXhwIjoyMDUxMDczMjkxfQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function aplicarGoalUpdates() {
  console.log('🔧 Aplicando tabela goal_updates...');
  
  try {
    // 1. Criar tabela goal_updates
    console.log('1. Criando tabela goal_updates...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.goal_updates (
          id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
          goal_id UUID NOT NULL,
          user_id UUID NOT NULL,
          previous_value NUMERIC,
          new_value NUMERIC NOT NULL,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
        );
      `
    });

    if (createError) {
      console.error('❌ Erro ao criar tabela:', createError);
      return;
    }

    // 2. Habilitar RLS
    console.log('2. Habilitando RLS...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;'
    });

    if (rlsError) {
      console.error('❌ Erro ao habilitar RLS:', rlsError);
      return;
    }

    // 3. Criar políticas RLS
    console.log('3. Criando políticas RLS...');
    const policies = [
      `CREATE POLICY "Users can create their own goal updates" 
       ON public.goal_updates 
       FOR INSERT 
       WITH CHECK (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can view their own goal updates" 
       ON public.goal_updates 
       FOR SELECT 
       USING (auth.uid() = user_id);`,
      
      `CREATE POLICY "Users can update their own goal updates" 
       ON public.goal_updates 
       FOR UPDATE 
       USING (auth.uid() = user_id);`
    ];

    for (const policy of policies) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: policy });
      if (policyError) {
        console.error('❌ Erro ao criar política:', policyError);
        return;
      }
    }

    // 4. Verificar se a tabela foi criada
    console.log('4. Verificando tabela...');
    const { data: checkData, error: checkError } = await supabase.rpc('exec_sql', {
      sql: `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'goal_updates' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (checkError) {
      console.error('❌ Erro ao verificar tabela:', checkError);
      return;
    }

    console.log('✅ Tabela goal_updates criada com sucesso!');
    console.log('📋 Estrutura da tabela:');
    console.table(checkData);

    // 5. Testar inserção
    console.log('5. Testando inserção...');
    const { data: testData, error: testError } = await supabase
      .from('goal_updates')
      .insert({
        goal_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
        user_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
        new_value: 1.0,
        notes: 'Teste de inserção'
      })
      .select();

    if (testError) {
      console.error('❌ Erro no teste de inserção:', testError);
    } else {
      console.log('✅ Teste de inserção bem-sucedido!');
      console.log('📝 Dados inseridos:', testData);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

aplicarGoalUpdates(); 