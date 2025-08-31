
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { User, Mail, Phone, MapPin, Calendar, Award } from 'lucide-react';

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

const UserProfile = () => {
  const [profile, setProfile] = useState<Partial<UserProfileData>>({});
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchAchievements();
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback className="text-lg">
                      {profile.full_name ? getInitials(profile.full_name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-2xl">
                      {profile.full_name || 'Usuário'}
                    </CardTitle>
                    <CardDescription>
                      Membro desde {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'hoje'}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant={editing ? "outline" : "default"}
                  onClick={() => editing ? setEditing(false) : setEditing(true)}
                >
                  {editing ? 'Cancelar' : 'Editar'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {editing ? (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
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
                  
                  <div className="grid md:grid-cols-3 gap-4">
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
                  
                  <div>
                    <Label htmlFor="emergency_contact">Contato de Emergência</Label>
                    <Input
                      id="emergency_contact"
                      value={profile.emergency_contact || ''}
                      onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    />
                  </div>
                  
                  <Button onClick={handleSave} disabled={loading} className="w-full">
                    {loading ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span>{profile.phone}</span>
                    </div>
                  )}
                  {profile.birth_date && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span>{new Date(profile.birth_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {(profile.address || profile.city || profile.state) && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span>
                        {[profile.address, profile.city, profile.state].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  )}
                  {profile.emergency_contact && (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span>Emergência: {profile.emergency_contact}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Achievements Card */}
        <div>
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
                <p className="text-center text-gray-500 py-4">
                  Nenhuma conquista ainda.
                  Continue usando a plataforma!
                </p>
              ) : (
                <div className="space-y-3">
                  {achievements.map((achievement) => (
                    <div key={achievement.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{achievement.title}</h4>
                        <Badge variant="secondary">{achievement.points} pts</Badge>
                      </div>
                      <p className="text-xs text-gray-600 mb-2">{achievement.description}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(achievement.earned_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
