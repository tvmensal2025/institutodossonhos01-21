-- Create medical_documents table
CREATE TABLE IF NOT EXISTS medical_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('exame_laboratorial', 'exame_imagem', 'relatorio_medico', 'prescricao', 'historico_clinico', 'certificado_medico')),
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  description TEXT,
  doctor_name TEXT,
  clinic_name TEXT,
  exam_date DATE,
  results TEXT,
  status TEXT NOT NULL DEFAULT 'normal' CHECK (status IN ('normal', 'alterado', 'critico', 'pendente')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_medical_documents_user_id ON medical_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_medical_documents_type ON medical_documents(type);
CREATE INDEX IF NOT EXISTS idx_medical_documents_status ON medical_documents(status);
CREATE INDEX IF NOT EXISTS idx_medical_documents_created_at ON medical_documents(created_at);

-- Enable RLS
ALTER TABLE medical_documents ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own medical documents" ON medical_documents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own medical documents" ON medical_documents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medical documents" ON medical_documents
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medical documents" ON medical_documents
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_medical_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_medical_documents_updated_at
  BEFORE UPDATE ON medical_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_medical_documents_updated_at(); 