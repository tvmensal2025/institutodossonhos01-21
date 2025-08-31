import http from 'http';

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/body-charts',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Página carregada com sucesso!');
    console.log('Tamanho da resposta:', data.length, 'bytes');
    if (data.includes('Gráficos Dentro do Corpo')) {
      console.log('✅ Título da página encontrado!');
    }
    if (data.includes('BodyChart')) {
      console.log('✅ Componente BodyChart encontrado!');
    }
    if (data.includes('human-silhouette.svg')) {
      console.log('✅ Silhueta SVG encontrada!');
    }
  });
});

req.on('error', (e) => {
  console.error(`Erro: ${e.message}`);
});

req.end(); 