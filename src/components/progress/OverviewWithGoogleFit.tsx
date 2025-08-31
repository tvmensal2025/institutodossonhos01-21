import React from 'react';
import { Card } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { motion } from 'framer-motion';
import { 
  Footprints, 
  Heart, 
  Flame, 
  Clock, 
  Moon, 
  Activity,
  Target,
  TrendingUp,
  Zap,
  Scale
} from 'lucide-react';

interface GoogleFitStats {
  totalSteps: number;
  totalDistance: number; // metros
  totalCalories: number;
  avgHeartRate: number;
  totalActiveMinutes: number;
  avgSleepHours: number; // alinhado com currentStats
}

interface OverviewWithGoogleFitProps {
  score: number;
  currentWeight?: number;
  weightTrend?: number;
  bmi?: number;
  bodyFat?: { value: number; trend: number };
  muscleMass?: { value: number; trend: number };
  measurementDays: number;
  weeklyFitStats?: GoogleFitStats;
  isGoogleFitConnected: boolean;
  getScoreGradient: (score: number) => string;
  cardVariants: any;
  scoreVariants: any;
}

export const OverviewWithGoogleFit: React.FC<OverviewWithGoogleFitProps> = ({
  score,
  currentWeight,
  weightTrend,
  bmi,
  bodyFat,
  muscleMass,
  measurementDays,
  weeklyFitStats,
  isGoogleFitConnected,
  getScoreGradient,
  cardVariants,
  scoreVariants
}) => {
  // Determinar quais métricas mostrar
  const hasWeightData = currentWeight !== undefined && currentWeight !== null;
  const hasBmiData = bmi !== undefined && bmi !== null;
  const hasBodyFatData = bodyFat?.value !== undefined && bodyFat.value !== null;
  const hasMuscleData = muscleMass?.value !== undefined && muscleMass.value !== null;
  const hasGoogleFitData = isGoogleFitConnected && weeklyFitStats;

  return (
    <div className="space-y-6">
      {/* Score de Evolução */}
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="col-span-full"
      >
        <Card className={`p-6 bg-gradient-to-r ${getScoreGradient(score)} text-white`}>
          <motion.div
            variants={scoreVariants}
            className="text-center"
          >
            <h3 className="text-2xl font-bold mb-2">Score de Evolução</h3>
            <div className="text-6xl font-bold mb-4">{score}%</div>
            <Progress value={score} className="mt-4 bg-white/20" />
            <div className="mt-4 flex justify-center gap-2">
              {score >= 80 && <Zap className="h-5 w-5 text-yellow-300" />}
              {score >= 60 && <Target className="h-5 w-5 text-yellow-300" />}
              {score >= 40 && <TrendingUp className="h-5 w-5 text-white" />}
            </div>
            {isGoogleFitConnected && (
              <Badge className="mt-2 bg-white/20 text-white">
                Google Fit Conectado
              </Badge>
            )}
          </motion.div>
        </Card>
      </motion.div>

      {/* Métricas Principais */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Métricas de Peso */}
        <MetricCard
          title="Peso Atual"
          value={currentWeight}
          trend={weightTrend}
          unit="kg"
          icon={Scale}
          cardVariants={cardVariants}
          available={hasWeightData}
        />

        <MetricCard
          title="IMC"
          value={bmi}
          trend={bmi ? bmi - 25 : undefined}
          reference="Meta: 25"
          icon={Target}
          cardVariants={cardVariants}
          available={hasBmiData}
        />

        <MetricCard
          title="Gordura Corporal"
          value={bodyFat?.value}
          trend={bodyFat?.trend}
          unit="%"
          icon={Activity}
          cardVariants={cardVariants}
          available={hasBodyFatData}
        />

        <MetricCard
          title="Massa Muscular"
          value={muscleMass?.value}
          trend={muscleMass?.trend}
          unit="kg"
          icon={TrendingUp}
          cardVariants={cardVariants}
          available={hasMuscleData}
        />
      </div>

      {/* Métricas do Google Fit */}
      {hasGoogleFitData && weeklyFitStats && (
        <>
          <div className="flex items-center gap-2 mt-8 mb-4">
            <Activity className="h-5 w-5 text-primary" />
            <h3 className="text-xl font-semibold">Atividade da Semana (Google Fit)</h3>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <GoogleFitMetricCard
              title="Passos"
              value={weeklyFitStats.totalSteps || 0}
              unit=""
              icon={Footprints}
              target={70000} // 10k passos x 7 dias
              cardVariants={cardVariants}
              color="text-blue-500"
            />

            <GoogleFitMetricCard
              title="Calorias"
              value={weeklyFitStats.totalCalories || 0}
              unit="kcal"
              icon={Flame}
              target={2100} // 300 kcal x 7 dias
              cardVariants={cardVariants}
              color="text-orange-500"
            />

            <GoogleFitMetricCard
              title="FC Média"
              value={weeklyFitStats.avgHeartRate || 0}
              unit="bpm"
              icon={Heart}
              target={80}
              cardVariants={cardVariants}
              color="text-red-500"
            />

            <GoogleFitMetricCard
              title="Minutos Ativos"
              value={weeklyFitStats.totalActiveMinutes || 0}
              unit="min"
              icon={Clock}
              target={150} // 150 min por semana
              cardVariants={cardVariants}
              color="text-green-500"
            />

            <GoogleFitMetricCard
              title="Distância"
              value={Math.round((weeklyFitStats.totalDistance || 0) / 1000)}
              unit="km"
              icon={TrendingUp}
              target={35} // 5km x 7 dias
              cardVariants={cardVariants}
              color="text-purple-500"
            />

            <GoogleFitMetricCard
              title="Sono Médio"
              value={weeklyFitStats.avgSleepHours || 0}
              unit="h"
              icon={Moon}
              target={8}
              cardVariants={cardVariants}
              color="text-indigo-500"
            />

            {/* Troquei 'Treinos' por Minutos Ativos acima para evitar undefined */}
          </div>
        </>
      )}

      {/* Mensagem se Google Fit não estiver conectado */}
      {!isGoogleFitConnected && (
        <motion.div variants={cardVariants} whileHover="hover">
          <Card className="p-6 border-dashed border-2 border-muted-foreground/30">
            <div className="text-center">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Conecte o Google Fit</h3>
              <p className="text-muted-foreground mb-4">
                Conecte-se ao Google Fit para ver suas métricas de atividade, passos, calorias e muito mais.
              </p>
              <Badge variant="outline">
                Dados de atividade disponíveis após conexão
              </Badge>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

// Componente de Métrica padrão
const MetricCard: React.FC<{
  title: string;
  value?: number;
  trend?: number;
  unit?: string;
  reference?: string;
  icon?: React.ComponentType<{ className?: string }>;
  cardVariants: any;
  available?: boolean;
}> = ({ title, value, trend, unit, reference, icon: Icon, cardVariants, available = true }) => {
  const getTrendColor = (trend?: number) => {
    if (trend === undefined || trend === null) return 'text-gray-500';
    return trend < 0 ? 'text-green-500' : 'text-red-500';
  };

  const getTrendIcon = (trend?: number) => {
    if (trend === undefined || trend === null) return null;
    return trend < 0 ? '↓' : '↑';
  };

  return (
    <motion.div variants={cardVariants} whileHover="hover">
      <Card className={`p-6 transition-all duration-300 hover:shadow-lg stat-card-responsive ${!available ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          {Icon && <Icon className="h-5 w-5 text-muted-foreground" />}
        </div>
        
        <div className="flex items-end gap-2 mb-2">
          <div className="stat-number-responsive">
            {typeof value === 'number' && !Number.isNaN(value) ? value.toFixed(1) : '--'}
            {unit && <span className="text-lg ml-1">{unit}</span>}
          </div>
          {trend !== undefined && trend !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`${getTrendColor(trend)} text-lg font-medium`}
            >
              {getTrendIcon(trend)} {Math.abs(trend).toFixed(1)}
            </motion.div>
          )}
        </div>
        
        {reference && (
          <p className="text-sm text-muted-foreground">{reference}</p>
        )}
      </Card>
    </motion.div>
  );
};

// Componente de Métrica do Google Fit
const GoogleFitMetricCard: React.FC<{
  title: string;
  value: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  target?: number;
  cardVariants: any;
  color?: string;
}> = ({ title, value, unit, icon: Icon, target, cardVariants, color = "text-primary" }) => {
  const progress = target ? Math.min(100, (value / target) * 100) : 0;
  
  const formatValue = (val: number | undefined | null): string => {
    if (typeof val !== 'number' || Number.isNaN(val)) return '0';
    if (val >= 1000) {
      return `${(val / 1000).toFixed(1)}k`;
    }
    return val.toFixed(0);
  };

  return (
    <motion.div variants={cardVariants} whileHover="hover">
      <Card className="p-6 transition-all duration-300 hover:shadow-lg stat-card-responsive">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{title}</h3>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        
        <div className="stat-number-responsive">
          {formatValue(value)}
          {unit && <span className="text-lg ml-1">{unit}</span>}
        </div>
        
        {typeof target === 'number' && !Number.isNaN(target) && (
          <>
            <Progress value={progress} className="mb-2" />
            <p className="text-sm text-muted-foreground">
              Meta: {formatValue(target)}{unit} ({progress.toFixed(0)}%)
            </p>
          </>
        )}
      </Card>
    </motion.div>
  );
};