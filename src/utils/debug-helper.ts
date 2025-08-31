// Utilitário para debug de cardápios e restrições
export const debugMealPlan = (plan: any, restrictions: string[] = []) => {
  console.log('🔍 === DEBUG CARDÁPIO ===');
  console.log('📋 Plano recebido:', plan);
  console.log('🚫 Restrições a verificar:', restrictions);
  
  if (!plan || !restrictions.length) {
    console.log('✅ Sem restrições para verificar');
    return { violations: [], isValid: true };
  }

  const violations: string[] = [];
  
  try {
    // Verificar se há violações
    Object.entries(plan).forEach(([dia, refeicoes]: [string, any]) => {
      Object.entries(refeicoes).forEach(([refeicao, dados]: [string, any]) => {
        if (dados?.meals || dados?.ingredientes) {
          const ingredientes = dados.ingredientes || 
            (dados.meals ? Object.values(dados.meals).map((m: any) => m.title || m.nome) : []);
          
          ingredientes.forEach((ing: any) => {
            const nomeIngrediente = (typeof ing === 'string' ? ing : ing?.nome || '').toLowerCase();
            
            restrictions.forEach(restricao => {
              const restricaoLower = restricao.toLowerCase();
              if (nomeIngrediente.includes(restricaoLower) || 
                  restricaoLower.includes(nomeIngrediente)) {
                violations.push(`${dia} - ${refeicao}: ${nomeIngrediente} (contém ${restricao})`);
              }
            });
          });
        }
      });
    });

    if (violations.length > 0) {
      console.error('❌ VIOLAÇÕES ENCONTRADAS:', violations);
      return { violations, isValid: false };
    } else {
      console.log('✅ Cardápio respeita todas as restrições!');
      return { violations: [], isValid: true };
    }
  } catch (error) {
    console.error('❌ Erro no debug:', error);
    return { violations: [`Erro no debug: ${error}`], isValid: false };
  }
};

export const logRestrictionDebug = (restrictions: string[], source: string = 'unknown') => {
  console.log(`🚫 [${source}] Restrições ativas:`, restrictions);
  console.log(`🚫 [${source}] Quantidade:`, restrictions?.length || 0);
  console.log(`🚫 [${source}] Tipo:`, typeof restrictions);
  console.log(`🚫 [${source}] É array:`, Array.isArray(restrictions));
};