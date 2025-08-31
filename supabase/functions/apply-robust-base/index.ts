import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-requested-with, Authorization, X-Client-Info, Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🛡️ APLICANDO BASE ROBUSTA DE FORMA SEGURA');
    console.log('===========================================');

    // Inicializar cliente Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // SQL para criar as tabelas da base robusta
    const sqlCommands = [
      // 1. Tabela alimentos_completos
      `CREATE TABLE IF NOT EXISTS alimentos_completos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        nome_cientifico VARCHAR(255),
        nome_ingles VARCHAR(255),
        categoria VARCHAR(100) NOT NULL,
        subcategoria VARCHAR(100),
        origem VARCHAR(100),
        sazonalidade VARCHAR(50),
        disponibilidade VARCHAR(50),
        regiao_origem VARCHAR(100),
        culinarias TEXT,
        propriedades_medicinais TEXT,
        principios_ativos TEXT[],
        indicacoes_terapeuticas TEXT[],
        contraindicacoes TEXT,
        interacoes_medicamentosas TEXT[],
        dosagem_terapeutica VARCHAR(100),
        forma_preparo_medicinal TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`,

      // 2. Tabela valores_nutricionais_completos
      `CREATE TABLE IF NOT EXISTS valores_nutricionais_completos (
        id SERIAL PRIMARY KEY,
        alimento_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
        proteina DECIMAL(5,2),
        carboidrato DECIMAL(5,2),
        gordura DECIMAL(5,2),
        gordura_saturada DECIMAL(5,2),
        gordura_insaturada DECIMAL(5,2),
        gordura_trans DECIMAL(5,2),
        fibras DECIMAL(5,2),
        fibras_soluveis DECIMAL(5,2),
        fibras_insoluveis DECIMAL(5,2),
        calorias INTEGER,
        indice_glicemico INTEGER,
        indice_saciedade INTEGER,
        carga_glicemica DECIMAL(5,2),
        vitamina_a DECIMAL(5,2),
        vitamina_c DECIMAL(5,2),
        vitamina_d DECIMAL(5,2),
        vitamina_e DECIMAL(5,2),
        vitamina_k DECIMAL(5,2),
        vitamina_b1 DECIMAL(5,2),
        vitamina_b2 DECIMAL(5,2),
        vitamina_b3 DECIMAL(5,2),
        vitamina_b5 DECIMAL(5,2),
        vitamina_b6 DECIMAL(5,2),
        vitamina_b7 DECIMAL(5,2),
        vitamina_b9 DECIMAL(5,2),
        vitamina_b12 DECIMAL(5,2),
        calcio DECIMAL(5,2),
        ferro DECIMAL(5,2),
        magnesio DECIMAL(5,2),
        potassio DECIMAL(5,2),
        zinco DECIMAL(5,2),
        selenio DECIMAL(5,2),
        cobre DECIMAL(5,2),
        manganes DECIMAL(5,2),
        fosforo DECIMAL(5,2),
        sodio DECIMAL(5,2),
        omega_3 DECIMAL(5,2),
        omega_6 DECIMAL(5,2),
        omega_9 DECIMAL(5,2),
        ala DECIMAL(5,2),
        epa DECIMAL(5,2),
        dha DECIMAL(5,2),
        pdcaas DECIMAL(3,2),
        valor_biologico INTEGER,
        aminoacidos_essenciais JSONB,
        polifenois DECIMAL(5,2),
        flavonoides DECIMAL(5,2),
        carotenoides DECIMAL(5,2),
        resveratrol DECIMAL(5,2),
        quercetina DECIMAL(5,2),
        colina DECIMAL(5,2),
        inositol DECIMAL(5,2),
        betaina DECIMAL(5,2),
        taurina DECIMAL(5,2),
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // 3. Tabela doencas_condicoes
      `CREATE TABLE IF NOT EXISTS doencas_condicoes (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        descricao TEXT,
        sintomas TEXT[],
        causas TEXT[],
        fatores_risco TEXT[],
        complicacoes TEXT[],
        exames_diagnostico TEXT[],
        tratamentos_convencionais TEXT[],
        abordagem_nutricional TEXT,
        alimentos_beneficos TEXT[],
        alimentos_evitar TEXT[],
        suplementos_recomendados TEXT[],
        estilo_vida TEXT[],
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // 4. Tabela substituicoes_inteligentes
      `CREATE TABLE IF NOT EXISTS substituicoes_inteligentes (
        id SERIAL PRIMARY KEY,
        alimento_original_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
        alimento_substituto_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
        motivo_substituicao VARCHAR(100),
        doenca_condicao_id INTEGER REFERENCES doencas_condicoes(id),
        beneficio_esperado TEXT,
        similaridade_nutricional INTEGER CHECK (similaridade_nutricional >= 1 AND similaridade_nutricional <= 10),
        vantagens TEXT,
        desvantagens TEXT,
        forma_preparo TEXT,
        dosagem_equivalente VARCHAR(100),
        tempo_adaptacao VARCHAR(100),
        contraindicacoes TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // 5. Tabela combinacoes_terapeuticas
      `CREATE TABLE IF NOT EXISTS combinacoes_terapeuticas (
        id SERIAL PRIMARY KEY,
        alimento1_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
        alimento2_id INTEGER REFERENCES alimentos_completos(id) ON DELETE CASCADE,
        nome_combinacao VARCHAR(255),
        beneficio_sinergia TEXT,
        mecanismo_sinergia TEXT,
        evidencia_cientifica VARCHAR(50),
        dosagem_recomendada VARCHAR(100),
        forma_preparo TEXT,
        contraindicacoes TEXT,
        nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // 6. Tabela principios_ativos
      `CREATE TABLE IF NOT EXISTS principios_ativos (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        categoria VARCHAR(100),
        descricao TEXT,
        mecanismo_acao TEXT,
        beneficios_terapeuticos TEXT[],
        efeitos_colaterais TEXT[],
        dosagem_segura VARCHAR(100),
        interacoes_medicamentosas TEXT[],
        evidencia_cientifica VARCHAR(50),
        nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // 7. Tabela receitas_terapeuticas
      `CREATE TABLE IF NOT EXISTS receitas_terapeuticas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        objetivo_terapeutico VARCHAR(255),
        ingredientes JSONB,
        instrucoes_preparo TEXT,
        tempo_preparo INTEGER,
        dificuldade VARCHAR(50),
        beneficios_terapeuticos TEXT[],
        contraindicacoes TEXT,
        dosagem_recomendada VARCHAR(100),
        frequencia_consumo VARCHAR(100),
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // 8. Tabela protocolos_nutricionais
      `CREATE TABLE IF NOT EXISTS protocolos_nutricionais (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        objetivo VARCHAR(255),
        descricao TEXT,
        duracao VARCHAR(100),
        fase1_alimentos TEXT[],
        fase2_alimentos TEXT[],
        fase3_alimentos TEXT[],
        alimentos_evitar TEXT[],
        suplementos_recomendados TEXT[],
        estilo_vida TEXT[],
        contraindicacoes TEXT,
        evidencia_cientifica VARCHAR(50),
        nivel_evidencia INTEGER CHECK (nivel_evidencia >= 1 AND nivel_evidencia <= 5),
        created_at TIMESTAMP DEFAULT NOW()
      )`,

      // 9. Criar índices
      `CREATE INDEX IF NOT EXISTS idx_alimentos_completos_categoria ON alimentos_completos(categoria)`,
      `CREATE INDEX IF NOT EXISTS idx_alimentos_completos_subcategoria ON alimentos_completos(subcategoria)`,
      `CREATE INDEX IF NOT EXISTS idx_doencas_condicoes_categoria ON doencas_condicoes(categoria)`,
      `CREATE INDEX IF NOT EXISTS idx_substituicoes_original ON substituicoes_inteligentes(alimento_original_id)`,
      `CREATE INDEX IF NOT EXISTS idx_substituicoes_substituto ON substituicoes_inteligentes(alimento_substituto_id)`,
      `CREATE INDEX IF NOT EXISTS idx_combinacoes_alimento1 ON combinacoes_terapeuticas(alimento1_id)`,
      `CREATE INDEX IF NOT EXISTS idx_combinacoes_alimento2 ON combinacoes_terapeuticas(alimento2_id)`,
      `CREATE INDEX IF NOT EXISTS idx_principios_ativos_categoria ON principios_ativos(categoria)`
    ];

    console.log(`🔧 Executando ${sqlCommands.length} comandos SQL...`);

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Executar cada comando SQL
    for (let i = 0; i < sqlCommands.length; i++) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: sqlCommands[i] });
        
        if (error) {
          console.log(`❌ Comando ${i + 1}: ${error.message}`);
          errorCount++;
          errors.push(`Comando ${i + 1}: ${error.message}`);
        } else {
          console.log(`✅ Comando ${i + 1}: Executado com sucesso`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Comando ${i + 1}: ${err.message}`);
        errorCount++;
        errors.push(`Comando ${i + 1}: ${err.message}`);
      }
    }

    console.log('');
    console.log('📊 RESUMO DA APLICAÇÃO:');
    console.log('========================');
    console.log(`✅ Comandos executados com sucesso: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    console.log(`📈 Taxa de sucesso: ${((successCount / sqlCommands.length) * 100).toFixed(1)}%`);

    if (successCount > 0) {
      console.log('');
      console.log('🎉 BASE ROBUSTA APLICADA COM SUCESSO!');
      console.log('🛡️ IA ATUAL NÃO FOI AFETADA');
      console.log('🎯 Próximo passo: Inserir dados na base robusta');
    } else {
      console.log('');
      console.log('❌ FALHA NA APLICAÇÃO');
      console.log('💡 Verifique as permissões do banco de dados');
    }

    return new Response(
      JSON.stringify({
        success: successCount > 0,
        successCount,
        errorCount,
        successRate: ((successCount / sqlCommands.length) * 100).toFixed(1),
        errors: errors.length > 0 ? errors : null,
        message: successCount > 0 
          ? 'Base robusta aplicada com sucesso! IA atual não foi afetada.'
          : 'Falha na aplicação. Verifique as permissões do banco.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: successCount > 0 ? 200 : 500
      }
    );

  } catch (error) {
    console.error('❌ Erro geral:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        message: 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});





