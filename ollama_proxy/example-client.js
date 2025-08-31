// Exemplo mínimo de consumo de NDJSON com fetch
// Execute: node example-client.js

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';

async function run() {
  const body = {
    messages: [
      { role: 'system', content: 'Você é um assistente conciso.' },
      { role: 'user', content: 'Explique em uma frase o que é batata frita.' },
    ],
    // model e options são opcionais; defaults aplicados no servidor
  };

  const resp = await fetch(`${FASTAPI_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!resp.ok) {
    console.error('Erro da API:', resp.status, await resp.text());
    process.exit(1);
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    const text = decoder.decode(value, { stream: true });
    for (const line of text.split('\n')) {
      if (!line.trim()) continue;
      try {
        const evt = JSON.parse(line);
        // Cada evt segue o formato NDJSON do Ollama
        if (evt.message?.content) process.stdout.write(evt.message.content);
      } catch (_) {
        console.log('\n[chunk inválido]', line);
      }
    }
  }

  console.log('\n[stream encerrado]');
}

run().catch((e) => {
  console.error('Falha no cliente:', e);
  process.exit(1);
});


