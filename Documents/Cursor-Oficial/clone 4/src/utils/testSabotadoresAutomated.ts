// Script automatizado para testar o sistema dos sabotadores
import { supabase } from '@/integrations/supabase/client';

// Gerar respostas aleatórias para as 115 perguntas
const generateRandomAnswers = (): number[] => {
  const answers: number[] = [];
  for (let i = 0; i < 115; i++) {
    // Valores entre 1 e 5 (Discordo Fortemente até Concordo Fortemente)
    answers.push(Math.floor(Math.random() * 5) + 1);
  }
  return answers;
};

// Calcular sabotadores (mesma lógica do componente)
const calcularSabotadores = (respostas: number[]) => {
  const sabotadores = {
    roupas: [0, 1, 2, 3, 4],
    dinheiro: [5, 6, 7, 8, 9],
    estranheza_mudanca: [10, 11, 12, 13, 14],
    magreza_infancia: [15, 16, 17, 18, 19],
    rivalidade: [20, 21, 22, 23, 24],
    valvula_escape: [25, 26, 27, 28, 29],
    falta_crencas: [30, 31, 32, 33, 34],
    atividade_fisica: [35, 36, 37, 38, 39],
    crenca_contraria: [40, 41, 42, 43, 44],
    prazer_comida: [45, 46, 47, 48, 49],
    obesidade_riqueza: [50, 51, 52, 53, 54],
    tamanho_fortaleza: [55, 56, 57, 58, 59],
    apego_autoimagem: [60, 61, 62, 63, 64],
    problemas_conjuge: [65, 66, 67, 68, 69],
    fuga_beleza: [70, 71, 72, 73, 74],
    protecao_filhos: [75, 76, 77, 78, 79],
    fuga_afetiva: [80, 81, 82, 83, 84],
    biotipo_identidade: [85, 86, 87, 88, 89],
    comida_afeto: [90, 91, 92, 93, 94],
    perdas_presente: [95, 96, 97, 98, 99],
    perdas_infancia: [100, 101, 102, 103, 104],
    critico: [105, 106, 107, 108, 109],
    boazinha: [110, 111, 112, 113, 114]
  };

  const scores: Record<string, number> = {};
  
  Object.keys(sabotadores).forEach(sabotador => {
    const indices = sabotadores[sabotador as keyof typeof sabotadores];
    const soma = indices.reduce((acc, index) => {
      const resposta = respostas[index];
      return acc + (typeof resposta === 'number' ? resposta : 0);
    }, 0);
    scores[sabotador] = Math.round((soma / indices.length) * 20);
  });

  return scores;
};

// Função para testar o salvamento
export const testSabotadoresSubmission = async (userId?: string) => {
  try {
    console.log('🧪 Iniciando teste automatizado dos sabotadores...');
    
    // Gerar respostas aleatórias
    const respostas = generateRandomAnswers();
    console.log('📋 Respostas geradas (primeiras 10):', respostas.slice(0, 10));
    console.log('📋 Total de respostas:', respostas.length);
    
    // Calcular scores
    const scores = calcularSabotadores(respostas);
    console.log('📊 Scores calculados:', scores);
    
    // Simular top sabotadores
    const topSabotadores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([key, score]) => ({
        nome: key,
        pontuacao: score,
        resumo: `Resumo do sabotador ${key}`,
        comoSuperar: `Como superar o sabotador ${key}`
      }));
    
    console.log('🏆 Top 5 sabotadores:', topSabotadores);
    
    // Preparar resultado final
    const testeResultado = {
      tipo: 'teste_sabotadores',
      user_id: userId || 'teste_automatico',
      scores,
      top_sabotadores: topSabotadores,
      respostas_completas: respostas,
      data_teste: new Date().toISOString(),
      teste_id: `sabotadores_${Date.now()}`
    };

    // Salvar no localStorage (simulando banco de dados)
    const existingTests = JSON.parse(localStorage.getItem('testeSabotadores_history') || '[]');
    existingTests.push(testeResultado);
    localStorage.setItem('testeSabotadores_history', JSON.stringify(existingTests));
    localStorage.setItem('testeSabotadores_latest', JSON.stringify(testeResultado));
    
    console.log('✅ Teste salvo no localStorage!');
    console.log('📄 Dados salvos:', testeResultado);
    
    // Se tiver usuário, tentar verificar conexão com Supabase
    if (userId) {
      console.log('🔗 Verificando conexão com Supabase...');
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (user) {
          console.log('✅ Usuário autenticado no Supabase:', user.id);
          console.log('💡 Em produção, os dados seriam salvos na tabela teste_sabotadores');
        } else {
          console.log('⚠️ Usuário não autenticado no Supabase');
        }
      } catch (error) {
        console.log('❌ Erro de conexão com Supabase:', error);
      }
    }
    
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
    return false;
  }
};

// Função para buscar usuário atual e executar teste
export const runTestForCurrentUser = async () => {
  try {
    console.log('🔍 Buscando usuário atual...');
    
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error || !user) {
      console.warn('⚠️ Usuário não autenticado - executando teste de demonstração');
      return await testSabotadoresSubmission('demo_user');
    }
    
    console.log('👤 Usuário encontrado:', user.id);
    
    // Executar teste para o usuário atual
    return await testSabotadoresSubmission(user.id);
    
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    console.log('🔄 Executando teste de demonstração...');
    return await testSabotadoresSubmission('demo_user');
  }
};

// Função para verificar testes salvos
export const checkSavedTests = () => {
  try {
    const history = JSON.parse(localStorage.getItem('testeSabotadores_history') || '[]');
    const latest = JSON.parse(localStorage.getItem('testeSabotadores_latest') || 'null');
    
    console.log(`📊 Total de testes salvos: ${history.length}`);
    console.log('📄 Histórico completo:', history);
    console.log('🔄 Último teste:', latest);
    
    return { history, latest };
    
  } catch (error) {
    console.error('❌ Erro ao buscar testes:', error);
    return { history: [], latest: null };
  }
};

// Função para limpar dados de teste
export const clearTestData = () => {
  localStorage.removeItem('testeSabotadores_history');
  localStorage.removeItem('testeSabotadores_latest');
  localStorage.removeItem('testeSabotadores');
  console.log('🧹 Dados de teste limpos!');
};

// Tornar funções disponíveis globalmente para teste no console
// Exposição de funções para desenvolvimento (comentado para produção)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as any).testSabotadores = runTestForCurrentUser;
  (window as any).checkTestsSabotadores = checkSavedTests;
  (window as any).clearTestsSabotadores = clearTestData;
  
  // Removido console.log para evitar poluição do console
  // console.log('🌐 === TESTE DOS SABOTADORES DISPONÍVEL ===');
} 