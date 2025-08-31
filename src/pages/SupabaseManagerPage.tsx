import React from 'react';
import { SupabaseAccountSwitcher } from '@/components/SupabaseAccountSwitcher';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, Settings, RefreshCw, Info } from 'lucide-react';
// import { getActiveAccount } from '@/integrations/supabase/client';

export const SupabaseManagerPage: React.FC = () => {
  // const activeAccount = getActiveAccount();

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gerenciador Supabase</h1>
        <p className="text-gray-600">
          Gerencie múltiplas contas do Supabase para desenvolvimento e produção
        </p>
      </div>

      {/* Status Atual */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Status Atual
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Conta Ativa:</p>
              <p className="font-semibold">Conta Principal</p>
            </div>
            <Badge variant="default">MAIN</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Gerenciador de Contas */}
      <SupabaseAccountSwitcher className="mb-6" />

      {/* Informações Adicionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuração
            </CardTitle>
            <CardDescription>
              Como configurar e usar múltiplas contas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p className="font-medium mb-2">Para configurar uma nova conta:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-600">
                <li>Crie um projeto no Supabase</li>
                <li>Execute: <code className="bg-gray-100 px-1 rounded">node setup-new-supabase.js</code></li>
                <li>Configure as credenciais</li>
                <li>Use o switcher acima para alternar</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Informações Importantes
            </CardTitle>
            <CardDescription>
              Pontos de atenção ao usar múltiplas contas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Cada conta tem autenticação independente</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">A conta nova não terá migrações aplicadas</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-600">Reinicie o servidor após mudar a configuração</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Comandos úteis para gerenciar as contas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => window.open('https://supabase.com', '_blank')}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Criar Nova Conta
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Recarregar Página
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const envPath = window.location.origin + '/env.example';
                window.open(envPath, '_blank');
              }}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Ver Configuração
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 