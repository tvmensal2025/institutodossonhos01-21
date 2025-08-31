import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield, Eye, Lock, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const TermsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/20 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/auth">
            <Button variant="ghost" size="sm" className="hover:bg-muted">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">
              Termos e Políticas
            </h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Termos de Uso */}
          <Card className="health-card" id="termos">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Shield className="h-6 w-6 text-primary" />
                Termos de Uso
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Aceitação dos Termos</h3>
                  <p className="text-muted-foreground">
                    Ao acessar e usar a Plataforma dos Sonhos, criada pelo Instituto dos Sonhos, você
                    aceita estar vinculado a estes Termos de Uso. Se você não concordar com qualquer
                    parte destes termos, não deve usar nosso serviço.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Descrição do Serviço</h3>
                  <p className="text-muted-foreground">
                    A Plataforma dos Sonhos, criada pelo Instituto dos Sonhos, é uma plataforma digital
                    de saúde e bem-estar que oferece:
                  </p>
                  <ul className="list-disc pl-6 mt-2 text-muted-foreground">
                    <li>Monitoramento de saúde e progresso físico</li>
                    <li>Integração com dispositivos de medição (balança inteligente)</li>
                    <li>Sistema gamificado de missões e desafios</li>
                    <li>Análise de composição corporal e bioimpedância</li>
                    <li>Chatbot de saúde com IA</li>
                    <li>Plataforma de cursos e conteúdo educativo</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Responsabilidades do Usuário</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Fornecer informações precisas e atualizadas sobre sua saúde</li>
                    <li>Usar o serviço apenas para fins pessoais e legítimos</li>
                    <li>Não compartilhar credenciais de acesso com terceiros</li>
                    <li>Respeitar outros usuários na comunidade</li>
                    <li>Consultar profissionais de saúde antes de tomar decisões médicas</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">4. Limitações de Responsabilidade</h3>
                  <p className="text-muted-foreground">
                    O Instituto dos Sonhos é uma ferramenta de apoio ao bem-estar e NÃO substitui 
                    consultas médicas profissionais. As informações fornecidas são para fins 
                    educativos e de monitoramento pessoal.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">5. Propriedade Intelectual</h3>
                  <p className="text-muted-foreground">
                    Todo o conteúdo da plataforma (textos, imagens, algoritmos, design) é 
                    propriedade do Instituto dos Sonhos e está protegido por direitos autorais.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">6. Modificações</h3>
                  <p className="text-muted-foreground">
                    Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                    Os usuários serão notificados sobre mudanças significativas.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">7. Conta, Suspensão e Encerramento</h3>
                  <p className="text-muted-foreground">
                    Podemos suspender ou encerrar o acesso caso haja violação destes Termos, uso indevido
                    da plataforma ou por exigência legal. Você pode solicitar o encerramento da conta a
                    qualquer momento pelos canais de suporte.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">8. Integrações e Terceiros (Google Fit, Dispositivos e IA)</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Funcionalidades de integração com Google Fit dependem de autorização do usuário.</li>
                    <li>Tokens de acesso, escopos e sincronizações podem ser revogados a qualquer momento
                      nas configurações do Google e/ou do aplicativo.</li>
                    <li>Processamentos de linguagem natural podem utilizar provedores de IA de terceiros
                      para gerar insights, sempre respeitando a privacidade e a LGPD.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">9. Conduta Proibida</h3>
                  <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                    <li>Uso da plataforma para fins ilegais ou que violem direitos de terceiros.</li>
                    <li>Tentativas de engenharia reversa, exploração de vulnerabilidades ou acesso não autorizado.</li>
                    <li>Publicação de conteúdo ofensivo, discriminatório ou que viole a lei.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">10. Isenções Médicas</h3>
                  <p className="text-muted-foreground">
                    As informações fornecidas não constituem aconselhamento médico. Consulte profissionais
                    qualificados antes de tomar decisões sobre sua saúde.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">11. Lei Aplicável e Foro</h3>
                  <p className="text-muted-foreground">
                    Estes Termos são regidos pelas leis do Brasil, em especial pelo Código Civil e pela LGPD
                    quando aplicável. Fica eleito o foro de São Paulo/SP, salvo disposições legais em contrário.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Política de Privacidade */}
          <Card className="health-card" id="privacidade">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Eye className="h-6 w-6 text-secondary" />
                Política de Privacidade (LGPD)
              </CardTitle>
            </CardHeader>
            <CardContent className="prose prose-slate dark:prose-invert max-w-none">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">1. Coleta de Dados</h3>
                  <p className="text-muted-foreground mb-3">
                    Coletamos os seguintes tipos de dados pessoais:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li><strong>Dados de identificação:</strong> nome, email, telefone</li>
                    <li><strong>Dados demográficos:</strong> idade, gênero, cidade</li>
                    <li><strong>Dados biométricos:</strong> peso, altura, composição corporal</li>
                    <li><strong>Dados de saúde:</strong> medições, progresso, hábitos</li>
                    <li><strong>Dados de uso:</strong> interações na plataforma, preferências</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">2. Finalidade do Tratamento</h3>
                  <p className="text-muted-foreground mb-3">
                    Utilizamos seus dados para:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Fornecer e personalizar nossos serviços</li>
                    <li>Monitorar seu progresso de saúde e bem-estar</li>
                    <li>Gerar relatórios e análises personalizados</li>
                    <li>Enviar notificações relevantes</li>
                    <li>Melhorar nossa plataforma</li>
                    <li>Cumprir obrigações legais</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">3. Base Legal (LGPD)</h3>
                  <p className="text-muted-foreground mb-3">
                    O tratamento dos seus dados está baseado em:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li><strong>Consentimento:</strong> para dados sensíveis de saúde</li>
                    <li><strong>Execução de contrato:</strong> para prestação do serviço</li>
                    <li><strong>Legítimo interesse:</strong> para melhorias da plataforma</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">4. Compartilhamento de Dados</h3>
                  <p className="text-muted-foreground">
                    Seus dados NÃO são vendidos a terceiros. Podem ser compartilhados apenas:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-muted-foreground">
                    <li>Com fornecedores de tecnologia (Supabase, OpenAI) sob contratos de confidencialidade</li>
                    <li>Quando exigido por lei ou autoridades competentes</li>
                    <li>Em caso de anonimização para pesquisa científica</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">5. Seus Direitos (LGPD)</h3>
                  <p className="text-muted-foreground mb-3">
                    Você tem direito a:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li><strong>Acesso:</strong> saber quais dados temos sobre você</li>
                    <li><strong>Correção:</strong> corrigir dados incompletos ou incorretos</li>
                    <li><strong>Exclusão:</strong> solicitar a remoção dos seus dados</li>
                    <li><strong>Portabilidade:</strong> receber seus dados em formato estruturado</li>
                    <li><strong>Revogação:</strong> retirar o consentimento a qualquer momento</li>
                    <li><strong>Oposição:</strong> se opor ao tratamento em certas situações</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">6. Segurança dos Dados</h3>
                  <p className="text-muted-foreground">
                    Implementamos medidas técnicas e organizacionais adequadas para proteger 
                    seus dados, incluindo criptografia, controle de acesso e monitoramento 
                    de segurança.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">7. Retenção de Dados</h3>
                  <p className="text-muted-foreground">
                    Seus dados são mantidos pelo tempo necessário para cumprir as finalidades 
                    descritas ou conforme exigido por lei. Dados de saúde são tratados com 
                    cuidado especial.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">8. Contato - Encarregado de Dados</h3>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-muted-foreground">
                      Para exercer seus direitos ou esclarecer dúvidas sobre privacidade:
                    </p>
                    <p className="font-medium mt-2">
                      Email: suporte@institutodossonhos.com.br
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Resposta em até 15 dias úteis
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">9. Integração com Google Fit</h3>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Importamos dados de atividade, métricas corporais e sinais associados conforme os
                      escopos autorizados por você.</li>
                    <li>Você pode revogar a autorização a qualquer momento nas configurações da sua conta
                      Google e nas preferências do aplicativo.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">10. Compartilhamento com Operadores (Art. 39 LGPD)</h3>
                  <p className="text-muted-foreground mb-2">
                    Podemos utilizar provedores para armazenamento, autenticação, processamento de linguagem
                    e mensageria. Exemplos: Supabase (infra/armazenamento), provedores de IA (processamento
                    de texto) e serviços Google (p.ex., Google Fit e TTS). Esses provedores atuam como
                    operadores, seguindo nossas instruções e contratos de proteção de dados.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">11. Transferências Internacionais</h3>
                  <p className="text-muted-foreground">
                    Quando houver transferência de dados para fora do Brasil, adotamos salvaguardas adequadas,
                    como cláusulas contratuais padrão e medidas técnicas de segurança, em linha com a LGPD.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">12. Cookies e Tecnologias Similares</h3>
                  <p className="text-muted-foreground">
                    Podemos utilizar cookies essenciais para autenticação e segurança, e cookies opcionais
                    para melhorar a experiência e métricas de uso. Você pode gerenciar preferências no
                    navegador. O uso de cookies pode impactar certas funcionalidades.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">13. Marketing e Comunicações</h3>
                  <p className="text-muted-foreground">
                    Podemos enviar comunicações sobre funcionalidades e conteúdos. Você pode se descadastrar
                    a qualquer momento pelos canais informados nas próprias mensagens.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">14. Menores de Idade</h3>
                  <p className="text-muted-foreground">
                    Nosso serviço não é direcionado a menores de 13 anos. Caso tomemos ciência de tratamento
                    indevido, adotaremos medidas para bloqueio e exclusão conforme a lei.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Segurança */}
          <Card className="health-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Lock className="h-6 w-6 text-accent" />
                Segurança e Proteção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">🔐 Criptografia</h4>
                  <p className="text-sm text-muted-foreground">
                    Todos os dados são criptografados em trânsito e em repouso usando 
                    algoritmos de segurança padrão da indústria.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">🛡️ Controle de Acesso</h4>
                  <p className="text-sm text-muted-foreground">
                    Implementamos autenticação robusta e controle de acesso baseado 
                    em funções (RLS - Row Level Security).
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">📊 Monitoramento</h4>
                  <p className="text-sm text-muted-foreground">
                    Sistema de logs e monitoramento contínuo para detectar e 
                    prevenir atividades suspeitas.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-semibold">🔄 Backup</h4>
                  <p className="text-sm text-muted-foreground">
                    Backups automáticos e redundância para garantir a 
                    disponibilidade e integridade dos dados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data de Vigência */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Última atualização: 22 de agosto de 2025</p>
            <p>Vigência: A partir da data de aceitação pelo usuário</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;