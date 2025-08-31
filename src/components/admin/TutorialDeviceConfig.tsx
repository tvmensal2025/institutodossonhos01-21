import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Smartphone, Tablet, Monitor, Youtube, Play, Eye, Settings } from 'lucide-react';

interface TutorialConfig {
  id: string;
  name: string;
  device: 'mobile' | 'tablet' | 'pc';
  videoUrl: string;
  videoId: string;
  isActive: boolean;
  description: string;
}

interface TutorialDeviceConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialDeviceConfig: React.FC<TutorialDeviceConfigProps> = ({
  isOpen,
  onClose
}) => {
  const [tutorials, setTutorials] = useState<TutorialConfig[]>([
    {
      id: 'mobile-tutorial',
      name: 'Tutorial Mobile',
      device: 'mobile',
      videoUrl: '',
      videoId: '',
      isActive: true,
      description: 'Tutorial otimizado para dispositivos móveis (smartphones)'
    },
    {
      id: 'tablet-tutorial',
      name: 'Tutorial Tablet',
      device: 'tablet',
      videoUrl: '',
      videoId: '',
      isActive: true,
      description: 'Tutorial otimizado para tablets e dispositivos médios'
    },
    {
      id: 'pc-tutorial',
      name: 'Tutorial PC',
      device: 'pc',
      videoUrl: '',
      videoId: '',
      isActive: true,
      description: 'Tutorial otimizado para computadores e desktops'
    }
  ]);

  const [activeTab, setActiveTab] = useState<'mobile' | 'tablet' | 'pc'>('mobile');

  // Extrair ID do vídeo do YouTube
  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  // Atualizar URL quando o input mudar
  const handleUrlChange = (device: 'mobile' | 'tablet' | 'pc', url: string) => {
    setTutorials(prev => prev.map(tutorial => {
      if (tutorial.device === device) {
        const extractedId = extractVideoId(url);
        return {
          ...tutorial,
          videoUrl: url,
          videoId: extractedId
        };
      }
      return tutorial;
    }));
  };

  // Salvar configuração
  const handleSave = async () => {
    try {
      // Salvar no localStorage por enquanto (pode ser substituído por API)
      localStorage.setItem('device-tutorials', JSON.stringify(tutorials));
      
      // Fechar modal
      onClose();
      
      // Mostrar mensagem de sucesso
      alert('Tutoriais configurados com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar tutoriais:', error);
      alert('Erro ao salvar configuração dos tutoriais');
    }
  };

  // Carregar configuração salva
  useEffect(() => {
    const savedTutorials = localStorage.getItem('device-tutorials');
    if (savedTutorials) {
      setTutorials(JSON.parse(savedTutorials));
    }
  }, []);

  // Obter tutorial ativo
  const getActiveTutorial = () => tutorials.find(t => t.device === activeTab);

  // Obter ícone do dispositivo
  const getDeviceIcon = (device: 'mobile' | 'tablet' | 'pc') => {
    switch (device) {
      case 'mobile': return <Smartphone className="w-3 h-3" />;
      case 'tablet': return <Tablet className="w-3 h-3" />;
      case 'pc': return <Monitor className="w-3 h-3" />;
    }
  };

  // Obter cor do dispositivo
  const getDeviceColor = (device: 'mobile' | 'tablet' | 'pc') => {
    switch (device) {
      case 'mobile': return 'text-blue-600';
      case 'tablet': return 'text-green-600';
      case 'pc': return 'text-purple-600';
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[70vh] overflow-y-auto mx-4"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 sm:p-3 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <h2 className="text-sm sm:text-base font-bold">Configuração de Tutoriais</h2>
            </div>
            <button
              onClick={() => {
                console.log('🔴 Botão fechar clicado!');
                onClose();
              }}
              className="text-white hover:text-gray-200 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded cursor-pointer"
              type="button"
            >
              ✕
            </button>
          </div>
          <p className="text-blue-100 mt-1 text-xs">
            Mobile, Tablet e PC
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 px-3 pt-2 overflow-x-auto">
          {tutorials.map((tutorial) => (
            <button
              key={tutorial.device}
              onClick={() => setActiveTab(tutorial.device)}
              className={`flex items-center space-x-1 px-2 py-1 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tutorial.device
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {getDeviceIcon(tutorial.device)}
              <span className="font-medium capitalize text-xs">{tutorial.device}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-2 sm:p-3">
          {(() => {
            const activeTutorial = getActiveTutorial();
            if (!activeTutorial) return null;

            return (
              <div className="space-y-3">
                {/* Informações do Tutorial */}
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`${getDeviceColor(activeTutorial.device)}`}>
                      {getDeviceIcon(activeTutorial.device)}
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{activeTutorial.name}</h3>
                  </div>
                  <p className="text-gray-600 text-xs">{activeTutorial.description}</p>
                </div>

                {/* Input da URL */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    URL do Vídeo do YouTube
                  </label>
                  <div className="flex flex-col sm:flex-row space-y-1 sm:space-y-0 sm:space-x-2">
                    <input
                      type="url"
                      value={activeTutorial.videoUrl}
                      onChange={(e) => handleUrlChange(activeTutorial.device, e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..."
                      className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                    />
                    <Youtube className="w-4 h-4 text-red-500 mt-1 self-center" />
                  </div>
                  {activeTutorial.videoUrl && !activeTutorial.videoId && (
                    <p className="text-red-500 text-sm mt-1">
                      URL inválida. Insira uma URL válida do YouTube.
                    </p>
                  )}
                  {activeTutorial.videoId && (
                    <p className="text-green-600 text-sm mt-1">
                      ✅ URL válida! ID do vídeo: {activeTutorial.videoId}
                    </p>
                  )}
                </div>

                {/* Preview do Vídeo */}
                {activeTutorial.videoId && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Preview do Vídeo
                    </label>
                    <div className="relative w-full h-0 pb-[56.25%] rounded overflow-hidden border border-gray-200">
                      <iframe
                        src={`https://www.youtube.com/embed/${activeTutorial.videoId}?rel=0&autoplay=0&modestbranding=1`}
                        title={`Tutorial ${activeTutorial.name}`}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Status do Tutorial */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={activeTutorial.isActive}
                      onChange={(e) => {
                        setTutorials(prev => prev.map(t => 
                          t.device === activeTutorial.device 
                            ? { ...t, isActive: e.target.checked }
                            : t
                        ));
                      }}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Tutorial ativo para {activeTutorial.device}
                    </span>
                  </label>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-2 py-2 rounded-b-xl flex flex-col sm:flex-row justify-end space-y-1 sm:space-y-0 sm:space-x-2">
          <button
            onClick={onClose}
            className="px-2 py-1 text-gray-600 hover:text-gray-800 transition-colors order-2 sm:order-1 text-xs"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 shadow hover:shadow-md transition-all order-1 sm:order-2 text-xs"
          >
            <Save className="w-3 h-3 inline mr-1" />
            Salvar Tutoriais
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
