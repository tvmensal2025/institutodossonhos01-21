import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Brain, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Users,
  Target,
  Shield,
  AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomSaboteur {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  impact: string;
  strategies: string[];
  triggers: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const SaboteurManagement = () => {
  const [customSaboteurs, setCustomSaboteurs] = useState<CustomSaboteur[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSaboteur, setEditingSaboteur] = useState<CustomSaboteur | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0
  });
  
  const [newSaboteur, setNewSaboteur] = useState({
    name: '',
    description: '',
    characteristics: '',
    impact: '',
    strategies: '',
    triggers: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    loadCustomSaboteurs();
  }, []);

  const loadCustomSaboteurs = async () => {
    try {
      // Simulação de dados para custom saboteurs
      const data: CustomSaboteur[] = [];
      
      setCustomSaboteurs(data || []);

      // Calcular estatísticas
      const activeCount = 0;
      setStats({
        total: data.length,
        active: activeCount,
        inactive: data.length - activeCount
      });

    } catch (error) {
      console.error('Error loading custom saboteurs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os sabotadores personalizados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSaboteur = async () => {
    try {
      // Simulação de criação de saboteur customizado
      console.log('Criando saboteur:', newSaboteur.name);

      toast({
        title: "Sucesso!",
        description: "Sabotador personalizado criado com sucesso",
      });

      setShowCreateModal(false);
      setNewSaboteur({
        name: '',
        description: '',
        characteristics: '',
        impact: '',
        strategies: '',
        triggers: ''
      });
      loadCustomSaboteurs();
    } catch (error) {
      console.error('Error creating saboteur:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o sabotador personalizado",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSaboteur = async (saboteurId: string) => {
    try {
      // Simulação de deleção de saboteur
      console.log('Deletando saboteur:', saboteurId);

      toast({
        title: "Sucesso!",
        description: "Sabotador personalizado removido com sucesso",
      });

      loadCustomSaboteurs();
    } catch (error) {
      console.error('Error deleting saboteur:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o sabotador personalizado",
        variant: "destructive"
      });
    }
  };

  const handleToggleSaboteur = async (saboteurId: string) => {
    const saboteur = customSaboteurs.find(s => s.id === saboteurId);
    if (!saboteur) return;

    try {
      // Simulação de toggle de saboteur
      console.log('Toggleando saboteur:', saboteurId);

      toast({
        title: "Sucesso!",
        description: `Sabotador ${saboteur.isActive ? 'desativado' : 'ativado'} com sucesso`,
      });

      loadCustomSaboteurs();
    } catch (error) {
      console.error('Error toggling saboteur:', error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status do sabotador",
        variant: "destructive"
      });
    }
  };

  const handleUpdateSaboteur = async (saboteur: CustomSaboteur) => {
    try {
      // Simulação de atualização de saboteur
      console.log('Atualizando saboteur:', saboteur.id);

      toast({
        title: "Sucesso!",
        description: "Sabotador personalizado atualizado com sucesso",
      });

      setEditingSaboteur(null);
      loadCustomSaboteurs();
    } catch (error) {
      console.error('Error updating saboteur:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o sabotador personalizado",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white">Gestão de Sabotadores</h2>
          <p className="text-gray-400">Crie e gerencie sabotadores personalizados baseados nos padrões dos usuários</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-600 text-white">
            <Shield className="h-3 w-3 mr-1" />
            Sistema Ativo
          </Badge>
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Criar Sabotador
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Criar Sabotador Personalizado</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome do Sabotador</Label>
                  <Input
                    id="name"
                    value={newSaboteur.name}
                    onChange={(e) => setNewSaboteur(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: O Procrastinador Ansioso"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={newSaboteur.description}
                    onChange={(e) => setNewSaboteur(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Descreva as características principais deste sabotador..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="impact">Impacto na Vida</Label>
                  <Textarea
                    id="impact"
                    value={newSaboteur.impact}
                    onChange={(e) => setNewSaboteur(prev => ({ ...prev, impact: e.target.value }))}
                    placeholder="Como este sabotador afeta a vida da pessoa..."
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateSaboteur}>
                    Criar Sabotador
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Total de Sabotadores</CardTitle>
            <Brain className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.total}</div>
            <p className="text-xs text-gray-400">Sabotadores personalizados</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Ativos</CardTitle>
            <Target className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.active}</div>
            <p className="text-xs text-gray-400">Em uso ativamente</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white">Inativos</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.inactive}</div>
            <p className="text-xs text-gray-400">Temporariamente pausados</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Sabotadores */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-purple-400" />
            Sabotadores Personalizados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {customSaboteurs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">Nenhum sabotador personalizado criado</div>
              <p className="text-sm text-gray-500">
                Crie sabotadores baseados nos padrões comportamentais específicos dos seus usuários
              </p>
              <Button 
                className="mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowCreateModal(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Primeiro Sabotador
              </Button>
            </div>
          ) : (
            customSaboteurs.map((saboteur) => (
              <div key={saboteur.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${saboteur.isActive ? 'bg-green-500' : 'bg-gray-500'}`} />
                  <div>
                    <h4 className="font-semibold text-white">{saboteur.name}</h4>
                    <p className="text-sm text-gray-400 max-w-md truncate">
                      {saboteur.description}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={saboteur.isActive ? "bg-green-600" : "bg-gray-600"}>
                    {saboteur.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                  
                  <Switch
                    checked={saboteur.isActive}
                    onCheckedChange={() => handleToggleSaboteur(saboteur.id)}
                  />
                  
                  <Button size="sm" variant="outline" onClick={() => setEditingSaboteur(saboteur)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleDeleteSaboteur(saboteur.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SaboteurManagement;