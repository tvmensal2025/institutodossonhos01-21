import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GraduationCap, Loader2, Sparkles } from 'lucide-react';

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
      
      toast({
        title: '🚀 Iniciando Relatório Premium',
        description: 'Gerando análise educativa com GPT-5...',
      });
      
      // Chamar a função smart-medical-exam para relatório premium
      const { data, error } = await supabase.functions.invoke('smart-medical-exam', {
        body: { userId, documentId }
      });
      
      if (error) throw error;
      
      // Verificar se temos um caminho de relatório
      const reportPath = data?.reportPath || data?.data?.reportPath;
      
      if (!reportPath) {
        throw new Error('Caminho do relatório não retornado');
      }
      
      // Obter URL assinada para o relatório premium
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('medical-documents-reports')
        .createSignedUrl(reportPath, 60 * 60); // 1 hora
      
      if (signedUrlError) throw signedUrlError;
      
      // Abrir o relatório premium em uma nova aba
      window.open(signedUrlData.signedUrl, '_blank');
      
      toast({
        title: '✨ Relatório Premium Gerado!',
        description: 'Abrindo relatório educativo premium com explicações completas...',
      });
    } catch (error) {
      console.error('Erro ao gerar relatório premium:', error);
      toast({
        title: 'Erro ao gerar relatório premium',
        description: error.message || 'Ocorreu um erro ao gerar o relatório educativo',
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
      title="Gerar relatório premium com explicações educativas completas usando GPT-5"
      className="flex items-center gap-2 border-primary/20 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
      ) : (
        <>
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-primary" />
            <Sparkles className="w-3 h-3 text-yellow-500 absolute -top-1 -right-1 group-hover:animate-pulse" />
          </div>
        </>
      )}
      <span className="text-primary font-medium">
        {isLoading ? 'Gerando Premium...' : 'Premium'}
      </span>
      {!isLoading && (
        <span className="text-xs bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent font-bold">
          GPT-5
        </span>
      )}
    </Button>
  );
};

export default DidacticReportButton;
