import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calculator, Info, Save } from 'lucide-react';
import { UserProfile, ProfessionalEvaluation } from '@/hooks/useProfessionalEvaluation';

type Step = 0 | 1 | 2 | 3;

export interface NewEvaluationWizardProps {
  user: UserProfile;
  calculateMetrics: (
    user: UserProfile,
    measurements: Partial<ProfessionalEvaluation>
  ) => Partial<ProfessionalEvaluation>;
  onPreview: (evaluation: ProfessionalEvaluation) => void;
  onSave: (evaluation: Omit<ProfessionalEvaluation, 'id' | 'created_at'>) => Promise<void>;
}

export const NewEvaluationWizard: React.FC<NewEvaluationWizardProps> = ({
  user,
  calculateMetrics,
  onPreview,
  onSave
}) => {
  const [step, setStep] = useState<Step>(0);
  const [saving, setSaving] = useState(false);

  const [weight, setWeight] = useState<number | ''>('');
  const [abdominal, setAbdominal] = useState<number | ''>('');
  const [waist, setWaist] = useState<number | ''>('');
  const [hip, setHip] = useState<number | ''>('');

  const [triceps, setTriceps] = useState<number | ''>('');
  const [suprailiac, setSuprailiac] = useState<number | ''>('');
  const [thigh, setThigh] = useState<number | ''>('');
  const [chest, setChest] = useState<number | ''>('');
  const [abdomenSkin, setAbdomenSkin] = useState<number | ''>('');

  const hasMinInputs = useMemo(() => {
    return weight !== '' && waist !== '' && hip !== '';
  }, [weight, waist, hip]);

  const draftEvaluation: ProfessionalEvaluation = useMemo(() => {
    const measurements: Partial<ProfessionalEvaluation> = {
      weight_kg: typeof weight === 'number' ? weight : 0,
      abdominal_circumference_cm: typeof abdominal === 'number' ? abdominal : 0,
      waist_circumference_cm: typeof waist === 'number' ? waist : 0,
      hip_circumference_cm: typeof hip === 'number' ? hip : 0,
      skinfold_triceps_mm: typeof triceps === 'number' ? triceps : undefined,
      skinfold_suprailiac_mm: typeof suprailiac === 'number' ? suprailiac : undefined,
      skinfold_thigh_mm: typeof thigh === 'number' ? thigh : undefined,
      skinfold_chest_mm: typeof chest === 'number' ? chest : undefined,
      skinfold_abdomen_mm: typeof abdomenSkin === 'number' ? abdomenSkin : undefined
    };
    const metrics = calculateMetrics(user, measurements);
    return {
      ...measurements,
      ...metrics,
      user_id: user.id,
      evaluation_date: new Date().toISOString()
    } as ProfessionalEvaluation;
  }, [user, weight, abdominal, waist, hip, triceps, suprailiac, thigh, chest, abdomenSkin, calculateMetrics]);

  useEffect(() => {
    onPreview(draftEvaluation);
  }, [draftEvaluation, onPreview]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave({
        ...draftEvaluation,
        notes: 'Avaliação basal'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0E11] p-6 text-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Iniciar Avaliação Basal</h3>
        <Badge variant="outline" className="border-white/20 text-gray-300">
          Altura {user.height_cm} cm • {user.gender === 'M' ? 'Masculino' : 'Feminino'}
        </Badge>
      </div>

      <Tabs value={String(step)} onValueChange={(v) => setStep(Number(v) as Step)}>
        <TabsList className="grid w-full grid-cols-4 bg-[#111318]">
          <TabsTrigger value="0">Peso</TabsTrigger>
          <TabsTrigger value="1">Circunferências</TabsTrigger>
          <TabsTrigger value="2">Adipometria</TabsTrigger>
          <TabsTrigger value="3">Resultados</TabsTrigger>
        </TabsList>

        <TabsContent value="0" className="mt-4">
          <Card className="bg-[#111318] border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-200">Informe o peso atual</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="weight">Peso (kg)</Label>
                <Input id="weight" type="number" step="0.1" value={weight}
                       onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </div>
              <Alert>
                <AlertDescription className="text-sm">
                  Use a balança no período da manhã para maior consistência.
                </AlertDescription>
              </Alert>
              <div className="flex justify-end">
                <Button onClick={() => setStep(1)} disabled={weight === ''}>
                  Próximo
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="1" className="mt-4">
          <Card className="bg-[#111318] border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-200">Circunferências</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="abdominal">Abdominal (cm)</Label>
                <Input id="abdominal" type="number" value={abdominal}
                       onChange={(e) => setAbdominal(e.target.value === '' ? '' : Number(e.target.value))}/>
              </div>
              <div>
                <Label htmlFor="waist">Cintura (cm)</Label>
                <Input id="waist" type="number" value={waist}
                       onChange={(e) => setWaist(e.target.value === '' ? '' : Number(e.target.value))}/>
              </div>
              <div>
                <Label htmlFor="hip">Quadril (cm)</Label>
                <Input id="hip" type="number" value={hip}
                       onChange={(e) => setHip(e.target.value === '' ? '' : Number(e.target.value))}/>
              </div>
              <div className="col-span-full flex items-center gap-2 text-xs text-gray-400">
                <Info className="h-4 w-4" />
                Medidas guiadas por fita métrica; mantenha o nível horizontal.
              </div>
              <div className="col-span-full flex justify-between">
                <Button variant="outline" onClick={() => setStep(0)}>Voltar</Button>
                <Button onClick={() => setStep(2)} disabled={!hasMinInputs}>Próximo</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="2" className="mt-4">
          <Card className="bg-[#111318] border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-200">Adipometria (opcional)</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {user.gender === 'M' ? (
                <>
                  <div>
                    <Label htmlFor="chest">Peitoral (mm)</Label>
                    <Input id="chest" type="number" step="0.1" value={chest}
                           onChange={(e) => setChest(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="abdomenSkin">Abdômen (mm)</Label>
                    <Input id="abdomenSkin" type="number" step="0.1" value={abdomenSkin}
                           onChange={(e) => setAbdomenSkin(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="triceps">Tríceps (mm)</Label>
                    <Input id="triceps" type="number" step="0.1" value={triceps}
                           onChange={(e) => setTriceps(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                  <div>
                    <Label htmlFor="suprailiac">Supra-ilíaca (mm)</Label>
                    <Input id="suprailiac" type="number" step="0.1" value={suprailiac}
                           onChange={(e) => setSuprailiac(e.target.value === '' ? '' : Number(e.target.value))} />
                  </div>
                </>
              )}
              <div>
                <Label htmlFor="thigh">Coxa (mm)</Label>
                <Input id="thigh" type="number" step="0.1" value={thigh}
                       onChange={(e) => setThigh(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div className="col-span-full flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                <Button onClick={() => setStep(3)}>
                  <Calculator className="mr-2 h-4 w-4" />Ver Resultados
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="3" className="mt-4">
          <Card className="bg-[#111318] border-white/10">
            <CardHeader>
              <CardTitle className="text-gray-200">Resultados e Salvar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-300">
              <div>Gordura: <strong>{draftEvaluation.body_fat_percentage?.toFixed(1)}%</strong></div>
              <div>Massa Gorda: <strong>{draftEvaluation.fat_mass_kg?.toFixed(1)} kg</strong></div>
              <div>Massa Magra: <strong>{draftEvaluation.lean_mass_kg?.toFixed(1)} kg</strong></div>
              <div>IMC: <strong>{draftEvaluation.bmi?.toFixed(1)}</strong></div>
              <div>Risco: <strong>{draftEvaluation.risk_level}</strong></div>
              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setStep(2)}>Voltar</Button>
                <Button onClick={handleSave} disabled={saving || !hasMinInputs}>
                  <Save className="mr-2 h-4 w-4" />Salvar Avaliação Basal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewEvaluationWizard;










