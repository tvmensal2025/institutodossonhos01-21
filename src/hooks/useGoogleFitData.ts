// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../integrations/supabase/client';

interface GoogleFitData {
  id: string;
  user_id: string;
  date: string;
  steps?: number;
  distance_meters?: number;
  calories?: number; // ativas
  active_minutes?: number;  // heart minutes
  heart_rate_avg?: number;
  heart_rate_max?: number;
  heart_rate_min?: number;
  sleep_hours?: number;
  raw_data?: any;
  sync_timestamp: string;
  created_at: string;
}

export type Period = 'day' | 'week' | 'month';

function getLocalDateString(d: Date, tz = 'America/Sao_Paulo') {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
  const [{ value: y }, , { value: m }, , { value: dd }] = fmt.formatToParts(d);
  return `${y}-${m}-${dd}`;
}

function getPeriodRange(period: Period, tz = 'America/Sao_Paulo') {
  const now = new Date();
  const todayStr = getLocalDateString(now, tz);
  if (period === 'day') {
    return { start: todayStr, end: todayStr };
  }
  if (period === 'week') {
    const dow = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short' }).format(now);
    // Calcular segunda-feira da semana corrente
    const jsDay = now.getDay(); // 0 dom ... 6 sáb
    const delta = (jsDay + 6) % 7; // dias desde segunda
    const start = new Date(now);
    start.setDate(now.getDate() - delta);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return { start: getLocalDateString(start, tz), end: getLocalDateString(end, tz) };
  }
  // month
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: getLocalDateString(start, tz), end: getLocalDateString(end, tz) };
}

export function useGoogleFitData() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GoogleFitData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const fetchGoogleFitData = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: tokenRow }: any = await (supabase as any)
        .from('google_fit_tokens')
        .select('access_token, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!tokenRow) {
        setData([]);
        setIsConnected(false);
        setError('Conecte o Google Fit para ver seus dados reais');
        setLastSync(null);
        return;
      }

      const { data: fitData, error: dbError } = await supabase
        .from('google_fit_data')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', getLocalDateString(new Date(Date.now() - 31 * 24 * 60 * 60 * 1000)))
        .order('date', { ascending: true });

      if (dbError) throw dbError;

      setData(fitData || []);
      setIsConnected(true);
      const last = (fitData || []).reduce<string | null>((acc, row) => {
        if (!row.sync_timestamp) return acc;
        if (!acc) return row.sync_timestamp;
        return new Date(row.sync_timestamp) > new Date(acc) ? row.sync_timestamp : acc;
      }, null);
      setLastSync(last);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados');
      setData([]);
      setIsConnected(false);
      setLastSync(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGoogleFitData(); }, []);

  const calculateStats = (rows: GoogleFitData[]) => {
    if (!rows.length) {
      return {
        totalSteps: 0,
        totalDistance: 0,
        totalCalories: 0,
        avgHeartRate: 0,
        totalActiveMinutes: 0,
        avgSleepHours: 0,
      };
    }
    const totalSteps = rows.reduce((s, d) => s + (d.steps || 0), 0);
    const totalDistance = Math.round((rows.reduce((s, d) => s + (d.distance_meters || 0), 0) / 1000) * 10) / 10;
    const totalCalories = rows.reduce((s, d) => s + (d.calories || 0), 0);
    const hrVals = rows.map(r => r.heart_rate_avg || 0).filter(v => v > 0);
    const avgHeartRate = hrVals.length ? Math.round(hrVals.reduce((a, b) => a + b, 0) / hrVals.length) : 0;
    const totalActiveMinutes = rows.reduce((s, d) => s + (d.active_minutes || 0), 0);
    const avgSleepHours = rows.length ? Math.round((rows.reduce((s, d) => s + (d.sleep_hours || 0), 0) / rows.length) * 10) / 10 : 0;
    return { totalSteps, totalDistance, totalCalories, avgHeartRate, totalActiveMinutes, avgSleepHours };
  };

  // Metas (fallback localStorage até integrarmos tabela user_goals)
  function getLocalGoals() {
    try {
      const raw = localStorage.getItem('user_goals');
      if (!raw) return { steps: 10000, calories: 500, activeMinutes: 30, sleep: 8 };
      const g = JSON.parse(raw);
      return {
        steps: Number(g.stepsGoal ?? 10000),
        calories: Number(g.caloriesGoal ?? 500),
        activeMinutes: Number(g.activeMinutesGoal ?? 30),
        sleep: Number(g.sleepGoal ?? 8),
      };
    } catch { return { steps: 10000, calories: 500, activeMinutes: 30, sleep: 8 }; }
  }

  function computeScoreForPeriod(rows: GoogleFitData[]) {
    if (!rows.length) return 0;
    const goals = getLocalGoals();
    const days = rows.length;
    const stepsDays = rows.filter(r => (r.steps || 0) >= goals.steps).length;
    const caloriesDays = rows.filter(r => (r.calories || 0) >= goals.calories).length;
    const activeDays = rows.filter(r => (r.active_minutes || 0) >= goals.activeMinutes).length;
    const sleepDays = rows.filter(r => (r.sleep_hours || 0) >= goals.sleep).length;
    const pctSteps = (stepsDays / days) * 100;
    const pctCalories = (caloriesDays / days) * 100;
    const pctActive = (activeDays / days) * 100;
    const pctSleep = (sleepDays / days) * 100;
    return Math.round((pctSteps + pctCalories + pctActive + pctSleep) / 4);
  }

  return {
    data,
    loading,
    error,
    isConnected,
    lastSync,
    calculateStats,
    getPeriodRange,
    refetch: fetchGoogleFitData,
    async checkConnection() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return false;
        const { data: tokenData }: any = await (supabase as any)
          .from('google_fit_tokens')
          .select('expires_at')
          .eq('user_id', user.id)
          .maybeSingle();
        if (!tokenData) return false;
        return new Date(tokenData.expires_at) > new Date();
      } catch { return false; }
    },
    async syncData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const { data: tokenData }: any = await (supabase as any)
        .from('google_fit_tokens')
        .select('access_token, refresh_token, expires_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (!tokenData) throw new Error('Token do Google Fit não encontrado. Conecte novamente.');
      if (new Date(tokenData.expires_at) < new Date()) throw new Error('Token expirado. Conecte novamente ao Google Fit.');

      const end = getLocalDateString(new Date());
      const start = getLocalDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
      const { data: syncResult, error: syncError } = await supabase.functions.invoke('google-fit-sync', {
        body: { access_token: tokenData.access_token, refresh_token: tokenData.refresh_token, date_range: { startDate: start, endDate: end } }
      });
      if (syncError) throw syncError;
      await fetchGoogleFitData();
      return syncResult;
    },
    // score dinâmico utilitário (para período filtrado no componente)
    computeScoreForPeriod,
  };
}