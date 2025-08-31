import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Configuração do Supabase com service role key
const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczMjk3Mjk3NCwiZXhwIjoyMDQ4NTQ4OTc0fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function uploadImage(filePath, fileName) {
  try {
    console.log(`📤 Fazendo upload de ${fileName}...`);
    
    const fileBuffer = fs.readFileSync(filePath);
    
    // Usar bucket 'avatars' que é padrão do Supabase
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, fileBuffer, {
        contentType: 'image/png',
        upsert: true
      });

    if (error) {
      console.error(`❌ Erro ao fazer upload de ${fileName}:`, error);
      return null;
    }

    console.log(`✅ Upload de ${fileName} concluído!`);
    
    // Gerar URL pública
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    console.log(`🔗 URL pública: ${urlData.publicUrl}`);
    return urlData.publicUrl;
  } catch (error) {
    console.error(`💥 Erro fatal ao fazer upload de ${fileName}:`, error);
    return null;
  }
}

async function main() {
  console.log('🚀 Iniciando upload das imagens para o Supabase...');
  
  const images = [
    {
      localPath: 'public/images/dr-vital.png',
      fileName: 'dr-vital.png'
    },
    {
      localPath: 'public/images/sofia.png',
      fileName: 'sofia.png'
    }
  ];

  const results = [];

  for (const image of images) {
    if (fs.existsSync(image.localPath)) {
      const url = await uploadImage(image.localPath, image.fileName);
      results.push({
        fileName: image.fileName,
        url: url,
        success: !!url
      });
    } else {
      console.error(`❌ Arquivo não encontrado: ${image.localPath}`);
      results.push({
        fileName: image.fileName,
        url: null,
        success: false
      });
    }
  }

  console.log('\n📊 Resumo dos uploads:');
  results.forEach(result => {
    if (result.success) {
      console.log(`✅ ${result.fileName}: ${result.url}`);
    } else {
      console.log(`❌ ${result.fileName}: Falha no upload`);
    }
  });

  // Atualizar o arquivo character-images.ts com as novas URLs
  if (results.some(r => r.success)) {
    console.log('\n🔄 Atualizando character-images.ts...');
    updateCharacterImagesFile(results);
  }
}

function updateCharacterImagesFile(results) {
  const characterImagesPath = 'src/lib/character-images.ts';
  
  try {
    let content = fs.readFileSync(characterImagesPath, 'utf8');
    
    results.forEach(result => {
      if (result.success) {
        const characterType = result.fileName.includes('dr-vital') ? 'DR_VITAL' : 'SOFIA';
        const newUrl = result.url;
        
        // Atualizar a URL no SUPABASE_URLS
        const regex = new RegExp(`(${characterType}:\\s*')([^']+)(')`, 'g');
        content = content.replace(regex, `$1${newUrl}$3`);
        
        console.log(`✅ URL atualizada para ${characterType}: ${newUrl}`);
      }
    });
    
    fs.writeFileSync(characterImagesPath, content);
    console.log('✅ character-images.ts atualizado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao atualizar character-images.ts:', error);
  }
}

main().catch(console.error); 