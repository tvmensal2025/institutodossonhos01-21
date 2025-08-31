import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Target, 
  X, 
  Save, 
  AlertCircle,
  Plus,
  Trash2,
  Video,
  Clock,
  FileText
} from "lucide-react";

interface JourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (journeyData: JourneyFormData) => void;
}

interface JourneyItem {
  id: string;
  title: string;
  video?: File;
  duration: number;
  type: 'video' | 'task' | 'reading';
}

interface JourneyFormData {
  title: string;
  description: string;
  duration: number;
  isActive: boolean;
  items: JourneyItem[];
}

export const JourneyModal = ({ isOpen, onClose, onSubmit }: JourneyModalProps) => {
  const [formData, setFormData] = useState<JourneyFormData>({
    title: "",
    description: "",
    duration: 7,
    isActive: true,
    items: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: keyof JourneyFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ""
      }));
    }
  };

  const handleItemChange = (itemId: string, field: keyof JourneyItem, value: string | number | File) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId 
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  const handleFileUpload = (itemId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleItemChange(itemId, 'video', file);
    }
  };

  const addItem = () => {
    const newItem: JourneyItem = {
      id: Date.now().toString(),
      title: "",
      duration: 0,
      type: 'video'
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Título é obrigatório";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (formData.duration < 1) {
      newErrors.duration = "Duração deve ser pelo menos 1 dia";
    }

    // Validar itens
    formData.items.forEach((item, index) => {
      if (!item.title.trim()) {
        newErrors[`item-${index}-title`] = `Título do item ${index + 1} é obrigatório`;
      }
      if (item.duration < 0) {
        newErrors[`item-${index}-duration`] = `Duração do item ${index + 1} não pode ser negativa`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await onSubmit(formData);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        duration: 7,
        isActive: true,
        items: []
      });
      setErrors({});
      onClose();
    } catch (error) {
      console.error("Erro ao criar jornada:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        title: "",
        description: "",
        duration: 7,
        isActive: true,
        items: []
      });
      setErrors({});
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] bg-gray-900 border-gray-700 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Target className="h-6 w-6 text-purple-500" />
            CRIAR NOVA JORNADA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-sm font-medium text-gray-300">
                🎯 Título da Jornada
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                placeholder="Digite o título da jornada..."
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.title && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.title}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                📄 Descrição
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Descreva a jornada de transformação..."
                rows={3}
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
              {errors.description && (
                <div className="flex items-center gap-1 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.description}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration" className="text-sm font-medium text-gray-300">
                  ⏱️ Duração (dias)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
                  placeholder="7"
                  min="1"
                  className="bg-gray-800 border-gray-600 text-white"
                />
                {errors.duration && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.duration}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                  ✅ Jornada Ativa
                </Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Itens da Jornada */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-300">
                📋 ITENS DA JORNADA
              </Label>
              <Button 
                onClick={addItem} 
                size="sm" 
                className="bg-purple-500 hover:bg-purple-600"
              >
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {formData.items.length === 0 && (
              <div className="text-center py-8 text-gray-400 border-2 border-dashed border-gray-600 rounded-lg">
                <Target className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                <p>Nenhum item adicionado ainda</p>
                <p className="text-sm">Clique em "Adicionar Item" para começar</p>
              </div>
            )}

            {formData.items.map((item, index) => (
              <div key={item.id} className="border border-gray-600 rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-gray-300">
                    📝 Item {index + 1}
                  </h4>
                  <Button
                    onClick={() => removeItem(item.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-600 text-red-400 hover:bg-red-600 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-300">
                      Título do Item
                    </Label>
                    <Input
                      value={item.title}
                      onChange={(e) => handleItemChange(item.id, "title", e.target.value)}
                      placeholder="Digite o título do item..."
                      className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    />
                    {errors[`item-${index}-title`] && (
                      <div className="flex items-center gap-1 text-red-400 text-sm">
                        <AlertCircle className="h-4 w-4" />
                        {errors[`item-${index}-title`]}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-300">
                        🎬 Vídeo
                      </Label>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-3 text-center hover:border-gray-500 transition-colors">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => handleFileUpload(item.id, e)}
                          className="hidden"
                          id={`video-${item.id}`}
                        />
                        <label htmlFor={`video-${item.id}`} className="cursor-pointer">
                          <Video className="h-8 w-8 text-gray-400 mx-auto mb-1" />
                          <p className="text-gray-300 text-sm">
                            {item.video ? item.video.name : "📁 Upload Vídeo"}
                          </p>
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-300">
                        ⏱️ Duração (min)
                      </Label>
                      <Input
                        type="number"
                        value={item.duration}
                        onChange={(e) => handleItemChange(item.id, "duration", parseInt(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        className="bg-gray-800 border-gray-600 text-white"
                      />
                      {errors[`item-${index}-duration`] && (
                        <div className="flex items-center gap-1 text-red-400 text-sm">
                          <AlertCircle className="h-4 w-4" />
                          {errors[`item-${index}-duration`]}
                        </div>
                      )}
                    </div>
                  </div>

                  {item.video && (
                    <div className="flex items-center gap-2 text-green-400 text-sm">
                      <Video className="h-4 w-4" />
                      Vídeo: {item.video.name}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
            className="border-gray-600 text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600"
          >
            <Save className="h-4 w-4 mr-2" />
            {isLoading ? "Salvando..." : "💾 Salvar Jornada"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 