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
      <Card className="relative overflow-hidden border-0 shadow-lg bg-gradient-to-br from-background to-background/50">
        {/* Premium Badge */}
        <div className="absolute top-3 right-3 z-10">
          <Badge variant="secondary" className="bg-gradient-to-r from-primary to-purple-600 text-white border-0 px-2 py-1">
            <Sparkles className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>

        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-lg">
            {icon || getCategoryIcon(category)}
            <span className="bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {category}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Grid de Resultados */}
          <div className="grid gap-3">
            {results.map((result, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 transition-all cursor-pointer hover:shadow-md ${getStatusColor(result.status)}`}
                onClick={() => setSelectedExam(selectedExam?.name === result.name ? null : result)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(result.status)}
                      <h4 className="font-semibold text-foreground">{result.name}</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Resultado:</span>
                        <p className="font-medium">{result.value} {result.unit}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Referência:</span>
                        <p className="font-medium">{result.reference}</p>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                  >
                    {selectedExam?.name === result.name ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </div>

                {/* Explicação Expandida */}
                <AnimatePresence>
                  {selectedExam?.name === result.name && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-border/50"
                    >
                      <div className="space-y-3">
                        <div>
                          <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
                            <Brain className="w-4 h-4" />
                            Como Funciona?
                          </h5>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {result.explanation}
                          </p>
                        </div>
                        
                        {result.recommendation && (
                          <div>
                            <h5 className="font-semibold text-primary mb-2 flex items-center gap-2">
                              <Target className="w-4 h-4" />
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
            <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/10">
              <h5 className="font-semibold text-primary mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recomendações Personalizadas
              </h5>
              <ul className="space-y-2">
                {recommendations.map((rec, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PremiumMedicalAnalysisCard;