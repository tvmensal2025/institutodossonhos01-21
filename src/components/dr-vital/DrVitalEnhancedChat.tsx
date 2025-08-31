import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Stethoscope, Send, Loader2, Activity, User, Target, Brain, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DataAvailable {
  profile: boolean;
  physicalData: boolean;
  weightHistory: number;
  anamnesis: boolean;
  goals: number;
  nutrition: number;
  dailyResponses: number;
  missions: number;
  achievements: number;
}

interface DataCompleteness {
  completionPercentage: number;
  missingData: string[];
  canReceiveAnalysis: boolean;
}

interface DrVitalResponse {
  response: string;
  dataCompleteness: DataCompleteness;
  dataAvailable: DataAvailable;
}

export const DrVitalEnhancedChat: React.FC = () => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<DrVitalResponse | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      if (!user) return;

      // Carregar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      setUserProfile(profile);
      
      // Extrair e formatar nome do usuário
      if (profile) {
        // Tentar diferentes campos que podem conter o nome do usuário
        let displayName = '';
        
        if (profile.full_name) {
          displayName = profile.full_name;
        } else if ((profile as any).name) {
          displayName = (profile as any).name;
        } else if ((profile as any).first_name) {
          displayName = (profile as any).first_name;
        } else if (user.user_metadata?.name) {
          displayName = user.user_metadata.name;
        } else if (user.email) {
          // Extrair nome do email se necessário
          const emailName = user.email.split('@')[0];
          displayName = emailName.charAt(0).toUpperCase() + emailName.slice(1);
        }
        
        // Usar apenas o primeiro nome para um tom mais pessoal
        const firstName = displayName.split(' ')[0];
        setUserName(firstName);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  };

  const generateTitle = (question: string) => {
    const q = question.toLowerCase();
    if (q.includes('análise completa') || q.includes('análise geral')) return '📊 Análise Completa de Saúde';
    if (q.includes('peso') || q.includes('imc') || q.includes('obesidade')) return '⚖️ Análise de Peso e Composição Corporal';
    if (q.includes('nutrição') || q.includes('alimentação') || q.includes('dieta')) return '🥗 Análise Nutricional';
    if (q.includes('risco') || q.includes('metabólico')) return '⚠️ Avaliação de Riscos Metabólicos';
    if (q.includes('exame') || q.includes('resultado')) return '🔬 Análise de Exames';
    if (q.includes('sintoma') || q.includes('sentindo') || q.includes('dor')) return '🩺 Avaliação de Sintomas';
    if (q.includes('meta') || q.includes('objetivo')) return '🎯 Análise de Metas e Objetivos';
    if (q.includes('evolução') || q.includes('progresso')) return '📈 Análise de Evolução';
    return '🩺 Consulta Médica Personalizada';
  };

  const formatResponse = (text: string) => {
    if (!text) return text;
    
    // Normalizar quebras de linha
    let personalizedText = text.replace(/\r\n/g, "\n");

    // Adicionar saudação personalizada com nome do usuário
    if (userName) {
      if (!personalizedText.match(/^(olá|oi|bom dia|boa tarde|boa noite|prezado|caro|estimado|saudações)/i)) {
        personalizedText = `Olá ${userName},\n\n${personalizedText}`;
      } else if (!personalizedText.match(/^(olá|oi|bom dia|boa tarde|boa noite|prezado|caro|estimado|saudações)[^,]*,/i)) {
        personalizedText = personalizedText.replace(/^(olá|oi|bom dia|boa tarde|boa noite|prezado|caro|estimado|saudações)/i, `$1 ${userName},`);
      }
    }

    // Limpeza e conversão de Markdown
    // 1) Blocos de código (remover)
    personalizedText = personalizedText.replace(/```[\s\S]*?```/g, "");
    // 2) Cabeçalhos markdown -> títulos elegantes
    personalizedText = personalizedText.replace(/^#{1,6}\s*(.+)$/gm, (m, p1) => `\n\nTÍTULO:${p1.trim()}\n`);
    // 3) Negrito markdown **texto** -> destaque elegante
    personalizedText = personalizedText.replace(/\*\*(.+?)\*\*/g, '<span class="important-text">$1<\/span>');
    // 4) Itálico markdown *texto* ou _texto_ -> leve ênfase
    personalizedText = personalizedText.replace(/(^|\s)[*_]([^*_][^*_]*?)[*_](?=\s|$)/g, '$1<span class="highlight-value">$2<\/span>');

    // Dividir em blocos por parágrafos
    const blocks = personalizedText.split("\n\n").filter(block => block.trim().length > 0);
    const formattedBlocks: string[] = [];
    
    for (let i = 0; i < blocks.length; i++) {
      let block = blocks[i];

      // Converter marcador de título criado na etapa anterior
      if (/^TÍTULO:/i.test(block)) {
        const title = block.replace(/^TÍTULO:/i, '').trim();
        formattedBlocks.push(`<h3 class="section-title">${title}</h3>`);
        continue;
      }
      
      // Detectar o tipo de bloco para adicionar ícone apropriado
      let blockIcon = '';
      let blockType = '';
      
      if (/(peso|imc|obesidade|kg)/i.test(block)) {
        blockIcon = '<span class="block-icon weight">⚖️</span>';
        blockType = 'weight-block';
      } else if (/(meta|objetivo)/i.test(block)) {
        blockIcon = '<span class="block-icon goal">🎯</span>';
        blockType = 'goal-block';
      } else if (/(nutri[çc][ãa]o|alimenta[çc][ãa]o|dieta|caloria)/i.test(block)) {
        blockIcon = '<span class="block-icon nutrition">🥗</span>';
        blockType = 'nutrition-block';
      } else if (/(metabolismo|energia|basal)/i.test(block)) {
        blockIcon = '<span class="block-icon metabolism">⚡</span>';
        blockType = 'metabolism-block';
      } else if (/(risco|patologia|sa[úu]de|doen[çc]a)/i.test(block)) {
        blockIcon = '<span class="block-icon risk">⚠️</span>';
        blockType = 'risk-block';
      } else if (/(recomenda[çc][ãa]o|conselho|sugest[ãa]o)/i.test(block)) {
        blockIcon = '<span class="block-icon recommendation">💡</span>';
        blockType = 'recommendation-block';
      } else if (/(completu[dt]e|dados|informa[çc][ãa]o|hist[óo]ri[ck]o)/i.test(block)) {
        blockIcon = '<span class="block-icon data">📊</span>';
        blockType = 'data-block';
      } else {
        blockIcon = '<span class="block-icon general">🩺</span>';
        blockType = 'general-block';
      }

      // Formatações: listas e destaques
      let formatted = block
        // Listas numeradas
        .replace(/^(\d+)\.\s*(.+)$/gm, '<div class="numbered-item"><div class="number">$1<\/div><div class="text">$2<\/div><\/div>')
        // Pontos com traço
        .replace(/^\-\s*(.+)$/gm, '<div class="bullet-item"><span class="bullet-marker">•<\/span><span class="bullet-text">$1<\/span><\/div>')
        // Percentuais em badge
        .replace(/(\(?\s*)(\d+%)(\s*\)?)/g, '$1<span class="percentage-badge">$2<\/span>$3');

      formattedBlocks.push(`
        <div class="content-block ${blockType}">
          ${blockIcon}
          <div class="block-content">
            ${formatted}
          </div>
        </div>
      `);
    }
    
    return formattedBlocks.join('');
  };

  const handlePrint = () => {
    if (!response?.response) return;
    const printable = `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Dr. Vital IA do Instituto dos Sonhos - Análise</title>
  <style>
    :root { --primary:#6366f1; --secondary:#06b6d4; --accent:#f59e0b; --success:#10b981; }
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; color:#1e293b; background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); }
    .container { max-width: 900px; margin: 0 auto; padding: 24px; }
    .header { background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 50%, var(--accent) 100%); color: white; padding: 24px; border-radius: 16px; display:flex; align-items:center; gap:16px; box-shadow: 0 10px 25px rgba(99,102,241,0.3); }
    .header img { width:50px; height:50px; border-radius:50%; background: rgba(255,255,255,.15); padding:6px; border: 2px solid rgba(255,255,255,0.3); }
    .logo { width:40px; height:40px; margin-left: auto; }
    h1 { font-size: 22px; margin:0; font-weight: 700; }
    .subtitle { opacity:.95; font-size:13px; margin-top:4px; font-weight: 500; }
    .content { margin-top: 24px; background:#ffffff; border:1px solid #e2e8f0; border-radius:16px; padding:32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
    
    /* Estilos dos blocos de conteúdo */
    .content-block {
      position: relative;
      margin-bottom: 24px;
      padding: 14px 14px 14px 42px;
      border-radius: 10px;
      background: white;
      border: 1px solid #e2e8f0;
      box-shadow: 0 2px 6px rgba(0,0,0,0.03);
      page-break-inside: avoid;
    }
                      
    .content-block:after {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      height: 100%;
      width: 5px;
      border-radius: 10px 0 0 10px;
    }
                      
    .block-icon {
      position: absolute;
      left: 12px;
      top: 14px;
      font-size: 18px;
      width: 22px;
      height: 22px;
      line-height: 22px;
      text-align: center;
    }
                      
    /* Estilos específicos para cada tipo de bloco */
    .weight-block:after { background-color: #06b6d4; }
    .goal-block:after { background-color: #8b5cf6; }
    .nutrition-block:after { background-color: #10b981; }
    .metabolism-block:after { background-color: #f59e0b; }
    .risk-block:after { background-color: #ef4444; }
    .recommendation-block:after { background-color: #0ea5e9; }
    .data-block:after { background-color: #6366f1; }
    .general-block:after { background-color: #64748b; }
                      
    /* Títulos de seção */
    .section-title {
      color: #1e293b;
      font-size: 18px;
      font-weight: 700;
      margin: 18px 0 16px;
      padding-bottom: 6px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
    }
                      
    /* Itens numerados */
    .numbered-item {
      display: flex;
      margin: 12px 0;
      padding: 14px;
      background: #f8fafc;
      border-radius: 10px;
    }
                      
    .numbered-item .number {
      background: #6366f1;
      color: white;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 12px;
      font-size: 12px;
      flex-shrink: 0;
    }
                      
    .numbered-item .text {
      flex: 1;
    }
                      
    /* Bullet points */
    .bullet-item {
      display: flex;
      align-items: flex-start;
      margin: 10px 0;
      padding: 10px 14px;
      background: #f0fdf4;
      border-radius: 8px;
    }
                      
    .bullet-marker {
      color: #10b981;
      font-size: 16px;
      margin-right: 10px;
    }
                      
    .bullet-text {
      flex: 1;
    }
                      
    /* Badge de porcentagem */
    .percentage-badge {
      background: #f97316;
      color: white;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 0.9em;
      display: inline-block;
    }
                      
    /* Valores destacados */
    .highlight-value {
      background: rgba(99,102,241,0.1);
      color: #4f46e5;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: 600;
    }
                      
    /* Alertas de risco */
    .risk-badge {
      background: #fef2f2;
      color: #dc2626;
      padding: 2px 8px 2px 3px;
      border-radius: 6px;
      font-weight: 600;
      border: 1px solid #fecaca;
      display: inline-flex;
      align-items: center;
      margin: 0 2px;
    }
                      
    /* Box de alerta importante */
    .important-box {
      background: #fffbeb;
      border: 1px solid #fde68a;
      border-left: 4px solid #f59e0b;
      border-radius: 6px;
      padding: 12px;
      margin: 14px 0;
      display: flex;
      align-items: center;
    }
                      
    /* Texto destacado importante */
    .important-text {
      color: #b45309;
      font-weight: 600;
    }
    
    .footer { margin-top:24px; color:#64748b; font-size:12px; text-align: center; padding: 16px; background: rgba(255,255,255,0.7); border-radius: 12px; }
    @page { margin: 16mm; }
    @media print {
      body { background: white; }
      .container { max-width: none; }
      .content { break-inside: avoid; box-shadow: none; }
      .header { box-shadow: none; }
    }
  </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <img src="http://45.67.221.216:8086/Dr.Vital.png" alt="Dr. Vital" />
        <div style="flex: 1;">
          <h1>Dr. Vital IA do Instituto dos Sonhos</h1>
          <div class="subtitle">Análise para ${userName || 'Paciente'} • ${generateTitle(currentQuestion)} • ${new Date().toLocaleString('pt-BR')}</div>
        </div>
        <img src="http://45.67.221.216:8086/logoids.png" alt="Instituto dos Sonhos" class="logo" />
      </div>
      <div class="content">
        ${formatResponse(response.response)}
      </div>
      <div class="footer">
        <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
          <img src="http://45.67.221.216:8086/logoids.png" alt="Instituto dos Sonhos" style="width: 20px; height: 20px;" />
          <span>⚠️ Este material é educativo e não substitui consulta médica presencial.</span>
        </div>
      </div>
    </div>
    <script>window.onload = () => { setTimeout(() => window.print(), 200); };</script>
  </body>
</html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open();
    w.document.write(printable);
    w.document.close();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user?.id) return;

    setIsLoading(true);
    setCurrentQuestion(message.trim());
    try {
      const { data, error } = await supabase.functions.invoke('dr-vital-enhanced', {
        body: {
          message: message.trim(),
          userId: user.id
        }
      });

      if (error) throw error;

      setResponse(data);
      setIsPopupOpen(true);
      setMessage('');
      toast.success('Análise completa do Dr. Vital recebida!');
    } catch (error) {
      console.error('Erro ao consultar Dr. Vital:', error);
      toast.error('Erro ao comunicar com Dr. Vital. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDataCompletenessColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getDataCompletenessText = (percentage: number) => {
    if (percentage >= 80) return 'Excelente';
    if (percentage >= 60) return 'Adequado';
    return 'Insuficiente';
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-blue-600" />
          Dr. Vital - Análise Médica Completa
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Dr. Vital tem acesso a todos os seus dados: anamnese, peso, altura, gênero, IMC, metabolismo, 
          metas, histórico nutricional, respostas diárias e muito mais para análises precisas.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Formulário de consulta */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Como você está se sentindo? Conte sobre sua saúde, sintomas, dúvidas médicas, ou peça uma análise completa dos seus dados..."
            rows={4}
            disabled={isLoading}
          />
          
          <Button 
            type="submit" 
            disabled={!message.trim() || isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analisando dados completos...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Consultar Dr. Vital
              </>
            )}
          </Button>
        </form>

        {/* Resposta do Dr. Vital - Apenas notificação com botão para popup */}
        {response && (
          <div className="mt-8">
            <Card className="bg-gradient-to-r from-indigo-50 to-cyan-50 border-indigo-100 overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 transform translate-x-8 -translate-y-8 opacity-10">
                <svg viewBox="0 0 100 100" fill="currentColor" className="text-indigo-500">
                  <path d="M50 0 L100 50 L50 100 L0 50 Z"></path>
                </svg>
              </div>
              <CardHeader className="pb-2 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 p-1 border border-indigo-200 flex items-center justify-center">
                      <img 
                        src="http://45.67.221.216:8086/Dr.Vital.png"
                        alt="Dr. Vital" 
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-1 text-indigo-900">
                        <span>Análise concluída</span>
                        <span className="ml-2 text-emerald-500">✓</span>
                      </CardTitle>
                      <p className="text-xs text-indigo-700/70">
                        Dr. Vital analisou {userName ? `seus dados, ${userName}` : "seus dados"} e preparou recomendações personalizadas
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-3 pb-4 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-white/80">
                      <div className={`w-3 h-3 rounded-full ${getDataCompletenessColor(response.dataCompleteness.completionPercentage)}`} />
                    </div>
                    <div className="flex gap-1.5 items-center">
                      <span className="font-semibold text-sm">{response.dataCompleteness.completionPercentage}% de dados disponíveis</span>
                      <Badge variant="outline" className="bg-white/40">
                        {getDataCompletenessText(response.dataCompleteness.completionPercentage)}
                      </Badge>
                    </div>
                  </div>
                  <Button 
                    onClick={() => setIsPopupOpen(true)}
                    className="bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-700 hover:to-cyan-700 text-white border-0 shadow-md"
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Ver Análise Completa
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Modal elegante com o conteúdo completo */}
            <Dialog open={isPopupOpen} onOpenChange={setIsPopupOpen}>
              <DialogContent className="sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-0 overflow-hidden">
                {/* Cabeçalho colorido com gradiente */}
                <div className="bg-gradient-to-r from-indigo-600 via-cyan-500 to-amber-500 p-6 text-white relative overflow-hidden">
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-white/20 p-2 border-2 border-white/30">
                      <img src="http://45.67.221.216:8086/Dr.Vital.png" alt="Dr. Vital" className="w-full h-full rounded-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h1 className="text-xl font-bold mb-1">Dr. Vital IA do Instituto dos Sonhos</h1>
                      <p className="text-sm opacity-95 font-medium">
                        {userName ? `Análise para ${userName} • ` : ''}{generateTitle(currentQuestion)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Button size="sm" variant="secondary" onClick={handlePrint} className="bg-white/90 text-indigo-700 hover:bg-white shadow-lg">
                        📄 Imprimir
                      </Button>
                      <img src="http://45.67.221.216:8086/logoids.png" alt="Instituto dos Sonhos" className="w-10 h-10 rounded-lg bg-white/20 p-1" />
                    </div>
                  </div>
                </div>

                {/* Conteúdo com cores */}
                <div className="p-6 bg-gradient-to-br from-slate-50 to-blue-50">
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                    <style>{`
                      /* Blocos de conteúdo com ícones temáticos */
                      .content-block {
                        position: relative;
                        margin-bottom: 24px;
                        padding: 14px 14px 14px 42px;
                        border-radius: 10px;
                        background: white;
                        border: 1px solid #e2e8f0;
                        box-shadow: 0 2px 6px rgba(0,0,0,0.03);
                      }
                      
                      .content-block:after {
                        content: '';
                        position: absolute;
                        left: 0;
                        top: 0;
                        height: 100%;
                        width: 5px;
                        border-radius: 10px 0 0 10px;
                      }
                      
                      .block-icon {
                        position: absolute;
                        left: 12px;
                        top: 14px;
                        font-size: 18px;
                        width: 22px;
                        height: 22px;
                        line-height: 22px;
                        text-align: center;
                      }
                      
                      /* Estilos específicos para cada tipo de bloco */
                      .weight-block:after { background-color: #06b6d4; }
                      .goal-block:after { background-color: #8b5cf6; }
                      .nutrition-block:after { background-color: #10b981; }
                      .metabolism-block:after { background-color: #f59e0b; }
                      .risk-block:after { background-color: #ef4444; }
                      .recommendation-block:after { background-color: #0ea5e9; }
                      .data-block:after { background-color: #6366f1; }
                      .general-block:after { background-color: #64748b; }
                      
                      /* Títulos de seção */
                      .section-title {
                        color: #1e293b;
                        font-size: 18px;
                        font-weight: 700;
                        margin: 18px 0 16px;
                        padding-bottom: 6px;
                        border-bottom: 1px solid #e2e8f0;
                        display: flex;
                        align-items: center;
                      }
                      
                      /* Itens numerados */
                      .numbered-item {
                        display: flex;
                        margin: 12px 0;
                        padding: 14px;
                        background: #f8fafc;
                        border-radius: 10px;
                      }
                      
                      .numbered-item .number {
                        background: #6366f1;
                        color: white;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: bold;
                        margin-right: 12px;
                        font-size: 12px;
                        flex-shrink: 0;
                      }
                      
                      .numbered-item .text {
                        flex: 1;
                      }
                      
                      /* Bullet points */
                      .bullet-item {
                        display: flex;
                        align-items: flex-start;
                        margin: 10px 0;
                        padding: 10px 14px;
                        background: #f0fdf4;
                        border-radius: 8px;
                      }
                      
                      .bullet-marker {
                        color: #10b981;
                        font-size: 16px;
                        margin-right: 10px;
                      }
                      
                      .bullet-text {
                        flex: 1;
                      }
                      
                      /* Badge de porcentagem */
                      .percentage-badge {
                        background: #f97316;
                        color: white;
                        font-weight: bold;
                        padding: 3px 8px;
                        border-radius: 12px;
                        font-size: 0.9em;
                        display: inline-block;
                      }
                      
                      /* Valores destacados */
                      .highlight-value {
                        background: rgba(99,102,241,0.1);
                        color: #4f46e5;
                        padding: 2px 6px;
                        border-radius: 4px;
                        font-weight: 600;
                      }
                      
                      /* Alertas de risco */
                      .risk-badge {
                        background: #fef2f2;
                        color: #dc2626;
                        padding: 2px 8px 2px 3px;
                        border-radius: 6px;
                        font-weight: 600;
                        border: 1px solid #fecaca;
                        display: inline-flex;
                        align-items: center;
                        margin: 0 2px;
                      }
                      
                      /* Box de alerta importante */
                      .important-box {
                        background: #fffbeb;
                        border: 1px solid #fde68a;
                        border-left: 4px solid #f59e0b;
                        border-radius: 6px;
                        padding: 12px;
                        margin: 14px 0;
                        display: flex;
                        align-items: center;
                      }
                      
                      /* Texto destacado importante */
                      .important-text {
                        color: #b45309;
                        font-weight: 600;
                      }
                    `}</style>
                    <div 
                      className="text-sm leading-relaxed text-slate-700 max-h-[60vh] overflow-y-auto"
                      dangerouslySetInnerHTML={{ __html: formatResponse(response.response) }}
                    />
                  </div>
                  
                  {/* Footer com logo */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500 bg-white/60 rounded-lg p-3">
                    <img src="http://45.67.221.216:8086/logoids.png" alt="Instituto dos Sonhos" className="w-4 h-4" />
                    <span>⚠️ Este material é educativo e não substitui consulta médica presencial.</span>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Dados faltantes */}
            {response.dataCompleteness.missingData.length > 0 && (
              <Card className="border-orange-200 bg-orange-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-orange-800">
                    Dados Faltantes para Análise Mais Completa
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {response.dataCompleteness.missingData.map((missing) => (
                      <Badge key={missing} variant="outline" className="text-xs">
                        {missing === 'profile' && 'Perfil Básico'}
                        {missing === 'physicalData' && 'Dados Físicos'}
                        {missing === 'weightHistory' && 'Histórico de Peso'}
                        {missing === 'anamnesis' && 'Anamnese'}
                        {missing === 'activeGoals' && 'Metas Ativas'}
                        {missing === 'nutritionHistory' && 'Histórico Nutricional'}
                        {missing === 'dailyResponses' && 'Respostas Diárias'}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Sugestões de perguntas */}
        {!response && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Sugestões de consultas:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {[
                "Faça uma análise completa dos meus dados de saúde",
                "Como está minha evolução de peso e composição corporal?",
                "Analise meu padrão nutricional e dê sugestões",
                "Avalie meu risco metabólico baseado nos meus dados",
                "Que exames devo fazer considerando minha anamnese?",
                "Como posso melhorar minha qualidade de vida?"
              ].map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setMessage(suggestion)}
                  className="text-left h-auto p-3 whitespace-normal"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};