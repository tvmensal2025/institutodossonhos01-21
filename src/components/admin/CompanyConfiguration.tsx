import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Building2, Users, Target, Award, Save } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CompanyData {
  company_name: string;
  mission: string;
  vision: string;
  values: string;
  about_us: string;
  target_audience: string;
  main_services: string;
  differentials: string;
  company_culture: string;
  health_philosophy: string;
}

const CompanyConfiguration: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData>({
    company_name: 'Instituto dos Sonhos',
    mission: 'Guiar pessoas na transformação integral da saúde física e emocional, proporcionando emagrecimento sustentável, autoestima elevada, bem-estar e qualidade de vida. Rafael e Sirlene acreditam que a verdadeira mudança acontece de dentro para fora, por meio do equilíbrio entre corpo, mente e emoções.',
    vision: 'Ser reconhecido como um centro de referência em saúde integral, emagrecimento e bem-estar, combinando ciência, tecnologia, estética e inteligência emocional. Rafael e Sirlene querem impactar milhares de pessoas, ajudando-as a alcançar longevidade, saúde e confiança, tornando o Instituto dos Sonhos uma clínica completa de saúde e estética.',
    values: '1. Humanização e empatia – Tratamos cada cliente como parte da família Instituto dos Sonhos.\n2. Ética e transparência – Compromisso com métodos saudáveis e verdadeiros.\n3. Inovação constante – Uso de tecnologia e ciência de ponta.\n4. Educação e autoconhecimento – Ensinar para transformar hábitos e comportamentos.\n5. Resultados com leveza – Evitando métodos radicais e dolorosos.\n6. Equilíbrio corpo-mente – Acreditamos que saúde emocional e física andam juntas.',
    about_us: 'O Instituto dos Sonhos, fundado por Rafael Ferreira e Sirlene Freitas, é especializado em emagrecimento, saúde emocional e estética integrativa. Rafael é coach, hipnólogo, psicoterapeuta, master coach e estudante de Biomedicina, buscando entender profundamente casos clínicos e exames. Sirlene tem as mesmas certificações (coach, hipnose, psicoterapia, inteligência emocional) e é estudante de Nutrição, reforçando o cuidado com a alimentação dos clientes. A equipe conta com nutricionista, biomédicos, fisioterapeutas e educador físico. A estrutura inclui a Academia Sem Dor, com pilates, musculação, fisioterapia, funcional e terapia.',
    target_audience: 'Homens e principalmente mulheres acima de 35 anos, que sofrem com sobrepeso, obesidade, baixa autoestima, dores emocionais, ansiedade e problemas de saúde relacionados aos hábitos de vida. Pessoas que já tentaram outras abordagens sem sucesso e buscam um método humanizado e eficiente, com suporte emocional e físico. Famílias que desejam transformar hábitos e ter uma vida saudável e equilibrada.',
    main_services: 'Programas de emagrecimento (Desafio 7D, Limpeza Hepática, Detox). Coaching e inteligência emocional (individual e em grupo). Psicoterapia e hipnose para desbloqueios emocionais. Estética avançada (botox, enzimas, microagulhamento, hidratação facial, tratamentos capilares, remoção de verrugas). Consultoria online e presencial com planos personalizados. Plataforma digital de emagrecimento com acompanhamento, conteúdo exclusivo e suporte.',
    differentials: 'Atendimento humanizado com Rafael e Sirlene, que direcionam o cliente para o profissional correto quando necessário. Equipe multidisciplinar completa, oferecendo cuidado 360°. Método exclusivo, unindo ciência, mente e estética. Academia Sem Dor como extensão prática para treinos, terapias e fisioterapia. Certificações e expertise obtidas em imersões com os melhores profissionais da área.',
    company_culture: 'Acolhimento e empatia como pilares de todos os atendimentos. Busca por transformação real e não apenas estética. Educação contínua da equipe para oferecer sempre o melhor. Ambiente inspirador, onde cada cliente se sente motivado a cuidar da saúde com prazer.',
    health_philosophy: 'Acreditamos que saúde é uma soma de pequenos hábitos diários. Alimentação natural e equilibrada. Movimento e atividade física com prazer. Gestão emocional (psicoterapia, hipnose e coaching). Prevenção e autocuidado como pilares da longevidade. Transformação interior como chave para resultados externos. Sempre orientamos o usuário a falar com Rafael ou Sirlene, assim cuidamos e se não for algo clínico iremos direcionar para o profissional correto.'
  });

  useEffect(() => {
    loadCompanyData();
  }, []);

  const loadCompanyData = async () => {
    try {
      // Usar a nova tabela company_data
      const { data, error } = await supabase
        .from('company_data')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Dados da empresa não encontrados, usando valores padrão');
        return;
      }

      if (data) {
        setCompanyData({
          company_name: data.company_name || '',
          mission: (data as any).mission || '',
          vision: (data as any).vision || '',
          values: (data as any).values || '',
          about_us: (data as any).about_us || '',
          target_audience: (data as any).target_audience || '',
          main_services: (data as any).main_services || '',
          differentials: (data as any).differentials || '',
          company_culture: (data as any).company_culture || '',
          health_philosophy: (data as any).health_philosophy || ''
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    }
  };

  const saveCompanyData = async () => {
    try {
      setLoading(true);
      
      // Salvar usando a nova tabela company_data
      const { data, error } = await supabase
        .from('company_data')
        .upsert({
          company_name: companyData.company_name,
          description: companyData.about_us
        } as any)
        .select()
        .single();

      if (error) throw error;

      toast.success('✅ Dados da empresa salvos com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar dados:', error);
      toast.error('❌ Erro ao salvar dados da empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof CompanyData, value: string) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Configuração da Empresa
          </CardTitle>
          <CardDescription>
            Configure os dados da sua empresa para que a IA tenha contexto completo nas análises e sugestões
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Informações Básicas */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_name">Nome da Empresa</Label>
              <Input
                id="company_name"
                value={companyData.company_name}
                onChange={(e) => handleInputChange('company_name', e.target.value)}
                placeholder="Ex: Instituto dos Sonhos"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="target_audience">Público-Alvo</Label>
              <Input
                id="target_audience"
                value={companyData.target_audience}
                onChange={(e) => handleInputChange('target_audience', e.target.value)}
                placeholder="Ex: Mulheres 25-45 anos interessadas em emagrecimento"
              />
            </div>
          </div>

          {/* Missão e Visão */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="mission" className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Missão
              </Label>
              <Textarea
                id="mission"
                value={companyData.mission}
                onChange={(e) => handleInputChange('mission', e.target.value)}
                placeholder="Qual é a missão da sua empresa?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="vision" className="flex items-center gap-2">
                <Award className="h-4 w-4" />
                Visão
              </Label>
              <Textarea
                id="vision"
                value={companyData.vision}
                onChange={(e) => handleInputChange('vision', e.target.value)}
                placeholder="Qual é a visão de futuro da empresa?"
                rows={3}
              />
            </div>
          </div>

          {/* Valores */}
          <div className="space-y-2">
            <Label htmlFor="values">Valores da Empresa</Label>
            <Textarea
              id="values"
              value={companyData.values}
              onChange={(e) => handleInputChange('values', e.target.value)}
              placeholder="Quais são os valores fundamentais da empresa?"
              rows={3}
            />
          </div>

          {/* Sobre Nós */}
          <div className="space-y-2">
            <Label htmlFor="about_us" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Sobre Nós
            </Label>
            <Textarea
              id="about_us"
              value={companyData.about_us}
              onChange={(e) => handleInputChange('about_us', e.target.value)}
              placeholder="Conte a história da empresa, quando foi fundada, por quem..."
              rows={4}
            />
          </div>

          {/* Serviços e Diferenciais */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="main_services">Principais Serviços</Label>
              <Textarea
                id="main_services"
                value={companyData.main_services}
                onChange={(e) => handleInputChange('main_services', e.target.value)}
                placeholder="Quais são os principais serviços oferecidos?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="differentials">Diferenciais</Label>
              <Textarea
                id="differentials"
                value={companyData.differentials}
                onChange={(e) => handleInputChange('differentials', e.target.value)}
                placeholder="O que diferencia sua empresa da concorrência?"
                rows={3}
              />
            </div>
          </div>

          {/* Cultura e Filosofia */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="company_culture">Cultura da Empresa</Label>
              <Textarea
                id="company_culture"
                value={companyData.company_culture}
                onChange={(e) => handleInputChange('company_culture', e.target.value)}
                placeholder="Como é a cultura e o ambiente de trabalho?"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="health_philosophy">Filosofia de Saúde</Label>
              <Textarea
                id="health_philosophy"
                value={companyData.health_philosophy}
                onChange={(e) => handleInputChange('health_philosophy', e.target.value)}
                placeholder="Qual a abordagem da empresa sobre saúde e bem-estar?"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button 
              onClick={saveCompanyData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyConfiguration;