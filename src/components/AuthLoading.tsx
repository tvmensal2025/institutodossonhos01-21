import React from 'react';
import { Loader2 } from 'lucide-react';

const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Carregando Sofia Health
        </h2>
        <p className="text-gray-600">
          Verificando sua autenticação...
        </p>
      </div>
    </div>
  );
};

export default AuthLoading;
