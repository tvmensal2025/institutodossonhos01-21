import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  birthDate: string;
  city: string;
  state: string;
  avatarUrl: string;
  bio: string;
  goals: string[];
  achievements: string[];
}

export const useUserProfile = (user: User | null) => {
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    birthDate: '',
    city: '',
    state: '',
    avatarUrl: '',
    bio: '',
    goals: [],
    achievements: []
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Carregar dados do perfil
  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Buscar da tabela profiles unificada
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, phone, birth_date, city, state, avatar_url, bio, goals, achievements')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        // Usar dados da tabela profiles
        setProfileData({
          fullName: data.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: data.phone || user.user_metadata?.phone || '',
          birthDate: data.birth_date || user.user_metadata?.birth_date || '',
          city: data.city || user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || '',
          bio: user.user_metadata?.bio || 'Transformando minha vida através da saúde e bem-estar.',
          goals: user.user_metadata?.goals || ['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis'],
          achievements: user.user_metadata?.achievements || ['Primeira semana completa', 'Primeira pesagem registrada']
        });
      } else {
        // Dados padrão se não existir perfil (não deve acontecer com o trigger)
        setProfileData({
          fullName: user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          birthDate: user.user_metadata?.birth_date || '',
          city: user.user_metadata?.city || '',
          state: user.user_metadata?.state || '',
          avatarUrl: user.user_metadata?.avatar_url || '',
          bio: user.user_metadata?.bio || 'Transformando minha vida através da saúde e bem-estar.',
          goals: user.user_metadata?.goals || ['Perder peso', 'Melhorar condicionamento', 'Adotar hábitos saudáveis'],
          achievements: user.user_metadata?.achievements || ['Primeira semana completa', 'Primeira pesagem registrada']
        });
      }

      if (error && error.code && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
      }
    } catch (error) {
      // Rede off/ERR_CONNECTION_RESET: não quebrar a página
      console.warn('Falha de rede ao carregar perfil. Usando dados locais.', error);
      setProfileData(prev => ({
        ...prev,
        fullName: user.user_metadata?.full_name || prev.fullName,
        email: user.email || prev.email,
        avatarUrl: user.user_metadata?.avatar_url || prev.avatarUrl,
      }));
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (newData: Partial<ProfileData>) => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      setSaving(true);
      
      const updatedData = { ...profileData, ...newData };
      
      console.log('🔄 Atualizando perfil...', { 
        user_id: user.id, 
        avatar_url: updatedData.avatarUrl,
        hasAvatarUrl: !!updatedData.avatarUrl 
      });
      
      // Atualizar no Supabase usando tabela profiles unificada
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updatedData.fullName,
          phone: updatedData.phone,
          birth_date: updatedData.birthDate,
          city: updatedData.city,
          state: updatedData.state,
          avatar_url: updatedData.avatarUrl, // ← Aqui está o problema principal
          bio: updatedData.bio,
          goals: updatedData.goals,
          achievements: updatedData.achievements,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao salvar perfil:', error);
        throw error;
      }

      console.log('✅ Perfil atualizado com sucesso');

      // Atualizar estado local
      setProfileData(updatedData);
      
      // Atualizar metadata do usuário
      await supabase.auth.updateUser({
        data: {
          full_name: updatedData.fullName,
          phone: updatedData.phone,
          birth_date: updatedData.birthDate,
          city: updatedData.city,
          state: updatedData.state,
          avatar_url: updatedData.avatarUrl,
          bio: updatedData.bio,
          goals: updatedData.goals,
          achievements: updatedData.achievements
        }
      });

      // Verificar se a atualização foi persistida
      const { data: verifyData, error: verifyError } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .single();

      if (verifyError) {
        console.error('❌ Erro ao verificar persistência:', verifyError);
      } else {
        console.log('✅ Verificação de persistência:', {
          avatar_url_saved: !!verifyData.avatar_url,
          avatar_url_length: verifyData.avatar_url?.length || 0
        });
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao atualizar perfil:', error);
      return { success: false, error };
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file: File) => {
    if (!user) return null;

    try {
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        throw new Error('Apenas arquivos de imagem são permitidos');
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Arquivo muito grande. Máximo 5MB permitido');
      }

      console.log('🔄 Iniciando upload do avatar...', { 
        fileName: file.name, 
        fileSize: file.size,
        fileType: file.type 
      });

      // Converter para base64 (solução mais confiável)
      const avatarUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      console.log('✅ Avatar convertido para base64');

      // Atualizar perfil com a nova URL
      const result = await updateProfile({ avatarUrl });
      
      if (result.success) {
        console.log('✅ Avatar atualizado com sucesso');
        return avatarUrl;
      } else {
        throw new Error('Falha ao atualizar avatar no perfil');
      }

    } catch (error) {
      console.error('❌ Erro ao fazer upload do avatar:', error);
      throw error;
    }
  };

  return {
    profileData,
    loading,
    saving,
    updateProfile,
    uploadAvatar,
    loadProfile
  };
}; 