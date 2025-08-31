import React from 'react';
import { GoogleFitConnect } from '@/components/GoogleFitConnect';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const GoogleFitPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-2 xs:p-3 sm:p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-4 xs:mb-6 sm:mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-3 xs:mb-4 h-10 xs:h-12 px-3 xs:px-4 text-base xs:text-lg"
          >
            <ArrowLeft className="mr-2 h-5 w-5 xs:h-6 xs:w-6" />
            Voltar
          </Button>
          
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 xs:mb-3">
            Integração Google Fit
          </h1>
          <p className="text-base xs:text-lg sm:text-xl text-gray-600">
            Conecte sua conta Google Fit para sincronizar dados de saúde automaticamente
          </p>
        </div>

        {/* Componente de conexão */}
        <GoogleFitConnect />

        {/* Botão de teste de configuração */}
        <div className="mt-4 xs:mt-6 text-center">
          <Button 
            variant="outline" 
            className="h-10 xs:h-12 px-4 xs:px-6 text-base xs:text-lg"
            onClick={async () => {
              try {
                const response = await fetch('https://hlrkoyywjpckdotimtik.supabase.co/functions/v1/test-google-fit-config', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.REACT_APP_SUPABASE_ANON_KEY}`
                  }
                });
                const data = await response.json();
                alert(JSON.stringify(data, null, 2));
              } catch (error) {
                alert('Erro ao testar: ' + error.message);
              }
            }}
          >
            🔧 Testar Configuração
          </Button>
        </div>

        {/* Informações adicionais */}
        <div className="mt-6 xs:mt-8 grid grid-cols-1 gap-4 xs:gap-6">
          <div className="bg-white p-4 xs:p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg xs:text-xl mb-3 xs:mb-4">📊 Dados Sincronizados</h3>
            <ul className="space-y-2 xs:space-y-3 text-base xs:text-lg text-gray-600">
              <li>• Passos diários e distância</li>
              <li>• Calorias ativas e totais</li>
              <li>• Minutos de atividade física</li>
              <li>• Dados de sono</li>
              <li>• Frequência cardíaca</li>
              <li>• Peso e composição corporal</li>
            </ul>
          </div>

          <div className="bg-white p-4 xs:p-6 rounded-lg shadow-sm border">
            <h3 className="font-semibold text-lg xs:text-xl mb-3 xs:mb-4">🔒 Segurança</h3>
            <ul className="space-y-2 xs:space-y-3 text-base xs:text-lg text-gray-600">
              <li>• Autorização única via Google</li>
              <li>• Dados criptografados no Supabase</li>
              <li>• Você pode revogar acesso a qualquer momento</li>
              <li>• Não compartilhamos dados com terceiros</li>
              <li>• Conformidade com LGPD</li>
            </ul>
          </div>
        </div>

        {/* Prévia do painel */}
        <div className="mt-6 xs:mt-8 bg-white p-4 xs:p-6 rounded-lg shadow-sm border">
          <h3 className="font-semibold text-lg xs:text-xl mb-4 xs:mb-5">📈 Prévia do painel</h3>
          <div className="grid grid-cols-2 gap-3 xs:gap-4">
            <div className="text-center p-3 xs:p-4 bg-blue-50 rounded-lg">
              <p className="text-base xs:text-lg font-medium text-blue-800">Passos (hoje)</p>
              <div className="h-8 xs:h-10 bg-blue-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="text-center p-3 xs:p-4 bg-green-50 rounded-lg">
              <p className="text-base xs:text-lg font-medium text-green-800">Calorias ativas</p>
              <div className="h-8 xs:h-10 bg-green-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="text-center p-3 xs:p-4 bg-yellow-50 rounded-lg">
              <p className="text-base xs:text-lg font-medium text-yellow-800">Minutos ativos</p>
              <div className="h-8 xs:h-10 bg-yellow-200 rounded mt-2 animate-pulse"></div>
            </div>
            <div className="text-center p-3 xs:p-4 bg-purple-50 rounded-lg">
              <p className="text-base xs:text-lg font-medium text-purple-800">Sono</p>
              <div className="h-8 xs:h-10 bg-purple-200 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
