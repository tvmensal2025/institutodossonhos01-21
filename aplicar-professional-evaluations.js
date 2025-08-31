const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Configurado' : '❌ Faltando');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅ Configurado' : '❌ Faltando');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function aplicarProfessionalEvaluations() {
  console.log('🚀 Aplicando migração da tabela professional_evaluations...\n');

  try {
    // 1. Verificar se a tabela existe
    console.log('📋 Verificando se a tabela professional_evaluations existe...');
    const { data: tableExists, error: checkError } = await supabase
      .from('professional_evaluations')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      console.log('❌ Tabela não existe, aplicando migração...');
    } else {
      console.log('✅ Tabela já existe');
    }

    // 2. Aplicar a migração SQL
    console.log('\n🔧 Aplicando estrutura da tabela...');
    
    const migrationSQL = `
      -- Tabela para avaliações profissionais com adipômetro
      CREATE TABLE IF NOT EXISTS professional_evaluations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
          
          -- Medidas básicas
          weight_kg DECIMAL(5,2) NOT NULL,
          abdominal_circumference_cm DECIMAL(5,2),
          waist_circumference_cm DECIMAL(5,2),
          hip_circumference_cm DECIMAL(5,2),
          
          -- Dobras cutâneas (adipômetro)
          skinfold_triceps_mm DECIMAL(4,1),
          skinfold_suprailiac_mm DECIMAL(4,1),
          skinfold_thigh_mm DECIMAL(4,1),
          skinfold_chest_mm DECIMAL(4,1),
          skinfold_abdomen_mm DECIMAL(4,1),
          skinfold_subscapular_mm DECIMAL(4,1),
          skinfold_midaxillary_mm DECIMAL(4,1),
          
          -- Métricas calculadas
          body_fat_percentage DECIMAL(4,2),
          fat_mass_kg DECIMAL(5,2),
          lean_mass_kg DECIMAL(5,2),
          muscle_mass_kg DECIMAL(5,2),
          bmi DECIMAL(4,2),
          bmr_kcal INTEGER,
          waist_to_height_ratio DECIMAL(4,3),
          waist_to_hip_ratio DECIMAL(4,3),
          muscle_to_fat_ratio DECIMAL(4,2),
          
          -- Classificação de risco
          risk_level TEXT CHECK (risk_level IN ('low', 'moderate', 'high')),
          risk_classification_details JSONB,
          
          -- Método usado
          evaluation_method TEXT DEFAULT 'jackson_pollock_3',
          evaluator_id UUID REFERENCES auth.users(id),
          
          -- Observações
          notes TEXT,
          
          -- Metadados
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Garantir coluna evaluator_id em bases já existentes
      ALTER TABLE professional_evaluations ADD COLUMN IF NOT EXISTS evaluator_id UUID;

      -- Índices para performance
      CREATE INDEX IF NOT EXISTS idx_professional_evaluations_user_id ON professional_evaluations(user_id);
      CREATE INDEX IF NOT EXISTS idx_professional_evaluations_date ON professional_evaluations(evaluation_date DESC);
      CREATE INDEX IF NOT EXISTS idx_professional_evaluations_evaluator ON professional_evaluations(evaluator_id);

      -- Habilitar RLS
      ALTER TABLE professional_evaluations ENABLE ROW LEVEL SECURITY;
    `;

    const { error: migrationError } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (migrationError) {
      console.log('⚠️ Erro na migração (pode ser normal se já existir):', migrationError.message);
    } else {
      console.log('✅ Estrutura da tabela aplicada');
    }

    // 3. Aplicar políticas RLS
    console.log('\n🔐 Aplicando políticas de segurança...');
    
    const policiesSQL = `
      -- Políticas de acesso
      DO $$ BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='professional_evaluations' AND policyname='Admins can create evaluations'
        ) THEN
          CREATE POLICY "Admins can create evaluations" ON professional_evaluations
            FOR INSERT WITH CHECK (
              EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE (p.user_id = auth.uid() OR p.id = auth.uid()) AND p.role = 'admin'
              )
            );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='professional_evaluations' AND policyname='Admins can view all evaluations'
        ) THEN
          CREATE POLICY "Admins can view all evaluations" ON professional_evaluations
            FOR SELECT USING (
              EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE (p.user_id = auth.uid() OR p.id = auth.uid()) AND p.role = 'admin'
              )
            );
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='professional_evaluations' AND policyname='Users can view own evaluations'
        ) THEN
          CREATE POLICY "Users can view own evaluations" ON professional_evaluations
            FOR SELECT USING (auth.uid() = user_id);
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='professional_evaluations' AND policyname='Admins can update evaluations'
        ) THEN
          CREATE POLICY "Admins can update evaluations" ON professional_evaluations
            FOR UPDATE USING (
              EXISTS (
                SELECT 1 FROM public.profiles p 
                WHERE (p.user_id = auth.uid() OR p.id = auth.uid()) AND p.role = 'admin'
              )
            );
        END IF;
      END $$;
    `;

    const { error: policiesError } = await supabase.rpc('exec_sql', { sql: policiesSQL });
    
    if (policiesError) {
      console.log('⚠️ Erro nas políticas (pode ser normal se já existirem):', policiesError.message);
    } else {
      console.log('✅ Políticas de segurança aplicadas');
    }

    // 4. Aplicar funções e triggers
    console.log('\n⚙️ Aplicando funções e triggers...');
    
    const functionsSQL = `
      -- Função para atualizar updated_at
      CREATE OR REPLACE FUNCTION update_professional_evaluations_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger para updated_at
      DROP TRIGGER IF EXISTS update_professional_evaluations_updated_at ON professional_evaluations;
      CREATE TRIGGER update_professional_evaluations_updated_at
        BEFORE UPDATE ON professional_evaluations
        FOR EACH ROW
        EXECUTE FUNCTION update_professional_evaluations_updated_at();

      -- Função para calcular métricas automaticamente
      CREATE OR REPLACE FUNCTION calculate_evaluation_metrics()
      RETURNS TRIGGER AS $$
      DECLARE
          user_profile RECORD;
          body_density DECIMAL;
          sum_skinfolds DECIMAL;
      BEGIN
          -- Busca dados do usuário
          SELECT height_cm, birth_date, gender INTO user_profile
          FROM user_physical_profiles
          WHERE user_id = NEW.user_id;
          
          IF user_profile IS NOT NULL THEN
              -- Calcula idade
              DECLARE
                  age INTEGER := EXTRACT(YEAR FROM AGE(CURRENT_DATE, user_profile.birth_date));
              BEGIN
                  -- Calcula densidade corporal usando Jackson & Pollock
                  IF user_profile.gender = 'M' THEN
                      -- Homens: Peitoral, Abdômen, Coxa
                      sum_skinfolds := COALESCE(NEW.skinfold_chest_mm, 0) + 
                                       COALESCE(NEW.skinfold_abdomen_mm, 0) + 
                                       COALESCE(NEW.skinfold_thigh_mm, 0);
                      body_density := 1.10938 - (0.0008267 * sum_skinfolds) + 
                                      (0.0000016 * sum_skinfolds * sum_skinfolds) - 
                                      (0.0002574 * age);
                  ELSE
                      -- Mulheres: Tríceps, Supra-ilíaca, Coxa
                      sum_skinfolds := COALESCE(NEW.skinfold_triceps_mm, 0) + 
                                       COALESCE(NEW.skinfold_suprailiac_mm, 0) + 
                                       COALESCE(NEW.skinfold_thigh_mm, 0);
                      body_density := 1.0994921 - (0.0009929 * sum_skinfolds) + 
                                      (0.0000023 * sum_skinfolds * sum_skinfolds) - 
                                      (0.0001392 * age);
                  END IF;
                  
                  -- Calcula % de gordura usando Siri
                  NEW.body_fat_percentage := ((4.95 / body_density) - 4.5) * 100;
                  NEW.body_fat_percentage := GREATEST(0, LEAST(50, NEW.body_fat_percentage));
                  
                  -- Calcula outras métricas
                  NEW.fat_mass_kg := NEW.weight_kg * (NEW.body_fat_percentage / 100);
                  NEW.lean_mass_kg := NEW.weight_kg - NEW.fat_mass_kg;
                  NEW.muscle_mass_kg := NEW.lean_mass_kg * 0.45;
                  
                  -- IMC
                  NEW.bmi := NEW.weight_kg / POWER(user_profile.height_cm / 100.0, 2);
                  
                  -- TMB usando Mifflin-St Jeor
                  IF user_profile.gender = 'M' THEN
                      NEW.bmr_kcal := (10 * NEW.weight_kg) + (6.25 * user_profile.height_cm) - (5 * age) + 5;
                  ELSE
                      NEW.bmr_kcal := (10 * NEW.weight_kg) + (6.25 * user_profile.height_cm) - (5 * age) - 161;
                  END IF;
                  
                  -- Razões
                  IF NEW.waist_circumference_cm IS NOT NULL THEN
                      NEW.waist_to_height_ratio := NEW.waist_circumference_cm / user_profile.height_cm;
                  END IF;
                  
                  IF NEW.hip_circumference_cm IS NOT NULL AND NEW.hip_circumference_cm > 0 THEN
                      NEW.waist_to_hip_ratio := NEW.waist_circumference_cm / NEW.hip_circumference_cm;
                  END IF;
                  
                  IF NEW.fat_mass_kg > 0 THEN
                      NEW.muscle_to_fat_ratio := NEW.muscle_mass_kg / NEW.fat_mass_kg;
                  END IF;
                  
                  -- Classificação de risco
                  IF NEW.waist_to_height_ratio > 0.6 OR NEW.bmi > 30 THEN
                      NEW.risk_level := 'high';
                  ELSIF NEW.waist_to_height_ratio > 0.5 OR NEW.bmi > 25 THEN
                      NEW.risk_level := 'moderate';
                  ELSE
                      NEW.risk_level := 'low';
                  END IF;
              END;
          END IF;
          
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Trigger para calcular métricas automaticamente
      DROP TRIGGER IF EXISTS calculate_evaluation_metrics_trigger ON professional_evaluations;
      CREATE TRIGGER calculate_evaluation_metrics_trigger
          BEFORE INSERT OR UPDATE ON professional_evaluations
          FOR EACH ROW
          EXECUTE FUNCTION calculate_evaluation_metrics();
    `;

    const { error: functionsError } = await supabase.rpc('exec_sql', { sql: functionsSQL });
    
    if (functionsError) {
      console.log('⚠️ Erro nas funções (pode ser normal se já existirem):', functionsError.message);
    } else {
      console.log('✅ Funções e triggers aplicados');
    }

    // 5. Verificar se tudo está funcionando
    console.log('\n🔍 Verificando se tudo está funcionando...');
    
    const { data: testData, error: testError } = await supabase
      .from('professional_evaluations')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Erro ao testar tabela:', testError.message);
    } else {
      console.log('✅ Tabela funcionando corretamente');
      console.log(`📊 Avaliações existentes: ${testData?.length || 0}`);
    }

    // 6. Verificar se há usuários para testar
    console.log('\n👥 Verificando usuários disponíveis...');
    
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, full_name, email')
      .limit(5);

    if (usersError) {
      console.log('⚠️ Erro ao buscar usuários:', usersError.message);
    } else {
      console.log(`✅ Usuários encontrados: ${users?.length || 0}`);
      if (users && users.length > 0) {
        console.log('📋 Usuários disponíveis:');
        users.forEach(user => {
          console.log(`   - ${user.full_name} (${user.email})`);
        });
      }
    }

    console.log('\n🎉 Migração da tabela professional_evaluations concluída!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Acesse a página de avaliação profissional');
    console.log('2. Selecione um usuário');
    console.log('3. Crie uma nova avaliação');
    console.log('4. Os dados serão salvos no banco de dados');

  } catch (error) {
    console.error('❌ Erro durante a migração:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  aplicarProfessionalEvaluations();
}

module.exports = { aplicarProfessionalEvaluations };
