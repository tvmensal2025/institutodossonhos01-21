import React, { useState, useEffect } from 'react';
import { Upload, X, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ExamUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExamUsage {
  count: number;
  remaining: number;
}

export const ExamUploadModal: React.FC<ExamUploadModalProps> = ({ isOpen, onClose }) => {
  const [examUsage, setExamUsage] = useState<ExamUsage>({ count: 0, remaining: 1 });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      checkExamUsage();
    }
  }, [isOpen]);

  const checkExamUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      
      // Medical exam analyses table doesn't exist yet - return mock data
      const data: any[] = [];
      const error = null;

      if (error) {
        console.error('Erro ao verificar uso:', error);
        return;
      }

      const count = data?.length || 0;
      setExamUsage({ count, remaining: Math.max(0, 1 - count) });
    } catch (error) {
      console.error('Erro ao verificar uso de exames:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Verificar tipo de arquivo
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Arquivo não suportado",
          description: "Envie apenas imagens (JPG, PNG) ou PDF.",
          variant: "destructive"
        });
        return;
      }

      // Verificar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Arquivo muito grande",
          description: "O arquivo deve ter no máximo 10MB.",
          variant: "destructive"
        });
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    // Verificar se tem exames restantes
    if (examUsage.remaining === 0) {
      setShowPayment(true);
      return;
    }

    setIsUploading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Erro de autenticação",
          description: "Você precisa estar logado.",
          variant: "destructive"
        });
        return;
      }

      // Upload temporário para bucket correto
      const fileExtension = selectedFile.name.split('.').pop();
      const tmpPath = `tmp/${user.id}/${crypto.randomUUID()}.${fileExtension}`;
      
      const { error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(tmpPath, selectedFile);

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error('Falha ao enviar arquivo: ' + uploadError.message);
      }

      // Finalizar e disparar análise via edge function
      const { data: result, error: finalizeError } = await supabase.functions.invoke('finalize-medical-document', {
        body: {
          tmpPaths: [tmpPath],
          title: 'Exame Médico',
          examType: 'exame_laboratorial',
          idempotencyKey: crypto.randomUUID()
        }
      });

      if (finalizeError) {
        console.error('Erro na finalização:', finalizeError);
        throw new Error('Falha ao processar exame: ' + finalizeError.message);
      }

      toast({
        title: "✅ Exame enviado!",
        description: "Seu exame será analisado pelo GPT-4. Você receberá o relatório em breve.",
        variant: "default"
      });

      setSelectedFile(null);
      checkExamUsage();
      onClose();

    } catch (error: any) {
      console.error('Erro completo no upload:', error);
      toast({
        title: "❌ Erro no envio",
        description: error.message || "Não foi possível enviar o exame. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handlePayment = () => {
    toast({
      title: "Sistema de pagamento",
      description: "Em breve você poderá pagar R$ 30 por exames extras.",
      variant: "default"
    });
    setShowPayment(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enviar Exame
          </DialogTitle>
          <DialogDescription>
            Envie seus exames médicos para análise com IA. Você tem 1 exame gratuito por mês.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status de uso */}
          <div className="bg-muted p-3 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span>Exames este mês:</span>
              <span className={examUsage.remaining > 0 ? 'text-green-600' : 'text-red-600'}>
                {examUsage.count}/1 usado
              </span>
            </div>
            {examUsage.remaining === 0 && (
              <div className="flex items-center gap-2 mt-2 text-sm text-red-600">
                <AlertTriangle className="h-4 w-4" />
                <span>Limite mensal atingido</span>
              </div>
            )}
          </div>

          {!showPayment ? (
            <>
              {/* Upload área */}
              <div className="border-2 border-dashed border-muted rounded-lg p-6 text-center">
                {selectedFile ? (
                  <div className="space-y-2">
                    <Check className="h-8 w-8 text-green-600 mx-auto" />
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                    <p className="text-sm text-muted-foreground">
                      Clique para selecionar um arquivo
                    </p>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG ou PDF (máx. 10MB)
                    </p>
                  </div>
                )}
                
                <Label htmlFor="file-upload" className="cursor-pointer">
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="sr-only"
                  />
                </Label>
              </div>

              {/* Botões */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpload} 
                  disabled={!selectedFile || isUploading || examUsage.remaining === 0}
                  className="flex-1"
                >
                  {isUploading ? 'Enviando...' : 'Enviar Exame'}
                </Button>
              </div>

              {examUsage.remaining === 0 && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Precisa enviar mais exames?
                  </p>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setShowPayment(true)}
                  >
                    Pagar R$ 30 por exame extra
                  </Button>
                </div>
              )}
            </>
          ) : (
            /* Tela de pagamento */
            <div className="text-center space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-yellow-800">Exame Extra</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  R$ 30,00 por cada exame adicional no mês
                </p>
              </div>
              
              <p className="text-sm text-muted-foreground">
                Você já utilizou seu exame gratuito mensal. Para enviar exames adicionais, é necessário pagar uma taxa de R$ 30,00 por exame.
              </p>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowPayment(false)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handlePayment} className="flex-1">
                  Pagar R$ 30
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};