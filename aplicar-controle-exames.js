import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const migrationSQL = `
-- Migration: Controle de Acesso Mensal aos Exames
-- Data: 2025-01-01

-- Tabela para controlar acesso mensal aos exames
CREATE TABLE IF NOT EXISTS monthly_exam_access (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  last_access_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  access_count INTEGER DEFAULT 1,
  month_year VARCHAR(7) NOT NULL, -- formato: '2025-01'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, month_year)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_monthly_exam_access_user_id ON monthly_exam_access(user_id);
CREATE INDEX IF NOT EXISTS idx_monthly_exam_access_month_year ON monthly_exam_access(month_year);
CREATE INDEX IF NOT EXISTS idx_monthly_exam_access_last_access ON monthly_exam_access(last_access_date);

-- Habilitar RLS
ALTER TABLE monthly_exam_access ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own exam access" ON monthly_exam_access
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam access" ON monthly_exam_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam access" ON monthly_exam_access
  FOR UPDATE USING (auth.uid() = user_id);

-- Função para verificar se usuário pode acessar exames este mês
CREATE OR REPLACE FUNCTION can_access_exams_this_month(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  current_month VARCHAR(7);
  access_record RECORD;
BEGIN
  -- Obter mês atual no formato 'YYYY-MM'
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Verificar se existe registro para este mês
  SELECT * INTO access_record 
  FROM monthly_exam_access 
  WHERE user_id = user_uuid 
    AND month_year = current_month;
  
  -- Se não existe registro, pode acessar (primeira vez)
  IF access_record IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Se já acessou este mês, não pode acessar novamente
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para registrar acesso aos exames
CREATE OR REPLACE FUNCTION register_exam_access(user_uuid UUID)
RETURNS VOID AS $$
DECLARE
  current_month VARCHAR(7);
BEGIN
  -- Obter mês atual no formato 'YYYY-MM'
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Inserir ou atualizar registro de acesso
  INSERT INTO monthly_exam_access (user_id, month_year, last_access_date, access_count)
  VALUES (user_uuid, current_month, NOW(), 1)
  ON CONFLICT (user_id, month_year) 
  DO UPDATE SET
    last_access_date = NOW(),
    access_count = monthly_exam_access.access_count + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter próximo acesso disponível
CREATE OR REPLACE FUNCTION get_next_exam_access_date(user_uuid UUID)
RETURNS TIMESTAMP WITH TIME ZONE AS $$
DECLARE
  current_month VARCHAR(7);
  access_record RECORD;
BEGIN
  -- Obter mês atual no formato 'YYYY-MM'
  current_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Verificar se existe registro para este mês
  SELECT * INTO access_record 
  FROM monthly_exam_access 
  WHERE user_id = user_uuid 
    AND month_year = current_month;
  
  -- Se não existe registro, pode acessar agora
  IF access_record IS NULL THEN
    RETURN NOW();
  END IF;
  
  -- Se já acessou este mês, próximo acesso será no primeiro dia do próximo mês
  RETURN (DATE_TRUNC('month', NOW()) + INTERVAL '1 month')::TIMESTAMP WITH TIME ZONE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_monthly_exam_access_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_monthly_exam_access_updated_at
  BEFORE UPDATE ON monthly_exam_access
  FOR EACH ROW
  EXECUTE FUNCTION update_monthly_exam_access_updated_at();
`;

async function aplicarMigracao() {
  try {
    console.log('🚀 Aplicando migração de controle de acesso aos exames...');
    
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('❌ Erro ao aplicar migração:', error);
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