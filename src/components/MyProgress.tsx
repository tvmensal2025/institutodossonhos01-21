import React, { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { useGoogleFitData, Period } from '../hooks/useGoogleFitData';
import { motion } from 'framer-motion';
import { Skeleton } from './ui/skeleton';
import { GoogleFitCharts } from './progress/GoogleFitCharts';
import { OverviewWithGoogleFit } from './progress/OverviewWithGoogleFit';
import { AdvancedGoogleFitCharts } from './progress/AdvancedGoogleFitCharts';
import { AdvancedGoogleFitMetrics } from './progress/AdvancedGoogleFitMetrics';
import { GoogleFitInsights } from './progress/GoogleFitInsights';
import { HealthExecutiveSummary } from './progress/HealthExecutiveSummary';
import { MedicalHealthAnalysis } from './progress/MedicalHealthAnalysis';
import { ArrowLeft, Activity, Target, TrendingUp, RefreshCw, Clock, Heart, Zap } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
const MyProgress: React.FC = () => {
  const [period, setPeriod] = useState<Period>('week');
  const {
    loading,
    error,
    isConnected,
    syncData,
    data,
    lastSync,
    calculateStats,
    getPeriodRange,
    computeScoreForPeriod
  } = useGoogleFitData();

  // Auto-sync em background se último sync > 2h
  useEffect(() => {
    if (!isConnected || !lastSync) return;
    const ageMs = Date.now() - new Date(lastSync).getTime();
    const twoHours = 2 * 60 * 60 * 1000;
    if (ageMs > twoHours) {
      (async () => {
        try {
          await syncData();
        } catch {}
      })();
    }
  }, [isConnected, lastSync, syncData]);

  // Metas individuais (temporariamente salvas em localStorage)
  const [goalsOpen, setGoalsOpen] = useState(false);
  const [stepsGoal, setStepsGoal] = useState<number>(10000);
  const [sleepGoal, setSleepGoal] = useState<number>(8);
  const [activeMinutesGoal, setActiveMinutesGoal] = useState<number>(30);
  const [caloriesGoal, setCaloriesGoal] = useState<number>(500);
  useEffect(() => {
    try {
      const raw = localStorage.getItem('user_goals');
      if (raw) {
        const g = JSON.parse(raw);
        if (g.stepsGoal) setStepsGoal(g.stepsGoal);
        if (g.sleepGoal) setSleepGoal(g.sleepGoal);
        if (g.activeMinutesGoal) setActiveMinutesGoal(g.activeMinutesGoal);
        if (g.caloriesGoal) setCaloriesGoal(g.caloriesGoal);
      }
    } catch {}
  }, []);
  const saveGoals = () => {
    const g = {
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal
    };
    localStorage.setItem('user_goals', JSON.stringify(g));
    setGoalsOpen(false);
  };

  // Filtrar por período local
  const filteredData = useMemo(() => {
    if (!data?.length) return [] as typeof data;
    const {
      start,
      end
    } = getPeriodRange(period);
    return data.filter(r => r.date >= start && r.date <= end);
  }, [data, period]);
  const comparisonData = useMemo(() => {
    if (!data?.length) return [] as typeof data;
    const now = new Date();
    if (period === 'day') {
      const y = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const ds = y.toISOString().split('T')[0];
      return data.filter(r => r.date === ds);
    }
    if (period === 'week') {
      const {
        start,
        end
      } = getPeriodRange('week');
      const prevEnd = new Date(start + 'T00:00:00');
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevEnd.getDate() - 6);
      const s = prevStart.toISOString().split('T')[0];
      const e = prevEnd.toISOString().split('T')[0];
      return data.filter(r => r.date >= s && r.date <= e);
    }
    // month anterior
    const d = new Date();
    const prevStart = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    const prevEnd = new Date(d.getFullYear(), d.getMonth(), 0);
    const s = prevStart.toISOString().split('T')[0];
    const e = prevEnd.toISOString().split('T')[0];
    return data.filter(r => r.date >= s && r.date <= e);
  }, [data, period]);
  const currentStats = useMemo(() => calculateStats(filteredData), [filteredData]);
  const comparisonStats = useMemo(() => comparisonData.length ? calculateStats(comparisonData) : null, [comparisonData]);
  const currentScore = useMemo(() => computeScoreForPeriod(filteredData), [filteredData]);
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 20
    },
    visible: {
      opacity: 1,
      y: 0
    }
  };
  const fmtLastSync = lastSync ? new Date(lastSync).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }) : null;
  const renderValue = (val: number, unit?: string) => filteredData.length === 0 ? <span title="Sem dados no período">—</span> : <span>{unit ? `${val} ${unit}` : val}</span>;
  if (loading) {
    return <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20 mt-2" />
              </CardContent>
            </Card>)}
        </div>
      </div>;
  }

  // Experiência elegante quando não conectado (customizada)
  if (!isConnected) {
    return <div className="max-w-5xl mx-auto p-6">
        <Card className="relative overflow-hidden border-0 shadow-xl">
          {/* background decor */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-violet-400/30 to-fuchsia-400/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-indigo-400/30 to-purple-400/30 blur-3xl" />

          <div className="grid md:grid-cols-2">
            <div className="p-10 flex flex-col justify-center gap-4">
              <div className="flex items-center gap-3">
                <img src="/favicon.png" alt="Instituto dos Sonhos" className="h-8 w-8 rounded" />
                <span className="text-sm font-semibold tracking-wide text-muted-foreground">Instituto dos Sonhos</span>
              </div>
              <h1 className="text-3xl font-extrabold leading-tight">Conecte o Google Fit e acompanhe sua evolução</h1>
              <p className="text-muted-foreground">Sincronize automaticamente seus <b>passos</b>, <b>calorias ativas</b>, <b>minutos de intensidade</b>, <b>sono</b> e <b>frequência cardíaca</b> para análises inteligentes e relatórios do Dr. Vital.</p>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="flex items-center gap-2 text-sm"><Activity className="w-4 h-4 text-indigo-600" /> Passos e distância</div>
                <div className="flex items-center gap-2 text-sm"><Zap className="w-4 h-4 text-orange-600" /> Calorias ativas</div>
                <div className="flex items-center gap-2 text-sm"><Heart className="w-4 h-4 text-rose-600" /> FC min/média/máx</div>
                <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-emerald-600" /> Heart minutes e sono</div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                <Button size="lg" className="w-full sm:w-auto" onClick={() => {
                window.location.href = '/google-fit-oauth';
              }}>
                  Conectar Google Fit
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto" onClick={() => window.location.reload()}>
                  Já conectei, atualizar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Autorização única. Seus dados permanecem salvos com segurança no Supabase.</p>
            </div>

            <div className="p-6 md:p-10 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 flex items-center justify-center">
              <div className="w-full max-w-sm space-y-4">
                <div className="rounded-2xl border bg-white/70 dark:bg-zinc-900/50 backdrop-blur p-5 shadow">
                  <div className="text-sm text-muted-foreground mb-2">Prévia do painel</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Passos (hoje)</div>
                      <div className="text-xl font-bold">—</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Calorias ativas</div>
                      <div className="text-xl font-bold">—</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Minutos ativos</div>
                      <div className="text-xl font-bold">—</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-xs text-muted-foreground">Sono</div>
                      <div className="text-xl font-bold">—</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>;
  }
  if (error) {
    return <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">Erro ao carregar dados: {error}</p>
        <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
      </div>;
  }
  return <motion.div initial="hidden" animate="visible" variants={cardVariants} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Meu Progresso</h1>
        </div>
        <div className="flex items-center gap-3">
          {fmtLastSync && <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" /> Última sincronização: {fmtLastSync}
            </div>}
          <Button variant="outline" size="sm" onClick={async () => {
          try {
            await syncData();
          } catch (e) {
            console.error(e);
          }
        }} className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Sincronizar
          </Button>
          <Button variant="default" size="sm" onClick={() => setGoalsOpen(true)} className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Definir metas
          </Button>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-700 dark:text-green-400 font-medium">
              {isConnected ? 'Google Fit Conectado' : 'Google Fit Desconectado'}
            </span>
          </div>
        </div>
      </div>

      {/* Período */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Período:</span>
        <ToggleGroup type="single" value={period} onValueChange={(value: Period) => setPeriod(value)} className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          <ToggleGroupItem value="day" className="data-[state=on]:bg-white dark:data-[state=on]:bg-gray-700 data-[state=on]:text-gray-900 dark:data-[state=on]:text-white">Dia</ToggleGroupItem>
          <ToggleGroupItem value="week" className="data-[state=on]:bg-white dark:data-[state=on]:bg-gray-700 data-[state=on]:text-gray-900 dark:data-[state=on]:text-white">Semana</ToggleGroupItem>
          <ToggleGroupItem value="month" className="data-[state=on]:bg-white dark:data-[state=on]:bg-gray-700 data-[state=on]:text-gray-900 dark:data-[state=on]:text-white">Mês</ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* Cards KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Passos</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredData.length ? currentStats.totalSteps.toLocaleString() : '—'}</div>
              {comparisonStats && filteredData.length > 0 && <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className={`mr-1 h-3 w-3 ${currentStats.totalSteps - comparisonStats.totalSteps >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  {Math.round((currentStats.totalSteps - comparisonStats.totalSteps) / Math.max(1, comparisonStats.totalSteps) * 100)}% vs {period === 'day' ? 'ontem' : period === 'week' ? 'semana passada' : 'mês passado'}
                </div>}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calorias Ativas</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredData.length ? currentStats.totalCalories.toLocaleString() : '—'}</div>
              {comparisonStats && filteredData.length > 0 && <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className={`mr-1 h-3 w-3 ${currentStats.totalCalories - comparisonStats.totalCalories >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                  {Math.round((currentStats.totalCalories - comparisonStats.totalCalories) / Math.max(1, comparisonStats.totalCalories) * 100)}% vs {period === 'day' ? 'ontem' : 'semana passada'}
                </div>}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distância</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredData.length ? `${currentStats.totalDistance.toFixed(1)} km` : '—'}</div>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={cardVariants}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Freq. Cardíaca média</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredData.length ? `${currentStats.avgHeartRate} bpm` : '—'}</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Gráficos baseados no período */}
      <GoogleFitCharts chartData={filteredData as any} cardVariants={cardVariants} period={period} comparisonData={comparisonData as any} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal
    }} />

      <AdvancedGoogleFitMetrics data={filteredData as any} period={period} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal,
      heartRateGoal: 80,
      weightGoal: 70
    }} />

      {/* DEBUG: Verificar se os dados estão chegando */}
      {(() => {
      console.log('DEBUG - filteredData:', filteredData);
      return null;
    })()}
      {(() => {
      console.log('DEBUG - period:', period);
      return null;
    })()}

      {/* DEBUG: Verificar se os componentes estão sendo renderizados */}
      

      {/* DEBUG: Log direto antes do HealthExecutiveSummary */}
      {(() => {
      console.log('MyProgress - ANTES do HealthExecutiveSummary');
      console.log('MyProgress - filteredData:', filteredData);
      console.log('MyProgress - period:', period);
      return null;
    })()}

      {/* Resumo Executivo de Saúde - Componente Premium */}
      <HealthExecutiveSummary data={filteredData as any} period={period} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal,
      heartRateGoal: 80,
      weightGoal: 70
    }} />

      {/* Análise Médica Profissional */}
      <MedicalHealthAnalysis data={filteredData as any} period={period} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal,
      heartRateGoal: 80,
      weightGoal: 70
    }} />

      {/* DEBUG: Log após MedicalHealthAnalysis */}
      {(() => {
      console.log('MyProgress - APÓS MedicalHealthAnalysis');
      return null;
    })()}

      <GoogleFitInsights data={filteredData as any} period={period} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal,
      heartRateGoal: 80,
      weightGoal: 70
    }} />

      <AdvancedGoogleFitCharts data={filteredData as any} cardVariants={cardVariants} period={period} comparisonData={comparisonData as any} userGoals={{
      stepsGoal,
      sleepGoal,
      activeMinutesGoal,
      caloriesGoal
    }} />

      {/* Overview com integração dos dados da balança */}
      <OverviewWithGoogleFit score={currentScore} currentWeight={75.8} weightTrend={-2.3} bmi={24.2} bodyFat={{
      value: 18.5,
      trend: -1.2
    }} muscleMass={{
      value: 58.2,
      trend: 0.8
    }} measurementDays={Math.max(filteredData.length, 0)} weeklyFitStats={{
      totalSteps: currentStats.totalSteps,
      totalDistance: currentStats.totalDistance * 1000,
      totalCalories: currentStats.totalCalories,
      avgHeartRate: currentStats.avgHeartRate,
      totalActiveMinutes: currentStats.totalActiveMinutes,
      avgSleepHours: currentStats.avgSleepHours
    }} isGoogleFitConnected={isConnected} getScoreGradient={(score: number) => score >= 80 ? 'from-green-400 to-green-600' : score >= 60 ? 'from-yellow-400 to-yellow-600' : score >= 40 ? 'from-orange-400 to-orange-600' : 'from-red-400 to-red-600'} cardVariants={cardVariants} scoreVariants={{
      hidden: {
        scale: 0.8,
        opacity: 0
      },
      visible: {
        scale: 1,
        opacity: 1,
        transition: {
          duration: 0.5,
          ease: 'easeOut'
        }
      }
    }} />

      {/* Dialog: Definir Metas Individuais */}
      <Dialog open={goalsOpen} onOpenChange={setGoalsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Definir metas</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label>Passos por dia</Label>
              <Input type="number" value={stepsGoal} onChange={e => setStepsGoal(parseInt(e.target.value || '0'))} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Sono (horas/dia)</Label>
              <Input type="number" step="0.5" value={sleepGoal} onChange={e => setSleepGoal(parseFloat(e.target.value || '0'))} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Minutos ativos (dia)</Label>
              <Input type="number" value={activeMinutesGoal} onChange={e => setActiveMinutesGoal(parseInt(e.target.value || '0'))} min={0} />
            </div>
            <div className="space-y-2">
              <Label>Calorias Ativas (dia)</Label>
              <Input type="number" value={caloriesGoal} onChange={e => setCaloriesGoal(parseInt(e.target.value || '0'))} min={0} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={saveGoals}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>;
};
export default MyProgress;