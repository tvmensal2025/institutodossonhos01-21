import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ProfessionalEvaluation, UserProfile } from '@/hooks/useProfessionalEvaluation';
import { Calculator, Save } from 'lucide-react';

interface QuickEvaluationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile;
  calculateMetrics: (
    user: UserProfile,
    measurements: Partial<ProfessionalEvaluation>
  ) => Partial<ProfessionalEvaluation>;
  onSave: (evaluation: Omit<ProfessionalEvaluation, 'id' | 'created_at'>) => Promise<void>;
}

export const QuickEvaluationModal: React.FC<QuickEvaluationModalProps> = ({
  open,
  onOpenChange,
  user,
  calculateMetrics,
  onSave
}) => {
  const [saving, setSaving] = useState(false);
  const [weight, setWeight] = useState<number | ''>('');
  const [waist, setWaist] = useState<number | ''>('');
  const [abdominal, setAbdominal] = useState<number | ''>('');
  const [hip, setHip] = useState<number | ''>('');

  const [triceps, setTriceps] = useState<number | ''>('');
  const [suprailiac, setSuprailiac] = useState<number | ''>('');
  const [thigh, setThigh] = useState<number | ''>('');
  const [chest, setChest] = useState<number | ''>('');
  const [abdomenSkin, setAbdomenSkin] = useState<number | ''>('');

  const measurements: Partial<ProfessionalEvaluation> = useMemo(() => ({
    weight_kg: typeof weight === 'number' ? weight : 0,
    waist_circumference_cm: typeof waist === 'number' ? waist : 0,
    abdominal_circumference_cm: typeof abdominal === 'number' ? abdominal : 0,
    hip_circumference_cm: typeof hip === 'number' ? hip : 0,
    skinfold_triceps_mm: typeof triceps === 'number' ? triceps : undefined,
    skinfold_suprailiac_mm: typeof suprailiac === 'number' ? suprailiac : undefined,
    skinfold_thigh_mm: typeof thigh === 'number' ? thigh : undefined,
    skinfold_chest_mm: typeof chest === 'number' ? chest : undefined,
    skinfold_abdomen_mm: typeof abdomenSkin === 'number' ? abdomenSkin : undefined
  }), [weight, waist, abdominal, hip, triceps, suprailiac, thigh, chest, abdomenSkin]);

  const preview = useMemo(() => calculateMetrics(user, measurements), [user, measurements, calculateMetrics]);

  const canSave = !!measurements.weight_kg && !!measurements.waist_circumference_cm && !!measurements.hip_circumference_cm;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      await onSave({
        ...measurements,
        ...preview,
        user_id: user.id,
        evaluation_date: new Date().toISOString(),
        notes: 'Avaliação basal (rápida)'
      } as Omit<ProfessionalEvaluation, 'id' | 'created_at'>);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Avaliação Rápida</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input id="weight" type="number" step="0.1" value={weight}
                   onChange={(e) => setWeight(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="waist">Cintura (cm)</Label>
            <Input id="waist" type="number" value={waist}
                   onChange={(e) => setWaist(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="hip">Quadril (cm)</Label>
            <Input id="hip" type="number" value={hip}
                   onChange={(e) => setHip(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>

          <div>
            <Label htmlFor="abdominal">Abdominal (cm)</Label>
            <Input id="abdominal" type="number" value={abdominal}
                   onChange={(e) => setAbdominal(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>

          {user.gender === 'M' ? (
            <>
              <div>
                <Label htmlFor="chest">Peitoral (mm, opcional)</Label>
                <Input id="chest" type="number" step="0.1" value={chest}
                       onChange={(e) => setChest(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="abdomenSkin">Abdômen (mm, opcional)</Label>
                <Input id="abdomenSkin" type="number" step="0.1" value={abdomenSkin}
                       onChange={(e) => setAbdomenSkin(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            </>
          ) : (
            <>
              <div>
                <Label htmlFor="triceps">Tríceps (mm, opcional)</Label>
                <Input id="triceps" type="number" step="0.1" value={triceps}
                       onChange={(e) => setTriceps(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
              <div>
                <Label htmlFor="suprailiac">Supra-ilíaca (mm, opcional)</Label>
                <Input id="suprailiac" type="number" step="0.1" value={suprailiac}
                       onChange={(e) => setSuprailiac(e.target.value === '' ? '' : Number(e.target.value))} />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="thigh">Coxa (mm, opcional)</Label>
            <Input id="thigh" type="number" step="0.1" value={thigh}
                   onChange={(e) => setThigh(e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>% Gordura: <strong>{preview.body_fat_percentage?.toFixed(1) ?? '-'}</strong></div>
          <div>Massa Gorda: <strong>{preview.fat_mass_kg?.toFixed(1) ?? '-'}</strong></div>
          <div>Massa Magra: <strong>{preview.lean_mass_kg?.toFixed(1) ?? '-'}</strong></div>
          <div>IMC: <strong>{preview.bmi?.toFixed(1) ?? '-'}</strong></div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          <Button onClick={handleSave} disabled={!canSave || saving}>
            <Save className="mr-2 h-4 w-4" /> Salvar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickEvaluationModal;










