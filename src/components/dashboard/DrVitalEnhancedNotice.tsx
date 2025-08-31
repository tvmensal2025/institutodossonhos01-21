import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Database, Brain, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DrVitalEnhancedNotice: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 mb-6">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-full">
            <Stethoscope className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <CardTitle className="text-green-800 flex items-center gap-2">
              Dr. Vital Enhanced Ativo!
              <Badge variant="secondary" className="bg-green-100 text-green-700">
                <CheckCircle className="w-3 h-3 mr-1" />
                Conectado
              </Badge>
            </CardTitle>
            <CardDescription className="text-green-700">
              Dr. Vital agora tem acesso completo aos seus dados de saúde
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
            <Database className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Dados Completos</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
            <Brain className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">IA Avançada</span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-white/50 rounded-lg">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-800">Análises Precisas</span>
          </div>
        </div>

        <div className="bg-white/60 p-4 rounded-lg">
          <h4 className="font-semibold text-green-800 mb-2">✅ Dr. Vital agora pode acessar:</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>• Anamnese completa e histórico familiar</li>
            <li>• Peso, altura, composição corporal e metabolismo</li>
            <li>• Histórico nutricional e padrões alimentares</li>
            <li>• Respostas diárias (sono, energia, stress)</li>
            <li>• Metas de saúde e progresso</li>
            <li>• Conquistas e hábitos</li>
          </ul>
        </div>

        <Button 
          onClick={() => navigate('/dr-vital-enhanced')}
          className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
          Acessar Dr. Vital Enhanced
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};