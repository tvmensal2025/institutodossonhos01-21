import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileText, 
  Stethoscope, 
  Calendar,
  Activity,
  Heart,
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Download,
  Share2,
  Mail,
  Printer,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  Award,
  Target,
  Zap,
  Shield,
  FileImage,
  File,
  FileArchive
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { useExamAccess } from '@/hooks/useExamAccess';
import DidacticReportButton from './DidacticReportButton';

interface MedicalDocument {
  id: string;
  user_id: string;
  title: string;
  type: 'exame_laboratorial' | 'exame_imagem' | 'relatorio_medico' | 'prescricao' | 'historico_clinico' | 'certificado_medico';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  description?: string;
  doctor_name?: string;
  clinic_name?: string;
  exam_date?: string;
  results?: string;
  status: 'normal' | 'alterado' | 'critico' | 'pendente';
  created_at: string;
  updated_at: string;
  analysis_status?: 'processing'|'ready'|'error';
  report_path?: string | null;
  didactic_report_path?: string | null; // Novo campo para relatório didático
  report_meta?: any;
  // Progresso de processamento
  processing_started_at?: string | null;
  processing_stage?: string | null;
  progress_pct?: number | null;
  images_total?: number | null;
  images_processed?: number | null;
  estimated_minutes?: number | null;
}

interface DocumentStats {
  totalDocuments: number;
  recentUploads: number;
  criticalAlerts: number;
  upcomingExams: number;
  healthScore: number;
  documentTypes: Record<string, number>;
}

