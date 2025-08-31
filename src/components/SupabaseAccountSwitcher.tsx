import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SupabaseAccountSwitcherProps {
  className?: string;
}

export const SupabaseAccountSwitcher: React.FC<SupabaseAccountSwitcherProps> = ({ className }) => {
  const [activeAccount, setActiveAccount] = React.useState<'MAIN' | 'NEW'>('MAIN');

  const handleSwitchAccount = (account: 'MAIN' | 'NEW') => {
    setActiveAccount(account);
    console.log('Switching to account:', account);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Gerenciador de Contas Supabase
        </CardTitle>
        <CardDescription>
          Alternar entre contas do Supabase para desenvolvimento e produção
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Conta Principal */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Conta Principal</h3>
              {activeAccount === 'MAIN' && (
                <Badge variant="default" className="bg-green-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativa
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Conta atual com dados e migrações
            </p>
            <div className="text-xs text-gray-500 mb-3">
              <div>URL: hlrkoyywjpckdotimtik.supabase.co</div>
              <div>Status: Com migrações e dados</div>
            </div>
            <Button
              variant={activeAccount === 'MAIN' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSwitchAccount('MAIN')}
              className="w-full"
            >
              {activeAccount === 'MAIN' ? 'Conta Atual' : 'Ativar Principal'}
            </Button>
          </div>

          {/* Conta Nova */}
          <div className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Conta Nova</h3>
              {activeAccount === 'NEW' && (
                <Badge variant="default" className="bg-blue-500">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativa
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-3">
              Conta limpa sem migrações
            </p>
            <div className="text-xs text-gray-500 mb-3">
              <div>URL: [Configurar no .env]</div>
              <div>Status: Limpa, sem dados</div>
            </div>
            <Button
              variant={activeAccount === 'NEW' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleSwitchAccount('NEW')}
              className="w-full"
            >
              {activeAccount === 'NEW' ? 'Conta Atual' : 'Ativar Nova'}
            </Button>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Configuração Necessária:</p>
              <p className="mt-1">
                Para usar a conta nova, configure as variáveis de ambiente no arquivo <code>.env</code>:
              </p>
              <pre className="mt-2 text-xs bg-yellow-100 p-2 rounded">
{`VITE_SUPABASE_URL_NEW=https://sua-nova-conta.supabase.co
VITE_SUPABASE_ANON_KEY_NEW=sua-chave-anonima-nova`}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 