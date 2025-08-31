import React, { useState } from 'react';
import { Upload, Check, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PremiumExamUploaderProps { isOpen: boolean; onClose: () => void; }

export const PremiumExamUploader: React.FC<PremiumExamUploaderProps> = ({ isOpen, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const ok = ['image/jpeg','image/png','application/pdf','image/jpg'].includes(f.type);
    if (!ok) {
      toast({ title: 'Arquivo não suportado', description: 'Envie JPG, PNG ou PDF.', variant: 'destructive' });
      return;
    }
    if (f.size > 12 * 1024 * 1024) {
      toast({ title: 'Arquivo muito grande', description: 'Máximo 12MB.', variant: 'destructive' });
      return;
    }
    setFile(f);
  };

  const handleGenerate = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Faça login para continuar');

      // Upload temporário igual ao painel de documentos
      const ext = file.name.split('.').pop();
      const tmpPath = `tmp/${user.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('medical-documents').upload(tmpPath, file);
      if (upErr) throw upErr;

      // Finaliza e dispara análise premium
      const { error } = await supabase.functions.invoke('finalize-medical-document', {
        body: {
          tmpPaths: [tmpPath],
          title: 'Exame',
          examType: 'exame_laboratorial',
          idempotencyKey: crypto.randomUUID()
        }
      });
      if (error) throw error;

      toast({ title: 'Exame enviado', description: 'Gerando relatório premium. Você será notificado quando estiver pronto.' });
      setFile(null);
      onClose();
    } catch (e: any) {
      console.error(e);
      toast({ title: 'Erro ao gerar relatório', description: e.message || 'Tente novamente.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>📋 Relatório Médico Premium</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            {file ? (
              <div className="space-y-2">
                <Check className="h-8 w-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size/(1024*1024)).toFixed(1)} MB</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-sm text-muted-foreground">Selecione uma imagem ou PDF do seu exame</p>
                <p className="text-xs text-muted-foreground">JPG, PNG ou PDF (máx. 12MB)</p>
              </div>
            )}
            <Label htmlFor="premium-exam" className="cursor-pointer">
              <Input id="premium-exam" type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onFile} className="sr-only" />
            </Label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={loading}>Cancelar</Button>
            <Button className="flex-1" onClick={handleGenerate} disabled={!file || loading}>
              {loading ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin"/>Gerando...</>) : 'Gerar Relatório'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumExamUploader;
