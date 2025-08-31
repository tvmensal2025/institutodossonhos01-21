import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { User } from "@supabase/supabase-js";
import { getUserAvatar } from "@/lib/avatar-utils";
import { useUserProfile } from "@/hooks/useUserProfile";


import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfileSidebarProps {
  user: User | null;
  onUpdateProfile?: (data: any) => void;
}

export function UserProfileSidebar({ user, onUpdateProfile }: UserProfileSidebarProps) {
  const { profileData, loading: profileLoading, updateProfile, uploadAvatar } = useUserProfile(user);

  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Brasil',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // Inicializar dados do formulário quando o perfil carrega
  useEffect(() => {
    if (profileData) {
      setFormData({
        full_name: profileData.fullName || '',
        email: profileData.email || user?.email || '',
        phone: (profileData as any).phone || '',
        address: (profileData as any).address || '',
        city: (profileData as any).city || '',
        state: (profileData as any).state || '',
        postal_code: (profileData as any).postal_code || '',
        country: (profileData as any).country || 'Brasil',
        bio: (profileData as any).bio || ''
      });
    }
  }, [profileData, user?.email]);
  
  if (profileLoading || !user) return null;

  const userName = profileData.fullName || user.user_metadata?.full_name || user.email?.split("@")[0] || "Usuário";
  const avatarData = getUserAvatar(profileData.avatarUrl, userName);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const result = await updateProfile({
        fullName: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        state: formData.state,
        bio: formData.bio
      });

      if (result.success) {
        toast({
          title: "Perfil atualizado!",
          description: "Suas informações foram salvas com sucesso.",
        });
        setIsDialogOpen(false);
        onUpdateProfile?.(formData);
      } else {
        throw new Error('Erro ao salvar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o perfil. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    try {
      const avatarUrl = await uploadAvatar(file);
      if (avatarUrl) {
        await updateProfile({ avatarUrl });
        toast({
          title: "Avatar atualizado!",
          description: "Sua foto de perfil foi atualizada com sucesso.",
        });
        setIsAvatarDialogOpen(false);
      }
    } catch (error) {
      console.error('Erro ao fazer upload do avatar:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a foto. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header do Perfil */}
      <div className="text-center space-y-4">
        <div className="relative mx-auto w-fit">
          <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
            <DialogTrigger asChild>
              <div className="cursor-pointer">
                <Avatar className="h-20 w-20 border-4 border-primary/20 hover:border-primary/40 transition-colors">
                  {avatarData.type === 'photo' || avatarData.type === 'generated' ? (
                    <AvatarImage src={avatarData.value} alt={userName} />
                  ) : null}
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-2xl font-bold">
                    {avatarData.type === 'emoji' ? avatarData.value : userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
              <DialogHeader>
                <DialogTitle>Trocar Foto do Perfil</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center">
                  <Avatar className="h-24 w-24 mx-auto">
                    {avatarData.type === 'photo' || avatarData.type === 'generated' ? (
                      <AvatarImage src={avatarData.value} alt={userName} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 text-white text-3xl font-bold">
                      {avatarData.type === 'emoji' ? avatarData.value : userName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div>
                  <Label htmlFor="avatar-upload">Escolher nova foto</Label>
                  <Input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={avatarLoading}
                    className="mt-2"
                  />
                </div>
                {avatarLoading && (
                  <p className="text-sm text-muted-foreground text-center">
                    Fazendo upload...
                  </p>
                )}
              </div>
            </DialogContent>
          </Dialog>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-background flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          {/* Indicador de Anamnese Pendente */}
          
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{userName}</h2>
          <p className="text-sm text-muted-foreground">{profileData.email || user.email}</p>
          {(profileData as any).phone && (
            <p className="text-xs text-muted-foreground">📱 {(profileData as any).phone}</p>
          )}
          {(profileData as any).city && (profileData as any).state && (
            <p className="text-xs text-muted-foreground">📍 {(profileData as any).city}, {(profileData as any).state}</p>
          )}
          
          <div className="flex flex-col items-center gap-2">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              Online
            </Badge>
            <div className="text-xs text-muted-foreground">
              <span>Membro desde</span>
              <br />
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog de Edição do Perfil */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Editar Perfil
          </Button>
        </DialogTrigger>
           <DialogContent className="w-[95vw] max-w-md lg:max-w-lg max-h-[90vh] lg:max-h-[80vh] overflow-y-auto mx-4 lg:mx-0">
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Seu nome completo"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            {/* Telefone */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="(11) 99999-9999"
              />
            </div>

            {/* Endereço */}
            <div className="space-y-2">
              <Label htmlFor="address">Endereço</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Rua, número, complemento"
              />
            </div>

            {/* Cidade e Estado */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Sua cidade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="UF"
                />
              </div>
            </div>

            {/* CEP */}
            <div className="space-y-2">
              <Label htmlFor="postal_code">CEP</Label>
              <Input
                id="postal_code"
                value={formData.postal_code}
                onChange={(e) => handleInputChange('postal_code', e.target.value)}
                placeholder="00000-000"
              />
            </div>

            {/* País */}
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                placeholder="Brasil"
              />
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Sobre você</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Conte um pouco sobre você..."
                rows={3}
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveProfile} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}