import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Ruler, 
  Save,
  Activity,
  Target,
  Award,
  TrendingDown,
  X
} from 'lucide-react';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  onUserUpdated: () => void;
}

interface UserDetail {
  user_id: string;
  profile: {
    full_name?: string;
    email?: string;
    phone?: string;
    city?: string;
    state?: string;
    bio?: string;
    created_at: string;
  };
  physicalData?: {
    altura_cm?: number;
    idade?: number;
    sexo?: string;
    nivel_atividade?: string;
  };
  stats: {
    totalMeasurements: number;
    averageWeight: number;
    weightLoss: number;
    completedMissions: number;
    lastActivity: string;
  };
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  userId,
  onUserUpdated
}) => {
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState({
    full_name: '',
    email: '',
    phone: '',
    city: '',
    state: '',
    bio: '',
    altura_cm: '',
    idade: '',
    sexo: '',
    nivel_atividade: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetail();
    }
  }, [isOpen, userId]);

  const fetchUserDetail = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Buscar perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      // Buscar dados físicos
      const { data: physicalData } = await supabase
        .from('user_physical_data')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Buscar medições para estatísticas
      const { data: measurements } = await supabase
        .from('weight_measurements')
        .select('peso_kg, measurement_date')
        .eq('user_id', userId)
        .order('measurement_date', { ascending: true });

      // Buscar missões completadas
      const { data: missions } = await supabase
        .from('daily_mission_sessions')
        .select('date, is_completed')
        .eq('user_id', userId)
        .eq('is_completed', true);

      // Calcular estatísticas
      const totalMeasurements = measurements?.length || 0;
      const weights = measurements?.map(m => m.peso_kg).filter(Boolean) || [];
      const averageWeight = weights.length > 0 
        ? weights.reduce((a, b) => a + b, 0) / weights.length 
        : 0;
      
      const weightLoss = weights.length >= 2 
        ? weights[0] - weights[weights.length - 1] 
        : 0;

      const completedMissions = missions?.length || 0;
      
      const lastActivity = Math.max(
        ...[
          ...(measurements || []).map(m => new Date(m.measurement_date).getTime()),
          ...(missions || []).map(m => new Date(m.date).getTime())
        ].filter(Boolean)
      );

      // Dados de perfil
      const mergedProfile = {
        full_name: profile?.full_name || '',
        email: '',
        phone: profile?.phone || '',
        city: profile?.city || '',
        created_at: profile?.created_at || ''
      };

      const detail: UserDetail = {
        user_id: userId,
        profile: mergedProfile,
        physicalData,
        stats: {
          totalMeasurements,
          averageWeight: Math.round(averageWeight * 10) / 10,
          weightLoss: Math.round(weightLoss * 10) / 10,
          completedMissions,
          lastActivity: lastActivity > 0 ? new Date(lastActivity).toISOString() : ''
        }
      };

      setUserDetail(detail);
      setEditData({
        full_name: mergedProfile.full_name,
        email: mergedProfile.email,
        phone: mergedProfile.phone,
        city: mergedProfile.city,
        state: '',
        bio: '',
        altura_cm: physicalData?.altura_cm?.toString() || '',
        idade: physicalData?.idade?.toString() || '',
        sexo: physicalData?.sexo || '',
        nivel_atividade: physicalData?.nivel_atividade || ''
      });

    } catch (error) {
      console.error('Error fetching user detail:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do usuário",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      setSaving(true);

      // Atualizar perfil na tabela profiles
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: editData.full_name,
          phone: editData.phone,
          city: editData.city,
          state: editData.state,
          bio: editData.bio,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
      }

      // Atualizar dados físicos se fornecidos
      if (editData.altura_cm || editData.idade || editData.sexo || editData.nivel_atividade) {
        const { error: physicalError } = await supabase
          .from('user_physical_data')
          .upsert({
            user_id: userId,
            altura_cm: editData.altura_cm ? parseInt(editData.altura_cm) : null,
            idade: editData.idade ? parseInt(editData.idade) : null,
            sexo: editData.sexo || null,
            nivel_atividade: editData.nivel_atividade || null,
            updated_at: new Date().toISOString()
          });

        if (physicalError) {
          console.error('Physical data update error:', physicalError);
        }
      }

      toast({
        title: "Sucesso",
        description: "Dados do usuário atualizados com sucesso",
      });

      onUserUpdated();
      onClose();

    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar dados do usuário",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen || !userId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Detalhes do Usuário
          </DialogTitle>
          <DialogDescription>
            Visualize e edite informações detalhadas do usuário
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ) : userDetail ? (
          <div className="space-y-6">
            {/* Estatísticas do Usuário */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-500" />
                    <div>
                      <p className="text-sm font-medium">{userDetail.stats.totalMeasurements}</p>
                      <p className="text-xs text-muted-foreground">Medições</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{userDetail.stats.averageWeight}kg</p>
                      <p className="text-xs text-muted-foreground">Peso Médio</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium">{userDetail.stats.weightLoss}kg</p>
                      <p className="text-xs text-muted-foreground">Perda de Peso</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-purple-500" />
                    <div>
                      <p className="text-sm font-medium">{userDetail.stats.completedMissions}</p>
                      <p className="text-xs text-muted-foreground">Missões</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulário de Edição */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      value={editData.full_name}
                      onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={editData.city}
                        onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={editData.state}
                        onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={editData.bio}
                      onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Dados Físicos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Dados Físicos
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="altura_cm">Altura (cm)</Label>
                      <Input
                        id="altura_cm"
                        type="number"
                        value={editData.altura_cm}
                        onChange={(e) => setEditData({ ...editData, altura_cm: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="idade">Idade</Label>
                      <Input
                        id="idade"
                        type="number"
                        value={editData.idade}
                        onChange={(e) => setEditData({ ...editData, idade: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select value={editData.sexo} onValueChange={(value) => setEditData({ ...editData, sexo: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o sexo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nivel_atividade">Nível de Atividade</Label>
                    <Select value={editData.nivel_atividade} onValueChange={(value) => setEditData({ ...editData, nivel_atividade: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sedentario">Sedentário</SelectItem>
                        <SelectItem value="leve">Leve</SelectItem>
                        <SelectItem value="moderado">Moderado</SelectItem>
                        <SelectItem value="intenso">Intenso</SelectItem>
                        <SelectItem value="muito_intenso">Muito Intenso</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Info do usuário */}
                  <div className="pt-4 border-t">
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <p><strong>ID:</strong> {userDetail.user_id}</p>
                      <p><strong>Cadastrado em:</strong> {new Date(userDetail.profile.created_at).toLocaleDateString('pt-BR')}</p>
                      {userDetail.stats.lastActivity && (
                        <p><strong>Última atividade:</strong> {new Date(userDetail.stats.lastActivity).toLocaleDateString('pt-BR')}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações */}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Usuário não encontrado</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserDetailModal;