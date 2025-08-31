import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM5NjAyMzksImV4cCI6MjA0OTUzNjIzOX0.6EQFZ0Nw9QpBcMGIAOzWEm-8EiGNnQFHJXIQdMHH3fU';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🧪 TESTE: Verificando se refeições selecionadas são respeitadas');

// Teste 1: Apenas 2 refeições selecionadas (café da manhã e almoço)
console.log('\n🔍 TESTE 1: Apenas café da manhã e almoço');
const teste1 = {
  calorias: 2000,
  dias: 1,
  restricoes: [],
  preferencias: [],
  refeicoes_selecionadas: ['café da manhã', 'almoço']  // APENAS 2 REFEIÇÕES
};

try {
  const { data: resultado1, error: erro1 } = await supabase.functions.invoke('mealie-real', {
    body: teste1
  });

  if (erro1) {
    console.error('❌ Erro no teste 1:', erro1);
  } else {
    console.log('✅ Resultado teste 1:', resultado1.success);
    
    if (resultado1.data?.cardapio?.dia1) {
      const dia1 = resultado1.data.cardapio.dia1;
      const refeicoesGeradas = Object.keys(dia1).filter(key => key !== 'totais_nutricionais');
      
      console.log(`📊 REFEIÇÕES GERADAS (${refeicoesGeradas.length}):`, refeicoesGeradas);
      console.log('🎯 REFEIÇÕES ESPERADAS: 2 (cafe_manha, almoco)');
      
      if (refeicoesGeradas.length === 2) {
        console.log('✅ SUCESSO: Quantidade correta de refeições!');
      } else {
        console.log('❌ ERRO: Quantidade incorreta de refeições!');
      }
    }
    
    // Mostrar metadados
    if (resultado1.metadata) {
      console.log('📋 Metadados:', {
        refeicoes_selecionadas: resultado1.metadata.refeicoes_selecionadas,
        distribuicao_calorias: resultado1.metadata.distribuicao_calorias,
        calorias_por_refeicao: resultado1.metadata.calorias_por_refeicao
      });
    }
  }
} catch (error) {
  console.error('💥 Erro no teste 1:', error);
}

// Teste 2: Apenas 1 refeição selecionada (almoço)
console.log('\n🔍 TESTE 2: Apenas almoço');
const teste2 = {
  calorias: 2000,
  dias: 1,
  restricoes: [],
  preferencias: [],
  refeicoes_selecionadas: ['almoço']  // APENAS 1 REFEIÇÃO
};

try {
  const { data: resultado2, error: erro2 } = await supabase.functions.invoke('mealie-real', {
    body: teste2
  });

  if (erro2) {
    console.error('❌ Erro no teste 2:', erro2);
  } else {
    console.log('✅ Resultado teste 2:', resultado2.success);
    
    if (resultado2.data?.cardapio?.dia1) {
      const dia1 = resultado2.data.cardapio.dia1;
      const refeicoesGeradas = Object.keys(dia1).filter(key => key !== 'totais_nutricionais');
      
      console.log(`📊 REFEIÇÕES GERADAS (${refeicoesGeradas.length}):`, refeicoesGeradas);
      console.log('🎯 REFEIÇÕES ESPERADAS: 1 (almoco)');
      
      if (refeicoesGeradas.length === 1 && refeicoesGeradas.includes('almoco')) {
        console.log('✅ SUCESSO: Quantidade e tipo corretos!');
      } else {
        console.log('❌ ERRO: Quantidade ou tipo incorretos!');
      }
    }
  }
} catch (error) {
  console.error('💥 Erro no teste 2:', error);
}

// Teste 3: Todas as 5 refeições selecionadas
console.log('\n🔍 TESTE 3: Todas as 5 refeições');
const teste3 = {
  calorias: 2000,
  dias: 1,
  restricoes: [],
  preferencias: [],
  refeicoes_selecionadas: ['café da manhã', 'almoço', 'lanche', 'jantar', 'ceia']  // TODAS AS 5
};

try {
  const { data: resultado3, error: erro3 } = await supabase.functions.invoke('mealie-real', {
    body: teste3
  });

  if (erro3) {
    console.error('❌ Erro no teste 3:', erro3);
  } else {
    console.log('✅ Resultado teste 3:', resultado3.success);
    
    if (resultado3.data?.cardapio?.dia1) {
      const dia1 = resultado3.data.cardapio.dia1;
      const refeicoesGeradas = Object.keys(dia1).filter(key => key !== 'totais_nutricionais');
      
      console.log(`📊 REFEIÇÕES GERADAS (${refeicoesGeradas.length}):`, refeicoesGeradas);
      console.log('🎯 REFEIÇÕES ESPERADAS: 5 (cafe_manha, almoco, lanche, jantar, ceia)');
      
      if (refeicoesGeradas.length === 5) {
        console.log('✅ SUCESSO: Todas as 5 refeições geradas!');
      } else {
        console.log('❌ ERRO: Quantidade incorreta de refeições!');
      }
    }
  }
} catch (error) {
  console.error('💥 Erro no teste 3:', error);
}

console.log('\n🏁 TESTES CONCLUÍDOS');
