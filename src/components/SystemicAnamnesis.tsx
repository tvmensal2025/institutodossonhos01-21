import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface AnamnesisData {
  // Dados Pessoais
  profession: string;
  marital_status: string;
  how_found_method: string;

  // Histórico Familiar (boolean)
  family_obesity_history: boolean | null;
  family_diabetes_history: boolean | null;
  family_heart_disease_history: boolean | null;
  family_eating_disorders_history: boolean | null;
  family_depression_anxiety_history: boolean | null;
  family_thyroid_problems_history: boolean | null;
  family_other_chronic_diseases: string;

  // Histórico de Peso
  weight_gain_started_age: number | null;
  lowest_adult_weight: number | null;
  highest_adult_weight: number | null;
  major_weight_gain_periods: string;
  emotional_events_during_weight_gain: string;
  weight_fluctuation_classification: string;

  // Tratamentos Anteriores
  previous_weight_treatments: string[];
  most_effective_treatment: string;
  least_effective_treatment: string;
  had_rebound_effect: boolean | null;

  // Medicações Atuais
  current_medications: string[];
  chronic_diseases: string[];
  supplements: string[];
  herbal_medicines: string[];

  // Relacionamento com Comida
  food_relationship_score: number | null;
  has_compulsive_eating: boolean | null;
  compulsive_eating_situations: string;
  problematic_foods: string[];
  forbidden_foods: string[];
  feels_guilt_after_eating: boolean | null;
  eats_in_secret: boolean | null;
  eats_until_uncomfortable: boolean | null;

  // Qualidade de Vida
  sleep_hours_per_night: number | null;
  sleep_quality_score: number | null;
  daily_stress_level: number | null;
  physical_activity_type: string;
  physical_activity_frequency: string;
  daily_energy_level: number | null;
  general_quality_of_life: number | null;

  // Objetivos e Expectativas
  main_treatment_goals: string;
  ideal_weight_goal: number | null;
  timeframe_to_achieve_goal: string;
  biggest_weight_loss_challenge: string;
  treatment_success_definition: string;
  motivation_for_seeking_treatment: string;
}

