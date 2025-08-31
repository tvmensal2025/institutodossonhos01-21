import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  X, 
  Save, 
  AlertCircle,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Upload,
  Settings,
  Target,
  Link,
  Tag,
  Code,
  Clock,
  Hash
} from "lucide-react";

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (lessonData: LessonFormData) => void;
  courses: Array<{ id: string; title: string; structure_type?: string }>;
  modules: Array<{ id: string; title: string; courseId?: string }>;
}

interface LessonFormData {
  // Básico
  type: 'video' | 'text' | 'mixed';
  title: string;
  description: string;
  duration: number;
  order: number;
  isActive: boolean;
  courseId?: string;
  moduleId?: string;
  lesson_type: 'module_lesson' | 'course_lesson';
  thumbnail_url?: string;
  
  // Conteúdo
  videoType: 'youtube' | 'vimeo' | 'panda' | 'upload';
  videoUrl: string;
  richTextContent: string;
  mixedContent: string;
  
  // Mídia
  thumbnail?: File;
  document?: File;
  image?: File;
  video?: File;
  
  // Avançado
  objectives: string;
  prerequisites: string;
  resources: string;
  quizJson: string;
  tags: string[];
}

export const LessonModal = ({ isOpen, onClose, onSubmit, courses, modules }: LessonModalProps) => {
  const [activeTab, setActiveTab] = useState("basic");
  const [formData, setFormData] = useState<LessonFormData>({
    type: 'video',
    title: "",
    description: "",
    duration: 0,
    order: 1,
    isActive: true,
    courseId: "",
    moduleId: "",
    lesson_type: "module_lesson",
    videoType: 'youtube',
    videoUrl: "",
    richTextContent: "",
    mixedContent: "",
    objectives: "",
    prerequisites: "",
    resources: "",
    quizJson: "",
    tags: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newTag, setNewTag] = useState("");

  const handleInputChange = (field: keyof LessonFormData, value: string | number | boolean) => {
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

  const handleFileUpload = (field: 'thumbnail' | 'document' | 'image' | 'video', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [field]: file
      }));
    }
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
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

    // Validação baseada no tipo de aula
    if (formData.lesson_type === 'course_lesson') {
      if (!formData.courseId) {
        newErrors.courseId = "Curso é obrigatório para aulas diretas";
      }
    } else {
      if (!formData.courseId) {
        newErrors.courseId = "Curso é obrigatório";
      }
      if (!formData.moduleId) {
        newErrors.moduleId = "Módulo é obrigatório";
      }
    }

    if (formData.order < 1) {
      newErrors.order = "Ordem deve ser maior que 0";
    }

    if (formData.duration < 0) {
      newErrors.duration = "Duração não pode ser negativa";
    }

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
        type: 'video',
        title: "",
        description: "",
        duration: 0,
        order: 1,
        isActive: true,
        courseId: "",
        moduleId: "",
        lesson_type: "module_lesson",
        videoType: 'youtube',
        videoUrl: "",
        richTextContent: "",
        mixedContent: "",
        objectives: "",
        prerequisites: "",
        resources: "",
        quizJson: "",
        tags: []
      });
      setErrors({});
      setNewTag("");
      onClose();
    } catch (error) {
      console.error("Erro ao criar aula:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        type: 'video',
        title: "",
        description: "",
        duration: 0,
        order: 1,
        isActive: true,
        courseId: "",
        moduleId: "",
        lesson_type: "module_lesson",
        videoType: 'youtube',
        videoUrl: "",
        richTextContent: "",
        mixedContent: "",
        objectives: "",
        prerequisites: "",
        resources: "",
        quizJson: "",
        tags: []
      });
      setErrors({});
      setNewTag("");
      onClose();
    }
  };

  const filteredModules = modules.filter(module => module.courseId === formData.courseId);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <Video className="h-6 w-6 text-purple-500" />
            GERENCIADOR AVANÇADO - ADICIONAR AULA
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="basic" className="data-[state=active]:bg-purple-500">
              📝 BÁSICO
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-purple-500">
              📊 CONTEÚDO
            </TabsTrigger>
            <TabsTrigger value="media" className="data-[state=active]:bg-purple-500">
              🎨 MÍDIA
            </TabsTrigger>
            <TabsTrigger value="advanced" className="data-[state=active]:bg-purple-500">
              ⚙️ AVANÇADO
            </TabsTrigger>
          </TabsList>

          {/* ABA BÁSICO */}
          <TabsContent value="basic" className="space-y-6">
            <div className="space-y-4">
               {/* Tipo de Estrutura da Aula */}
               <div className="space-y-2">
                 <Label className="text-sm font-medium text-gray-300">
                   🏗️ Estrutura da Aula
                 </Label>
                 <Select 
                   value={formData.lesson_type} 
                   onValueChange={(value) => handleInputChange("lesson_type", value)}
                 >
                   <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                     <SelectValue placeholder="Selecione a estrutura" />
                   </SelectTrigger>
                   <SelectContent className="bg-gray-800 border-gray-600">
                     <SelectItem value="module_lesson" className="text-white hover:bg-gray-700">
                       📁 MÓDULO → AULA (Tradicional)
                     </SelectItem>
                     <SelectItem value="course_lesson" className="text-white hover:bg-gray-700">
                       📚 CURSO → AULA (Direta)
                     </SelectItem>
                   </SelectContent>
                 </Select>
                 <p className="text-gray-400 text-xs">
                   {formData.lesson_type === 'course_lesson' 
                     ? "Aula diretamente vinculada ao curso" 
                     : "Aula organizada dentro de um módulo"}
                 </p>
               </div>

               {/* Tipo de Conteúdo */}
               <div className="space-y-2">
                 <Label className="text-sm font-medium text-gray-300">
                   🎬 Tipo de Conteúdo
                 </Label>
                <div className="flex gap-4">
                  {[
                    { value: 'video', label: 'Vídeo', icon: Video },
                    { value: 'text', label: 'Texto', icon: FileText },
                    { value: 'mixed', label: 'Misto', icon: Settings }
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <Button
                        key={type.value}
                        variant={formData.type === type.value ? "default" : "outline"}
                        onClick={() => handleInputChange("type", type.value)}
                        className={`flex items-center gap-2 ${
                          formData.type === type.value 
                            ? 'bg-purple-500 hover:bg-purple-600' 
                            : 'border-gray-600 text-white hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {type.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Título */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-gray-300">
                  📝 Título
                </Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Digite o título da aula..."
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                {errors.title && (
                  <div className="flex items-center gap-1 text-red-400 text-sm">
                    <AlertCircle className="h-4 w-4" />
                    {errors.title}
                  </div>
                )}
              </div>

              {/* Descrição */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-300">
                  📄 Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descreva o conteúdo da aula..."
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

              {/* Curso e Módulo */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="courseId" className="text-sm font-medium text-gray-300">
                    📚 Curso
                  </Label>
                  <Select value={formData.courseId} onValueChange={(value) => handleInputChange("courseId", value)}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue placeholder="Selecione um curso" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={course.id} className="text-white hover:bg-gray-700">
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.courseId && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.courseId}
                    </div>
                  )}
                </div>

                 <div className="space-y-2">
                   <Label htmlFor="moduleId" className="text-sm font-medium text-gray-300">
                     📁 {formData.lesson_type === 'course_lesson' ? 'Módulo (Não Necessário)' : 'Módulo'}
                   </Label>
                   <Select 
                     value={formData.moduleId} 
                     onValueChange={(value) => handleInputChange("moduleId", value)}
                     disabled={!formData.courseId || formData.lesson_type === 'course_lesson'}
                   >
                     <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                       <SelectValue placeholder={
                         formData.lesson_type === 'course_lesson' 
                           ? "Aula direta no curso" 
                           : "Selecione um módulo"
                       } />
                     </SelectTrigger>
                     <SelectContent className="bg-gray-800 border-gray-600">
                       {filteredModules.map((module) => (
                         <SelectItem key={module.id} value={module.id} className="text-white hover:bg-gray-700">
                           {module.title}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                   {errors.moduleId && (
                     <div className="flex items-center gap-1 text-red-400 text-sm">
                       <AlertCircle className="h-4 w-4" />
                       {errors.moduleId}
                     </div>
                   )}
                 </div>
              </div>

              {/* Duração e Ordem */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration" className="text-sm font-medium text-gray-300">
                    ⏱️ Duração (minutos)
                  </Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => handleInputChange("duration", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  {errors.duration && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.duration}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order" className="text-sm font-medium text-gray-300">
                    🔢 Ordem
                  </Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order}
                    onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 1)}
                    placeholder="1"
                    min="1"
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                  {errors.order && (
                    <div className="flex items-center gap-1 text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      {errors.order}
                    </div>
                  )}
                </div>
              </div>

              {/* Aula Ativa */}
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive" className="text-sm font-medium text-gray-300">
                  ✅ Aula Ativa
                </Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                  className="data-[state=checked]:bg-purple-500"
                />
              </div>
            </div>
          </TabsContent>

          {/* ABA CONTEÚDO */}
          <TabsContent value="content" className="space-y-6">
            <div className="space-y-4">
              {/* Tipo de Vídeo */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">
                  🎥 TIPO DE VÍDEO
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="youtube"
                      name="videoType"
                      value="youtube"
                      checked={formData.videoType === "youtube"}
                      onChange={(e) => handleInputChange("videoType", e.target.value)}
                      className="text-purple-500"
                    />
                    <Label htmlFor="youtube" className="text-sm text-gray-300">
                      YouTube URL
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="vimeo"
                      name="videoType"
                      value="vimeo"
                      checked={formData.videoType === "vimeo"}
                      onChange={(e) => handleInputChange("videoType", e.target.value)}
                      className="text-purple-500"
                    />
                    <Label htmlFor="vimeo" className="text-sm text-gray-300">
                      Vimeo URL
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="panda"
                      name="videoType"
                      value="panda"
                      checked={formData.videoType === "panda"}
                      onChange={(e) => handleInputChange("videoType", e.target.value)}
                      className="text-purple-500"
                    />
                    <Label htmlFor="panda" className="text-sm text-gray-300">
                      Panda URL
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="upload"
                      name="videoType"
                      value="upload"
                      checked={formData.videoType === "upload"}
                      onChange={(e) => handleInputChange("videoType", e.target.value)}
                      className="text-purple-500"
                    />
                    <Label htmlFor="upload" className="text-sm text-gray-300">
                      Upload Local
                    </Label>
                  </div>
                </div>
              </div>

              {/* URL do Vídeo */}
              <div className="space-y-2">
                <Label htmlFor="videoUrl" className="text-sm font-medium text-gray-300">
                  🎬 URL do Vídeo
                </Label>
                <Input
                  id="videoUrl"
                  value={formData.videoUrl}
                  onChange={(e) => handleInputChange("videoUrl", e.target.value)}
                  placeholder={
                    formData.videoType === "youtube" ? "https://youtube.com/watch?v=..." :
                    formData.videoType === "vimeo" ? "https://vimeo.com/123456789" :
                    formData.videoType === "panda" ? "https://panda.com/video/abc123" :
                    "Selecione o tipo de vídeo primeiro"
                  }
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
                <div className="text-xs text-gray-400">
                  {formData.videoType === "youtube" && "Exemplo: https://youtube.com/watch?v=abc123"}
                  {formData.videoType === "vimeo" && "Exemplo: https://vimeo.com/123456789"}
                  {formData.videoType === "panda" && "Exemplo: https://panda.com/video/abc123"}
                  {formData.videoType === "upload" && "Clique em 'Upload Local' na aba MÍDIA"}
                </div>
              </div>

              {/* Editor de Texto Rico */}
              <div className="space-y-2">
                <Label htmlFor="richTextContent" className="text-sm font-medium text-gray-300">
                  📝 Editor de Texto Rico
                </Label>
                <Textarea
                  id="richTextContent"
                  value={formData.richTextContent}
                  onChange={(e) => handleInputChange("richTextContent", e.target.value)}
                  placeholder="Digite o conteúdo da aula em formato rico..."
                  rows={8}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Conteúdo Misto */}
              <div className="space-y-2">
                <Label htmlFor="mixedContent" className="text-sm font-medium text-gray-300">
                  🔄 Conteúdo Misto
                </Label>
                <Textarea
                  id="mixedContent"
                  value={formData.mixedContent}
                  onChange={(e) => handleInputChange("mixedContent", e.target.value)}
                  placeholder="Combine vídeo, texto e outros recursos..."
                  rows={6}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
          </TabsContent>

          {/* ABA MÍDIA */}
          <TabsContent value="media" className="space-y-6">
            <div className="space-y-4">
              {/* Thumbnail */}
              <div className="space-y-2">
                <Label htmlFor="thumbnail" className="text-sm font-medium text-gray-300">
                  🖼️ Thumbnail
                </Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('thumbnail', e)}
                    className="hidden"
                  />
                  <label htmlFor="thumbnail" className="cursor-pointer">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 mb-1">
                      {formData.thumbnail ? formData.thumbnail.name : "📁 Upload Thumbnail"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      PNG, JPG até 2MB
                    </p>
                  </label>
                </div>
                {formData.thumbnail && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Thumbnail: {formData.thumbnail.name}
                  </div>
                )}
              </div>

              {/* Documento */}
              <div className="space-y-2">
                <Label htmlFor="document" className="text-sm font-medium text-gray-300">
                  📄 Documento PDF
                </Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    id="document"
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileUpload('document', e)}
                    className="hidden"
                  />
                  <label htmlFor="document" className="cursor-pointer">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 mb-1">
                      {formData.document ? formData.document.name : "📁 Upload PDF"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      PDF até 10MB
                    </p>
                  </label>
                </div>
                {formData.document && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Documento: {formData.document.name}
                  </div>
                )}
              </div>

              {/* Imagem */}
              <div className="space-y-2">
                <Label htmlFor="image" className="text-sm font-medium text-gray-300">
                  🖼️ Imagem
                </Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('image', e)}
                    className="hidden"
                  />
                  <label htmlFor="image" className="cursor-pointer">
                    <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 mb-1">
                      {formData.image ? formData.image.name : "📁 Upload Imagem"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      PNG, JPG até 5MB
                    </p>
                  </label>
                </div>
                {formData.image && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Imagem: {formData.image.name}
                  </div>
                )}
              </div>
              
              {/* Vídeo */}
              <div className="space-y-2">
                <Label htmlFor="video" className="text-sm font-medium text-gray-300">
                  🎬 Arquivo de Vídeo
                </Label>
                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-gray-500 transition-colors">
                  <input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload('video', e)}
                    className="hidden"
                  />
                  <label htmlFor="video" className="cursor-pointer">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-300 mb-1">
                      {formData.video ? formData.video.name : "📁 Upload Vídeo"}
                    </p>
                    <p className="text-gray-400 text-sm">
                      MP4, MOV, AVI até 500MB
                    </p>
                  </label>
                </div>
                {formData.video && (
                  <div className="flex items-center gap-2 text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4" />
                    Vídeo: {formData.video.name}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ABA AVANÇADO */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-4">
              {/* Objetivos */}
              <div className="space-y-2">
                <Label htmlFor="objectives" className="text-sm font-medium text-gray-300">
                  🎯 Objetivos
                </Label>
                <Textarea
                  id="objectives"
                  value={formData.objectives}
                  onChange={(e) => handleInputChange("objectives", e.target.value)}
                  placeholder="Quais são os objetivos desta aula?"
                  rows={3}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Pré-requisitos */}
              <div className="space-y-2">
                <Label htmlFor="prerequisites" className="text-sm font-medium text-gray-300">
                  📋 Pré-requisitos
                </Label>
                <Textarea
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => handleInputChange("prerequisites", e.target.value)}
                  placeholder="O que o aluno precisa saber antes desta aula?"
                  rows={3}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Recursos */}
              <div className="space-y-2">
                <Label htmlFor="resources" className="text-sm font-medium text-gray-300">
                  🔗 Recursos
                </Label>
                <Textarea
                  id="resources"
                  value={formData.resources}
                  onChange={(e) => handleInputChange("resources", e.target.value)}
                  placeholder="Links e recursos adicionais..."
                  rows={3}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              {/* Quiz JSON */}
              <div className="space-y-2">
                <Label htmlFor="quizJson" className="text-sm font-medium text-gray-300">
                  ❓ Quiz JSON
                </Label>
                <Textarea
                  id="quizJson"
                  value={formData.quizJson}
                  onChange={(e) => handleInputChange("quizJson", e.target.value)}
                  placeholder='{"questions": [{"question": "Pergunta?", "options": ["A", "B", "C"], "correct": 0}]}'
                  rows={6}
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-400 font-mono text-sm"
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-300">
                  🏷️ Tags
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Digite uma tag..."
                    className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button onClick={handleAddTag} className="bg-purple-500 hover:bg-purple-600">
                    <Tag className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-gray-800 border-gray-600 text-white">
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-gray-400 hover:text-white"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

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
            {isLoading ? "Salvando..." : "💾 Salvar Aula"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 