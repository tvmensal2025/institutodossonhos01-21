import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Send, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SofiaPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onImproveRequest: (improvements: SofiaImprovements) => void;
  currentMealData: any;
}

interface SofiaImprovements {
  restricoes?: string[];
  preferencias?: string[];
  alergias?: string[];
  objetivo?: string;
  observacoes?: string;
  calorias_ajuste?: number;
  variedade?: boolean;
}

const SofiaPopup: React.FC<SofiaPopupProps> = ({ 
  isOpen, 
  onClose, 
  onImproveRequest, 
  currentMealData 
}) => {
  const [step, setStep] = useState(1);
  const [improvements, setImprovements] = useState<SofiaImprovements>({
    restricoes: [],
    preferencias: [],
    alergias: [],
    observacoes: '',
    variedade: false
  });

  const [currentInput, setCurrentInput] = useState('');

  const handleAddToArray = (field: 'restricoes' | 'preferencias' | 'alergias') => {
    if (currentInput.trim()) {
      setImprovements(prev => ({
        ...prev,
        [field]: [...(prev[field] || []), currentInput.trim()]
      }));
      setCurrentInput('');
    }
  };

  const handleRemoveFromArray = (field: 'restricoes' | 'preferencias' | 'alergias', index: number) => {
    setImprovements(prev => ({
      ...prev,
      [field]: prev[field]?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmit = () => {
    onImproveRequest(improvements);
    setStep(1);
    setImprovements({
      restricoes: [],
      preferencias: [],
      alergias: [],
      observacoes: '',
      variedade: false
    });
    onClose();
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="text-center space-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-medium text-gray-800">
                Oi! Sou a Sofia 👋
              </h3>
              <p className="text-sm text-gray-600">
                Vou te ajudar a melhorar seu cardápio personalizado. 
                Vamos fazer algumas perguntas rápidas?
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-700">
                📊 <strong>Cardápio atual:</strong> {currentMealData?.calorias || 2000} kcal/dia
              </p>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              Vamos começar! ✨
            </Button>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-800">
              🚫 Restrições Alimentares
            </h3>
            <p className="text-sm text-gray-600">
              Existe algum alimento que você não pode ou não quer comer?
            </p>

            <div className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Ex: glúten, lactose, carne vermelha..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddToArray('restricoes')}
              />
              <Button 
                size="sm" 
                onClick={() => handleAddToArray('restricoes')}
                disabled={!currentInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {improvements.restricoes?.map((item, index) => (
                <Badge key={index} variant="destructive" className="cursor-pointer">
                  {item}
                  <X 
                    className="w-3 h-3 ml-1" 
                    onClick={() => handleRemoveFromArray('restricoes', index)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(1)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                Próximo →
              </Button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-800">
              ❤️ Preferências
            </h3>
            <p className="text-sm text-gray-600">
              Quais alimentos você gosta mais? Me ajude a personalizar seu cardápio!
            </p>

            <div className="flex gap-2">
              <Input
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder="Ex: frango, peixes, saladas, frutas..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddToArray('preferencias')}
              />
              <Button 
                size="sm" 
                onClick={() => handleAddToArray('preferencias')}
                disabled={!currentInput.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {improvements.preferencias?.map((item, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer">
                  {item}
                  <X 
                    className="w-3 h-3 ml-1" 
                    onClick={() => handleRemoveFromArray('preferencias', index)}
                  />
                </Badge>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(2)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(4)} className="flex-1">
                Próximo →
              </Button>
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-800">
              🎯 Objetivos
            </h3>
            <p className="text-sm text-gray-600">
              Qual é seu principal objetivo com a alimentação?
            </p>

            <div className="space-y-2">
              {[
                'Perder peso',
                'Ganhar massa muscular',
                'Manter peso atual',
                'Melhorar performance esportiva',
                'Mais energia no dia a dia',
                'Melhorar saúde geral'
              ].map((objetivo) => (
                <label key={objetivo} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="objetivo"
                    value={objetivo}
                    checked={improvements.objetivo === objetivo}
                    onChange={(e) => setImprovements(prev => ({
                      ...prev,
                      objetivo: e.target.value
                    }))}
                    className="text-purple-500"
                  />
                  <span className="text-sm">{objetivo}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(3)}>
                Voltar
              </Button>
              <Button onClick={() => setStep(5)} className="flex-1">
                Próximo →
              </Button>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-medium text-gray-800">
              📝 Observações Finais
            </h3>
            <p className="text-sm text-gray-600">
              Alguma observação especial? Rotina, horários, algum detalhe importante?
            </p>

            <Textarea
              value={improvements.observacoes}
              onChange={(e) => setImprovements(prev => ({
                ...prev,
                observacoes: e.target.value
              }))}
              placeholder="Ex: Trabalho até tarde, prefiro refeições práticas, treino de manhã..."
              rows={3}
            />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="variedade"
                checked={improvements.variedade}
                onCheckedChange={(checked) => setImprovements(prev => ({
                  ...prev,
                  variedade: checked as boolean
                }))}
              />
              <Label htmlFor="variedade" className="text-sm">
                Quero mais variedade no cardápio
              </Label>
            </div>

            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                ✨ Perfeito! Vou usar essas informações para melhorar seu cardápio personalizado.
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setStep(4)}>
                Voltar
              </Button>
              <Button 
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
              >
                Melhorar Cardápio! 🎉
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-center">
            Sofia - Assistente Nutricional
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {/* Indicador de progresso */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Etapa {step} de 5</span>
              <span>{Math.round((step / 5) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SofiaPopup;