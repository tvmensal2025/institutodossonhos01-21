import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface GoogleFitData {
  // Dados básicos de atividade
  steps: number;
  caloriesActive: number;
  caloriesTotal: number;
  distance: number;
  
  // Dados cardiovasculares
  heartRateAvg: number;
  heartRateMin?: number;
  heartRateMax?: number;
  heartMinutes?: number;
  restingHeartRate?: number;
  
  // Dados de sono
  sleepDuration?: number;
  sleepEfficiency?: number;
  sleepStages?: {
    light: number;
    deep: number;
    rem: number;
    awake: number;
  };
  
  // Dados antropométricos
  weight?: number;
  height?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  
  // Dados de exercício
  activeMinutes?: number;
  exerciseMinutes?: number;
  workoutSessions?: number;
  exerciseCalories?: number;
  
  // Dados de hidratação e nutrição
  hydration?: number;
  waterIntake?: number;
  nutritionCalories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  
  // Dados de oxigenação
  oxygenSaturation?: number;
  respiratoryRate?: number;
  
  // Dados de localização e ambiente
  location?: string;
  weather?: string;
  temperature?: number;
  
  // Dados de dispositivos
  deviceType?: string;
  dataSource?: string;
}

// Estrutura diária expandida para gravar dados completos
interface DailyFitData {
  date: string; // YYYY-MM-DD (local America/Sao_Paulo)
  
  // Dados básicos
  steps: number;
  caloriesActive: number;
  caloriesTotal: number;
  distance: number;
  
  // Dados cardiovasculares
  heartRateAvg: number;
  heartRateMin?: number;
  heartRateMax?: number;
  heartMinutes?: number;
  restingHeartRate?: number;
  
  // Dados de sono
  sleepDuration?: number;
  sleepEfficiency?: number;
  sleepStages?: {
    light: number;
    deep: number;
    rem: number;
    awake: number;
  };
  
  // Dados antropométricos
  weight?: number;
  height?: number;
  bmi?: number;
  bodyFat?: number;
  muscleMass?: number;
  
  // Dados de exercício
  activeMinutes?: number;
  exerciseMinutes?: number;
  workoutSessions?: number;
  exerciseCalories?: number;
  
  // Dados de hidratação e nutrição
  hydration?: number;
  waterIntake?: number;
  nutritionCalories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  
  // Dados de oxigenação
  oxygenSaturation?: number;
  respiratoryRate?: number;
  
  // Dados de localização e ambiente
  location?: string;
  weather?: string;
  temperature?: number;
  
  // Dados de dispositivos
  deviceType?: string;
  dataSource?: string;
  
  // Metadados
  syncTimestamp: string;
  dataQuality: number; // 0-100, baseado na quantidade de dados disponíveis
}

const TIMEZONE_ID = 'America/Sao_Paulo';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabaseClient.auth.getUser(token);
    if (!user.user) throw new Error('Unauthorized');

    const { access_token, refresh_token, date_range } = await req.json();

    const dailyData = await fetchGoogleFitDaily(access_token, date_range);

    for (const d of dailyData) {
      const googleFitRecord: any = {
        user_id: user.user.id,
        date: d.date,
        
        // Dados básicos
        steps: d.steps,
        calories: Math.max(0, Math.round(d.caloriesActive || 0)),
        distance_meters: Math.round(d.distance || 0),
        
        // Dados cardiovasculares
        heart_rate_avg: Math.round(d.heartRateAvg || 0),
        heart_rate_min: d.heartRateMin ?? 0,
        heart_rate_max: d.heartRateMax ?? 0,
        heart_rate_resting: d.restingHeartRate ?? null,
        active_minutes: Math.round(d.heartMinutes || 0),
        
        // Dados de sono
        sleep_hours: d.sleepDuration || 0,
        sleep_efficiency: d.sleepEfficiency ?? null,
        sleep_stages: d.sleepStages ? JSON.stringify(d.sleepStages) : null,
        
        // Dados antropométricos
        weight_kg: d.weight ?? null,
        height_cm: d.height ? Math.round(d.height * 100) : null,
        bmi: d.bmi ?? null,
        body_fat_percentage: d.bodyFat ?? null,
        muscle_mass_kg: d.muscleMass ?? null,
        
        // Dados de exercício
        exercise_minutes: d.exerciseMinutes || 0,
        workout_sessions: d.workoutSessions || 0,
        exercise_calories: d.exerciseCalories || 0,
        
        // Dados de hidratação
        hydration_ml: d.hydration || 0,
        water_intake_ml: d.waterIntake || 0,
        
        // Dados de nutrição
        nutrition_calories: d.nutritionCalories || 0,
        protein_g: d.protein ?? null,
        carbs_g: d.carbs ?? null,
        fat_g: d.fat ?? null,
        
        // Dados de oxigenação
        oxygen_saturation: d.oxygenSaturation ?? null,
        respiratory_rate: d.respiratoryRate ?? null,
        
        // Dados de ambiente
        location: d.location ?? null,
        weather: d.weather ?? null,
        temperature_celsius: d.temperature ?? null,
        
        // Dados de dispositivos
        device_type: d.deviceType ?? null,
        data_source: d.dataSource ?? null,
        
        // Metadados
        sync_timestamp: new Date().toISOString(),
        data_quality: d.dataQuality || 0,
        
        // Dados brutos para análise futura
        raw_data: JSON.stringify(d)
      };

      await supabaseClient.from('google_fit_data').upsert(googleFitRecord, { onConflict: 'user_id,date' });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        days: dailyData.length,
        dataTypes: Object.keys(dailyData[0] || {}).length,
        message: 'Dados completos do Google Fit sincronizados com sucesso'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na sincronização do Google Fit:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message, success: false }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function toLocalDateString(ms: number, timeZone = TIMEZONE_ID): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' });
  const [{ value: y }, , { value: m }, , { value: d }] = fmt.formatToParts(new Date(ms));
  return `${y}-${m}-${d}`;
}

