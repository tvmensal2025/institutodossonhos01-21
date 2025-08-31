import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LockedMenuItemProps {
  children: React.ReactNode;
  feature: 'desafios' | 'comunidade' | 'sessoes' | 'assinatura' | 'courses';
  onClick?: () => void;
  className?: string;
}

// Componente simplificado: sem bloqueio nem rótulo "Em breve"

export const LockedMenuItem: React.FC<LockedMenuItemProps> = ({
  children,
  feature,
  onClick,
  className = ""
}) => {
  const { toast } = useToast();

  const featureNames = {
    desafios: 'Desafios Individuais',
    comunidade: 'Comunidade',
    sessoes: 'Sessões',
    assinatura: 'Assinaturas',
    courses: 'Plataforma dos Sonhos'
  };

  const handleClick = () => {
    toast({
      title: "🔒 Conteúdo Premium",
      description: `${featureNames[feature]} está disponível apenas para usuários premium. Faça upgrade para acessar!`,
      variant: "destructive"
    });
    // Não executa o onClick original para impedir navegação
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <Button
        variant="ghost"
        className={`w-full justify-start ${className} relative opacity-60 cursor-not-allowed hover:opacity-70`}
        onClick={handleClick}
      >
        {children}
        <Lock className="h-4 w-4 ml-auto text-muted-foreground" />
      </Button>
    </motion.div>
  );
};

export default LockedMenuItem; 