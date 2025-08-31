const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function aplicarMigracaoAIUsage() {
  console.log('🚀 Aplicando migração de IA Usage...');

  try {
    // 1. Criar tabela ai_usage_logs
    console.log('📊 Criando tabela ai_usage_logs...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ai_usage_logs (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          ai_name TEXT NOT NULL,
          characters_used INTEGER NOT NULL DEFAULT 0,
          cost_usd DECIMAL(10,6) NOT NULL DEFAULT 0,
          date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
          test_mode BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (error1) {
      console.log('⚠️ Tabela ai_usage_logs já existe ou erro:', error1.message);
    } else {
      console.log('✅ Tabela ai_usage_logs criada!');
    }

    // 2. Criar índices
    console.log('📈 Criando índices...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_date ON ai_usage_logs(date);
        CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_ai_name ON ai_usage_logs(ai_name);
        CREATE INDEX IF NOT EXISTS idx_ai_usage_logs_user_id ON ai_usage_logs(user_id);
      `
    });

    if (error2) {
      console.log('⚠️ Índices já existem ou erro:', error2.message);
    } else {
      console.log('✅ Índices criados!');
    }

    // 3. Criar tabela ai_configurations
    console.log('⚙️ Criando tabela ai_configurations...');
    const { error: error3 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ai_configurations (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          api_key TEXT,
          config_data JSONB,
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (error3) {
      console.log('⚠️ Tabela ai_configurations já existe ou erro:', error3.message);
    } else {
      console.log('✅ Tabela ai_configurations criada!');
    }

    // 4. Criar função e trigger
    console.log('🔧 Criando função e trigger...');
    const { error: error4 } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ language 'plpgsql';

        DROP TRIGGER IF EXISTS update_ai_configurations_updated_at ON ai_configurations;
        CREATE TRIGGER update_ai_configurations_updated_at 
            BEFORE UPDATE ON ai_configurations 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
      `
    });

    if (error4) {
      console.log('⚠️ Função/trigger já existem ou erro:', error4.message);
    } else {
      console.log('✅ Função e trigger criados!');
    }

    // 5. Habilitar RLS
    console.log('🔒 Habilitando RLS...');
    const { error: error5 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
        ALTER TABLE ai_configurations ENABLE ROW LEVEL SECURITY;
      `
    });

    if (error5) {
      console.log('⚠️ RLS já habilitado ou erro:', error5.message);
    } else {
      console.log('✅ RLS habilitado!');
    }

    // 6. Criar políticas RLS
    console.log('🛡️ Criando políticas RLS...');
    const { error: error6 } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Admins can view ai_usage_logs" ON ai_usage_logs;
        CREATE POLICY "Admins can view ai_usage_logs" ON ai_usage_logs
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );

        DROP POLICY IF EXISTS "Admins can insert ai_usage_logs" ON ai_usage_logs;
        CREATE POLICY "Admins can insert ai_usage_logs" ON ai_usage_logs
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );

        DROP POLICY IF EXISTS "Admins can manage ai_configurations" ON ai_configurations;
        CREATE POLICY "Admins can manage ai_configurations" ON ai_configurations
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM profiles 
              WHERE profiles.id = auth.uid() 
              AND profiles.role = 'admin'
            )
          );
      `
    });

    if (error6) {
      console.log('⚠️ Políticas já existem ou erro:', error6.message);
    } else {
      console.log('✅ Políticas RLS criadas!');
    }

    // 7. Inserir configuração padrão
    console.log('🎤 Inserindo configuração padrão de voz...');
    const { error: error7 } = await supabase
      .from('ai_configurations')
      .upsert({
        name: 'voice_config',
        config_data: {
          speakingRate: 0.70,
          pitch: 1.3,
          volumeGainDb: 1.2,
          voiceName: 'pt-BR-Neural2-C',
          isEnabled: true
        }
      }, { onConflict: 'name' });

    if (error7) {
      console.log('⚠️ Configuração já existe ou erro:', error7.message);
    } else {
      console.log('✅ Configuração padrão inserida!');
    }

    console.log('🎉 Migração de IA Usage aplicada com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   - ai_usage_logs (log de uso e custos)');
    console.log('   - ai_configurations (configurações de IA)');
    console.log('🔒 RLS habilitado para segurança');
    console.log('⚙️ Configuração padrão de voz inserida');

  } catch (error) {
    console.error('❌ Erro ao aplicar migração:', error);
    process.exit(1);
  }
}

aplicarMigracaoAIUsage();