const SystemicAnamnesis = () => {
  const [formData, setFormData] = useState<Partial<AnamnesisData>>({});
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);
  const [isDraft, setIsDraft] = useState(true);
  const [hasExistingAnamnesis, setHasExistingAnamnesis] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchExistingAnamnesis();
  }, []);

  const fetchExistingAnamnesis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: anamnesis } = await supabase
        .from('user_anamnesis')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (anamnesis) {
        setHasExistingAnamnesis(true);
        // Convert JSONB arrays to proper arrays
        const processedData = {
          ...anamnesis,
          previous_weight_treatments: Array.isArray(anamnesis.previous_weight_treatments) ? anamnesis.previous_weight_treatments.map(item => String(item)) : [],
          current_medications: Array.isArray(anamnesis.current_medications) ? anamnesis.current_medications.map(item => String(item)) : [],
          chronic_diseases: Array.isArray(anamnesis.chronic_diseases) ? anamnesis.chronic_diseases.map(item => String(item)) : [],
          supplements: Array.isArray(anamnesis.supplements) ? anamnesis.supplements.map(item => String(item)) : [],
          herbal_medicines: Array.isArray(anamnesis.herbal_medicines) ? anamnesis.herbal_medicines.map(item => String(item)) : [],
          problematic_foods: Array.isArray(anamnesis.problematic_foods) ? anamnesis.problematic_foods.map(item => String(item)) : [],
          forbidden_foods: Array.isArray(anamnesis.forbidden_foods) ? anamnesis.forbidden_foods.map(item => String(item)) : [],
        };
        setFormData(processedData);
        setIsDraft(false); // Anamnese já foi salva anteriormente
      } else {
        setIsDraft(true); // Nova anamnese em rascunho
      }
    } catch (error) {
      console.error('Error fetching anamnesis:', error);
      setIsDraft(true);
    }
  };

  const handleInputChange = (field: keyof AnamnesisData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof AnamnesisData, value: string, checked: boolean) => {
    setFormData(prev => {
      const currentArray = (prev[field] as string[]) || [];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value]
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter(item => item !== value)
        };
      }
    });
  };

  const handleSliderChange = (field: keyof AnamnesisData, value: number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value[0]
    }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('💾 Salvando anamnese completa para o usuário:', user.id);
      console.log('📊 Dados da anamnese:', formData);

      const { error } = await supabase
        .from('user_anamnesis')
        .upsert({
          user_id: user.id,
          ...formData,
          completed_at: new Date().toISOString(), // Marcar como completa
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      console.log('✅ Anamnese salva com sucesso!');
      console.log('🤖 Sofia e Dr. Vital agora têm acesso às suas informações personalizadas');
      
      setIsDraft(false);
      setHasExistingAnamnesis(true);
      
      toast.success('🎉 Anamnese finalizada com sucesso!\n\n✨ Sofia e Dr. Vital agora podem oferecer recomendações mais personalizadas baseadas no seu perfil!', {
        duration: 5000,
      });
      
      // Pequeno delay para mostrar a mensagem antes de redirecionar
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error: any) {
      console.error('❌ Erro ao salvar anamnese:', error);
      toast.error(`Erro ao salvar anamnese: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: "Dados Pessoais",
      description: "Informações básicas sobre você",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="profession">Qual é sua profissão?</Label>
            <Input
              id="profession"
              value={formData.profession || ''}
              onChange={(e) => handleInputChange('profession', e.target.value)}
              placeholder="Ex: Advogado, Professor, etc."
            />
          </div>
          <div>
            <Label htmlFor="marital_status">Estado Civil</Label>
            <Select value={formData.marital_status || ''} onValueChange={(value) => handleInputChange('marital_status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione seu estado civil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                <SelectItem value="casado">Casado(a)</SelectItem>
                <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                <SelectItem value="uniao_estavel">União Estável</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="how_found_method">Como conheceu o Instituto dos Sonhos?</Label>
            <Select value={formData.how_found_method || ''} onValueChange={(value) => handleInputChange('how_found_method', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione como nos conheceu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="facebook">Facebook</SelectItem>
                <SelectItem value="google">Google</SelectItem>
                <SelectItem value="indicacao">Indicação de amigo/familiar</SelectItem>
                <SelectItem value="youtube">YouTube</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Histórico Familiar",
      description: "Histórico de saúde da sua família",
      fields: (
        <div className="space-y-6">
          <div className="space-y-4">
            <Label className="text-base font-medium">Alguém da sua família tem ou teve:</Label>
            
            {[
              { key: 'family_obesity_history', label: 'Obesidade' },
              { key: 'family_diabetes_history', label: 'Diabetes' },
              { key: 'family_heart_disease_history', label: 'Doenças cardíacas' },
              { key: 'family_eating_disorders_history', label: 'Distúrbios alimentares' },
              { key: 'family_depression_anxiety_history', label: 'Depressão ou Ansiedade' },
              { key: 'family_thyroid_problems_history', label: 'Problemas de tireoide' }
            ].map(({ key, label }) => (
              <div key={key} className="space-y-2">
                <Label className="text-sm font-medium">{label}</Label>
                <RadioGroup 
                  value={formData[key as keyof AnamnesisData]?.toString() || ''} 
                  onValueChange={(value) => handleInputChange(key as keyof AnamnesisData, value === 'true')}
                  className="flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id={`${key}-sim`} />
                    <Label htmlFor={`${key}-sim`}>Sim</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id={`${key}-nao`} />
                    <Label htmlFor={`${key}-nao`}>Não</Label>
                  </div>
                </RadioGroup>
              </div>
            ))}
          </div>
          
          <div>
            <Label htmlFor="family_other_chronic_diseases">Outras doenças crônicas na família</Label>
            <Textarea
              id="family_other_chronic_diseases"
              value={formData.family_other_chronic_diseases || ''}
              onChange={(e) => handleInputChange('family_other_chronic_diseases', e.target.value)}
              placeholder="Descreva outras condições importantes..."
              rows={3}
            />
          </div>
        </div>
      )
    },
    {
      title: "Histórico de Peso",
      description: "Sua relação com o peso ao longo da vida",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="weight_gain_started_age">Com que idade começou a ganhar peso?</Label>
            <Input
              id="weight_gain_started_age"
              type="number"
              min="0"
              max="100"
              value={formData.weight_gain_started_age || ''}
              onChange={(e) => handleInputChange('weight_gain_started_age', e.target.value ? parseInt(e.target.value) : null)}
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="lowest_adult_weight">Menor peso na vida adulta (kg)</Label>
              <Input
                id="lowest_adult_weight"
                type="number"
                step="0.1"
                value={formData.lowest_adult_weight || ''}
                onChange={(e) => handleInputChange('lowest_adult_weight', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
            <div>
              <Label htmlFor="highest_adult_weight">Maior peso na vida adulta (kg)</Label>
              <Input
                id="highest_adult_weight"
                type="number"
                step="0.1"
                value={formData.highest_adult_weight || ''}
                onChange={(e) => handleInputChange('highest_adult_weight', e.target.value ? parseFloat(e.target.value) : null)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="major_weight_gain_periods">Períodos de maior ganho de peso</Label>
            <Textarea
              id="major_weight_gain_periods"
              value={formData.major_weight_gain_periods || ''}
              onChange={(e) => handleInputChange('major_weight_gain_periods', e.target.value)}
              placeholder="Ex: Gravidez, mudança de emprego, luto, etc."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="emotional_events_during_weight_gain">Eventos emocionais durante ganho de peso</Label>
            <Textarea
              id="emotional_events_during_weight_gain"
              value={formData.emotional_events_during_weight_gain || ''}
              onChange={(e) => handleInputChange('emotional_events_during_weight_gain', e.target.value)}
              placeholder="Descreva situações emocionais importantes..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="weight_fluctuation_classification">Como classifica sua oscilação de peso?</Label>
            <Select value={formData.weight_fluctuation_classification || ''} onValueChange={(value) => handleInputChange('weight_fluctuation_classification', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="estavel">Estável (poucas variações)</SelectItem>
                <SelectItem value="moderada">Moderada (varia alguns quilos)</SelectItem>
                <SelectItem value="alta">Alta (varia muito constantemente)</SelectItem>
                <SelectItem value="ioio">Efeito "ioiô" (sobe e desce drasticamente)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Tratamentos Anteriores",
      description: "Métodos que já tentou para perder peso",
      fields: (
        <div className="space-y-4">
          <div>
            <Label>Quais tratamentos para perda de peso já tentou? (pode marcar mais de um)</Label>
            <div className="grid md:grid-cols-2 gap-2 mt-2">
              {[
                'Dieta da moda', 'Nutricionista', 'Endocrinologista', 'Academia',
                'Personal trainer', 'Medicamentos', 'Cirurgia bariátrica', 'Acupuntura',
                'Psicólogo', 'Jejum intermitente', 'Dieta low-carb', 'Nenhum'
              ].map((treatment) => (
                <div key={treatment} className="flex items-center space-x-2">
                  <Checkbox
                    id={`treatment-${treatment}`}
                    checked={formData.previous_weight_treatments?.includes(treatment) || false}
                    onCheckedChange={(checked) => 
                      handleArrayChange('previous_weight_treatments', treatment, checked as boolean)
                    }
                  />
                  <Label htmlFor={`treatment-${treatment}`} className="text-sm">
                    {treatment}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="most_effective_treatment">Qual foi o tratamento mais eficaz?</Label>
            <Input
              id="most_effective_treatment"
              value={formData.most_effective_treatment || ''}
              onChange={(e) => handleInputChange('most_effective_treatment', e.target.value)}
              placeholder="Descreva o que funcionou melhor..."
            />
          </div>
          <div>
            <Label htmlFor="least_effective_treatment">Qual foi o menos eficaz?</Label>
            <Input
              id="least_effective_treatment"
              value={formData.least_effective_treatment || ''}
              onChange={(e) => handleInputChange('least_effective_treatment', e.target.value)}
              placeholder="Descreva o que não funcionou..."
            />
          </div>
          <div>
            <Label>Teve efeito rebote (recuperou o peso perdido)?</Label>
            <RadioGroup 
              value={formData.had_rebound_effect?.toString() || ''} 
              onValueChange={(value) => handleInputChange('had_rebound_effect', value === 'true')}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="rebound-sim" />
                <Label htmlFor="rebound-sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="rebound-nao" />
                <Label htmlFor="rebound-nao">Não</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      )
    },
    {
      title: "Medicações Atuais",
      description: "Medicamentos e suplementos que usa atualmente",
      fields: (
        <div className="space-y-6">
          {[
            { key: 'current_medications', label: 'Medicamentos atuais', placeholder: 'Ex: Losartana, Metformina...' },
            { key: 'chronic_diseases', label: 'Doenças crônicas', placeholder: 'Ex: Diabetes, Hipertensão...' },
            { key: 'supplements', label: 'Suplementos', placeholder: 'Ex: Whey protein, Vitamina D...' },
            { key: 'herbal_medicines', label: 'Medicamentos fitoterápicos', placeholder: 'Ex: Chá verde, Cáscara sagrada...' }
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <Label>{label}</Label>
              <div className="mt-2">
                <Input
                  placeholder={placeholder}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        handleArrayChange(key as keyof AnamnesisData, value, true);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData[key as keyof AnamnesisData] as string[] || []).map((item, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleArrayChange(key as keyof AnamnesisData, item, false)}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">Digite e pressione Enter para adicionar</p>
              </div>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Relacionamento com Comida",
      description: "Como você se relaciona com a alimentação",
      fields: (
        <div className="space-y-6">
          <div>
            <Label>Como avalia seu relacionamento com a comida? (1 = Péssimo, 10 = Excelente)</Label>
            <div className="mt-4">
              <Slider
                value={[formData.food_relationship_score || 5]}
                onValueChange={(value) => handleSliderChange('food_relationship_score', value)}
                max={10}
                min={1}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1 (Péssimo)</span>
                <span className="font-medium">Atual: {formData.food_relationship_score || 5}</span>
                <span>10 (Excelente)</span>
              </div>
            </div>
          </div>

          <div>
            <Label>Tem episódios de compulsão alimentar?</Label>
            <RadioGroup 
              value={formData.has_compulsive_eating?.toString() || ''} 
              onValueChange={(value) => handleInputChange('has_compulsive_eating', value === 'true')}
              className="flex gap-4 mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="compulsive-sim" />
                <Label htmlFor="compulsive-sim">Sim</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="compulsive-nao" />
                <Label htmlFor="compulsive-nao">Não</Label>
              </div>
            </RadioGroup>
          </div>

          {formData.has_compulsive_eating && (
            <div>
              <Label htmlFor="compulsive_eating_situations">Em quais situações ocorre a compulsão?</Label>
              <Textarea
                id="compulsive_eating_situations"
                value={formData.compulsive_eating_situations || ''}
                onChange={(e) => handleInputChange('compulsive_eating_situations', e.target.value)}
                placeholder="Ex: Quando estou estressada, triste, ansiosa..."
                rows={3}
              />
            </div>
          )}

          {[
            { key: 'problematic_foods', label: 'Alimentos problemáticos (que come em excesso)' },
            { key: 'forbidden_foods', label: 'Alimentos que considera "proibidos"' }
          ].map(({ key, label }) => (
            <div key={key}>
              <Label>{label}</Label>
              <div className="mt-2">
                <Input
                  placeholder="Digite um alimento e pressione Enter"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const value = (e.target as HTMLInputElement).value.trim();
                      if (value) {
                        handleArrayChange(key as keyof AnamnesisData, value, true);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {(formData[key as keyof AnamnesisData] as string[] || []).map((item, index) => (
                    <span
                      key={index}
                      className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                    >
                      {item}
                      <button
                        type="button"
                        onClick={() => handleArrayChange(key as keyof AnamnesisData, item, false)}
                        className="ml-1 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {[
            { key: 'feels_guilt_after_eating', label: 'Sente culpa após comer?' },
            { key: 'eats_in_secret', label: 'Come escondido?' },
            { key: 'eats_until_uncomfortable', label: 'Come até se sentir desconfortável?' }
          ].map(({ key, label }) => (
            <div key={key}>
              <Label>{label}</Label>
              <RadioGroup 
                value={formData[key as keyof AnamnesisData]?.toString() || ''} 
                onValueChange={(value) => handleInputChange(key as keyof AnamnesisData, value === 'true')}
                className="flex gap-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="true" id={`${key}-sim`} />
                  <Label htmlFor={`${key}-sim`}>Sim</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="false" id={`${key}-nao`} />
                  <Label htmlFor={`${key}-nao`}>Não</Label>
                </div>
              </RadioGroup>
            </div>
          ))}
        </div>
      )
    },
    {
      title: "Qualidade de Vida",
      description: "Aspectos do seu dia a dia",
      fields: (
        <div className="space-y-6">
          <div>
            <Label htmlFor="sleep_hours_per_night">Quantas horas dorme por noite?</Label>
            <Input
              id="sleep_hours_per_night"
              type="number"
              step="0.5"
              min="0"
              max="24"
              value={formData.sleep_hours_per_night || ''}
              onChange={(e) => handleInputChange('sleep_hours_per_night', e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>

          {[
            { key: 'sleep_quality_score', label: 'Qualidade do sono' },
            { key: 'daily_stress_level', label: 'Nível de estresse diário' },
            { key: 'daily_energy_level', label: 'Nível de energia diário' },
            { key: 'general_quality_of_life', label: 'Qualidade de vida geral' }
          ].map(({ key, label }) => (
            <div key={key}>
              <Label>{label} (1 = Muito baixo, 10 = Muito alto)</Label>
              <div className="mt-4">
                <Slider
                  value={[formData[key as keyof AnamnesisData] as number || 5]}
                  onValueChange={(value) => handleSliderChange(key as keyof AnamnesisData, value)}
                  max={10}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1</span>
                  <span className="font-medium">Atual: {formData[key as keyof AnamnesisData] || 5}</span>
                  <span>10</span>
                </div>
              </div>
            </div>
          ))}

          <div>
            <Label htmlFor="physical_activity_type">Que tipo de atividade física pratica?</Label>
            <Select value={formData.physical_activity_type || ''} onValueChange={(value) => handleInputChange('physical_activity_type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Nenhuma</SelectItem>
                <SelectItem value="caminhada">Caminhada</SelectItem>
                <SelectItem value="corrida">Corrida</SelectItem>
                <SelectItem value="academia">Academia/Musculação</SelectItem>
                <SelectItem value="natacao">Natação</SelectItem>
                <SelectItem value="ciclismo">Ciclismo</SelectItem>
                <SelectItem value="danca">Dança</SelectItem>
                <SelectItem value="pilates">Pilates</SelectItem>
                <SelectItem value="yoga">Yoga</SelectItem>
                <SelectItem value="esportes">Esportes</SelectItem>
                <SelectItem value="outro">Outro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="physical_activity_frequency">Com que frequência?</Label>
            <Select value={formData.physical_activity_frequency || ''} onValueChange={(value) => handleInputChange('physical_activity_frequency', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nenhuma">Não pratico</SelectItem>
                <SelectItem value="1x_semana">1x por semana</SelectItem>
                <SelectItem value="2x_semana">2x por semana</SelectItem>
                <SelectItem value="3x_semana">3x por semana</SelectItem>
                <SelectItem value="4x_semana">4x por semana</SelectItem>
                <SelectItem value="5x_semana">5x por semana</SelectItem>
                <SelectItem value="todos_dias">Todos os dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )
    },
    {
      title: "Objetivos e Expectativas",
      description: "Seus objetivos com o tratamento",
      fields: (
        <div className="space-y-4">
          <div>
            <Label htmlFor="main_treatment_goals">Quais são seus principais objetivos com o tratamento?</Label>
            <Textarea
              id="main_treatment_goals"
              value={formData.main_treatment_goals || ''}
              onChange={(e) => handleInputChange('main_treatment_goals', e.target.value)}
              placeholder="Ex: Perder peso, melhorar saúde, aumentar autoestima..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="ideal_weight_goal">Qual seria seu peso ideal? (kg)</Label>
            <Input
              id="ideal_weight_goal"
              type="number"
              step="0.1"
              value={formData.ideal_weight_goal || ''}
              onChange={(e) => handleInputChange('ideal_weight_goal', e.target.value ? parseFloat(e.target.value) : null)}
            />
          </div>
          <div>
            <Label htmlFor="timeframe_to_achieve_goal">Em quanto tempo gostaria de atingir esse objetivo?</Label>
            <Select value={formData.timeframe_to_achieve_goal || ''} onValueChange={(value) => handleInputChange('timeframe_to_achieve_goal', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o prazo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3_meses">3 meses</SelectItem>
                <SelectItem value="6_meses">6 meses</SelectItem>
                <SelectItem value="1_ano">1 ano</SelectItem>
                <SelectItem value="2_anos">2 anos</SelectItem>
                <SelectItem value="sem_pressa">Sem pressa específica</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="biggest_weight_loss_challenge">Qual considera ser seu maior desafio para perder peso?</Label>
            <Textarea
              id="biggest_weight_loss_challenge"
              value={formData.biggest_weight_loss_challenge || ''}
              onChange={(e) => handleInputChange('biggest_weight_loss_challenge', e.target.value)}
              placeholder="Ex: Ansiedade, falta de tempo, compulsão..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="treatment_success_definition">Como definiria o sucesso do tratamento para você?</Label>
            <Textarea
              id="treatment_success_definition"
              value={formData.treatment_success_definition || ''}
              onChange={(e) => handleInputChange('treatment_success_definition', e.target.value)}
              placeholder="Ex: Atingir o peso ideal, melhorar saúde, ter mais energia..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="motivation_for_seeking_treatment">O que te motivou a buscar este tratamento agora?</Label>
            <Textarea
              id="motivation_for_seeking_treatment"
              value={formData.motivation_for_seeking_treatment || ''}
              onChange={(e) => handleInputChange('motivation_for_seeking_treatment', e.target.value)}
              placeholder="Ex: Questões de saúde, autoestima, evento importante..."
              rows={3}
            />
          </div>
        </div>
      )
    }
  ];

  const nextSection = () => {
    if (currentSection < sections.length - 1) {
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Anamnese Nutricional Completa
            </CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Complete sua avaliação personalizada para Dr. Vital e Sofia
              {hasExistingAnamnesis && (
                <div className="mt-2 text-sm">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md">
                    ✓ Anamnese já preenchida - você pode atualizar as informações
                  </span>
                </div>
              )}
              {isDraft && !hasExistingAnamnesis && (
                <div className="mt-2 text-sm">
                  <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-md">
                    📝 Rascunho - salvo apenas ao finalizar
                  </span>
                </div>
              )}
            </CardDescription>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Seção {currentSection + 1} de {sections.length}</span>
                <span>{Math.round(((currentSection + 1) / sections.length) * 100)}% concluído</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${((currentSection + 1) / sections.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="px-6 pb-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {sections[currentSection].title}
                </h3>
                <p className="text-gray-600 mb-6">
                  {sections[currentSection].description}
                </p>
                
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  {sections[currentSection].fields}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevSection}
                  disabled={currentSection === 0}
                  className="px-6"
                >
                  ← Anterior
                </Button>
                
                {currentSection === sections.length - 1 ? (
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="px-8 bg-blue-600 hover:bg-blue-700"
                  >
                    {loading ? 'Salvando...' : 'Finalizar Anamnese ✓'}
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={nextSection}
                    className="px-6 bg-blue-600 hover:bg-blue-700"
                  >
                    Próximo →
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SystemicAnamnesis;