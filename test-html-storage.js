// Script para testar se o HTML está sendo salvo corretamente no Supabase Storage
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hlrkoyywjpckdotimtik.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhscmtveXl3anBja2RvdGltdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNTMwNDcsImV4cCI6MjA2ODcyOTA0N30.kYEtg1hYG2pmcyIeXRs-vgNIVOD76Yu7KPlyFN0vdUI';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testHTMLStorage() {
  console.log('🧪 Testando HTML Storage...');
  
  const testHTML = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Teste HTML</title>
</head>
<body>
  <h1>🧪 Teste de HTML no Supabase Storage</h1>
  <p>Este é um teste para verificar se o HTML está sendo servido corretamente.</p>
  <div style="background: #1E40AF; color: white; padding: 20px; border-radius: 8px;">
    <h2>✅ Se você está vendo este texto formatado, o HTML funciona!</h2>
  </div>
</body>
</html>`;

  const testPath = `test/html-test-${Date.now()}.html`;
  
  try {
    // Método 1: Como estávamos fazendo antes
    console.log('📤 Testando upload método 1...');
    const { error: error1 } = await supabase.storage
      .from('medical-documents-reports')
      .upload(testPath, new Blob([testHTML], { type: 'text/html; charset=utf-8' }), {
        upsert: true,
        contentType: 'text/html; charset=utf-8'
      });
    
    if (error1) {
      console.error('❌ Erro método 1:', error1);
    } else {
      console.log('✅ Upload método 1 sucesso');
    }
    
    // Método 2: Como na função generate-medical-report
    const testPath2 = `test/html-test-method2-${Date.now()}.html`;
    console.log('📤 Testando upload método 2...');
    
    const enc = new TextEncoder();
    const bytes = enc.encode(testHTML);
    
    const { error: error2 } = await supabase.storage
      .from('medical-documents-reports')
      .upload(testPath2, new Blob([bytes], { type: "text/html; charset=utf-8" }), {
        upsert: true,
        contentType: "text/html; charset=utf-8"
      });
    
    if (error2) {
      console.error('❌ Erro método 2:', error2);
    } else {
      console.log('✅ Upload método 2 sucesso');
    }
    
    // Testar download e verificar Content-Type
    console.log('📥 Testando download...');
    
    const { data: signedUrl1, error: urlError1 } = await supabase.storage
      .from('medical-documents-reports')
      .createSignedUrl(testPath, 3600);
    
    if (urlError1) {
      console.error('❌ Erro ao criar URL:', urlError1);
    } else {
      console.log('🔗 URL método 1:', signedUrl1.signedUrl);
      
      // Verificar headers
      const response = await fetch(signedUrl1.signedUrl);
      console.log('📋 Headers método 1:');
      console.log('  Content-Type:', response.headers.get('content-type'));
      console.log('  Content-Length:', response.headers.get('content-length'));
      
      const content = await response.text();
      console.log('📄 Conteúdo (primeiros 100 chars):', content.substring(0, 100));
    }
    
    const { data: signedUrl2, error: urlError2 } = await supabase.storage
      .from('medical-documents-reports')
      .createSignedUrl(testPath2, 3600);
    
    if (urlError2) {
      console.error('❌ Erro ao criar URL 2:', urlError2);
    } else {
      console.log('🔗 URL método 2:', signedUrl2.signedUrl);
      
      // Verificar headers
      const response2 = await fetch(signedUrl2.signedUrl);
      console.log('📋 Headers método 2:');
      console.log('  Content-Type:', response2.headers.get('content-type'));
      console.log('  Content-Length:', response2.headers.get('content-length'));
      
      const content2 = await response2.text();
      console.log('📄 Conteúdo (primeiros 100 chars):', content2.substring(0, 100));
    }
    
  } catch (error) {
    console.error('💥 Erro geral:', error);
  }
}

testHTMLStorage();
