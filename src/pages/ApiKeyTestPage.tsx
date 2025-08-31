import React from 'react';
import ApiKeyTest from '@/components/ApiKeyTest';

const ApiKeyTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            🎤 Teste da Voz da Sofia
          </h1>
          <p className="text-gray-600">
            Verificando se a API do Google TTS está configurada corretamente
          </p>
        </div>
        
        <ApiKeyTest />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Se a API key estiver funcionando, a Sofia terá voz natural!</p>
          <p className="mt-2">
            <a 
              href="/sofia-voice" 
              className="text-purple-600 hover:text-purple-800 underline"
            >
              → Ir para o chat da Sofia
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyTestPage;



