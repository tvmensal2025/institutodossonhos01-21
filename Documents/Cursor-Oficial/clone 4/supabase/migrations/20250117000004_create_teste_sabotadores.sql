-- Create table for teste_sabotadores
CREATE TABLE IF NOT EXISTS teste_sabotadores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scores JSONB NOT NULL,
  top_sabotadores JSONB NOT NULL,
  respostas_completas JSONB NOT NULL,
  data_teste TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE teste_sabotadores ENABLE ROW LEVEL SECURITY;

-- Users can only see their own test results
CREATE POLICY "Users can view own test results" ON teste_sabotadores
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own test results
CREATE POLICY "Users can insert own test results" ON teste_sabotadores
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own test results
CREATE POLICY "Users can update own test results" ON teste_sabotadores
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_teste_sabotadores_user_id ON teste_sabotadores(user_id);
CREATE INDEX IF NOT EXISTS idx_teste_sabotadores_data_teste ON teste_sabotadores(data_teste DESC); 