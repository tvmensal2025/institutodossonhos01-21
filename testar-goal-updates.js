import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testarGoalUpdates() {
  console.log('🧪 Testando tabela goal_updates...');
  
  try {
    // Tentar inserir na tabela goal_updates
    console.log('1. Tentando inserir na tabela goal_updates...');
    const { data: insertData, error: insertError } = await supabase
      .from('goal_updates')
      .insert({
        goal_id: '00000000-0000-0000-0000-000000000000',
        user_id: '00000000-0000-0000-0000-000000000000',
        new_value: 1.0,
        notes: 'Teste de inserção'
      })
      .select();

    if (insertError) {
      console.error('❌ Erro ao inserir:', insertError);
      
      if (insertError.code === '42P01') {
        console.log('🔍 DIAGNÓSTICO: Tabela goal_updates NÃO EXISTE!');
        console.log('📋 SOLUÇÃO: Você precisa criar a tabela no Supabase Dashboard');
        console.log('🔗 Acesse: https://supabase.com/dashboard/project/hlrkoyywjpckdotimtik/editor');
        console.log('📝 Execute este SQL:');
        console.log(`
-- Criar tabela goal_updates
CREATE TABLE IF NOT EXISTS public.goal_updates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID NOT NULL,
  user_id UUID NOT NULL,
  previous_value NUMERIC,
  new_value NUMERIC NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.goal_updates ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Users can create their own goal updates" 
ON public.goal_updates 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own goal updates" 
ON public.goal_updates 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own goal updates" 
ON public.goal_updates 
FOR UPDATE 
USING (auth.uid() = user_id);
        `);
      } else if (insertError.code === '42501') {
        console.log('🔍 DIAGNÓSTICO: Tabela existe mas RLS está bloqueando');
        console.log('📋 SOLUÇÃO: Verificar políticas RLS');
      } else {
        console.log('🔍 DIAGNÓSTICO: Outro erro - verificar estrutura da tabela');
      }
    } else {
      console.log('✅ Tabela goal_updates existe e está funcionando!');
      console.log('📝 Dados inseridos:', insertData);
    }

  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarGoalUpdates(); 