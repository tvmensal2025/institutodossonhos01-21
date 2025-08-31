import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Database, Check, X, Loader2, TestTube, MessageCircle, Stethoscope } from "lucide-react";

interface UserDataStatus {
  anamnesis: boolean;
  physicalData: boolean;
  nutrition: boolean;
  exercise: boolean;
  goals: boolean;
  missions: boolean;
  mood: boolean;
  weight: boolean;
  profile: boolean;
  companyData: boolean;
}

interface TestResult {
  sofia: {
    hasAccess: boolean;
    dataCount: number;
    lastUpdate: string;
    errors: string[];
  };
  drVital: {
    hasAccess: boolean;
    dataCount: number;
    lastUpdate: string;
    errors: string[];
  };
  companyKnowledge: {
    isLoaded: boolean;
    itemCount: number;
    categories: string[];
  };
}

export default function SofiaDataTestPanel() {
  const [userDataStatus, setUserDataStatus] = useState<UserDataStatus | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [testingAI, setTestingAI] = useState(false);
  const { toast } = useToast();

  const checkUserDataCompleteness = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "❌ Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-user-data-completeness', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('❌ Erro ao verificar dados:', error);
        toast({
          title: "❌ Erro",
          description: "Falha ao verificar completude dos dados",
          variant: "destructive"
        });
        return;
      }

      // Verificar dados da empresa
      const { data: companyData, error: companyError } = await supabase
        .from('company_knowledge_base')
        .select('*')
        .eq('is_active', true);

      const statusData: UserDataStatus = {
        anamnesis: data.completionStatus?.anamnesis || false,
        physicalData: data.completionStatus?.physicalData || false,
        nutrition: data.completionStatus?.nutrition || false,
        exercise: data.completionStatus?.exercise || false,
        goals: data.completionStatus?.goals || false,
        missions: data.completionStatus?.dailyMission || false,
        mood: data.completionStatus?.mood || false,
        weight: data.completionStatus?.weight || false,
        profile: data.completionStatus?.profile || false,
        companyData: !companyError && companyData && companyData.length > 0
      };

      setUserDataStatus(statusData);

      toast({
        title: "✅ Verificação Concluída",
        description: `Completude: ${data.completionPercentage || 0}%`,
        variant: "default"
      });

    } catch (error) {
      console.error('❌ Erro na verificação:', error);
      toast({
        title: "❌ Erro",
        description: "Erro interno na verificação",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const testAIDataAccess = async () => {
    setTestingAI(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "❌ Erro",
          description: "Usuário não autenticado",
          variant: "destructive"
        });
        return;
      }

      // Testar Sofia
      const sofiaTest = await supabase.functions.invoke('sofia-enhanced-memory', {
        body: { 
          userId: user.id,
          message: "Teste de acesso aos dados - me conte sobre os dados que você tem acesso sobre mim e sobre o Instituto dos Sonhos",
          type: 'test_access'
        }
      });

      // Testar Dr. Vital
      const drVitalTest = await supabase.functions.invoke('dr-vital-enhanced', {
        body: { 
          userId: user.id,
          message: "Teste de acesso aos dados - me conte sobre os dados que você tem acesso sobre mim e sobre o Instituto dos Sonhos",
          type: 'test_access'
        }
      });

      // Verificar base de conhecimento da empresa
      const { data: companyKnowledge, error: companyError } = await supabase
        .from('company_knowledge_base')
        .select('category, title')
        .eq('is_active', true);

      const testResultData: TestResult = {
        sofia: {
          hasAccess: !sofiaTest.error,
          dataCount: sofiaTest.data?.userData?.totalRecords || 0,
          lastUpdate: new Date().toISOString(),
          errors: sofiaTest.error ? [sofiaTest.error.message] : []
        },
        drVital: {
          hasAccess: !drVitalTest.error,
          dataCount: drVitalTest.data?.userData?.totalRecords || 0,
          lastUpdate: new Date().toISOString(),
          errors: drVitalTest.error ? [drVitalTest.error.message] : []
        },
        companyKnowledge: {
          isLoaded: !companyError && companyKnowledge && companyKnowledge.length > 0,
          itemCount: companyKnowledge?.length || 0,
          categories: companyKnowledge ? [...new Set(companyKnowledge.map(item => item.category))] : []
        }
      };

      setTestResult(testResultData);

      toast({
        title: "🧪 Teste Concluído",
        description: "Verificação de acesso às IAs realizada",
        variant: "default"
      });

    } catch (error) {
      console.error('❌ Erro no teste de IA:', error);
      toast({
        title: "❌ Erro no Teste",
        description: "Falha ao testar acesso das IAs",
        variant: "destructive"
      });
    } finally {
      setTestingAI(false);
    }
  };

  useEffect(() => {
    checkUserDataCompleteness();
  }, []);

  const getStatusIcon = (status: boolean) => {
    return status ? <Check className="h-4 w-4 text-green-500" /> : <X className="h-4 w-4 text-red-500" />;
  };

  const getStatusBadge = (status: boolean) => {
    return (
      <Badge variant={status ? "default" : "destructive"}>
        {status ? "Ativo" : "Inativo"}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TestTube className="h-8 w-8 text-teal-500" />
            Teste de Dados - Sofia & Dr. Vital
          </h1>
          <p className="text-muted-foreground">
            Verificação completa de acesso aos dados do usuário e Instituto dos Sonhos
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={checkUserDataCompleteness} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Database className="h-4 w-4 mr-2" />}
            Verificar Dados
          </Button>
          <Button onClick={testAIDataAccess} disabled={testingAI} variant="outline">
            {testingAI ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
            Testar IAs
          </Button>
        </div>
      </div>

      <Tabs defaultValue="user-data" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="user-data">📊 Dados do Usuário</TabsTrigger>
          <TabsTrigger value="ai-access">🤖 Acesso das IAs</TabsTrigger>
          <TabsTrigger value="company-data">🏢 Dados da Empresa</TabsTrigger>
        </TabsList>

        <TabsContent value="user-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Dados do Usuário</CardTitle>
            </CardHeader>
            <CardContent>
              {userDataStatus ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">🩺 Anamnese</span>
                    {getStatusIcon(userDataStatus.anamnesis)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">📏 Dados Físicos</span>
                    {getStatusIcon(userDataStatus.physicalData)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">🍎 Nutrição</span>
                    {getStatusIcon(userDataStatus.nutrition)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">🏃 Exercícios</span>
                    {getStatusIcon(userDataStatus.exercise)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">🎯 Metas</span>
                    {getStatusIcon(userDataStatus.goals)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">📝 Missões</span>
                    {getStatusIcon(userDataStatus.missions)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">😊 Humor</span>
                    {getStatusIcon(userDataStatus.mood)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">⚖️ Peso</span>
                    {getStatusIcon(userDataStatus.weight)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">👤 Perfil</span>
                    {getStatusIcon(userDataStatus.profile)}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando dados...</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-access" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="h-5 w-5 text-teal-500" />
                  Sofia
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Acesso aos dados</span>
                      {getStatusBadge(testResult.sofia.hasAccess)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Registros acessados</span>
                      <Badge variant="outline">{testResult.sofia.dataCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Última atualização</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(testResult.sofia.lastUpdate).toLocaleString()}
                      </span>
                    </div>
                    {testResult.sofia.errors.length > 0 && (
                      <div className="text-xs text-red-500">
                        Erros: {testResult.sofia.errors.join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-sm text-muted-foreground">Execute o teste para ver resultados</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-blue-500" />
                  Dr. Vital
                </CardTitle>
              </CardHeader>
              <CardContent>
                {testResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Acesso aos dados</span>
                      {getStatusBadge(testResult.drVital.hasAccess)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Registros acessados</span>
                      <Badge variant="outline">{testResult.drVital.dataCount}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Última atualização</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(testResult.drVital.lastUpdate).toLocaleString()}
                      </span>
                    </div>
                    {testResult.drVital.errors.length > 0 && (
                      <div className="text-xs text-red-500">
                        Erros: {testResult.drVital.errors.join(', ')}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-sm text-muted-foreground">Execute o teste para ver resultados</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="company-data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Base de Conhecimento - Instituto dos Sonhos</CardTitle>
            </CardHeader>
            <CardContent>
              {testResult ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Status da Base</span>
                    {getStatusBadge(testResult.companyKnowledge.isLoaded)}
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">Total de Itens</span>
                    <Badge variant="outline">{testResult.companyKnowledge.itemCount}</Badge>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <span className="text-sm font-medium mb-2 block">Categorias Disponíveis:</span>
                    <div className="flex flex-wrap gap-2">
                      {testResult.companyKnowledge.categories.map((category, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-sm text-muted-foreground">Execute o teste para ver resultados</span>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}