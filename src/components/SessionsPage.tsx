
import React from 'react';
import { User } from '@supabase/supabase-js';
import UserSessions from '@/components/UserSessions';
import { QuickSessionAssigner } from '@/components/QuickSessionAssigner';

interface SessionsPageProps {
  user: User | null;
}

export default function SessionsPage({ user }: SessionsPageProps) {
  return (
    <div className="space-y-6">
      {/* Componente temporário para atribuir sessões */}
      <QuickSessionAssigner />
      <UserSessions user={user} />
    </div>
  );
}
