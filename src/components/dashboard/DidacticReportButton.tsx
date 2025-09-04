import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Loader2 } from 'lucide-react';

interface DidacticReportButtonProps {
  documentId: string;
  userId: string;
  disabled?: boolean;
}

const DidacticReportButton: React.FC<DidacticReportButtonProps> = ({ documentId, userId, disabled = false }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const generateDidacticReport = async () => {
    try {
      setIsLoading(true);
      
      // Chamar a função smart-medical-exam
      const { data, error } = await supabase.functions.invoke('smart-medical-exam', {
        body: { userId, documentId }
      });
      
      if (error) throw error;
      
      // Verificar se temos um caminho de relatório (múltiplas opções)
      const reportPath = data?.reportPath || data?.data?.reportPath;
      
      if (!reportPath) {
        throw new Error('Caminho do relatório não retornado');
      }
      
      // Obter URL assinada para o relatório
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('medical-documents-reports')
        .createSignedUrl(reportPath, 60 * 60); // 1 hora
      
      if (signedUrlError) throw signedUrlError;
      
      // Abrir o relatório em uma nova aba
      window.open(signedUrlData.signedUrl, '_blank');
      
      toast({
        title: '🎓 Relatório didático gerado!',
        description: 'Abrindo relatório educativo em nova aba...',
      });
    } catch (error) {
      console.error('Erro ao gerar relatório didático:', error);
      toast({
        title: 'Erro ao gerar relatório',
        description: error.message || 'Ocorreu um erro ao gerar o relatório didático',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={generateDidacticReport}
      disabled={disabled || isLoading}
      title="Gerar relatório didático com explicações simples"
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <GraduationCap className="w-4 h-4" />
      )}
      {isLoading ? 'Gerando...' : 'Didático'}
    </Button>
  );
};

export default DidacticReportButton;