const MedicalDocumentsSection: React.FC = () => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const { toast } = useToast();
  const { 
    canAccess, 
    daysUntilNextAccess, 
    loading: accessLoading, 
    registerExamAccess, 
    getAccessMessage 
  } = useExamAccess();

  const [newDocument, setNewDocument] = useState({
    title: '',
    type: 'exame_laboratorial' as MedicalDocument['type'],
    description: '',
    doctor_name: '',
    clinic_name: '',
    exam_date: '',
    results: '',
    status: 'normal' as MedicalDocument['status']
  });
  const [pendingTmpPaths, setPendingTmpPaths] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<{name:string; size:number; tmpPath:string}[]>([]);

  useEffect(() => {
    loadDocuments();
  }, []);

  // Polling automático enquanto houver itens em processamento
  useEffect(() => {
    const hasProcessing = documents.some((d) => d.analysis_status === 'processing');
    if (!hasProcessing) return;
    
    console.log('🔄 Iniciando polling para documentos em processamento...');
    const t = setInterval(() => {
      console.log('🔄 Polling: verificando status dos documentos...');
      loadDocuments();
    }, 10000); // 10s
    
    return () => {
      console.log('🛑 Parando polling...');
      clearInterval(t);
    };
  }, [documents.length]); // Mudança: usar documents.length em vez de documents

  const loadDocuments = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log('🔄 Carregando documentos para usuário:', user.id);

      const { data, error } = await supabase
        .from('medical_documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      console.log('📄 Documentos carregados:', data?.length || 0);
      data?.forEach((doc, i) => {
        console.log(`Doc ${i+1}:`, {
          id: doc.id,
          title: doc.title,
          status: doc.analysis_status,
          stage: doc.processing_stage,
          progress: doc.progress_pct,
          images: `${doc.images_processed || 0}/${doc.images_total || 0}`
        });
      });

      const docs = (data || []) as unknown as MedicalDocument[];
      setDocuments(docs);
      calculateStats(docs);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (docs: MedicalDocument[]) => {
    const totalDocuments = docs.length;
    const recentUploads = docs.filter(d => {
      const docDate = new Date(d.created_at);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return docDate >= thirtyDaysAgo;
    }).length;

    const criticalAlerts = docs.filter(d => d.status === 'critico').length;
    const upcomingExams = docs.filter(d => d.status === 'pendente').length;

    // Calcular score de saúde baseado nos documentos
    const healthScore = Math.min(100, Math.max(0, 
      100 - (criticalAlerts * 20) + (recentUploads * 5) - (upcomingExams * 10)
    ));

    const documentTypes = docs.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      totalDocuments,
      recentUploads,
      criticalAlerts,
      upcomingExams,
      healthScore,
      documentTypes
    });
  };

  // Upload temporário (sem cobrar crédito)
  const handleFileUploadTmp = async (file: File) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Verificar se o usuário tem sessão ativa
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      // Upload do arquivo para o Supabase Storage (TMP)
      const fileExt = file.name.split('.').pop();
      const fileName = `tmp/${user.id}/${crypto.randomUUID()}.${fileExt}`;
      
      console.log('Tentando upload para:', fileName);
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('medical-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload bem-sucedido:', uploadData?.path);
      return uploadData?.path;
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar o documento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const finalizeSubmission = async (tmpPaths: string[]) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const idempotencyKey = crypto.randomUUID();

      const { data: doc, error } = await supabase.functions.invoke('finalize-medical-document', {
        body: {
          tmpPaths,
          title: newDocument.title || 'Exame',
          examType: newDocument.type,
          idempotencyKey,
          userId: user.id // Adicionar o ID do usuário explicitamente
        }
      });

      if (error) throw error;

      // Registra o acesso somente após finalizar com sucesso
      await registerExamAccess().catch(()=>{});

      toast({
        title: '✅ Exame enviado com sucesso!',
        description: 'O Dr. Vital está analisando seu exame. Você pode navegar livremente pela plataforma. O relatório ficará pronto em até 5 minutos.',
        duration: 5000
      });

      // Fecha o modal imediatamente após envio bem-sucedido
      setShowUploadModal(false);
      setNewDocument({
        title: '',
        type: 'exame_laboratorial',
        description: '',
        doctor_name: '',
        clinic_name: '',
        exam_date: '',
        results: '',
        status: 'normal'
      });
      setPendingTmpPaths([]);
      setPendingFiles([]);

      // Recarrega documentos e inicia polling em background
      loadDocuments();
      if (doc?.id) {
        pollReportReady(doc.id);
        
        // Mostra notificação quando o relatório estiver pronto
        setTimeout(() => {
          toast({
            title: '🔍 Verificando status...',
            description: 'O Dr. Vital pode ter terminado a análise. Verifique a seção de documentos.',
            duration: 3000
          });
        }, 120000); // 2 minutos
      }
      
      return doc;
    } catch (e: any) {
      console.error(e);
      toast({ 
        title: '❌ Erro ao enviar exame', 
        description: e.message || 'Tente novamente em alguns instantes', 
        variant: 'destructive' 
      });
    } finally {
      setUploading(false);
    }
  };

  const pollReportReady = (docId: string) => {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(async () => {
      attempts += 1;
      try {
        const { data, error } = await supabase
          .from('medical_documents')
          .select('id')
          .eq('id', docId)
          .maybeSingle();
        if (!error && data) {
          clearInterval(interval);
          await loadDocuments();
          toast({ title: 'Documento atualizado', description: 'Verifique seus relatórios.' });
        }
      } catch {}
      if (attempts >= maxAttempts) clearInterval(interval);
    }, 15000);
  };

  const refreshDocAndOpen = async (doc: MedicalDocument) => {
    try {
      const { data, error } = await supabase
        .from('medical_documents')
        .select('id, file_url')
        .eq('id', doc.id)
        .maybeSingle();
      if (!error && data) {
        await loadDocuments();
        return;
      }
      toast({ title: 'Aguardando processamento', description: 'Tente novamente em alguns instantes.' });
    } catch {}
  };

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'exame_laboratorial': return <Activity className="w-4 h-4" />;
      case 'exame_imagem': return <FileImage className="w-4 h-4" />;
      case 'relatorio_medico': return <FileText className="w-4 h-4" />;
      case 'prescricao': return <Stethoscope className="w-4 h-4" />;
      case 'historico_clinico': return <Brain className="w-4 h-4" />;
      case 'certificado_medico': return <Shield className="w-4 h-4" />;
      default: return <FileArchive className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-green-100 text-green-800';
      case 'alterado': return 'bg-yellow-100 text-yellow-800';
      case 'critico': return 'bg-red-100 text-red-800';
      case 'pendente': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exame_laboratorial': return 'Exame Laboratorial';
      case 'exame_imagem': return 'Exame de Imagem';
      case 'relatorio_medico': return 'Relatório Médico';
      case 'prescricao': return 'Prescrição';
      case 'historico_clinico': return 'Histórico Clínico';
      case 'certificado_medico': return 'Certificado Médico';
      default: return 'Documento';
    }
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.doctor_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || doc.type === filterType;
    
    return matchesSearch && matchesFilter;
  });

  // Abre o relatório carregando o HTML e injetando em uma nova aba.
  // Isso evita o CSP do Storage que exibe o código como texto.
  const openReportHtml = async (reportPath: string, mode: 'view' | 'print' = 'view') => {
    try {
      const { data, error } = await supabase.storage
        .from('medical-documents-reports')
        .createSignedUrl(reportPath, 3600);
      if (error || !data?.signedUrl) throw error || new Error('URL assinada indisponível');

      const res = await fetch(data.signedUrl, { cache: 'no-store' });
      const html = await res.text();

      const popup = window.open('', '_blank');
      if (!popup) throw new Error('Permita pop-ups para visualizar o relatório');

      popup.document.open();
      popup.document.write(html);
      popup.document.close();

      if (mode === 'print') {
        // Aguarda renderização e dispara impressão
        setTimeout(() => {
          try { popup.focus(); popup.print(); } catch {}
        }, 700);
      }
    } catch (err: any) {
      console.error('Erro ao abrir relatório:', err);
      toast({ title: 'Falha ao abrir relatório', description: err?.message || 'Tente novamente', variant: 'destructive' });
    }
  };

  // Dispara a análise para um documento existente (sem cobrar crédito)
  const triggerAnalyze = async (doc: MedicalDocument) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔍 Dados sendo enviados para analyze-medical-exam (trigger):', {
        documentId: doc.id,
        images: doc.report_meta?.image_paths || [],
        userId: user.id,
        examType: doc.type,
        report_meta: doc.report_meta
      });

      await supabase.functions.invoke('analyze-medical-exam', {
        body: {
          documentId: doc.id,
          images: doc.report_meta?.image_paths || [],
          userId: user.id,
          examType: doc.type
        }
      });

      toast({ title: 'Análise iniciada', description: 'Gerando o relatório. Atualize em 30–60s.' });
      setTimeout(() => loadDocuments(), 1500);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Falha ao iniciar análise', description: err?.message || 'Tente novamente', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const forceRestartAnalysis = async (doc: MedicalDocument) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      console.log('🔄 Forçando restart da análise para documento:', doc.id);

      // Reset do status no banco
      const { error: updateError } = await supabase
        .from('medical_documents')
        .update({
          analysis_status: 'pending',
          processing_stage: null,
          progress_pct: 0,
          images_processed: 0,
          processing_started_at: null
        })
        .eq('id', doc.id);

      if (updateError) {
        console.error('Erro ao resetar status:', updateError);
        throw updateError;
      }

      // Disparar nova análise
      console.log('🔍 Dados sendo enviados para analyze-medical-exam:', {
        documentId: doc.id,
        images: doc.report_meta?.image_paths || [],
        userId: user.id,
        examType: doc.type,
      });
      
      const { data, error } = await supabase.functions.invoke('analyze-medical-exam', {
        body: {
          documentId: doc.id,
          images: doc.report_meta?.image_paths || [],
          userId: user.id,
          examType: doc.type
        }
      });

      if (error) {
        console.error('❌ Erro na função analyze-medical-exam:', error);
        throw error;
      }

      console.log('✅ Resposta da análise médica:', data);

      toast({ 
        title: '🔄 Análise reiniciada', 
        description: 'O processamento foi reiniciado. Aguarde alguns minutos.',
        duration: 3000
      });
      
      setTimeout(() => loadDocuments(), 2000);
    } catch (err: any) {
      console.error(err);
      toast({ title: 'Falha ao reiniciar análise', description: err?.message || 'Tente novamente', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  // ---- Relatório Premium (GPT-5 Thinking) com VisitData ----
  type Exam = { name: string; value: number | string; unit?: string; reference?: { low?: number; high?: number; note?: string }; date?: string };
  type VisitData = {
    logoUrl: string;
    patient: { name: string; sex: 'Feminino'|'Masculino'|'Outro'; birth: string; age: number };
    visit: { date: string };
    vitals?: { weightKg?: number; heightCm?: number; bmi?: number; sbp?: number; dbp?: number; hr?: number; tempC?: number; spo2?: number };
    examsCurrent: Exam[];
    examsPrevious?: Exam[];
  };

  const toDDMMYYYY = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth()+1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  const calcAge = (birth?: string|null) => {
    if (!birth) return 0;
    const parts = birth.split(/[-/]/);
    let day:number, month:number, year:number;
    if (parts[0].length === 4) { // YYYY-MM-DD
      year = Number(parts[0]); month = Number(parts[1]) - 1; day = Number(parts[2]);
    } else { // DD/MM/YYYY
      day = Number(parts[0]); month = Number(parts[1]) - 1; year = Number(parts[2]);
    }
    const b = new Date(year, month, day);
    const diff = Date.now() - b.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return age > 0 ? age : 0;
  };

  const triggerPremiumReport = async (doc: MedicalDocument) => {
    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Buscar perfil para montar VisitData
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, gender, birth_date')
        .eq('user_id', doc.user_id)
        .single();

      const sex = (profile?.gender || '').toLowerCase().startsWith('m') ? 'Masculino'
                 : (profile?.gender || '').toLowerCase().startsWith('f') ? 'Feminino'
                 : 'Outro';
      const birth = profile?.birth_date ? String(profile.birth_date) : '';
      const age = calcAge(birth);

      // Extrair métricas do report_meta (se houver)
      const metrics = Array.isArray(doc.report_meta?.metrics) ? doc.report_meta.metrics : [];
      const mapExam = (m: any): Exam => ({
        name: m.name || '—',
        value: typeof m.value === 'number' || typeof m.value === 'string' ? m.value : String(m.value ?? '—'),
        unit: m.unit || undefined,
        reference: {
          low: typeof m.refLow === 'number' ? m.refLow : undefined,
          high: typeof m.refHigh === 'number' ? m.refHigh : undefined,
          note: m.reference || m.flag || undefined,
        },
        date: doc.exam_date || undefined,
      });

      const examsCurrent: Exam[] = metrics.map(mapExam);

      const visitData: VisitData = {
        logoUrl: 'http://45.67.221.216:8086/logoids.png',
        patient: { name: profile?.full_name || 'Paciente', sex, birth: birth || toDDMMYYYY(new Date()), age },
        visit: { date: toDDMMYYYY(new Date()) },
        examsCurrent,
      };

      const { data, error } = await supabase.functions.invoke('generate-medical-report', {
        body: { userId: doc.user_id, documentId: doc.id, visitData }
      });
      if (error) throw error;

      // Atualiza lista e abre relatório
      await loadDocuments();
      const signed = data?.signed_url;
      if (signed) window.open(signed, '_blank');
      toast({ title: 'Relatório premium gerado', description: 'Abrindo visualização.' });
    } catch (err:any) {
      console.error(err);
      toast({ title: 'Falha ao gerar relatório premium', description: err?.message || 'Tente novamente', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Stethoscope className="w-5 h-5" />
            <span>Documentos Médicos</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Total de Documentos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDocuments}</div>
              <p className="text-xs opacity-90">Documentos armazenados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Score de Saúde</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.healthScore}/100</div>
              <p className="text-xs opacity-90">
                {stats.healthScore >= 80 ? 'Excelente!' : 
                 stats.healthScore >= 60 ? 'Bom' : 'Precisa melhorar'}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4" />
                <span>Alertas Críticos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
              <p className="text-xs opacity-90">Documentos críticos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Próximos Exames</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingExams}</div>
              <p className="text-xs opacity-90">Agendados</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Seção Principal */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Stethoscope className="w-5 h-5" />
                <span>Documentos Médicos</span>
              </CardTitle>
              <CardDescription>
                Gerencie seus exames, relatórios e documentos médicos
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              {accessLoading ? (
                <Button disabled className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 animate-spin" />
                  <span>Verificando...</span>
                </Button>
              ) : canAccess ? (
                <Button
                  onClick={() => setShowUploadModal(true)}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Documento</span>
                </Button>
              ) : (
                <div className="flex flex-col items-end space-y-1">
                  <Button
                    disabled
                    className="flex items-center space-x-2 opacity-60"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Limite Mensal Atingido</span>
                  </Button>
                  <Badge variant="secondary" className="text-xs">
                    Próximo acesso em {daysUntilNextAccess} dias
                  </Badge>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Informação sobre limite mensal */}
          {!accessLoading && !canAccess && (
            <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-800">Limite Mensal Atingido</h4>
                  <p className="text-sm text-orange-700">
                    Você já utilizou seu acesso aos exames este mês. 
                    Próximo acesso disponível em {daysUntilNextAccess} dias.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="all">Todos os tipos</option>
                <option value="exame_laboratorial">Exames Laboratoriais</option>
                <option value="exame_imagem">Exames de Imagem</option>
                <option value="relatorio_medico">Relatórios Médicos</option>
                <option value="prescricao">Prescrições</option>
                <option value="historico_clinico">Histórico Clínico</option>
                <option value="certificado_medico">Certificados</option>
              </select>
            </div>
          </div>

          {/* Lista de Documentos */}
          <div className="space-y-4">
            {filteredDocuments.length > 0 ? (
              filteredDocuments.map((doc) => (
                <div key={doc.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        {getDocumentIcon(doc.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                          <Badge className={getStatusColor(doc.status)}>
                            {doc.status === 'normal' ? 'Normal' :
                             doc.status === 'alterado' ? 'Alterado' :
                             doc.status === 'critico' ? 'Crítico' : 'Pendente'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {getTypeLabel(doc.type)}
                          {doc.doctor_name && ` • Dr. ${doc.doctor_name}`}
                          {doc.clinic_name && ` • ${doc.clinic_name}`}
                        </p>
                        {doc.description && (
                          <p className="text-sm text-gray-500 mb-2">{doc.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          {doc.exam_date && (
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>{format(new Date(doc.exam_date), 'dd/MM/yyyy', { locale: ptBR })}</span>
                            </span>
                          )}
                          <span className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{format(new Date(doc.created_at), 'dd/MM/yyyy', { locale: ptBR })}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.report_path ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReportHtml(doc.report_path!, 'view')}
                            title="Ver relatório (HTML)"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openReportHtml(doc.report_path!, 'print')}
                            title="Imprimir relatório"
                          >
                            <Printer className="w-4 h-4" />
                          </Button>
                          
                          <DidacticReportButton 
                            documentId={doc.id}
                            userId={doc.user_id}
                            disabled={doc.analysis_status !== 'ready'}
                          />
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                              const { data, error } = await supabase.storage
                                .from('medical-documents-reports')
                                .createSignedUrl(doc.report_path!, 3600);
                              if (error || !data?.signedUrl) return;

                              const { data: profile } = await supabase
                                .from('profiles')
                                .select('email, full_name')
                                .eq('user_id', doc.user_id)
                                .single();

                              await supabase.functions.invoke('send-email', {
                                body: {
                                  to: profile?.email || '',
                                  subject: `Relatório de Exame — ${doc.title}`,
                                  message: 'Seu relatório de exame está pronto.',
                                  button_label: 'Abrir relatório',
                                  button_url: data.signedUrl,
                                  name: profile?.full_name || undefined,
                                  type: 'medical_report',
                                  logo_url: 'http://45.67.221.216:8086/logoids.png'
                                }
                              });

                              toast({ title: 'Relatório enviado por e-mail', description: 'Confira sua caixa de entrada.' });
                            }}
                            title="Enviar por e-mail"
                          >
                            <Mail className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <span className="absolute inset-0 rounded-full bg-purple-500 opacity-30 animate-ping"></span>
                            <img
                              src="http://45.67.221.216:8086/Dr.Vital.png"
                              alt="Dr. Vital"
                              className="relative w-8 h-8 rounded-full ring-2 ring-purple-500"
                            />
                          </div>
                          <div className="flex flex-col">
                            <div className="text-xs text-gray-600 font-medium">Dr. Vital está analisando…</div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-600">
                              <div className="w-40 bg-gray-200 h-2 rounded overflow-hidden">
                                <div className="h-2 bg-purple-600" style={{ width: `${Math.min(100, Math.max(5, Number(doc.progress_pct) || 5))}%` }} />
                              </div>
                              <span>
                                {doc.images_processed ?? 0}/{doc.images_total ?? '?'} páginas
                              </span>
                              <span>• {doc.progress_pct ? `${doc.progress_pct}%` : 'em andamento'}</span>
                              {typeof doc.estimated_minutes === 'number' && (
                                <span>• ETA ~{doc.estimated_minutes} min</span>
                              )}
                            </div>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => refreshDocAndOpen(doc)}>
                            Ver agora
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => forceRestartAnalysis(doc)}
                            className="text-orange-600 hover:text-orange-700"
                            title="Reiniciar análise se estiver travada"
                          >
                            🔄 Reiniciar
                          </Button>
                        </div>
                      )}
                      
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || filterType !== 'all' 
                    ? 'Nenhum documento encontrado com os filtros aplicados.'
                    : 'Nenhum documento médico encontrado. Adicione seu primeiro documento!'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Upload */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-auto shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Adicionar Documento Médico</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUploadModal(false)}
              >
                ×
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Título do Documento</Label>
                <Input
                  id="title"
                  value={newDocument.title}
                  onChange={(e) => setNewDocument({...newDocument, title: e.target.value})}
                  placeholder="Ex: Hemograma Completo"
                />
              </div>

              <div>
                <Label htmlFor="type">Tipo de Documento</Label>
                <select
                  id="type"
                  value={newDocument.type}
                  onChange={(e) => setNewDocument({...newDocument, type: e.target.value as MedicalDocument['type']})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="exame_laboratorial">Exame Laboratorial</option>
                  <option value="exame_imagem">Exame de Imagem</option>
                  <option value="relatorio_medico">Relatório Médico</option>
                  <option value="prescricao">Prescrição</option>
                  <option value="historico_clinico">Histórico Clínico</option>
                  <option value="certificado_medico">Certificado Médico</option>
                </select>
              </div>

              <div>
                <Label htmlFor="file">Arquivos (múltiplas imagens suportadas)</Label>
                <Input id="file" type="file" accept=".jpg,.jpeg,.png" multiple
                  onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    const accPaths: string[] = [];
                    const accFiles: {name:string; size:number; tmpPath:string}[] = [];
                    for (const f of files) {
                      const tmpPath = await handleFileUploadTmp(f);
                      if (tmpPath) {
                        accPaths.push(tmpPath);
                        accFiles.push({ name: f.name, size: f.size, tmpPath });
                      }
                    }
                    setPendingTmpPaths(accPaths);
                    setPendingFiles(accFiles);
                  }}
                />
                {pendingFiles.length > 0 && (
                  <div className="mt-2 space-y-1 text-sm text-gray-600">
                    {pendingFiles.map(f => (
                      <div key={f.tmpPath} className="flex items-center justify-between">
                        <span className="truncate max-w-[70%]">{f.name}</span>
                        <span className="opacity-70">{Math.round(f.size/1024)} KB</span>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">Os créditos só serão cobrados quando você clicar em "Enviar".</p>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Input
                  id="description"
                  value={newDocument.description}
                  onChange={(e) => setNewDocument({...newDocument, description: e.target.value})}
                  placeholder="Detalhes do documento..."
                />
              </div>

              {/* Campos avançados removidos para simplificar: serão preenchidos pela IA */}

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button disabled={uploading || pendingTmpPaths.length === 0} className="flex-1"
                  onClick={() => finalizeSubmission(pendingTmpPaths)}
                >
                  {uploading ? 'Processando...' : 'Enviar e gerar relatório (1 crédito)'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalDocumentsSection; 