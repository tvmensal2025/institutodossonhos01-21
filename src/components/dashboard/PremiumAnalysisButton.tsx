import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Sparkles, 
  Loader2, 
  Brain, 
  FileSearch,
  Zap,
  Crown,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumAnalysisButtonProps {
  documentId: string;
  onAnalysisStart?: () => void;
  disabled?: boolean;
  className?: string;
}

export const PremiumAnalysisButton: React.FC<PremiumAnalysisButtonProps> = ({
  documentId,
  onAnalysisStart,
  disabled = false,
  className = ""
}) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const startPremiumAnalysis = async () => {
    try {
      setIsAnalyzing(true);
      onAnalysisStart?.();
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      toast({
        title: '🚀 Iniciando Análise Premium',
        description: 'Processando com GPT-5 para análise médica completa...',
      });

      // Chamar a função de análise premium
      const { data, error } = await supabase.functions.invoke('analyze-medical-exam', {
        body: {
          documentId,
          userId: user.id,
          forcePremium: true,
          generateReport: true,
          examType: 'comprehensive'
        }
      });

      if (error) {
        console.error('❌ Erro na análise premium:', error);
        throw error;
      }

      console.log('✅ Análise premium iniciada:', data);

      toast({
        title: '✨ Análise Premium Iniciada!',
        description: 'Seu relatório médico completo estará pronto em 1-2 minutos.',
      });

      // Aguardar um pouco e recarregar
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Erro na análise premium:', error);
      toast({
        title: 'Erro na Análise Premium',
        description: error.message || 'Ocorreu um erro ao processar a análise',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={className}
    >
      <Button
        onClick={startPremiumAnalysis}
        disabled={disabled || isAnalyzing}
        className="relative overflow-hidden bg-gradient-to-r from-primary via-purple-600 to-pink-600 hover:from-primary/90 hover:via-purple-600/90 hover:to-pink-600/90 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
        size="sm"
      >
        {/* Brilho animado de fundo */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        <div className="relative z-10 flex items-center gap-2">
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <div className="relative">
              <Brain className="w-4 h-4" />
              <Sparkles className="w-3 h-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
            </div>
          )}
          
          <span className="font-semibold">
            {isAnalyzing ? 'Analisando...' : 'Análise Premium'}
          </span>
          
          {!isAnalyzing && (
            <div className="flex items-center gap-1">
              <Crown className="w-3 h-3 text-yellow-300" />
              <span className="text-xs font-bold bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                GPT-5
              </span>
            </div>
          )}
        </div>
        
        {/* Efeito de borda luminosa */}
        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-primary/50 via-purple-600/50 to-pink-600/50 blur-sm -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </Button>
    </motion.div>
  );
};

export default PremiumAnalysisButton;