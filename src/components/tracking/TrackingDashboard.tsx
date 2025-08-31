import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Droplets, 
  Moon, 
  Heart, 
  TrendingUp, 
  Target,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useTrackingData } from '@/hooks/useTrackingData';
import { WaterTrackingWidget } from './WaterTrackingWidget';

export const TrackingDashboard = () => {
  const { 
    trackingData, 
    addSleep, 
    addMood, 
    isAddingSleep, 
    isAddingMood 
  } = useTrackingData();

  const [sleepForm, setSleepForm] = React.useState({
    hours: 8,
    quality: 3,
    notes: ''
  });

  const [moodForm, setMoodForm] = React.useState({
    energy: 3,
    stress: 3,
    rating: 7,
    gratitude: ''
  });

  if (!trackingData) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-20 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const handleSleepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSleep(sleepForm);
  };

  const handleMoodSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMood(moodForm);
  };

  return (
    <div className="space-y-6">
      {/* Cards de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Widget de Água */}
        <WaterTrackingWidget />

        {/* Card de Sono */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20" />
          
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
              <Moon className="w-5 h-5" />
              Sono
            </CardTitle>
          </CardHeader>

          <CardContent className="relative space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {trackingData.sleep.lastNight?.hours || 0}h
              </div>
              <p className="text-sm text-muted-foreground">última noite</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Qualidade</p>
                <div className="flex justify-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span 
                      key={star} 
                      className={`text-sm ${
                        star <= (trackingData.sleep.lastNight?.quality || 0) 
                          ? 'text-yellow-400' 
                          : 'text-gray-300'
                      }`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-muted-foreground">Média semanal</p>
                <p className="text-sm font-medium">
                  {trackingData.sleep.weeklyAverage.toFixed(1)}h
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card de Humor */}
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20" />
          
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <Heart className="w-5 h-5" />
              Humor
            </CardTitle>
          </CardHeader>

          <CardContent className="relative space-y-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {trackingData.mood.today?.day_rating || 0}/10
              </div>
              <p className="text-sm text-muted-foreground">avaliação do dia</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center text-xs">
              <div>
                <p className="text-muted-foreground">Energia</p>
                <div className="flex justify-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-2 h-3 rounded-sm ${
                        level <= (trackingData.mood.today?.energy_level || 0)
                          ? 'bg-green-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-muted-foreground">Estresse</p>
                <div className="flex justify-center gap-1 mt-1">
                  {[1, 2, 3, 4, 5].map((level) => (
                    <div
                      key={level}
                      className={`w-2 h-3 rounded-sm ${
                        level <= (trackingData.mood.today?.stress_level || 0)
                          ? 'bg-red-500'
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulários de Registro */}
      <Tabs defaultValue="sleep" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sleep" className="flex items-center gap-2">
            <Moon className="w-4 h-4" />
            Registrar Sono
          </TabsTrigger>
          <TabsTrigger value="mood" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            Registrar Humor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sleep">
          <Card>
            <CardHeader>
              <CardTitle>Como foi seu sono?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSleepSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="hours">Horas dormidas</Label>
                    <Input
                      id="hours"
                      type="number"
                      min="0"
                      max="24"
                      step="0.5"
                      value={sleepForm.hours}
                      onChange={(e) => setSleepForm(prev => ({ 
                        ...prev, 
                        hours: parseFloat(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="quality">Qualidade (1-5)</Label>
                    <Input
                      id="quality"
                      type="number"
                      min="1"
                      max="5"
                      value={sleepForm.quality}
                      onChange={(e) => setSleepForm(prev => ({ 
                        ...prev, 
                        quality: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações (opcional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Como se sente ao acordar? Sonhos, interrupções..."
                    value={sleepForm.notes}
                    onChange={(e) => setSleepForm(prev => ({ 
                      ...prev, 
                      notes: e.target.value 
                    }))}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isAddingSleep}
                  className="w-full"
                >
                  {isAddingSleep ? 'Salvando...' : 'Registrar Sono'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mood">
          <Card>
            <CardHeader>
              <CardTitle>Como está seu humor hoje?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleMoodSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="energy">Energia (1-5)</Label>
                    <Input
                      id="energy"
                      type="number"
                      min="1"
                      max="5"
                      value={moodForm.energy}
                      onChange={(e) => setMoodForm(prev => ({ 
                        ...prev, 
                        energy: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stress">Estresse (1-5)</Label>
                    <Input
                      id="stress"
                      type="number"
                      min="1"
                      max="5"
                      value={moodForm.stress}
                      onChange={(e) => setMoodForm(prev => ({ 
                        ...prev, 
                        stress: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="rating">Nota do dia (1-10)</Label>
                    <Input
                      id="rating"
                      type="number"
                      min="1"
                      max="10"
                      value={moodForm.rating}
                      onChange={(e) => setMoodForm(prev => ({ 
                        ...prev, 
                        rating: parseInt(e.target.value) 
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="gratitude">Gratidão do dia (opcional)</Label>
                  <Textarea
                    id="gratitude"
                    placeholder="Pelo que você é grato hoje?"
                    value={moodForm.gratitude}
                    onChange={(e) => setMoodForm(prev => ({ 
                      ...prev, 
                      gratitude: e.target.value 
                    }))}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isAddingMood}
                  className="w-full"
                >
                  {isAddingMood ? 'Salvando...' : 'Registrar Humor'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};