import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function aplicarTacoCompleto() {
  try {
    console.log('🚀 Iniciando aplicação da base TACO completa...');
    
    // Ler o arquivo CSV
    const csvPath = path.join(__dirname, 'data', 'TACO_Completo.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf-8');
    
    console.log('📖 Arquivo TACO lido com sucesso');
    
    // Parsear o CSV (formato simples)
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    // Baseado na estrutura real do CSV:
    // Coluna 1: Número do Alimento
    // Coluna 2: Descrição dos alimentos (nome)
    // Coluna 4: Energia (kcal)
    // Coluna 6: Proteína (g)
    // Coluna 7: Lipídeos (g)
    // Coluna 8: Carboidrato (g)
    // Coluna 9: Fibra (g)
    // Coluna 17: Sódio (mg)
    
    const alimentos = [];
    
    // Processar linhas de dados (pular 3 linhas de header)
    for (let i = 3; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(',');
      
      if (values.length < 18) continue; // Linha muito curta
      
      const numero = values[0]?.replace(/"/g, '').trim();
      const name = values[1]?.replace(/"/g, '').trim();
      const kcal = parseFloat(values[3]) || 0;
      const protein = parseFloat(values[5]) || 0;
      const fat = parseFloat(values[6]) || 0;
      const carbs = parseFloat(values[7]) || 0;
      const fiber = parseFloat(values[8]) || 0;
      const sodium = parseFloat(values[16]) || 0;
      
      // Filtrar apenas alimentos válidos
      if (name && name !== 'Descrição dos alimentos' && name !== 'Verduras, hortaliças e derivados' && kcal > 0) {
        alimentos.push({
          nome: name,
          kcal: Math.round(kcal * 100) / 100, // 2 casas decimais
          proteina: Math.round(protein * 100) / 100,
          gordura: Math.round(fat * 100) / 100,
          carboidrato: Math.round(carbs * 100) / 100,
          fibras: Math.round(fiber * 100) / 100,
          sodio: Math.round(sodium * 100) / 100
        });
      }
    }
    
    console.log(`✅ Processados ${alimentos.length} alimentos válidos`);
    
    // Criar SQL de inserção
    let sql = `-- ========================================
-- APLICAR BASE TACO COMPLETA
-- ${alimentos.length} alimentos processados
-- ========================================

-- Limpar dados existentes (opcional)
-- DELETE FROM valores_nutricionais_completos;
-- DELETE FROM alimentos_completos;

-- Inserir alimentos
INSERT INTO alimentos_completos (nome, categoria, subcategoria) VALUES
`;

    // Inserir alimentos
    const alimentosSQL = alimentos.map((alimento, index) => {
      const categoria = 'TACO';
      const subcategoria = 'Alimento';
      return `('${alimento.nome.replace(/'/g, "''")}', '${categoria}', '${subcategoria}')`;
    });
    
    sql += alimentosSQL.join(',\n') + ';\n\n';
    
    // Inserir valores nutricionais
    sql += `-- Inserir valores nutricionais
INSERT INTO valores_nutricionais_completos (alimento_id, proteina, carboidrato, gordura, fibras, calorias, sodio) VALUES
`;
    
    const valoresSQL = alimentos.map((alimento, index) => {
      return `(${index + 1}, ${alimento.proteina}, ${alimento.carboidrato}, ${alimento.gordura}, ${alimento.fibras}, ${alimento.kcal}, ${alimento.sodio})`;
    });
    
    sql += valoresSQL.join(',\n') + ';\n\n';
    
    // Adicionar comentário final
    sql += `-- ========================================
-- BASE TACO APLICADA COM SUCESSO
-- Total: ${alimentos.length} alimentos
-- ========================================`;
    
    // Salvar arquivo SQL
    const sqlPath = path.join(__dirname, 'aplicar-taco-completo.sql');
    fs.writeFileSync(sqlPath, sql, 'utf-8');
    
    console.log(`💾 SQL salvo em: ${sqlPath}`);
    console.log(`📊 Total de alimentos: ${alimentos.length}`);
    
    // Mostrar alguns exemplos
    console.log('\n🍎 Exemplos de alimentos processados:');
    alimentos.slice(0, 5).forEach((alimento, i) => {
      console.log(`${i + 1}. ${alimento.nome}: ${alimento.kcal} kcal, ${alimento.proteina}g proteína, ${alimento.carboidrato}g carboidratos`);
    });
    
    return { success: true, count: alimentos.length, file: sqlPath };
    
  } catch (error) {
    console.error('❌ Erro ao processar TACO:', error);
    return { success: false, error: error.message };
  }
}

// Executar se chamado diretamente
aplicarTacoCompleto().then(result => {
  if (result.success) {
    console.log('\n✅ Processo concluído com sucesso!');
    console.log(`📁 Arquivo gerado: ${result.file}`);
  } else {
    console.log('\n❌ Processo falhou:', result.error);
  }
});
