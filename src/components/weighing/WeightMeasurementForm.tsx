import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Scale, Zap, Heart, Droplets, Bone, Brain, Activity } from 'lucide-react';
import { useWeightMeasurement } from '@/hooks/useWeightMeasurement';

const WeightMeasurementForm: React.FC = () => {
  const { saveMeasurement, loading, physicalData } = useWeightMeasurement();
  
  const [formData, setFormData] = useState({
    peso_kg: '',
    gordura_corporal_percent: '',
    gordura_visceral: '',
    massa_muscular_kg: '',
    agua_corporal_percent: '',
    osso_kg: '',
    metabolismo_basal_kcal: '',
    idade_metabolica: '',
    circunferencia_abdominal_cm: '',
    circunferencia_braco_cm: '',
    circunferencia_perna_cm: '',
    device_type: 'manual',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevenir salvamento duplo
    if (loading) {
      console.log('Formulário já está sendo enviado...');
      return;
    }
    
    // Validar peso obrigatório
    if (!formData.peso_kg || parseFloat(formData.peso_kg) <= 0) {
      alert('Peso é obrigatório e deve ser maior que zero!');
      return;
    }
    
    if (!physicalData) {
      alert('Você precisa cadastrar seus dados físicos primeiro!');
      return;
    }
    
    try {
      console.log('Iniciando salvamento de medição...');
      
      const measurementData = {
        peso_kg: parseFloat(formData.peso_kg),
        gordura_corporal_percent: formData.gordura_corporal_percent ? parseFloat(formData.gordura_corporal_percent) : undefined,
        gordura_visceral: formData.gordura_visceral ? parseInt(formData.gordura_visceral) : undefined,
        massa_muscular_kg: formData.massa_muscular_kg ? parseFloat(formData.massa_muscular_kg) : undefined,
        agua_corporal_percent: formData.agua_corporal_percent ? parseFloat(formData.agua_corporal_percent) : undefined,
        osso_kg: formData.osso_kg ? parseFloat(formData.osso_kg) : undefined,
        metabolismo_basal_kcal: formData.metabolismo_basal_kcal ? parseInt(formData.metabolismo_basal_kcal) : undefined,
        idade_metabolica: formData.idade_metabolica ? parseInt(formData.idade_metabolica) : undefined,
        circunferencia_abdominal_cm: formData.circunferencia_abdominal_cm ? parseFloat(formData.circunferencia_abdominal_cm) : undefined,
        circunferencia_braco_cm: formData.circunferencia_braco_cm ? parseFloat(formData.circunferencia_braco_cm) : undefined,
        circunferencia_perna_cm: formData.circunferencia_perna_cm ? parseFloat(formData.circunferencia_perna_cm) : undefined,
        device_type: formData.device_type,
        notes: formData.notes || undefined
      };

      console.log('Dados da medição preparados:', measurementData);
      await saveMeasurement(measurementData);
      
      console.log('Medição salva com sucesso, limpando formulário...');
      
      // Limpar formulário
      setFormData({
        peso_kg: '',
        gordura_corporal_percent: '',
        gordura_visceral: '',
        massa_muscular_kg: '',
        agua_corporal_percent: '',
        osso_kg: '',
        metabolismo_basal_kcal: '',
        idade_metabolica: '',
        circunferencia_abdominal_cm: '',
        circunferencia_braco_cm: '',
        circunferencia_perna_cm: '',
        device_type: 'manual',
        notes: ''
      });
    } catch (err) {
      console.error('Erro ao salvar medição:', err);
      alert(`Erro ao salvar medição: ${err instanceof Error ? err.message : 'Erro desconhecido'}`);
    }
  };

  if (!physicalData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">
            <Scale className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Dados Físicos Necessários</h3>
            <p className="text-muted-foreground">
              Para registrar suas pesagens, você precisa primeiro cadastrar seus dados físicos (altura, idade, sexo).
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Scale className="h-5 w-5" />
          Nova Pesagem
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Peso obrigatório */}
          <div className="space-y-2">
            <Label htmlFor="peso" className="flex items-center gap-2 text-primary">
              <Scale className="h-4 w-4" />
              Peso (kg) *
            </Label>
            <Input
              id="peso"
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={formData.peso_kg}
              onChange={(e) => setFormData({...formData, peso_kg: e.target.value})}
              placeholder="72.5"
              required
              className="text-lg"
            />
          </div>

          {/* Composição corporal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gordura" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Gordura Corporal (%)
              </Label>
              <Input
                id="gordura"
                type="number"
                step="0.1"
                min="0"
                max="50"
                value={formData.gordura_corporal_percent}
                onChange={(e) => setFormData({...formData, gordura_corporal_percent: e.target.value})}
                placeholder="15.2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="visceral">Gordura Visceral</Label>
              <Input
                id="visceral"
                type="number"
                min="1"
                max="30"
                value={formData.gordura_visceral}
                onChange={(e) => setFormData({...formData, gordura_visceral: e.target.value})}
                placeholder="8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="musculo" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Massa Muscular (kg)
              </Label>
              <Input
                id="musculo"
                type="number"
                step="0.1"
                min="20"
                max="100"
                value={formData.massa_muscular_kg}
                onChange={(e) => setFormData({...formData, massa_muscular_kg: e.target.value})}
                placeholder="55.3"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="agua" className="flex items-center gap-2">
                <Droplets className="h-4 w-4" />
                Água Corporal (%)
              </Label>
              <Input
                id="agua"
                type="number"
                step="0.1"
                min="30"
                max="80"
                value={formData.agua_corporal_percent}
                onChange={(e) => setFormData({...formData, agua_corporal_percent: e.target.value})}
                placeholder="58.7"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="osso" className="flex items-center gap-2">
                <Bone className="h-4 w-4" />
                Massa Óssea (kg)
              </Label>
              <Input
                id="osso"
                type="number"
                step="0.1"
                min="1"
                max="10"
                value={formData.osso_kg}
                onChange={(e) => setFormData({...formData, osso_kg: e.target.value})}
                placeholder="2.8"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="metabolismo" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Metabolismo Basal (kcal)
              </Label>
              <Input
                id="metabolismo"
                type="number"
                min="800"
                max="3000"
                value={formData.metabolismo_basal_kcal}
                onChange={(e) => setFormData({...formData, metabolismo_basal_kcal: e.target.value})}
                placeholder="1650"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="idade_meta" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Idade Metabólica
              </Label>
              <Input
                id="idade_meta"
                type="number"
                min="18"
                max="80"
                value={formData.idade_metabolica}
                onChange={(e) => setFormData({...formData, idade_metabolica: e.target.value})}
                placeholder="28"
              />
            </div>
          </div>

          {/* Circunferências */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="abdomen">Circunferência Abdominal (cm)</Label>
              <Input
                id="abdomen"
                type="number"
                step="0.1"
                min="50"
                max="150"
                value={formData.circunferencia_abdominal_cm}
                onChange={(e) => setFormData({...formData, circunferencia_abdominal_cm: e.target.value})}
                placeholder="85.5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="braco">Circunferência Braço (cm)</Label>
              <Input
                id="braco"
                type="number"
                step="0.1"
                min="20"
                max="50"
                value={formData.circunferencia_braco_cm}
                onChange={(e) => setFormData({...formData, circunferencia_braco_cm: e.target.value})}
                placeholder="32.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="perna">Circunferência Perna (cm)</Label>
              <Input
                id="perna"
                type="number"
                step="0.1"
                min="30"
                max="80"
                value={formData.circunferencia_perna_cm}
                onChange={(e) => setFormData({...formData, circunferencia_perna_cm: e.target.value})}
                placeholder="45.2"
              />
            </div>
          </div>

          {/* Dispositivo e observações */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="device" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Dispositivo Usado
              </Label>
              <Select 
                value={formData.device_type} 
                onValueChange={(value) => setFormData({...formData, device_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="xiaomi_mi_body_scale_2">Xiaomi Mi Body Scale 2</SelectItem>
                  <SelectItem value="bluetooth_scale">Balança Bluetooth</SelectItem>
                  <SelectItem value="digital_scale">Balança Digital</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={3}
                placeholder="Ex: Pesagem em jejum, após exercício, etc."
              />
            </div>
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando Pesagem...' : 'Salvar Pesagem'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default WeightMeasurementForm;