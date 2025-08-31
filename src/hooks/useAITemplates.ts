import { useState, useEffect } from 'react';

interface AITemplate {
  id: string;
  name: string;
  description: string;
  configurations: Record<string, any>;
  is_favorite: boolean;
  created_at: string;
  usage_count: number;
}

export function useAITemplates() {
  const [templates, setTemplates] = useState<AITemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load templates from localStorage
  useEffect(() => {
    const savedTemplates = localStorage.getItem('ai-templates');
    if (savedTemplates) {
      try {
        setTemplates(JSON.parse(savedTemplates));
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    }
  }, []);

  // Save templates to localStorage
  const saveTemplates = (newTemplates: AITemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem('ai-templates', JSON.stringify(newTemplates));
  };

  const saveTemplate = (template: Omit<AITemplate, 'id' | 'created_at' | 'usage_count'>) => {
    const newTemplate: AITemplate = {
      ...template,
      id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: new Date().toISOString(),
      usage_count: 0
    };

    const newTemplates = [...templates, newTemplate];
    saveTemplates(newTemplates);
    return newTemplate;
  };

  const deleteTemplate = (templateId: string) => {
    const newTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(newTemplates);
  };

  const toggleFavorite = (templateId: string) => {
    const newTemplates = templates.map(t => 
      t.id === templateId ? { ...t, is_favorite: !t.is_favorite } : t
    );
    saveTemplates(newTemplates);
  };

  const incrementUsage = (templateId: string) => {
    const newTemplates = templates.map(t => 
      t.id === templateId ? { ...t, usage_count: t.usage_count + 1 } : t
    );
    saveTemplates(newTemplates);
  };

  const updateTemplate = (templateId: string, updates: Partial<AITemplate>) => {
    const newTemplates = templates.map(t => 
      t.id === templateId ? { ...t, ...updates } : t
    );
    saveTemplates(newTemplates);
  };

  return {
    templates,
    isLoading,
    saveTemplate,
    deleteTemplate,
    toggleFavorite,
    incrementUsage,
    updateTemplate
  };
}