
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  User, Mail, Phone, MapPin, Calendar, Award, 
  FileText, Activity, Settings, Bell, Crown,
  TrendingUp, Eye, Download, Share, Edit2,
  Shield, CreditCard, Clock, Target, Zap,
  BarChart3, Plus, ExternalLink
} from 'lucide-react';

interface UserProfileData {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  birth_date: string;
  gender: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  emergency_contact: string;
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  points: number;
  earned_at: string;
}

interface MedicalDocument {
  id: string;
  document_type: string;
  file_name: string;
  upload_date: string;
  analysis_status: string;
}

interface ActivityStat {
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  color: string;
}

interface NotificationPreference {
  id: string;
  type: string;
  label: string;
  enabled: boolean;
}

const UserProfile = () => {
  const [profile, setProfile] = useState<Partial<UserProfileData>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [medicalDocuments, setMedicalDocuments] = useState<MedicalDocument[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStat[]>([]);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchProfile();
    fetchAchievements();
    fetchMedicalDocuments();
    fetchActivityStats();
    fetchNotificationPreferences();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile({
          ...data,
          email: user.email || ''
        });
      } else {
        // Create initial profile
        setProfile({
          user_id: user.id,
          email: user.email || '',
          full_name: '',
          phone: '',
          birth_date: '',
          gender: '',
          address: '',
          city: '',
          state: '',
          zip_code: '',
          emergency_contact: '',
          avatar_url: ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Erro ao carregar perfil');
    }
  };

  const fetchAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: achievementsData, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (achievementsError) throw achievementsError;
      setAchievements(achievementsData as any[] || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const fetchMedicalDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('medical_documents')
        .select('id, file_name, created_at, analysis_status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching medical documents:', error);
        setMedicalDocuments([]);
        return;
      }
      
      // Map data to match interface
      const mappedData = (data || []).map(doc => ({
        id: doc.id,
        document_type: 'Exame Médico',
        file_name: doc.file_name,
        upload_date: doc.created_at,
        analysis_status: doc.analysis_status
      }));
      
      setMedicalDocuments(mappedData);
    } catch (error) {
      console.error('Error fetching medical documents:', error);
      setMedicalDocuments([]);
    }
  };

  const fetchActivityStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Mock data for activity stats - you can replace with real queries
      const stats: ActivityStat[] = [
        { label: 'Exames Analisados', value: '12', icon: FileText, color: 'text-blue-600' },
        { label: 'Dias Consecutivos', value: '7', icon: Zap, color: 'text-green-600' },
        { label: 'Metas Concluídas', value: '5', icon: Target, color: 'text-purple-600' },
        { label: 'Pontos Totais', value: '2,340', icon: Award, color: 'text-orange-600' },
      ];
      
      setActivityStats(stats);
    } catch (error) {
      console.error('Error fetching activity stats:', error);
    }
  };

  const fetchNotificationPreferences = async () => {
    try {
      const preferences: NotificationPreference[] = [
        { id: '1', type: 'email', label: 'Notificações por Email', enabled: true },
        { id: '2', type: 'push', label: 'Notificações Push', enabled: false },
        { id: '3', type: 'reports', label: 'Relatórios Semanais', enabled: true },
        { id: '4', type: 'reminders', label: 'Lembretes de Atividade', enabled: true },
      ];
      
      setNotificationPrefs(preferences);
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    }
  };

  const handleInputChange = (field: keyof UserProfileData, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const profileData = {
        ...profile,
        user_id: user.id,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      toast.success('Perfil atualizado com sucesso!');
      setEditing(false);
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(`Erro ao salvar perfil: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const toggleNotification = (id: string) => {
    setNotificationPrefs(prev => 
      prev.map(pref => 
        pref.id === id ? { ...pref, enabled: !pref.enabled } : pref
      )
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Section */}
      <div className="mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-r from-primary/5 to-secondary/5">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                      {profile.full_name ? getInitials(profile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-1">
                    {profile.full_name || 'Usuário'}
                  </h1>
                  <p className="text-muted-foreground mb-2">
                    Membro desde {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR') : 'hoje'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {profile.email && (
                      <div className="flex items-center space-x-1">
                        <Mail className="h-4 w-4" />
                        <span>{profile.email}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center space-x-1">
                        <Phone className="h-4 w-4" />
                        <span>{profile.phone}</span>
                      </div>
                    )}
                    {(profile.city || profile.state) && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-4 w-4" />
                        <span>{[profile.city, profile.state].filter(Boolean).join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <Button
                size="lg"
                variant={editing ? "outline" : "default"}
                onClick={() => setEditing(!editing)}
                className="shrink-0"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {editing ? 'Cancelar' : 'Editar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {activityStats.map((stat, index) => {
          const IconComponent = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                  </div>
                  <IconComponent className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="medical" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Meus Exames
          </TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            Conquistas
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Assinatura
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Seus dados básicos de perfil</CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Nome Completo</Label>
                        <Input
                          id="full_name"
                          value={profile.full_name || ''}
                          onChange={(e) => handleInputChange('full_name', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={profile.phone || ''}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="birth_date">Data de Nascimento</Label>
                        <Input
                          id="birth_date"
                          type="date"
                          value={profile.birth_date || ''}
                          onChange={(e) => handleInputChange('birth_date', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="gender">Sexo</Label>
                        <Select value={profile.gender || ''} onValueChange={(value) => handleInputChange('gender', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="masculino">Masculino</SelectItem>
                            <SelectItem value="feminino">Feminino</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="address">Endereço</Label>
                      <Input
                        id="address"
                        value={profile.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          value={profile.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          value={profile.state || ''}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="zip_code">CEP</Label>
                        <Input
                          id="zip_code"
                          value={profile.zip_code || ''}
                          onChange={(e) => handleInputChange('zip_code', e.target.value)}
                        />
                      </div>
                    </div>
                    <Button onClick={handleSave} disabled={loading} className="w-full">
                      {loading ? 'Salvando...' : 'Salvar Alterações'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Nome</Label>
                        <p className="font-medium">{profile.full_name || 'Não informado'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Data de Nascimento</Label>
                        <p className="font-medium">
                          {profile.birth_date ? new Date(profile.birth_date).toLocaleDateString('pt-BR') : 'Não informado'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Sexo</Label>
                        <p className="font-medium">{profile.gender || 'Não informado'}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Contato de Emergência</Label>
                        <p className="font-medium">{profile.emergency_contact || 'Não informado'}</p>
                      </div>
                    </div>
                    {profile.address && (
                      <div>
                        <Label className="text-sm text-muted-foreground">Endereço Completo</Label>
                        <p className="font-medium">
                          {[profile.address, profile.city, profile.state, profile.zip_code].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Suas ações mais recentes na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Exame de sangue analisado</p>
                      <p className="text-xs text-muted-foreground">Há 2 dias</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Meta de exercício concluída</p>
                      <p className="text-xs text-muted-foreground">Há 3 dias</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted/50">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Perfil atualizado</p>
                      <p className="text-xs text-muted-foreground">Há 1 semana</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Medical Documents Tab */}
        <TabsContent value="medical" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Meus Exames</CardTitle>
                <CardDescription>Histórico dos seus exames médicos analisados</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Novo Exame
              </Button>
            </CardHeader>
            <CardContent>
              {medicalDocuments.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhum exame encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    Faça upload dos seus exames para receber análises detalhadas
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Enviar Primeiro Exame
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {medicalDocuments.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.file_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.document_type} • {new Date(doc.upload_date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={doc.analysis_status === 'completed' ? 'default' : 'secondary'}>
                          {doc.analysis_status === 'completed' ? 'Analisado' : 'Processando'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Achievements Tab */}
        <TabsContent value="achievements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Conquistas</span>
              </CardTitle>
              <CardDescription>
                Suas realizações na plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              {achievements.length === 0 ? (
                <div className="text-center py-12">
                  <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma conquista ainda</h3>
                  <p className="text-muted-foreground">
                    Continue usando a plataforma para desbloquear conquistas!
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <Badge variant="secondary">{achievement.points} pts</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                      <p className="text-xs text-muted-foreground">
                        Conquistado em {new Date(achievement.earned_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Notificações</span>
                </CardTitle>
                <CardDescription>
                  Configure suas preferências de notificação
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {notificationPrefs.map((pref) => (
                  <div key={pref.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{pref.label}</p>
                      <p className="text-sm text-muted-foreground">
                        Receber {pref.type === 'email' ? 'emails' : pref.type === 'push' ? 'notificações push' : 'lembretes'}
                      </p>
                    </div>
                    <Switch
                      checked={pref.enabled}
                      onCheckedChange={() => toggleNotification(pref.id)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Privacidade e Segurança</span>
                </CardTitle>
                <CardDescription>
                  Gerencie suas configurações de segurança
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="h-4 w-4 mr-2" />
                  Alterar Senha
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Eye className="h-4 w-4 mr-2" />
                  Configurar 2FA
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Dados
                </Button>
                <Separator />
                <Button variant="destructive" className="w-full">
                  Excluir Conta
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Subscription Tab */}
        <TabsContent value="subscription" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                <span>Status da Assinatura</span>
              </CardTitle>
              <CardDescription>
                Gerencie sua assinatura e benefícios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-6 w-6 text-yellow-600" />
                      <span className="text-lg font-semibold">Plano Premium</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-green-200">Ativo</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Próxima cobrança: 15 de outubro, 2024
                  </p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Gerenciar Pagamento
                    </Button>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Faturas
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Benefícios Inclusos</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    {[
                      'Análise ilimitada de exames',
                      'Relatórios personalizados',
                      'Consulta com Dr. Vital',
                      'Suporte prioritário',
                      'Backup automático',
                      'Acesso a beta features'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserProfile;
