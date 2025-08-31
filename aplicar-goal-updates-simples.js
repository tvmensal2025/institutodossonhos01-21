import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verificarGoalUpdates() {
  console.log('🔍 Verificando tabela goal_updates...');
  
  try {
    // 1. Verificar se a tabela existe
    console.log('1. Verificando se a tabela existe...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'goal_updates');

    if (tablesError) {
      console.error('❌ Erro ao verificar tabelas:', tablesError);
      return;
    }

    if (tables && tables.length > 0) {
      console.log('✅ Tabela goal_updates já existe!');
      
      // 2. Verificar estrutura da tabela
      console.log('2. Verificando estrutura...');
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', 'goal_updates')
        .order('ordinal_position');

      if (columnsError) {
        console.error('❌ Erro ao verificar colunas:', columnsError);
        return;
      }

      console.log('📋 Estrutura da tabela goal_updates:');
      console.table(columns);

      // 3. Testar inserção
      console.log('3. Testando inserção...');
      const { data: testData, error: testError } = await supabase
        .from('goal_updates')
        .insert({
          goal_id: '00000000-0000-0000-0000-000000000000',
          user_id: '00000000-0000-0000-0000-000000000000',
          new_value: 1.0,
          notes: 'Teste de inserção'
        })
        .select();

      if (testError) {
        console.error('❌ Erro no teste de inserção:', testError);
        console.log('🔧 Isso pode ser devido a RLS ou políticas de segurança');
      } else {
        console.log('✅ Teste de inserção bem-sucedido!');
        console.log('📝 Dados inseridos:', testData);
      }

    } else {
      console.log('❌ Tabela goal_updates NÃO existe!');
      console.log('🔧 Você precisa criar a tabela manualmente no Supabase Dashboard');
      console.log('📋 SQL para criar a tabela:');
      console.log(`
CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create their own goal updates" 
ON public.goal_updates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goal updates" 
ON public.goal_updates 
FOR SELECT 
USING (auth.uid() = user_id);
      `);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

verificarGoalUpdates(); 