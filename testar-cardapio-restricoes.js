const { createClient } = require('@supabase/supabase-js');

// Configurações do Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg2MTY5OTYsImV4cCI6MjAxNDE5Mjk5Nn0.Zv4BoZtMVFYPzWQx-Ew_-3Hy1EFnP-Yf8Ij_LlJtZqw';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testarCardapio() {
  console.log('🧪 Testando geração de cardápio com restrições...');
  
  try {
    // Autenticação com usuário de teste
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'teste@example.com',
      password: 'senha123',
    });
    
    if (authError) {
      console.error('❌ Erro de autenticação:', authError);
      return;
    }
    
    console.log('✅ Autenticado com sucesso');
    
    // Parâmetros de teste
    const params = {
      calorias: 3000,
      proteinas: 180,
      carboidratos: 300,
      gorduras: 100,
      dias: 7,
      objetivo: 'manter peso',
      restricoes: ['lactose', 'carne vermelha', 'frango', 'porco'],
      preferencias: ['peixe', 'vegetais', 'frutas'],
      observacoes: 'Teste de restrições alimentares'
    };
    
    console.log('📊 Parâmetros de teste:', params);
    
    // Chamar a edge function
    const { data, error } = await supabase.functions.invoke('generate-meal-plan-taco', {
      body: params
    });
    
    if (error) {
      console.error('❌ Erro na geração do cardápio:', error);
      return;
    }
    
    console.log('✅ Cardápio gerado com sucesso');
    console.log('📊 Metadados:', data.metadata);
    
    // Verificar se as restrições foram aplicadas
    const cardapio = data.cardapio.cardapio;
    const dias = Object.keys(cardapio);
    
    console.log(`📅 Número de dias gerados: ${dias.length}`);
    
    // Verificar ingredientes proibidos
    const restricoes = params.restricoes.map(r => r.toLowerCase());
    let violacoesEncontradas = false;
    
    dias.forEach(dia => {
      const refeicoes = ['cafe_manha', 'almoco', 'cafe_tarde', 'jantar', 'ceia'];
      
      refeicoes.forEach(refeicao => {
        if (cardapio[dia][refeicao]?.ingredientes) {
          cardapio[dia][refeicao].ingredientes.forEach(ing => {
            const nomeIngrediente = ing.nome.toLowerCase();
            
            restricoes.forEach(restricao => {
              if (nomeIngrediente.includes(restricao)) {
                console.error(`❌ VIOLAÇÃO: ${dia} - ${refeicao} - ${ing.nome} (contém ${restricao})`);
                violacoesEncontradas = true;
              }
            });
          });
        }
      });
    });
    
    if (!violacoesEncontradas) {
      console.log('✅ Nenhuma violação de restrições encontrada!');
    }
    
    // Salvar resultado para inspeção
    const fs = require('fs');
    fs.writeFileSync('cardapio-teste.json', JSON.stringify(data, null, 2));
    console.log('💾 Resultado salvo em cardapio-teste.json');
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testarCardapio().catch(console.error);
