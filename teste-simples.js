// TESTE SIMPLES - Execute no console do navegador
console.log('🚀 TESTE SIMPLES DO GOOGLE FIT');

// 1. Testar Supabase
console.log('\n1️⃣ Testando Supabase...');
if (window.supabase) {
  console.log('✅ Supabase disponível');
} else {
  console.log('❌ Supabase não disponível');
}

// 2. Testar autenticação
console.log('\n2️⃣ Testando autenticação...');
window.supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.log('❌ Erro na autenticação:', error.message);
  } else if (data.session) {
    console.log('✅ Usuário logado:', data.session.user.email);
  } else {
    console.log('❌ Usuário não logado');
  }
});

// 3. Testar Edge Function
console.log('\n3️⃣ Testando Edge Function...');
window.supabase.functions.invoke('google-fit-token', {
  body: { testSecrets: true }
}).then(({ data, error }) => {
  if (error) {
    console.log('❌ Erro na Edge Function:', error.message);
  } else {
    console.log('✅ Edge Function funcionando:', data);
  }
});

// 4. Testar tabelas
console.log('\n4️⃣ Testando tabelas...');
window.supabase.from('google_fit_tokens').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.log('❌ Erro na tabela tokens:', error.message);
  } else {
    console.log('✅ Tabela tokens OK');
  }
});

window.supabase.from('google_fit_data').select('*').limit(1).then(({ data, error }) => {
  if (error) {
    console.log('❌ Erro na tabela data:', error.message);
  } else {
    console.log('✅ Tabela data OK');
  }
});

console.log('\n🎯 Teste iniciado! Verifique os resultados acima.'); 