async function fetchGoogleFitDaily(accessToken: string, dateRange: { startDate: string, endDate: string }): Promise<DailyFitData[]> {
  const baseUrl = 'https://www.googleapis.com/fitness/v1/users/me';
  const headers = { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' };

  // Construir janelas em milissegundos a partir de datas locais
  const startLocal = new Date(`${dateRange.startDate}T00:00:00`);
  const endLocal = new Date(`${dateRange.endDate}T23:59:59`);
  const startTimeMillis = startLocal.getTime();
  const endTimeMillis = endLocal.getTime();

  const fetchAggregate = async (dataTypeName: string, dataSourceId?: string, bucket: any = { period: { type: 'day', value: 1, timeZoneId: TIMEZONE_ID } }) => {
    const body: any = {
      aggregateBy: [{ dataTypeName, ...(dataSourceId && { dataSourceId }) }],
      bucketByTime: bucket,
      startTimeMillis,
      endTimeMillis,
    };
    const resp = await fetch(`${baseUrl}/dataset:aggregate`, { method: 'POST', headers, body: JSON.stringify(body) });
    return resp.json();
  };

  try {
    // Capturar TODOS os tipos de dados disponíveis
    const [
      stepsData,
      caloriesExpendedData,
      distanceData,
      heartRateData,
      heartMinutesData,
      weightData,
      heightData,
      sleepData,
      bmrData,
      // Novos tipos de dados
      bodyFatData,
      muscleMassData,
      exerciseData,
      workoutData,
      hydrationData,
      waterIntakeData,
      nutritionData,
      oxygenData,
      respiratoryData,
      locationData,
      weatherData,
      temperatureData,
      deviceData,
      // Dados de sono detalhados
      sleepStagesData,
      sleepEfficiencyData
    ] = await Promise.all([
      fetchAggregate('com.google.step_count.delta', 'derived:com.google.step_count.delta:com.google.android.gms:estimated_steps'),
      fetchAggregate('com.google.calories.expended', 'derived:com.google.calories.expended:com.google.android.gms:merge_calories_expended'),
      fetchAggregate('com.google.distance.delta', 'derived:com.google.distance.delta:com.google.android.gms:merge_distance_delta'),
      fetchAggregate('com.google.heart_rate.bpm', 'derived:com.google.heart_rate.bpm:com.google.android.gms:merge_heart_rate_bpm'),
      fetchAggregate('com.google.heart_minutes', 'derived:com.google.heart_minutes:com.google.android.gms:merge_heart_minutes'),
      fetchAggregate('com.google.weight'),
      fetchAggregate('com.google.height'),
      fetchAggregate('com.google.sleep.segment'),
      fetchAggregate('com.google.basal_metabolic_rate'),
      // Novos tipos
      fetchAggregate('com.google.body.fat.percentage'),
      fetchAggregate('com.google.muscle.mass'),
      fetchAggregate('com.google.activity.exercise'),
      fetchAggregate('com.google.workout.session'),
      fetchAggregate('com.google.hydration'),
      fetchAggregate('com.google.water.intake'),
      fetchAggregate('com.google.nutrition'),
      fetchAggregate('com.google.oxygen_saturation'),
      fetchAggregate('com.google.respiratory_rate'),
      fetchAggregate('com.google.location.sample'),
      fetchAggregate('com.google.weather'),
      fetchAggregate('com.google.temperature'),
      fetchAggregate('com.google.device'),
      // Sono detalhado
      fetchAggregate('com.google.sleep.stage'),
      fetchAggregate('com.google.sleep.efficiency')
    ]);

    const buckets = Math.max(
      stepsData.bucket?.length || 0,
      caloriesExpendedData.bucket?.length || 0,
      distanceData.bucket?.length || 0,
      heartRateData.bucket?.length || 0,
      heartMinutesData.bucket?.length || 0,
      sleepData.bucket?.length || 0,
      weightData.bucket?.length || 0,
      heightData.bucket?.length || 0,
      bmrData.bucket?.length || 0,
      bodyFatData.bucket?.length || 0,
      muscleMassData.bucket?.length || 0,
      exerciseData.bucket?.length || 0,
      workoutData.bucket?.length || 0,
      hydrationData.bucket?.length || 0,
      waterIntakeData.bucket?.length || 0,
      nutritionData.bucket?.length || 0,
      oxygenData.bucket?.length || 0,
      respiratoryData.bucket?.length || 0
    );

    const days: DailyFitData[] = [];

    for (let i = 0; i < buckets; i++) {
      const startMs = parseInt(
        stepsData.bucket?.[i]?.startTimeMillis ||
        caloriesExpendedData.bucket?.[i]?.startTimeMillis ||
        distanceData.bucket?.[i]?.startTimeMillis ||
        heartRateData.bucket?.[i]?.startTimeMillis ||
        heartMinutesData.bucket?.[i]?.startTimeMillis ||
        sleepData.bucket?.[i]?.startTimeMillis ||
        `${Date.now()}`
      );
      const localDate = toLocalDateString(startMs, TIMEZONE_ID);

      const getPoints = (data: any) => data.bucket?.[i]?.dataset?.[0]?.point || [];

      // Dados básicos
      const steps = getPoints(stepsData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.intVal || 0), 0);
      const caloriesTotal = getPoints(caloriesExpendedData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);
      
      // BMR diário
      let basalKcal = 0;
      const bmrPts = getPoints(bmrData);
      if (bmrPts.length) {
        const avgBmr = bmrPts.reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0) / bmrPts.length;
        basalKcal = isFinite(avgBmr) ? avgBmr : 0;
      }
      const caloriesActive = Math.max(0, caloriesTotal - basalKcal);

      const distance = getPoints(distanceData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);

      // Dados cardiovasculares
      const hrPts = getPoints(heartRateData).map((p: any) => p.value?.[0]?.fpVal || 0).filter((v: number) => v > 0);
      const heartRateAvg = hrPts.length ? Math.round(hrPts.reduce((a: number, b: number) => a + b, 0) / hrPts.length) : 0;
      const heartRateMin = hrPts.length ? Math.min(...hrPts) : undefined;
      const heartRateMax = hrPts.length ? Math.max(...hrPts) : undefined;
      const heartMinutes = getPoints(heartMinutesData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);

      // Dados antropométricos
      const wPts = getPoints(weightData);
      const hPts = getPoints(heightData);
      const weight = wPts.length ? wPts[wPts.length - 1]?.value?.[0]?.fpVal : undefined;
      const height = hPts.length ? hPts[hPts.length - 1]?.value?.[0]?.fpVal : undefined;
      
      // Calcular BMI se peso e altura estiverem disponíveis
      let bmi = undefined;
      if (weight && height) {
        bmi = Math.round((weight / (height * height)) * 100) / 100;
      }
      
      const bodyFat = getPoints(bodyFatData).length ? getPoints(bodyFatData)[getPoints(bodyFatData).length - 1]?.value?.[0]?.fpVal : undefined;
      const muscleMass = getPoints(muscleMassData).length ? getPoints(muscleMassData)[getPoints(muscleMassData).length - 1]?.value?.[0]?.fpVal : undefined;

      // Dados de sono
      let sleepDuration = 0;
      const sPts = getPoints(sleepData);
      for (const p of sPts) {
        const start = p.startTimeNanos ? parseInt(p.startTimeNanos) / 1_000_000 : 0;
        const end = p.endTimeNanos ? parseInt(p.endTimeNanos) / 1_000_000 : 0;
        sleepDuration += Math.max(0, end - start);
      }
      sleepDuration = Math.round(sleepDuration / (1000 * 60 * 60));

      // Dados de sono detalhados
      const sleepStages = getPoints(sleepStagesData).length ? {
        light: getPoints(sleepStagesData).filter((p: any) => p.value?.[0]?.intVal === 1).length,
        deep: getPoints(sleepStagesData).filter((p: any) => p.value?.[0]?.intVal === 2).length,
        rem: getPoints(sleepStagesData).filter((p: any) => p.value?.[0]?.intVal === 3).length,
        awake: getPoints(sleepStagesData).filter((p: any) => p.value?.[0]?.intVal === 4).length
      } : undefined;

      const sleepEfficiency = getPoints(sleepEfficiencyData).length ? 
        getPoints(sleepEfficiencyData)[getPoints(sleepEfficiencyData).length - 1]?.value?.[0]?.fpVal : undefined;

      // Dados de exercício
      const exerciseMinutes = getPoints(exerciseData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);
      const workoutSessions = getPoints(workoutData).length;
      const exerciseCalories = getPoints(exerciseData).reduce((sum: number, p: any) => sum + (p.value?.[1]?.fpVal || 0), 0);

      // Dados de hidratação
      const hydration = getPoints(hydrationData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);
      const waterIntake = getPoints(waterIntakeData).reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);

      // Dados de nutrição
      const nutritionPts = getPoints(nutritionData);
      const nutritionCalories = nutritionPts.reduce((sum: number, p: any) => sum + (p.value?.[0]?.fpVal || 0), 0);
      const protein = nutritionPts.reduce((sum: number, p: any) => sum + (p.value?.[1]?.fpVal || 0), 0);
      const carbs = nutritionPts.reduce((sum: number, p: any) => sum + (p.value?.[2]?.fpVal || 0), 0);
      const fat = nutritionPts.reduce((sum: number, p: any) => sum + (p.value?.[3]?.fpVal || 0), 0);

      // Dados de oxigenação
      const oxygenSaturation = getPoints(oxygenData).length ? 
        getPoints(oxygenData)[getPoints(oxygenData).length - 1]?.value?.[0]?.fpVal : undefined;
      const respiratoryRate = getPoints(respiratoryData).length ? 
        getPoints(respiratoryData)[getPoints(respiratoryData).length - 1]?.value?.[0]?.fpVal : undefined;

      // Dados de ambiente
      const location = getPoints(locationData).length ? 
        getPoints(locationData)[getPoints(locationData).length - 1]?.value?.[0]?.stringVal : undefined;
      const weather = getPoints(weatherData).length ? 
        getPoints(weatherData)[getPoints(weatherData).length - 1]?.value?.[0]?.stringVal : undefined;
      const temperature = getPoints(temperatureData).length ? 
        getPoints(temperatureData)[getPoints(temperatureData).length - 1]?.value?.[0]?.fpVal : undefined;

      // Dados de dispositivos
      const deviceType = getPoints(deviceData).length ? 
        getPoints(deviceData)[getPoints(deviceData).length - 1]?.value?.[0]?.stringVal : undefined;
      const dataSource = getPoints(deviceData).length ? 
        getPoints(deviceData)[getPoints(deviceData).length - 1]?.value?.[1]?.stringVal : undefined;

      // Calcular qualidade dos dados (0-100)
      const availableDataPoints = [
        steps, caloriesTotal, distance, heartRateAvg, heartMinutes, 
        weight, height, sleepDuration, bodyFat, muscleMass,
        exerciseMinutes, hydration, waterIntake, nutritionCalories
      ].filter(v => v !== undefined && v > 0).length;
      
      const dataQuality = Math.round((availableDataPoints / 14) * 100);

      days.push({
        date: localDate,
        steps,
        caloriesActive,
        caloriesTotal,
        distance,
        heartRateAvg,
        heartRateMin,
        heartRateMax,
        heartMinutes,
        weight,
        height,
        bmi,
        bodyFat,
        muscleMass,
        sleepDuration,
        sleepEfficiency,
        sleepStages,
        exerciseMinutes,
        workoutSessions,
        exerciseCalories,
        hydration,
        waterIntake,
        nutritionCalories,
        protein,
        carbs,
        fat,
        oxygenSaturation,
        respiratoryRate,
        location,
        weather,
        temperature,
        deviceType,
        dataSource,
        syncTimestamp: new Date().toISOString(),
        dataQuality
      });
    }

    return days;
  } catch (e) {
    console.error('Erro ao agregar dados completos do Google Fit:', e);
    return [];
  }
}