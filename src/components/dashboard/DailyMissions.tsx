import React from 'react';
import { User } from '@supabase/supabase-js';
import { DailyMissionsNew } from '@/components/daily-missions/DailyMissionsNew';
import { DailyMissionsFinal } from '@/components/daily-missions/DailyMissionsFinal';

interface DailyMissionsProps {
  user: User | null;
}

const DailyMissions = ({ user }: DailyMissionsProps) => {
  // Usar a versão final como principal
  return <DailyMissionsFinal user={user} />;
};

export default DailyMissions;