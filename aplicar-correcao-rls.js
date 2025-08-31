import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE1MzA0NywiZXhwIjoyMDY4NzI5MDQ3fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8'; // Service key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function aplicarCorrecaoRLS() {
  console.log('🔧 Aplicando correção RLS...');
  
  try {
    // 1. Desabilitar RLS na tabela challenges
    console.log('1. Desabilitando RLS em challenges...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE challenges DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error1) {
      console.log('⚠️ Erro ao desabilitar RLS em challenges:', error1.message);
    } else {
      console.log('✅ RLS desabilitado em challenges');
    }
    
    // 2. Desabilitar RLS na tabela challenge_participations
    console.log('2. Desabilitando RLS em challenge_participations...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE challenge_participations DISABLE ROW LEVEL SECURITY;'
    });
    
    if (error2) {
      console.log('⚠️ Erro ao desabilitar RLS em challenge_participations:', error2.message);
    } else {
      console.log('✅ RLS desabilitado em challenge_participations');
    }
    
    console.log('🎉 Correção RLS aplicada!');
    
  } catch (error) {
    console.error('❌ Erro ao aplicar correção:', error);
  }
}

aplicarCorrecaoRLS(); 