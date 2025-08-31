import React, { useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';

export interface IntakeAnswers {
  objetivo: string;
  alergias: string;
  restricoesReligiosas: string;
  preferencias: string;
  naoGosta: string;
  rotinaHorarios: string;
  orcamento: 'baixo' | 'médio' | 'alto';
  tempoPreparoMin: number;
  utensilios: string;
}

interface SofiaIntakeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (answers: IntakeAnswers) => void;
}

export const SofiaIntakeDialog: React.FC<SofiaIntakeDialogProps> = ({ open, onOpenChange, onConfirm }) => {
  const [step, setStep] = useState(0);
  const [legal, setLegal] = useState(false);
  const [answers, setAnswers] = useState<IntakeAnswers>({
    objetivo: '',
    alergias: '',
    restricoesReligiosas: '',
    preferencias: '',
    naoGosta: '',
    rotinaHorarios: '',
    orcamento: 'médio',
    tempoPreparoMin: 30,
    utensilios: ''
  });

  const steps = useMemo(() => [
    {
      title: 'Qual seu principal objetivo?',
      content: (
        <Textarea value={answers.objetivo} onChange={(e) => setAnswers(a => ({ ...a, objetivo: e.target.value }))} placeholder="Ex.: emagrecer 3kg, melhorar disposição" />
      )
    },
    {
      title: 'Alergias ou intolerâncias?',
      content: (
        <Textarea value={answers.alergias} onChange={(e) => setAnswers(a => ({ ...a, alergias: e.target.value }))} placeholder="Ex.: lactose, glúten, castanhas" />
      )
    },
    {
      title: 'Restrições religiosas?',
      content: (
        <Textarea value={answers.restricoesReligiosas} onChange={(e) => setAnswers(a => ({ ...a, restricoesReligiosas: e.target.value }))} placeholder="Ex.: halal, kosher, sem carne às sextas" />
      )
    },
    {
      title: 'Preferências (o que gosta de comer)?',
      content: (
        <Textarea value={answers.preferencias} onChange={(e) => setAnswers(a => ({ ...a, preferencias: e.target.value }))} placeholder="Ex.: frango, arroz integral, frutas cítricas" />
      )
    },
    {
      title: 'O que não gosta?',
      content: (
        <Textarea value={answers.naoGosta} onChange={(e) => setAnswers(a => ({ ...a, naoGosta: e.target.value }))} placeholder="Ex.: coentro, pimentão" />
      )
    },
    {
      title: 'Rotina/horários das refeições?',
      content: (
        <Textarea value={answers.rotinaHorarios} onChange={(e) => setAnswers(a => ({ ...a, rotinaHorarios: e.target.value }))} placeholder="Ex.: café 7h, almoço 12h, lanche 16h, jantar 20h" />
      )
    },
    {
      title: 'Orçamento e tempo de preparo',
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <Label>Orçamento</Label>
            <div className="flex gap-2 mt-1">
              {(['baixo','médio','alto'] as const).map(level => (
                <Button key={level} variant={answers.orcamento === level ? 'default' : 'outline'} size="sm" onClick={() => setAnswers(a => ({ ...a, orcamento: level }))} className="capitalize">{level}</Button>
              ))}
            </div>
          </div>
          <div>
            <Label>Tempo máx. (min)</Label>
            <Input type="number" min={5} max={240} value={answers.tempoPreparoMin} onChange={(e) => setAnswers(a => ({ ...a, tempoPreparoMin: Number(e.target.value || 0) }))} />
          </div>
        </div>
      )
    },
    {
      title: 'Utensílios disponíveis',
      content: (
        <Input value={answers.utensilios} onChange={(e) => setAnswers(a => ({ ...a, utensilios: e.target.value }))} placeholder="Ex.: airfryer, micro-ondas, panela de pressão" />
      )
    },
    {
      title: 'Resumo e Aviso Legal',
      content: (
        <div className="space-y-2 text-sm">
          <div><strong>Objetivo:</strong> {answers.objetivo || '—'}</div>
          <div><strong>Alergias:</strong> {answers.alergias || '—'}</div>
          <div><strong>Restrições religiosas:</strong> {answers.restricoesReligiosas || '—'}</div>
          <div><strong>Preferências:</strong> {answers.preferencias || '—'}</div>
          <div><strong>Não gosta:</strong> {answers.naoGosta || '—'}</div>
          <div><strong>Horários:</strong> {answers.rotinaHorarios || '—'}</div>
          <div><strong>Orçamento:</strong> {answers.orcamento}</div>
          <div><strong>Tempo máx.:</strong> {answers.tempoPreparoMin} min</div>
          <div><strong>Utensílios:</strong> {answers.utensilios || '—'}</div>
          <div className="flex items-start gap-2 bg-muted/40 p-2 rounded mt-2">
            <Checkbox id="legal" checked={legal} onCheckedChange={(v) => setLegal(Boolean(v))} />
            <Label htmlFor="legal" className="text-xs leading-relaxed">
              Este material constitui SUGESTÃO DE CARDÁPIO gerada por IA para fins informativos. Não substitui avaliação profissional. Valores nutricionais são estimativas e podem variar.
            </Label>
          </div>
        </div>
      )
    }
  ], [answers, legal]);

  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Vamos personalizar seu cardápio</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="text-sm text-muted-foreground">Passo {step + 1} de {steps.length}</div>
          <div className="space-y-2">
            <div className="font-medium">{steps[step].title}</div>
            {steps[step].content}
          </div>
          <div className="flex justify-between pt-2">
            <Button variant="outline" disabled={step === 0} onClick={() => setStep(s => Math.max(0, s - 1))}>Voltar</Button>
            {isLast ? (
              <Button disabled={!legal} onClick={() => onConfirm(answers)}>Confirmar</Button>
            ) : (
              <Button onClick={() => setStep(s => Math.min(steps.length - 1, s + 1))}>Próximo</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SofiaIntakeDialog;










