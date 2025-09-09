'use client';

import dynamic from 'next/dynamic';

const LeaderboardPage = dynamic(() => import('@/presentation/components/Leaderboard/LeaderboardPage'), { ssr: false });

export default function Leaderboard() {
  return <LeaderboardPage />;
}