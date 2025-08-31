import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, 
  Sparkles, 
  Brain, 
  Heart,
  TrendingUp,
  CheckCircle
} from 'lucide-react';

interface SessionData {
  responses: Record<string, any>;
  score: number;
  insights: string[];
}

interface DrVitalSessionEndProps {
  sessionData: SessionData;
  onContinue: () => void;
}

const DrVitalSessionEnd: React.FC<DrVitalSessionEndProps> = ({ 
  sessionData, 
  onContinue 
}) => {
  const [showInsights, setShowInsights] = useState(false);

  const generatePersonalizedSummary = () => {
    const { score, insights } = sessionData;
    
    if (score >= 8) {
      return {
        title: "Excelente trabalho!",
        message: "Você demonstrou grande consciência sobre seus hábitos de saúde. Seus resultados indicam que você está no caminho certo para uma vida mais equilibrada.",
        mood: "positive"
      };
    } else if (score >= 6) {
      return {
        title: "Bom progresso!",
        message: "Você está fazendo escolhas conscientes para sua saúde. Há algumas áreas onde podemos focar para potencializar seus resultados.",
        mood: "encouraging"
      };
    } else {
      return {
        title: "Vamos juntos nessa jornada!",
        message: "Reconhecer onde estamos é o primeiro passo para a transformação. Seus resultados mostram oportunidades valiosas de crescimento.",
        mood: "supportive"
      };
    }
  };

  const summary = generatePersonalizedSummary();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl w-full"
      >
        <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
          <CardContent className="p-0">
            {/* Dr. Vital Character */}
            <div className="relative bg-gradient-to-r from-blue-600 to-green-600 p-8 text-white text-center">
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="mb-6"
              >
                <div className="w-32 h-32 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Brain className="w-16 h-16 text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2">Dr. Vital</h1>
                <p className="text-blue-100">Seu consultor de saúde inteligente</p>
              </motion.div>

              {/* Decorative Elements */}
              <div className="absolute top-4 left-4">
                <Sparkles className="w-6 h-6 text-yellow-300 opacity-70" />
              </div>
              <div className="absolute top-8 right-8">
                <Heart className="w-5 h-5 text-pink-300 opacity-60" />
              </div>
              <div className="absolute bottom-6 left-8">
                <TrendingUp className="w-5 h-5 text-green-300 opacity-70" />
              </div>
            </div>

            {/* Summary Content */}
            <div className="p-8">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">
                  {summary.title}
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto">
                  {summary.message}
                </p>
              </motion.div>

              {/* Score Display */}
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="flex justify-center mb-8"
              >
                <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 rounded-2xl text-white text-center shadow-lg">
                  <div className="text-4xl font-bold mb-2">{sessionData.score.toFixed(1)}</div>
                  <div className="text-sm opacity-90">Score de Saúde</div>
                </div>
              </motion.div>

              {/* Key Insights Preview */}
              <AnimatePresence>
                {showInsights && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="mb-8 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {sessionData.insights.slice(0, 4).map((insight, index) => (
                        <motion.div
                          key={index}
                          initial={{ x: -20, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                          className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                        >
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action Buttons */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.5 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              >
                {!showInsights && (
                  <Button
                    variant="outline"
                    onClick={() => setShowInsights(true)}
                    className="flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Ver Principais Insights
                  </Button>
                )}
                
                <Button
                  onClick={onContinue}
                  className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-3 text-lg font-semibold flex items-center gap-2 shadow-lg"
                >
                  Ver Meus Gráficos
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </motion.div>

              {/* Footer Message */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1, duration: 0.5 }}
                className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400"
              >
                <p>Seus dados foram analisados com segurança e privacidade</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default DrVitalSessionEnd;