
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { setupAdminTables, insertSampleData } from '@/utils/setupAdminTables';
import { AdminSetupInstructions } from './AdminSetupInstructions';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const [tablesReady, setTablesReady] = useState<boolean | null>(null);
  const [missingTables, setMissingTables] = useState<string[]>([]);

  // Lista de emails administrativos
  const adminEmails = [
    'admin@instituto.com',
    'admin@sonhos.com',
    'rafael@admin.com'
  ];

  console.log('🔒 AdminProtectedRoute - User:', user?.email);

  if (!user) {
    console.log('🔒 AdminProtectedRoute - No user found');
    return (
      <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
        <Card className="w-96 bg-netflix-card border-netflix-border">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-netflix-text mb-2">
              Acesso Negado
            </h2>
            <p className="text-netflix-text-muted">
              Você precisa estar logado para acessar o painel administrativo.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isAdmin = adminEmails.includes(user.email || '');
  console.log('🔒 AdminProtectedRoute - User email:', user.email, 'Is admin:', isAdmin);

  if (!isAdmin) {
    console.log('🔒 AdminProtectedRoute - Access denied. Email not in admin list');
    return (
      <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
        <Card className="w-96 bg-netflix-card border-netflix-border">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-netflix-text mb-2">
              Acesso Negado
            </h2>
            <p className="text-netflix-text-muted">
              Você não tem permissão para acessar o painel administrativo.
            </p>
            <p className="text-netflix-text-muted text-xs mt-2">
              Email: {user.email} | Admin: {String(isAdmin)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Acesso permitido
  console.log('🔒 AdminProtectedRoute - ✅ ACESSO LIBERADO para:', user.email);
  
  // Verificar e configurar tabelas necessárias
  useEffect(() => {
    const initializeAdminSystem = async () => {
      console.log('🚀 Inicializando sistema administrativo...');
      
      // Verificar tabelas
      const result = await setupAdminTables();
      
      if (result === true) {
        // Inserir dados de exemplo se necessário
        await insertSampleData();
        console.log('✅ Sistema administrativo pronto!');
        setTablesReady(true);
      } else {
        console.log('⚠️ Algumas tabelas estão faltando.');
        setTablesReady(false);
        // Definir quais tabelas podem estar faltando
        const potentialMissingTables = ['goals', 'sessions', 'dados_saude_usuario', 'courses', 'course_modules', 'course_lessons'];
        setMissingTables(potentialMissingTables);
      }
    };

    if (user) {
      initializeAdminSystem();
    }
  }, [user]);

  const handleRefreshTables = async () => {
    setTablesReady(null); // Loading state
    
    const result = await setupAdminTables();
    
    if (result === true) {
      await insertSampleData();
      setTablesReady(true);
      setMissingTables([]);
    } else {
      setTablesReady(false);
    }
  };
  
  // Mostrar loading enquanto verifica tabelas
  if (tablesReady === null) {
    return (
      <div className="min-h-screen bg-netflix-dark flex items-center justify-center">
        <Card className="w-96 bg-netflix-card border-netflix-border">
          <CardContent className="flex flex-col items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-instituto-orange mb-4"></div>
            <p className="text-netflix-text">Verificando sistema administrativo...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mostrar instruções se tabelas estão faltando
  if (tablesReady === false) {
    return (
      <AdminSetupInstructions 
        missingTables={missingTables}
        onRefresh={handleRefreshTables}
      />
    );
  }

  return (
    <div className="min-h-screen bg-netflix-dark">
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">ACESSO LIBERADO</span>
        </div>
      </div>
      {children}
    </div>
  );
};
