import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale } from 'lucide-react';

interface SimpleWeightFormProps {
  onWeightChange?: (weight: number) => void;
}

const SimpleWeightForm: React.FC<SimpleWeightFormProps> = ({ onWeightChange }) => {
  const [weight, setWeight] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight || isNaN(Number(weight))) return;

    setIsSubmitting(true);
    
    try {
      const weightValue = parseFloat(weight);
      onWeightChange?.(weightValue);
      
      // Reset form
      setWeight('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="weight" className="text-white">
          Peso atual (kg)
        </Label>
        <Input
          id="weight"
          type="number"
          step="0.1"
          min="30"
          max="300"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="Ex: 70.5"
          className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={!weight || isSubmitting}
        className="w-full bg-blue-500 hover:bg-blue-600"
      >
        <Scale className="w-4 h-4 mr-2" />
        {isSubmitting ? 'Registrando...' : 'Registrar Peso'}
      </Button>
    </form>
  );
};

export default SimpleWeightForm;