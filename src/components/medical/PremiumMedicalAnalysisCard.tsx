import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ChevronDown, 
  ChevronUp,
  Heart,
  Droplets,
  Brain,
  Shield,
  Target,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamResult {
  name: string;
  value: string | number;
  unit: string;
  reference: string;
  status: 'normal' | 'attention' | 'altered';
  category: string;
  explanation: string;
  recommendation?: string;
}

interface PremiumMedicalAnalysisCardProps {
  category: string;
  icon: React.ReactNode;
  results: ExamResult[];
  recommendations?: string[];
  className?: string;
}

const getStatusIcon = (status: ExamResult['status']) => {
  switch (status) {
    case 'normal':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    case 'attention':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'altered':
      return <XCircle className="w-5 h-5 text-red-500" />;
    default:
      return <CheckCircle className="w-5 h-5 text-gray-400" />;
  }
};

const getStatusColor = (status: ExamResult['status']) => {
  switch (status) {
    case 'normal':
      return 'border-l-green-500 bg-green-50 dark:bg-green-950/20';
    case 'attention':
      return 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20';
    case 'altered':
      return 'border-l-red-500 bg-red-50 dark:bg-red-950/20';
    default:
      return 'border-l-gray-300 bg-gray-50 dark:bg-gray-950/20';
  }
};

const getCategoryIcon = (category: string) => {
  if (category.toLowerCase().includes('lipídico') || category.toLowerCase().includes('colesterol')) {
    return <Heart className="w-6 h-6 text-red-500" />;
  }
  if (category.toLowerCase().includes('glicose') || category.toLowerCase().includes('diabetes')) {
    return <Droplets className="w-6 h-6 text-blue-500" />;
  }
  if (category.toLowerCase().includes('renal') || category.toLowerCase().includes('creatinina')) {
    return <Shield className="w-6 h-6 text-purple-500" />;
  }
  if (category.toLowerCase().includes('fígado') || category.toLowerCase().includes('hepat')) {
    return <Target className="w-6 h-6 text-orange-500" />;
  }
  return <TrendingUp className="w-6 h-6 text-primary" />;
};

export const PremiumMedicalAnalysisCard: React.FC<PremiumMedicalAnalysisCardProps> = ({
  category,
  icon,
  results,
  recommendations = [],
  className = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedExam, setSelectedExam] = useState<ExamResult | null>(null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="relative overflow-hidden border-0 shadow-2xl bg-gradient-to-br from-background via-background/90 to-primary/5 backdrop-blur-sm">
        {/* Premium Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-purple-600/10 to-pink-600/10 opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
        
        {/* Premium Badge */}
        <div className="absolute top-4 right-4 z-20">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="relative"
          >
            <Badge className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-white border-0 px-3 py-1.5 shadow-lg">
              <Sparkles className="w-3 h-3 mr-1 animate-pulse" />
              Premium AI
            </Badge>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/50 via-purple-600/50 to-pink-600/50 blur-md -z-10 opacity-70"></div>
          </motion.div>
        </div>

        <CardHeader className="pb-6 relative z-10">
          <CardTitle className="flex items-center gap-4 text-xl">
            <div className="p-3 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20 backdrop-blur-sm border border-primary/20">
              {icon || getCategoryIcon(category)}
            </div>
            <span className="bg-gradient-to-r from-foreground via-primary to-purple-600 bg-clip-text text-transparent font-bold">
              {category}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">
          {/* Grid de Resultados */}
          <div className="grid gap-4">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                className={`relative p-5 rounded-xl border-l-4 transition-all cursor-pointer hover:shadow-xl hover:shadow-primary/10 backdrop-blur-sm border border-border/50 ${getStatusColor(result.status)}`}
                onClick={() => setSelectedExam(selectedExam?.name === result.name ? null : result)}
              >
                {/* Subtle glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-xl"></div>
                <div className="flex items-center justify-between relative z-10">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {getStatusIcon(result.status)}
                      </motion.div>
                      <h4 className="font-bold text-foreground text-lg">{result.name}</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs uppercase tracking-wide">Resultado:</span>
                        <p className="font-bold text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                          {result.value} {result.unit}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-muted-foreground text-xs uppercase tracking-wide">Referência:</span>
                        <p className="font-semibold text-muted-foreground">{result.reference}</p>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4 h-10 w-10 rounded-full bg-gradient-to-r from-primary/10 to-purple-600/10 hover:from-primary/20 hover:to-purple-600/20 border border-primary/20"
                    >
                      {selectedExam?.name === result.name ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </motion.div>
                </div>

                {/* Explicação Expandida */}
                <AnimatePresence>
                  {selectedExam?.name === result.name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-6 pt-6 border-t border-gradient-to-r from-primary/20 to-purple-600/20"
                      >
                        <div className="space-y-6">
                          <div className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-purple-600/5 border border-primary/10">
                            <h5 className="font-bold text-primary mb-3 flex items-center gap-2">
                              <div className="p-1 rounded-full bg-primary/20">
                                <Brain className="w-4 h-4" />
                              </div>
                              Como Funciona?
                            </h5>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {result.explanation}
                            </p>
                          </div>
                          
                          {result.recommendation && (
                            <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-emerald-600/5 border border-green-500/10">
                              <h5 className="font-bold text-green-600 dark:text-green-400 mb-3 flex items-center gap-2">
                                <div className="p-1 rounded-full bg-green-500/20">
                                  <Target className="w-4 h-4" />
                                </div>
                                Recomendação
                              </h5>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {result.recommendation}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          {/* Botão para Ver Mais */}
          {results.length > 3 && !isExpanded && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(true)}
              className="w-full"
            >
              Ver mais {results.length - 3} exames
              <ChevronDown className="w-4 h-4 ml-2" />
            </Button>
          )}

          {/* Recomendações da Categoria */}
          {recommendations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/10 via-purple-600/5 to-pink-600/5 border border-primary/20 backdrop-blur-sm"
            >
              <h5 className="font-bold text-primary mb-4 flex items-center gap-3">
                <div className="p-2 rounded-full bg-gradient-to-r from-primary/20 to-purple-600/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                Recomendações Personalizadas
              </h5>
              <ul className="space-y-3">
                {recommendations.map((rec, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="text-sm text-muted-foreground flex items-start gap-3 p-3 rounded-lg bg-white/50 dark:bg-card/50 backdrop-blur-sm"
                  >
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="leading-relaxed">{rec}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumMedicalAnalysisCard;