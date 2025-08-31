import React, { useState } from 'react';
import CoursePlatform from '@/components/CoursePlatform';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Grid3X3, 
  Settings,
  User,
  Bell,
  Search
} from 'lucide-react';

export const CoursePlatformPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'courses' | 'modules'>('courses');
  const [isAdminMode, setIsAdminMode] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header com navegação */}
      <header className="bg-black/20 backdrop-blur-sm border-b border-gray-800">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Plataforma dos Sonhos</h1>
            </div>
            
            {/* Toggle entre Cursos e Módulos */}
            <div className="flex items-center space-x-2 bg-gray-800/50 rounded-lg p-1">
              <Button
                variant={viewMode === 'courses' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('courses')}
                className={viewMode === 'courses' ? 'bg-purple-600 hover:bg-purple-700' : 'text-gray-300 hover:text-white'}
              >
                Cursos
              </Button>
              <Button
                variant={viewMode === 'modules' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('modules')}
                className={viewMode === 'modules' ? 'bg-purple-600 hover:bg-purple-700' : 'text-gray-300 hover:text-white'}
              >
                Módulos
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Barra de pesquisa */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar conteúdo..."
                className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 w-64"
              />
            </div>
            
            {/* Notificações */}
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <Bell className="h-5 w-5" />
            </Button>
            
            {/* Perfil do usuário */}
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
              <User className="h-5 w-5" />
            </Button>
            
            {/* Modo Admin */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`text-white hover:bg-white/10 ${isAdminMode ? 'bg-purple-600' : ''}`}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main>
        <CoursePlatform />
      </main>

      {/* Indicador de modo admin */}
      {isAdminMode && (
        <div className="fixed bottom-4 right-4 z-50">
          <Badge className="bg-purple-600 text-white px-3 py-1">
            Modo Admin Ativo
          </Badge>
        </div>
      )}
    </div>
  );
}; 