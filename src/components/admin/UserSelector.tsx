import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Users, 
  UserCheck, 
  UserX,
  Crown,
  Filter
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  user_id: string;
  full_name: string;
  email: string;
  role?: string;
  is_super_admin?: boolean;
  avatar_url?: string;
}

interface UserSelectorProps {
  selectedUsers: string[];
  onSelectionChange: (userIds: string[]) => void;
}

export const UserSelector: React.FC<UserSelectorProps> = ({
  selectedUsers,
  onSelectionChange
}) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name, email, role, is_super_admin, avatar_url')
        .order('full_name');

      if (error) throw error;

      setUsers(data || []);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      roleFilter === 'all' ||
      (roleFilter === 'admin' && (user.role === 'admin' || user.is_super_admin)) ||
      (roleFilter === 'user' && user.role === 'user');

    return matchesSearch && matchesRole;
  });

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(filteredUsers.map(user => user.user_id));
    }
  };

  const handleUserToggle = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onSelectionChange(selectedUsers.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUsers, userId]);
    }
  };

  const getUserRole = (user: User) => {
    if (user.is_super_admin) return 'Super Admin';
    if (user.role === 'admin') return 'Admin';
    return 'Usuário';
  };

  const getRoleColor = (user: User) => {
    if (user.is_super_admin) return 'bg-purple-100 text-purple-800';
    if (user.role === 'admin') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Selecionar Usuários
        </CardTitle>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Buscar usuários</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nome ou email..."
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="role-filter">Filtrar por função</Label>
            <select
              id="role-filter"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="all">Todos</option>
              <option value="admin">Administradores</option>
              <option value="user">Usuários</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedUsers.length === filteredUsers.length ? (
                <>
                  <UserX className="w-4 h-4 mr-1" />
                  Desmarcar Todos
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Selecionar Todos
                </>
              )}
            </Button>
            
            <Badge variant="secondary">
              {selectedUsers.length} de {filteredUsers.length} selecionados
            </Badge>
          </div>
          
          <Badge variant="outline">
            {filteredUsers.length} usuário{filteredUsers.length !== 1 ? 's' : ''} encontrado{filteredUsers.length !== 1 ? 's' : ''}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div
                key={user.user_id}
                className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                  selectedUsers.includes(user.user_id)
                    ? 'bg-primary/5 border-primary/20'
                    : 'hover:bg-muted/50'
                }`}
              >
                <Checkbox
                  id={user.user_id}
                  checked={selectedUsers.includes(user.user_id)}
                  onCheckedChange={() => handleUserToggle(user.user_id)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Label 
                      htmlFor={user.user_id}
                      className="font-medium cursor-pointer"
                    >
                      {user.full_name || 'Usuário sem nome'}
                    </Label>
                    
                    {user.is_super_admin && (
                      <Crown className="w-4 h-4 text-purple-600" />
                    )}
                    
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getRoleColor(user)}`}
                    >
                      {getUserRole(user)}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            ))}
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhum usuário encontrado com os critérios de busca
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};