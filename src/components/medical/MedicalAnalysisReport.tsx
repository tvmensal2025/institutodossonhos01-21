import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Calendar, 
  Building2, 
  Hash,
  Download,
  Share2,
  Sparkles,
  Heart,
  Droplets,
  Shield,
  Target,
  Apple,
  Activity,
  Brain,
  Users
} from 'lucide-react';
import { motion } from 'framer-motion';
import PremiumMedicalAnalysisCard from './PremiumMedicalAnalysisCard';
import { useToast } from '@/hooks/use-toast';

interface MedicalDocument {
  id: string;
  patient_name?: string;
  exam_date?: string;
  laboratory?: string;
  exam_id?: string;
  analysis_result?: any;
}

interface MedicalAnalysisReportProps {
  document: MedicalDocument;
  isVisible: boolean;
  onClose?: () => void;
}

export const MedicalAnalysisReport: React.FC<MedicalAnalysisReportProps> = ({
  document,
  isVisible,
  onClose
}) => {
  const { toast } = useToast();
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (document.analysis_result) {
      setAnalysisData(document.analysis_result);
      setLoading(false);
    }
  }, [document]);

  const handleDownloadReport = () => {
    toast({
      title: "📄 Relatório Premium",
      description: "Funcionalidade de download será implementada em breve",
    });
  };

  const handleShareReport = () => {
    toast({
      title: "🔗 Compartilhar",
      description: "Funcionalidade de compartilhamento será implementada em breve",
    });
  };

  if (!isVisible || loading) {
    return null;
  }

  // Dados de exemplo estruturados como na imagem
  const exampleData = {
    patient: {
      name: document.patient_name || "Paciente",
      examDate: document.exam_date || "05/09/2025",
      laboratory: document.laboratory || "Instituto dos Sonhos",
      examId: document.exam_id || "#210237A"
    },
    clinicalSummary: "Lamento, mas não posso ajudar com a análise de imagens de exames médicos.",
    categories: [
      {
        category: "🫀 Perfil Metabólico",
        icon: <Heart className="w-6 h-6 text-red-500" />,
        results: [
          {
            name: "Glicemia de Jejum",
            value: "98",
            unit: "mg/dL",
            reference: "70-100 mg/dL",
            status: "normal" as const,
            category: "🫀 Perfil Metabólico",
            explanation: "Quantifica a concentração de açúcar líquido no período entre 8-12 horas sem comer, que deve permanecer elevado apenas após refeições. Esse aspecto apresenta oscilação com estresse, infecções, corticoides, café muito forte e quebra de jejum, por isso a preparação importa.",
            recommendation: "Manter jejum adequado e controlar estresse para resultados mais precisos."
          },
          {
            name: "Colesterol LDL",
            value: "142",
            unit: "mg/dL",
            reference: "< 100 mg/dL",
            status: "attention" as const,
            category: "🫀 Perfil Metabólico",
            explanation: "Quantifica o colesterol que viaja nos 'caminhões LDL', os que têm maior tendência a aderir às paredes das artérias. Dependendo do laboratório, o LDL pode ser medido diretamente ou calculado. Por refletir média recente, é sensível a jejum/álcool, dieta e hormônios da tireoide.",
            recommendation: "Considerar mudanças na dieta e aumentar atividade física."
          },
          {
            name: "Vitamina D",
            value: "24",
            unit: "ng/mL",
            reference: "> 30 ng/mL",
            status: "attention" as const,
            category: "🫀 Perfil Metabólico",
            explanation: "Mede a forma de reserva da vitamina D, produzida na pele pelo sol e obtida por alimentos/suplementos. É o melhor indicador do estoque disponível para ossos e músculos.",
            recommendation: "Aumentar exposição solar e considerar suplementação."
          }
        ],
        recommendations: [
          "Manter dieta equilibrada com baixo teor de açúcares refinados",
          "Realizar atividade física regular, pelo menos 150 minutos por semana",
          "Monitorar peso corporal e medidas abdominais"
        ]
      },
      {
        category: "🛡️ Função Renal e Hepática",
        icon: <Shield className="w-6 h-6 text-purple-500" />,
        results: [
          {
            name: "Creatinina",
            value: "0.9",
            unit: "mg/dL",
            reference: "0.6-1.1 mg/dL",
            status: "normal" as const,
            category: "🛡️ Função Renal e Hepática",
            explanation: "É um subproduto do músculo que os rins devem filtrar. Quando a filtração diminui, a creatinina acumula no sangue. O valor também depende de massa muscular, hidratação e algumas medicações.",
            recommendation: "Manter hidratação adequada e acompanhar periodicamente."
          },
          {
            name: "TGP/ALT",
            value: "28",
            unit: "U/L",
            reference: "< 40 U/L",
            status: "normal" as const,
            category: "🛡️ Função Renal e Hepática",
            explanation: "São enzimas dentro das células do fígado. Quando as células sofrem (gordura, vírus, álcool, remédios, esforço intenso), parte dessas enzimas 'vaza' para o sangue, elevando os valores no exame.",
            recommendation: "Manter estilo de vida saudável e evitar excesso de álcool."
          }
        ],
        recommendations: [
          "Manter hidratação adequada (2-3 litros de água por dia)",
          "Evitar automedicação e uso excessivo de analgésicos",
          "Limitar consumo de álcool"
        ]
      }
    ],
    personalizedRecommendations: {
      alimentacao: "Adotar uma dieta rica em vegetais, frutas e fibras. Reduzir açúcares refinados e gorduras saturadas. Incluir ômega-3 e antioxidantes naturais.",
      atividadeFisica: "Realizar pelo menos 150 minutos de atividade física moderada por semana. Incluir exercícios aeróbicos e fortalecimento muscular.",
      bemestar: "Praticar técnicas de relaxamento e meditação. Manter rotina de sono adequada (7-9 horas). Reduzir fatores de estresse.",
      acompanhamento: "Retornar consultas regulares com médico. Repetir exames em 3-6 meses para acompanhar evolução. Manter registro de sintomas."
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-background via-background/50 to-primary/5 p-4"
    >
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Premium */}
        <Card className="relative overflow-hidden border-0 shadow-xl bg-gradient-to-r from-primary/90 to-purple-600/90 text-white">
          <div className="absolute inset-0 bg-black/10"></div>
          <CardHeader className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Análise Médica Completa
                  </CardTitle>
                  <Badge variant="secondary" className="bg-white/20 text-white border-white/30 mt-2">
                    IA Premium - Inteligência Médica Avançada
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDownloadReport}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShareReport}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Informações do Paciente */}
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome Paciente</p>
                  <p className="font-semibold">{exampleData.patient.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Data</p>
                  <p className="font-semibold">{exampleData.patient.examDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Laboratório</p>
                  <p className="font-semibold">{exampleData.patient.laboratory}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Hash className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">ID Exame</p>
                  <p className="font-semibold">{exampleData.patient.examId}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resumo Clínico */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              📝 Resumo Clínico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {exampleData.clinicalSummary}
            </p>
          </CardContent>
        </Card>

        {/* Análise por Categorias */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center mb-8 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            📊 Resultados Detalhados por Categoria
          </h2>
          
          {exampleData.categories.map((category, index) => (
            <PremiumMedicalAnalysisCard
              key={index}
              category={category.category}
              icon={category.icon}
              results={category.results}
              recommendations={category.recommendations}
              className="mb-6"
            />
          ))}
        </div>

        {/* Recomendações Personalizadas */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/5 to-purple-600/5">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              🎯 Recomendações Personalizadas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white dark:bg-card border border-green-200 dark:border-green-800">
                  <h4 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-400 mb-3">
                    <Apple className="w-5 h-5" />
                    🥗 Alimentação
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exampleData.personalizedRecommendations.alimentacao}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white dark:bg-card border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold flex items-center gap-2 text-blue-700 dark:text-blue-400 mb-3">
                    <Activity className="w-5 h-5" />
                    🏃‍♂️ Atividade Física
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exampleData.personalizedRecommendations.atividadeFisica}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-white dark:bg-card border border-purple-200 dark:border-purple-800">
                  <h4 className="font-semibold flex items-center gap-2 text-purple-700 dark:text-purple-400 mb-3">
                    <Brain className="w-5 h-5" />
                    🧘‍♀️ Bem-estar
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exampleData.personalizedRecommendations.bemestar}
                  </p>
                </div>
                
                <div className="p-4 rounded-lg bg-white dark:bg-card border border-orange-200 dark:border-orange-800">
                  <h4 className="font-semibold flex items-center gap-2 text-orange-700 dark:text-orange-400 mb-3">
                    <Users className="w-5 h-5" />
                    👨‍⚕️ Acompanhamento
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {exampleData.personalizedRecommendations.acompanhamento}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        {onClose && (
          <div className="flex justify-center pt-6">
            <Button
              variant="outline"
              onClick={onClose}
              className="px-8"
            >
              Voltar ao Dashboard
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MedicalAnalysisReport;