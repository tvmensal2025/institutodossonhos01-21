import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Stethoscope, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format, addMonths, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ExamAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | null;
  userName?: string;
}

interface ExamAccessData {
  hasAccessedThisMonth: boolean;
  lastAccessDate?: string;
  nextAccessDate?: string;
  daysUntilNextAccess: number;
  accessCount: number;
}

const ExamAccessModal: React.FC<ExamAccessModalProps> = ({
  isOpen,
  onClose,
  userId,
  userName
}) => {
  const [examAccess, setExamAccess] = useState<ExamAccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && userId) {
      fetchExamAccess();
    }
  }, [isOpen, userId]);

  const fetchExamAccess = async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Verificar acesso atual usando localStorage (mesmo método do hook)
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const lastAccessKey = `exam_access_${userId}_${currentMonth}`;
      const hasAccessedThisMonth = localStorage.getItem(lastAccessKey) === 'true';

      // Buscar histórico de acessos (simulado por enquanto)
      const accessHistory = [];
      for (let i = 0; i < 6; i++) {
        const month = new Date();
        month.setMonth(month.getMonth() - i);
        const monthKey = month.toISOString().slice(0, 7);
        const monthAccessKey = `exam_access_${userId}_${monthKey}`;
        const hasAccess = localStorage.getItem(monthAccessKey) === 'true';
        if (hasAccess) {
          accessHistory.push({
            month: monthKey,
            date: month.toISOString()
          });
        }
      }

      const accessCount = accessHistory.length;

      if (hasAccessedThisMonth) {
        // Já acessou este mês, calcular próximo acesso
        const nextMonth = addMonths(startOfMonth(new Date()), 1);
        const daysUntilNext = Math.ceil((nextMonth.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

        setExamAccess({
          hasAccessedThisMonth: true,
          lastAccessDate: accessHistory[0]?.date,
          nextAccessDate: nextMonth.toISOString(),
          daysUntilNextAccess: Math.max(0, daysUntilNext),
          accessCount
        });
      } else {
        // Pode acessar este mês
        setExamAccess({
          hasAccessedThisMonth: false,
          nextAccessDate: new Date().toISOString(),
          daysUntilNextAccess: 0,
          accessCount
        });
      }

    } catch (error) {
      console.error('Erro ao buscar acesso aos exames:', error);
      toast({
        title: "Erro",
        description: "Não foi possível buscar o status de acesso aos exames.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const grantExamAccess = async () => {
    if (!userId) return;

    try {
      setUpdating(true);

      // Liberar acesso para este mês
      const currentMonth = new Date().toISOString().slice(0, 7);
      const lastAccessKey = `exam_access_${userId}_${currentMonth}`;
      localStorage.setItem(lastAccessKey, 'true');

      toast({
        title: "Acesso Liberado",
        description: `Acesso aos exames liberado para ${userName || 'o usuário'} este mês.`,
      });

      // Recarregar dados
      await fetchExamAccess();

    } catch (error) {
      console.error('Erro ao liberar acesso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível liberar o acesso aos exames.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const resetExamAccess = async () => {
    if (!userId) return;

    try {
      setUpdating(true);

      // Remover acesso deste mês
      const currentMonth = new Date().toISOString().slice(0, 7);
      const lastAccessKey = `exam_access_${userId}_${currentMonth}`;
      localStorage.removeItem(lastAccessKey);

      toast({
        title: "Acesso Resetado",
        description: `Acesso aos exames resetado para ${userName || 'o usuário'}.`,
      });

      // Recarregar dados
      await fetchExamAccess();

    } catch (error) {
      console.error('Erro ao resetar acesso:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resetar o acesso aos exames.",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatNextAccessDate = () => {
    if (!examAccess?.nextAccessDate) return '';
    
    return format(new Date(examAccess.nextAccessDate), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Gestão de Acesso aos Exames
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Usuário */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{userName || 'Usuário'}</h3>
                  <p className="text-sm text-muted-foreground">ID: {userId}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Atual */}
          {loading ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Carregando status...</span>
                </div>
              </CardContent>
            </Card>
          ) : examAccess ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Status de Acesso</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Atual */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {examAccess.hasAccessedThisMonth ? (
                      <XCircle className="h-5 w-5 text-red-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    <div>
                      <h4 className="font-medium">
                        {examAccess.hasAccessedThisMonth ? 'Acesso Utilizado' : 'Acesso Disponível'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {examAccess.hasAccessedThisMonth 
                          ? 'Usuário já utilizou o acesso este mês'
                          : 'Usuário pode acessar os exames este mês'
                        }
                      </p>
                    </div>
                  </div>
                  <Badge variant={examAccess.hasAccessedThisMonth ? "destructive" : "default"}>
                    {examAccess.hasAccessedThisMonth ? 'Bloqueado' : 'Liberado'}
                  </Badge>
                </div>

                {/* Próximo Acesso */}
                {examAccess.hasAccessedThisMonth && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">Próximo Acesso</h4>
                        <p className="text-sm text-muted-foreground">
                          {formatNextAccessDate()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {examAccess.daysUntilNextAccess} dias
                    </Badge>
                  </div>
                )}

                {/* Estatísticas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">Total de Acessos</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-600">{examAccess.accessCount}</p>
                    <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
                  </div>
                  
                  <div className="p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium">Status Mensal</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-600">
                      {examAccess.hasAccessedThisMonth ? '1/1' : '0/1'}
                    </p>
                    <p className="text-xs text-muted-foreground">Acessos este mês</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {/* Ações */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
            
            {examAccess && (
              <>
                {examAccess.hasAccessedThisMonth ? (
                  <Button 
                    onClick={resetExamAccess}
                    disabled={updating}
                    variant="outline"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${updating ? 'animate-spin' : ''}`} />
                    Resetar Acesso
                  </Button>
                ) : (
                  <Button 
                    onClick={grantExamAccess}
                    disabled={updating}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Liberar Acesso
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExamAccessModal; 