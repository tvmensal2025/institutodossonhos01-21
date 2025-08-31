import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image, 
  Video, 
  File,
  Camera,
  Plus
} from 'lucide-react';

interface FileUploadProps {
  onFilesChange: (files: string[]) => void;
  currentFiles: string[];
  maxFiles?: number;
  accept?: string;
}

export function FileUpload({ 
  onFilesChange, 
  currentFiles, 
  maxFiles = 5, 
  accept = "image/*,video/*" 
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: string[] = [];
    const fileArray = Array.from(files);

    fileArray.forEach((file) => {
      if (currentFiles.length + newFiles.length >= maxFiles) return;

      // Simular upload - em produção, isso seria enviado para o Supabase Storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        newFiles.push(result);
        
        if (newFiles.length === fileArray.length || currentFiles.length + newFiles.length >= maxFiles) {
          onFilesChange([...currentFiles, ...newFiles]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = currentFiles.filter((_, i) => i !== index);
    onFilesChange(newFiles);
  };

  const getFileIcon = (file: string) => {
    if (file.includes('image')) return <Image className="w-4 h-4" />;
    if (file.includes('video')) return <Video className="w-4 h-4" />;
    return <File className="w-4 h-4" />;
  };

  const getFileType = (file: string) => {
    if (file.includes('image')) return 'Imagem';
    if (file.includes('video')) return 'Vídeo';
    return 'Arquivo';
  };

  return (
    <div className="space-y-3">
      {/* Área de Upload */}
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
          isDragging 
            ? 'border-primary bg-primary/5' 
            : 'border-muted-foreground/25 hover:border-primary/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <div className="space-y-2">
          <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              Arraste arquivos aqui ou{' '}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary hover:underline"
              >
                clique para selecionar
              </button>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {accept.includes('image') && 'Imagens e vídeos suportados'}
              {currentFiles.length}/{maxFiles} arquivos
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Arquivos */}
      {currentFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Arquivos selecionados</h4>
            <Badge variant="secondary" className="text-xs">
              {currentFiles.length}/{maxFiles}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {currentFiles.map((file, index) => (
              <Card key={index} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden relative">
                    {file.startsWith('data:image') ? (
                      <img 
                        src={file} 
                        alt={`Arquivo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-muted">
                        {getFileIcon(file)}
                      </div>
                    )}
                    
                    {/* Botão de remover */}
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <div className="mt-1">
                    <p className="text-xs text-muted-foreground truncate">
                      {getFileType(file)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Botão para adicionar mais */}
            {currentFiles.length < maxFiles && (
              <Card className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <CardContent className="p-2">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden flex items-center justify-center border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors">
                    <Plus className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="mt-1">
                    <p className="text-xs text-muted-foreground">Adicionar</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}