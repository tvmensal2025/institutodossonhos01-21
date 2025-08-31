import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Save, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Copy,
  Star,
  StarOff 
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface AITemplate {
  id: string;
  name: string;
  description: string;
  configurations: Record<string, any>;
  is_favorite: boolean;
  created_at: string;
  usage_count: number;
}

interface AIConfigTemplateProps {
  currentConfigs: Record<string, any>;
  onApplyTemplate: (template: AITemplate) => void;
  templates: AITemplate[];
  onSaveTemplate: (template: Omit<AITemplate, 'id' | 'created_at' | 'usage_count'>) => void;
  onDeleteTemplate: (templateId: string) => void;
  onToggleFavorite: (templateId: string) => void;
}

export function AIConfigTemplate({ 
  currentConfigs, 
  onApplyTemplate, 
  templates, 
  onSaveTemplate,
  onDeleteTemplate,
  onToggleFavorite 
}: AIConfigTemplateProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    is_favorite: false
  });
  const { toast } = useToast();

  const handleSaveTemplate = () => {
    if (!newTemplate.name.trim()) {
      toast({
        title: "❌ Nome Obrigatório",
        description: "Por favor, insira um nome para o template",
        variant: "destructive"
      });
      return;
    }

    onSaveTemplate({
      name: newTemplate.name.trim(),
      description: newTemplate.description.trim(),
      configurations: currentConfigs,
      is_favorite: newTemplate.is_favorite
    });

    setNewTemplate({ name: '', description: '', is_favorite: false });
    setIsCreateModalOpen(false);
    
    toast({
      title: "✅ Template Salvo",
      description: `Template "${newTemplate.name}" foi salvo com sucesso`,
    });
  };

  const handleApplyTemplate = (template: AITemplate) => {
    onApplyTemplate(template);
    toast({
      title: "✅ Template Aplicado",
      description: `Configurações do template "${template.name}" foram aplicadas`,
    });
  };

  const handleExportTemplate = (template: AITemplate) => {
    const dataStr = JSON.stringify(template, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ai-template-${template.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportTemplate = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const template = JSON.parse(e.target?.result as string);
        onSaveTemplate({
          name: `${template.name} (Importado)`,
          description: template.description || '',
          configurations: template.configurations,
          is_favorite: false
        });
        
        toast({
          title: "✅ Template Importado",
          description: `Template "${template.name}" foi importado com sucesso`,
        });
      } catch (error) {
        toast({
          title: "❌ Erro na Importação",
          description: "Arquivo de template inválido",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const predefinedTemplates = [
    {
      id: 'preset-minimal',
      name: 'Configuração Econômica',
      description: 'Configuração básica com baixo custo',
      configurations: {
        default_tokens: 1024,
        default_temperature: 0.5,
        default_service: 'gemini',
        default_model: 'gemini-1.5-flash'
      },
      is_favorite: false,
      created_at: new Date().toISOString(),
      usage_count: 0
    },
    {
      id: 'preset-balanced',
      name: 'Configuração Equilibrada',
      description: 'Equilíbrio entre qualidade e custo',
      configurations: {
        default_tokens: 4096,
        default_temperature: 0.7,
        default_service: 'openai',
        default_model: 'gpt-4.1-2025-04-14'
      },
      is_favorite: true,
      created_at: new Date().toISOString(),
      usage_count: 0
    },
    {
      id: 'preset-premium',
      name: 'Configuração Premium',
      description: 'Máxima qualidade e inteligência',
      configurations: {
        default_tokens: 8192,
        default_temperature: 0.8,
        default_service: 'openai',
        default_model: 'o3-2025-04-16'
      },
      is_favorite: false,
      created_at: new Date().toISOString(),
      usage_count: 0
    }
  ];

  const allTemplates = [...predefinedTemplates, ...templates];
  const favoriteTemplates = allTemplates.filter(t => t.is_favorite);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Templates de Configuração
          </CardTitle>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".json"
              onChange={handleImportTemplate}
              className="hidden"
              id="import-template"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('import-template')?.click()}
            >
              <Upload className="w-4 h-4 mr-1" />
              Importar
            </Button>
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Novo Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Template</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Template</Label>
                    <Input
                      value={newTemplate.name}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Configuração para Relatórios"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Textarea
                      value={newTemplate.description}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descreva quando usar este template..."
                      rows={3}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is-favorite"
                      checked={newTemplate.is_favorite}
                      onChange={(e) => setNewTemplate(prev => ({ ...prev, is_favorite: e.target.checked }))}
                    />
                    <Label htmlFor="is-favorite">Marcar como favorito</Label>
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleSaveTemplate} className="flex-1">
                      <Save className="w-4 h-4 mr-1" />
                      Salvar Template
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateModalOpen(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Favorites Section */}
        {favoriteTemplates.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-muted-foreground">⭐ Favoritos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {favoriteTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onApply={() => handleApplyTemplate(template)}
                  onExport={() => handleExportTemplate(template)}
                  onDelete={() => onDeleteTemplate(template.id)}
                  onToggleFavorite={() => onToggleFavorite(template.id)}
                  isPredefined={predefinedTemplates.some(p => p.id === template.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* All Templates */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">📚 Todos os Templates</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {allTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onApply={() => handleApplyTemplate(template)}
                onExport={() => handleExportTemplate(template)}
                onDelete={() => onDeleteTemplate(template.id)}
                onToggleFavorite={() => onToggleFavorite(template.id)}
                isPredefined={predefinedTemplates.some(p => p.id === template.id)}
              />
            ))}
          </div>
        </div>

        {allTemplates.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Nenhum template salvo ainda.</p>
            <p className="text-sm">Crie seu primeiro template com as configurações atuais!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TemplateCard({ 
  template, 
  onApply, 
  onExport, 
  onDelete, 
  onToggleFavorite, 
  isPredefined 
}: {
  template: AITemplate;
  onApply: () => void;
  onExport: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  isPredefined: boolean;
}) {
  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h5 className="font-medium text-sm">{template.name}</h5>
              {isPredefined && (
                <Badge variant="secondary" className="text-xs">
                  Padrão
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleFavorite}
            className="p-1 h-auto"
          >
            {template.is_favorite ? (
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            ) : (
              <StarOff className="w-4 h-4 text-muted-foreground" />
            )}
          </Button>
        </div>

        <div className="flex gap-1 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onApply}
            className="flex-1 text-xs h-7"
          >
            <Copy className="w-3 h-3 mr-1" />
            Aplicar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="text-xs h-7 px-2"
          >
            <Download className="w-3 h-3" />
          </Button>
          {!isPredefined && (
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="text-xs h-7 px-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          )}
        </div>

        {template.usage_count > 0 && (
          <div className="text-xs text-muted-foreground mt-2">
            Usado {template.usage_count}x
          </div>
        )}
      </CardContent>
    </Card>
  );
}