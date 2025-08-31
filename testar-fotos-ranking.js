import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const SUPABASE_URL = "https://hlrkoyywjpckdotimtik.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testarFotosRanking() {
  console.log('🧪 Testando fotos no ranking...\n');

  try {
    // 1. Buscar perfis com avatars
    console.log('1️⃣ Buscando perfis com avatars...');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url')
      .order('full_name');

    if (profilesError) {
      console.error('❌ Erro ao buscar perfis:', profilesError);
      return;
    }

    console.log(`✅ ${profiles.length} perfis encontrados`);

    // 2. Verificar quantos têm avatar
    const profilesWithAvatar = profiles.filter(p => p.avatar_url);
    const profilesWithoutAvatar = profiles.filter(p => !p.avatar_url);

    console.log(`📊 Estatísticas:`);
    console.log(`   - Com avatar: ${profilesWithAvatar.length}`);
    console.log(`   - Sem avatar: ${profilesWithoutAvatar.length}`);
    console.log(`   - Total: ${profiles.length}`);

    // 3. Mostrar alguns exemplos
    console.log('\n2️⃣ Exemplos de perfis:');
    
    if (profilesWithAvatar.length > 0) {
      console.log('   Com avatar:');
      profilesWithAvatar.slice(0, 3).forEach((profile, index) => {
        console.log(`     ${index + 1}. ${profile.full_name}`);
        console.log(`        - Avatar URL: ${profile.avatar_url ? 'PRESENTE' : 'AUSENTE'}`);
        console.log(`        - Tamanho: ${profile.avatar_url?.length || 0} caracteres`);
      });
    }

    if (profilesWithoutAvatar.length > 0) {
      console.log('   Sem avatar:');
      profilesWithoutAvatar.slice(0, 3).forEach((profile, index) => {
        console.log(`     ${index + 1}. ${profile.full_name}`);
        console.log(`        - Avatar URL: ${profile.avatar_url ? 'PRESENTE' : 'AUSENTE'}`);
        console.log(`        - Inicial: ${profile.full_name?.charAt(0).toUpperCase() || '?'}`);
      });
    }

    // 4. Simular dados do ranking
    console.log('\n3️⃣ Simulando dados do ranking...');
    const rankingData = profiles.map((profile, index) => ({
      user_id: profile.id,
      user_name: profile.full_name || 'Usuário',
      avatar_url: profile.avatar_url,
      total_points: Math.floor(Math.random() * 1000),
      streak_days: Math.floor(Math.random() * 30),
      missions_completed: Math.floor(Math.random() * 10),
      position: index + 1
    }));

    console.log('✅ Dados do ranking simulados');
    console.log(`   - Total de usuários: ${rankingData.length}`);
    console.log(`   - Com avatar: ${rankingData.filter(u => u.avatar_url).length}`);
    console.log(`   - Sem avatar: ${rankingData.filter(u => !u.avatar_url).length}`);

    // 5. Testar renderização
    console.log('\n4️⃣ Testando renderização:');
    rankingData.slice(0, 5).forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.user_name}`);
      if (user.avatar_url) {
        console.log(`      ✅ Mostrará foto: ${user.avatar_url.substring(0, 50)}...`);
      } else {
        console.log(`      🔤 Mostrará inicial: ${user.user_name.charAt(0).toUpperCase()}`);
      }
    });

    // 6. Verificar se há problemas
    console.log('\n5️⃣ Verificando problemas:');
    
    const invalidAvatars = profiles.filter(p => p.avatar_url && p.avatar_url.length < 10);
    if (invalidAvatars.length > 0) {
      console.log(`   ⚠️ ${invalidAvatars.length} avatars com URL muito curta:`);
      invalidAvatars.forEach(profile => {
        console.log(`      - ${profile.full_name}: "${profile.avatar_url}"`);
      });
    } else {
      console.log('   ✅ Nenhum avatar com URL inválida encontrado');
    }

    // 7. Testar URLs de avatar
    console.log('\n6️⃣ Testando URLs de avatar...');
    const testAvatars = profilesWithAvatar.slice(0, 3);
    
    for (const profile of testAvatars) {
      if (profile.avatar_url) {
        console.log(`   Testando avatar de ${profile.full_name}:`);
        console.log(`      - URL: ${profile.avatar_url.substring(0, 100)}...`);
        
        // Verificar se é base64
        if (profile.avatar_url.startsWith('data:')) {
          console.log(`      ✅ É base64 (válido)`);
        } else if (profile.avatar_url.startsWith('http')) {
          console.log(`      ✅ É URL externa (válido)`);
        } else {
          console.log(`      ⚠️ Formato desconhecido`);
        }
      }
    }

    console.log('\n🎯 Teste concluído!');
    console.log('\n📋 Resumo:');
    console.log(`   - Total de perfis: ${profiles.length}`);
    console.log(`   - Com foto: ${profilesWithAvatar.length}`);
    console.log(`   - Sem foto: ${profilesWithoutAvatar.length}`);
    console.log(`   - Percentual com foto: ${((profilesWithAvatar.length / profiles.length) * 100).toFixed(1)}%`);

  } catch (error) {
    console.error('❌ Erro durante teste:', error);
  }
}

// Executar teste
testarFotosRanking().catch(console.error); 