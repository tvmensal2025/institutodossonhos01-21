import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hlrkoyywjpckdotimtik.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTgzODA0MSwiZXhwIjoyMDUxNDE0MDQxfQ.u6hCHzOY3m5ELvG6WY7Lbt7TnoYgEFXVWA8Fm2E7EWU';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Dados essenciais TACO/TBCA precisos
const alimentosEssenciais = [
  // OVOS (dados TACO corretos - valores por 100g)
  { alimento_nome: 'ovo de galinha cozido', kcal: 155, proteina: 13, gorduras: 11, carboidratos: 1, fibras: 0, sodio: 140 },
  { alimento_nome: 'ovo', kcal: 155, proteina: 13, gorduras: 11, carboidratos: 1, fibras: 0, sodio: 140 },
  { alimento_nome: 'ovos', kcal: 155, proteina: 13, gorduras: 11, carboidratos: 1, fibras: 0, sodio: 140 },
  { alimento_nome: 'ovo cozido', kcal: 155, proteina: 13, gorduras: 11, carboidratos: 1, fibras: 0, sodio: 140 },
  { alimento_nome: 'ovo frito', kcal: 190, proteina: 14, gorduras: 15, carboidratos: 1, fibras: 0, sodio: 145 },

  // CARBOIDRATOS BRASILEIROS
  { alimento_nome: 'arroz branco cozido', kcal: 128, proteina: 3, gorduras: 0, carboidratos: 28, fibras: 2, sodio: 1 },
  { alimento_nome: 'arroz, branco, cozido', kcal: 128, proteina: 3, gorduras: 0, carboidratos: 28, fibras: 2, sodio: 1 },
  { alimento_nome: 'arroz', kcal: 128, proteina: 3, gorduras: 0, carboidratos: 28, fibras: 2, sodio: 1 },
  { alimento_nome: 'feijao preto cozido', kcal: 77, proteina: 5, gorduras: 1, carboidratos: 14, fibras: 8, sodio: 2 },
  { alimento_nome: 'feijão', kcal: 77, proteina: 5, gorduras: 1, carboidratos: 14, fibras: 8, sodio: 2 },
  { alimento_nome: 'feijao', kcal: 77, proteina: 5, gorduras: 1, carboidratos: 14, fibras: 8, sodio: 2 },

  // PROTEÍNAS ANIMAIS
  { alimento_nome: 'frango grelhado', kcal: 165, proteina: 31, gorduras: 4, carboidratos: 0, fibras: 0, sodio: 70 },
  { alimento_nome: 'frango', kcal: 165, proteina: 31, gorduras: 4, carboidratos: 0, fibras: 0, sodio: 70 },
  { alimento_nome: 'carne bovina cozida', kcal: 217, proteina: 26, gorduras: 11, carboidratos: 0, fibras: 0, sodio: 55 },
  { alimento_nome: 'carne', kcal: 217, proteina: 26, gorduras: 11, carboidratos: 0, fibras: 0, sodio: 55 },

  // VEGETAIS E VERDURAS
  { alimento_nome: 'salada verde', kcal: 14, proteina: 1, gorduras: 0, carboidratos: 2, fibras: 2, sodio: 5 },
  { alimento_nome: 'salada', kcal: 14, proteina: 1, gorduras: 0, carboidratos: 2, fibras: 2, sodio: 5 },
  { alimento_nome: 'tomate', kcal: 18, proteina: 1, gorduras: 0, carboidratos: 4, fibras: 1, sodio: 5 },
  { alimento_nome: 'abóbora', kcal: 26, proteina: 1, gorduras: 0, carboidratos: 7, fibras: 1, sodio: 1 },

  // MASSAS E PREPARAÇÕES
  { alimento_nome: 'lasanha', kcal: 135, proteina: 8, gorduras: 4, carboidratos: 18, fibras: 2, sodio: 180 },
  { alimento_nome: 'lasanha bolonhesa', kcal: 150, proteina: 10, gorduras: 6, carboidratos: 18, fibras: 2, sodio: 220 },

  // LATICÍNIOS
  { alimento_nome: 'queijo minas', kcal: 264, proteina: 17, gorduras: 20, carboidratos: 4, fibras: 0, sodio: 346 },
  { alimento_nome: 'queijo', kcal: 264, proteina: 17, gorduras: 20, carboidratos: 4, fibras: 0, sodio: 346 },
];

async function applyDataDirect() {
  console.log('🚀 APLICANDO DADOS DIRETAMENTE NA BASE...\n');
  
  try {
    // 1. Verificar se a tabela existe
    const { data: tableExists, error: tableError } = await supabase
      .from('valores_nutricionais_completos')
      .select('count', { count: 'exact', head: true });
    
    if (tableError) {
      console.log('❌ Tabela não existe, criando...');
      
      // Criar tabela via SQL direto
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS valores_nutricionais_completos (
            id SERIAL PRIMARY KEY,
            alimento_nome VARCHAR(255) UNIQUE NOT NULL,
            kcal INTEGER,
            proteina INTEGER,
            gorduras INTEGER, 
            carboidratos INTEGER,
            fibras INTEGER,
            sodio INTEGER,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `
      });
      
      if (createError) {
        console.error('❌ Erro ao criar tabela:', createError);
        return;
      }
    }

    console.log('✅ Tabela confirmada, inserindo dados...');

    // 2. Inserir dados em lotes
    for (let i = 0; i < alimentosEssenciais.length; i += 10) {
      const lote = alimentosEssenciais.slice(i, i + 10);
      
      const { data, error } = await supabase
        .from('valores_nutricionais_completos')
        .upsert(lote, { 
          onConflict: 'alimento_nome',
          ignoreDuplicates: false 
        });
      
      if (error) {
        console.error(`❌ Erro no lote ${Math.floor(i/10) + 1}:`, error);
      } else {
        console.log(`✅ Lote ${Math.floor(i/10) + 1} inserido (${lote.length} itens)`);
      }
    }

    // 3. Verificar resultado final
    const { data: finalCount } = await supabase
      .from('valores_nutricionais_completos')
      .select('*', { count: 'exact' });
    
    console.log(`\n🎉 CONCLUÍDO! Total de alimentos: ${finalCount?.length || 0}`);
    
    // 4. Teste rápido
    const { data: testeOvo } = await supabase
      .from('valores_nutricionais_completos')
      .select('*')
      .eq('alimento_nome', 'ovo')
      .single();
    
    if (testeOvo) {
      console.log(`\n🧪 TESTE: ${testeOvo.alimento_nome} = ${testeOvo.kcal} kcal/100g`);
      console.log(`   50g = ${(testeOvo.kcal * 50 / 100).toFixed(1)} kcal ✅`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

applyDataDirect();
