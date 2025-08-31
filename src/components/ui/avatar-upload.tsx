import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Camera, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatar?: string;
  userName?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onAvatarUpdate?: (avatarUrl: string) => void;
  className?: string;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatar,
  userName = 'User',
  size = 'lg',
  onAvatarUpdate,
  className = ''
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16',
    lg: 'h-20 w-20',
    xl: 'h-32 w-32'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo de imagem válido.",
        variant: "destructive"
      });
      return;
    }

    // Validar tamanho (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Erro",
        description: "A imagem deve ter no máximo 5MB.",
        variant: "destructive"
      });
      return;
    }

    // Criar preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload do arquivo
    uploadAvatar(file);
  };

  const uploadAvatar = async (file: File) => {
    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não está logado');
      }

      // Criar nome único para o arquivo
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Remover avatar anterior se existir
      if (currentAvatar) {
        const oldPath = currentAvatar.split('/').slice(-2).join('/');
        await supabase.storage
          .from('avatars')
          .remove([oldPath]);
      }

      // Upload do novo arquivo
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Obter URL pública
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const avatarUrl = data.publicUrl;

      // Atualizar perfil do usuário
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Callback para atualizar estado pai
      if (onAvatarUpdate) {
        onAvatarUpdate(avatarUrl);
      }

      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar foto de perfil. Tente novamente.",
        variant: "destructive"
      });
      setPreviewUrl(null);
    } finally {
      setUploading(false);
    }
  };

  const removeAvatar = async () => {
    try {
      setUploading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não está logado');

      // Remover arquivo do storage se existir
      if (currentAvatar) {
        const oldPath = currentAvatar.split('/').slice(-2).join('/');
        await supabase.storage
          .from('avatars')
          .remove([oldPath]);
      }

      // Atualizar perfil removendo avatar
      const { error } = await supabase
        .from('profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      setPreviewUrl(null);
      if (onAvatarUpdate) {
        onAvatarUpdate('');
      }

      toast({
        title: "Sucesso!",
        description: "Foto de perfil removida com sucesso.",
      });

    } catch (error) {
      console.error('Erro ao remover avatar:', error);
      toast({
        title: "Erro",
        description: "Erro ao remover foto de perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const displayAvatar = previewUrl || currentAvatar;

  return (
    <div className={`relative group ${className}`}>
      <Avatar className={`${sizeClasses[size]} transition-all duration-200 group-hover:opacity-75`}>
        {displayAvatar ? (
          <AvatarImage src={displayAvatar} alt="Avatar" />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-lg">
          {userName.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Overlay com botões */}
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <div className="flex gap-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-8 w-8 p-0 bg-white/90 hover:bg-white rounded cursor-pointer flex items-center justify-center"
            role="button"
            tabIndex={uploading ? -1 : 0}
            aria-label="Alterar foto do perfil"
          >
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
            ) : (
              <Camera className="h-4 w-4 text-gray-700" />
            )}
          </div>

          {displayAvatar && (
            <div
              onClick={removeAvatar}
              className="h-8 w-8 p-0 bg-red-500/90 hover:bg-red-600 text-white rounded cursor-pointer flex items-center justify-center"
              role="button"
              tabIndex={uploading ? -1 : 0}
              aria-label="Remover foto do perfil"
            >
              <X className="h-4 w-4" />
            </div>
          )}
        </div>
      </div>

      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};