import { createClient } from '@supabase/supabase-js';

// Usar as variáveis do env.example
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function aplicarMigracao() {
  try {
    console.log('🚀 Aplicando migração de controle de acesso aos exames...');
    
    // Criar tabela
    console.log('📋 Criando tabela monthly_exam_access...');
    const { error: tableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS monthly_exam_access (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
          last_access_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          access_count INTEGER DEFAULT 1,
          month_year VARCHAR(7) NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, month_year)
        );
        
        CREATE INDEX IF NOT EXISTS idx_monthly_exam_access_user_id ON monthly_exam_access(user_id);
        CREATE INDEX IF NOT EXISTS idx_monthly_exam_access_month_year ON monthly_exam_access(month_year);
        
        ALTER TABLE monthly_exam_access ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Users can view their own exam access" ON monthly_exam_access
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert their own exam access" ON monthly_exam_access
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update their own exam access" ON monthly_exam_access
          FOR UPDATE USING (auth.uid() = user_id);
      `
    });
    
    if (tableError) {
      console.error('❌ Erro ao criar tabela:', tableError);
      return;
    }
    
    // Criar funções
    console.log('🔧 Criando funções de controle...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION can_access_exams_this_month(user_uuid UUID)
        RETURNS BOOLEAN AS $$
        DECLARE
          current_month VARCHAR(7);
          access_record RECORD;
        BEGIN
          current_month := TO_CHAR(NOW(), 'YYYY-MM');
          
          SELECT * INTO access_record 
          FROM monthly_exam_access 
          WHERE user_id = user_uuid 
            AND month_year = current_month;
          
          IF access_record IS NULL THEN
            RETURN TRUE;
          END IF;
          
          RETURN FALSE;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        CREATE OR REPLACE FUNCTION register_exam_access(user_uuid UUID)
        RETURNS VOID AS $$
        DECLARE
          current_month VARCHAR(7);
        BEGIN
          current_month := TO_CHAR(NOW(), 'YYYY-MM');
          
          INSERT INTO monthly_exam_access (user_id, month_year, last_access_date, access_count)
          VALUES (user_uuid, current_month, NOW(), 1)
          ON CONFLICT (user_id, month_year) 
          DO UPDATE SET
            last_access_date = NOW(),
            access_count = monthly_exam_access.access_count + 1,
            updated_at = NOW();
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
        
        CREATE OR REPLACE FUNCTION get_next_exam_access_date(user_uuid UUID)
        RETURNS TIMESTAMP WITH TIME ZONE AS $$
        DECLARE
          current_month VARCHAR(7);
          access_record RECORD;
        BEGIN
          current_month := TO_CHAR(NOW(), 'YYYY-MM');
          
          SELECT * INTO access_record 
          FROM monthly_exam_access 
          WHERE user_id = user_uuid 
            AND month_year = current_month;
          
          IF access_record IS NULL THEN
            RETURN NOW();
          END IF;
          
          RETURN (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::TIMESTAMP WITH TIME ZONE;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });
    
    if (functionError) {
      console.error('❌ Erro ao criar funções:', functionError);
      return;
    }
    
    console.log('✅ Migração aplicada com sucesso!');
    console.log('📋 Tabela monthly_exam_access criada');
    console.log('🔧 Funções de controle criadas');
    console.log('🔒 Políticas RLS configuradas');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}

aplicarMigracao(); 