
import React from 'react';
import RankingCommunity from './RankingCommunity';
import { User } from '@supabase/supabase-js';

interface RankingPageProps {
  user: User | null;
}

export default function RankingPage({ user }: RankingPageProps) {
  return <RankingCommunity user={user} />;
}
