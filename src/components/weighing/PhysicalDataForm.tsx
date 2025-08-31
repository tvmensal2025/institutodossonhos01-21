import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, Ruler, Calendar, Activity } from 'lucide-react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';

const PhysicalDataForm: React.FC = () => {
  const { physicalData, savePhysicalData, loading } = useWeightMeasurement();
  
  const [formData, setFormData] = useState({
    altura_cm: '',
    idade: '',
    sexo: '',
    nivel_atividade: 'moderado'
  });

  useEffect(() => {
    if (physicalData) {
      setFormData({
        altura_cm: physicalData.altura_cm.toString(),
        idade: physicalData.idade.toString(),
        sexo: physicalData.sexo,
        nivel_atividade: physicalData.nivel_atividade
      });
    }
  }, [physicalData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await savePhysicalData({
        altura_cm: parseFloat(formData.altura_cm),
        idade: parseInt(formData.idade),
        sexo: formData.sexo,
        nivel_atividade: formData.nivel_atividade
      });
    } catch (error) {
      console.error('Error saving physical data:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Dados Físicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="altura" className="flex items-center gap-2">
              <Ruler className="h-4 w-4" />
              Altura (cm) *
            </Label>
            <Input
              id="altura"
              type="number"
              step="0.1"
              min="100"
              max="250"
              value={formData.altura_cm}
              onChange={(e) => setFormData({ ...formData, altura_cm: e.target.value })}
              placeholder="170.5"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="idade" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Idade (anos) *
            </Label>
            <Input
              id="idade"
              type="number"
              min="10"
              max="120"
              value={formData.idade}
              onChange={(e) => setFormData({ ...formData, idade: e.target.value })}
              placeholder="30"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sexo">Sexo *</Label>
            <Select 
              value={formData.sexo} 
              onValueChange={(value) => setFormData({ ...formData, sexo: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu sexo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="masculino">Masculino</SelectItem>
                <SelectItem value="feminino">Feminino</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="atividade" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Nível de Atividade
            </Label>
            <Select 
              value={formData.nivel_atividade} 
              onValueChange={(value) => setFormData({ ...formData, nivel_atividade: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sedentario">Sedentário</SelectItem>
                <SelectItem value="leve">Leve</SelectItem>
                <SelectItem value="moderado">Moderado</SelectItem>
                <SelectItem value="intenso">Intenso</SelectItem>
                <SelectItem value="muito_intenso">Muito Intenso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : physicalData ? 'Atualizar Dados' : 'Salvar Dados'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default PhysicalDataForm;