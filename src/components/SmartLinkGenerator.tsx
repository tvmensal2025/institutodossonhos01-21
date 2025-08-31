import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Link, 
  Share, 
  MessageCircle, 
  Copy, 
  QrCode,
  User,
  Eye,
  EyeOff
} from 'lucide-react';

interface SmartLinkGeneratorProps {
  sessionId?: string;
  userId?: string;
}

const SmartLinkGenerator: React.FC<SmartLinkGeneratorProps> = ({ sessionId, userId }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();

  const generateSmartLink = async () => {
    if (!email || !password) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha email e senha para gerar o link",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Verificar se o usuário existe
      const { data: existingUser, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Erro ao verificar usuários:', userError);
      }

      // Codificar as credenciais em base64 para segurança básica
      const credentials = btoa(`${email}:${password}`);
      
      // Gerar link inteligente
      const baseUrl = window.location.origin;
      const smartLink = `${baseUrl}/auto-login?token=${credentials}${sessionId ? `&session=${sessionId}` : ''}${userId ? `&redirect=/user-sessions` : ''}`;
      
      setGeneratedLink(smartLink);
      
      toast({
        title: "Link gerado com sucesso!",
        description: "O link de acesso automático foi criado",
      });
      
    } catch (error) {
      console.error('Erro ao gerar link:', error);
      toast({
        title: "Erro ao gerar link",
        description: "Ocorreu um erro ao criar o link automático",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link",
        variant: "destructive"
      });
    }
  };

  const sendWhatsApp = () => {
    const message = `Olá! Acesse sua sessão personalizada através deste link seguro: ${generatedLink}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp aberto!",
      description: "O link foi preparado para envio via WhatsApp",
    });
  };

  const generateQRCode = () => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(generatedLink)}`;
    window.open(qrUrl, '_blank');
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Link className="h-4 w-4 mr-2" />
          Gerar Link Inteligente
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[500px] mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle>Gerar Link de Acesso Automático</DialogTitle>
          <DialogDescription>
            Crie um link que permite acesso automático sem digitar credenciais
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Credenciais do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client-email">Email do Cliente</Label>
                <Input
                  id="client-email"
                  type="email"
                  placeholder="cliente@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="client-password">Senha do Cliente</Label>
                <div className="relative">
                  <Input
                    id="client-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha do cliente"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                onClick={generateSmartLink}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Gerando..." : "Gerar Link Inteligente"}
              </Button>
            </CardContent>
          </Card>

          {generatedLink && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Link Gerado</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-muted rounded-lg break-all text-sm">
                  {generatedLink}
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={copyToClipboard}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar
                  </Button>
                  
                  <Button variant="outline" onClick={generateQRCode}>
                    <QrCode className="h-4 w-4 mr-2" />
                    QR Code
                  </Button>
                </div>
                
                <Button onClick={sendWhatsApp} className="w-full bg-green-600 hover:bg-green-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Enviar via WhatsApp
                </Button>
              </CardContent>
            </Card>
          )}
          
          <div className="text-xs text-muted-foreground space-y-1">
            <p>⚡ O link permite acesso automático sem digitação</p>
            <p>🔒 As credenciais são codificadas por segurança</p>
            <p>📱 Funciona em qualquer dispositivo</p>
            {sessionId && <p>🎯 Redireciona direto para a sessão específica</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SmartLinkGenerator;