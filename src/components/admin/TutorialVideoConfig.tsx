import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Save, Eye, Settings, Youtube } from 'lucide-react';

interface TutorialVideoConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialVideoConfig: React.FC<TutorialVideoConfigProps> = ({
  isOpen,
  onClose
}) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoId, setVideoId] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  // Extrair ID do vídeo do YouTube
  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  // Validar URL do YouTube
  const validateYouTubeUrl = (url: string): boolean => {
    const videoId = extractVideoId(url);
    return videoId.length === 11;
  };

  // Atualizar URL quando o input mudar
  const handleUrlChange = (url: string) => {
    setVideoUrl(url);
    const extractedId = extractVideoId(url);
    setVideoId(extractedId);
    
    if (extractedId) {
      setIsValid(true);
      setPreviewUrl(`https://www.youtube.com/embed/${extractedId}?rel=0&autoplay=0&modestbranding=1`);
    } else {
      setIsValid(false);
      setPreviewUrl('');
    }
  };

  // Salvar configuração
  const handleSave = async () => {
    if (!isValid || !videoId) return;

    try {
      // Salvar no localStorage por enquanto (pode ser substituído por API)
      localStorage.setItem('tutorial-video-id', videoId);
      localStorage.setItem('tutorial-video-url', videoUrl);
      
      // Fechar modal
      onClose();
      
      // Mostrar mensagem de sucesso
      alert('Vídeo do tutorial configurado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar vídeo:', error);
      alert('Erro ao salvar configuração do vídeo');
    }
  };

  // Carregar configuração salva
  useEffect(() => {
    const savedVideoId = localStorage.getItem('tutorial-video-id');
    const savedVideoUrl = localStorage.getItem('tutorial-video-url');
    
    if (savedVideoId && savedVideoUrl) {
      setVideoId(savedVideoId);
      setVideoUrl(savedVideoUrl);
      setIsValid(true);
      setPreviewUrl(`https://www.youtube.com/embed/${savedVideoId}?rel=0&autoplay=0&modestbranding=1`);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-6 h-6" />
              <h2 className="text-xl font-bold">Configuração do Tutorial</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
          <p className="text-blue-100 mt-2">
            Configure o vídeo do YouTube que será exibido no tutorial
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input da URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Vídeo do YouTube
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                value={videoUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Youtube className="w-6 h-6 text-red-500 mt-3" />
            </div>
            {videoUrl && !isValid && (
              <p className="text-red-500 text-sm mt-1">
                URL inválida. Insira uma URL válida do YouTube.
              </p>
            )}
            {isValid && (
              <p className="text-green-600 text-sm mt-1">
                ✅ URL válida! ID do vídeo: {videoId}
              </p>
            )}
          </div>

          {/* Preview do Vídeo */}
          {previewUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preview do Vídeo
              </label>
              <div className="relative w-full h-0 pb-[56.25%] rounded-lg overflow-hidden border-2 border-gray-200">
                <iframe
                  src={previewUrl}
                  title="Preview do Tutorial"
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Informações do Vídeo */}
          {videoId && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Informações do Vídeo</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">ID do Vídeo:</span>
                  <p className="font-mono text-gray-900">{videoId}</p>
                </div>
                <div>
                  <span className="text-gray-500">URL de Embed:</span>
                  <p className="font-mono text-gray-900 text-xs break-all">
                    {previewUrl}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Save className="w-4 h-4 inline mr-2" />
            Salvar Configuração
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
